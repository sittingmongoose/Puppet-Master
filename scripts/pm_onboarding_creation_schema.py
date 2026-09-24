"""Author v3 Onboarding additions from exact current owner schemas.

No filesystem writes. Historical v2 definitions are inputs, never modified.
"""
from __future__ import annotations
import copy


def build_onboarding_creation_defs(onboarding, forge):
    def ref(name):
        return {"$ref": "#/$defs/" + name}
    def foreign(name):
        if name not in forge["$defs"]:
            raise ValueError("missing_actual_forge_definition:" + name)
        return {"$ref": forge["$id"] + "#/$defs/" + name}
    def closed(properties, **extra):
        return dict(type="object", additionalProperties=False, required=list(properties), properties=properties, **extra)
    def nullable(value):
        return {"oneOf": [{"type": "null"}, value]}
    def conditional(state, field, value):
        return {"if": {"properties": {"state": {"const": state}}, "required": ["state"]},
                "then": {"properties": {field: value}}}
    safe, sha = ref("safe_ref"), ref("sha256")
    text = ref("bounded_nonsecret_non_empty_string")
    integer = {"type": "integer", "minimum": 1}
    defs = {}
    defs["onboarding_creation_path_selection"] = closed({
        "state": {"enum": ["unresolved", "owner_derived", "explicit"]},
        "value": nullable(text),
    }, allOf=[conditional("explicit", "value", text), conditional("unresolved", "value", {"type": "null"}),
              conditional("owner_derived", "value", {"type": "null"})])
    defs["onboarding_creation_template_selection"] = closed({
        "state": {"enum": ["unresolved", "none", "selected"]}, "ref": nullable(safe),
    }, allOf=[conditional("selected", "ref", safe), conditional("unresolved", "ref", {"type": "null"}),
              conditional("none", "ref", {"type": "null"})])
    defs["onboarding_creation_transport_selection"] = closed({
        "state": {"enum": ["unresolved", "selected"]},
        "value": nullable({"enum": ["automatic", "https", "ssh"]}),
    }, allOf=[conditional("selected", "value", {"enum": ["automatic", "https", "ssh"]}),
              conditional("unresolved", "value", {"type": "null"})])
    defs["onboarding_creation_catalog_binding"] = closed({
        "catalog_ref": safe, "catalog_revision": integer, "catalog_sha256": sha,
    })
    # Pure choice values only; effect owners, capability/permission and current
    # availability are independently supplied by the actual resolved catalog.
    defs["onboarding_creation_option_choice"] = closed({
        "field_id": text,
        "category": copy.deepcopy(forge["$defs"]["creation_option_field_selection"]["properties"]["category"]),
        "value": foreign("creation_option_value"),
    })
    defs["onboarding_creation_options_selection"] = closed({
        "state": {"enum": ["unresolved", "none", "selected"]},
        "catalog_binding": nullable(ref("onboarding_creation_catalog_binding")),
        "choices": {"type": "array", "items": ref("onboarding_creation_option_choice")},
    }, allOf=[
        {"if": {"properties": {"state": {"const": "unresolved"}}},
         "then": {"properties": {"catalog_binding": {"type": "null"}, "choices": {"maxItems": 0}}}},
        {"if": {"properties": {"state": {"const": "none"}}},
         "then": {"properties": {"choices": {"maxItems": 0}}}},
        {"if": {"properties": {"state": {"const": "selected"}}},
         "then": {"properties": {"catalog_binding": ref("onboarding_creation_catalog_binding"), "choices": {"minItems": 1}}}},
    ])
    defs["onboarding_azure_team_project_selection"] = closed({
        "mode": {"enum": ["existing", "create"]},
        "existing_project_ref": nullable(safe), "project_name": nullable(text),
        "visibility": nullable({"enum": ["private", "public"]}),
        "process_template_ref": nullable(safe), "version_control": {"const": "git"},
    }, allOf=[
        {"if": {"properties": {"mode": {"const": "existing"}}},
         "then": {"properties": {"existing_project_ref": safe, "project_name": {"type": "null"},
                                   "visibility": {"type": "null"}, "process_template_ref": {"type": "null"}}},
         "else": {"properties": {"existing_project_ref": {"type": "null"}, "project_name": text,
                                   "visibility": {"enum": ["private", "public"]}, "process_template_ref": safe}}},
    ])
    defs["onboarding_repository_creation_selection"] = closed({
        "path_selection": ref("onboarding_creation_path_selection"),
        "source_template_selection": ref("onboarding_creation_template_selection"),
        "git_transport_selection": ref("onboarding_creation_transport_selection"),
        "provider_options_selection": ref("onboarding_creation_options_selection"),
        "azure_team_project_selection": nullable(ref("onboarding_azure_team_project_selection")),
    })
    draft = copy.deepcopy(onboarding["$defs"]["onboarding_setup_plan"])
    draft["title"] = "OnboardingSetupPlanV3"
    draft["properties"]["schema_id"] = {"const": "pm.product_onboarding.setup_plan.v3"}
    draft["properties"]["repository_creation_selection"] = nullable(ref("onboarding_repository_creation_selection"))
    draft["required"].append("repository_creation_selection")
    create_path = {"properties": {"online_mode": {"const": "new"}, "journey": {"const": "new_or_local"},
                                   "project_mode": {"not": {"const": "later"}}},
                   "required": ["online_mode", "journey", "project_mode"]}
    draft["allOf"].append({"if": create_path, "then": {"properties": {
        "repository_creation_selection": ref("onboarding_repository_creation_selection")}},
        "else": {"properties": {"repository_creation_selection": {"type": "null"}}}})
    draft["allOf"].append({"if": {"properties": {"forge": {"not": {"const": "azure_devops"}}}, "required": ["forge"]},
                          "then": {"properties": {"repository_creation_selection": {"properties": {"azure_team_project_selection": {"type": "null"}}}}}})
    # Pre-release v3 correction: a genuinely new Azure project has no existing
    # project selection. The copied historical v2 rule is never changed in place.
    azure_create = {"properties": {"repository_creation_selection": {
        "type": "object", "required": ["azure_team_project_selection"],
        "properties": {"azure_team_project_selection": {
            "type": "object", "required": ["mode"],
            "properties": {"mode": {"const": "create"}}}}}},
        "required": ["repository_creation_selection"]}
    azure_rules = [rule for rule in draft["allOf"]
        if rule.get("if", {}).get("properties", {}).get("forge") == {"const": "azure_devops"}]
    if len(azure_rules) != 1:
        raise ValueError("azure_normal_project_rule_count")
    azure_rule = azure_rules[0]
    if azure_rule["then"]["properties"].pop("repository_project") != text:
        raise ValueError("azure_historical_project_constraint_changed")
    azure_rule["then"]["allOf"] = [{"if": azure_create,
        "then": {"properties": {"repository_project": {"const": ""}}},
        "else": {"properties": {"repository_project": text}}}]
    defs["onboarding_setup_plan_v3"] = draft
    defs["onboarding_setup_plan_current_write"] = ref("onboarding_setup_plan_v3")

    session = copy.deepcopy(onboarding["$defs"]["onboarding_session"])
    session["properties"]["schema_id"] = {"const": "pm.product_onboarding.session.v3"}
    session["properties"]["schema_version"] = {"const": "3.0.0"}
    session["properties"].update({"draft_format_disposition": {"enum": ["current_v3", "retained_owner_chain_v2"]},
                                  "historical_owner_chain_ref": nullable(safe)})
    session["required"] += ["draft_format_disposition", "historical_owner_chain_ref"]
    embedded = {"oneOf": [ref("onboarding_setup_plan_v3"), ref("onboarding_setup_plan")]}
    session["properties"]["setup_draft"] = nullable(embedded)
    for rule in session["allOf"]:
        then = rule.get("then", {}).get("properties", {})
        if then.get("setup_draft") == ref("onboarding_setup_plan"):
            then["setup_draft"] = copy.deepcopy(embedded)
    session["allOf"].append({
        "if": {"properties": {"draft_format_disposition": {"const": "current_v3"}}},
        "then": {"properties": {"setup_draft": nullable(ref("onboarding_setup_plan_v3")), "historical_owner_chain_ref": {"type": "null"}}},
        "else": {"properties": {"setup_draft": ref("onboarding_setup_plan"), "historical_owner_chain_ref": safe},
                 "anyOf": [
                     {"properties": {"project_disposition": {"const": "committed"}}, "required": ["project_disposition"]},
                     {"properties": {"active_branch": {"type": "object", "properties": {"owner_phase": {"const": "project_commit"}},
                                                         "required": ["owner_phase"]}}, "required": ["active_branch"]},
                 ]},
    })
    defs["onboarding_session_v3"] = session
    defs["onboarding_session_current_write"] = ref("onboarding_session_v3")
    defs["onboarding_draft_format_migration"] = closed({
        "schema_id": {"const": "pm.product_onboarding.draft_format_migration.v1"},
        "migration_id": safe, "storage_migration_receipt_ref": safe,
        "source_session_ref": safe, "source_session_sha256": sha,
        "source_schema_id": {"const": "pm.product_onboarding.session.v2"},
        "target_session_ref": safe, "target_session_sha256": sha,
        "target_schema_id": {"const": "pm.product_onboarding.session.v3"},
        "source_key_shape": {"const": "onboarding_state.v3:{onboarding_session_id}"},
        "target_key_shape": {"const": "onboarding_state.v4:{onboarding_session_id}"},
        "disposition": {"enum": ["new_review_required", "retained_committed", "retained_reconciling", "no_draft"]},
        "historical_owner_chain_ref": nullable(safe),
        "retained_draft_sha256": nullable(sha), "owner_work_replayed": {"const": False},
        "emits_peer_storage_receipt": {"const": False}, "migrated_at_utc": {"type": "string", "format": "date-time"},
    }, allOf=[{
        "if": {"properties": {"disposition": {"enum": ["retained_committed", "retained_reconciling"]}}},
        "then": {"properties": {"historical_owner_chain_ref": safe, "retained_draft_sha256": sha}},
        "else": {"properties": {"historical_owner_chain_ref": {"type": "null"}, "retained_draft_sha256": {"type": "null"}}},
    }])
    return defs


