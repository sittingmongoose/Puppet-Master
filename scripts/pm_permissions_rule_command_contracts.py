#!/usr/bin/env python3
"""Causal static join for the five existing Permissions rule commands.

Owner authority: ``Plans/Permissions_System.md`` (Sections 2, 3, 8, 9,
"Permissions UI Commands And Error States", "TOML Persistence Failure And
Atomicity Rules", the runtime blocked-outcome addendum and the permission
snapshot reason-code enums), ``Plans/UI_Command_Catalog.md#UCC-113`` and the
selected central wiring rows for ``catalog.permissions_*``.

What this module proves, and what it never proves
-------------------------------------------------
Two owner facts are bound, and nothing is synthesized in between:

* the **owner-selected rule projection** -- rule identity, value, scope and
  order -- is recomputed from the declared request against the owner-issued
  snapshot, and the observed owner result must match that recomputation; and
* the **owner's opaque current file hash** -- ``loaded_config_hash`` -- is bound
  to the owner's own file read at the atomic write boundary. The cited owner
  text compares that value with the current file hash before rename and chooses
  no digest, encoding or serialization, so this module asserts no hash grammar,
  never parses, renders or rewrites the config file, and never derives a file
  hash from a rule projection. Every binding declares what the owner's current
  file hash is; that declaration is never authority. An independent pre-rename
  owner read is required for any currentness-bearing binding and an independent
  post-write read-back for any persisted claim: without them the binding is
  reported as an explicit unproven binding (``join_owner_currentness_unproven``,
  ``join_owner_readback_unproven``) instead of passing, and a static fixture gate
  may supply a separate pinned owner-file test double to prove the conditional
  algorithm as static test evidence, never as a native producer.

Identity/scope/order/draft agreement is static and causal. It is still static
evidence only: a matching binding proves that a written contract is internally
consistent with the owner semantics it cites, and never proves a native handler,
a filesystem write, TOML atomicity, a permission decision, an admitted
EventRecord, a storage family or key, or readiness. Every record carries
``native_handler_claim=false``, ``native_write_evidence=absent`` and an empty
``emitted_event_types`` list, and a receipt/no-event disposition is not an
admitted EventRecord.

Two further owner joins live here, both static:

* the **external-directory glob accept side** -- Section 3.1 text is admissible
  for a directory-pattern draft, so literal-path entries such as
  ``include/[draft].txt``, ``/tmp/{literal}/file`` and ``include/back\\slash``
  are accepted and never refused.  The owner names
  ``external_directory_invalid_glob`` but states no malformed-input condition, so
  that reject predicate stays the held slice ``external_directory_glob_predicate``
  and this companion narrows nothing: no absolute-path, home-prefix,
  metacharacter, Unicode, length or count ban; and
* the **permission-blocked episode action selection** -- the selected blocked
  episode, action id and ``approval_scope_key`` bound to the existing
  ``cmd.runtime.approve`` / ``cmd.runtime.decline`` / ``cmd.permissions.open``
  commands. The current blocked episode reaches that join only from an
  independent read (a separately pinned static owner episode test double at the
  static gate); the claimed episode and the previously displayed ordered action
  list are declarations that never witness themselves, native episode selection
  is unproven, and no permissions-family approve/decline command is minted.
"""

from __future__ import annotations

import json
from typing import Any, Callable, Iterable, Mapping, Sequence

SCHEMA_ID = "pm.permissions.rule_command_contracts.v1"
OWNER_SCHEMA_REL = "Plans/permissions_rule_command_contracts.schema.json"
FIXTURE_REL = "Plans/permissions_rule_command_fixtures.json"

ELEMENT_IDS: tuple[str, ...] = (
    "create_project_rule",
    "update_rule",
    "reorder_rule",
    "delete_rule",
    "validate_rule",
)
COMMAND_IDS: tuple[str, ...] = tuple(f"cmd.permissions.{element}" for element in ELEMENT_IDS)
MUTATING_COMMAND_IDS: tuple[str, ...] = COMMAND_IDS[:4]
MUTATING_ELEMENTS: tuple[str, ...] = ELEMENT_IDS[:4]
VALIDATE_COMMAND_ID = "cmd.permissions.validate_rule"

# The companion never carries, parses or digests the config file. The owner
# compares loaded_config_hash with the actual current file hash before rename;
# the file contents, the digest domain and the custody all stay inside the
# Permissions owner and reach this module only through an independent owner
# file-read callback supplied at the write boundary.
OWNER_FILE_HASH_FIELD = "loaded_config_hash"
CURRENTNESS_BOUNDARY = (
    "Owner originals are proven only by the owner's own reads at the atomic write boundary: an independent "
    "current/pre-rename read binds the bound snapshot, an independent owner-selected rule read binds the "
    "declared pre-state identity/value/scope/order, and an independent post-write read-back binds a declared "
    "post-write hash. Rule identity, value, scope and order are derived separately from the owner-selected "
    "rule projection and are never used to infer a file hash, and the file hash is never used to authenticate "
    "the declared rule projection. Serialized fields, copied hashes and fixture text are never authority: "
    "without the independent reads a binding that declares an owner original or a persisted claim is reported "
    "explicitly unproven instead of passing, and the companion names the missing independent owner read "
    "rather than making the claim."
)

# "Permission TOML writes use write-temp, fsync-temp, atomic rename, then
# fsync-parent-directory when the platform exposes it."
ATOMIC_STEP_SEQUENCE: tuple[str, ...] = ("write_temp", "fsync_temp", "atomic_rename")
OPTIONAL_FINAL_ATOMIC_STEP = "fsync_parent_directory"

# Owner success/failure vocabulary reused verbatim; nothing outside this tuple
# may appear as a rule-command error code.
RULE_ERROR_CODES: tuple[str, ...] = (
    "rule_not_found",
    "target_index_out_of_range",
    "scope_mismatch",
    "permission_config_parse_failed",
    "permission_config_write_conflict",
    "external_directory_duplicate_path",
    "external_directory_invalid_glob",
    "handler_unavailable",
)
PARSE_DETAIL_ERROR_CODES: tuple[str, ...] = (
    "permission_config_parse_failed",
    "permission_config_write_conflict",
)
BLOCKED_REASON_CODES: tuple[str, ...] = (
    "approval_required",
    "policy_denied",
    "preflight_failed",
    "state_changed",
    "domain_sensitive_action",
    "secret_required",
    "network_forbidden",
    "external_side_effect",
    "operation_in_progress",
)
BLOCKED_FAMILIES: tuple[str, ...] = (
    "blocked_policy",
    "blocked_approval",
    "blocked_preflight",
    "blocked_governance",
)
DIRTY_STATE_VALUES: tuple[str, ...] = (
    "clean",
    "dirty",
    "saving",
    "saved",
    "save_failed",
    "conflict_refresh_required",
)
DISPOSITION_KINDS: tuple[str, ...] = (
    "persisted_atomic",
    "refused",
    "blocked",
    "unknown",
    "validated_no_persistence",
)
PERMISSION_LADDER: tuple[str, ...] = ("allow", "ask", "deny")

# Section 3.1 matching syntax, closed: ``*`` matches zero or more characters,
# ``?`` matches exactly one character, and a trailing `` *`` (space + wildcard)
# makes the trailing portion optional.  Section 3.3 states that external
# directory allowlist entries use that syntax and Section 10.3/10.5 that pattern
# input supports it.  Every other glob metacharacter is outside the cited
# vocabulary: PM refuses such input with the owner-named
# ``external_directory_invalid_glob`` instead of silently reinterpreting it,
# rather than inventing bracket/brace/escape semantics the owner does not own.
# Section 3.1 gives exactly `*`, `?` and the trailing ` *` special meanings.
# Every other character is literal text, including `[`, `]`, `{`, `}` and a
# backslash: the owner never declares them invalid or wildcard-bearing, so a
# directory allowlist entry such as `include/[draft].txt`, `/tmp/{literal}/file`
# or `include/back\\slash` stays owner-valid and is never refused here.
EXTERNAL_DIRECTORY_WILDCARD_INVENTORY: tuple[str, ...] = ("*", "?")
EXTERNAL_DIRECTORY_TRAILING_OPTIONAL_TOKENS: tuple[str, ...] = (" *",)

# Section 6 permission-blocked recovery surfaces, closed and ordered as the
# owner lists them.  The FileSafe-blocked set (``approve_once``,
# ``filesafe_add_rule``, ``open_filesafe_settings``) is a distinct family owned
# by FileSafe and is deliberately not bound here.
PERMISSION_BLOCKED_ACTION_IDS: tuple[str, ...] = (
    "deny",
    "approve_once",
    "approve_for_session",
    "approve_always",
    "open_permissions",
)
# The four-step ladder carried by the HITL approval artifact for a permission
# ask (UI_Command_Catalog UCC-113 labels, Permissions_System 6/6.1, and the
# ``decision`` enum of the current HITL artifact schema).  The generic
# ``approved`` value of that enum belongs to the generic approve path.
HITL_DECISION_VALUES: tuple[str, ...] = ("once", "for_session", "always", "deny")
EPISODE_DISPOSITIONS: tuple[str, ...] = ("dispatch_admitted", "refused")
EPISODE_REFUSAL_REASONS: tuple[str, ...] = ("stale_blocked_episode", "action_not_advertised")
EPISODE_DISPATCH_COMMAND_IDS: tuple[str, ...] = (
    "cmd.runtime.approve",
    "cmd.runtime.decline",
    "cmd.permissions.open",
)
# ``allowed_action_id`` -> the existing command, the ladder value and the scope
# effect the cited owner text gives it.  Minimum args are UCC-113's recovery
# command table: ``{run_id, node_id, blocked_sequence, attempt_id?}``.
# ``open_permissions`` is not an approval decision: it opens the existing
# ``settings.permissions`` route through ``cmd.permissions.open`` (UCC-113) and
# no new permissions-family approve/decline command is minted.
EPISODE_ACTION_DISPATCH: dict[str, dict[str, str | None]] = {
    "deny": {
        "runtime_action_family": "decline",
        "command_id": "cmd.runtime.decline",
        "hitl_decision": "deny",
        "scope_effect": "none",
    },
    "approve_once": {
        "runtime_action_family": "approve",
        "command_id": "cmd.runtime.approve",
        "hitl_decision": "once",
        "scope_effect": "invocation",
    },
    "approve_for_session": {
        "runtime_action_family": "approve",
        "command_id": "cmd.runtime.approve",
        "hitl_decision": "for_session",
        "scope_effect": "session_cache",
    },
    "approve_always": {
        "runtime_action_family": "approve",
        "command_id": "cmd.runtime.approve",
        "hitl_decision": "always",
        "scope_effect": "durable_rule",
    },
    "open_permissions": {
        "runtime_action_family": None,
        "command_id": "cmd.permissions.open",
        "hitl_decision": None,
        "scope_effect": "none",
    },
}
EPISODE_DISPATCH_ARG_KEYS: tuple[str, ...] = ("run_id", "node_id", "blocked_sequence", "attempt_id")

# Atomic precondition identifiers of the UCC-113 permissions command rows. The
# owner names them as the precondition of each control, so an unmet precondition
# is the owner's own truthful disabled reason for an unavailable control and
# needs no new error code, no `handler_unavailable` substitute and no mutation
# write-conflict label.
PERMISSIONS_COMMAND_PRECONDITIONS: tuple[str, ...] = (
    "settings_available",
    "permission_config_writable",
    "project_selected",
    "rule_exists",
    "rule_draft_present",
    "approval_request_present",
    "revocable_rule_exists",
    "picker_available",
)
NOT_WRITABLE_PRECONDITION = "permission_config_writable"

