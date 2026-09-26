"""Causal static validator for the WM-029 cmd.search.rebuild_index typed companion.

Static definition only: proves no native IndexBuilder execution, Storage
publication, receipt write, ObservableWork production, dispatcher/handler
registration, permission/availability decision, or runtime completion.
Matching labels, refs, hashes, or trusted boundary inputs never constitute
native proof; validate() always reports native_acts_proven=0. Every supplied
outcome validates against the genuine central CommandOutcomeRecord before any
Search joins; unresolvable or drifted owner bytes fail closed. The central
semantic oracle supplies acknowledgement-frame parity and outcome binding;
no Search-only copy of those laws is kept here.
"""

import hashlib
import importlib.util
import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"

SCHEMA_PATH = "Plans/search_rebuild_index.schema.json"
FIXTURES_PATH = "Plans/search_rebuild_index_fixtures.json"

COMMAND_ID = "cmd.search.rebuild_index"
HANDLER = "handlers::search::rebuild_index"
PRODUCTION_ROW_ID = "catalog.search_rebuild_index"
RECEIPT_ROOT = "cmd.search.rebuild_index.dispatch_receipt"
INSTALLED_OWNER_SCHEMA_REL = "Plans/full_thread_runtime_contracts.schema.json"
OWNER_SCHEMA_SHA256_PIN = "5fa07b1ee8a19c769883b6e8876bf0c5e6326b97f5992fec3b661d7ec2a541ea"
OWNER_OUTCOME_POINTER = "#/$defs/CommandOutcomeRecord"
INSTALLED_OWNER_SEMANTICS_REL = "scripts/pm_full_thread_semantics.py"
OWNER_SEMANTICS_SHA256_PIN = "f8fd8d66fe8a790c47d8fc583703689d0c827dadc0c9a918084526c91b07e931"

# No invented adapter IDs or verified product gates: WM-029 admits only the genuine
# authenticated original and actual native builder/storage source and publication
# under existing owners. Fixtures receive independently selected trusted boundary
# inputs; the validator checks causal equality only and proves no native issuer.

REQUIRED_BUILD_FILES = frozenset({"postings.bin", "lookup.bin", "file_map.bin", "index_meta.json"})

NONTERMINAL_OUTCOMES = frozenset({"accepted", "acknowledged", "executing"})
TERMINAL_WORK_STATES = frozenset({"completed", "failed", "cancelled", "recovery-required"})
WORK_STATE_TO_OWNER_STATUS = {
    "completed": "succeeded",
    "failed": "failed",
    "cancelled": "cancelled",
    "recovery-required": "recovery_required",
}
NO_EFFECT_OWNER_CODES = frozenset({"blocked_state", "stale_selection", "project_unknown", "handler_unavailable"})


def _load(relpath):
    with open(ROOT / relpath, encoding="utf-8") as handle:
        return json.load(handle)


def schema():
    return _load(SCHEMA_PATH)


def fixtures():
    return _load(FIXTURES_PATH)


def bundle_validator():
    candidate = schema()
    return Draft202012Validator({"$ref": "#/$defs/search_rebuild_bundle", "$defs": candidate["$defs"]})


def load_owner_schema(owner_schema_path=None):
    """Load the genuine central owner schema from an explicit path or the installed location.

    No sibling invention: the only default is the installed repository path. Returns
    (schema_dict_or_None, error_or_None); absent bytes and pin drift fail closed.
    """
    location = Path(owner_schema_path) if owner_schema_path else ROOT / INSTALLED_OWNER_SCHEMA_REL
    if not location.is_file():
        return None, f"owner_schema_unresolved:{location}"
    text = location.read_text(encoding="utf-8")
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    if digest != OWNER_SCHEMA_SHA256_PIN:
        return None, f"owner_schema_pin_mismatch:expected:{OWNER_SCHEMA_SHA256_PIN}:got:{digest}"
    return json.loads(text), None


