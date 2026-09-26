"""Static Decision_Log DL-095 Replace-import reset joins, not import execution.

The only observations consumed here are explicit fixture values plus the frozen
canonical inventory registry (`Plans/settings_inventory.json`), which
Settings_System SSYS-004 binds as the machine authority for ordinary setting
IDs and whose own data derives a row's category from its ID prefix.  No ambient
Project state, registry service, clock, transport, or provider work runs; a
passing join is schema/fixture consistency only and never implies that a
runtime preview, apply, or snapshot behavior exists or was exercised.

v8 (typed owner/value companion, SSYS-007.A) on top of the frozen v5 stage:

1. Classification stays owner-issued machine data (`management_kind`) with two
   values added from the SSYS-007.A table of record: `value_dependent` (the
   row takes the ordinary branch only for an owner-validated portable value
   form) and `run_scoped` (creation/run-scoped preference outside durable
   Project Replace state).  The prior v5 blanket `type:path ->
   local_environment` classification is corrected to the owner table; no
   missing-field fallback to ordinary exists and unknown values fail closed.
2. A value-dependent row is Replace-admissible only through typed owner-read
   records carried on the witness: one `project_root_binding` per role
   (source/destination) and one `import_value_form_binding` per in-scope
   value-dependent row.  The binding declares the admitted portable
   `value_form` for the source-provided value, the `destination_value_form`
   whose read decides destination-owned custody, the root-read hashes, both
   revisions, and the canonical digests of the exact source and
   destination-current values validated.  Everything joins: foreign project
   identity, stale revisions, foreign roots, changed source values (even
   under a self-consistently rehashed snapshot), and changed
   destination-current values (even under fully rebuilt settlement bytes)
   fail closed.  A caller Boolean, a path prefix, a safe-looking ref, a
   copied hash, or a self-declared `excluded_settings` entry is not
   authority.
3. Refuse-only shape checks: a declared form is contradicted by a value that
   is host-absolute, home-relative, drive-bound, an environment-variable form,
   a `..` escape above the Project root, empty, or — for the owner-defined
   symbolic default — not exactly the registry default token.  The checks
   never admit: admission authority is the typed record alone.  The
   portable_remote_reference branch carries no syntax authority at all (no
   scheme/host rules are invented here); unsupported forms simply stay
   unproved and fail closed.
4. Independent owner-read boundary (v9): the source/destination Project
   identity, revision, root, and value-form/currentness classifications are
   bound to an independently selected trusted owner read passed SEPARATELY
   from the submitted witness (`owner_read`); the witness's own binding
   records must equal that read field-for-field.  A witness whose foreign or
   stale project/root/revision/value/digest set is co-mutated consistently
   inside one record still fails, because the independent read does not move
   with it.  A Replace scope containing value-dependent rows without the
   independent read fails closed (`owner_read_unavailable`).  The fixture
   harness/test double supplies these records; it is not native issuer
   authentication, and no runtime owner service runs.
5. A destination-current value read as `environment_bound` keeps the row
   destination-owned for that Replace: it must be disclosed as excluded, is
   never imported, and is never reset — an omission can never erase local
   state by claiming the source omitted it (SSYS-007.A).
5. Carried unchanged from the reviewed v5 stage: the admitted
   `project_settings_snapshot` / `settings_export_v1` source kinds with their
   byte-digest and source-value joins, the DL-095 omission-reset set
   (including the ordinary non-path denominator), credential/owner_destination
   exclusion, before/after hash bindings, and the deterministic projected
   post-apply settlement.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any

INVENTORY_SCHEMA_ID = "pm.settings_inventory.v1"
# SSYS-009/SSYS-010 derive the effective built-in variant from the persisted
# theme family plus presentation-mode pair; the inventory row whose options are
# exactly those eight derived display variants carries its default in display
# space, so the persisted family token is the variant's first word.
VARIANT_RE = re.compile(r"(Friendly|Glass|Retro|Basic) (Light|Dark)")

WITNESS_DEFINITION = "settings_import_replace_resolution_witness"
SNAPSHOT_RECORD_TYPE = "project_settings_snapshot"
SNAPSHOT_SCHEMA_ID = "pm.project_settings_snapshot.v1"
EXPORT_MANIFEST_RECORD_TYPE = "settings_export_manifest"
EXPORT_MANIFEST_SCHEMA_ID = "pm.settings_export_manifest.v1"
EXPORT_ARTIFACT_FORMAT = "pm-settings-export-json-v1"
MIGRATION_PREVIEW_RECORD_TYPE = "settings_migration_preview"
MIGRATION_PREVIEW_SCHEMA_ID = "pm.settings_migration_preview.v1"

# The two import source kinds with owner-issued presence/currentness and bytes
# (see module docstring).  Mapping: witness source_kind -> the record type and
# schema id the embedded source evidence must carry.
ADMITTED_SOURCE_KINDS = {
    "project_settings_snapshot": (SNAPSHOT_RECORD_TYPE, SNAPSHOT_SCHEMA_ID),
    "settings_export_v1": (EXPORT_MANIFEST_RECORD_TYPE, EXPORT_MANIFEST_SCHEMA_ID),
}

# The registry owner's machine classification values (see module docstring).
# Only "ordinary" is unconditionally Replace-eligible; "value_dependent" rows
# are conditionally eligible through the typed owner read; every other value,
# a missing field on a non-action row, or an unknown value fails closed.
AUTHORITY_EXCLUDED_CLASSES = ("credential", "local_environment", "owner_destination", "run_scoped")
ORDINARY_CLASS = "ordinary"
VALUE_DEPENDENT_CLASS = "value_dependent"
ENVIRONMENT_BOUND = "environment_bound"
PORTABLE_VALUE_FORMS = (
    "project_root_relative",
    "project_root_placeholder",
    "symbolic_default",
    "portable_remote_reference",
)

_CACHE: dict[tuple[str, int, int], tuple[dict, str, str]] = {}


def _load_inventory(path: Path) -> tuple[dict, str]:
    data = path.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    stat = path.stat()
    key = (str(path.resolve()), stat.st_mtime_ns, stat.st_size)
    cached = _CACHE.get(key)
    if cached is not None and cached[2] == digest:
        return cached[0], cached[1]
    registry = json.loads(data)
    _CACHE[key] = (registry, digest, digest)
    return registry, digest


def canonical_digest(record: dict, without: str) -> str:
    """The documented snapshot content-hash preimage: canonical compact JSON
    of the record minus the hash field itself, with sorted keys."""
    payload = {key: value for key, value in record.items() if key != without}
    return hashlib.sha256(
        json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()


def canonical_bytes_digest(value: Any) -> tuple[str, int]:
    """Content hash and byte length of an embedded JSON value under the same
    canonical serialization (fixture-level convention for the detached export
    artifact, whose bytes the manifest binds by content_sha256/byte_length)."""
    payload = json.dumps(value, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(payload).hexdigest(), len(payload)


def normalized_default(row: dict) -> Any:
    """Registry default in the persisted value space (see VARIANT_RE above)."""
    options = row.get("options") or []
    if options and all(VARIANT_RE.fullmatch(option) for option in options):
        default = row.get("default")
        if isinstance(default, str) and VARIANT_RE.fullmatch(default):
            return default.split(" ")[0]
    return row.get("default")


def classify_setting(row: Any) -> str:
    """Owner-issued machine classification of one registry row.

    Returns one of: "owner_destination", "credential", "local_environment",
    "run_scoped", "value_dependent", "owner_undecided", "action", "ordinary",
    "unclassified".  Only "ordinary" rows are unconditionally Replace-import
    eligible; "value_dependent" rows need the typed owner read on the witness.
    The owner-typed `management_kind` field governs; description/search prose,
    ID shapes, and the JSON field type are never consulted.
    """
    if not isinstance(row, dict):
        return "unclassified"
    kind = row.get("management_kind")
    if kind is None:
        # One-shot action rows are typed by `type` (SSYS-004); any other row
        # without the required machine field fails closed.
        return "action" if row.get("type") == "action" else "unclassified"
    if kind == "owner_destination":
        # SSYS-039/F3-441 owner join: typed searchable destination over a named
        # owner's custody (FS-010 formatter custody; DRY method-guard custody).
        return "owner_destination"
    if kind == "credential":
        # SSYS-008/MA-070: credential-bearing row; the raw value lives only in
        # the operating-system credential store, never in Project settings.
        return "credential"
    if kind == "local_environment":
        # SSYS-007: environment-specific local value, including the
        # GAAAF-004/Tools OAuth loopback bind-host row.
        return "local_environment"
    if kind == "run_scoped":
        # SSYS-007.A: creation/run-scoped preference outside durable Project
        # Replace state.
        return "run_scoped"
    if kind == "value_dependent":
        # SSYS-007.A: ordinary branch only for an owner-validated portable
        # value form bound to actual source/destination Project identity,
        # revision, root, and preview/apply currentness.
        return "value_dependent"
    if kind == "unresolved":
        # REVIEW-2: owner prose has not settled transferability; fail closed
        # rather than silently classifying either way.
        return "owner_undecided"
    if kind == "ordinary":
        # SSYS-004 keeps one-shot actions outside the ordinary denominator
        # even when a registry row would otherwise read ordinary.
        return "action" if row.get("type") == "action" else ORDINARY_CLASS
    return "unclassified"


def _value_form_shape_contradiction(value: Any, form: Any, row: dict) -> bool:
    """Refuse-only contradiction check between a declared portable form and
    the actual value.  Never admits: the typed owner-read record is the sole
    admission authority.  The refusals mirror SSYS-007.A's own exclude list
    (host-absolute, home-relative, drive-bound, environment-bound), the
    structural `..` escape above the Project root, the empty value, the
    owner-defined `${PROJECT_ROOT}` placeholder form, and the exact
    owner-defined symbolic default token.  The portable_remote_reference
    branch carries no syntax authority: nothing is admitted or banned by
    string parsing, and unsupported forms stay unproved (fail closed)."""
    if form == ENVIRONMENT_BOUND:
        # The owner read the value as environment-specific; no portable shape
        # is declared to contradict.
        return False
    if not isinstance(value, str) or value == "":
        return True
    if form == "project_root_placeholder":
        return not value.startswith("${PROJECT_ROOT}")
    if form == "symbolic_default":
        return value != normalized_default(row)
    if form == "project_root_relative":
        if value.startswith("/") or value.startswith("\\") or value.startswith("~"):
            return True
        if len(value) >= 2 and value[1] == ":" and value[0].isalpha():
            return True
        if value.startswith("$HOME") or value.startswith("${HOME}"):
            return True
        depth = 0
        for part in value.replace("\\", "/").split("/"):
            if part == "..":
                depth -= 1
                if depth < 0:
                    return True
            elif part not in ("", "."):
                depth += 1
        return False
    if form == "portable_remote_reference":
        return False
    # Unknown declared form: fail closed.
    return True


def settings_import_semantic_failures(
    definition_name: str,
    value: Any,
    settings_inventory_path: Path | None = None,
    owner_read: Any = None,
) -> list[str]:
    if not isinstance(value, dict):
        return []
    if definition_name == WITNESS_DEFINITION:
        return witness_failures(value, settings_inventory_path, owner_read=owner_read)
    if definition_name not in {
        "settings_transaction_preview",
        "settings_transaction_preview_existing_project",
    }:
        return []
    import_mode = value.get("import_mode")
    if value.get("operation_kind") != "import" or import_mode == "merge":
        # Reset disclosure belongs to Replace-mode imports only.  Merge gains
        # no reset semantics and other operation kinds carry no import fields.
        if "import_resets" in value or "import_source_snapshot_sha256" in value:
            return ["import_merge_or_nonimport_carries_reset_set"]
        return []
    if import_mode != "replace":
        return []
    resets = value.get("import_resets")
    exact_ids = value.get("exact_setting_ids")
    proposed = value.get("proposed_values_by_setting_id")
    if not isinstance(resets, list) or not isinstance(exact_ids, list) or not isinstance(proposed, dict):
        return ["import_reset_join_malformed"]
    failures: list[str] = []
    reset_ids: list[Any] = []
    excluded = {
        row.get("setting_id")
        for row in value.get("excluded_settings", [])
        if isinstance(row, dict)
    }
    # SSYS-007/SSYS-008 disclosures must be independently backed by the
    # frozen owner authority: a preview cannot declare an ordinary row
    # "excluded" to shrink the DL-095 reset set by self-declaration.
    if settings_inventory_path is None or not settings_inventory_path.exists():
        return ["inventory_registry_unreadable"]
    try:
        inventory, _ = _load_inventory(settings_inventory_path)
    except (OSError, ValueError):
        return ["inventory_registry_unreadable"]
    rows_by_id = row_index(inventory)
    for setting_id in sorted(excluded):
        row = rows_by_id.get(setting_id)
        if row is None or classify_setting(row) not in AUTHORITY_EXCLUDED_CLASSES:
            failures.append("preview_exclusion_not_owner_backed")
    for entry in resets:
        if not isinstance(entry, dict):
            return ["import_reset_join_malformed"]
        setting_id = entry.get("setting_id")
        reset_ids.append(setting_id)
        # The preview-fixed reset set is exact: every reset is one of the IDs
        # the preview binds, carries its own bound after value, and never
        # reaches an authority-excluded local, credential, owner-destination,
        # or run-scoped setting (SSYS-007/SSYS-007.A/SSYS-008/MA-070 and the
        # management_kind join).  A value_dependent reset is class-admitted
        # here and confirmed at the witness's typed owner read.
        if setting_id not in exact_ids:
            failures.append("import_reset_outside_exact_ids")
        row = rows_by_id.get(setting_id)
        setting_class = classify_setting(row) if row is not None else "unclassified"
        if setting_class not in (ORDINARY_CLASS, VALUE_DEPENDENT_CLASS):
            failures.append("import_reset_touches_excluded_setting")
        if setting_id in excluded:
            failures.append("import_reset_touches_excluded_setting")
        if setting_id not in proposed:
            failures.append("import_reset_without_bound_after_value")
        elif proposed[setting_id] != entry.get("value_after"):
            failures.append("import_reset_after_value_mismatch")
    if len(set(reset_ids)) != len(reset_ids):
        failures.append("import_reset_ids_not_unique")
    return sorted(set(failures))


def _destination_state_failures(destination: dict, witness: dict) -> list[str]:
    failures: list[str] = []
    values = destination.get("values_by_setting_id")
    sources = destination.get("source_by_setting_id")
    digest = destination.get("content_sha256")
    if not isinstance(values, dict) or not isinstance(sources, dict) or not isinstance(digest, str):
        failures.append("witness_destination_snapshot_bytes_unavailable")
        return failures
    if digest != canonical_digest(destination, "content_sha256"):
        failures.append("witness_destination_snapshot_bytes_digest_mismatch")
    if set(values) != set(sources):
        failures.append("witness_snapshot_map_keys_mismatch")
    if destination.get("inventory_schema_version") != witness.get("inventory_schema_version"):
        failures.append("witness_snapshot_inventory_version_mismatch")
    return failures


def _export_source_failures(preview: dict, witness: dict) -> tuple[list[str], set]:
    """Join-2 for `settings_export_v1`: the manifest, migration preview, and
    typed artifact evidence must carry owner-issued presence/currentness,
    bytes, and the source-value mapping the Replace proposals must equal.
    Returns (failures, source-provided IDs)."""
    failures: list[str] = []
    manifest = witness.get("export_manifest")
    migration = witness.get("migration_preview")
    artifact = witness.get("export_artifact")
    if not all(isinstance(record, dict) for record in (manifest, migration, artifact)):
        failures.append("witness_source_export_evidence_malformed")
        return failures, set()
    if (
        manifest.get("record_type") != EXPORT_MANIFEST_RECORD_TYPE
        or manifest.get("schema_id") != EXPORT_MANIFEST_SCHEMA_ID
        or manifest.get("format") != EXPORT_ARTIFACT_FORMAT
        or manifest.get("detached") is not True
        or manifest.get("credential_material_included") is not False
    ):
        failures.append("witness_source_export_manifest_mismatch")
        return failures, set()
    if (
        migration.get("record_type") != MIGRATION_PREVIEW_RECORD_TYPE
        or migration.get("schema_id") != MIGRATION_PREVIEW_SCHEMA_ID
        or migration.get("source_kind") != "settings_export_v1"
        or migration.get("confirmation_required") is not True
        or migration.get("auto_apply") is not False
        or migration.get("legacy_source_authoritative") is not False
    ):
        failures.append("witness_source_export_migration_mismatch")
        return failures, set()
    if (
        artifact.get("record_type") != "settings_export_artifact"
        or artifact.get("format") != EXPORT_ARTIFACT_FORMAT
        or artifact.get("project_id") != preview.get("source_project_id")
        or artifact.get("source_revision") != preview.get("source_revision")
    ):
        failures.append("witness_source_export_manifest_mismatch")
        return failures, set()
    # Owner joins: the manifest is the export of exactly the preview's source
    # Project/revision (and of exactly the embedded artifact); the migration
    # preview binds those bytes and this preview.
    if (
        manifest.get("project_id") != preview.get("source_project_id")
        or manifest.get("source_revision") != preview.get("source_revision")
        or manifest.get("project_id") != artifact.get("project_id")
        or manifest.get("source_revision") != artifact.get("source_revision")
    ):
        failures.append("witness_source_export_manifest_mismatch")
    if (
        migration.get("source_sha256") != manifest.get("content_sha256")
        or migration.get("transaction_preview_ref") != preview.get("preview_id")
        or migration.get("destination_project_id") != preview.get("destination_project_id")
        or migration.get("expected_destination_revision") != preview.get("expected_destination_revision")
    ):
        failures.append("witness_source_export_migration_mismatch")
    if preview.get("import_source_snapshot_sha256") != manifest.get("content_sha256"):
        failures.append("witness_source_snapshot_hash_mismatch")
    # Artifact bytes: recomputed digest and length must equal the manifest's.
    digest, length = canonical_bytes_digest(artifact)
    if digest != manifest.get("content_sha256") or length != manifest.get("byte_length"):
        failures.append("witness_source_export_artifact_bytes_mismatch")
    # Source-provided IDs: the owner-typed migration record and the typed
    # artifact value map must agree.
    mappable = migration.get("mappable_setting_ids")
    source_keys = set(mappable) if isinstance(mappable, list) else set()
    artifact_values = artifact.get("values_by_setting_id")
    if not isinstance(artifact_values, dict):
        failures.append("witness_source_export_evidence_malformed")
        return failures, set()
    if set(artifact_values) != source_keys:
        failures.append("witness_source_export_artifact_ids_mismatch")
        return failures, set()
    # Source-value join: every preview proposal for a source-provided ID must
    # equal the artifact's value for that ID (the REVIEW-PROBE-V3-EXPORT-MAPPING
    # counterexample — altered artifact value under a consistently rebound
    # digest — fails here).
    proposed = preview.get("proposed_values_by_setting_id")
    exact_ids = preview.get("exact_setting_ids") or []
    if not isinstance(proposed, dict):
        failures.append("import_reset_join_malformed")
        return failures, set()
    for setting_id in sorted(source_keys & set(exact_ids)):
        if proposed.get(setting_id) != artifact_values.get(setting_id):
            failures.append("witness_source_export_value_mismatch")
    return failures, source_keys


def _projected_post_apply_failures(
    witness: dict,
    preview: dict,
    destination: dict,
    source_keys: set,
) -> list[str]:
    """Join-3: the projected post-apply snapshot must be the deterministic
    settlement of the preview onto the destination state, and the preview's
    before/after hashes must bind destination bytes and projected bytes."""
    projected = witness.get("projected_post_apply_snapshot")
    failures: list[str] = []
    dest_values = destination.get("values_by_setting_id")
    dest_sources = destination.get("source_by_setting_id")
    if not isinstance(projected, dict) or not isinstance(dest_values, dict) or not isinstance(dest_sources, dict):
        failures.append("witness_post_apply_projection_malformed")
        return failures
    if (
        projected.get("record_type") != SNAPSHOT_RECORD_TYPE
        or projected.get("schema_id") != SNAPSHOT_SCHEMA_ID
        or projected.get("project_id") != destination.get("project_id")
    ):
        failures.append("witness_post_apply_projection_malformed")
        return failures
    digest = projected.get("content_sha256")
    values = projected.get("values_by_setting_id")
    sources = projected.get("source_by_setting_id")
    if not isinstance(values, dict) or not isinstance(sources, dict) or not isinstance(digest, str):
        failures.append("witness_post_apply_projection_bytes_unavailable")
        return failures
    if digest != canonical_digest(projected, "content_sha256"):
        failures.append("witness_post_apply_projection_bytes_digest_mismatch")
        return failures

    # Deterministic settlement: destination state with the preview's exact-ID
    # proposals applied; provenance source-provided -> "imported", omission
    # reset -> "restored_default", untouched IDs keep destination provenance.
    expected_values = dict(dest_values)
    expected_sources = dict(dest_sources)
    proposed = preview.get("proposed_values_by_setting_id") or {}
    exact_ids = preview.get("exact_setting_ids") or []
    reset_ids = {
        entry.get("setting_id")
        for entry in preview.get("import_resets") or []
        if isinstance(entry, dict)
    }
    for setting_id in exact_ids:
        if setting_id in proposed:
            expected_values[setting_id] = proposed[setting_id]
            if setting_id in reset_ids:
                expected_sources[setting_id] = "restored_default"
            elif setting_id in source_keys:
                expected_sources[setting_id] = "imported"
    if values != expected_values or sources != expected_sources:
        failures.append("witness_post_apply_projection_settlement_mismatch")

    # before/after hashes bind destination bytes and projected bytes (the
    # §3.1 canonical preimage semantics; see module docstring).
    if preview.get("before_sha256") != destination.get("content_sha256"):
        failures.append("preview_before_destination_hash_mismatch")
    if preview.get("after_sha256") != digest:
        failures.append("preview_after_projection_hash_mismatch")
    return failures


def _typed_owner_value_failures(
    witness: dict,
    preview: dict,
    rows_by_id: dict,
    classification: dict,
    source_keys: set,
    source_values: dict,
    destination_values: dict,
    owner_read: Any = None,
) -> tuple[list[str], list[str], dict[str, dict]]:
    """SSYS-007.A join: every value-dependent row in the Replace scope needs a
    typed owner read bound to the frozen preview, and the witness's binding
    records must equal the independently selected owner read.  Returns
    (failures, the extended eligible list, destination-owned bindings)."""
    failures: list[str] = []
    eligible: list[str] = []
    destination_owned: dict[str, dict] = {}
    scope_value_dependent = [
        setting_id
        for setting_id, setting_class in classification.items()
        if setting_class == VALUE_DEPENDENT_CLASS
    ]
    if scope_value_dependent and owner_read is None:
        # Fail closed: without the independently selected owner read no
        # value-dependent admission, reset, or omission is authorized.
        failures.append("owner_read_unavailable")
        return failures, eligible, destination_owned
    owner_source: dict | None = None
    owner_destination: dict | None = None
    owner_forms: dict = {}
    if owner_read is not None:
        if not isinstance(owner_read, dict) or not isinstance(owner_read.get("source"), dict) or not isinstance(owner_read.get("destination"), dict):
            failures.append("owner_read_malformed")
        else:
            owner_source = owner_read["source"]
            owner_destination = owner_read["destination"]
            forms = owner_read.get("value_forms_by_setting_id")
            if forms is not None and not isinstance(forms, dict):
                failures.append("owner_read_malformed")
            elif isinstance(forms, dict):
                owner_forms = forms
            if owner_source.get("project_id") != preview.get("source_project_id") or owner_source.get("revision") != preview.get("source_revision"):
                failures.append("owner_read_identity_mismatch")
            if owner_destination.get("project_id") != preview.get("destination_project_id") or owner_destination.get("revision") != preview.get("expected_destination_revision"):
                failures.append("owner_read_identity_mismatch")

    root_bindings = witness.get("project_root_bindings")
    source_binding: dict | None = None
    destination_binding: dict | None = None
    if root_bindings is not None:
        if (
            not isinstance(root_bindings, list)
            or len(root_bindings) != 2
            or not all(isinstance(record, dict) for record in root_bindings)
            or len({record.get("role") for record in root_bindings}) != 2
        ):
            failures.append("witness_project_root_bindings_malformed")
        else:
            for record in root_bindings:
                if record.get("role") == "source":
                    source_binding = record
                else:
                    destination_binding = record
            if source_binding is not None and (
                source_binding.get("project_id") != preview.get("source_project_id")
                or source_binding.get("revision") != preview.get("source_revision")
            ):
                failures.append("witness_project_root_binding_identity_mismatch")
            if destination_binding is not None and (
                destination_binding.get("project_id") != preview.get("destination_project_id")
                or destination_binding.get("revision") != preview.get("expected_destination_revision")
            ):
                failures.append("witness_project_root_binding_identity_mismatch")
            if owner_read is not None and isinstance(owner_read, dict) and isinstance(owner_read.get("source"), dict) and isinstance(owner_read.get("destination"), dict):
                # The submitted root reads must be exactly the independently
                # selected owner reads; a co-mutated foreign/stale set that is
                # internally consistent still differs from the read of record.
                if source_binding != owner_read["source"] or destination_binding != owner_read["destination"]:
                    failures.append("owner_read_root_binding_mismatch")

    bindings_by_id: dict[str, dict] = {}
    value_bindings = witness.get("value_form_bindings")
    if value_bindings is not None:
        if not isinstance(value_bindings, list):
            failures.append("witness_value_form_binding_malformed")
        else:
            seen_setting_ids: set[str] = set()
            for record in value_bindings:
                if isinstance(record, dict) and isinstance(record.get("setting_id"), str):
                    # One owner-read binding per value-dependent setting.  A
                    # repeated setting_id is refused before the mapping is
                    # built: a schema-valid second record with a distinct
                    # value must never silently overwrite (or be silently
                    # overwritten by) the record the owner read validated.
                    if record["setting_id"] in seen_setting_ids:
                        failures.append("witness_value_form_binding_duplicate")
                    seen_setting_ids.add(record["setting_id"])
                    bindings_by_id[record["setting_id"]] = record
                else:
                    failures.append("witness_value_form_binding_malformed")

    for setting_id in sorted(classification):
        if classification[setting_id] != VALUE_DEPENDENT_CLASS:
            continue
        row = rows_by_id.get(setting_id)
        admitted = row.get("portable_value_forms") if isinstance(row, dict) else None
        if not isinstance(admitted, list) or not admitted:
            # A value-dependent row without owner-admitted portable forms is
            # an unclassifiable scope row: fail closed.
            failures.append("inventory_row_unclassified_fail_closed")
            continue
        record = bindings_by_id.pop(setting_id, None)
        if record is None:
            failures.append("witness_value_form_binding_missing")
            continue
        # Independent-read join: the submitted binding must equal the
        # separately selected owner read for this row, field for field.
        owner_record = owner_forms.get(setting_id)
        if owner_record is None:
            failures.append("owner_read_value_form_missing")
        elif owner_record != record:
            failures.append("owner_read_value_form_mismatch")
        source_form = record.get("value_form")
        destination_form = record.get("destination_value_form")
        # Root-read join: the binding must reference exactly the witness's
        # typed source/destination root reads, and those reads must be the
        # preview's own source/destination identity and revisions.
        if source_binding is None or destination_binding is None:
            failures.append("witness_project_root_bindings_malformed")
        else:
            if (
                record.get("source_project_root_sha256") != source_binding.get("project_root_sha256")
                or record.get("destination_project_root_sha256")
                != destination_binding.get("project_root_sha256")
            ):
                failures.append("witness_value_form_root_binding_mismatch")
        if record.get("source_revision") != preview.get("source_revision") or record.get(
            "destination_revision"
        ) != preview.get("expected_destination_revision"):
            failures.append("witness_value_form_revision_mismatch")
        # Source admission: a source-provided value needs an owner-admitted
        # portable form whose recorded digest still matches the exact source
        # value (a rehashed snapshot cannot refresh a stale read), and the
        # value must not contradict the declared form.
        if setting_id in source_keys:
            if source_form is None or source_form not in admitted:
                failures.append("witness_value_form_not_owner_admitted")
            else:
                recorded = record.get("source_value_sha256")
                if not isinstance(recorded, str):
                    failures.append("witness_value_form_binding_incomplete")
                else:
                    digest, _ = canonical_bytes_digest(source_values.get(setting_id))
                    if recorded != digest:
                        failures.append("witness_value_form_source_value_changed")
                    if _value_form_shape_contradiction(source_values.get(setting_id), source_form, row):
                        failures.append("witness_value_form_shape_contradiction")
        elif source_form is not None:
            failures.append("witness_value_form_source_form_without_source_value")
        # Destination custody: the destination-current read decides whether
        # the row is resettable/eligible or destination-owned for this
        # Replace; its recorded digest must still match (a rebuilt apply-time
        # snapshot cannot refresh a stale read).
        if destination_form is None or (
            destination_form != ENVIRONMENT_BOUND and destination_form not in admitted
        ):
            failures.append("witness_value_form_not_owner_admitted")
        if setting_id not in destination_values:
            failures.append("witness_value_form_destination_value_unbound")
        else:
            digest, _ = canonical_bytes_digest(destination_values[setting_id])
            if record.get("destination_current_value_sha256") != digest:
                failures.append("witness_value_form_destination_current_changed")
            if destination_form is not None and destination_form != ENVIRONMENT_BOUND:
                if _value_form_shape_contradiction(destination_values[setting_id], destination_form, row):
                    failures.append("witness_value_form_shape_contradiction")
        if destination_form == ENVIRONMENT_BOUND:
            destination_owned[setting_id] = record
        elif destination_form in admitted:
            eligible.append(setting_id)

    # Any remaining binding does not belong to an in-scope value-dependent
    # row: no portable branch is admitted for it.
    for setting_id in sorted(bindings_by_id):
        failures.append("witness_value_form_not_owner_admitted")
    # Owner-read records for rows outside the value-dependent scope are not
    # authority for anything either.
    for setting_id in sorted(set(owner_forms) - set(scope_value_dependent)):
        failures.append("owner_read_value_form_mismatch")
    return failures, eligible, destination_owned


def witness_failures(
    witness: dict,
    settings_inventory_path: Path | None,
    owner_read: Any = None,
) -> list[str]:
    if settings_inventory_path is None or not settings_inventory_path.exists():
        return ["inventory_registry_unreadable"]
    try:
        inventory, inventory_sha256 = _load_inventory(settings_inventory_path)
    except (OSError, ValueError):
        return ["inventory_registry_unreadable"]

    failures: list[str] = []
    if witness.get("inventory_sha256") != inventory_sha256:
        # An unrelated registry snapshot cannot satisfy the join.
        failures.append("inventory_binding_hash_mismatch")
    if witness.get("inventory_schema_version") != inventory.get("schema_version"):
        failures.append("inventory_binding_version_mismatch")

    preview = witness.get("preview_record")
    destination = witness.get("destination_snapshot")
    resets = witness.get("resolved_import_resets")
    if not isinstance(preview, dict) or not isinstance(destination, dict) or not isinstance(resets, list):
        failures.append("import_reset_join_malformed")
        return sorted(set(failures))

    if preview.get("operation_kind") != "import" or preview.get("import_mode") != "replace":
        failures.append("witness_preview_not_replace_import")
        return sorted(set(failures))

    for field in ("preview_id", "preview_generation", "preview_sha256"):
        if witness.get(field) != preview.get(field):
            failures.append("witness_preview_identity_mismatch")
    if preview.get("inventory_schema_version") != witness.get("inventory_schema_version"):
        failures.append("witness_preview_inventory_version_mismatch")

    # Destination currentness: the joined before-state must be the exact record
    # the witness binds — right Project, right revision, right bytes.
    if destination.get("project_id") != preview.get("destination_project_id"):
        failures.append("witness_destination_snapshot_project_mismatch")
    if destination.get("revision") != preview.get("expected_destination_revision"):
        failures.append("witness_destination_snapshot_revision_mismatch")
    if destination.get("content_sha256") != witness.get("destination_snapshot_sha256"):
        failures.append("witness_destination_snapshot_hash_mismatch")
    failures.extend(_destination_state_failures(destination, witness))

    # Source-kind admission (correction 3/4): only kinds with owner-issued
    # presence/currentness, bytes, and value mapping are admitted.
    source_kind = witness.get("source_kind")
    admitted = ADMITTED_SOURCE_KINDS.get(source_kind)
    source_keys: set = set()
    source_values: dict = {}
    if admitted is None:
        failures.append("witness_source_kind_not_admitted")
    elif source_kind == "project_settings_snapshot":
        source = witness.get("source_snapshot")
        if (
            not isinstance(source, dict)
            or source.get("record_type") != admitted[0]
            or source.get("schema_id") != admitted[1]
        ):
            failures.append("witness_source_kind_record_mismatch")
        else:
            if source.get("project_id") != preview.get("source_project_id"):
                failures.append("witness_source_snapshot_project_mismatch")
            if source.get("revision") != preview.get("source_revision"):
                failures.append("witness_source_snapshot_revision_mismatch")
            if source.get("content_sha256") != preview.get("import_source_snapshot_sha256"):
                failures.append("witness_source_snapshot_hash_mismatch")
            src_values = source.get("values_by_setting_id")
            src_sources = source.get("source_by_setting_id")
            src_digest = source.get("content_sha256")
            if not isinstance(src_values, dict) or not isinstance(src_sources, dict) or not isinstance(src_digest, str):
                failures.append("witness_source_snapshot_bytes_unavailable")
            else:
                if src_digest != canonical_digest(source, "content_sha256"):
                    failures.append("witness_source_snapshot_bytes_digest_mismatch")
                if set(src_values) != set(src_sources):
                    failures.append("witness_snapshot_map_keys_mismatch")
                if source.get("inventory_schema_version") != witness.get("inventory_schema_version"):
                    failures.append("witness_snapshot_inventory_version_mismatch")
                source_keys = set(src_values)
                source_values = src_values
                # Source-value join (correction 5): every preview proposal for a
                # source-provided ID must equal the snapshot's value for that ID
                # (the REVIEW-PROBE-V4-SNAPSHOT-MAPPING counterexample fails here,
                # symmetric with the export-artifact value join).
                proposed = preview.get("proposed_values_by_setting_id")
                exact_ids = preview.get("exact_setting_ids") or []
                if not isinstance(proposed, dict):
                    failures.append("import_reset_join_malformed")
                else:
                    for setting_id in sorted(source_keys & set(exact_ids)):
                        if proposed.get(setting_id) != src_values.get(setting_id):
                            failures.append("witness_source_snapshot_value_mismatch")
    elif source_kind == "settings_export_v1":
        export_failures, export_keys = _export_source_failures(preview, witness)
        failures.extend(export_failures)
        source_keys = export_keys
        artifact_values = (witness.get("export_artifact") or {}).get("values_by_setting_id")
        if isinstance(artifact_values, dict):
            source_values = artifact_values

    # Category scope: the chosen categories must exist in the frozen registry,
    # whose own data derives each row's category from its ID prefix.
    categories = {category.get("id") for category in inventory.get("categories", []) if isinstance(category, dict)}
    chosen = witness.get("chosen_category_ids")
    if not isinstance(chosen, list) or any(category not in categories for category in chosen):
        failures.append("import_category_unknown_to_inventory")
        return sorted(set(failures))

    # Eligible ordinary scope: registry rows of the chosen categories the
    # owner's machine field classifies "ordinary", plus value-dependent rows
    # admitted through the typed owner read.  Missing/unknown classification
    # fails closed.
    excluded_declared = {
        row.get("setting_id")
        for row in preview.get("excluded_settings", [])
        if isinstance(row, dict)
    }
    eligible: list[str] = []
    authority_excluded_in_scope: list[str] = []
    classification: dict[str, str] = {}
    for row in inventory.get("settings", []):
        setting_id = row.get("id") if isinstance(row, dict) else None
        if not isinstance(setting_id, str) or setting_id.split(".", 1)[0] not in chosen:
            continue
        setting_class = classify_setting(row)
        classification[setting_id] = setting_class
        if setting_class == ORDINARY_CLASS:
            eligible.append(setting_id)
        elif setting_class in AUTHORITY_EXCLUDED_CLASSES:
            authority_excluded_in_scope.append(setting_id)
        elif setting_class == "owner_undecided":
            # Typed unresolved: never silently classified either way; a
            # Replace import cannot run over a scope containing such a row.
            failures.append("inventory_row_unresolved_fail_closed")
        elif setting_class == "unclassified":
            # Fail closed: an in-scope row without a valid machine class is
            # never silently treated as ordinary.
            failures.append("inventory_row_unclassified_fail_closed")
    eligible.sort()

    # SSYS-007.A typed owner/value join for value-dependent rows in scope.
    destination_values = destination.get("values_by_setting_id") if isinstance(
        destination.get("values_by_setting_id"), dict
    ) else {}
    value_failures, value_eligible, destination_owned = _typed_owner_value_failures(
        witness,
        preview,
        row_index(inventory),
        classification,
        source_keys,
        source_values,
        destination_values,
        owner_read=owner_read,
    )
    failures.extend(value_failures)
    eligible.extend(value_eligible)
    eligible.sort()

    # SSYS-007/SSYS-008 disclosure duty runs both ways: the preview must list
    # every authority-excluded row in scope, and every row it lists must be
    # independently backed by the authority.  Self-declaration alone excludes
    # nothing and discloses nothing.  A destination-owned value-dependent row
    # (destination-current read environment_bound) must likewise be disclosed
    # and is backed only by its typed read.
    for setting_id in sorted(set(authority_excluded_in_scope) - excluded_declared):
        failures.append("preview_exclusion_missing_for_owner_excluded_id")
    for setting_id in sorted(set(destination_owned) - excluded_declared):
        failures.append("preview_exclusion_missing_for_destination_owned_value")
    rows_by_id = row_index(inventory)
    for setting_id in sorted(excluded_declared):
        if classification.get(setting_id) in AUTHORITY_EXCLUDED_CLASSES:
            continue
        if classification.get(setting_id) == VALUE_DEPENDENT_CLASS and setting_id in destination_owned:
            continue
        # Not an authority-excluded row of the chosen scope (or not in the
        # registry at all): the preview may not exclude it by declaration.
        failures.append("preview_exclusion_not_owner_backed")

    proposed = preview.get("proposed_values_by_setting_id")
    exact_ids = preview.get("exact_setting_ids")

    expected_resets = [setting_id for setting_id in eligible if setting_id not in source_keys]
    actual_ids = [entry.get("setting_id") for entry in resets if isinstance(entry, dict)]
    for setting_id in sorted(set(expected_resets) - set(actual_ids)):
        failures.append("import_reset_missing_omitted_id")
    for setting_id in sorted(set(actual_ids) - set(expected_resets)):
        # One classified reason per extra ID: authority-excluded class first
        # (credential / local / owner-destination / run-scoped), then the
        # destination-owned value read, then not-an-ordinary-setting, then
        # contained-by-source, then out of scope.
        setting_class = classification.get(setting_id)
        if setting_class is None:
            row = rows_by_id.get(setting_id)
            setting_class = classify_setting(row) if row is not None else None
        if setting_class == "credential":
            failures.append("import_reset_touches_credential_setting")
        elif setting_class == "local_environment":
            failures.append("import_reset_touches_local_setting")
        elif setting_class == "owner_destination":
            failures.append("import_reset_touches_owner_destination_setting")
        elif setting_class == "run_scoped":
            failures.append("import_reset_touches_run_scoped_setting")
        elif setting_class == VALUE_DEPENDENT_CLASS:
            failures.append("import_reset_touches_destination_owned_value")
        elif setting_class == "owner_undecided":
            failures.append("inventory_row_unresolved_fail_closed")
        elif setting_class is None or setting_class == "unclassified":
            failures.append("import_reset_id_not_in_inventory")
        elif setting_class == "action":
            failures.append("import_reset_id_not_ordinary_setting")
        elif setting_id in source_keys:
            failures.append("import_reset_id_not_omitted_by_source")
        else:
            failures.append("import_reset_id_out_of_category_scope")

    if exact_ids != eligible:
        # Replace touches imported + reset IDs = the whole eligible scope.
        failures.append("import_exact_ids_not_the_replace_scope")
    if exact_ids != sorted(exact_ids or []):
        failures.append("import_exact_ids_not_sorted")
    if actual_ids != sorted(actual_ids):
        failures.append("import_reset_ids_not_sorted")
    if len(set(actual_ids)) != len(actual_ids):
        failures.append("import_reset_ids_not_unique")

    for entry in resets:
        if not isinstance(entry, dict):
            failures.append("import_reset_join_malformed")
            continue
        setting_id = entry.get("setting_id")
        row = rows_by_id.get(setting_id)
        if row is not None and entry.get("value_after") != normalized_default(row):
            # value_after must be the current registry default the SSYS-009
            # Restore Defaults source resolves for this ID.
            failures.append("import_reset_default_mismatch")
        if setting_id not in destination_values:
            failures.append("import_reset_before_value_unbound")
        elif destination_values[setting_id] != entry.get("value_before"):
            # value_before must be the actual destination snapshot value.
            failures.append("import_reset_before_value_mismatch")
        if not isinstance(proposed, dict) or proposed.get(setting_id) != entry.get("value_after"):
            failures.append("witness_reset_after_differs_from_preview_proposed")

    if resets != preview.get("import_resets"):
        failures.append("witness_reset_set_differs_from_preview")

    # Join-3: projected post-apply settlement and before/after byte bindings.
    failures.extend(
        _projected_post_apply_failures(witness, preview, destination, source_keys)
    )
    return sorted(set(failures))


def row_index(inventory: dict) -> dict:
    return {row.get("id"): row for row in inventory.get("settings", []) if isinstance(row, dict)}
