"""Exact six neutral Source Control SIR original/result/error joins.

The authenticated dispatcher, the independently retained owner records, the
existing canonical digest contract and native admission are external
prerequisites. This module is a static composition checker: it authenticates no
issuer, grants no permission, proves no effect, and writes nothing. Fixture
readers and the static digest double below are synthetic test inputs, not
runtime contracts.
"""
from copy import deepcopy
from datetime import datetime
import json
import os
from pathlib import Path
import re
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Resource

from pm_source_control_selected_operands import result_failures
from pm_full_thread_semantics import full_thread_semantic_failures

COMMANDS = frozenset((
    "cmd.source_control.backend.select",
    "cmd.source_control.diff.open",
    "cmd.source_control.history.open",
    "cmd.source_control.remote.fetch",
    "cmd.source_control.remote.publish",
    "cmd.source_control.workspace.remove",
))
BINDING = {
    "path": "Plans/sir_source_control_selected_dispatch.schema.json",
    "json_pointer": "#/$defs/result_binding",
    "schema_id": "pm.sir.source_control_selected_result_binding.v1",
}
SCHEMA = BINDING["path"]
SOURCE_CONTROL_SCHEMA = "Plans/source_control_contracts.schema.json"
ERROR_DEFINITION = "#/$defs/source_control_command_error"
CENTRAL_OUTCOME = {
    "succeeded": "succeeded",
    "blocked": "rejected",
    "failed": "failed",
    "cancelled": "cancelled",
    "recovery_required": "terminal_unknown",
    "effect_unknown": "terminal_unknown",
}
IDENTITY_FIELDS = ("project_id", "project_home_server_id", "execution_host_id",
                   "execution_environment_id", "source_location_id", "topology_generation")
LINEAGE_FIELDS = (("plan_id", "named_plan_id"), ("goal_id", "goal_id"))


def _root(canon_root):
    return Path(canon_root or os.environ.get("PM_CANON_ROOT") or Path(__file__).resolve().parents[1])


def _read_schema(path, canon_root):
    return json.loads((_root(canon_root) / path).read_text(encoding="utf-8"))


def definition_shape_failures(path, definition, value, *, registry, canon_root):
    """Structural validation against one named definition of an owner schema."""
    doc = _read_schema(path, canon_root)
    registry = registry.with_resource(doc["$id"], Resource.from_contents(doc))
    validator = Draft202012Validator(
        {"$ref": doc["$id"] + definition}, registry=registry, format_checker=FormatChecker()
    )
    return [e.message for e in validator.iter_errors(value)]