# ``saving`` is a live projection transient, never a settled observation.
TRANSIENT_DIRTY_STATE = "saving"

CHECKS: tuple[str, ...] = (
    "join_request_field_laws",
    "join_scope_layer_binding",
    "join_owner_snapshot_is_current",
    "join_owner_currentness_unproven",
    "join_owner_selected_original",
    "join_owner_selected_original_unproven",
    "join_file_hash_readback",
    "join_owner_readback_unproven",
    "join_command_identity",
    "join_receipt_reference",
    "join_state_selector_binding",
    "join_availability_binding",
    "join_error_code_binding",
    "join_expected_refusal",
    "join_expected_success",
    "join_success_rule_set",
    "join_success_rule_identity",
    "join_success_order_index",
    "join_delete_audit_identity",
    "join_validate_no_persistence",
    "join_validate_no_approval",
    "join_validate_scope_stability",
    "join_no_write_state_stability",
    "join_approval_binding",
    "join_unknown_reconciliation",
    "join_disposition_permission_parity",
    "join_permission_ladder",
    "join_dirty_state_binding",
    "join_atomic_steps_binding",
    "join_event_boundary",
    "join_unwritable_config_must_not_persist",
    "join_episode_original",
    "join_episode_original_unproven",
    "join_episode_advertised_action",
    "join_episode_dispatch_binding",
    "join_episode_refusal_binding",
)

# Held slices: the owner names the condition but no exact owner/product rule
# exists for the outcome or for the exact value syntax. The join asserts nothing
# about the held axis.
HELD_SLICES: tuple[str, ...] = (
    "unwritable_config_outcome",
    "external_directory_glob_predicate",
    "request_field_laws",
    "owner_file_hash_syntax",
    "owner_timestamp_serialization",
    "parse_detail_position_domain",
    "post_write_file_byte_authenticity",
)

RECORD_CHECK_IDS: tuple[str, ...] = (
    "request_field_laws",
    "snapshot_scope_layer_mismatch",
    "snapshot_rule_identity_duplicate",
    "result_disposition_internal_mismatch",
    "availability_selector_command_mismatch",
    "availability_disabled_reason_mismatch",
    "error_code_detail_mismatch",
    "error_blocked_payload_incomplete",
    "evidence_widening_attempt",
    "evidence_downgrade_reason_mismatch",
    "evidence_allowed_action_ids_mismatch",
    "evidence_transient_dirty_state",
    "episode_family_reason_mismatch",
)

OWNER_CITATIONS: dict[str, str] = {
    "command_ids": "Plans/Permissions_System.md#Permissions-UI-Commands-And-Error-States",
    "command_family": "Plans/UI_Command_Catalog.md#UCC-113",
    "actions": "Plans/Permissions_System.md Section 2",
    "wildcards": "Plans/Permissions_System.md Section 3.1",
    "resolution": "Plans/Permissions_System.md Section 8",
    "persistence": "Plans/Permissions_System.md Section 9",
    "scope_precedence": "Plans/Permissions_System.md Section 2.4",
    "requested_effective": "Plans/Permissions_System.md Section 2.4A",
    "atomicity": "Plans/Permissions_System.md#TOML-Persistence-Failure-And-Atomicity-Rules",
    "loaded_config_hash": "Plans/Permissions_System.md#TOML-Persistence-Failure-And-Atomicity-Rules",
    "dirty_states": "Plans/Permissions_System.md#Permissions-UI-Commands-And-Error-States",
    "blocked_payload": "Plans/Permissions_System.md runtime blocked-outcome addendum",
    "snapshot_enums": "Plans/Permissions_System.md permission snapshot reason-code enums",
    "settings_route": "Plans/Permissions_System.md#Permissions-UI-Commands-And-Error-States",
    "cross_surface_parity": "Plans/Permissions_System.md#PS-072",
    "rule_editor": "Plans/Permissions_System.md#PS-065",
    "scope_selector": "Plans/Permissions_System.md#PS-071",
    "hitl_decisions": "Plans/UI_Command_Catalog.md#UCC-113",
    "central_rows": "Plans/Wiring_Matrix.production.json catalog.permissions_*",
    "touch_binding": "Plans/touch_closure.json#TCP-PERMISSIONS",
    "settings_consumer": "Plans/Settings_System.md#SSYS-023",
    "external_directory_glob": "Plans/Permissions_System.md Section 3.1 / Section 3.3 / Section 9.1 / Section 10.3 / Section 10.5",
    "external_directory_glob_error_codes": "Plans/Permissions_System.md#Permissions-UI-Commands-And-Error-States",
    "blocked_episode_identity": "Plans/human-in-the-loop.md HITL Button Labels (Resolved)",
    "blocked_episode_action_ids": "Plans/Permissions_System.md Section 6",
    "recovery_action_admission": "Plans/Contracts_V0.md dispatcher and projection safety",
    "recovery_command_table": "Plans/UI_Command_Catalog.md canonical recovery commands",
    "runtime_approve_decline": "Plans/UI_Command_Catalog.md#UCC-113",
    "hitl_artifact_decisions": "Plans/runtime_artifact_hitl_approval.schema.json",
}

DECISION_CARDS: tuple[dict[str, str], ...] = (
    {
        "card_id": "DC-PERM-RULE-001",
        "slice": "loaded_config_hash currentness and file custody",
        "owner_text": (
            "TOML Persistence Failure And Atomicity Rules: 'Concurrent write conflict is detected by "
            "comparing loaded_config_hash to the current file hash before rename.'"
        ),
        "held": (
            "The owner owns the file, its contents and its hash syntax. The companion carries no file bytes, "
            "no digest algorithm, no text encoding and no projection serialization, and it never re-derives "
            "the file hash from a rule projection; the cited owner text chooses none of these, so the exact "
            "hash syntax stays a held slice. Currentness is required from an independent owner file read at "
            "the write boundary, which returns the owner's current file hash and nothing else; without that "
            "read a currentness-bearing binding is reported explicitly unproven, and every serialized or "
            "copied hash value is a declaration rather than authority. Minting a file-hash field, digest or "
            "grammar is an owner choice."
        ),
        "status": "held_for_owner",
    },
    {
        "card_id": "DC-PERM-RULE-002",
        "slice": "outcome vocabulary for a not-writable permission config",
        "owner_text": (
            "Central row: 'Unavailable with a projected disabled reason when the rule does not exist or "
            "the config is not writable'; UCC-113 gives every mutating command the precondition "
            "`permission_config_writable`; TCP-PERMISSIONS requires 'writable owner state' for mutation and "
            "'exact rule/config/currentness/permission error' as the disabled reason."
        ),
        "held": (
            "Resolved by the cited owner text without a new canonical code. The owner's own precondition "
            "identifier `permission_config_writable` is the truthful projected disabled reason of an "
            "unavailable mutating control, so the command projects "
            "`state.commands.permissions_<element>.disabled_reason` from that unmet precondition and never "
            "from `handler_unavailable` and never through `permission_config_write_conflict`, which is the "
            "later pre-rename `loaded_config_hash` comparison of a mutation that was allowed to attempt a "
            "write. The join asserts actual owner writability (the snapshot's not-writable state), the "
            "unavailable projection with exactly that unmet precondition, no persistence receipt, an "
            "unchanged rule set, and a blocked/refused outcome that is not documented as a write conflict; "
            "the blocked scenario uses only the owner-named pre-dispatch family and reason. The one axis the "
            "derivation still holds unasserted is the closed post-dispatch outcome vocabulary for an "
            "attempted mutation, because the owner names no rule error code for it. This internal annotation "
            "is not a user decision card and needs no canonical prose edit."
        ),
        "status": "resolved_existing_owner",
    },
    {
        "card_id": "DC-PERM-RULE-003",
        "slice": "external-directory glob validity predicate",
        "owner_text": (
            "Section 3.1: `*` matches zero or more characters, `?` matches exactly one character, and a "
            "trailing ` *` (space + wildcard) makes the trailing portion optional; Section 3.3: allowlist "
            "entries support wildcard syntax (Section 3.1); Section 3.4 gives the relative directory-prefix "
            "shape `src/auth/**`; Section 9.1/3.3 give `~/.cargo/**` and `/usr/local/include/**`. Central "
            "row: 'Invalid glob input surfaces external_directory_invalid_glob for directory-pattern rules'."
        ),
        "held": (
            "Accept side resolved and materialized: Section 3.1 gives only `*`, `?` and the trailing ` *` "
            "special meanings, so every other character - including `[`, `]`, `{`, `}` and a backslash - is "
            "ordinary literal path text and a non-empty directory-pattern entry is admissible. The join "
            "asserts that acceptance causally and refuses to narrow it: `include/[draft].txt`, "
            "`/tmp/{literal}/file`, `include/back\\slash`, `src/auth/**`, `~/.cargo/**` and "
            "`/usr/local/include/**` are owner-valid, and a fabricated `external_directory_invalid_glob` "
            "refusal of such an entry fails the join. Reject side held: the owner names that error code for "
            "invalid glob input but states no malformed-input condition, so this companion refuses no text "
            "and the slice stays `external_directory_glob_predicate` - independent review "
            "REVIEW-DIFFERENT-SOL-FOUR-JOINS-V1.md found the earlier out-of-inventory rejection unfaithful "
            "to Section 3.1 and it is removed. The exact duplicate-path equality "
            "(`external_directory_duplicate_path`) is unchanged; no absolute-path, home-prefix, "
            "metacharacter, Unicode, length or count rule is imposed."
        ),
        "status": "held_for_owner",
    },
    {
        "card_id": "DC-PERM-RULE-004",
        "slice": "declared hash on validate_rule",
        "owner_text": (
            "Central row: 'Validation checks the rule draft and surfaces validation errors without "
            "persisting anything'; UCC-113 precondition `rule_draft_present`; TCP-PERMISSIONS: 'validation "
            "requires a draft'; the atomicity paragraph compares `loaded_config_hash` to the current file "
            "hash before rename, which governs mutation."
        ),
        "held": (
            "Resolved as a companion-created branch, not an owner decision fork. `cmd.permissions.validate_rule` is "
            "draft-only: its precondition is `rule_draft_present`, it never persists and never approves, and "
            "the owner scopes every `loaded_config_hash` comparison to a mutation before rename while "
            "requiring current hash and writable state for mutation only. The shared request shape's optional "
            "`expected_loaded_config_hash` is therefore nonauthoritative on a validation: it may be null or "
            "absent, it creates no new stale-validation outcome, and the later mutation independently checks "
            "the current hash. The companion asserts no response branch for it, and no canonical prose change "
            "is requested; a concrete owner-backed causal obligation would be re-adjudicated if one ever "
            "appears. This internal annotation is not a user decision card."
        ),
        "status": "resolved_existing_owner",
    },
    {
        "card_id": "DC-PERM-RULE-005",
        "slice": "duplicate tool_pattern on create",
        "owner_text": "Rule metadata: 'tool_pattern is not unique and MUST NOT be used as the durable identity'.",
        "held": (
            "Resolved by Section 9: non-directory tool_pattern values are not unique; distinct rule_id "
            "values retain distinct durable identities. The existing create join permits this case. "
            "The separately owned external_directory_duplicate_path condition is unchanged. "
            "This internal annotation is not a user decision card."
        ),
        "status": "resolved_existing_owner",
    },
    {
        "card_id": "DC-PERM-RULE-006",
        "slice": "create-time actor binding into the durable rule record",
        "owner_text": "Section 9 durable rule logical fields include created_by_thread_id.",
        "held": (
            "These five owner sections do not name a request field that carries the creating thread. The "
            "companion does not mint one; the join asserts rule identity is new and the record's value, "
            "scope and order derive from the request, and leaves the actor-binding field to the owner."
        ),
        "status": "held_for_owner",
    },
    {
        "card_id": "DC-PERM-RULE-007",
        "slice": "observed settled result and the transient saving state",
        "owner_text": "Save dirty state values are clean, dirty, saving, saved, save_failed, and conflict_refresh_required.",
        "held": (
            "The companion treats 'saving' as a live projection transient and refuses it as a settled "
            "observation in a result or a bound error record. The transient value itself is unchanged and "
            "remains owner-owned."
        ),
        "status": "held_for_owner",
    },
    {
        "card_id": "DC-PERM-RULE-008",
        "slice": "allowed_action_ids binding for a permissions approval ask",
        "owner_text": (
            "Section 6: 'Permission-blocked recovery surfaces expose `deny`, `approve_once`, "
            "`approve_for_session`, `approve_always`, and `open_permissions` as applicable'; the blocked "
            "payload carries ordered `allowed_action_ids[]`. `Plans/human-in-the-loop.md` maps the "
            "canonical display copy for `allowed_action_id = approve` to `cmd.runtime.approve` and for "
            "`allowed_action_id = decline` to `cmd.runtime.decline`, orders buttons by the blocked "
            "episode's ordered `allowed_action_ids[]`, and keys the episode by `run_id`, `node_id`, "
            "`blocked_sequence` and `attempt_id?`. UCC-113 keeps every actual decision on those two runtime "
            "commands and forbids permissions-family approve/decline commands."
        ),
        "held": (
            "Resolved by the cited owner text; the earlier annotation's conjecture that the exact ids were "
            "still an open owner decision is withdrawn. The ordered permission-blocked action ids are owner-named, the "
            "minute args of the two runtime commands are owner-named by UCC-113's recovery command table, "
            "and the once/for-session/always/deny ladder is owner-named by Section 6.1 and by the `decision` "
            "enum of the current HITL artifact schema. The companion binds the selected episode, action and "
            "scope to those existing commands, derives the dispatch from the action id and never from "
            "display copy, admits a recovery action only when the current blocked episode exposes it, and "
            "refuses a stale episode or an unadvertised action. Native episode selection is not proven: the "
            "episode read is a separately pinned static owner episode test double and every episode record "
            "carries `native_episode_selection_proven=false`. This internal annotation is not a user "
            "decision card."
        ),
        "status": "resolved_existing_owner",
    },
    {
        "card_id": "DC-PERM-RULE-009",
        "slice": "authenticity of the declared post-write file hash",
        "owner_text": (
            "TOML Persistence Failure And Atomicity Rules own the write, the temp file, the rename and the "
            "pre-rename hash comparison; the interrupted-write and post-write file state are the owner's."
        ),
        "held": (
            "The companion asserts only the relational law on the declared post-write hash: it must equal an "
            "independent owner post-write read-back, and a declaration without that independent read is "
            "reported unproven. It never claims the post-write bytes are authentic, because the file state "
            "after rename can only be observed inside the owner's write boundary; a native implementation "
            "may prove it there. No retry, recovery or reconciliation command is added for that gap."
        ),
        "status": "held_for_owner",
    },
    {
        "card_id": "DC-PERM-RULE-010",
        "slice": "owner timestamp serialization",
        "owner_text": (
            "Section 9 names the durable rule field created_at; the atomicity paragraph names "
            "permissions.toml.corrupt.{timestamp_utc}."
        ),
        "held": (
            "Neither field chooses a serialization, offset form, precision or calendar here. The schema "
            "therefore asserts only that the carried value is a non-empty string and no format: the value "
            "stays owner-owned and is never parsed, compared or re-derived in this companion. Pinning a "
            "timestamp format is an owner choice."
        ),
        "status": "held_for_owner",
    },
    {
        "card_id": "DC-PERM-RULE-011",
        "slice": "parse-detail line/column numeric domain",
        "owner_text": (
            "Atomicity paragraph: parse failure surfaces permission_config_parse_failed with path, line?, "
            "column?. The owner names the optional fields and no numeric domain."
        ),
        "held": (
            "The companion asserts that an optional parse position is an integer and that line/column stay "
            "absent for rule error codes other than the two parse/write-conflict codes; it asserts no base, "
            "range or zero/one index. Choosing the position domain is an owner choice."
        ),
        "status": "held_for_owner",
    },
)


