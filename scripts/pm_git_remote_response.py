"""SIR original/delivery/domain/common joins for the two public Git remote commands.

This adapter authenticates no issuer, grants no permission, resolves no native
admission and writes nothing. Callers must supply the actual retained owner
records, the authenticated original binding and the existing canonical digest
contract. Fixture readers are synthetic static doubles.
"""
from copy import deepcopy
from datetime import datetime
import json
import re
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Resource

from pm_git_remote_selected import result_failures, shape_failures
from pm_full_thread_semantics import full_thread_semantic_failures

COMMANDS = frozenset(("cmd.git.fetch", "cmd.git.push"))
BINDING = {"path": "Plans/git_remote_selected.schema.json", "json_pointer": "#/$defs/result",
           "schema_id": "pm.source_control.git_remote.result.v1"}
SCHEMA = "Plans/sir_git_remote_dispatch.schema.json"
SCS_REL = "Plans/source_control_contracts.schema.json"
CENTRAL_OUTCOME = {"accepted": "accepted", "succeeded": "succeeded", "blocked": "rejected",
                   "failed": "failed", "cancelled": "cancelled", "recovery_required": "terminal_unknown",
                   "effect_unknown": "terminal_unknown"}
CENTRAL_STATUS = {"accepted": "pending", "succeeded": "succeeded", "blocked": None, "failed": "failed",
                  "cancelled": "cancelled", "recovery_required": "recovery_required",
                  "effect_unknown": "recovery_required"}
IDENTITY_FIELDS = ("project_id", "project_home_server_id", "execution_host_id",
                   "execution_environment_id", "source_location_id", "topology_generation")
LINEAGE_FIELDS = (("plan_id", "named_plan_id"), ("goal_id", "goal_id"))
LOCAL = Path(__file__).resolve().parents[1]


def binding_shape_failures(value, *, registry, canon_root=None, definition="dispatch_binding"):
    root = Path(canon_root or LOCAL)
    schema = json.loads((root / SCHEMA).read_text(encoding="utf-8"))
    registry = registry.with_resource(schema["$id"], Resource.from_contents(schema))
    validator = Draft202012Validator({"$ref": schema["$id"] + "#/$defs/" + definition}, registry=registry,
                                     format_checker=FormatChecker())
    return [error.message for error in validator.iter_errors(value)]


