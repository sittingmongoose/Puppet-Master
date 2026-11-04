#!/usr/bin/env python3
"""Static FileManager event contract oracles. No filesystem/native execution proof."""
import copy
import base64
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import jsonschema
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_BASE = "https://puppetmaster.local/schemas/"


def schema_registry():
    registry = Registry()
    paths = ["filemanager_operation_contracts.schema.json", "event_record.schema.json",
             "event_append_receipt_contracts.schema.json"]
    paths += [str(p.relative_to(ROOT / "Plans")) for p in
              sorted((ROOT / "Plans/event_payloads/file_manager").glob("*.schema.json"))]
    for path in paths:
        schema = json.loads((ROOT / "Plans" / path).read_text())
        resource = Resource.from_contents(schema)
        registry = registry.with_resource(SCHEMA_BASE + path, resource)
        registry = registry.with_resource(schema["$id"], resource)
    return registry


SCHEMAS = schema_registry()


def validate_shape(path, definition, value):
    uri = SCHEMA_BASE + path + ("#/$defs/" + definition if definition else "")
    jsonschema.Draft202012Validator({"$ref": uri}, registry=SCHEMAS,
                                   format_checker=jsonschema.FormatChecker()).validate(value)


def same_value(left, right):
    """Preserve complete-value types; Python equality conflates bool/int/float."""
    if type(left) is not type(right):
        return False
    if isinstance(left, dict):
        return left.keys() == right.keys() and all(same_value(left[k], right[k]) for k in left)
    if isinstance(left, list):
        return len(left) == len(right) and all(same_value(a, b) for a, b in zip(left, right))
    if isinstance(left, float):
        return left.hex() == right.hex()
    return left == right


# Reuse the repository's canonical MessagePack encoder for this suite's closed integer-only
# fixture domain. Native arbitrary EventRecord encoding remains SP-026/SP-236's obligation.
_codec_spec = importlib.util.spec_from_file_location("pm_readiness_codec", ROOT / "scripts/pm-implementation-readiness.py")
_codec = importlib.util.module_from_spec(_codec_spec)
sys.modules[_codec_spec.name] = _codec
_codec_spec.loader.exec_module(_codec)
canonical_msgpack = _codec.canonical_messagepack_bytes


def full_value_commitment(event):
    domain = "pm.storage.original_event_value_commitment.v1"
    codec = "pm.seglog_frame_v2.event_value.canonical_msgpack.v1"
    preimage = [domain, "1.0.0", codec, event["schema_id"], event["schema_version"], event]
    return {"schema_id": domain, "schema_version": "1.0.0", "codec": codec,
            "domain": domain, "event_schema_id": event["schema_id"],
            "event_schema_version": event["schema_version"],
            "sha256": hashlib.sha256(canonical_msgpack(preimage)).hexdigest()}


def operation_key(row):
    parts = [row[k].encode().hex() for k in
             ("storage_instance_id", "project_id", "operation_id", "root_slot_id")]
    suffix = hashlib.sha256(":".join(parts).encode()).hexdigest()
    return "filemanager_operation_custody.v1:" + suffix


def receipt_ref(row):
    return "pmref:filemanager_operation:" + operation_key(row).split(":", 1)[1]


def control_key(row):
    return ("filemanager_family_control.v1:" + row["storage_instance_id"].encode().hex() +
            ":" + row["event_type"] + ":" + row["family_revision"])


def validate_operation_transition(before, after):
    for row in (before, after):
        validate_shape("filemanager_operation_contracts.schema.json", "operation_custody", row)
    expected = {"accepted": "effect_settled", "effect_settled": "history_settled"}
    permitted = (expected.get(before["phase"]) == after["phase"] or
                 (before["phase"] == "accepted" and after["phase"] == "no_event_settled"))
    if not permitted or after["revision"] != before["revision"] + 1:
        raise ValueError("operation CAS/phase")
    immutable = set(before) - {"phase", "revision", "settlement", "complete_event", "first_append_receipt", "noncompletion"}
    if any(not same_value(before[k], after[k]) for k in immutable):
        raise ValueError("changed accepted original")
    if before["settlement"] is not None and not same_value(before["settlement"], after["settlement"]):
        raise ValueError("changed settled original")
    if after["phase"] == "no_event_settled":
        return  # No event/payload/receipt may be attached; the closed schema enforces this.
    payload = after["settlement"]["payload"]
    if (payload["schema_id"] != "pm.file_manager_event." + after["event_type"].replace(".", "_") + ".schema.v1" or
            payload["project_id"] != after["project_id"] or payload["operation_id"] != after["operation_id"] or
            payload["receipt_ref"] != receipt_ref(after) or
            any(payload[k] != after["accepted_command"][k]
                for k in ("command_id", "handler_target", "correlation_id", "origin"))):
        raise ValueError("settlement acceptance join")