class JoinInputError(ValueError):
    """Raised when a binding is too malformed to derive an expectation from."""


# ---------------------------------------------------------------------------
# owner-issued hash binding (no companion serialization)
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# small helpers
# ---------------------------------------------------------------------------


def element_of(command_id: Any) -> str | None:
    if not isinstance(command_id, str) or not command_id.startswith("cmd.permissions."):
        return None
    element = command_id[len("cmd.permissions.") :]
    return element if element in ELEMENT_IDS else None


def availability_selector(element: str) -> str:
    return f"state.commands.permissions_{element}.availability"


def disabled_reason_projection(element: str) -> str:
    return f"state.commands.permissions_{element}.disabled_reason"


def dispatch_receipt_ref(command_id: str) -> str:
    return f"{command_id}.dispatch_receipt"


def is_directory_pattern_class(pattern_class: Any) -> bool:
    return pattern_class == "external_directory_pattern"


def external_directory_glob_syntax_accepted(pattern: Any) -> bool:
    """Whether a directory-pattern entry is admissible owner §3.1 text.

    Section 3.1 defines `*` (zero or more characters), `?` (exactly one
    character) and a trailing ` *` (space + wildcard, trailing portion optional),
    and Section 3.3 applies that syntax to external-directory allowlist entries.
    It assigns no other character a special meaning and declares none of them
    invalid, so `[`, `]`, `{`, `}` and a backslash are ordinary literal path text
    and any non-empty entry is admissible.  This companion therefore narrows
    nothing: it asserts no absolute-path, home-prefix, size, metacharacter,
    Unicode or other ban, and its only held axis is the reject side.

    The owner names ``external_directory_invalid_glob`` for invalid glob input on
    directory-pattern rules but states no malformed-input condition, so that
    reject predicate stays the held slice ``external_directory_glob_predicate``:
    this function never refuses the text it checks, and no fixture may claim a
    malformedness the owner has not defined.
    """

    return isinstance(pattern, str) and bool(pattern)


def episode_action_dispatch(action_id: Any) -> dict[str, Any] | None:
    """The owner-named dispatch for one permission-blocked action id."""

    if not isinstance(action_id, str):
        return None
    dispatch = EPISODE_ACTION_DISPATCH.get(action_id)
    return None if dispatch is None else dict(dispatch)


def episode_dispatch_args(selection: Mapping[str, Any]) -> dict[str, Any] | None:
    """The claimed episode identity in the runtime command's minimum args shape."""

    claimed = selection.get("claimed_episode")
    if not isinstance(claimed, Mapping):
        return None
    return {key: claimed.get(key) for key in EPISODE_DISPATCH_ARG_KEYS}


def episode_derived_state(
    selection: Mapping[str, Any],
    current_episode: Mapping[str, Any] | None,
) -> dict[str, Any]:
    """Derive the admitted/refused state of one selection from the owner's reads.

    The claimed episode and the claimed ordered action list are the previously
    displayed blocked-flow projection; they are declarations.  Admission requires
    the current blocked episode to match them and to expose the selected action:
    ``Plans/Contracts_V0.md`` admits a recovery action only when the *current*
    blocked episode exposes the corresponding ordered actions and requires
    revalidation against canonical state before execution, and
    ``Plans/Permissions_System.md`` line 1144 aborts a materially changed
    selection with ``state_changed_refresh_required``.
    """

    claimed = selection.get("claimed_episode") if isinstance(selection.get("claimed_episode"), Mapping) else {}
    identity = [claimed.get(key) for key in EPISODE_DISPATCH_ARG_KEYS]
    selected_action_id = selection.get("selected_action_id")
    state: dict[str, Any] = {
        "read_available": isinstance(current_episode, Mapping),
        "identity_matches": False,
        "action_advertised": False,
        "refusal_reason": None,
    }
    if not isinstance(current_episode, Mapping):
        return state
    current_identity = [current_episode.get(key) for key in EPISODE_DISPATCH_ARG_KEYS]
    scope_matches = selection.get("approval_scope_key") == current_episode.get("approval_scope_key")
    state["identity_matches"] = identity == current_identity and scope_matches
    advertised = current_episode.get("allowed_action_ids")
    advertised = advertised if isinstance(advertised, list) else []
    state["action_advertised"] = selected_action_id in advertised
    if not state["identity_matches"]:
        state["refusal_reason"] = "stale_blocked_episode"
    elif not state["action_advertised"]:
        state["refusal_reason"] = "action_not_advertised"
    return state


def scope_allowed_in_layer(config_layer: Any, scope_key: Any) -> bool:
    if not isinstance(scope_key, str):
        return False
    if config_layer == "global":
        return scope_key == "global"
    if config_layer == "project":
        return scope_key != "global"
    return False


def ladder_is_legal(requested: Any, effective: Any) -> bool:
    if requested == "unset":
        return effective in PERMISSION_LADDER
    if requested not in PERMISSION_LADDER or effective not in PERMISSION_LADDER:
        return False
    return PERMISSION_LADDER.index(effective) >= PERMISSION_LADDER.index(requested)


def ladder_is_clamped(requested: Any, effective: Any) -> bool:
    if requested == "unset":
        return False
    return ladder_is_legal(requested, effective) and requested != effective


def _rules(value: Any) -> list[dict[str, Any]]:
    return [dict(rule) for rule in value] if isinstance(value, list) else []


def _owner_read_hash(reader: "Callable[[], Mapping[str, Any]]") -> tuple[str | None, str | None]:
    current = reader()
    if not isinstance(current, Mapping) or not isinstance(current.get(OWNER_FILE_HASH_FIELD), str):
        return None, "owner_file_read_returned_no_file_hash"
    return current[OWNER_FILE_HASH_FIELD], None


def owner_current_hash_failures(
    snapshot: Mapping[str, Any],
    owner_file_read: "Callable[[], Mapping[str, Any]] | None",
) -> list[tuple[str, str]]:
    """Bind the bound snapshot to an independent owner pre-rename file read.

    Every binding declares what the owner's current file hash is. That
    declaration is never authority: without an independent owner file read the
    binding is reported explicitly unproven rather than passing, and with one the
    declared value must equal the owner's own current file hash, which is the
    owner's pre-rename comparison. The file contents, the digest syntax and the
    custody stay inside the Permissions owner.
    """

    if owner_file_read is None:
        return [
            (
                "join_owner_currentness_unproven",
                "owner_currentness_unproven_no_independent_owner_file_read",
            )
        ]
    current_hash, failure = _owner_read_hash(owner_file_read)
    if failure is not None:
        return [("join_owner_currentness_unproven", failure)]
    if current_hash != snapshot.get("declared_loaded_config_hash"):
        return [
            (
                "join_owner_snapshot_is_current",
                "bound_loaded_config_hash_is_not_the_current_file_hash",
            )
        ]
    return []