def genuine_outcome_failures(outcome, owner_schema):
    validator = Draft202012Validator(
        {"$ref": OWNER_OUTCOME_POINTER, "$defs": owner_schema["$defs"]})
    return sorted(f"genuine_outcome:{error.message}" for error in validator.iter_errors(outcome))


def load_owner_semantics(owner_semantics_path=None):
    """Load the genuine central semantic oracle module. Same closed rules as the schema loader."""
    location = Path(owner_semantics_path) if owner_semantics_path else ROOT / INSTALLED_OWNER_SEMANTICS_REL
    if not location.is_file():
        return None, f"owner_semantics_unresolved:{location}"
    text = location.read_text(encoding="utf-8")
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    if digest != OWNER_SEMANTICS_SHA256_PIN:
        return None, f"owner_semantics_pin_mismatch:expected:{OWNER_SEMANTICS_SHA256_PIN}:got:{digest}"
    spec = importlib.util.spec_from_file_location("pm_full_thread_semantics", location)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module, None


def owner_semantic_failures(outcome, semantics):
    return sorted(f"owner_semantic:{rule}"
                  for rule in semantics.full_thread_semantic_failures("CommandOutcomeRecord", outcome))


def binding_failures(bundle, selected_outcome_ref, owner_semantics_path=None):
    semantics, error = load_owner_semantics(owner_semantics_path)
    if error is not None:
        return [error]
    if not isinstance(selected_outcome_ref, str) or not selected_outcome_ref:
        return ["selected_outcome_ref_missing"]
    return sorted(f"owner_binding:{rule}" for rule in semantics.command_outcome_binding_failures(
        bundle.get("response"), bundle.get("outcome"), selected_outcome_ref))


def structural_failures(bundle, owner_schema_path=None, owner_semantics_path=None):
    owner_schema, error = load_owner_schema(owner_schema_path)
    if error is not None:
        return [error]
    semantics, error = load_owner_semantics(owner_semantics_path)
    if error is not None:
        return [error]
    outcome = bundle.get("outcome")
    if not isinstance(outcome, dict):
        failures = ["genuine_outcome:missing outcome record"]
    else:
        failures = genuine_outcome_failures(outcome, owner_schema)
        failures.extend(owner_semantic_failures(outcome, semantics))
    failures.extend(error.message for error in bundle_validator().iter_errors(bundle))
    return sorted(failures)