def response_failures(response, outcome, owner_result, owner_request, normalized_request,
                      original_binding_ref, delivery_return_context, *, resolve_record,
                      canonical_request_digest, canon_root, registry):
    """Join the SIR original, selected operands, owner result/receipt and caller response."""
    inputs = (response, outcome, owner_result, owner_request, normalized_request,
              original_binding_ref, delivery_return_context)
    saved = deepcopy(inputs)
    response, outcome, result, request, normalized, binding_ref, delivery = saved
    if not callable(resolve_record) or not callable(canonical_request_digest):
        return ["source_control_selected_response_dependencies_missing"]
    failures: list[str] = []
    records: dict[str, object] = {}
    live: dict[str, object] = {}

    def fail(rule, condition):
        if condition:
            failures.append("source_control_selected_response_" + rule)

    def read(ref):
        if ref not in records:
            live[ref] = resolve_record(ref)
            records[ref] = deepcopy(live[ref])
        return deepcopy(records[ref])

    def time(value):
        return datetime.fromisoformat(value.replace("Z", "+00:00"))

    try:
        if not isinstance(result, dict) or not isinstance(result.get("selected"), dict):
            return ["source_control_selected_response_result_binding_missing"]
        original = read(binding_ref)
        if definition_shape_failures(SCHEMA, "#/$defs/dispatch_binding", original,
                                     registry=registry, canon_root=canon_root):
            raise ValueError("dispatch_binding_schema")
        if definition_shape_failures(SCHEMA, "#/$defs/delivery_return_context", delivery,
                                     registry=registry, canon_root=canon_root):
            raise ValueError("delivery_return_context_schema")
        failures += full_thread_semantic_failures("IdentityEnvelope", original["identity"])
        fail("original_arguments", original["arguments"] != request)
        # The preserved selected-operands companion joins original request, exact
        # selection, owner preview/native disclosure, owner result and receipt.
        failures += result_failures(request, result["selected"], resolve_record=read, canon_root=canon_root)
        if not failures:
            authority, scope, selected = request["authority"], request["authority"]["scope"], result["selected"]
            owner = selected["owner_result"]
            identity, context = original["identity"], read(request["repository_context_ref"])
            retained = read(result["retained_owner_result_ref"])
            fail("delivery_original", delivery != original["return_context"])
            fail("owner_return_context", authority.get("return_context") != original["return_context"])
            fail("retained_owner_result", retained != owner)
            fail("context_identity", identity.get("scope_kind") != "project" or any(
                identity.get(field) != context["lineage"][field] for field in IDENTITY_FIELDS))
            fail("context_lineage", any(
                identity.get(target) != context["lineage"].get(source) for source, target in LINEAGE_FIELDS))
            fail("identity", identity != outcome["identity"] or identity != response["owner_identity"]
                 or identity != normalized.get("owner_identity"))
            fail("command", scope["command_id"] != response["command_id"]
                 or scope["command_id"] not in COMMANDS)
            fail("instance", authority["command_instance_id"] != response["command_instance_id"]
                 or authority["command_instance_id"] != identity["command_instance_id"])
            fail("operation", identity["operation_id"] != response["operation_id"])
            fail("original_ref", any(value != original["request_ref"] for value in (
                selected["original_request_ref"], response["request_ref"], normalized.get("request_ref"))))
            fail("idempotency", authority["idempotency_key"] != original["idempotency_key"]
                 or outcome["idempotency_key"] != original["idempotency_key"])
            fail("permission", authority["permission_snapshot_ref"] != original["permission_snapshot_ref"])
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
                failures.append("source_control_selected_response_digest_unavailable")
            fail("digest_mutated", digest_input != request)
            fail("time", not time(authority["requested_at_utc"]) <= time(original["accepted_at_utc"])
                 <= time(owner["completed_at_utc"]) <= time(outcome["observed_at"]))
            expected = CENTRAL_OUTCOME[owner["outcome"]]
            if owner["effect_state"] == "effect_unknown":
                expected = "terminal_unknown"
            fail("outcome", outcome["outcome"] != expected or response["result_status"] == "no_op")
            receipt = read(owner["operation_receipt_ref"])
            fail("receipt", owner["operation_receipt_ref"] != outcome["result_receipt_ref"]
                 or response["receipt_ref"] != outcome["result_receipt_ref"])
            fail("receipt_outcome", receipt["outcome"] != owner["outcome"])
            fail("receipt_events", response["event_refs"] != receipt["event_refs"])
            # The SCM result/receipt observable_work_id correlation stays the
            # preserved companion's owner join; resolving the ObservableWorkRecord
            # itself remains an existing native owner obligation and is not
            # fabricated here.
            if owner["effect_state"] == "effect_unknown" and result["error_ref"] is None:
                failures.append("source_control_selected_response_unknown_effect_without_owner_error")
            if owner["outcome"] in ("blocked", "failed", "recovery_required", "effect_unknown") \
                    and result["error_ref"] is None:
                failures.append("source_control_selected_response_error_required_for_terminal_failure")
            if owner["outcome"] == "succeeded" and result["error_ref"] is not None:
                failures.append("source_control_selected_response_error_for_success")
            fail("error_projection_presence",
                 (result["error_ref"] is None) != (result["error_projection_ref"] is None))
            if result["error_ref"] is not None:
                fail("error_outcome_ref", outcome["error_ref"] != result["error_ref"])
                error = read(result["error_ref"])
                if definition_shape_failures(SOURCE_CONTROL_SCHEMA, ERROR_DEFINITION, error,
                                             registry=registry, canon_root=canon_root):
                    failures.append("source_control_selected_response_error_schema")
                else:
                    fail("error_scope", error["command_instance_id"] != authority["command_instance_id"]
                         or error["scope"] != scope)
                    fail("error_effect", (error["effect_state"] == "effect_unknown")
                         != (owner["effect_state"] == "effect_unknown"))
                fail("error_projection_required", result["error_projection_ref"] is None)
                if result["error_projection_ref"] is not None:
                    projection = read(result["error_projection_ref"])
                    if definition_shape_failures(SCHEMA, "#/$defs/error_projection", projection,
                                                 registry=registry, canon_root=canon_root):
                        failures.append("source_control_selected_response_error_projection_schema")
                    else:
                        fail("error_projection_source",
                             projection["projection_id"] != result["error_projection_ref"]
                             or projection["owner_error_ref"] != result["error_ref"]
                             or projection["command_id"] != scope["command_id"]
                             or projection["command_instance_id"] != authority["command_instance_id"])
                        fail("error_projection_payload", projection["owner_error"] != error)
                        fail("error_projection_value", projection["ui_error"] != response["error"])
                        fail("error_projection_nullability",
                             (projection["ui_error"] is None) != (response["result_status"] == "cancelled"))
                        fail("error_disclosure", projection["return_context"] != original["return_context"]
                             or projection["return_context"] != delivery)
                        fail("error_time", not time(authority["requested_at_utc"])
                             <= time(error["occurred_at_utc"]) <= time(projection["recorded_at_utc"])
                             <= time(outcome["observed_at"]))
                        fail("error_retry", error["effect_state"] == "effect_unknown"
                             and (error["retry_allowed"] or "retry" in error["safe_next_actions"]))
            elif outcome["error_ref"] is not None or response["error"] is not None:
                fail("error_absence", True)
        if response["command_id"] not in COMMANDS:
            fail("owner_command", True)
    except Exception as exc:
        failures.append("source_control_selected_response_unresolved:" + type(exc).__name__)
    if inputs != saved:
        failures.append("source_control_selected_response_inputs_mutated")
    if any(live[ref] != value for ref, value in records.items()):
        failures.append("source_control_selected_response_owner_record_mutated")
    return sorted(set(failures))


def fixture_dependencies(value, *, ui_module):
    """Synthetic fixture reader and the existing static digest; never native proof."""
    records = deepcopy(value["records"])
    return {"resolve_owner_record": lambda ref: deepcopy(records[ref]),
            "canonical_request_digest": ui_module.owner_result_digest}


def selected_dispatch_semantic_failures(definition, value, *, ui_module=None):
    """Gate semantics: bare dispatch bindings carry identity semantics; fixture
    cases compose the actual central response path. A bare result/error record is
    an owner value joined by the runtime adapter, not a fixture-only pass."""
    if definition == "dispatch_binding":
        return full_thread_semantic_failures("IdentityEnvelope", value["identity"])
    if definition != "fixture_case":
        return []
    ui_module = ui_module or _ui_module()
    return ui_module.response_bundle_failures(value["bundle"], **fixture_dependencies(value, ui_module=ui_module))


def _ui_module():
    import pm_ui_command_response as ui_module
    return ui_module
