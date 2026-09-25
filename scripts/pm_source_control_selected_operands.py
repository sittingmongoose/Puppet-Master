"""Static selected-operand custody joins for six existing neutral commands.

This module performs no native admission, permission grant, SCM invocation or
currentness proof. resolve_record must read the caller's actual retained owner
values; fixture readers below are explicitly synthetic static doubles. Existing
native admission and receipt authentication remain independent prerequisites.
"""
from copy import deepcopy
from datetime import datetime
import json
import os
from pathlib import Path
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

COMMANDS = {
    "backend_select": "cmd.source_control.backend.select",
    "fetch": "cmd.source_control.remote.fetch",
    "publish": "cmd.source_control.remote.publish",
    "diff": "cmd.source_control.diff.open",
    "history": "cmd.source_control.history.open",
    "workspace_remove": "cmd.source_control.workspace.remove",
}
PREVIEW = {"backend_select", "publish", "workspace_remove"}
SOURCE = "https://puppetmaster.local/schemas/source-control/1.0.0/source_control_contracts.schema.json"
LOCAL = Path(__file__).resolve().parents[1]


def shape_failures(definition, value, *, canon_root=None, owner=False):
    root = Path(canon_root or os.environ.get("PM_CANON_ROOT", LOCAL))
    source = json.loads((root / "Plans/source_control_contracts.schema.json").read_text())
    companion = json.loads((LOCAL / "Plans/source_control_selected_operands.schema.json").read_text())
    registry = Registry().with_resources([
        (source["$id"], Resource.from_contents(source)),
        (companion["$id"], Resource.from_contents(companion)),
    ])
    schema = source if owner else companion
    validator = Draft202012Validator({"$ref": schema["$id"] + "#/$defs/" + definition}, registry=registry)
    return ["shape:" + e.message for e in validator.iter_errors(value)]


def _read(resolve, ref, definition, errors, canon_root=None, owner=False):
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


def _request_failures(request, *, resolve_record, canon_root=None):
    errors = shape_failures("request", request, canon_root=canon_root)
    if errors:
        return errors
    authority, selection = request["authority"], request["selection"]
    scope, kind = authority["scope"], selection["kind"]
    if scope["command_id"] != COMMANDS[kind]:
        errors.append("selected_command_mismatch")
    required = ("repo_id", "scm_backend", "workspace_id", "expected_revision",
                "currentness_generation", "repository_context_ref")
    if any(key not in scope for key in required):
        return errors + ["selected_scope_missing"]
    if kind not in {"diff", "history"} and "writer_lease_ref" not in scope:
        errors.append("selected_writer_missing")
    if request["repository_context_ref"] != scope["repository_context_ref"]:
        errors.append("selected_context_ref_mismatch")
    context = _read(resolve_record, request["repository_context_ref"],
                    "repository_context", errors, canon_root, True)
    if context is not None:
        for key in ("repo_id", "scm_backend", "workspace_id"):
            if context[key] != scope[key]:
                errors.append("context_" + key)
        if context["revision"] != scope["expected_revision"]:
            errors.append("context_revision")
        if "writer_lease_ref" in scope and context["writer_lease_ref"] != scope["writer_lease_ref"]:
            errors.append("context_writer_lease")
        for key, value in scope["lineage"].items():
            if context["lineage"].get(key) != value:
                errors.append("context_lineage_" + key)
        if context["forge_binding"] != scope.get("forge_binding", context["forge_binding"]):
            errors.append("context_forge_binding")
    if (request["preview_ref"] is not None) != (kind in PREVIEW):
        errors.append("preview_presence")
    if request["preview_ref"] is not None:
        preview = _read(resolve_record, request["preview_ref"], "preview", errors, canon_root)
        if preview is not None:
            for key, expected in (("command_instance_id", authority["command_instance_id"]),
                                  ("scope", scope), ("repository_context_ref", request["repository_context_ref"]),
                                  ("selection", selection)):
                if preview[key] != expected:
                    errors.append("preview_" + key)
            errors += _disclosure_failures(preview, request, resolve_record, canon_root)
    # SCS-002 fences the original backend; selected destination may differ
    # during the explicit previewed adoption/migration owned by SCS/JJI.
    if kind == "workspace_remove" and selection["workspace_id"] != scope["workspace_id"]:
        errors.append("selected_workspace")
    revisions = []
    if kind == "history" and selection["revision"] is not None:
        revisions.append(selection["revision"])
    if kind == "diff":
        for endpoint in (selection["left"], selection["right"]):
            if endpoint["kind"] == "immutable_revision":
                revisions.append(endpoint["revision"])
            elif endpoint["kind"] == "git_index" and scope["scm_backend"] != "git":
                errors.append("jj_has_no_git_index")
    for revision in revisions:
        if revision["kind"] != scope["scm_backend"]:
            errors.append("endpoint_backend")
        if revision["kind"] == "git" and revision["object_format"] != scope["expected_revision"]["object_format"]:
            errors.append("endpoint_object_format")
        if revision["kind"] == "jujutsu" and revision["workspace_id"] != scope["workspace_id"]:
            errors.append("endpoint_workspace")
    if kind == "publish":
        target = _read(resolve_record, selection["remote_target_ref"],
                       "remote_operation_target", errors, canon_root, True)
        effect = _read(resolve_record, selection["reconciliation_ref"],
                       "external_effect_reconciliation", errors, canon_root, True)
        if target is not None:
            if target["repository_id"] != scope["repo_id"] or target["project_id"] != scope["lineage"]["project_id"]:
                errors.append("publish_repository")
            if target["selection_snapshot_generation"] != selection["target_selection_generation"]:
                errors.append("publish_generation")
            try:
                if resolve_record(target["revision_ref"]) != scope["expected_revision"]:
                    errors.append("publish_revision")
            except Exception:
                errors.append("publish_revision_unresolved")
            ids = [t["target_id"] for t in target["push_targets"]]
            if len(ids) != len(set(ids)):
                errors.append("duplicate_push_target")
            heads = selection["expected_remote_heads"]
            head_keys = [(h["target_id"], h["ref_name"]) for h in heads]
            if len(head_keys) != len(set(head_keys)) or {h["target_id"] for h in heads} != set(ids):
                errors.append("publish_head_target_set")
            for t in target["push_targets"]:
                # Ref syntax/remote semantics remain native-owner obligations.
                destinations = [r.lstrip("+").split(":")[-1] for r in t["refspecs"]]
                if set(destinations) != {h["ref_name"] for h in heads if h["target_id"] == t["target_id"]}:
                    errors.append("publish_head_ref_set")
                if t["preview_ref"] != request["preview_ref"]:
                    target_preview = _read(resolve_record, t["preview_ref"], "preview", errors, canon_root)
                    if target_preview is not None and any(target_preview[key] != expected for key, expected in (
                            ("command_instance_id", authority["command_instance_id"]), ("scope", scope),
                            ("repository_context_ref", request["repository_context_ref"]), ("selection", selection))):
                        errors.append("publish_target_preview")
            if scope["scm_backend"] == "git":
                length = 40 if scope["expected_revision"]["object_format"] == "sha1" else 64
                for head in heads:
                    oid = head["expected_oid"]
                    if oid is not None and (len(oid) != length or any(c not in "0123456789abcdef" for c in oid)):
                        errors.append("publish_head_oid")
        if effect is not None:
            if effect["operation_kind"] != "push" or effect["intended_target_ref"] != selection["remote_target_ref"]:
                errors.append("publish_effect_target")
            if target is not None and effect["operation_id"] != target["operation_id"]:
                errors.append("publish_operation")
            if request["preview_ref"] not in effect["precondition_refs"]:
                errors.append("publish_precondition")
    return errors