def validate_control_transition(before, after, issued_sequence, drain_keys):
    for row in (before, after):
        validate_shape("filemanager_operation_contracts.schema.json", "family_control", row)
    if (control_key(before) != control_key(after) or
            after["control_revision"] != before["control_revision"] + 1):
        raise ValueError("control CAS/identity")
    edge = before["state"], after["state"]
    if edge not in {("prepared", "active"), ("active", "active"), ("active", "draining"),
                    ("draining", "draining"), ("draining", "withdrawn"), ("withdrawn", "withdrawn")}:
        raise ValueError("control transition")
    if before["admission_revision"] is not None and before["admission_revision"] != after["admission_revision"]:
        raise ValueError("changed original admission")
    if (after["last_admitted_sequence"] != issued_sequence or
            issued_sequence < before["last_admitted_sequence"]):
        raise ValueError("control issued boundary")
    if edge in {("active", "active"), ("draining", "draining")} and (
            after["reader_enabled"] != before["reader_enabled"] or
            after["drain_operation_keys"] != before["drain_operation_keys"]):
        raise ValueError("issuance changed control authority")
    if edge == ("active", "draining") and after["drain_operation_keys"] != drain_keys:
        raise ValueError("drain membership")
    if after["state"] == "withdrawn" and (drain_keys or
            after["writer_cutoff_sequence"] != issued_sequence):
        raise ValueError("cutoff before original drain")
    if edge == ("withdrawn", "withdrawn") and (
            before["writer_cutoff_sequence"] != after["writer_cutoff_sequence"] or
            before["last_admitted_sequence"] != after["last_admitted_sequence"] or
            before["reader_enabled"] is not True or after["reader_enabled"] is not False):
        raise ValueError("withdrawn authority rewritten")