def owner_selected_original_failures(
    snapshot: Mapping[str, Any],
    owner_selected_rules_read: "Callable[[], Sequence[Mapping[str, Any]]] | None",
) -> list[tuple[str, str]]:
    """Bind the declared owner snapshot's rules to the owner's own original.

    The binding's embedded ``owner_snapshot.ordered_rules`` is a declaration, not
    evidence: the same record supplies both the purported original rule set and
    the observed result derived from it, so an original and a result that
    co-mutate together would still agree with each other. Proof requires the
    owner's own selected rule projection, read independently of the bound
    fixture, and the declared original must equal it rule for rule -- identity,
    value, scope, order and the Section 9 durable metadata (``created_at``,
    ``created_by_thread_id``) that a real durable rule carries. Without that
    independent read the binding is reported explicitly unproven.
    """

    if owner_selected_rules_read is None:
        return [
            (
                "join_owner_selected_original_unproven",
                "owner_selected_original_unproven_no_independent_owner_selected_read",
            )
        ]
    original = owner_selected_rules_read()
    if original is None or isinstance(original, (str, bytes)):
        return [
            (
                "join_owner_selected_original_unproven",
                "owner_selected_original_read_returned_no_rule_projection",
            )
        ]
    declared = snapshot.get("ordered_rules")
    if not isinstance(declared, list):
        return [
            (
                "join_owner_selected_original_unproven",
                "owner_selected_original_read_returned_no_rule_projection",
            )
        ]
    selected = [dict(rule) for rule in original]
    if len(declared) != len(selected) or any(
        dict(left) != right for left, right in zip(declared, selected)
    ):
        return [
            (
                "join_owner_selected_original",
                "declared_owner_snapshot_rules_are_not_the_owner_selected_original",
            )
        ]
    return []


def owner_readback_hash_failures(
    result: Mapping[str, Any],
    availability: Mapping[str, Any],
    evidence: Mapping[str, Any],
    owner_file_read: "Callable[[], Mapping[str, Any]] | None",
    owner_post_write_read: "Callable[[], Mapping[str, Any]] | None",
) -> list[tuple[str, str]]:
    """Relate the declared file-hash observation to the owner's own file reads.

    A persisted claim requires an independent owner post-write read-back and is
    reported explicitly unproven without one; a no-write outcome that declares a
    hash is compared with the independent pre-write read. Comment, formatting or
    byte-level changes move the file hash without moving the rule projection, and
    vice versa, so the declared hash is never inferred from the rule derivation.
    """

    disposition = result.get("effect_disposition") if isinstance(result.get("effect_disposition"), dict) else {}
    kind = disposition.get("kind")
    declared = result.get("observed_config_hash")
    if kind == "persisted_atomic":
        if (
            evidence.get("effective_permission_state") != "allow"
            or availability.get("availability") == "unavailable"
        ):
            # The permission/availability laws already reject this pair; a
            # persisted claim under deny or an unavailable projection is not
            # also charged to the read-back law.
            return []
        if owner_post_write_read is None:
            return [
                (
                    "join_owner_readback_unproven",
                    "owner_readback_unproven_no_independent_owner_post_write_read",
                )
            ]
        current_hash, failure = _owner_read_hash(owner_post_write_read)
        if failure is not None:
            return [("join_owner_readback_unproven", failure)]
        if current_hash != declared:
            return [
                (
                    "join_file_hash_readback",
                    "declared_post_write_hash_is_not_the_owner_readback_hash",
                )
            ]
        return []
    if kind in {"refused", "blocked", "validated_no_persistence", "unknown"}:
        if owner_file_read is None or declared is None:
            # The currentness law already reports the missing independent read;
            # a declared no-write hash is not authority on its own.
            return []
        pre_hash, failure = _owner_read_hash(owner_file_read)
        if failure is not None:
            return [("join_owner_currentness_unproven", failure)]
        if pre_hash != declared:
            return [
                (
                    "join_file_hash_readback",
                    "declared_hash_is_not_the_owner_pre_write_hash",
                )
            ]
        return []
    return []


# ---------------------------------------------------------------------------
# request field laws (shared by record and join level)
# ---------------------------------------------------------------------------


def request_field_law_failures(request: Mapping[str, Any]) -> list[str]:
    """Per-command presence laws of the request record.

    These are structural obligations of the command family, not outcome rules:
    a request that violates one is malformed and no expectation can be derived.
    """

    element = element_of(request.get("command_id"))
    if element is None:
        return ["unknown_command_id"]
    failures: list[str] = []
    rule_id = request.get("rule_id")
    draft = request.get("draft")
    order = request.get("order")
    expected_hash = request.get("expected_loaded_config_hash")
    if element == "create_project_rule":
        if rule_id is not None:
            failures.append("create_rule_id_must_be_owner_generated")
        if not isinstance(draft, dict):
            failures.append("create_requires_draft")
        if order is not None:
            failures.append("create_order_must_be_null")
        if expected_hash is None:
            failures.append("create_requires_loaded_config_hash")
    elif element in {"update_rule", "delete_rule"}:
        if not isinstance(rule_id, str):
            failures.append(f"{element}_requires_rule_identity")
        if element == "update_rule" and not isinstance(draft, dict):
            failures.append("update_requires_draft")
        if element == "delete_rule" and draft is not None:
            failures.append("delete_draft_must_be_null")
        if order is not None:
            failures.append(f"{element}_order_must_be_null")
        if expected_hash is None:
            failures.append(f"{element}_requires_loaded_config_hash")
    elif element == "reorder_rule":
        if not isinstance(rule_id, str):
            failures.append("reorder_requires_rule_identity")
        if not isinstance(order, dict):
            failures.append("reorder_requires_target_index")
        if draft is not None:
            failures.append("reorder_draft_must_be_null")
        if expected_hash is None:
            failures.append("reorder_requires_loaded_config_hash")
    elif element == "validate_rule":
        if not isinstance(draft, dict):
            failures.append("validate_requires_draft")
        if order is not None:
            failures.append("validate_order_must_be_null")
    return failures


def draft_shape_failures(draft: Any) -> list[str]:
    """Shape only: the wildcard grammar itself stays owner-owned (Section 3.1).

    No length cap, whitespace rule or control-character rule is asserted here.
    The accept side of the owner's Section 3.1 syntax is materialized as
    ``external_directory_glob_syntax_accepted`` and applied by the derivation;
    the reject side stays the held slice ``external_directory_glob_predicate``
    because the owner names no malformed-input condition, and no part of this
    shape law restates either.
    """

    if not isinstance(draft, dict):
        return ["draft_missing"]
    pattern = draft.get("tool_pattern")
    if not isinstance(pattern, str) or not pattern:
        return ["draft_pattern_missing"]
    return []


# ---------------------------------------------------------------------------
# derivation: the owner-visible consequence of a request against the snapshot
# ---------------------------------------------------------------------------


def derive_expected(
    request: Mapping[str, Any],
    snapshot: Mapping[str, Any],
    *,
    observed_rule_id: Any = None,
) -> dict[str, Any]:
    """Derive the owner-visible expectation for one declared request.

    ``observed_rule_id`` is required for create because Section 9 makes the rule
    id owner-generated at creation; every other input is taken from the request
    and the owner-selected rule projection only.
    """

    element = element_of(request.get("command_id"))
    layer = snapshot.get("config_layer")
    selectable = snapshot.get("selectable_scope_keys") or []
    pre_rules = _rules(snapshot.get("ordered_rules"))
    scope_key = request.get("scope_key")
    expected_hash = request.get("expected_loaded_config_hash")
    loaded_hash = snapshot.get("declared_loaded_config_hash")

    result: dict[str, Any] = {
        "element": element,
        "status": "held",
        "held_slice": None,
        "refusal_code": None,
        "reason": "",
        "pre_rules": pre_rules,
        "post_rules": None,
        "pre_hash": loaded_hash,
        "selected_rule": None,
        "selected_rule_index": None,
        "selected_scope_index": None,
        "derived_order_index": None,
        "validate_mode": element == "validate_rule",
    }

    if element is None:
        result["reason"] = "unknown_command_id"
        return result

    field_law_failures = request_field_law_failures(request)
    if field_law_failures:
        result["held_slice"] = "request_field_laws"
        result["reason"] = ";".join(field_law_failures)
        return result

    if scope_key not in selectable or not scope_allowed_in_layer(layer, scope_key):
        result.update(status="refusal", refusal_code="scope_mismatch", reason="scope_not_selectable_in_layer")
        return result

    if element in MUTATING_ELEMENTS and snapshot.get("writable_state") == "not_writable":
        result["held_slice"] = "unwritable_config_outcome"
        result["reason"] = "config_not_writable"
        return result

    if element in MUTATING_ELEMENTS and expected_hash != loaded_hash:
        result.update(refusal_code="permission_config_write_conflict", reason="request_config_hash_not_current")
        result["status"] = "refusal"
        return result

    indices_in_scope = [
        index for index, rule in enumerate(pre_rules) if rule.get("scope_key") == scope_key
    ]

    if element in {"update_rule", "reorder_rule", "delete_rule"}:
        matches = [
            (index, rule)
            for index, rule in enumerate(pre_rules)
            if rule.get("rule_id") == request.get("rule_id")
        ]
        if not matches:
            result.update(status="refusal", refusal_code="rule_not_found", reason="selected_rule_absent")
            return result
        if len(matches) > 1:
            result["held_slice"] = "request_field_laws"
            result["reason"] = "selected_rule_ambiguous"
            return result
        selected_index, selected_rule = matches[0]
        result["selected_rule"] = selected_rule
        result["selected_rule_index"] = selected_index
        if selected_rule.get("scope_key") != scope_key:
            result.update(status="refusal", refusal_code="scope_mismatch", reason="selected_rule_other_scope")
            return result
        try:
            result["selected_scope_index"] = indices_in_scope.index(selected_index)
        except ValueError:  # pragma: no cover - defensive: scope index always present
            result["selected_scope_index"] = None

    if element == "create_project_rule":
        draft = request["draft"]
        if draft_shape_failures(draft):
            result["held_slice"] = "request_field_laws"
            result["reason"] = ";".join(draft_shape_failures(draft))
            return result
        if is_directory_pattern_class(draft.get("pattern_class")):
            # Section 3.1 text is admissible and nothing here narrows it; only the
            # owner-specified exact duplicate path equality is derived, and the
            # reject predicate stays held.
            if not external_directory_glob_syntax_accepted(draft.get("tool_pattern")):
                result["held_slice"] = "external_directory_glob_predicate"
                result["reason"] = "directory_pattern_text_not_admissible"
                return result
            if any(
                rule.get("scope_key") == scope_key
                and is_directory_pattern_class(rule.get("pattern_class"))
                and rule.get("tool_pattern") == draft.get("tool_pattern")
                for rule in pre_rules
            ):
                result.update(
                    status="refusal",
                    refusal_code="external_directory_duplicate_path",
                    reason="duplicate_directory_path",
                )
                return result
        if not isinstance(observed_rule_id, str) or not observed_rule_id:
            result["held_slice"] = "request_field_laws"
            result["reason"] = "create_requires_observed_rule_identity"
            return result
        if any(rule.get("rule_id") == observed_rule_id for rule in pre_rules):
            result["reason"] = "create_identity_already_present"
            return result
        new_rule = {
            "rule_id": observed_rule_id,
            "tool_pattern": draft["tool_pattern"],
            "action": draft["action"],
            "scope_key": scope_key,
            "pattern_class": draft["pattern_class"],
            "created_at": None,
            "created_by_thread_id": None,
        }
        insertion_slot = indices_in_scope[-1] + 1 if indices_in_scope else len(pre_rules)
        post_rules = pre_rules[:insertion_slot] + [new_rule] + pre_rules[insertion_slot:]
        result.update(status="success", post_rules=post_rules, derived_order_index=len(indices_in_scope))
    elif element == "update_rule":
        draft = request["draft"]
        if draft_shape_failures(draft):
            result["held_slice"] = "request_field_laws"
            result["reason"] = "update_draft_shape_invalid"
            return result
        updated_rule = dict(result["selected_rule"])
        updated_rule.update(
            {
                "tool_pattern": draft["tool_pattern"],
                "action": draft["action"],
                "pattern_class": draft["pattern_class"],
            }
        )
        post_rules = list(pre_rules)
        post_rules[result["selected_rule_index"]] = updated_rule
        result.update(
            status="success",
            post_rules=post_rules,
            derived_order_index=result["selected_scope_index"],
        )
    elif element == "reorder_rule":
        target_index = request["order"]["target_index"]
        if target_index >= len(indices_in_scope):
            result.update(
                status="refusal",
                refusal_code="target_index_out_of_range",
                reason="target_index_out_of_scope_range",
            )
            return result
        scope_rules = [pre_rules[index] for index in indices_in_scope]
        moved_rule = scope_rules.pop(result["selected_scope_index"])
        scope_rules.insert(target_index, moved_rule)
        post_rules = list(pre_rules)
        for slot, rule in zip(indices_in_scope, scope_rules):
            post_rules[slot] = rule
        result.update(status="success", post_rules=post_rules, derived_order_index=target_index)
    elif element == "delete_rule":
        post_rules = [
            rule for index, rule in enumerate(pre_rules) if index != result["selected_rule_index"]
        ]
        result.update(status="success", post_rules=post_rules, derived_order_index=None)
    elif element == "validate_rule":
        draft = request["draft"]
        if draft_shape_failures(draft):
            result["held_slice"] = "request_field_laws"
            result["reason"] = "validate_draft_shape_invalid"
            return result
        if is_directory_pattern_class(draft.get("pattern_class")) and not external_directory_glob_syntax_accepted(
            draft.get("tool_pattern")
        ):
            result["held_slice"] = "external_directory_glob_predicate"
            result["reason"] = "directory_pattern_text_not_admissible"
            return result
        result.update(status="success", post_rules=list(pre_rules), derived_order_index=None)

    return result