def _result_failures(original_request, result, *, resolve_record, canon_root=None):
    """Join an actual separately supplied original; never trust echoed selection."""
    errors = request_failures(original_request, resolve_record=resolve_record, canon_root=canon_root)
    errors += shape_failures("result_binding", result, canon_root=canon_root)
    if errors:
        return errors
    resolved = _read(resolve_record, result["original_request_ref"], "request", errors, canon_root)
    if resolved != original_request:
        errors.append("original_request_mismatch")
    if result["selection"] != original_request["selection"]:
        errors.append("result_selection")
    a, r = original_request["authority"], result["owner_result"]
    if r["command_instance_id"] != a["command_instance_id"] or r["scope"] != a["scope"]:
        errors.append("result_original_scope")
    if r.get("return_context") != a.get("return_context"):
        errors.append("result_return_context")
    if original_request["selection"]["kind"] in {"diff", "history"} and r["effect_state"] != "no_effect":
        errors.append("read_only_effect")
    receipt = _read(resolve_record, r["operation_receipt_ref"], "operation_receipt", errors, canon_root, True)
    if receipt is not None:
        for key, expected in (("command_instance_id", a["command_instance_id"]),
                              ("outcome", r["outcome"]), ("scm_backend", a["scope"]["scm_backend"]),
                              ("repository_context_ref", original_request["repository_context_ref"]),
                              ("before_revision", a["scope"]["expected_revision"]),
                              ("observable_work_id", r.get("observable_work_id"))):
            if receipt[key] != expected:
                errors.append("receipt_" + key)
        if receipt["completed_at_utc"] != r["completed_at_utc"]:
            errors.append("receipt_completed_at")
        try:
            if datetime.fromisoformat(receipt["completed_at_utc"].replace("Z", "+00:00")) < datetime.fromisoformat(a["requested_at_utc"].replace("Z", "+00:00")):
                errors.append("receipt_before_request")
        except (ValueError, TypeError):
            errors.append("receipt_time_invalid")
        for key in ("writer_lease_ref", "credential_lease_ref"):
            if key in a["scope"] and receipt[key] != a["scope"][key]:
                errors.append("receipt_" + key)
    return errors