def resolved_central_fields(owner_schema_path=None):
    """Genuine existing central/owner fields this validator composes.

    Every value below is read from the frozen owner/central files, never
    from candidate fixtures, so tests can assert exact resolution.
    """
    ui = _load("Plans/ui_command_response.schema.json")
    sir = _load("Plans/shared_runtime_command_contracts.schema.json")
    production = _load("Plans/Wiring_Matrix.production.json")["entries"][PRODUCTION_ROW_ID]
    owner_schema, owner_error = load_owner_schema(owner_schema_path)
    genuine_outcome = owner_schema["$defs"]["CommandOutcomeRecord"] if owner_schema else None
    touch = _load("Plans/touch_closure.json")
    tcp = next(p for p in touch["profiles"] if p["profile_id"] == "TCP-SEARCH-INDEX")
    storage = (PLANS / "storage-plan.md").read_text(encoding="utf-8")
    wiring = (PLANS / "Wiring_Matrix.md").read_text(encoding="utf-8")
    catalog = (PLANS / "UI_Command_Catalog.md").read_text(encoding="utf-8")
    return {
        "cv333_response_kind": ui["properties"]["response_kind"]["enum"],
        "cv333_ack_status": ui["properties"]["ack_status"]["enum"],
        "cv333_result_status": [v for v in ui["properties"]["result_status"]["enum"] if v is not None],
        "cv333_error_codes": ui["$defs"]["UICommandError"]["properties"]["code"]["enum"],
        "cv333_command_id_pattern": ui["$defs"]["CommandId"]["pattern"],
        "sir_non_secret_ref_pattern": sir["$defs"]["non_secret_ref"]["pattern"],
        "sir_idempotency_required": sir["$defs"]["command_idempotency"]["required"],
        "sir_replay_policy": sir["$defs"]["command_idempotency"]["properties"]["replay_policy"]["enum"],
        "sir_command_error_categories": sir["$defs"]["command_error"]["properties"]["category"]["enum"],
        "production_row": {
            "ui_command_id": production["ui_command_id"],
            "handler_location": production["handler_location"],
            "expected_event_types": production["expected_event_types"],
            "effect_kind": production["effect_contract"]["effect_kind"],
            "receipt_or_event_refs": production["effect_contract"]["receipt_or_event_refs"],
            "state_selector": production["state_selector"],
            "disabled_reason_projection": production["disabled_reason_projection"],
        },
        "tcp_search_index": {
            "handler_status": tcp["handler_status"],
            "handler_owner": tcp["handler_owner"],
            "production_or_simulation": tcp["production_or_simulation"],
            "evidence_refs": tcp["evidence_refs"],
        },
        "storage_tokens_present": {
            token: (token in storage)
            for token in (
                "generation <= build_generation",
                "ArcSwap<Arc<IndexSnapshot>>",
                "gen-{N+1}/",
                "File::sync_all()",
                "mutation_lock_id",
                "may coalesce",
            )
        },
        "wiring_tokens_present": {
            token: (token in wiring)
            for token in (
                "cmd.search.rebuild_index { project_id }",
                "cmd.search.rebuild_index.dispatch_receipt",
                "handlers::search::rebuild_index",
            )
        },
        "catalog_row_present": "| `cmd.search.rebuild_index` | `{ project_id }` |" in catalog,
        "owner_schema_error": owner_error,
        "genuine_outcome_required": genuine_outcome["required"] if genuine_outcome else None,
        "genuine_outcome_enum": genuine_outcome["properties"]["outcome"]["enum"] if genuine_outcome else None,
        "genuine_outcome_allof_count": len(genuine_outcome["allOf"]) if genuine_outcome else None,
    }


def _original(bundle):
    return bundle["original"]


def _current(bundle):
    return bundle["current_source"]


def _publication(bundle):
    return bundle["publication"]


def _receipt(bundle):
    return bundle["receipt"]


def _outcome(bundle):
    return bundle["outcome"]


def _result(bundle):
    return bundle["owner_result"]


def _response(bundle):
    return bundle["response"]


def _identity(bundle):
    return _outcome(bundle)["identity"]


def _replayed(bundle):
    return bool(_response(bundle)["replayed"])


def rule_original_identity(bundle):
    original = _original(bundle)
    return (
        original["command_id"] == COMMAND_ID
        and set(original["args"]) == {"project_id"}
        and _outcome(bundle)["command_id"] == COMMAND_ID
        and _response(bundle)["command_id"] == COMMAND_ID
    )


def rule_project_join(bundle):
    projects = {
        _original(bundle)["args"]["project_id"],
        _original(bundle)["project_id"],
        _current(bundle)["project_id"],
        _publication(bundle)["project_id"],
        _receipt(bundle)["project_id"],
        _identity(bundle)["project_id"],
        _result(bundle)["project_id"],
        _response(bundle)["owner_identity"]["project_id"],
    }
    return len(projects) == 1


def rule_operation_join(bundle):
    operations = {
        _original(bundle)["operation_id"],
        _publication(bundle)["operation_id"],
        _receipt(bundle)["operation_id"],
        _identity(bundle)["operation_id"],
        _result(bundle)["operation_id"],
        _response(bundle)["operation_id"],
        _response(bundle)["owner_identity"]["operation_id"],
    }
    if bundle["work"] is not None:
        operations.add(bundle["work"]["operation_id"])
    return len(operations) == 1


def rule_instance_join(bundle):
    instances = {
        _original(bundle)["command_instance_id"],
        _receipt(bundle)["command_instance_id"],
        _identity(bundle)["command_instance_id"],
        _result(bundle)["command_instance_id"],
        _response(bundle)["command_instance_id"],
        _response(bundle)["owner_identity"]["command_instance_id"],
    }
    return len(instances) == 1