def extend_onboarding_schema(onboarding, forge):
    result = copy.deepcopy(onboarding)
    defs = build_onboarding_creation_defs(onboarding, forge)
    for name, definition in defs.items():
        if name in result["$defs"] and result["$defs"][name] != definition:
            raise ValueError("definition_conflict:" + name)
        result["$defs"][name] = definition
    for name in ("onboarding_setup_plan_v3", "onboarding_session_v3", "onboarding_draft_format_migration"):
        item = {"$ref": "#/$defs/" + name}
        if item not in result["oneOf"]:
            result["oneOf"].append(item)
    return result


def build_onboarding_v3_storage_bundle(onboarding, project, settings, forge):
    """Four explicit offline owners; no arbitrary URI/network resolver."""
    sources = dict(onboarding=onboarding, project=project, settings=settings, forge=forge)
    by_uri = {schema["$id"]: name for name, schema in sources.items()}
    root = copy.deepcopy(onboarding["$defs"]["onboarding_session_v3"])
    common = onboarding["$defs"]["onboarding_durable_setup_state_fields"]
    for name, definition in common["properties"].items():
        if name in root["properties"] and root["properties"][name] != definition:
            raise ValueError("onboarding_storage_mixin_property_conflict:" + name)
        root["properties"][name] = copy.deepcopy(definition)
    root["required"] = list(dict.fromkeys(root["required"] + common["required"]))
    root["allOf"] = [r for r in root["allOf"] if r != {"$ref": "#/$defs/onboarding_durable_setup_state_fields"}]
    root["allOf"] += copy.deepcopy(common["allOf"])
    root.pop("unevaluatedProperties", None)
    root["additionalProperties"] = False
    pending, bundled = set(), {}
    def rewrite(value, namespace):
        if isinstance(value, list):
            return [rewrite(x, namespace) for x in value]
        if not isinstance(value, dict):
            return value
        output = {}
        for key, child in value.items():
            if key != "$ref":
                output[key] = rewrite(child, namespace)
                continue
            if child.startswith("#/$defs/"):
                target, name = namespace, child.removeprefix("#/$defs/")
            else:
                uri, separator, name = child.partition("#/$defs/")
                if not separator or uri not in by_uri:
                    raise ValueError("onboarding_storage_unbound_owner_ref:" + child)
                target = by_uri[uri]
            if name not in sources[target]["$defs"]:
                raise ValueError("onboarding_storage_missing_owner_definition:" + child)
            pending.add((target, name))
            output[key] = "#/$defs/" + target + "__" + name
        return output
    root = rewrite(root, "onboarding")
    while pending:
        namespace, name = min(pending)
        pending.remove((namespace, name))
        key = namespace + "__" + name
        if key not in bundled:
            bundled[key] = rewrite(sources[namespace]["$defs"][name], namespace)
    return {"$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": "https://puppetmaster.local/schemas/storage_value/onboarding_state/3.0.0/onboarding_state.schema.json",
            **root, "$defs": dict(sorted(bundled.items()))}


