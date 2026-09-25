"""Selected request/effect/receipt joins for the two public Git remote commands.

This module performs no native admission, permission grant, SCM invocation or
currentness proof. resolve_record must read the caller's actual retained owner
values; the fixture readers below are explicitly synthetic static doubles.
Existing native admission, publication-target generation, lease and receipt
authentication remain independent prerequisites. The Git adapter keeps its own
command identity and sole planned handlers::git::fetch / handlers::git::push; it
composes the existing Source Control owners and introduces no second publication
preview/reconciliation owner.
"""
from copy import deepcopy
from datetime import datetime
import json
import os
from pathlib import Path

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

COMMANDS = {"cmd.git.fetch": "fetch", "cmd.git.push": "push"}
ROUTE = {"fetch": "cmd.git.fetch", "push": "cmd.git.push"}
COMPANION = "Plans/git_remote_selected.schema.json"
SCS_REL = "Plans/source_control_contracts.schema.json"
FORGE_REL = "Plans/forge_review_create_selected_contracts.schema.json"
SCS = "https://puppetmaster.local/schemas/source-control/1.0.0/source_control_contracts.schema.json"
FORGE = ("https://puppetmaster.local/schemas/forge-review-create-selected/1.0.0/"
         "forge_review_create_selected_contracts.schema.json")
INTEGRATION_REL = "Plans/forge_integration_contracts.schema.json"
JJ_REL = "Plans/jujutsu_integration_contracts.schema.json"
LOCAL = Path(__file__).resolve().parents[1]
OWNER_CHECK = {"fetch": "fetch", "push": "publish"}
NO_FORCE_GUARD = {"force_requested": False, "expected_head_ref": None, "lease_ref": None,
                  "dangerous_action_policy_ref": None}
OID = {"sha1": 40, "sha256": 64}


def _root(canon_root):
    return Path(canon_root or os.environ.get("PM_CANON_ROOT") or LOCAL)


def _registry(canon_root):
    """Register this companion plus the exact owner schemas it consumes."""
    root = _root(canon_root)
    registry = Registry()
    for rel in (COMPANION, SCS_REL, FORGE_REL, INTEGRATION_REL, JJ_REL):
        document = json.loads((root / rel).read_text(encoding="utf-8"))
        registry = registry.with_resource(document["$id"], Resource.from_contents(document))
    return registry


def shape_failures(definition, value, *, canon_root=None, owner=None):
    """Validate one named definition; owner names a schema other than this companion."""
    root = _root(canon_root)
    if owner is None:
        document = json.loads((root / COMPANION).read_text(encoding="utf-8"))
    else:
        document = json.loads((root / owner).read_text(encoding="utf-8"))
    validator = Draft202012Validator(
        {"$ref": document["$id"] + "#/$defs/" + definition}, registry=_registry(canon_root))
    return ["shape:" + error.message for error in validator.iter_errors(value)]


def _read(resolve, ref, definition, errors, canon_root=None, owner=None):
    try:
        value = resolve(ref)
        failures = shape_failures(definition, value, canon_root=canon_root, owner=owner)
    except Exception as exc:
        errors.append("unresolved:" + str(ref) + ":" + type(exc).__name__)
        return None
    if failures:
        errors.extend(failures)
        return None
    return value