def rule_caller_join(bundle):
    return _original(bundle)["actor_ref"] == _result(bundle)["actor_ref"]


def rule_idempotency_join(bundle):
    if _original(bundle)["idempotency"]["idempotency_key"] != _outcome(bundle)["idempotency_key"]:
        return False
    return _response(bundle)["replayed"] == _result(bundle)["replayed"]


def rule_target_generation_join(bundle):
    generations = {
        _original(bundle)["topology_generation"],
        _outcome(bundle)["target_generation"],
        _response(bundle)["owner_identity"]["topology_generation"],
    }
    return len(generations) == 1


def rule_dispatch_frame_join(bundle):
    return _outcome(bundle)["dispatch_frame_id"] == _original(bundle)["dispatch_frame_id"]


def rule_result_receipt_binding(bundle):
    outcome = _outcome(bundle)
    expected = _receipt(bundle)["receipt_ref"]
    if outcome["outcome"] in ("succeeded", "failed", "cancelled"):
        return outcome["result_receipt_ref"] == expected
    if outcome["outcome"] in NONTERMINAL_OUTCOMES:
        return outcome["result_receipt_ref"] is None
    return outcome["result_receipt_ref"] in (None, expected)


def rule_payload_digest_join(bundle):
    return _outcome(bundle)["payload_sha256"] == _original(bundle)["payload_sha256"]


def rule_owner_result_digest_join(bundle):
    return _outcome(bundle)["owner_result_sha256"] == bundle["trusted"]["owner_result_sha256"]


def rule_result_identity_null_together(bundle):
    outcome = _outcome(bundle)
    triple = (outcome["owner_result_ref"], outcome["owner_result_schema_ref"], outcome["owner_result_sha256"])
    if not (all(value is None for value in triple) or all(value is not None for value in triple)):
        return False
    if outcome["outcome"] in ("succeeded", "failed", "cancelled", "rejected", "terminal_unknown"):
        return all(value is not None for value in triple)
    return all(value is None for value in triple) == (_result(bundle)["status"] == "pending")


def rule_owner_result_schema_join(bundle):
    return _outcome(bundle)["owner_result_schema_ref"] == _response(bundle)["owner_result_schema_ref"]


def rule_outcome_error_ref_required(bundle):
    if _outcome(bundle)["outcome"] not in ("failed", "rejected", "terminal_unknown"):
        return True
    return _outcome(bundle)["error_ref"] is not None


def rule_outcome_ack_required(bundle):
    if _outcome(bundle)["outcome"] not in ("acknowledged", "executing", "succeeded"):
        return True
    return _outcome(bundle)["acknowledgement_receipt_ref"] is not None


# V4 interop: outcome.payload_sha256 binds the authentic original argument-only
# digest as an independently selected opaque value (equality with the trusted
# original; no serializer invented, never recomputed). owner_result_sha256 binds
# the independently selected opaque RFC 8785 digest of the actual typed owner
# result/error (SIR line 913; owner-supplement-v4 CommandOutcomeRecord).


def rule_receipt_accounting(bundle):
    receipt = _receipt(bundle)
    response = _response(bundle)
    result = _result(bundle)
    if receipt["dispatch_id"] != response["dispatch_id"]:
        return False
    if response["receipt_ref"] is not None and response["receipt_ref"] != receipt["receipt_ref"]:
        return False
    if result["result_receipt_ref"] is not None and result["result_receipt_ref"] != receipt["receipt_ref"]:
        return False
    return True


def rule_result_response_join(bundle):
    response = _response(bundle)
    result = _result(bundle)
    outcome = _outcome(bundle)
    if response["owner_result_ref"] is None:
        return response["result_status"] == "pending" and result["status"] == "pending"
    if response["owner_result_ref"] != outcome["owner_result_ref"]:
        return False
    schema_ref = response["owner_result_schema_ref"]
    if response["result_status"] != "pending":
        if response["owner_result_ref"] is None or schema_ref is None:
            return False
        if schema_ref["path"] != SCHEMA_PATH:
            return False
        if schema_ref["json_pointer"] != "#/$defs/search_rebuild_owner_result":
            return False
    if result["status"] != "pending" and response["owner_result_ref"] is None:
        return False
    return True


