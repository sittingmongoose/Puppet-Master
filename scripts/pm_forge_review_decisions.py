"""Static Forge approve/request-changes original-value and result joins.

No provider call, permission grant, authentication or replay is performed.
Existing native owners must authenticate original records and actual provider
observations. Synthetic fixture readers prove static joins only.
"""
from copy import deepcopy
from datetime import datetime
import json
import os
from pathlib import Path
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
COMMANDS = {"cmd.forge.review.approve", "cmd.forge.review.request_changes"}


def shape_failures(definition, value, *, owner=False, canon_root=None):
    root = Path(canon_root or os.environ.get("PM_CANON_ROOT", ROOT))
    source = json.loads((root / "Plans/forge_integration_contracts.schema.json").read_text())
    companion = json.loads((ROOT / "Plans/forge_review_decisions.schema.json").read_text())
    registry = Registry().with_resources([(x["$id"], Resource.from_contents(x)) for x in (source, companion)])
    schema = source if owner else companion
    return ["shape:" + e.message for e in Draft202012Validator(
        {"$ref": schema["$id"] + "#/$defs/" + definition}, registry=registry).iter_errors(value)]


def _read(resolve, ref, definition, errors, *, owner=False, canon_root=None):
    try:
        value = deepcopy(resolve(ref))
        failures = shape_failures(definition, value, owner=owner, canon_root=canon_root)
    except Exception as exc:
        errors.append("unresolved:" + str(ref) + ":" + type(exc).__name__)
        return None
    if failures:
        errors.extend(failures)
        return None
    return value


def result_failures(original_request, result, *, resolve_record, canon_root=None):
    original, output = deepcopy(original_request), deepcopy(result)
    errors = shape_failures("request", original, canon_root=canon_root)
    errors += shape_failures("result", output, canon_root=canon_root)
    if not errors:
        a, selected, r = original["authority"], original["selection"], output["owner_result"]
        actual_original = _read(resolve_record, output["original_request_ref"], "request", errors, canon_root=canon_root)
        if actual_original != original:
            errors.append("original_request")
        binding = _read(resolve_record, a["repository_binding_ref"], "repository_binding", errors, owner=True, canon_root=canon_root)
        revision = _read(resolve_record, a["target"]["review_revision_ref"], "review_revision", errors, owner=True, canon_root=canon_root)
        if selected["provider_review_id"] != a["target"]["provider_review_id"]:
            errors.append("selected_review")
        if binding is not None:
            for key in ("provider", "provider_variant", "normalized_host", "account_id", "repo_id"):
                if binding[key] != a[key]:
                    errors.append("binding_" + key)
            if binding["binding_generation"] != a["expected_binding_generation"]:
                errors.append("binding_generation")
            if binding["provider_repository_id"] != a["target"]["provider_repository_id"]:
                errors.append("provider_repository")
            if binding["authority"]["review"] != a["effective_authority_role"]:
                errors.append("review_authority")
        if a["currentness"]["binding_generation"] != a["expected_binding_generation"]:
            errors.append("currentness_binding_generation")
        if a["target"].get("review_head_oid") is not None and a["target"]["review_head_oid"] != selected["head_revision"]:
            errors.append("target_selected_head")
        if revision is not None:
            for key, expected in (("provider", a["provider"]), ("repository_binding_ref", a["repository_binding_ref"]),
                                  ("provider_review_id", selected["provider_review_id"]), ("head_revision", selected["head_revision"])):
                if revision[key] != expected:
                    errors.append("revision_" + key)
        for key in ("command_id", "command_instance_id", "provider", "repository_binding_ref", "expected_binding_generation",
                    "automation_binding_ref", "expected_automation_binding_generation"):
            if (key in r, r.get(key)) != (key in a, a.get(key)):
                errors.append("result_" + key)
        receipt = None
        if r["receipt_ref"] is not None:
            receipt = _read(resolve_record, r["receipt_ref"], "command_receipt", errors, owner=True, canon_root=canon_root)
        if receipt is not None:
            for key in ("command_id", "command_instance_id", "provider", "repository_binding_ref",
                        "expected_binding_generation", "requested_authority_role", "effective_authority_role",
                        "credential_or_grant_ref", "idempotency_key", "automation_binding_ref",
                        "expected_automation_binding_generation"):
                if (key in receipt, receipt.get(key)) != (key in a, a.get(key)):
                    errors.append("receipt_" + key)
            for key in ("operation_id", "outcome", "observable_work_id", "completed_at_utc", "event_refs"):
                if receipt[key] != r[key]:
                    errors.append("receipt_" + key)
            if receipt["recovery_actions"] != r["recovery_action_ids"]:
                errors.append("receipt_recovery_actions")
            if receipt["review_revision_ref"] != a["target"]["review_revision_ref"]:
                errors.append("receipt_review_revision")
        if r["outcome"] != "accepted" and receipt is None:
            errors.append("terminal_receipt_missing")
        try:
            if datetime.fromisoformat(r["completed_at_utc"].replace("Z", "+00:00")) < datetime.fromisoformat(a["requested_at_utc"].replace("Z", "+00:00")):
                errors.append("result_before_request")
        except (ValueError, TypeError):
            errors.append("result_time")
        observation = None
        if r["terminal_provider_result_ref"] is not None:
            observation = _read(resolve_record, r["terminal_provider_result_ref"], "observation", errors, canon_root=canon_root)
        if r["outcome"] == "succeeded" and observation is None:
            errors.append("success_without_provider_observation")
        if observation is not None:
            for key, expected in (("original_request_ref", output["original_request_ref"]), ("selection", selected),
                                  ("review_revision_ref", a["target"]["review_revision_ref"])):
                if observation[key] != expected:
                    errors.append("observation_" + key)
            for key in ("command_id", "command_instance_id", "provider", "repository_binding_ref"):
                if observation[key] != a[key]:
                    errors.append("observation_" + key)
            if observation["operation_id"] != r["operation_id"]:
                errors.append("observation_operation")
            if observation["target_ref"] != r["target_ref"]:
                errors.append("observation_target")
            if r["outcome"] == "succeeded" and observation["outcome"] != "applied":
                errors.append("success_without_applied_decision")
            if r["outcome"] == "effect_unknown" and observation["outcome"] == "applied":
                errors.append("unknown_with_applied_decision")
    if original_request != original or result != output:
        errors.append("input_mutated_during_resolution")
    return errors


def fixture_dependencies(wrapper):
    """Explicit synthetic static reader; not provider/permission authentication."""
    records = deepcopy(wrapper["records"])
    return {"resolve_record": lambda ref: deepcopy(records[ref])}


def review_decision_semantic_failures(definition, value, *, canon_root=None):
    if definition != "fixture_case":
        raise ValueError("fixture-only composition required")
    return result_failures(value["request"], value["result"], canon_root=canon_root, **fixture_dependencies(value))