def response_failures(response, outcome, owner_result, owner_request, normalized_request,
                      original_binding_ref, delivery_return_context, *, resolve_record,
                      canonical_request_digest, canon_root, registry):
    """Join the SIR original, the Git adapter request/result and the central response."""
    inputs = (response, outcome, owner_result, owner_request, normalized_request, original_binding_ref,
              delivery_return_context)
    saved = deepcopy(inputs)
    response, outcome, result, request, normalized, binding_ref, delivery = saved
    if not callable(resolve_record) or not callable(canonical_request_digest):
        return ["git_remote_response_dependencies_missing"]
    failures: list[str] = []
    records: dict[str, object] = {}
    live: dict[str, object] = {}

    def fail(rule, condition):
        if condition:
            failures.append("git_remote_response_" + rule)

    def read(ref):
        if ref not in records:
            live[ref] = resolve_record(ref)
            records[ref] = deepcopy(live[ref])
        return deepcopy(records[ref])

    def time(value):
        return datetime.fromisoformat(value.replace("Z", "+00:00"))

    try:
        if not isinstance(result, dict) or "schema_id" not in result:
            return ["git_remote_response_owner_result_missing"]
        original = read(binding_ref)
        if binding_shape_failures(original, registry=registry, canon_root=canon_root):
            raise ValueError("original_schema")
        if binding_shape_failures(delivery, registry=registry, canon_root=canon_root,
                                  definition="delivery_return_context"):
            raise ValueError("delivery_schema")
        failures += full_thread_semantic_failures("IdentityEnvelope", original["identity"])
        fail("original_arguments", original["arguments"] != request)
        failures += result_failures(request, result, resolve_record=read, canon_root=canon_root)
        if result["effect_state"] == "effect_unknown" and result["error_ref"] is None:
            failures.append("git_remote_response_unknown_effect_without_owner_error")
        if not failures:
            identity, context = original["identity"], read(request["repository_context_ref"])
            retained = read(response["owner_result_ref"])
            fail("delivery_original", delivery != original["return_context"]
                 or request["return_context"] != original["return_context"])
            fail("retained_owner_result", retained != result
                 or response["owner_result_ref"] != outcome["owner_result_ref"])
            fail("context_identity", identity.get("scope_kind") != "project" or any(
                identity.get(field) != context["lineage"][field] for field in IDENTITY_FIELDS))
            fail("context_lineage", any(
                identity.get(target) != context["lineage"].get(source)
                for source, target in LINEAGE_FIELDS))
            fail("identity", identity != outcome["identity"] or identity != response["owner_identity"]
                 or identity != normalized.get("owner_identity"))
            fail("command", request["command_id"] != response["command_id"]
                 or request["command_id"] not in COMMANDS)
            fail("instance", request["command_instance_id"] != response["command_instance_id"]
                 or request["command_instance_id"] != identity["command_instance_id"])
            fail("operation", request["operation_id"] != identity["operation_id"]
                 or request["operation_id"] != response["operation_id"])
            fail("original_ref", any(value != original["request_ref"] for value in (
                result["original_request_ref"], response["request_ref"], normalized.get("request_ref"))))
            fail("idempotency", request["idempotency_key"] != original["idempotency_key"]
                 or outcome["idempotency_key"] != original["idempotency_key"])
            fail("permission", request["permission_snapshot_ref"] != original["permission_snapshot_ref"])
            fail("dispatch", (response["original_dispatch_id"] if response["replayed"]
                              else response["dispatch_id"]) != original["dispatch_id"])
            for field in ("dispatch_frame_id", "target_generation", "payload_sha256"):
                fail("original_" + field, outcome[field] != original[field]
                     or normalized.get(field) != original[field])
            digest_input = deepcopy(request)
            try:
                digest = canonical_request_digest(digest_input)
                fail("digest_contract", not isinstance(digest, str)
                     or re.fullmatch("[0-9a-f]{64}", digest) is None)
                fail("original_payload", digest != original["payload_sha256"])
            except Exception:
                failures.append("git_remote_response_digest_unavailable")
            fail("digest_mutated", digest_input != request)
            fail("time", not time(request["requested_at_utc"]) <= time(original["accepted_at_utc"])
                 <= time(result["observed_at_utc"]) <= time(outcome["observed_at"]))
            fail("outcome", outcome["outcome"] != CENTRAL_OUTCOME[result["outcome"]]
                 or response["result_status"] != CENTRAL_STATUS[result["outcome"]]
                 or response["result_status"] == "no_op")
            fail("ack", response["ack_status"] != ("rejected" if result["outcome"] == "blocked"
                                                   else "accepted"))
            if result["outcome"] == "accepted":
                fail("accepted_terminal", outcome["result_receipt_ref"] is not None
                     or response["receipt_ref"] is not None or result["observable_work_id"] is None)
            else:
                receipt = read(result["operation_receipt_ref"])
                fail("receipt", result["operation_receipt_ref"] != outcome["result_receipt_ref"]
                     or response["receipt_ref"] != outcome["result_receipt_ref"])
                fail("receipt_events", response["event_refs"] != receipt["event_refs"]
                     or list(receipt["event_refs"]))
            if result["error_ref"] is None:
                fail("error_absence", outcome["error_ref"] is not None or response["error"] is not None
                     or result["error_projection_ref"] is not None)
            else:
                fail("error_ref", outcome["error_ref"] != result["error_ref"])
                error = read(result["error_ref"])
                if not isinstance(result["error_projection_ref"], str):
                    failures.append("git_remote_response_error_projection_required")
                else:
                    projection = read(result["error_projection_ref"])
                    if binding_shape_failures(projection, registry=registry, canon_root=canon_root,
                                              definition="error_projection"):
                        failures.append("git_remote_response_error_projection_schema")
                    else:
                        fail("error_projection_source",
                             projection["projection_id"] != result["error_projection_ref"]
                             or projection["owner_error_ref"] != result["error_ref"]
                             or projection["command_id"] != request["command_id"]
                             or projection["command_instance_id"] != request["command_instance_id"])
                        fail("error_projection_payload", projection["owner_error"] != error)
                        fail("error_projection_value", projection["ui_error"] != response["error"])
                        fail("error_projection_nullability",
                             (projection["ui_error"] is None)
                             != (response["result_status"] == "cancelled"))
                        fail("error_disclosure", projection["return_context"] != original["return_context"]
                             or projection["return_context"] != delivery)
                        fail("error_time", not time(request["requested_at_utc"])
                             <= time(error["occurred_at_utc"]) <= time(projection["recorded_at_utc"])
                             <= time(outcome["observed_at"]))
            if response["command_id"] not in COMMANDS:
                fail("owner_command", True)
    except Exception as exc:
        failures.append("git_remote_response_unresolved:" + type(exc).__name__)
    if inputs != saved:
        failures.append("git_remote_response_inputs_mutated")
    if any(live[ref] != value for ref, value in records.items()):
        failures.append("git_remote_response_owner_record_mutated")
    return sorted(set(failures))


def fixture_dependencies(value, *, ui_module):
    """Synthetic fixture reader and the existing static digest; never native proof."""
    records = deepcopy(value["records"])

    def resolve(ref):
        if ref not in records:
            raise KeyError(ref)
        return deepcopy(records[ref])

    return {"resolve_owner_record": resolve, "canonical_request_digest": ui_module.owner_result_digest}


def git_remote_dispatch_semantic_failures(definition, value, *, ui_module=None):
    """Gate semantics: bare bindings carry identity semantics; fixture cases run the
    actual central response path. A bare result/error record is an owner value
    joined by the runtime adapter, not a fixture-only pass."""
    if definition == "dispatch_binding":
        return full_thread_semantic_failures("IdentityEnvelope", value["identity"])
    if definition != "fixture_case":
        return []
    ui_module = ui_module or _ui_module()
    return ui_module.response_bundle_failures(value["bundle"], **fixture_dependencies(value, ui_module=ui_module))


def _ui_module():
    import pm_ui_command_response as ui_module
    return ui_module