def rule_trusted_original_match(bundle):
    return bundle["trusted"]["original"] == bundle["original"]


def rule_trusted_current_match(bundle):
    return bundle["trusted"]["current_source"] == bundle["current_source"]


def rule_trusted_publication_match(bundle):
    return bundle["trusted"]["publication"] == bundle["publication"]


def rule_timestamp_never_authority(bundle):
    current = _current(bundle)
    if current["source_kind"] == "non_git":
        return current["anchor_sha"] is None
    return current["anchor_sha"] is not None


def rule_publication_join(bundle):
    publication = _publication(bundle)
    current = _current(bundle)
    result = _result(bundle)
    if publication["prior_generation"] != current["published_generation"]:
        return False
    if publication["claims_new_build"]:
        if publication["built_generation"] != publication["prior_generation"] + 1:
            return False
        return result["built_generation"] == publication["built_generation"]
    return publication["built_generation"] is None and result["built_generation"] is None


def rule_publication_coherence(bundle):
    publication = _publication(bundle)
    if publication["claims_new_build"] and set(publication["files"]) != set(REQUIRED_BUILD_FILES):
        return False
    if publication["swapped"]:
        return (
            publication["claims_new_build"]
            and publication["checksum_valid"]
            and publication["synced"]
            and publication["built_generation"] is not None
        )
    return True


def rule_anchor_join(bundle):
    current = _current(bundle)
    publication = _publication(bundle)
    if current["source_kind"] == "non_git":
        return current["anchor_sha"] is None and publication["anchor_sha"] is None
    return publication["anchor_sha"] == current["anchor_sha"]


def rule_dirty_fence(bundle):
    publication = _publication(bundle)
    current = _current(bundle)
    if publication["build_generation"] != current["build_generation_fence"]:
        return False
    if publication["cleared_through"] > publication["build_generation"]:
        return False
    return all(gen > publication["build_generation"] for gen in publication["surviving_generations"])


def rule_terminal_binding(bundle):
    if _replayed(bundle):
        return True
    swapped = _publication(bundle)["swapped"]
    return (_result(bundle)["status"] == "succeeded") == swapped


def rule_pre_swap_failure_retains_prior(bundle):
    publication = _publication(bundle)
    result = _result(bundle)
    if publication["swapped"] or result["status"] not in ("failed", "cancelled", "recovery_required"):
        return True
    return (
        result["effective_generation"] == publication["prior_generation"]
        and result["fallback_available"] is True
        and _response(bundle)["result_status"] != "succeeded"
    )


def rule_post_swap_settlement_truthful(bundle):
    publication = _publication(bundle)
    if not publication["swapped"]:
        return True
    return _result(bundle)["effective_generation"] == publication["built_generation"]


def rule_admission_not_success(bundle):
    if _outcome(bundle)["outcome"] not in NONTERMINAL_OUTCOMES:
        return True
    return (
        _response(bundle)["result_status"] == "pending"
        and _result(bundle)["status"] == "pending"
        and _result(bundle)["error"] is None
        and not _publication(bundle)["swapped"]
    )


def rule_terminal_agreement(bundle):
    outcome = _outcome(bundle)["outcome"]
    result_status = _result(bundle)["status"]
    response_status = _response(bundle)["result_status"]
    if outcome == "succeeded":
        return result_status == "succeeded" and response_status == "succeeded"
    if outcome == "failed":
        return result_status == "failed" and response_status == "failed"
    if outcome == "cancelled":
        return result_status == "cancelled" and response_status == "cancelled"
    if outcome == "terminal_unknown":
        return response_status in ("failed", "recovery_required")
    if outcome == "rejected":
        return False
    return True