# ---------------------------------------------------------------------------
# the join
# ---------------------------------------------------------------------------


def expected_kind_for_success(derived: Mapping[str, Any]) -> str:
    return "validated_no_persistence" if derived.get("validate_mode") else "persisted_atomic"


def _rule_sets_agree(observed: Sequence[Any], derived: Any) -> bool:
    if not isinstance(observed, list) or not isinstance(derived, list):
        return False
    if len(observed) != len(derived):
        return False
    for left, right in zip(observed, derived):
        if not isinstance(left, dict) or len(left) != len(right):
            return False
        for key, value in right.items():
            if key in {"created_at", "created_by_thread_id"}:
                continue
            if left.get(key) != value:
                return False
    return True


def _expectation_checks(
    request: Mapping[str, Any],
    result: Mapping[str, Any],
    availability: Mapping[str, Any],
    evidence: Mapping[str, Any],
    error: Mapping[str, Any] | None,
    derived: Mapping[str, Any],
) -> dict[str, list[str]]:
    """Outcome expectations, gated on the permission gate, availability and held slices."""

    checks: dict[str, list[str]] = {name: [] for name in CHECKS}
    element = derived["element"]
    allowed = evidence.get("effective_permission_state") == "allow"
    disposition = result.get("effect_disposition") if isinstance(result.get("effect_disposition"), dict) else {}
    kind = disposition.get("kind")
    if (
        not allowed
        or derived["held_slice"] is not None
        or derived["status"] == "held"
        or availability.get("availability") == "unavailable"
    ):
        return checks

    if derived["status"] == "refusal":
        if kind != "refused":
            checks["join_expected_refusal"].append(f"derived_refusal:{derived['refusal_code']}:observed:{kind}")
    elif derived["status"] == "success":
        expected_kind = expected_kind_for_success(derived)
        # A valid request whose owner write outcome could not be observed stays
        # truthful as ``unknown``; the reconciliation laws then apply.
        if kind not in {expected_kind, "unknown"}:
            checks["join_expected_success"].append(f"derived_success:observed:{kind}")

    if kind in {"refused", "blocked"}:
        if error is None:
            checks["join_error_code_binding"].append("refusal_without_error_record")
        elif kind == "refused" and error.get("error_code") is None:
            checks["join_error_code_binding"].append("refusal_without_owner_error_code")
        elif derived["status"] == "refusal" and error.get("error_code") != derived["refusal_code"]:
            checks["join_error_code_binding"].append(
                f"expected:{derived['refusal_code']}:observed:{error.get('error_code')}"
            )
    elif kind in {"persisted_atomic", "validated_no_persistence", "unknown"}:
        if error is not None:
            checks["join_error_code_binding"].append(f"error_record_on_{kind}")

    if (
        derived["status"] == "success"
        and kind == expected_kind_for_success(derived)
        and kind in {"persisted_atomic", "validated_no_persistence"}
    ):
        if derived["validate_mode"]:
            if result.get("observed_ordered_rules") is not None and not _rule_sets_agree(
                result["observed_ordered_rules"], derived["pre_rules"]
            ):
                checks["join_validate_scope_stability"].append("validation_changed_rule_set")
        else:
            observed_rules = result.get("observed_ordered_rules")
            if not isinstance(observed_rules, list):
                checks["join_success_rule_set"].append("observed_rule_set_missing")
            elif not _rule_sets_agree(observed_rules, derived["post_rules"]):
                checks["join_success_rule_set"].append("observed_rule_set_differs_from_derivation")
            if result.get("order_index") != derived["derived_order_index"]:
                checks["join_success_order_index"].append(
                    f"expected:{derived['derived_order_index']}:observed:{result.get('order_index')}"
                )
            observed_rule = result.get("observed_rule")
            if element == "create_project_rule":
                if not isinstance(observed_rule, dict) or observed_rule.get("rule_id") != result.get("rule_id"):
                    checks["join_success_rule_identity"].append("create_identity_not_bound")
                elif any(rule.get("rule_id") == result.get("rule_id") for rule in derived["pre_rules"]):
                    checks["join_success_rule_identity"].append("create_reused_existing_identity")
                else:
                    draft = request.get("draft") or {}
                    if (
                        observed_rule.get("tool_pattern") != draft.get("tool_pattern")
                        or observed_rule.get("action") != draft.get("action")
                        or observed_rule.get("pattern_class") != draft.get("pattern_class")
                        or observed_rule.get("scope_key") != request.get("scope_key")
                    ):
                        checks["join_success_rule_identity"].append("created_rule_differs_from_request_draft")
            elif element == "delete_rule":
                selected = derived["selected_rule"] or {}
                if not isinstance(observed_rule, dict) or observed_rule != selected:
                    checks["join_delete_audit_identity"].append("removed_rule_identity_not_retained")
                if result.get("rule_id") != selected.get("rule_id"):
                    checks["join_success_rule_identity"].append("delete_rule_identity_mismatch")
            else:
                selected = derived["selected_rule"] or {}
                if result.get("rule_id") != selected.get("rule_id"):
                    checks["join_success_rule_identity"].append(
                        f"expected:{selected.get('rule_id')}:observed:{result.get('rule_id')}"
                    )
                if isinstance(observed_rule, dict):
                    if element == "update_rule":
                        draft = request.get("draft") or {}
                        if (
                            observed_rule.get("tool_pattern") != draft.get("tool_pattern")
                            or observed_rule.get("action") != draft.get("action")
                            or observed_rule.get("pattern_class") != draft.get("pattern_class")
                        ):
                            checks["join_success_rule_identity"].append("update_differs_from_request_draft")
                    if observed_rule.get("scope_key") != selected.get("scope_key"):
                        checks["join_success_rule_identity"].append("rule_scope_changed_by_mutation")

    if kind == "refused" and error is not None:
        if error.get("error_code") == "permission_config_write_conflict" and result.get("dirty_state") != (
            "conflict_refresh_required"
        ):
            checks["join_dirty_state_binding"].append("write_conflict_requires_conflict_refresh_required")
    return checks


