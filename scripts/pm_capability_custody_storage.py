"""Pure row-local candidate; no database migration or writer installation."""
from copy import deepcopy
from pm_capability_ensure_custody import schemas, SCHEMA_FILE


def storage_bundle(definition):
    docs, _ = schemas()
    owners = {v["$id"]: (k, v) for k, v in docs.items()}
    output, pending = {"$schema": "https://json-schema.org/draft/2020-12/schema", "$defs": {}}, []
    def key(owner, name):
        return owner.replace(".schema.json", "").replace("-", "_") + "__" + name
    def rewrite(value, owner):
        if isinstance(value, list):
            return [rewrite(v, owner) for v in value]
        if not isinstance(value, dict):
            return deepcopy(value)
        result = {}
        for k, v in value.items():
            if k != "$ref":
                result[k] = rewrite(v, owner)
                continue
            if v.startswith("#/$defs/"):
                target, name = owner, v[len("#/$defs/"):]
            else:
                uri, sep, pointer = v.partition("#/$defs/")
                if not sep or uri not in owners:
                    raise ValueError("unregistered_schema_dependency:" + v)
                target, name = owners[uri][0], pointer
            pending.append((target, name))
            result[k] = "#/$defs/" + key(target, name)
        return result
    output.update(rewrite(docs[SCHEMA_FILE]["$defs"][definition], SCHEMA_FILE))
    while pending:
        owner, name = pending.pop()
        target = key(owner, name)
        if target not in output["$defs"]:
            output["$defs"][target] = rewrite(docs[owner]["$defs"][name], owner)
    output["$defs"] = dict(sorted(output["$defs"].items()))
    return output


def registry_candidate(current):
    """Update precisely two existing family rows and one existing disposition.

    Caller must supply the actual current registry. Unexpected key/schema state
    refuses instead of overwriting an independently landed successor.
    """
    result = deepcopy(current)
    for family, definition in (
        ("capability_provisioning_operation", "capability_provisioning_operation_v2"),
        ("installation_lifecycle_record", "installation_lifecycle_record_v2")):
        matches = [r for r in result["families"] if r["family_id"] == family]
        if len(matches) != 1:
            raise ValueError("family_not_unique:" + family)
        row = matches[0]
        old_key = family + ".v1:{host_id}:{environment_id}:{operation_id}"
        if row["key_shape"] != old_key or row["compatibility_key_shapes"] or row["schema_version"] != "1.0.0":
            raise ValueError("family_requires_readjudication:" + family)
        bundle = storage_bundle(definition)
        row.update(key_shape=family + ".v2:{host_id}:{environment_id}:{operation_id}",
            compatibility_key_shapes=[old_key], schema_version="2.0.0",
            value_schema_id="pm.shared_runtime." + family + ".v2",
            value_schema_ref="Plans/" + SCHEMA_FILE + "#/$defs/" + family + "_current_write",
            value_schema=bundle, required_fields=bundle["required"],
            optional_fields=sorted(set(bundle["properties"]) - set(bundle["required"])))
        def nullable(value):
            if value.get("type") == "null":
                return True
            if "$ref" in value:
                return nullable(bundle["$defs"][value["$ref"].split("/")[-1]])
            return any(nullable(v) for mode in ("oneOf", "anyOf") for v in value.get(mode, []))
        row["nullable_fields"] = sorted(k for k, v in bundle["properties"].items() if nullable(v))
        row["migration_disposition"].update(mode="store_coordinator",
            canonical_write_key_only=True, compatibility_keys_read_only=True, ambiguity_policy="fail_closed",
            alias_dispositions=[dict(key_shape=old_key, disposition="lookup_only")])
        row["migration_disposition"]["source_refs"] = list(dict.fromkeys(
            row["migration_disposition"]["source_refs"] + [row["value_schema_ref"]]))
        row["migration"] = ("StorageMigrationCoordinator admits the v2 writer only after preflight, maintenance "
            "fencing, verified backup/readback, journaled validation and version-last completion. Exact v1 "
            "keys/values remain lookup-only historical readers under their unchanged owner schemas; never "
            "backfill demand, request, permission, lifecycle admission, readiness or settlement to copy them "
            "forward. Active or indeterminate v1 effects remain held for actual owner reconciliation. "
            "No lazy rewrite, dual write, fabricated historical authority, effect replay or SQLite path.")
        row["replay_behavior"] = ("Restore exact v2 current or v1 historical bytes only under the matching "
            "reader/key and verified mandatory backup. Original referenced evidence retains existing stronger "
            "operation/audit/recovery holds. Missing originals or unresolved legacy effects remain disclosed; "
            "historical permission/readiness cannot authorize current effects or continuation.")
        row["legacy_canonical_crosswalk_status"] = (
            "Same existing family: strict v2 current writer and unchanged v1 historical reader. "
            "No fabricated migration lineage or additional family.")
    dispositions = [r for r in result["contract_family_dispositions"]
                    if r["disposition_id"] == "scd.capability.continuation_custody.v1"]
    if len(dispositions) != 1:
        raise ValueError("continuation_disposition_not_unique")
    row = dispositions[0]
    if row["physical_family_status"] != "physical_family_registration_pending":
        raise ValueError("continuation_disposition_requires_readjudication")
    row["physical_family_status"] = "materialized_existing_family"
    row["retention_disposition"] = dict(mode="existing_catalog_policy", refs=["RP-RUNTIME-365D"],
        hold_rule="Preserve existing provisioning-operation retention and every stronger audit, original "
                  "source/result, continuation, replay, recovery or legal hold; originals are not synthesized.",
        expiry_rule="No independent expiry or peer store. The existing policy and stronger holds govern "
                    "embedded demand/waiter/readiness/currentness/settlement and decision evidence.")
    row["migration_rule"] = ("The v2 same-family writer admits the five original CP004 values. Unchanged v1 "
        "key/value is a historical reader only; never fabricate old demand, permission or settlement. "
        "StorageMigrationCoordinator owns version admission and original-lifetime/hold preservation.")
    row["rationale"] = ("Exact same-owner existing-family v2 value composition; not native writer, migration, "
                        "crash/readback or continuation proof. No new physical family or retention policy.")
    row["source_refs"] = list(dict.fromkeys(row["source_refs"] + ["Plans/" + SCHEMA_FILE]))
    return result
