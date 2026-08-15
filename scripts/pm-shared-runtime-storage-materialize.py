#!/usr/bin/env python3
"""Deterministically materialize closed shared-runtime storage families.

The canonical owner schemas remain standalone.  Storage registry v2 requires an
inline, transitively bundled Draft 2020-12 schema for every materialized family,
so this tool copies exact owner definitions and their reachable local $defs.
It does not create a database, execute a migration, or confer Event Authority,
PNC-019 closure, buildability, or runtime certification.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]
REGISTRY_PATH = ROOT / "Plans/storage_value_registry.json"
REGISTRY_SCHEMA_PATH = ROOT / "Plans/storage_value_registry.schema.json"
SHARED_SCHEMA_PATH = ROOT / "Plans/shared_runtime_contracts.schema.json"
GOAL_SCHEMA_PATH = ROOT / "Plans/goal_runtime_lineage.schema.json"
RECOVERY_SCHEMA_PATH = ROOT / "Plans/storage_recovery_contracts.schema.json"
SHARED_OWNER = "Plans/Shared_Integration_Runtime.md"
STORAGE_OWNER = "Plans/storage-plan.md#shared-integration-runtime-persistence-and-migration-addendum-2026-08-13"


@dataclass(frozen=True)
class FamilySpec:
    family_id: str
    schema_path: Path
    definition_name: str
    key_shape: str
    owner_doc: str
    producer: tuple[str, ...]
    consumers: tuple[str, ...]
    retention_policy_ref: str
    canonical: bool
    storage_kind: str = "redb"


def shared(
    family_id: str,
    key_shape: str,
    owner_fragment: str,
    producer: str,
    consumers: tuple[str, ...],
    *,
    retention: str = "RP-RUNTIME-365D",
    canonical: bool = True,
    storage_kind: str | None = None,
    owner_doc_override: str | None = None,
) -> FamilySpec:
    return FamilySpec(
        family_id=family_id,
        schema_path=SHARED_SCHEMA_PATH,
        definition_name=family_id,
        key_shape=key_shape,
        owner_doc=owner_doc_override or f"{SHARED_OWNER}{owner_fragment}",
        producer=(producer,),
        consumers=consumers,
        retention_policy_ref=retention,
        canonical=canonical,
        storage_kind=storage_kind or ("redb" if canonical else "redb_projection"),
    )


FAMILY_SPECS: tuple[FamilySpec, ...] = (
    shared("runtime_topology_projection", "runtime_topology_projection.v1:{project_id}:{projection_id}", "#3-server-first-topology", "RuntimeTopologyService", ("Project settings", "Doctor", "Prompt runtime", "all exact-target command handlers"), canonical=False),
    shared("installation_lifecycle_record", "installation_lifecycle_record.v1:{host_id}:{environment_id}:{operation_id}", "#4-installation-capability-and-readiness-lifecycle", "InstallationLifecycleManager", ("CapabilityProvisioner", "Doctor", "Settings", "restart recovery")),
    shared("environment_connection_state", "environment_connection_state.v1:{environment_id}:{supervisor_generation}", "#5-durable-environment-connection-and-domain-synchronization", "EnvironmentConnectionSupervisor", ("thread projections", "Usage", "terminal", "testing and debug", "Doctor")),
    shared("environment_domain_sync_state", "environment_domain_sync_state.v1:{environment_id}:{domain}:{domain_generation}", "#5-durable-environment-connection-and-domain-synchronization", "domain synchronization owner", ("thread shell and detail", "Usage", "provider catalog", "terminal", "testing and debug")),
    shared("runtime_resource_admission", "runtime_resource_admission.v1:{host_id}:{admission_id}", "#8-host-local-runtime-resource-governor-and-observable-work", "RuntimeResourceGovernor", ("all resource consumers", "ObservableWork", "Doctor", "Usage")),
    shared("observable_work_projection", "observable_work_projection.v1:{host_id}:{work_id}", "#8-host-local-runtime-resource-governor-and-observable-work", "ObservableWork projector", ("Chat", "Orchestrator", "Doctor", "Usage"), canonical=False),
    shared("operational_awareness_projection", "operational_awareness_projection.v1:{scope_ref}:{projection_id}", "#9-leases-and-operational-awareness", "OperationalAwarenessService", ("Doctor", "Orchestrator", "Chat", "Source Control", "Runtime Artifacts", "Usage"), canonical=False),
    shared("prompt_runtime_projection", "prompt_runtime_projection.v1:{snapshot_id}", "#3-server-first-topology", "Prompt runtime projection builder", ("Prompt Pipeline", "provider dispatch admission", "audit"), canonical=False),
    FamilySpec("permission_snapshot_record", SHARED_SCHEMA_PATH, "permission_snapshot_record", "permission_snapshot_record.v1:{project_id}:{snapshot_id}", "Plans/Permissions_System.md#shared-runtime-dispatch-admission-boundary-2026-08-13", ("Permissions System immutable attempt-snapshot writer",), ("Executor admission", "ProviderDispatchAdmissionService", "restart and recovery"), "RP-AUTHORITY-INDEFINITE", True),
    shared("provider_dispatch_admission_receipt", "provider_dispatch_admission_receipt.v1:{project_id}:{receipt_id}", "#11-provider-dispatch-admission", "ProviderDispatchAdmissionService", ("provider adapters", "Prompt Pipeline", "Usage", "restart and recovery")),
    shared("installation_inventory_record", "installation_inventory_record.v1:{host_id}:{environment_id}:{inventory_id}", "#46-closed-inventory-and-provisioning-vocabularies", "InstallationResolver", ("InstallationLifecycleManager", "CapabilityProvisioner", "Doctor", "Settings"), canonical=False),
    shared("capability_provisioning_operation", "capability_provisioning_operation.v1:{host_id}:{environment_id}:{operation_id}", "#46-closed-inventory-and-provisioning-vocabularies", "CapabilityProvisioner", ("Tools", "Doctor", "Settings", "ObservableWork")),
    shared("conditional_rule_record", "conditional_rule_record.v1:{project_id}:{rule_id}:{rule_version}", "#12-time-traveling-conditional-rules", "ConditionalRuleEngine", ("Prompt Pipeline", "Permissions", "process repair"), retention="RP-CONFIG-CURRENT"),
    shared("conditional_rule_intervention_receipt", "conditional_rule_intervention_receipt.v1:{project_id}:{receipt_id}", "#12-time-traveling-conditional-rules", "ConditionalRuleEngine", ("Prompt Pipeline", "Usage", "audit")),
    shared("runtime_resource_lease", "runtime_resource_lease.v1:{lease_id}", "#91-leasecoordinator", "LeaseCoordinator", ("RuntimeResourceGovernor", "DebugSessionBroker", "EvalSessionBroker", "MCP", "worktrees", "testing")),
    shared("bsd_runtime_record", "bsd_runtime_record.v1:{project_id}:{assignment_id}:{attempt_id}", "#13-back-seat-driver", "BackSeatDriverService", ("Chat", "Usage", "Settings", "operational awareness")),
    shared("dev_session_record", "dev_session_record.v1:{project_id}:{dev_session_id}", "#101-debugsession", "DebugSessionBroker", ("Testing and Debug", "Runtime Artifacts", "restart recovery"), retention="RP-DEBUG-30D"),
    shared("eval_session_record", "eval_session_record.v1:{project_id}:{eval_session_id}", "#102-evalsession", "EvalSessionBroker", ("Tools", "Runtime Artifacts", "restart recovery"), retention="RP-DEBUG-30D"),
    shared("thread_command_outbox_record", "thread_command_outbox_record.v1:{project_id}:{thread_id}:{command_instance_id}", "#6-cross-platform-thread-command-outbox", "ThreadCommandOutbox", ("Chat", "Goal controls", "thread projections", "Usage"), retention="RP-DELIVERY-365D"),
    shared("replay_snapshot_checkpoint", "replay_snapshot_checkpoint.v1:{environment_id}:{domain}:{checkpoint_id}", "#7-cursor-replay-snapshot-live-buffering-and-coalescing", "ProjectionReplayCoordinator", ("domain projectors", "Doctor", "operational awareness"), retention="RP-PROJECTION-3GEN", canonical=False, storage_kind="redb_checkpoint"),
    shared("stream_coalescing_record", "stream_coalescing_record.v1:{stream_id}:{stream_generation}", "#7-cursor-replay-snapshot-live-buffering-and-coalescing", "StreamCoalescer", ("Chat stream projection", "Usage", "terminal-state publisher"), canonical=False),
    shared("thread_shell_projection", "thread_shell_projection.v1:{project_id}:{thread_id}", "#6-cross-platform-thread-command-outbox", "Assistant Chat thread projector", ("thread rail", "search", "operational awareness"), retention="RP-PROJECTION-3GEN", canonical=False, owner_doc_override="Plans/assistant-chat-design.md#ACD-445"),
    shared("pinned_summary_projection", "pinned_summary_projection.v1:{project_id}:{thread_id}", "#6-cross-platform-thread-command-outbox", "Assistant Chat pinned-summary projector", ("pinned thread rail", "search"), retention="RP-PROJECTION-3GEN", canonical=False, owner_doc_override="Plans/assistant-chat-design.md#ACD-445"),
    shared("thread_detail_projection", "thread_detail_projection.v1:{project_id}:{thread_id}:{detail_generation}", "#7-cursor-replay-snapshot-live-buffering-and-coalescing", "Assistant Chat focused-thread projector", ("focused thread detail", "search", "operational awareness"), retention="RP-PROJECTION-3GEN", canonical=False, owner_doc_override="Plans/assistant-chat-design.md#ACD-445"),
    shared("mcp_server_lifecycle_record", "mcp_server_lifecycle_record.v1:{server_id}:{runtime_generation}", "#10-debugsession-and-evalsession-shared-lifecycle", "MCP lifecycle owner", ("Tools", "Skills", "Doctor", "Settings", "restart recovery"), owner_doc_override="Plans/MCP_Integration.md#MI-040"),
    shared("operational_attribution_record", "operational_attribution_record.v1:{project_id}:{operation_id}", "#154-usage-and-operational-attribution", "Usage operational attribution writer", ("Usage", "Doctor", "audit", "operational awareness"), retention="RP-OPERATIONAL-2555D", owner_doc_override="Plans/usage-feature.md#UF-091"),
    FamilySpec("goal_runtime_lineage_record", GOAL_SCHEMA_PATH, "goal_runtime_lineage_record", "goal_runtime_lineage_record.v1:{project_id}:{goal_id}", "Plans/Goal_Runtime_System.md#durable-goal-runtime-lineage", ("Goal Runtime System",), ("Plans", "threads", "agents", "Orchestrator", "server continuation", "restart recovery"), "RP-AUTHORITY-INDEFINITE", True),
)

MATERIALIZED_FAMILY_IDS = tuple(spec.family_id for spec in FAMILY_SPECS)


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def local_ref_names(value: Any) -> set[str]:
    names: set[str] = set()
    if isinstance(value, dict):
        ref = value.get("$ref")
        if isinstance(ref, str) and ref.startswith("#/$defs/"):
            names.add(ref.removeprefix("#/$defs/"))
        for child in value.values():
            names.update(local_ref_names(child))
    elif isinstance(value, list):
        for child in value:
            names.update(local_ref_names(child))
    return names


def transitive_definitions(schema: dict[str, Any], root_name: str) -> dict[str, Any]:
    definitions = schema["$defs"]
    pending = list(local_ref_names(definitions[root_name]))
    collected: dict[str, Any] = {}
    while pending:
        name = pending.pop()
        if name == root_name or name in collected:
            continue
        if name not in definitions:
            raise ValueError(f"{root_name} references missing local definition {name}")
        collected[name] = copy.deepcopy(definitions[name])
        pending.extend(local_ref_names(definitions[name]) - collected.keys())
    return {name: collected[name] for name in sorted(collected)}


def bundled_value_schema(spec: FamilySpec) -> dict[str, Any]:
    schema = read_json(spec.schema_path)
    Draft202012Validator.check_schema(schema)
    definition = copy.deepcopy(schema["$defs"][spec.definition_name])
    bundle = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": f"https://puppetmaster.local/schemas/storage_value/{spec.family_id}/1.0.0/{spec.family_id}.schema.json",
        **definition,
        "$defs": transitive_definitions(schema, spec.definition_name),
    }
    Draft202012Validator.check_schema(bundle)
    return bundle


def allows_null(value: dict[str, Any], definitions: dict[str, Any]) -> bool:
    if value.get("type") == "null" or (
        isinstance(value.get("type"), list) and "null" in value["type"]
    ):
        return True
    ref = value.get("$ref")
    if isinstance(ref, str) and ref.startswith("#/$defs/"):
        return allows_null(definitions[ref.removeprefix("#/$defs/")], definitions)
    return any(
        allows_null(branch, definitions)
        for key in ("oneOf", "anyOf")
        for branch in value.get(key, [])
    )


def disposition_fields(spec: FamilySpec, source_refs: list[str]) -> dict[str, Any]:
    if spec.canonical:
        restore_mode = "mandatory_backup"
        authority_class = "canonical_non_rebuildable"
        strategy = "restore_from_mandatory_backup"
        backup_required = True
        data_loss = True
    else:
        restore_mode = "rebuild_from_authority"
        authority_class = "derived_rebuildable"
        strategy = "rebuild_from_canonical_events_and_snapshot"
        backup_required = False
        data_loss = False
    return {
        "migration_disposition": {
            "mode": "current_schema",
            "canonical_write_key_only": True,
            "compatibility_keys_read_only": False,
            "ambiguity_policy": "not_applicable",
            "source_refs": source_refs,
        },
        "restore_disposition": {
            "mode": restore_mode,
            "transaction_family_id": None,
            "outcome_owner_ref": STORAGE_OWNER,
            "mutation_fence_on_unresolved": True,
            "source_refs": source_refs,
        },
        "recovery_disposition": {
            "authority_class": authority_class,
            "strategy": strategy,
            "source_family_ids": [],
            "source_refs": source_refs,
            "backup_required": backup_required,
            "data_loss_if_unavailable": data_loss,
            "user_disclosure_required": True,
        },
    }


def family_row(spec: FamilySpec) -> dict[str, Any]:
    schema = read_json(spec.schema_path)
    value_schema = bundled_value_schema(spec)
    properties = value_schema.get("properties", {})
    required = list(value_schema.get("required", []))
    optional = sorted(set(properties) - set(required))
    nullable = sorted(
        name for name, property_schema in properties.items()
        if allows_null(property_schema, schema["$defs"])
    )
    schema_id = properties.get("schema_id", {}).get(
        "const", f"pm.storage_value.{spec.family_id}.v1"
    )
    source_refs = [spec.owner_doc, STORAGE_OWNER, str(spec.schema_path.relative_to(ROOT)) + f"#/$defs/{spec.definition_name}"]
    recovery_phrase = (
        "Restore exact canonical bytes from a verified mandatory backup; absence or corruption stays a disclosed recovery failure."
        if spec.canonical
        else "Quarantine invalid bytes and rebuild only from the named canonical owner records under a currentness fence; never treat this projection as authority."
    )
    return {
        "family_id": spec.family_id,
        "storage_kind": spec.storage_kind,
        "status": "materialized",
        "tier": "later_gui_or_feature_projection",
        "key_shape": spec.key_shape,
        "compatibility_key_shapes": [],
        "value_schema_id": schema_id,
        "value_schema_ref": str(spec.schema_path.relative_to(ROOT)) + f"#/$defs/{spec.definition_name}",
        "owner_doc": spec.owner_doc,
        "producer": list(spec.producer),
        "consumers": list(spec.consumers),
        "schema_version": "1.0.0",
        "encoding": "messagepack_canonical",
        "required_fields": required,
        "optional_fields": optional,
        "nullable_fields": nullable,
        "replay_behavior": recovery_phrase,
        "migration": (
            "StorageMigrationCoordinator creates or copy-forwards this exact-key family transactionally, validates the bundled owner schema and backup/rebuild basis, records verification, and writes the store version last. No lazy rewrite-on-read or SQLite path is permitted."
        ),
        **disposition_fields(spec, source_refs),
        "retention_compaction": (
            "Retain under the named policy and stronger holds. Compaction preserves identity, generation/epoch, terminal truth, source/currentness refs, and recovery evidence; canonical records are never reconstructed from a UI projection."
        ),
        "retention_policy_ref": spec.retention_policy_ref,
        "redaction_no_secret_rule": (
            "Store canonical IDs, hashes, decisions, and non-secret refs only. Reject raw credentials, tokens, auth values, provider-visible bytes, local absolute paths, and protected AuthBrowserSession content."
        ),
        "legacy_canonical_crosswalk_status": (
            "First exact materialization of the accepted owner schema. Any grouped inventory mention remains source lineage only and cannot substitute for this family."
        ),
        "value_schema": value_schema,
    }


def hardened_migration_receipt_row(row: dict[str, Any]) -> dict[str, Any]:
    spec = FamilySpec(
        "migration_receipt",
        RECOVERY_SCHEMA_PATH,
        "migration_receipt",
        row["key_shape"],
        row["owner_doc"],
        tuple(row["producer"]),
        tuple(row["consumers"]),
        row["retention_policy_ref"],
        True,
    )
    schema = read_json(RECOVERY_SCHEMA_PATH)
    value_schema = bundled_value_schema(spec)
    properties = value_schema["properties"]
    required = list(value_schema["required"])
    updated = copy.deepcopy(row)
    updated["value_schema_ref"] = (
        "Plans/storage_recovery_contracts.schema.json#/$defs/migration_receipt"
    )
    updated["required_fields"] = required
    updated["optional_fields"] = sorted(set(properties) - set(required))
    updated["nullable_fields"] = sorted(
        name for name, property_schema in properties.items()
        if allows_null(property_schema, schema["$defs"])
    )
    updated["migration"] = (
        "The exact value schema is owned by Plans/storage_recovery_contracts.schema.json#/$defs/migration_receipt. "
        "StorageMigrationCoordinator emits it only after recursive preflight arithmetic, transition, step, verification, timestamp, rollback, data-risk, and non-secret-ref validation. Progress remains journal-derived and is not a receipt."
    )
    updated["value_schema"] = value_schema
    return updated


def split_superseded_group_members(row: dict[str, Any]) -> dict[str, Any]:
    """Remove exact keys that now have a separately materialized sole owner."""
    updated = copy.deepcopy(row)
    if row.get("family_id") == "tooling_skill_debug_families":
        members = [member.strip() for member in row["key_shape"].split("|")]
        members = [
            member
            for member in members
            if not member.startswith("dev_session_record.v1:")
        ]
        updated["key_shape"] = " | ".join(members)
        updated["producer"] = ["tooling, MCP, skill, and debug-investigation projectors"]
        updated["deferred_reason"] = (
            "Remaining MCP definition/tool, skill readiness, and debug-investigation families await their named owners; "
            "dev_session_record.v1 is separately materialized and is not part of this grouped family."
        )
    return updated


def validate_registry_semantics(registry: dict[str, Any]) -> None:
    rows = registry["families"]
    ids = [row["family_id"] for row in rows]
    retention_ids = {row["policy_id"] for row in registry["retention_policies"]}
    if "provider_request_permit" in ids:
        raise ValueError("ProviderRequestPermit is ephemeral and must never be a storage family")
    for family_id in MATERIALIZED_FAMILY_IDS:
        if ids.count(family_id) != 1:
            raise ValueError(f"materialized family {family_id} must occur exactly once")
    claimed_keys: dict[str, str] = {}
    for row in rows:
        if row["retention_policy_ref"] not in retention_ids:
            raise ValueError(
                f"{row['family_id']} references unknown retention policy {row['retention_policy_ref']}"
            )
        for source_family_id in row.get("recovery_disposition", {}).get("source_family_ids", []):
            if source_family_id not in ids:
                raise ValueError(f"{row['family_id']} references unknown source family {source_family_id}")
        if row.get("status") in {"materialized", "compatibility_alias"}:
            for key in (part.strip() for part in row["key_shape"].split("|")):
                if key in claimed_keys:
                    raise ValueError(
                        f"storage key shape {key} has two live authorities: {claimed_keys[key]} and {row['family_id']}"
                    )
                claimed_keys[key] = row["family_id"]
    by_id = {row["family_id"]: row for row in rows}
    for spec in FAMILY_SPECS:
        row = by_id[spec.family_id]
        authority = row["recovery_disposition"]["authority_class"]
        backup = row["recovery_disposition"]["backup_required"]
        restore = row["restore_disposition"]["mode"]
        if spec.canonical and (authority != "canonical_non_rebuildable" or not backup or restore != "mandatory_backup"):
            raise ValueError(f"canonical family {spec.family_id} has rebuildable disposition")
        if not spec.canonical and (authority != "derived_rebuildable" or backup or restore != "rebuild_from_authority"):
            raise ValueError(f"derived family {spec.family_id} has canonical disposition")


def expected_registry(registry: dict[str, Any]) -> dict[str, Any]:
    registry = copy.deepcopy(registry)
    registry_schema = read_json(REGISTRY_SCHEMA_PATH)
    replacements = {spec.family_id: family_row(spec) for spec in FAMILY_SPECS}
    original_ids = [row["family_id"] for row in registry["families"]]
    base_rows = [
        hardened_migration_receipt_row(row)
        if row["family_id"] == "migration_receipt"
        else split_superseded_group_members(row)
        for row in registry["families"]
        if row["family_id"] not in replacements
    ]
    anchor_index = next(
        (index for index, row in enumerate(base_rows) if row["family_id"] == "requested_effective_runtime"),
        len(base_rows),
    )
    ordered_materialized = [replacements[spec.family_id] for spec in FAMILY_SPECS]
    registry["families"] = (
        base_rows[:anchor_index] + ordered_materialized + base_rows[anchor_index:]
    )
    ids = [row["family_id"] for row in registry["families"]]
    if len(ids) != len(set(ids)):
        raise ValueError("storage family IDs are not unique after materialization")
    expected_count = len(original_ids) + len(set(replacements) - set(original_ids))
    if len(ids) != expected_count:
        raise ValueError(f"expected {expected_count} families, found {len(ids)}")
    for family_id in MATERIALIZED_FAMILY_IDS:
        if family_id not in registry["mvp_required_family_ids"]:
            registry["mvp_required_family_ids"].append(family_id)
    registry["generated_at_utc"] = "2026-08-14T00:00:00Z"
    Draft202012Validator.check_schema(registry_schema)
    Draft202012Validator(registry_schema).validate(registry)
    for spec in FAMILY_SPECS:
        Draft202012Validator.check_schema(replacements[spec.family_id]["value_schema"])
    validate_registry_semantics(registry)
    return registry


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=("apply", "check"))
    args = parser.parse_args()
    original_bytes = REGISTRY_PATH.read_bytes()
    original_sha256 = hashlib.sha256(original_bytes).hexdigest()
    expected = expected_registry(json.loads(original_bytes))
    rendered = json.dumps(expected, indent=2, ensure_ascii=False) + "\n"
    current = original_bytes.decode("utf-8")
    if args.mode == "check":
        if current != rendered:
            print("shared_runtime_storage_materialization_stale")
            return 1
        print("shared_runtime_storage_materialization_current")
        return 0
    if hashlib.sha256(REGISTRY_PATH.read_bytes()).hexdigest() != original_sha256:
        print("shared_runtime_storage_materialization_refused_concurrent_registry_change")
        return 2
    descriptor, temporary_name = tempfile.mkstemp(
        dir=REGISTRY_PATH.parent,
        prefix=".storage_value_registry.",
        suffix=".tmp",
    )
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
            handle.write(rendered)
            handle.flush()
            os.fsync(handle.fileno())
        if hashlib.sha256(REGISTRY_PATH.read_bytes()).hexdigest() != original_sha256:
            print("shared_runtime_storage_materialization_refused_concurrent_registry_change")
            return 2
        os.replace(temporary_name, REGISTRY_PATH)
        temporary_name = ""
    finally:
        if temporary_name and Path(temporary_name).exists():
            Path(temporary_name).unlink()
    print(f"shared_runtime_storage_materialization_applied_from_sha256={original_sha256}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