def materialized_v3_registry(registry, bundle):
    """Return exact existing registry with only onboarding_state binding revised."""
    result = copy.deepcopy(registry)
    matches = [r for r in result["families"] if r["family_id"] == "onboarding_state"]
    if len(matches) != 1:
        raise ValueError("onboarding_storage_family_count")
    row = matches[0]
    previous_key = "onboarding_state.v3:{onboarding_session_id}"
    current_key = "onboarding_state.v4:{onboarding_session_id}"
    if row["key_shape"] not in {previous_key, current_key}:
        raise ValueError("unexpected_source_write_key")
    if row["key_shape"] == previous_key:
        row["key_shape"] = current_key
        row["compatibility_key_shapes"] = [previous_key] + row["compatibility_key_shapes"]
    elif not row["compatibility_key_shapes"] or row["compatibility_key_shapes"][0] != previous_key:
        raise ValueError("missing_source_compatibility_key")
    row["value_schema_id"] = bundle["properties"]["schema_id"]["const"]
    row["value_schema_ref"] = "Plans/product_onboarding_contracts.schema.json#/$defs/onboarding_session_v3"
    row["schema_version"] = bundle["properties"]["schema_version"]["const"]
    row["value_schema"] = copy.deepcopy(bundle)
    row["required_fields"] = copy.deepcopy(bundle["required"])
    row["optional_fields"] = sorted(set(bundle["properties"]) - set(bundle["required"]))
    def nullable(value):
        if value.get("type") == "null" or "null" in value.get("type", []):
            return True
        if "$ref" in value:
            return nullable(bundle["$defs"][value["$ref"].removeprefix("#/$defs/")])
        return any(nullable(x) for key in ("oneOf", "anyOf") for x in value.get(key, []))
    row["nullable_fields"] = sorted(key for key, value in bundle["properties"].items() if nullable(value))
    old_intro = "Restore the latest valid v2 session under the v3 session key"
    row["replay_behavior"] = row["replay_behavior"].replace(old_intro, "Restore the latest valid v3 session under the v4 session key")
    new_rule = ("The v3-key/v2-value predecessor is copied forward to the v4-key/v3-value writer only by StorageMigrationCoordinator. "
                "Editable uncommitted drafts retain all normal choices, gain unresolved advanced choices, increment draft/session revision and continuation generation, "
                "and require new Review without inherited approval. Retained committed or reconciling Project chains preserve original approved v2 draft bytes/hash, "
                "owner revision/generation/branch/return fields and are not new-create admission. Active non-Project owner work blocks copy-forward until its actual owner settles it; "
                "the old row/key/refs remain untouched. pm.product_onboarding.draft_format_migration.v1 records the exact source/target hashes and disposition "
                "against the sole pm.storage_value.migration_receipt.v1 and never emits a peer receipt or replays owner work. ")
    if not row["migration"].startswith(new_rule):
        row["migration"] = new_rule + row["migration"].replace("New writes use v3 only", "New writes use v4 only")
    row["redaction_no_secret_rule"] = row["redaction_no_secret_rule"].replace("to v2 values", "to v3 values and retained historical v2 lineage")
    row["legacy_canonical_crosswalk_status"] = ("canonical v4 session key and v3 value; v3 session-key/v2 value and older predecessor keys are coordinator-only migration inputs; "
        "retained approved v2 Project-owner chains are historical non-dispatchable lineage, not dual-read or new-create authority")
    aliases = row["migration_disposition"]["alias_dispositions"]
    if not any(a["key_shape"] == previous_key for a in aliases):
        aliases.insert(0, {"key_shape": previous_key, "disposition": "coordinator_copy_forward"})
    owner_schema = "Plans/product_onboarding_contracts.schema.json"
    target_ids = {
        "scd.product_onboarding.session.v1": "pm.product_onboarding.session.v3",
        "scd.product_onboarding.migration.v1": "pm.product_onboarding.draft_format_migration.v1",
        "scd.product_onboarding.actions.v1": "pm.product_onboarding.setup_plan.v3",
    }
    for disposition in result["contract_family_dispositions"]:
        new_id = target_ids.get(disposition["disposition_id"])
        if new_id is None:
            continue
        if new_id not in disposition["record_kinds"]:
            disposition["record_kinds"].append(new_id)
        # Aggregate URI covers both historical decoding and current versions.
        disposition["schema_ref"] = owner_schema
        if disposition["disposition_id"] != "scd.product_onboarding.actions.v1":
            if not disposition["migration_rule"].startswith(new_rule):
                disposition["migration_rule"] = new_rule + disposition["migration_rule"].replace("New writes use v3 only", "New writes use v4 only")
        if disposition["disposition_id"] == "scd.product_onboarding.session.v1":
            disposition["rationale"] = ("The existing onboarding_state family writes v3 Session/v3 reviewed choices under the v4 key, preserving historical v2 decoding "
                "and immutable non-dispatchable approved Project-owner lineage. Return contexts still retain refs rather than duplicate draft bodies. "
                "No family, retention policy, native store, effect or runtime migration is added or certified.")
    return result


def materialized_v3_redaction(registry):
    """Extend only existing Onboarding transform coverage, preserving its policy."""
    result = copy.deepcopy(registry)
    rows = result["transforms"]
    row = next(r for r in rows if r["transform_id"] == "rt.onboarding_state.v1")
    for schema_id in ("pm.product_onboarding.session.v3", "pm.product_onboarding.setup_plan.v3", "pm.product_onboarding.draft_format_migration.v1"):
        if schema_id not in row["applies_to"]:
            row["applies_to"].append(schema_id)
    addition = (" Versioned v3 drafts preserve explicit unresolved/None/Automatic/selected distinctions and typed catalog values; protected option material is reference-only. "
                "Approved historical v2 Project-owner chains remain byte/hash-identical and non-dispatchable, with exact source/target migration hashes; "
                "migration neither grants approval nor replays owner work.")
    if not row["output_rule"].endswith(addition):
        row["output_rule"] += addition
    return result