def rule_response_coherence(bundle):
    response = _response(bundle)
    if response["response_kind"] != "owner_operation":
        return False
    if response["ack_status"] == "accepted" and response["command_id"] != COMMAND_ID:
        return False
    if response["result_status"] in ("failed", "recovery_required"):
        if response["error"] is None:
            return False
    elif response["error"] is not None:
        return False
    if response["result_status"] != "pending":
        if response["receipt_ref"] is None:
            return False
    if response["replayed"]:
        if response["original_dispatch_id"] is None:
            return False
    elif response["original_dispatch_id"] is not None:
        return False
    return True


def rule_event_refs_empty(bundle):
    return _response(bundle)["event_refs"] == []


def rule_replay_never_rebuilds(bundle):
    response = _response(bundle)
    replay_of = bundle["replay_of"]
    if not response["replayed"]:
        return replay_of is None
    publication = _publication(bundle)
    if replay_of is None:
        return False
    return (
        response["original_dispatch_id"] == replay_of["original_dispatch_id"]
        and response["receipt_ref"] == replay_of["original_receipt_ref"]
        and response["owner_result_ref"] == replay_of["original_owner_result_ref"]
        and not publication["claims_new_build"]
        and not publication["swapped"]
        and _result(bundle)["built_generation"] is None
    )


def rule_work_conditional(bundle):
    work = bundle["work"]
    result = _result(bundle)
    if work is None:
        return result["work_ref"] is None
    if work["work_state"] in TERMINAL_WORK_STATES:
        if work["owner_result_receipt_ref"] != _receipt(bundle)["receipt_ref"]:
            return False
        if result["work_ref"] != work["work_id"]:
            return False
        return result["status"] == WORK_STATE_TO_OWNER_STATUS[work["work_state"]]
    return True


def rule_production_row_join(bundle):
    row = resolved_central_fields()["production_row"]
    if row["ui_command_id"] != COMMAND_ID:
        return False
    if row["handler_location"] != HANDLER:
        return False
    if row["expected_event_types"] != []:
        return False
    if row["effect_kind"] != "receipt":
        return False
    if RECEIPT_ROOT not in row["receipt_or_event_refs"]:
        return False
    if not _receipt(bundle)["receipt_ref"].startswith(RECEIPT_ROOT):
        return False
    return _response(bundle)["event_refs"] == row["expected_event_types"]


def rule_blocked_no_effect(bundle):
    result = _result(bundle)
    if result["error"] is None or result["error"]["code"] not in NO_EFFECT_OWNER_CODES:
        return True
    publication = _publication(bundle)
    return (
        not publication["claims_new_build"]
        and not publication["swapped"]
        and publication["built_generation"] is None
        and result["built_generation"] is None
    )


RULES = {
    "original_identity": rule_original_identity,
    "project_join": rule_project_join,
    "operation_join": rule_operation_join,
    "instance_join": rule_instance_join,
    "caller_join": rule_caller_join,
    "idempotency_join": rule_idempotency_join,
    "target_generation_join": rule_target_generation_join,
    "dispatch_frame_join": rule_dispatch_frame_join,
    "result_receipt_binding": rule_result_receipt_binding,
    "payload_digest_join": rule_payload_digest_join,
    "owner_result_digest_join": rule_owner_result_digest_join,
    "result_identity_null_together": rule_result_identity_null_together,
    "owner_result_schema_join": rule_owner_result_schema_join,
    "outcome_error_ref_required": rule_outcome_error_ref_required,
    "outcome_ack_required": rule_outcome_ack_required,
    "receipt_accounting": rule_receipt_accounting,
    "result_response_join": rule_result_response_join,
    "trusted_original_match": rule_trusted_original_match,
    "trusted_current_match": rule_trusted_current_match,
    "trusted_publication_match": rule_trusted_publication_match,
    "timestamp_never_authority": rule_timestamp_never_authority,
    "publication_join": rule_publication_join,
    "publication_coherence": rule_publication_coherence,
    "anchor_join": rule_anchor_join,
    "dirty_fence": rule_dirty_fence,
    "terminal_binding": rule_terminal_binding,
    "pre_swap_failure_retains_prior": rule_pre_swap_failure_retains_prior,
    "post_swap_settlement_truthful": rule_post_swap_settlement_truthful,
    "admission_not_success": rule_admission_not_success,
    "terminal_agreement": rule_terminal_agreement,
    "response_coherence": rule_response_coherence,
    "event_refs_empty": rule_event_refs_empty,
    "replay_never_rebuilds": rule_replay_never_rebuilds,
    "work_conditional": rule_work_conditional,
    "production_row_join": rule_production_row_join,
    "blocked_no_effect": rule_blocked_no_effect,
}