def validate_original_models(event_type, payload, trace):
    model = trace["custody_model"]  # Synthetic canonical tables; native origin remains NOT_RUN.
    row = model["operation_rows"][model["operation_key"]]
    validate_shape("filemanager_operation_contracts.schema.json", "operation_custody", row)
    if model["operation_key"] != operation_key(row) or payload["receipt_ref"] != receipt_ref(row):
        raise ValueError("operation physical identity")
    if any(row[k] != trace[k] for k in ("storage_instance_id", "recovery_epoch", "project_id")):
        raise ValueError("operation original epoch/scope")
    if row["event_type"] != event_type or row["operation_id"] != payload["operation_id"]:
        raise ValueError("operation family/identity")
    if row["phase"] != "history_settled" or not same_value(row["settlement"]["payload"], payload):
        raise ValueError("unsettled or changed original payload")
    for k in ("command_id", "handler_target", "correlation_id", "origin"):
        if row["accepted_command"][k] != payload[k]:
            raise ValueError("original command join")
    for k in ("source_path_ref", "destination_path_ref", "destination_container_ref", "deletion_mode"):
        if row["accepted_command"][k] != payload.get(k):
            raise ValueError("original accepted input join")
    if row["settlement"]["settled_at_utc"] != payload["ts"]:
        raise ValueError("original completion time")
    paths = row["settlement"]["path_snapshots"]
    required_paths = set(payload["affected_path_refs"] +
                         [payload[k] for k in ("source_path_ref", "destination_path_ref") if k in payload])
    if len(paths) != len(required_paths) or {p["path_ref"] for p in paths} != required_paths:
        raise ValueError("original path coverage")
    for p in paths:
        if (p["project_id"] != payload["project_id"] or
                p["path_snapshot_revision"] != payload["path_snapshot_revision"] or
                (p["node_ref"] is None) != (p["node_kind"] == "absent")):
            raise ValueError("original path join")
    accepted_paths = row["accepted_path_snapshots"]
    if len(accepted_paths) != len(paths) or {p["path_ref"] for p in accepted_paths} != required_paths:
        raise ValueError("accepted path coverage")
    for p in paths:
        original = next(a for a in accepted_paths if a["path_ref"] == p["path_ref"])
        if any(original[k] != p[k] for k in ("project_id", "path_snapshot_revision", "computer_id",
                                             "root_identity_ref", "relative_components")):
            raise ValueError("changed accepted location")
    kind, action = event_type.split(".")
    root = "node" if kind == "file" else "folder"
    if action == "created":
        destination = next(a for a in accepted_paths if a["path_ref"] == payload["destination_path_ref"])
        result = next(p for p in paths if p["path_ref"] == payload["destination_path_ref"])
        if (destination["node_kind"] != "absent" or destination["node_ref"] is not None or
                not any(a["node_ref"] == payload["destination_container_ref"] and a["node_kind"] == "folder"
                        for a in accepted_paths) or
                result["node_ref"] != payload["result_" + root + "_ref"] or result["node_kind"] != kind):
            raise ValueError("creation original parent/absence")
    event = row["complete_event"]
    if (not same_value(event["payload"], payload) or event["event_type"] != event_type or
            event["project_id"] != payload["project_id"] or event["scope_kind"] != "project" or
            event["correlation_id"] != payload["correlation_id"] or
            event["occurred_at_utc"] != payload["ts"] or event["payload_schema_id"] != payload["schema_id"] or
            (event["event_id"], event["idempotency_key"]) != identity(event_type, payload, row)):
        raise ValueError("original complete event join")
    if model["resolver"] != "storage.first_append_receipt.resolve_full_value.v1":
        raise ValueError("semantic proof is not full-value proof")
    request, result = model["request"], model["result"]
    validate_shape("event_append_receipt_contracts.schema.json", "full_value_request", request)
    validate_shape("event_append_receipt_contracts.schema.json", "full_value_result", result)
    if not same_value(request["event"], event):
        raise ValueError("changed original full-value request")
    stored = model["append_rows"][model["append_key"]]
    validate_shape("event_append_receipt_contracts.schema.json", "custody_v2", stored)
    key = ("event_append_receipt_custody.v1:" + row["storage_instance_id"] + ":" +
           hashlib.sha256(event["event_id"].encode()).hexdigest())
    scope = "project~" + base64.urlsafe_b64encode(payload["project_id"].encode()).decode().rstrip("=")
    if (model["append_key"] != key or stored["storage_instance_id"] != row["storage_instance_id"] or
            stored["event_id"] != event["event_id"] or stored["scope_partition"] != scope or
            stored["event_type"] != event_type or stored["idempotency_key"] != event["idempotency_key"]):
        raise ValueError("original v2 custody identity")
    if not same_value(result, {k: stored[k] for k in result}):
        raise ValueError("full-value result differs from selected original")
    if result["original_event_value_commitment"] != full_value_commitment(event):
        raise ValueError("unequal complete-value commitment")
    receipt = result["first_append_receipt"]
    if (not same_value(receipt, row["first_append_receipt"]) or receipt["event_id"] != event["event_id"] or
            receipt["sequence_id"] != event["sequence_id"] or receipt["durability_class"] != "barrier"):
        raise ValueError("original issued receipt join")
    control = model["control_rows"][model["control_key"]]
    validate_shape("filemanager_operation_contracts.schema.json", "family_control", control)
    if (model["control_key"] != control_key(control) or control["event_type"] != event_type or
            control["storage_instance_id"] != row["storage_instance_id"]):
        raise ValueError("control physical identity")
    if control["state"] == "prepared" or not control["reader_enabled"]:
        raise ValueError("control reader unavailable")
    ceiling = control["writer_cutoff_sequence"] if control["state"] == "withdrawn" else control["last_admitted_sequence"]
    if (control["state"] == "withdrawn" and ceiling != control["last_admitted_sequence"]) or event["sequence_id"] > ceiling:
        raise ValueError("control cutoff/sequence")
    if any(not same_value(model["final_" + name], value) for name, value in
           [("operation", row), ("control", control), ("append", stored)]):
        raise ValueError("late original/control change")
    if not same_value(model["backup_binding"], {"operation": row, "control": control,
                                               "append": stored, "storage_instance_id": row["storage_instance_id"]}):
        raise ValueError("backup original/control skew")