def _gate_checks(
    binding: Mapping[str, Any],
    request: Mapping[str, Any],
    snapshot: Mapping[str, Any],
    result: Mapping[str, Any],
    availability: Mapping[str, Any],
    evidence: Mapping[str, Any],
    error: Mapping[str, Any] | None,
    derived: Mapping[str, Any],
) -> dict[str, list[str]]:
    """Checks that hold regardless of the derived outcome."""

    checks: dict[str, list[str]] = {name: [] for name in CHECKS}
    command_id = binding.get("command_id")
    element = element_of(command_id)
    disposition = result.get("effect_disposition") if isinstance(result.get("effect_disposition"), dict) else {}
    kind = disposition.get("kind")
    effective = evidence.get("effective_permission_state")
    requested = evidence.get("requested_permission_state")

    if element is None:
        checks["join_command_identity"].append("unknown_command_id")
        return checks

    if request_field_law_failures(request):
        checks["join_request_field_laws"].extend(request_field_law_failures(request))

    selectable = snapshot.get("selectable_scope_keys") or []
    if request.get("scope_key") not in selectable:
        checks["join_scope_layer_binding"].append("request_scope_not_selectable")
    if not scope_allowed_in_layer(snapshot.get("config_layer"), request.get("scope_key")):
        checks["join_scope_layer_binding"].append("request_scope_not_in_layer")
    for rule in _rules(snapshot.get("ordered_rules")):
        if rule.get("scope_key") not in selectable:
            checks["join_scope_layer_binding"].append("snapshot_rule_scope_not_selectable")
            break
    if snapshot.get("config_layer") == "global" and list(selectable) != ["global"]:
        checks["join_scope_layer_binding"].append("global_layer_selectable_scopes_not_exact")
    if snapshot.get("config_layer") == "project" and "global" in selectable:
        checks["join_scope_layer_binding"].append("project_layer_must_not_offer_global")
    if snapshot.get("config_layer") == "project" and any(
        rule.get("scope_key") == "global" for rule in _rules(snapshot.get("ordered_rules"))
    ):
        checks["join_scope_layer_binding"].append("project_layer_contains_global_rule")

    identity_fields = [
        request.get("command_id"),
        result.get("command_id"),
        availability.get("command_id"),
        evidence.get("command_id"),
    ]
    if error is not None:
        identity_fields.append(error.get("command_id"))
    if any(field != command_id for field in identity_fields):
        checks["join_command_identity"].append("command_id_disagreement")
    if result.get("request_id") != request.get("request_id"):
        checks["join_command_identity"].append("request_id_disagreement")
    if result.get("scope_key") != request.get("scope_key"):
        checks["join_command_identity"].append("scope_key_disagreement")

    if result.get("dispatch_receipt_ref") != dispatch_receipt_ref(command_id):
        checks["join_receipt_reference"].append("dispatch_receipt_ref_mismatch")

    if availability.get("state_selector") != availability_selector(element):
        checks["join_state_selector_binding"].append("state_selector_mismatch")
    if availability.get("disabled_reason_projection") != disabled_reason_projection(element):
        checks["join_state_selector_binding"].append("disabled_reason_projection_mismatch")

    if availability_disabled_reason_failures(availability):
        checks["join_availability_binding"].append("projected_disabled_reason_mismatch")
    if availability.get("availability") == "unavailable" and kind in {
        "persisted_atomic",
        "validated_no_persistence",
    }:
        checks["join_availability_binding"].append("unavailable_command_observed_owner_work")
    if availability.get("availability") == "unavailable" and kind == "unknown":
        checks["join_availability_binding"].append("unavailable_command_observed_unknown_effect")
    if availability.get("availability") == "unavailable" and error is None and kind in {"refused", "blocked"}:
        checks["join_availability_binding"].append("unavailable_command_without_error_record")

    if effective != "allow" and kind != "blocked":
        checks["join_disposition_permission_parity"].append(f"effective:{effective}:disposition:{kind}")
    if (
        kind == "blocked"
        and effective == "allow"
        and availability.get("availability") != "unavailable"
    ):
        checks["join_disposition_permission_parity"].append(
            "blocked_disposition_without_permission_or_availability_cause"
        )

    if not ladder_is_legal(requested, effective):
        checks["join_permission_ladder"].append("effective_state_widens_requested_state")
    if ladder_is_clamped(requested, effective) != (evidence.get("downgrade_reason") is not None):
        checks["join_permission_ladder"].append("downgrade_reason_does_not_track_the_clamp")

    allowed_action_ids = evidence.get("allowed_action_ids")
    allowed_action_ids = allowed_action_ids if isinstance(allowed_action_ids, list) else None
    blocked_reason_code = evidence.get("blocked_reason_code")
    if allowed_action_ids is None:
        checks["join_permission_ladder"].append("allowed_action_ids_not_a_list")
    elif effective == "allow":
        if allowed_action_ids or blocked_reason_code is not None:
            checks["join_permission_ladder"].append("allow_state_must_not_carry_recovery_actions")
    elif effective == "ask":
        if not allowed_action_ids or blocked_reason_code != "approval_required":
            checks["join_permission_ladder"].append("ask_state_requires_approval_required_and_actions")
    elif effective == "deny":
        if blocked_reason_code is None:
            checks["join_permission_ladder"].append("deny_state_requires_blocked_reason_code")

    dirty_state = result.get("dirty_state")
    if dirty_state == TRANSIENT_DIRTY_STATE:
        checks["join_dirty_state_binding"].append("settled_result_must_not_report_transient_saving")
    if kind == "persisted_atomic" and dirty_state != "saved":
        checks["join_dirty_state_binding"].append("persisted_write_requires_saved")
    if kind == "refused" and dirty_state not in {"dirty", "save_failed", "conflict_refresh_required"}:
        checks["join_dirty_state_binding"].append(f"refusal_dirty_state:{dirty_state}")
    if kind == "blocked" and dirty_state not in {"dirty", "conflict_refresh_required"}:
        checks["join_dirty_state_binding"].append(f"blocked_dirty_state:{dirty_state}")
    if kind == "validated_no_persistence" and dirty_state not in {"clean", "dirty"}:
        checks["join_dirty_state_binding"].append(f"validation_dirty_state:{dirty_state}")
    if kind == "unknown" and dirty_state not in {"save_failed", "conflict_refresh_required"}:
        checks["join_dirty_state_binding"].append(f"unknown_dirty_state:{dirty_state}")

    steps = disposition.get("atomic_steps")
    if kind == "persisted_atomic":
        if not isinstance(steps, list) or list(steps[: len(ATOMIC_STEP_SEQUENCE)]) != list(ATOMIC_STEP_SEQUENCE):
            checks["join_atomic_steps_binding"].append("atomic_step_sequence_incomplete")
        elif len(steps) == 4 and steps[3] != OPTIONAL_FINAL_ATOMIC_STEP:
            checks["join_atomic_steps_binding"].append("unexpected_fourth_atomic_step")
        elif len(steps) > 4:
            checks["join_atomic_steps_binding"].append("too_many_atomic_steps")
    elif steps:
        checks["join_atomic_steps_binding"].append("atomic_steps_without_atomic_write")

    if disposition.get("reconciliation_required") != (kind == "unknown"):
        checks["join_unknown_reconciliation"].append("reconciliation_required_must_track_unknown")
    if kind == "unknown":
        if element == "validate_rule":
            checks["join_validate_no_persistence"].append("validation_must_not_report_unknown_effect")
        if result.get("observed_config_hash") is not None or result.get("observed_ordered_rules") is not None:
            checks["join_unknown_reconciliation"].append("unknown_effect_must_not_claim_post_state")

    if kind in {"refused", "blocked"}:
        if result.get("persistence_receipt_ref") is not None:
            checks["join_no_write_state_stability"].append("no_write_outcome_claims_persistence_receipt")
        observed_rules = result.get("observed_ordered_rules")
        if observed_rules is not None and not _rule_sets_agree(observed_rules, derived["pre_rules"]):
            checks["join_no_write_state_stability"].append("no_write_outcome_changed_rule_set")

    if result.get("approval_created") and element != "validate_rule" and not (
        element == "create_project_rule" and kind == "persisted_atomic"
    ):
        checks["join_approval_binding"].append("approval_created_outside_create_success")

    if element == "create_project_rule" and kind == "persisted_atomic":
        if any(
            rule.get("rule_id") == result.get("rule_id")
            for rule in _rules(snapshot.get("ordered_rules"))
        ):
            checks["join_success_rule_identity"].append("create_reused_existing_identity")

    if element == "validate_rule":
        if kind == "persisted_atomic":
            checks["join_validate_no_persistence"].append("validation_must_not_persist")
        if result.get("persistence_receipt_ref") is not None:
            checks["join_validate_no_persistence"].append("validation_claims_persistence_receipt")
        if result.get("approval_created"):
            checks["join_validate_no_approval"].append("validation_created_approval")

    if snapshot.get("writable_state") == "not_writable" and element in MUTATING_ELEMENTS:
        if kind not in {"blocked", "refused"}:
            checks["join_unwritable_config_must_not_persist"].append(f"not_writable_observed:{kind}")
        if result.get("persistence_receipt_ref") is not None:
            checks["join_unwritable_config_must_not_persist"].append("not_writable_claims_receipt")
        if availability.get("availability") != "unavailable":
            checks["join_unwritable_config_must_not_persist"].append(
                "not_writable_requires_unavailable_disabled_projection"
            )
        elif availability.get("unmet_precondition_id") != NOT_WRITABLE_PRECONDITION:
            # The owner names `permission_config_writable` as the precondition of
            # every mutating control, so the truthful projected disabled reason is
            # that unmet precondition - never a generic handler reason and never
            # the mutation-only write-conflict code.
            checks["join_unwritable_config_must_not_persist"].append(
                "not_writable_requires_unmet_precondition_reason"
            )
        # The concurrent-write conflict is a different, hash-comparison condition
        # before rename: a config the owner reports as not writable never reaches
        # that comparison, so it must not be documented with that named code.
        if isinstance(error, Mapping) and error.get("error_code") == "permission_config_write_conflict":
            checks["join_unwritable_config_must_not_persist"].append(
                "not_writable_must_not_be_documented_as_write_conflict"
            )

    evidence_record = result.get("evidence") if isinstance(result.get("evidence"), dict) else {}
    for record in (evidence_record, availability, evidence):
        if not isinstance(record, dict):
            continue
        if record.get("emitted_event_types") not in (None, []):
            checks["join_event_boundary"].append("event_types_declared")
        if record.get("admitted_event_record") is True:
            checks["join_event_boundary"].append("event_record_claimed")
        if record.get("native_handler_claim") is True or record.get("native_execution_observed") is True:
            checks["join_event_boundary"].append("native_claim_present")
    if disposition.get("overwrote_newer_file") is True:
        checks["join_atomic_steps_binding"].append("newer_file_overwrite_claimed")
    return checks


def _episode_checks(
    selection: Mapping[str, Any],
    owner_episode_read: Callable[[], Mapping[str, Any]] | None,
) -> dict[str, list[str]]:
    """Laws of the permission-blocked episode selection join.

    The claimed episode and the claimed ordered action list are the blocked-flow
    projection that was displayed; the current blocked episode arrives only from
    an independent owner read (the separately pinned static owner episode test
    double at the static gate), so a record can never witness itself.  Admission
    is derived from the selected action id through the owner-named command table
    and never from display copy.
    """

    checks: dict[str, list[str]] = {name: [] for name in CHECKS}
    if not isinstance(selection, Mapping):
        return checks
    if selection.get("record_kind") != "permissions_blocked_episode_selection":
        return checks

    current: Mapping[str, Any] | None = None
    if callable(owner_episode_read):
        observed = owner_episode_read()
        current = observed if isinstance(observed, Mapping) else None
    state = episode_derived_state(selection, current)
    dispatch = episode_action_dispatch(selection.get("selected_action_id"))
    disposition = selection.get("disposition")
    admitted = disposition == "dispatch_admitted"
    refused = disposition == "refused"
    selected_action_id = selection.get("selected_action_id")
    claimed_actions = selection.get("claimed_allowed_action_ids")
    claimed_actions = claimed_actions if isinstance(claimed_actions, list) else None

    if current is None:
        checks["join_episode_original_unproven"].append("blocked_episode_original_not_independently_read")
    elif admitted and not state["identity_matches"]:
        checks["join_episode_original"].append("admitted_selection_episode_no_longer_current")

    if admitted:
        if claimed_actions is not None and selected_action_id not in claimed_actions:
            checks["join_episode_advertised_action"].append("selected_action_not_in_claimed_action_list")
        elif current is not None and state["identity_matches"] and not state["action_advertised"]:
            checks["join_episode_advertised_action"].append(
                "selected_action_not_exposed_by_current_blocked_episode"
            )

    if dispatch is None:
        checks["join_episode_dispatch_binding"].append("selected_action_outside_owner_action_inventory")
    elif refused:
        if any(selection.get(field) is not None for field in ("command_id", "dispatch_args", "hitl_decision")):
            checks["join_episode_dispatch_binding"].append("refused_selection_names_a_dispatch")
        if selection.get("scope_effect") != "none":
            checks["join_episode_dispatch_binding"].append("refused_selection_names_a_scope_effect")
    else:
        if selection.get("command_id") != dispatch["command_id"]:
            checks["join_episode_dispatch_binding"].append(
                f"expected_command:{dispatch['command_id']}:observed:{selection.get('command_id')}"
            )
        if selection.get("hitl_decision") != dispatch["hitl_decision"]:
            checks["join_episode_dispatch_binding"].append(
                f"expected_decision:{dispatch['hitl_decision']}:observed:{selection.get('hitl_decision')}"
            )
        if selection.get("scope_effect") != dispatch["scope_effect"]:
            checks["join_episode_dispatch_binding"].append(
                f"expected_scope_effect:{dispatch['scope_effect']}:observed:{selection.get('scope_effect')}"
            )
        args = selection.get("dispatch_args")
        if dispatch["command_id"] == "cmd.permissions.open":
            if args is not None:
                checks["join_episode_dispatch_binding"].append("open_permissions_takes_no_episode_args")
        elif not isinstance(args, Mapping) or set(args) != set(EPISODE_DISPATCH_ARG_KEYS):
            checks["join_episode_dispatch_binding"].append("dispatch_args_not_the_owner_minimum_args")
        elif dict(args) != episode_dispatch_args(selection):
            checks["join_episode_dispatch_binding"].append("dispatch_args_differ_from_selected_episode")

    refusal_reason = selection.get("refusal_reason")
    if refused:
        if refusal_reason is None:
            checks["join_episode_refusal_binding"].append("refused_selection_without_owner_refusal_reason")
        elif current is not None and state["refusal_reason"] is not None and refusal_reason != state["refusal_reason"]:
            checks["join_episode_refusal_binding"].append(
                f"expected:{state['refusal_reason']}:observed:{refusal_reason}"
            )
    elif refusal_reason is not None:
        checks["join_episode_refusal_binding"].append("non_refused_selection_carries_refusal_reason")
    return checks


