#!/usr/bin/env python3
"""Static FileManager event contract oracles. No filesystem/native execution proof."""
import copy
import hashlib
import json
from pathlib import Path
import sys
import jsonschema

ROOT = Path(__file__).resolve().parents[1]


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
    for key in ("source_path_ref", "destination_path_ref"):
        if key in payload and not payload[key].startswith("pm-path-ref:v1:project:"):
            raise ValueError("foreign path scope")
    if any(not p.startswith("pm-path-ref:v1:project:") for p in payload["affected_path_refs"]):
        raise ValueError("foreign affected path scope")
    if trace["original_payload"] != payload:
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
            try:
                validate_case(name, p, t)
            except (ValueError, KeyError, jsonschema.ValidationError):
                count += 1
            else:
                raise AssertionError(name + ": accepted negative " + case["name"])
        owner = (ROOT / "Plans/FileManager.md").read_text()
        start = owner.index("### " + row["owner_unit"] + " - ")
        section = owner[start:].split("\n### ", 1)[0]
        for token in [name, "SP-278", "SP-286/CV-339", "PENDING_RETENTION_DECISION",
                      "reader.filemanager." + name.replace(".", "_") + ".v1@1.0.0"]:
            if token not in section:
                raise AssertionError(name + ": missing owner adoption " + token)
    print(json.dumps({"status": "pass", "families": len(fixtures["rows"]),
                      "oracle_cases": count, "native_execution": "NOT_RUN"}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