def identity(event_type, payload, context):
    # These fixtures contain ASCII strings only; JSON compact encoding equals RFC8785 here.
    # Production MUST use RFC8785, not this bounded oracle encoding, for arbitrary Unicode.
    kind, action = event_type.split(".")
    subject = {
        "created": "result_node_ref" if kind == "file" else "result_folder_ref",
        "copied": "source_node_ref" if kind == "file" else "source_folder_ref",
        "exported": "source_node_ref" if kind == "file" else "source_folder_ref",
        "deleted": "prior_node_ref" if kind == "file" else "prior_folder_ref",
        "moved": "node_ref" if kind == "file" else "folder_ref",
        "renamed": "node_ref" if kind == "file" else "folder_ref",
    }[action]
    fields = [context["storage_instance_id"], str(context["recovery_epoch"]),
              payload["project_id"], event_type, payload["operation_id"], payload[subject]]
    digest = hashlib.sha256(json.dumps(fields, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()
    return "evt_" + event_type.replace(".", "_") + "_" + digest, event_type + ":" + digest


def validate_case(event_type, payload, trace):
    schema = json.loads((ROOT / "Plans/event_payloads/file_manager" /
                         (event_type.replace(".", "_") + ".schema.json")).read_text())
    jsonschema.Draft202012Validator(schema, format_checker=jsonschema.FormatChecker()).validate(payload)
    if payload["project_id"] != trace["project_id"]:
        raise ValueError("scope mismatch")
    kind, action = event_type.split(".")
    root = "node" if kind == "file" else "folder"
    if action == "copied" and payload["result_" + root + "_ref"] == payload["source_" + root + "_ref"]:
        raise ValueError("copy result equals source")
    if action == "created" and payload["result_" + root + "_ref"] == payload["destination_container_ref"]:
        raise ValueError("create result equals destination container")
    for key in ("source_path_ref", "destination_path_ref"):
        if key in payload and not payload[key].startswith("pm-path-ref:v1:project:"):
            raise ValueError("foreign path scope")
    if any(not p.startswith("pm-path-ref:v1:project:") for p in payload["affected_path_refs"]):
        raise ValueError("foreign affected path scope")
    if not same_value(trace["original_payload"], payload):
        raise ValueError("unequal original custody")
    if trace["stages"] != ["effect_settled", "receipt_settled", "append", "first_ack", "terminal"]:
        raise ValueError("invalid ordering")
    if not trace["original_first_receipt_resolved"]:
        raise ValueError("unresolved first receipt")
    if trace["replay_effect_count"] != 0 or trace["retry_append_count"] != 0:
        raise ValueError("replay/duplicate effect")


    if not trace["current_source_verified"] or not trace["access_allowed"] or not trace["restore_coherent"]:
        raise ValueError("source/access/restore fence")
    if trace["reader_revision"] != "1.0.0" or trace["event_revision"] != "1.0.0":
        raise ValueError("unsupported revision")
    if not trace["reader_enabled"]:
        raise ValueError("reader withdrawn")
    if trace["event_sequence"] > trace["writer_cutoff_sequence"]:
        raise ValueError("past writer cutoff")
    if event_type.endswith((".copied", ".moved", ".renamed", ".exported")):
        if payload["source_path_ref"] == payload["destination_path_ref"]:
            raise ValueError("unchanged path edge")
    action = event_type.split(".")[1]
    expected_semantics = {
        "copied": {"source_unchanged": True, "distinct_result": True},
        "created": {"valid_name": True, "exact_container": True, "new_node": True},
        "deleted": {"mode_matches_original": True, "confirmation_valid": True, "custody_distinct": True},
        "exported": {"source_unchanged": True, "destination_authorized": True, "transfer_complete": True},
        "moved": {"destination_committed": True, "source_removed": True, "identity_preserved": True},
        "renamed": {"valid_name": True, "same_parent": True, "identity_preserved": True},
    }[action]
    if trace["semantic_checks"] != expected_semantics:
        raise ValueError("family semantic boundary")
    if event_type.startswith("folder.") and "descendant_count" in payload:
        if payload["descendant_count"] != trace["original_descendant_count"]:
            raise ValueError("descendant receipt mismatch")
    expected = identity(event_type, payload, trace)
    if tuple(trace["retry_identity"]) != expected:
        raise ValueError("retry identity changed")
    validate_original_models(event_type, payload, trace)
    return expected


def main():
    fixtures = json.loads((ROOT / "Plans/filemanager_event_contract_fixtures.json").read_text())
    count = 0
    for row in fixtures["rows"]:
        name, payload, trace = row["event_type"], row["payload"], row["trace"]
        validate_case(name, payload, trace)
        count += 1
        for case in row["negative_cases"]:
            p, t = copy.deepcopy(payload), copy.deepcopy(trace)
            for k, v in case.get("payload_set", {}).items():
                p[k] = v
            for k in case.get("payload_delete", []):
                p.pop(k, None)
            t.update(case.get("trace_set", {}))
            for mutation in case.get("model_set", []):
                target = t["custody_model"]
                for key in mutation["path"][:-1]:
                    target = target[key]
                target[mutation["path"][-1]] = mutation["value"]
            try:
                validate_case(name, p, t)
            except (ValueError, KeyError, jsonschema.ValidationError) as error:
                if case.get("expected_error") and str(error) != case["expected_error"]:
                    raise AssertionError(name + ": negative masked: " + case["name"]) from error
                count += 1
            else:
                raise AssertionError(name + ": accepted negative " + case["name"])
        for case in row["transition_cases"]:
            args = case["args"]
            validator = validate_operation_transition if case["kind"] == "operation" else validate_control_transition
            try:
                validator(*args)
            except (ValueError, KeyError, jsonschema.ValidationError):
                if case["valid"]:
                    raise AssertionError(name + ": rejected positive transition " + case["name"])
            else:
                if not case["valid"]:
                    raise AssertionError(name + ": accepted negative transition " + case["name"])
            count += 1
        owner = (ROOT / "Plans/FileManager.md").read_text()
        start = owner.index("### " + row["owner_unit"] + " - ")
        section = owner[start:].split("\n### ", 1)[0]
        for token in [name, "SP-278", "SP-286/CV-339", "PENDING_RETENTION_DECISION",
                      "storage.first_append_receipt.resolve_full_value.v1", "#/$defs/full_value_request",
                      "#/$defs/full_value_result", "filemanager.operation_custody.resolve.v1",
                      "filemanager.path_snapshot.resolve.v1", "filemanager_family_control.v1",
                      "reader.filemanager." + name.replace(".", "_") + ".v1@1.0.0"]:
            if token not in section:
                raise AssertionError(name + ": missing owner adoption " + token)
    registry = json.loads((ROOT / "Plans/storage_value_registry.json").read_text())
    jsonschema.Draft202012Validator(json.loads((ROOT / "Plans/storage_value_registry.schema.json").read_text())).validate(registry)
    schema = json.loads((ROOT / "Plans/filemanager_operation_contracts.schema.json").read_text())
    jsonschema.Draft202012Validator.check_schema(schema)
    for family, definition in [("filemanager_operation_custody", "operation_custody"),
                               ("filemanager_family_control", "family_control")]:
        entry = next(f for f in registry["families"] if f["family_id"] == family)
        jsonschema.Draft202012Validator.check_schema(entry["value_schema"])
        for field in ("properties", "required", "additionalProperties", "allOf"):
            if entry["value_schema"][field] != schema["$defs"][definition][field]:
                raise AssertionError(family + ": registry/schema drift")
        if (entry["required_fields"] != schema["$defs"][definition]["required"] or
                not entry["recovery_disposition"]["backup_required"] or
                not entry["restore_disposition"]["mutation_fence_on_unresolved"]):
            raise AssertionError(family + ": incomplete registered custody")
    print(json.dumps({"status": "pass", "families": len(fixtures["rows"]),
                      "oracle_cases": count, "native_execution": "NOT_RUN"}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