def _merge(target: dict[str, list[str]], source: Mapping[str, Sequence[str]]) -> None:
    for name, details in source.items():
        if details:
            target.setdefault(name, []).extend(details)


def join_case_detail_failures(
    binding: Mapping[str, Any],
    *,
    enabled_checks: Iterable[str] | None = None,
    document: Mapping[str, Any] | None = None,
    owner_file_read: Callable[[], Mapping[str, Any]] | None = None,
    owner_post_write_read: Callable[[], Mapping[str, Any]] | None = None,
    owner_selected_rules_read: Callable[[], Sequence[Mapping[str, Any]]] | None = None,
    owner_episode_read: Callable[[], Mapping[str, Any]] | None = None,
) -> list[dict[str, str]]:
    """Run the causal join and return ``{check, detail}`` rows in CHECKS order.

    ``owner_file_read`` is the independent owner file-read callback used at the
    write boundary. It returns only the owner's current file hash; the file
    contents and custody never cross this contract. Every binding declares what
    the owner's current file hash is, so the join requires this independent read:
    the bound snapshot's ``declared_loaded_config_hash`` must equal the owner's
    current file hash (the owner's own pre-rename comparison), and a binding
    without the read is reported explicitly unproven through
    ``join_owner_currentness_unproven`` instead of passing.

    ``owner_selected_rules_read`` is the independent owner read of the owner's
    own selected rule projection. The embedded ``owner_snapshot.ordered_rules``
    is a declaration supplied by the same binding as the result derived from it,
    so original and result can co-mutate unseen; the declared projection must
    equal the independently read original rule for rule, and without that read
    ``join_owner_selected_original_unproven`` fails the binding.

    ``owner_post_write_read`` is the independent owner read-back required for a
    persisted claim; without it ``join_owner_readback_unproven`` fails the
    binding. A static fixture gate may supply a separate pinned owner-file test
    double as static test evidence; none of these callbacks proves a native
    write, a digest, a real file or a stored rule set.
    """

    if not isinstance(binding, Mapping):
        return [{"check": "join_command_identity", "detail": "binding_not_an_object"}]
    enabled = set(CHECKS) if enabled_checks is None else set(enabled_checks)
    if binding.get("record_kind") == "permissions_blocked_episode_selection":
        # The episode selection is not a rule-command binding: only its own laws
        # apply, and the current blocked episode reaches them from an independent
        # owner read.
        findings = {name: [] for name in CHECKS}
        _merge(findings, _episode_checks(binding, owner_episode_read))
        return [
            {"check": name, "detail": detail}
            for name in CHECKS
            if name in enabled
            for detail in findings.get(name, [])
        ]
    request = binding.get("request") if isinstance(binding.get("request"), Mapping) else {}
    snapshot = binding.get("owner_snapshot") if isinstance(binding.get("owner_snapshot"), Mapping) else {}
    result = binding.get("observed_result") if isinstance(binding.get("observed_result"), Mapping) else {}
    availability = binding.get("availability") if isinstance(binding.get("availability"), Mapping) else {}
    evidence = (
        binding.get("permission_evidence")
        if isinstance(binding.get("permission_evidence"), Mapping)
        else {}
    )
    error = binding.get("observed_error") if isinstance(binding.get("observed_error"), Mapping) else None

    derived = derive_expected(request, snapshot, observed_rule_id=result.get("rule_id"))
    findings: dict[str, list[str]] = {name: [] for name in CHECKS}
    _merge(findings, _gate_checks(binding, request, snapshot, result, availability, evidence, error, derived))
    _merge(findings, _expectation_checks(request, result, availability, evidence, error, derived))

    for check, detail in (
        *owner_current_hash_failures(snapshot, owner_file_read),
        *owner_selected_original_failures(snapshot, owner_selected_rules_read),
        *owner_readback_hash_failures(result, availability, evidence, owner_file_read, owner_post_write_read),
    ):
        findings.setdefault(check, []).append(detail)

    if document is not None:
        disabled_ref = availability.get("disabled_reason_ref")
        if isinstance(disabled_ref, str):
            resolved = resolve_pack_local_ref(document, disabled_ref)
            if not isinstance(resolved, Mapping) or resolved.get("record_kind") != "permissions_rule_error":
                findings.setdefault("join_availability_binding", []).append("disabled_reason_ref_unresolved")
            elif resolved.get("command_id") != binding.get("command_id"):
                findings.setdefault("join_availability_binding", []).append(
                    "disabled_reason_ref_command_mismatch"
                )
            elif resolved.get("error_code") not in RULE_ERROR_CODES:
                findings.setdefault("join_availability_binding", []).append(
                    "disabled_reason_ref_code_outside_closed_set"
                )

    return [
        {"check": name, "detail": detail}
        for name in CHECKS
        if name in enabled
        for detail in findings.get(name, [])
    ]


def join_case_failures(
    binding: Mapping[str, Any],
    *,
    enabled_checks: Iterable[str] | None = None,
    document: Mapping[str, Any] | None = None,
    owner_file_read: Callable[[], Mapping[str, Any]] | None = None,
    owner_post_write_read: Callable[[], Mapping[str, Any]] | None = None,
    owner_selected_rules_read: Callable[[], Sequence[Mapping[str, Any]]] | None = None,
    owner_episode_read: Callable[[], Mapping[str, Any]] | None = None,
) -> list[str]:
    """Stable check ids that rejected the binding, sorted and de-duplicated."""

    rows = join_case_detail_failures(
        binding,
        enabled_checks=enabled_checks,
        document=document,
        owner_file_read=owner_file_read,
        owner_post_write_read=owner_post_write_read,
        owner_selected_rules_read=owner_selected_rules_read,
        owner_episode_read=owner_episode_read,
    )
    return sorted({row["check"] for row in rows})


def resolve_pack_local_ref(document: Mapping[str, Any], ref: str) -> Any:
    if not isinstance(ref, str) or not ref.startswith("#/"):
        raise JoinInputError(f"not a pack-local pointer: {ref!r}")
    current: Any = document
    for token in ref[2:].split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        if isinstance(current, list):
            current = current[int(token)]
        elif isinstance(current, Mapping):
            current = current[token]
        else:
            raise JoinInputError(f"pointer leaves the document: {ref!r}")
    return current


# ---------------------------------------------------------------------------
# record-level semantics (the validator entry point)
# ---------------------------------------------------------------------------


RECORD_LAW_IDS: tuple[str, ...] = tuple(CHECKS) + tuple(RECORD_CHECK_IDS)


def record_semantic_failures(
    definition_name: str,
    value: Any,
    *,
    enabled_checks: Iterable[str] | None = None,
    owner_file_read: Callable[[], Mapping[str, Any]] | None = None,
    owner_post_write_read: Callable[[], Mapping[str, Any]] | None = None,
    owner_selected_rules_read: Callable[[], Sequence[Mapping[str, Any]]] | None = None,
    owner_episode_read: Callable[[], Mapping[str, Any]] | None = None,
) -> list[str]:
    """Laws that JSON Schema annotations cannot express, per record definition.

    ``enabled_checks`` is the same per-law switch the cross-record join uses, so
    a reviewer can show which law rejected a record and that the record passes
    when that single law is set aside. The three owner reads are the independent
    originals a currentness-bearing binding requires (owner's current file hash,
    owner's own selected rule projection, owner's post-write read-back); without
    them the binding is reported unproven rather than accepted.
    """

    if not isinstance(value, Mapping):
        return []
    enabled = set(RECORD_LAW_IDS) if enabled_checks is None else set(enabled_checks)

    def report(codes: Iterable[str]) -> list[str]:
        return sorted({code for code in codes if code in enabled})

    if definition_name == "permissions_rule_command_request":
        return report({"request_field_laws"} if request_field_law_failures(value) else set())
    if definition_name == "permissions_rule_owner_snapshot":
        failures: set[str] = set()
        rules = _rules(value.get("ordered_rules"))
        selectable = value.get("selectable_scope_keys") or []
        if value.get("config_layer") == "global" and list(selectable) != ["global"]:
            failures.add("snapshot_scope_layer_mismatch")
        if value.get("config_layer") == "project" and "global" in selectable:
            failures.add("snapshot_scope_layer_mismatch")
        for rule in rules:
            if rule.get("scope_key") not in selectable:
                failures.add("snapshot_scope_layer_mismatch")
            if value.get("config_layer") == "global" and rule.get("scope_key") != "global":
                failures.add("snapshot_scope_layer_mismatch")
            if value.get("config_layer") == "project" and rule.get("scope_key") == "global":
                failures.add("snapshot_scope_layer_mismatch")
        rule_ids = [rule.get("rule_id") for rule in rules]
        if len(rule_ids) != len(set(rule_ids)):
            failures.add("snapshot_rule_identity_duplicate")
        return report(failures)
    if definition_name == "permissions_rule_command_result":
        return report(result_semantic_failures(value))
    if definition_name == "permissions_rule_command_availability":
        failures = set()
        element = element_of(value.get("command_id"))
        if element is None:
            failures.add("availability_selector_command_mismatch")
        else:
            if value.get("state_selector") != availability_selector(element):
                failures.add("availability_selector_command_mismatch")
            if value.get("disabled_reason_projection") != disabled_reason_projection(element):
                failures.add("availability_selector_command_mismatch")
        if availability_disabled_reason_failures(value):
            failures.add("availability_disabled_reason_mismatch")
        return report(failures)
    if definition_name == "permissions_rule_permission_evidence":
        return report(permission_evidence_failures(value))
    if definition_name == "permissions_rule_error":
        return report(error_record_failures(value))
    if definition_name == "permissions_blocked_episode":
        return report(episode_semantic_failures(value))
    if definition_name == "permissions_blocked_episode_selection":
        return join_case_failures(
            value,
            enabled_checks=enabled_checks,
            owner_episode_read=owner_episode_read,
        )
    if definition_name == "permissions_rule_command_binding":
        element = element_of(value.get("command_id"))
        if element is not None:
            nested = [
                (value.get("request") or {}).get("command_id"),
                (value.get("observed_result") or {}).get("command_id"),
                (value.get("availability") or {}).get("command_id"),
                (value.get("permission_evidence") or {}).get("command_id"),
            ]
            if any(field != value.get("command_id") for field in nested):
                return report(["join_command_identity"])
        return join_case_failures(
            value,
            enabled_checks=enabled_checks,
            owner_file_read=owner_file_read,
            owner_post_write_read=owner_post_write_read,
            owner_selected_rules_read=owner_selected_rules_read,
        )
    return []