def _disclosure_failures(preview, request, resolve, canon_root):
    errors=[];kind=request['selection']['kind'];value=preview['native_disclosure'];ref=preview['native_disclosure_source_ref']
    if kind not in ('backend_select','workspace_remove'):
        return [] if value is None and ref is None else ['unexpected_native_disclosure']
    if value is None or ref is None:return ['native_disclosure_required']
    source=_read(resolve,ref,'native_disclosure_source',errors,canon_root)
    if source is not None:
        for key,expected in (('source_id',ref),('command_instance_id',preview['command_instance_id']),('scope',preview['scope']),('selection',preview['selection']),('disclosure',value)):
            if source[key]!=expected:errors.append('native_disclosure_source_'+key)
    if value['kind']!=('adoption' if kind=='backend_select' else 'removal'):return errors+['native_disclosure_kind']
    mapping=value['before_mapping'];scope=request['authority']['scope']
    for key in ('repo_id','scm_backend','workspace_id'):
        if mapping[key]!=scope[key]:errors.append('native_mapping_'+key)
    for key in ('source_location_id','execution_host_id','execution_environment_id','topology_generation'):
        if mapping[key]!=scope['lineage'][key]:errors.append('native_mapping_'+key)
    effects=[]
    if kind=='backend_select':
        after=value['proposed_mapping']
        if after['scm_backend']!=request['selection']['backend']:errors.append('adoption_selected_backend')
        if value['registration_before']!=mapping['registered'] or value['registration_after']!=after['registered']:errors.append('adoption_registration_mapping')
        if any(after[key]!=mapping[key] for key in ('repo_id','workspace_id','source_location_id','execution_host_id','execution_environment_id','topology_generation')):errors.append('adoption_mapping_scope')
        current=deepcopy(mapping);ids=[]
        for repair in value['native_repairs']:
            ids.append(repair['repair_id'])
            qualification_ref=repair['qualified_native_operation_ref']
            qualification=_read(resolve,qualification_ref,'native_repair_qualification',errors,canon_root)
            if qualification is not None and any(qualification[key]!=expected for key,expected in (
                    ('qualification_id',qualification_ref),('command_instance_id',preview['command_instance_id']),
                    ('scope',scope),('repair',repair))):errors.append('adoption_native_qualification')
            if repair['before_mapping']!=current:errors.append('adoption_repair_chain')
            current=repair['after_mapping'];effects+=repair['file_effects']+repair['config_effects']
        if len(ids)!=len(set(ids)):errors.append('adoption_duplicate_repair')
        # Registration is independent of native repair; all other mapping changes
        # must be shown by the complete ordered owner-qualified repair sequence.
        current['registered']=value['registration_after']
        if current!=after:errors.append('adoption_repair_mapping')
        effects+=value['file_effects']+value['config_effects']
    else:
        if value['registration_after']:errors.append('removal_registration')
        deps=[(d['owner_ref'],d['resource_ref']) for d in value['dependencies']]
        if len(deps)!=len(set(deps)):errors.append('removal_duplicate_dependency')
        if any(d['required_after_removal'] and d['disposition_ref'] is None for d in value['dependencies']):errors.append('removal_unresolved_dependency')
        # Presence is disclosed, never assumed to be an authorization to cancel,
        # release or destroy live dependants. Their owner must first resolve them.
        if value['active_work_refs'] or value['active_lease_refs']:errors.append('removal_active_dependency')
        effects=value['data_effects']
    if value['blocking_finding_refs']:errors.append('native_disclosure_blocked')
    for effect in effects:
        if any(effect[k]['state']=='unknown' for k in ('before','after')):errors.append('native_disclosure_unknown_content')
    return errors


def _pinned_call(function, inputs, resolve_record, canon_root):
    originals=tuple(inputs);snapshots=deepcopy(originals);observed=[]
    def read(ref):
        live=resolve_record(ref);snapshot=deepcopy(live);observed.append((live,snapshot));return deepcopy(snapshot)
    errors=function(*deepcopy(snapshots),resolve_record=read,canon_root=canon_root)
    if originals!=snapshots:errors.append('selected_input_mutated')
    if any(live!=snapshot for live,snapshot in observed):errors.append('selected_owner_record_mutated')
    return errors


def request_failures(request, *, resolve_record, canon_root=None):
    return _pinned_call(_request_failures,(request,),resolve_record,canon_root)


def result_failures(original_request,result, *, resolve_record, canon_root=None):
    return _pinned_call(_result_failures,(original_request,result),resolve_record,canon_root)


def fixture_dependencies(wrapper):
    """Explicit synthetic retained-value reader. Not issuer/native authentication."""
    records = deepcopy(wrapper["records"])
    return {"resolve_record": lambda ref: deepcopy(records[ref])}


def selected_operand_semantic_failures(definition, value, *, canon_root=None):
    """Fixture-only composition; durable/runtime record validation stays distinct."""
    dependencies = fixture_dependencies(value)
    if definition == "request_case":
        return request_failures(value["request"], canon_root=canon_root, **dependencies)
    if definition == "result_case":
        return result_failures(value["request"], value["result"], canon_root=canon_root, **dependencies)
    raise ValueError("fixture definition required")