def bundle_semantic_failures(bundle):
    return sorted(name for name, predicate in RULES.items() if not predicate(bundle))


def pairwise_concurrency_failures(first, second):
    """Latitude check for two originals on one Project: coalesced, serialized,
    or truthfully blocked dispositions all pass; only single-writer, fence,
    per-original accounting, or truthful-outcome violations fail."""
    failures = []
    if first["original"]["project_id"] != second["original"]["project_id"]:
        return failures
    first_pub = first["publication"]
    second_pub = second["publication"]
    if (
        first_pub["swapped"]
        and second_pub["swapped"]
        and first_pub["prior_generation"] == second_pub["prior_generation"]
    ):
        failures.append("single_writer_violated")
    if first["original"]["operation_id"] != second["original"]["operation_id"]:
        if first["receipt"]["receipt_ref"] == second["receipt"]["receipt_ref"]:
            failures.append("receipt_shared_across_originals")
        if first["receipt"]["dispatch_id"] == second["receipt"]["dispatch_id"]:
            failures.append("dispatch_shared_across_originals")
        if first["outcome"]["owner_result_ref"] == second["outcome"]["owner_result_ref"]:
            failures.append("owner_result_shared_across_originals")
    return sorted(failures)


def validate(owner_schema_path=None, owner_semantics_path=None):
    report = {
        "status": "pass",
        "claim_boundary": "static_only_no_native_proof",
        "positive_cases": 0,
        "positive_case_ids": [],
        "failures": [],
        "rules_total": len(RULES),
        "native_acts_proven": 0,
        "pairwise_checked": 0,
        "owner_schema_path": str(owner_schema_path) if owner_schema_path else INSTALLED_OWNER_SCHEMA_REL,
        "owner_semantics_path": str(owner_semantics_path) if owner_semantics_path else INSTALLED_OWNER_SEMANTICS_REL,
    }
    pack = fixtures()
    bundles = pack["valid"]
    for bundle in bundles:
        case_id = bundle["case_id"]
        structural = structural_failures(bundle, owner_schema_path, owner_semantics_path)
        semantic = bundle_semantic_failures(bundle)
        selected = pack.get("selected_outcome_refs", {}).get(case_id)
        binding = binding_failures(bundle, selected, owner_semantics_path)
        if structural or semantic or binding:
            report["failures"].append(
                {"case_id": case_id, "structural": structural, "semantic": semantic,
                 "binding": binding}
            )
        else:
            report["positive_cases"] += 1
            report["positive_case_ids"].append(case_id)
    for index, first in enumerate(bundles):
        for second in bundles[index + 1:]:
            report["pairwise_checked"] += 1
            pairwise = pairwise_concurrency_failures(first, second)
            if pairwise:
                report["failures"].append(
                    {
                        "case_id": f"pairwise:{first['case_id']}+{second['case_id']}",
                        "structural": [],
                        "semantic": pairwise,
                    }
                )
    if report["failures"]:
        report["status"] = "fail"
    return report


def main(argv=None):
    args = list(sys.argv[1:] if argv is None else argv[1:])
    path = args[0] if args else None
    semantics_path = args[1] if len(args) > 1 else None
    report = validate(path, semantics_path)
    print(json.dumps(report, indent=1))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())