def result_semantic_failures(result: Mapping[str, Any]) -> set[str]:
    failures: set[str] = set()
    disposition = result.get("effect_disposition") if isinstance(result.get("effect_disposition"), dict) else {}
    kind = disposition.get("kind")
    element = element_of(result.get("command_id"))
    if element is None:
        failures.add("result_disposition_internal_mismatch")
    if result.get("dirty_state") == TRANSIENT_DIRTY_STATE:
        failures.add("evidence_transient_dirty_state")
    if kind == "persisted_atomic":
        if result.get("observed_config_hash") is None or result.get("persistence_receipt_ref") is None:
            failures.add("result_disposition_internal_mismatch")
        if result.get("order_index") is None and element != "delete_rule":
            failures.add("result_disposition_internal_mismatch")
        if element == "delete_rule" and result.get("order_index") is not None:
            failures.add("result_disposition_internal_mismatch")
        if disposition.get("atomic_steps") is None:
            failures.add("result_disposition_internal_mismatch")
    if kind == "validated_no_persistence":
        if element != "validate_rule":
            failures.add("result_disposition_internal_mismatch")
        if result.get("persistence_receipt_ref") is not None or result.get("approval_created") is not False:
            failures.add("result_disposition_internal_mismatch")
    if kind in {"refused", "blocked"}:
        if result.get("error") is None:
            failures.add("result_disposition_internal_mismatch")
        elif kind == "refused" and (result.get("error") or {}).get("error_code") is None:
            failures.add("result_disposition_internal_mismatch")
        if result.get("persistence_receipt_ref") is not None:
            failures.add("result_disposition_internal_mismatch")
    if kind in {"persisted_atomic", "validated_no_persistence", "unknown"}:
        if result.get("error") is not None:
            failures.add("result_disposition_internal_mismatch")
    if kind == "unknown":
        if disposition.get("reconciliation_required") is not True:
            failures.add("result_disposition_internal_mismatch")
        if result.get("observed_config_hash") is not None:
            failures.add("result_disposition_internal_mismatch")
    elif disposition.get("reconciliation_required") is not False:
        failures.add("result_disposition_internal_mismatch")
    if result.get("dispatch_receipt_ref") != dispatch_receipt_ref(result.get("command_id") or ""):
        failures.add("result_disposition_internal_mismatch")
    evidence = result.get("evidence") if isinstance(result.get("evidence"), dict) else {}
    if evidence.get("emitted_event_types") not in (None, []) or evidence.get("admitted_event_record") is True:
        failures.add("evidence_widening_attempt")
    if evidence.get("native_handler_claim") is True or evidence.get("native_execution_observed") is True:
        failures.add("evidence_widening_attempt")
    if evidence.get("native_write_evidence") not in (None, "absent"):
        failures.add("evidence_widening_attempt")
    return failures


def permission_evidence_failures(evidence: Mapping[str, Any]) -> set[str]:
    failures: set[str] = set()
    requested = evidence.get("requested_permission_state")
    effective = evidence.get("effective_permission_state")
    if not ladder_is_legal(requested, effective):
        failures.add("evidence_widening_attempt")
    if ladder_is_clamped(requested, effective) != (evidence.get("downgrade_reason") is not None):
        failures.add("evidence_downgrade_reason_mismatch")
    allowed_action_ids = evidence.get("allowed_action_ids")
    allowed_action_ids = allowed_action_ids if isinstance(allowed_action_ids, list) else None
    blocked_reason_code = evidence.get("blocked_reason_code")
    if allowed_action_ids is None:
        failures.add("evidence_allowed_action_ids_mismatch")
    elif effective == "allow":
        if allowed_action_ids or blocked_reason_code is not None:
            failures.add("evidence_allowed_action_ids_mismatch")
    elif effective == "ask":
        if not allowed_action_ids or blocked_reason_code != "approval_required":
            failures.add("evidence_allowed_action_ids_mismatch")
    elif effective == "deny" and blocked_reason_code is None:
        failures.add("evidence_allowed_action_ids_mismatch")
    if evidence.get("native_handler_claim") is True or evidence.get("native_execution_observed") is True:
        failures.add("evidence_widening_attempt")
    return failures


def error_record_failures(error: Mapping[str, Any]) -> set[str]:
    failures: set[str] = set()
    code = error.get("error_code")
    blocked_family = error.get("blocked_family")
    blocked_reason_code = error.get("blocked_reason_code")
    if code is None:
        # Only a permission-family block may document itself without a rule
        # error code; the blocked payload carries the canonical reason.
        if blocked_family is None:
            failures.add("error_code_detail_mismatch")
    elif code == "permission_config_parse_failed":
        if error.get("config_path") is None or not error.get("recovery_action_ids"):
            failures.add("error_code_detail_mismatch")
    elif code in PARSE_DETAIL_ERROR_CODES:
        if error.get("line") is not None or error.get("column") is not None:
            failures.add("error_code_detail_mismatch")
    elif code in RULE_ERROR_CODES:
        if (
            error.get("config_path") is not None
            or error.get("line") is not None
            or error.get("column") is not None
        ):
            failures.add("error_code_detail_mismatch")
    else:
        failures.add("error_code_detail_mismatch")
    if (blocked_family is None) != (blocked_reason_code is None):
        failures.add("error_blocked_payload_incomplete")
    if blocked_family is not None:
        if blocked_family not in BLOCKED_FAMILIES or blocked_reason_code not in BLOCKED_REASON_CODES:
            failures.add("error_blocked_payload_incomplete")
        if not error.get("allowed_action_ids"):
            failures.add("error_blocked_payload_incomplete")
    if error.get("executed") is not False:
        failures.add("error_blocked_payload_incomplete")
    return failures


def availability_disabled_reason_failures(availability: Mapping[str, Any]) -> list[str]:
    """The projected disabled reason of one availability record.

    An available control projects no reason. An unavailable control projects
    exactly one truthful reason: a declared owner error record (the pack-local
    ``disabled_reason_ref`` convention) or the owner-named precondition that is
    unmet (``unmet_precondition_id``, UCC-113's own precondition identifiers -
    ``permission_config_writable`` for the non-writable config). Neither form
    replaces the other, and no new reason vocabulary is minted.
    """

    failures: list[str] = []
    disabled_ref = availability.get("disabled_reason_ref")
    precondition = availability.get("unmet_precondition_id")
    if availability.get("availability") == "available":
        if disabled_ref is not None or precondition is not None:
            failures.append("available_command_must_not_project_a_disabled_reason")
        return failures
    if (disabled_ref is None) == (precondition is None):
        failures.append("unavailable_command_requires_exactly_one_projected_reason")
    elif precondition is not None and precondition not in PERMISSIONS_COMMAND_PRECONDITIONS:
        failures.append("unmet_precondition_outside_owner_command_preconditions")
    return failures


def episode_semantic_failures(episode: Mapping[str, Any]) -> set[str]:
    """Owner law of one blocked-episode projection.

    ``Plans/Permissions_System.md`` Section 6 keeps the approval ladder and the
    blocked payload distinct from policy denial, and the runtime blocked-outcome
    addendum keeps ``blocked_approval`` and ``blocked_policy`` from collapsing
    into one family.  An episode that exposes any approval-ladder action is
    therefore the approval family with ``approval_required``, not a policy block.
    """

    failures: set[str] = set()
    actions = episode.get("allowed_action_ids")
    actions = actions if isinstance(actions, list) else []
    approval_actions = [action for action in actions if action in {"approve_once", "approve_for_session", "approve_always"}]
    if approval_actions and (
        episode.get("blocked_family") != "blocked_approval"
        or episode.get("blocked_reason_code") != "approval_required"
    ):
        failures.add("episode_family_reason_mismatch")
    return failures


def permissions_rule_command_semantic_failures(
    definition_name: str,
    value: Any,
    *,
    enabled_checks: Iterable[str] | None = None,
    owner_file_read: Callable[[], Mapping[str, Any]] | None = None,
    owner_post_write_read: Callable[[], Mapping[str, Any]] | None = None,
    owner_selected_rules_read: Callable[[], Sequence[Mapping[str, Any]]] | None = None,
    owner_episode_read: Callable[[], Mapping[str, Any]] | None = None,
) -> list[str]:
    """Validator entry point: stable codes, no detail strings.

    A caller that owns the real Permissions config file supplies its own reads
    through ``owner_file_read``, ``owner_post_write_read`` and
    ``owner_selected_rules_read``. A static fixture gate may instead supply the
    separate pinned owner-file test double
    (``pm_permissions_rule_command_owner_file_double``) as static test evidence;
    that proves the conditional algorithm only and never a native producer.

    ``owner_episode_read`` is the independent read of the owner's *current*
    blocked episode for a permission-blocked episode selection, supplied by the
    separately pinned static owner episode test double
    (``pm_permissions_rule_owner_episode_double``).  The claimed episode carried
    by the selection is never its own witness: without this read the selection is
    reported unproven through ``join_episode_original_unproven``.
    """

    return sorted(
        set(
            record_semantic_failures(
                definition_name,
                value,
                enabled_checks=enabled_checks,
                owner_file_read=owner_file_read,
                owner_post_write_read=owner_post_write_read,
                owner_selected_rules_read=owner_selected_rules_read,
                owner_episode_read=owner_episode_read,
            )
        )
    )


__all__ = [
    "ATOMIC_STEP_SEQUENCE",
    "CHECKS",
    "COMMAND_IDS",
    "CURRENTNESS_BOUNDARY",
    "DECISION_CARDS",
    "ELEMENT_IDS",
    "EPISODE_ACTION_DISPATCH",
    "EPISODE_DISPATCH_ARG_KEYS",
    "EPISODE_DISPOSITIONS",
    "EPISODE_DISPATCH_COMMAND_IDS",
    "EPISODE_REFUSAL_REASONS",
    "EXTERNAL_DIRECTORY_TRAILING_OPTIONAL_TOKENS",
    "EXTERNAL_DIRECTORY_WILDCARD_INVENTORY",
    "FIXTURE_REL",
    "HELD_SLICES",
    "HITL_DECISION_VALUES",
    "MUTATING_COMMAND_IDS",
    "MUTATING_ELEMENTS",
    "OWNER_CITATIONS",
    "OWNER_SCHEMA_REL",
    "PERMISSION_BLOCKED_ACTION_IDS",
    "RECORD_CHECK_IDS",
    "RECORD_LAW_IDS",
    "RULE_ERROR_CODES",
    "SCHEMA_ID",
    "availability_selector",
    "derive_expected",
    "disabled_reason_projection",
    "dispatch_receipt_ref",
    "element_of",
    "episode_action_dispatch",
    "episode_derived_state",
    "episode_dispatch_args",
    "episode_semantic_failures",
    "external_directory_glob_syntax_accepted",
    "join_case_detail_failures",
    "join_case_failures",
    "owner_current_hash_failures",
    "owner_readback_hash_failures",
    "owner_selected_original_failures",
    "permissions_rule_command_semantic_failures",
    "record_semantic_failures",
    "resolve_pack_local_ref",
]
