"""Finite Git-three static original/selected-effect custody, not native admission.

Resolvers supply actual retained owner values. Fixtures are explicit synthetic
doubles; native Permissions/FileSafe/lease admission, Git effect verification and
issuer/receipt authenticity are required by existing owners, not proved here.
"""
from copy import deepcopy
from datetime import datetime
import json
import os
from pathlib import Path
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
COMMANDS = {"commit": "cmd.git.commit",
            "stash_create": "cmd.source_control.stash.create",
            "branch_create": "cmd.source_control.branch.create"}


def shape_failures(definition, value, *, owner=False, canon_root=None):
    root = Path(canon_root or os.environ.get("PM_CANON_ROOT", ROOT))
    source = json.loads((root / "Plans/source_control_contracts.schema.json").read_text())
    companion = json.loads((ROOT / "Plans/git_selected_three.schema.json").read_text())
    registry = Registry().with_resources([(x["$id"], Resource.from_contents(x))
                                         for x in (source, companion)])
    schema = source if owner else companion
    return ["shape:" + e.message for e in Draft202012Validator(
        {"$ref": schema["$id"] + "#/$defs/" + definition},
        registry=registry).iter_errors(value)]


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


def _request(request, resolve, errors, canon_root):
    errors.extend(shape_failures("request", request, canon_root=canon_root))
    if errors:
        return None
    selection = request["selection"]
    if request["command_id"] != COMMANDS[selection["kind"]]:
        errors.append("selected_command")
    context = _read(resolve, request["repository_context_ref"], "repository_context",
                    errors, owner=True, canon_root=canon_root)
    lease = _read(resolve, request["writer_lease_ref"], "writer_lease",
                  errors, owner=True, canon_root=canon_root)
    if context is not None:
        if context["scm_backend"] != "git" or context["revision"] != request["expected_revision"]:
            errors.append("original_git_revision")
        if context["writer_lease_ref"] != request["writer_lease_ref"]:
            errors.append("original_writer_ref")
    if lease is not None:
        if lease["scm_backend"] != "git":
            errors.append("lease_backend")
        if lease["generation"] != request["writer_lease_generation"] or lease["epoch"] != request["writer_lease_epoch"]:
            errors.append("lease_generation")
        if context is not None and any(lease[k] != context[k] for k in ("repo_id", "workspace_id")):
            errors.append("lease_context")
    length = 40 if request["expected_revision"]["object_format"] == "sha1" else 64
    for field in ("base", "expected_index_tree"):
        if field in selection and len(selection[field]) != length:
            errors.append("selected_object_format")
    return context


def result_failures(original_request, result, *, resolve_record, canon_root=None):
    """Pure static joins over entry snapshots; never execute or infer admission."""
    request_snapshot, result_snapshot = deepcopy(original_request), deepcopy(result)
    errors = []
    context = _request(request_snapshot, resolve_record, errors, canon_root)
    errors.extend(shape_failures("result", result_snapshot, canon_root=canon_root))
    if not errors:
        a, r = request_snapshot, result_snapshot
        retained = _read(resolve_record, r["original_request_ref"], "request", errors, canon_root=canon_root)
        if retained != a:
            errors.append("original_request")
        for key in ("command_id", "command_instance_id", "idempotency_key", "return_context"):
            if r[key] != a[key]:
                errors.append("result_" + key)
        receipt = _read(resolve_record, r["operation_receipt_ref"], "operation_receipt",
                        errors, owner=True, canon_root=canon_root)
        if receipt is not None:
            for key, expected in (("command_instance_id", a["command_instance_id"]),
                                  ("repository_context_ref", a["repository_context_ref"]),
                                  ("scm_backend", "git"), ("before_revision", a["expected_revision"]),
                                  ("writer_lease_ref", a["writer_lease_ref"])):
                if receipt[key] != expected:
                    errors.append("receipt_" + key)
            try:
                if datetime.fromisoformat(receipt["completed_at_utc"].replace("Z", "+00:00")) < datetime.fromisoformat(a["requested_at_utc"].replace("Z", "+00:00")):
                    errors.append("receipt_before_request")
            except (ValueError, TypeError):
                errors.append("receipt_time")
            if receipt["outcome"] == "succeeded" and r["native_effect_ref"] is None:
                errors.append("success_without_native_effect")
            after = receipt["after_revision"]
            if receipt["outcome"] == "succeeded" and after is None:
                errors.append("success_without_after_revision")
            if after is not None and (after.get("kind") != "git" or
                                      after.get("object_format") != a["expected_revision"]["object_format"]):
                errors.append("receipt_after_backend_or_format")
        effect = None
        if r["native_effect_ref"] is not None:
            effect = _read(resolve_record, r["native_effect_ref"], "effect", errors, canon_root=canon_root)
        if effect is not None:
            for key, expected in (("original_request_ref", r["original_request_ref"]),
                                  ("command_instance_id", a["command_instance_id"]),
                                  ("repository_context_ref", a["repository_context_ref"]),
                                  ("applied_selection", a["selection"])):
                if effect[key] != expected:
                    errors.append("effect_" + key)
            if receipt is not None:
                if effect["operation_id"] != receipt["operation_id"]:
                    errors.append("effect_operation")
                if receipt["outcome"] == "succeeded" and effect["completion"] != "completed":
                    errors.append("success_partial_or_unknown_effect")
            length = 40 if a["expected_revision"]["object_format"] == "sha1" else 64
            if len(effect["result_object"]) != length:
                errors.append("effect_object_format")
            if effect["completion"] == "completed":
                if a["selection"]["kind"] == "branch_create" and effect["result_object"] != a["selection"]["base"]:
                    errors.append("branch_base_result")
                if a["selection"]["kind"] == "commit" and receipt is not None:
                    after = receipt["after_revision"]
                    if after is None or after.get("kind") != "git" or after["commit_oid"] != effect["result_object"]:
                        errors.append("commit_after_revision")
    if original_request != request_snapshot or result != result_snapshot:
        errors.append("input_mutated_during_resolution")
    return errors


def fixture_dependencies(wrapper):
    """Synthetic fixture reader, never native permission/effect authentication."""
    records = deepcopy(wrapper["records"])
    return {"resolve_record": lambda ref: deepcopy(records[ref])}


def git_selected_semantic_failures(definition, value, *, canon_root=None):
    if definition != "fixture_case":
        raise ValueError("fixture-only composition definition required")
    return result_failures(value["request"], value["result"], canon_root=canon_root,
                           **fixture_dependencies(value))