def _time(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _oid(value, length):
    return isinstance(value, str) and len(value) == length and all(c in "0123456789abcdef" for c in value)


def _resolution_failures(resolve, ref, definition, errors, canon_root=None, owner=None):
    """Resolve a ref whose only contract here is that it resolves to the named shape."""
    try:
        value = resolve(ref)
    except Exception as exc:
        errors.append("unresolved:" + str(ref) + ":" + type(exc).__name__)
        return None
    failures = shape_failures(definition, value, canon_root=canon_root, owner=owner)
    if failures:
        errors.extend(failures)
        return None
    return value


def _request_failures(request, *, resolve_record, canon_root=None, request_ref=None):
    errors = shape_failures("request", request, canon_root=canon_root)
    if errors:
        return errors
    command_id, selection = request["command_id"], request["selection"]
    route = COMMANDS[command_id]
    if selection["kind"] != route:
        return errors + ["git_remote_selection_command"]
    length = OID[request["expected_revision"]["object_format"]]
    if route == "push":
        for head in selection["expected_remote_heads"]:
            if head["expected_oid"] is not None and not _oid(head["expected_oid"], length):
                errors.append("git_remote_oid_object_format")
        guard = selection["force_guard"]
        if guard["force_requested"] and guard["lease_ref"] is None:
            errors.append("git_remote_force_lease")
    context = _read(resolve_record, request["repository_context_ref"], "repository_context", errors,
                    canon_root, SCS_REL)
    if context is not None:
        if context["scm_backend"] != "git" or context["revision"] != request["expected_revision"]:
            errors.append("git_remote_context_revision")
        if context["writer_lease_ref"] != request["writer_lease_ref"]:
            errors.append("git_remote_context_writer_lease")
    binding = _read(resolve_record, request["target_binding_ref"], "target_binding", errors, canon_root)
    if binding is None:
        return sorted(set(errors))
    for key, expected in (("command_id", command_id), ("command_instance_id", request["command_instance_id"]),
                          ("operation_id", request["operation_id"]),
                          ("repository_context_ref", request["repository_context_ref"]),
                          ("expected_revision", request["expected_revision"]),
                          ("selection", selection)):
        if binding[key] != expected:
            errors.append("git_remote_binding_" + key)
    target = _read(resolve_record, binding["remote_operation_target_ref"], "remote_operation_target",
                   errors, canon_root, SCS_REL)
    if target is not None:
        if target["operation_id"] != request["operation_id"]:
            errors.append("git_remote_target_operation")
        if context is not None and (target["repository_id"] != context["repo_id"]
                                    or target["project_id"] != context["lineage"]["project_id"]):
            errors.append("git_remote_target_repository")
        try:
            if resolve_record(target["revision_ref"]) != request["expected_revision"]:
                errors.append("git_remote_target_revision")
        except Exception:
            errors.append("git_remote_target_revision_unresolved:" + str(target["revision_ref"]))
        ids = [row["target_id"] for row in target["push_targets"]]
        if len(ids) != len(set(ids)):
            errors.append("git_remote_duplicate_target")
        if route == "fetch":
            if target["fetch_url"] != selection["fetch_url"] or target["remote_id"] != selection["remote_id"]:
                errors.append("git_remote_fetch_target")
            if target["selection_snapshot_generation"] != selection["remote_selection_generation"]:
                errors.append("git_remote_target_generation")
        else:
            if target["selection_snapshot_generation"] != selection["target_selection_generation"]:
                errors.append("git_remote_target_generation")
            heads = selection["expected_remote_heads"]
            keys = [(row["target_id"], row["ref_name"]) for row in heads]
            if len(keys) != len(set(keys)) or {row["target_id"] for row in heads} != set(ids):
                errors.append("git_remote_head_target_set")
            if selection["force_guard"]["force_requested"] \
                    and selection["selected_force_target_id"] not in ids:
                # The selected guard names a target explicitly. Head and lease
                # references are opaque and cannot supply this identity.
                errors.append("git_remote_force_target")
            for row in target["push_targets"]:
                destinations = [refspec.lstrip("+").split(":")[-1] for refspec in row["refspecs"]]
                if set(destinations) != {head["ref_name"] for head in heads
                                         if head["target_id"] == row["target_id"]}:
                    errors.append("git_remote_head_ref_set")
    capability = _read(resolve_record, binding["capability_ref"], "effective_operation_capability",
                       errors, canon_root, SCS_REL)
    if capability is not None:
        if capability["operation"] != OWNER_CHECK[route] \
                or capability["repository_context_ref"] != request["repository_context_ref"] \
                or capability["support_state"] != "supported" or capability["availability"] != "ready" \
                or capability["freshness"]["state"] != "current":
            errors.append("git_remote_capability_admission")
        elif target is not None and capability["remote_binding_ref"] != target["remote_id"]:
            errors.append("git_remote_capability_remote")
    writer = _read(resolve_record, binding["writer_lease_ref"], "writer_lease", errors, canon_root, SCS_REL)
    if writer is not None:
        if writer["lease_id"] != binding["writer_lease_ref"] or writer["state"] != "active" \
                or (context is not None and any(writer[key] != context[key]
                                                for key in ("repo_id", "workspace_id", "scm_backend"))):
            errors.append("git_remote_lease_admission")
        try:
            if not _time(writer["acquired_at_utc"]) <= _time(request["requested_at_utc"]) \
                    < _time(writer["expires_at_utc"]):
                errors.append("git_remote_lease_time")
        except (ValueError, TypeError, KeyError):
            errors.append("git_remote_lease_time_invalid")
    credential = _read(resolve_record, binding["credential_lease_ref"], "credential_lease", errors,
                       canon_root, SCS_REL)
    if credential is not None:
        if credential["credential_lease_id"] != binding["credential_lease_ref"] \
                or credential["operation_id"] != request["operation_id"] \
                or credential["revocation_state"] != "active" \
                or (context is not None and credential["repo_id"] != context["repo_id"]):
            errors.append("git_remote_credential_admission")
        if route == "fetch" and credential["transport"] != selection["transport"]:
            errors.append("git_remote_credential_transport")
        try:
            if not _time(credential["issued_at_utc"]) <= _time(request["requested_at_utc"]) \
                    < _time(credential["expires_at_utc"]):
                errors.append("git_remote_credential_time")
        except (ValueError, TypeError, KeyError):
            errors.append("git_remote_credential_time_invalid")
    toolchain = _read(resolve_record, binding["native_toolchain_ref"], "native_toolchain_identity",
                      errors, canon_root, SCS_REL)
    if toolchain is not None and context is not None:
        for key in ("execution_host_id", "execution_environment_id"):
            if toolchain[key] != context["lineage"][key]:
                errors.append("git_remote_toolchain_scope")
    if route == "push":
        effect = _read(resolve_record, binding["publication_reconciliation_ref"],
                       "external_effect_reconciliation", errors, canon_root, SCS_REL)
        if effect is not None:
            if effect["operation_kind"] != "push" or effect["operation_id"] != request["operation_id"]:
                errors.append("git_remote_reconciliation_operation")
            if target is not None and effect["intended_target_ref"] != selection["remote_target_ref"] \
                    and effect["intended_target_ref"] not in [row["target_id"] for row in target["push_targets"]]:
                errors.append("git_remote_reconciliation_target")
            if effect["force_guard"] != selection["force_guard"]:
                errors.append("git_remote_force_guard")
            if effect["blind_retry_allowed"] or effect["successful_cli_exit_proves_remote_state"] \
                    or not effect["accepted_request_distinct_from_durable_outcome"]:
                errors.append("git_remote_reconciliation_policy")
    retained_force_guards = []
    for ref in binding["preview_refs"]:
        if route == "fetch":
            preview = _read(resolve_record, ref, "fetch_preview", errors, canon_root)
            if preview is None:
                continue
            for key, expected in (("command_instance_id", request["command_instance_id"]),
                                  ("operation_id", request["operation_id"]),
                                  ("repository_context_ref", request["repository_context_ref"]),
                                  ("expected_revision", request["expected_revision"]),
                                  ("selection", selection),
                                  ("remote_operation_target_ref", binding["remote_operation_target_ref"])):
                if preview[key] != expected:
                    errors.append("git_remote_preview_" + key)
            if request_ref is not None and preview["original_request_ref"] != request_ref:
                errors.append("git_remote_preview_original")
            remote_refs = {row["ref_name"] for row in preview["remote_refs"]}
            if remote_refs != set(selection["refs"]):
                errors.append("git_remote_preview_ref_set")
        else:
            preview = _read(resolve_record, ref, "git_preview", errors, canon_root, FORGE_REL)
            if preview is None:
                continue
            for key, expected in (("preview_ref", ref),
                                  ("command_instance_id", request["command_instance_id"]),
                                  ("operation_id", request["operation_id"]),
                                  ("repository_context_ref", request["repository_context_ref"]),
                                  ("expected_revision", request["expected_revision"]),
                                  ("remote_operation_target_ref", binding["remote_operation_target_ref"]),
                                  ("target_selection_generation", selection["target_selection_generation"])):
                if preview[key] != expected:
                    errors.append("git_remote_preview_" + key)
            selected_force_target = selection["selected_force_target_id"]
            expected_guard = (selection["force_guard"]
                              if selected_force_target == preview["target_id"]
                              else NO_FORCE_GUARD)
            if preview["force_guard"] != expected_guard:
                errors.append("git_remote_force_guard")
            if selected_force_target == preview["target_id"] \
                    and preview["force_guard"] == selection["force_guard"]:
                retained_force_guards.append(ref)
            if request_ref is not None and preview["original_request_ref"] != request_ref:
                errors.append("git_remote_preview_original")
            if target is not None:
                rows = [row for row in target["push_targets"] if row["target_id"] == preview["target_id"]]
                if len(rows) != 1 or rows[0]["preview_ref"] != ref \
                        or rows[0]["push_url"] != preview["push_url"] \
                        or rows[0]["refspecs"] != preview["refspecs"]:
                    errors.append("git_remote_preview_refspecs")
            for mapping in preview["mappings"]:
                if not _oid(mapping["source_object"], length) or not _oid(mapping["proposed_head"], length):
                    errors.append("git_remote_oid_object_format")
                head = mapping["expected_head"]
                if (head["state"] == "known") != (head["object_id"] is not None) \
                        or (head["object_id"] is not None and not _oid(head["object_id"], length)):
                    errors.append("git_remote_expected_head")
    if route == "push" and selection["force_guard"]["force_requested"] \
            and len(retained_force_guards) != 1:
        # Exactly the selected target must carry the force guard. No other
        # preview may borrow it or silently drop it.
        errors.append("git_remote_force_guard")
    return sorted(set(errors))


def _result_failures(original_request, result, *, resolve_record, canon_root=None):
    """Join a separately supplied original request; never trust an echoed selection."""
    errors = shape_failures("result", result, canon_root=canon_root)
    if errors:
        return errors
    original_ref = result["original_request_ref"]
    errors += _request_failures(original_request, resolve_record=resolve_record, canon_root=canon_root,
                                request_ref=original_ref)
    if errors:
        return sorted(set(errors))
    route = COMMANDS[original_request["command_id"]]
    resolved = _read(resolve_record, original_ref, "request", errors, canon_root)
    if resolved is not None and resolved != original_request:
        errors.append("git_remote_result_original_request")
    binding = _read(resolve_record, original_request["target_binding_ref"], "target_binding", errors,
                    canon_root)
    if binding is None:
        return sorted(set(errors))
    for key, expected in (("original_request_ref", original_ref),
                          ("command_id", original_request["command_id"]),
                          ("command_instance_id", original_request["command_instance_id"]),
                          ("operation_id", original_request["operation_id"]),
                          ("idempotency_key", original_request["idempotency_key"]),
                          ("target_binding_ref", original_request["target_binding_ref"]),
                          ("preview_refs", binding["preview_refs"])):
        if result[key] != expected:
            errors.append("git_remote_result_" + key)
    length = OID[original_request["expected_revision"]["object_format"]]
    receipt = None
    if result["operation_receipt_ref"] is not None:
        receipt = _read(resolve_record, result["operation_receipt_ref"], "operation_receipt", errors,
                        canon_root, SCS_REL)
        if receipt is not None:
            for key, expected in (("receipt_id", result["operation_receipt_ref"]),
                                  ("operation_id", original_request["operation_id"]),
                                  ("command_instance_id", original_request["command_instance_id"]),
                                  ("repository_context_ref", original_request["repository_context_ref"]),
                                  ("scm_backend", "git"),
                                  ("before_revision", original_request["expected_revision"]),
                                  ("writer_lease_ref", original_request["writer_lease_ref"]),
                                  ("credential_lease_ref", original_request["credential_lease_ref"]),
                                  ("outcome", result["outcome"]),
                                  ("observable_work_id", result["observable_work_id"])):
                if receipt[key] != expected:
                    errors.append("git_remote_receipt_" + key)
            if receipt["event_refs"]:
                errors.append("git_remote_event_claim")
            if receipt["degradation"]["allowed_action_ids"]:
                errors.append("git_remote_receipt_action_claim")
            try:
                if not _time(original_request["requested_at_utc"]) <= _time(receipt["completed_at_utc"]) \
                        <= _time(result["observed_at_utc"]):
                    errors.append("git_remote_receipt_time")
            except (ValueError, TypeError, KeyError):
                errors.append("git_remote_receipt_time_invalid")
            after = receipt["after_revision"]
            if after is not None and (after["object_format"] != original_request["expected_revision"]["object_format"]
                                      or not _oid(after["commit_oid"], length)):
                errors.append("git_remote_oid_object_format")
    elif result["outcome"] != "accepted":
        errors.append("git_remote_terminal_receipt")
    observations = []
    for ref in result["observation_refs"]:
        if route == "fetch":
            observations.append(_read(resolve_record, ref, "fetch_observation", errors, canon_root))
        else:
            observations.append(_read(resolve_record, ref, "git_observation", errors, canon_root, FORGE_REL))
    observations = [row for row in observations if row is not None]
    if route == "fetch":
        for observation in observations:
            for key, expected in (("observation_id", None), ("original_request_ref", original_ref),
                                  ("command_instance_id", original_request["command_instance_id"]),
                                  ("operation_id", original_request["operation_id"]),
                                  ("target_binding_ref", original_request["target_binding_ref"]),
                                  ("selection", original_request["selection"])):
                if key == "observation_id":
                    continue
                if observation[key] != expected:
                    errors.append("git_remote_observation_" + key)
            if observation["preview_ref"] not in binding["preview_refs"]:
                errors.append("git_remote_observation_preview")
            preview = _read(resolve_record, observation["preview_ref"], "fetch_preview", errors, canon_root)
            states = [row["effect_state"] for row in observation["ref_updates"]]
            if not observation["ref_updates"] and observation["effect_state"] in ("known_applied", "unknown"):
                errors.append("git_remote_fetch_ref_updates")
            if observation["effect_state"] == "unknown" and "unknown" not in states:
                errors.append("git_remote_fetch_unknown")
            elif observation["effect_state"] == "known_applied" and "known_applied" not in states:
                errors.append("git_remote_fetch_applied")
            if "known_applied" in states and not observation["fetched_object_oids"]:
                errors.append("git_remote_fetch_noop_claim")
            if "known_applied" not in states and observation["fetched_object_oids"]:
                errors.append("git_remote_fetch_noop_claim")
            if observation["fetched_object_oids"] or any(
                    row["after_oid"] is not None for row in observation["ref_updates"]):
                if any(row["after_oid"] is not None and not _oid(row["after_oid"], length)
                       for row in observation["ref_updates"]) \
                        or any(not _oid(oid, length) for oid in observation["fetched_object_oids"]):
                    errors.append("git_remote_oid_object_format")
            if preview is not None:
                all_local = all(row["already_local"] for row in preview["remote_refs"])
                if all_local and observation["fetched_object_oids"]:
                    errors.append("git_remote_fetch_noop_claim")
                if all_local and observation["effect_state"] == "known_applied":
                    errors.append("git_remote_fetch_noop_claim")
        unknown_truth = [row for row in observations
                         if row["effect_state"] == "unknown"
                         or row["completion"] in ("unknown", "partial")
                         or any(update["effect_state"] == "unknown" for update in row["ref_updates"])]
        if unknown_truth and (result["effect_state"] != "effect_unknown"
                              or result["outcome"] not in ("effect_unknown", "recovery_required")):
            errors.append("git_remote_unknown_effect")
    else:
        target = _read(resolve_record, binding["remote_operation_target_ref"],
                       "remote_operation_target", errors, canon_root, SCS_REL)
        expected_targets = {head["target_id"] for head in original_request["selection"]["expected_remote_heads"]}
        seen = {}
        for observation in observations:
            if observation["original_request_ref"] != original_ref \
                    or observation["operation_id"] != original_request["operation_id"]:
                errors.append("git_remote_observation_original")
            if observation["preview_ref"] not in binding["preview_refs"]:
                errors.append("git_remote_observation_preview")
            seen[observation["target_id"]] = observation
            preview = _read(resolve_record, observation["preview_ref"], "git_preview", errors, canon_root,
                            FORGE_REL)
            if preview is not None and (observation["target_id"] != preview["target_id"]
                                        or observation["mappings"] != preview["mappings"]):
                errors.append("git_remote_observation_mapping")
            if observation["effect_state"] == "known_applied":
                if observation["outcome"] != "succeeded" or observation["native_receipt_ref"] is None:
                    errors.append("git_remote_observation_evidence")
                if preview is not None:
                    proposed = {row["destination_ref"]: row["proposed_head"] for row in preview["mappings"]}
                    observed_heads = {}
                    for head in observation["observed_heads"]:
                        if head["destination_ref"] in observed_heads:
                            errors.append("git_remote_observed_head_set")
                        observed_heads[head["destination_ref"]] = head["head"]
                    # Success needs the complete proposed destination set, not only the
                    # heads that happen to be present.
                    if set(observed_heads) != set(proposed):
                        errors.append("git_remote_observed_head_set")
                    for destination, head in observed_heads.items():
                        if head["object_id"] != proposed.get(destination) or head["state"] != "known":
                            errors.append("git_remote_observed_head")
                if target is not None and target["push_targets"]:
                    rows = [row for row in target["push_targets"] if row["target_id"] == observation["target_id"]]
                    if rows and rows[0]["outcome"] not in ("succeeded", "outcome_unknown"):
                        errors.append("git_remote_reconciliation_success")
        if result["outcome"] != "accepted" and set(seen) != expected_targets:
            errors.append("git_remote_observation_target_set")
        success = [row for row in observations if row["effect_state"] == "known_applied"]
        unknown = [row for row in observations if row["effect_state"] == "unknown"]
        effect = _read(resolve_record, binding["publication_reconciliation_ref"],
                       "external_effect_reconciliation", errors, canon_root, SCS_REL)
        if success and effect is not None and effect["state"] != "observed_success":
            errors.append("git_remote_reconciliation_success")
        if success and effect is not None and not effect["exact_reconciliation_evidence_refs"]:
            errors.append("git_remote_reconciliation_evidence")
        if unknown or [row for row in observations if row["outcome"] == "outcome_unknown"]:
            if result["effect_state"] != "effect_unknown" or result["outcome"] != "effect_unknown":
                errors.append("git_remote_unknown_effect")
            if effect is not None and effect["state"] not in ("outcome_unknown", "reconciling", "blocked_stale"):
                errors.append("git_remote_reconciliation_unknown")
        if result["outcome"] == "succeeded" and (unknown or len(success) != len(observations)
                                                 or not success):
            errors.append("git_remote_false_complete")
        if result["outcome"] != "accepted" and not observations:
            errors.append("git_remote_observation_target_set")
        if result["outcome"] == "accepted" and (observations or receipt is not None
                                                or result["observable_work_id"] is None):
            errors.append("git_remote_accepted_terminal")
    if result["effect_state"] == "effect_unknown" or result["outcome"] in ("recovery_required",
                                                                          "effect_unknown"):
        if result["error_ref"] is None:
            errors.append("git_remote_unknown_effect_without_owner_error")
    if result["error_ref"] is not None:
        error = _read(resolve_record, result["error_ref"], "error", errors, canon_root)
        if error is not None:
            for key, expected in (("command_instance_id", original_request["command_instance_id"]),
                                  ("command_id", original_request["command_id"]),
                                  ("repository_context_ref", original_request["repository_context_ref"]),
                                  ("effect_state", result["effect_state"])):
                if error[key] != expected:
                    errors.append("git_remote_error_" + key)
            if result["effect_state"] == "effect_unknown" and (error["retry_allowed"]
                                                              or "retry" in error["safe_next_actions"]):
                errors.append("git_remote_blind_retry")
            if result["effect_state"] != "effect_unknown" and error["effect_state"] == "effect_unknown":
                errors.append("git_remote_error_effect")
    if (result["error_ref"] is None) != (result["error_projection_ref"] is None):
        errors.append("git_remote_error_projection_presence")
    return sorted(set(errors))


def _pinned_call(function, inputs, resolve_record, canon_root):
    originals = tuple(inputs)
    snapshots = deepcopy(originals)
    observed = []

    def watched(ref):
        # Keep the live owner value itself, not only its copy: later callbacks
        # may mutate an already-returned record in place.
        value = resolve_record(ref)
        observed.append((value, deepcopy(value)))
        return value

    errors = function(*originals, resolve_record=watched, canon_root=canon_root)
    if tuple(originals) != snapshots or any(value != snapshot for value, snapshot in observed):
        errors = list(errors) + ["git_remote_inputs_mutated"]
    return sorted(set(errors))


def request_failures(request, *, resolve_record, canon_root=None):
    return _pinned_call(_request_failures, (request,), resolve_record, canon_root)


def result_failures(original_request, result, *, resolve_record, canon_root=None):
    return _pinned_call(_result_failures, (original_request, result), resolve_record, canon_root)


def fixture_dependencies(wrapper):
    """Explicit synthetic retained-value reader. Not issuer/native authentication."""
    records = deepcopy(wrapper["records"])
    return {"resolve_record": lambda ref: deepcopy(records[ref])}


def git_remote_semantic_failures(definition, value, *, canon_root=None):
    """Fixture-only composition; bare runtime records are joined by the adapter."""
    if definition == "request":
        return _request_self_failures(value)
    if definition == "request_case":
        return request_failures(value["request"], resolve_record=fixture_dependencies(value)["resolve_record"],
                                canon_root=canon_root)
    if definition == "result_case":
        dependencies = fixture_dependencies(value)
        return result_failures(value["request"], value["result"],
                               resolve_record=dependencies["resolve_record"], canon_root=canon_root)
    if definition in ("target_binding", "preview", "observation", "result", "error"):
        return []
    raise ValueError("fixture definition required")


def _request_self_failures(request):
    """Join-free request semantics for a bare record: no resolver is available."""
    errors = shape_failures("request", request)
    if errors:
        return errors
    route = COMMANDS[request["command_id"]]
    if request["selection"]["kind"] != route:
        return ["git_remote_selection_command"]
    length = OID[request["expected_revision"]["object_format"]]
    if route == "push":
        for head in request["selection"]["expected_remote_heads"]:
            if head["expected_oid"] is not None and not _oid(head["expected_oid"], length):
                errors.append("git_remote_oid_object_format")
    return sorted(set(errors))
