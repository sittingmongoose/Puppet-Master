"""Finite JJ operand joins; never native admission/execution proof.

Callbacks return refusal lists, not caller-supplied authority booleans.
authenticate_request authenticates all selected immutable pairs, actual preview
issuance/disclosures, existing confirmation, Permissions/FileSafe/leases and full
effect scope under the current native fence immediately before effects.
authenticate_result authenticates actual result/receipt and affected identities.
final_disclosure rechecks current protected disclosure immediately before output.
The caller must supply the actual original request, not trust its echoed copy.
"""
from copy import deepcopy
PREVIEW_KINDS = {"squash", "rebase", "abandon"}


def _pair(value):
    return {key: value[key] for key in ("change_id", "commit_id")}


def selected_changes(selection):
    kind = selection["kind"]
    if kind == "describe":
        return [selection["change"]]
    if kind == "new":
        return selection["parents"]
    if kind == "squash":
        return selection["source_changes"] + [selection["destination_change"]]
    if kind == "rebase":
        return selection["changes"] + [selection["destination"]]
    return selection["change_ids"]


def operand_semantic_failures(definition, value):
    """Finite layer; caller must first validate the definition's schema."""
    errors = []
    if definition == "command_request_v2":
        a, s = value["authority"], value["selection"]
        kind, target = s["kind"], a["target"]
        if a["command_id"] != "cmd.jujutsu.change." + kind:
            errors.append("operand_command_mismatch")
        if a["expected_revision"]["operation_id"] != a["currentness"]["expected_operation_id"]:
            errors.append("operand_expected_operation_mismatch")
        primary = selected_changes(s)[0]
        source = target["source_revision"]
        if source is None or _pair(source) != primary:
            errors.append("operand_source_anchor_mismatch")
        if kind != "new" and target["change_id"] != primary["change_id"]:
            errors.append("operand_change_anchor_mismatch")
        if kind in {"squash", "rebase"}:
            destination = s["destination_change" if kind == "squash" else "destination"]
            revision = target["destination_revision"]
            if revision is None or _pair(revision) != destination:
                errors.append("operand_destination_anchor_mismatch")
        if (kind in PREVIEW_KINDS) != (value["preview_ref"] is not None):
            errors.append("operand_preview_requirement_mismatch")
    elif definition == "selection_preview_v2":
        if value["command_id"] != "cmd.jujutsu.change." + value["selection"]["kind"]:
            errors.append("preview_command_mismatch")
    elif definition == "command_result_binding_v2":
        request, result, receipt = (value[k] for k in
                                   ("original_request", "owner_result", "operation_receipt"))
        errors += operand_semantic_failures("command_request_v2", request)
        authority = request["authority"]
        for key in ("command_id", "command_instance_id", "repository_context_ref",
                    "observable_work_id"):
            if result[key] != authority[key]:
                errors.append("result_" + key + "_mismatch")
        if result["before_revision"] != authority["expected_revision"]:
            errors.append("result_before_revision_mismatch")
        if result["outcome"] == "accepted" and receipt is None:
            if result["receipt_ref"] is not None:
                errors.append("accepted_receipt_unresolved")
        elif receipt is None:
            errors.append("established_receipt_missing")
        else:
            for key in ("command_instance_id", "operation_id", "outcome",
                        "repository_context_ref", "before_revision", "after_revision",
                        "observable_work_id", "event_refs", "completed_at_utc"):
                if receipt[key] != result[key]:
                    errors.append("receipt_" + key + "_mismatch")
            for key in ("writer_lease_ref", "credential_lease_ref"):
                if receipt[key] != authority[key]:
                    errors.append("receipt_" + key + "_mismatch")
            if receipt["scm_backend"] != "jujutsu":
                errors.append("receipt_backend_mismatch")
            if receipt["receipt_id"] != result["receipt_ref"]:
                errors.append("receipt_reference_mismatch")
    return errors


def _validate_request(request, preview, *, structural_errors, legacy_semantics,
                     authenticate_request):
    """Shape, preserved v1 guards, exact preview, current native effect admission."""
    errors = list(structural_errors("command_request_v2", request))
    if errors:
        return errors
    errors += list(legacy_semantics("command_request", request["authority"]))
    errors += operand_semantic_failures("command_request_v2", request)
    if request["selection"]["kind"] in PREVIEW_KINDS:
        errors += list(structural_errors("selection_preview_v2", preview))
        if errors:
            return errors
        errors += operand_semantic_failures("selection_preview_v2", preview)
        for key in ("command_id", "command_instance_id", "repository_context_ref",
                    "expected_revision", "currentness"):
            if preview[key] != request["authority"][key]:
                errors.append("preview_" + key + "_mismatch")
        for key in ("preview_ref", "selection"):
            if preview[key] != request[key]:
                errors.append("preview_" + key + "_mismatch")
    elif preview is not None:
        errors.append("unexpected_preview")
    if not errors:
        errors += list(authenticate_request(deepcopy(request), deepcopy(preview)))
    return errors


def _validate_result(original_request, binding, *, structural_errors, legacy_semantics,
                    authenticate_result, final_disclosure):
    """Authenticate owner result/receipt; final current disclosure is mandatory."""
    errors = list(structural_errors("command_result_binding_v2", binding))
    errors += list(structural_errors("command_request_v2", original_request))
    if errors:
        return errors
    if binding["original_request"] != original_request:
        errors.append("original_request_mismatch")
    errors += operand_semantic_failures("command_result_binding_v2", binding)
    errors += list(legacy_semantics("command_request", original_request["authority"]))
    errors += list(legacy_semantics("command_result", binding["owner_result"]))
    if not errors:
        errors += list(authenticate_result(deepcopy(original_request), deepcopy(binding)))
    if not errors:
        errors += list(final_disclosure(deepcopy(original_request), deepcopy(binding)))
    return errors


def _checked(name, callback):
    def check(*args):
        supplied = deepcopy(args)
        try:
            result = callback(*supplied)
        except Exception as exc:
            return ["callback_exception:" + name + ":" + type(exc).__name__]
        if supplied != args:
            return ["callback_arguments_mutated:" + name]
        if not isinstance(result, list) or any(not isinstance(x, str) or not x for x in result):
            return ["callback_contract_invalid:" + name]
        return result
    return check


def validate_request(request, preview, *, structural_errors, legacy_semantics,
                     authenticate_request):
    """Pin inputs across every callback; native pre-effect admission stays mandatory."""
    frozen = deepcopy((request, preview))
    errors = _validate_request(*deepcopy(frozen),
        structural_errors=_checked("structural_errors", structural_errors),
        legacy_semantics=_checked("legacy_semantics", legacy_semantics),
        authenticate_request=_checked("authenticate_request", authenticate_request))
    if (request, preview) != frozen:
        errors.append("request_inputs_mutated")
    return errors


def validate_result(original_request, binding, *, structural_errors, legacy_semantics,
                    authenticate_result, final_disclosure):
    """Pin actual original and result across owner authentication and final disclosure."""
    frozen = deepcopy((original_request, binding))
    errors = _validate_result(*deepcopy(frozen),
        structural_errors=_checked("structural_errors", structural_errors),
        legacy_semantics=_checked("legacy_semantics", legacy_semantics),
        authenticate_result=_checked("authenticate_result", authenticate_result),
        final_disclosure=_checked("final_disclosure", final_disclosure))
    if (original_request, binding) != frozen:
        errors.append("result_inputs_mutated")
    return errors
