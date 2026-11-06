# Shard 034: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L5790-L6582

Source SHA256: `9d447e5b7c72e94f759fe72dfe3e9c76bbaf13a30611d995efd6661782a31d0d`

---

## Command payload definitions (DL-333, 2026-11-05)

### W-095 - Project-Scope Worktree Command Payload Definitions

```yaml
plan_unit_id: W-095
unit_type: command_contract
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  Typed payload definitions for the project-scope git worktree commands that UI_Command_Catalog
  UCC-054..UCC-055 register (DL-333). The definitions block below gives each active command its
  args, owner result and narrowed error and disabled-reason codes in pm.command_payload_definitions.v1.
  The catalog keeps ids, labels, availability and aliases; the strict schema overlay keeps the common
  envelope and the closed code sets. GitHub_Integration worktree disabled states map to closed codes
  through the UCC-230 owner_state_code_map (DL-333 resolution 6); the closed set is not expanded.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible project-scope worktree commands (Worktrees rows, Review mode, destructive confirmations, lock actions).
depends_on: [UCC-230, UCC-054, UCC-055, GI-041, W-007, W-077, W-078, W-082, W-084, DL-333]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to W-095 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets; GitHub_Integration owner states are mapped, never added.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/WorktreeGitImprovement.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.git.worktree.list, cmd.git.worktree.select, cmd.git.worktree.open, cmd.git.worktree.compare, cmd.git.worktree.create, cmd.git.worktree.remove, cmd.git.worktree.prune, cmd.git.worktree.request_prune, cmd.git.worktree.reuse, cmd.git.worktree.recover, cmd.git.worktree.focus_lineage, cmd.git.worktree.release, cmd.git.worktree.lock, cmd.git.worktree.unlock]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token (cmd.git.worktree.open_files, cmd.git.worktree.switch, retired cmd.git.worktree.open_other).
  - Do not define the thread-scoped cmd.chat.worktree.* family here; UCC-230 routes it to ACD-637.
  - Do not expand the closed disabled-reason set with GitHub_Integration owner states; they map through the UCC-230 owner_state_code_map and stay display detail.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/GitHub_Integration.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: W-095
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.git.worktree.list
      ucc_units: [UCC-054]
      command_kind: shell_view
      # JUDGMENT: canon states no command_kind. The row only shows the worktree inventory with its
      # stale/blocked ownership projection state (UI_Command_Catalog.md:694); no durable state changes.
      response_kind: local_projection
      args:
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity repo_id (always); UCC-230 envelope common optional repo_id restated required"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]
      # JUDGMENT: canon names no disabled set for this row; not_configured covers git_available false
      # (UI_Command_Catalog.md:694). The row renders stale/blocked state instead of being disabled by it.
      aliases: []
    - command_id: cmd.git.worktree.select
      ucc_units: [UCC-054]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Selecting a row persists the selected worktree and
      # filter state per project (UI_Command_Catalog.md:695), like cmd.docker.context.select changing
      # the persisted target (DESIGN 4.6), and gates every worktree_selected command; not a bare view toggle.
      response_kind: owner_operation
      args:
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity repo_id (always); UCC-230 envelope common optional repo_id restated required"
        worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_row_available (UI_Command_Catalog.md:695) per UCC-230 identity rule"
        worktree_lifecycle_state:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when domain_action (UCC-230 row_groups); observed lifecycle state used as the stale_projection freshness guard even though select persists selection, not worktree state"
        filter_state:
          type: string
          required: false
          default: none
          constraints: {max_length: 256}
          provenance: gap
          gap_note: >-
            The row says select "persists selected worktree/filter state per project"
            (UI_Command_Catalog.md:695) but names no field for the filter state. JUDGMENT: an opaque
            persisted filter token; alternative: a structured filter object, whose facets no canon enumerates.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeSelectResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required, stale_projection]
      # JUDGMENT: not_configured for git_available false, blocked_state_required for worktree_row_available
      # false, stale_projection for the 2.0B freshness clause (UI_Command_Catalog.md:695).
      aliases: []
    - command_id: cmd.git.worktree.open
      ucc_units: [UCC-054, UCC-058]
      command_kind: navigation_wrapper
      # JUDGMENT: canon states no command_kind. The row opens or focuses the selected worktree root
      # (UI_Command_Catalog.md:696), a route/open like cmd.testing.open_receipt; the wiring row records
      # a route/open disposition (Wiring_Matrix.production.json catalog.git_worktree_open).
      response_kind: local_projection
      args:
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity repo_id (always); UCC-230 envelope common optional repo_id restated required"
        worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:696) per UCC-230 identity rule"
        focus_target:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            No field names the open focus/target. The alias cmd.git.worktree.open_files supplies a "File
            Manager focus" argument (UI_Command_Catalog.md:697, :10415) and the retired
            cmd.git.worktree.open_other folded a "target argument" into open (UI_Command_Catalog.md:10416);
            neither canon names the field or its values. JUDGMENT: absent means the worktree root itself
            (the row's default behavior); a string target surface name. Alternative: a typed union of
            focus targets, which no canon enumerates.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required, stale_projection]
      # JUDGMENT: not_configured for git_available false, blocked_state_required for worktree_selected or
      # worktree_path_resolvable false (UI_Command_Catalog.md:696), stale_projection per the 2.0B clause.
      aliases:
        - {command_id: cmd.git.worktree.open_files, kind: compatibility_alias,
           source: "UCC-054 compatibility_only_notes; UI_Command_Catalog.md:697, :10415 (open plus File Manager focus argument)"}
        - {command_id: cmd.git.worktree.switch, kind: compatibility_alias,
           source: "UCC-054 compatibility_only_notes; UI_Command_Catalog.md:709 (compatibility alias for select plus open until callers migrate)"}
    - command_id: cmd.git.worktree.compare
      ucc_units: [UCC-054]
      command_kind: navigation_wrapper
      # JUDGMENT: canon states no command_kind. The row opens Review mode for the selected worktree
      # (UI_Command_Catalog.md:698), a route/open into the diff-centric Source Control lens
      # (WorktreeGitImprovement.md:452); the wiring row records a route/open disposition.
      response_kind: local_projection
      args:
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity repo_id (always); UCC-230 envelope common optional repo_id restated required"
        worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:698) per UCC-230 identity rule"
        compare_target:
          type: object
          required: true
          default: none
          fields:
            kind:
              type: enum
              required: true
              default: none
              values: [base_branch, other_worktree, pr_target, commit_range]
              provenance: gap
              gap_note: "the union discriminator; canon names the four members in prose only (UI_Command_Catalog.md:698)"
            base_branch:
              type: string
              required: false
              default: none
              constraints: {min_length: 1, max_length: 256}
              provenance: gap
              gap_note: "the base branch of the union; no field name in canon"
            other_worktree_id:
              type: id
              required: false
              default: none
              provenance: gap
              gap_note: "the other worktree of the union; no field name in canon"
            pr_target:
              type: ref
              required: false
              default: none
              provenance: gap
              gap_note: "the PR target of the union; no field name in canon"
            commit_range:
              type: object
              required: false
              default: none
              fields:
                from_commit: {type: string, required: true, default: none, constraints: {min_length: 40, max_length: 64}, provenance: gap, gap_note: "range start; no field name in canon"}
                to_commit: {type: string, required: true, default: none, constraints: {min_length: 40, max_length: 64}, provenance: gap, gap_note: "range end; no field name in canon"}
              provenance: gap
              gap_note: "the commit range of the union; no field name in canon"
          provenance: gap
          gap_note: >-
            The compare target is a union (base branch | another worktree | PR target | commit range,
            UI_Command_Catalog.md:698) with no field or discriminator anywhere. JUDGMENT: a tagged object
            with kind plus per-member fields, exactly one member set per kind. Alternatives: (a) the
            compare_origin ref shape the chat consumer uses for branch-to-branch review
            (WorktreeGitImprovement.md:121, ACD-058); (b) leaving the target to Review mode settings
            (WorktreeGitImprovement.md:452) and keeping only the selection. Bounds 40..64 fit a full or
            short git OID; canon fixes neither.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required, stale_projection]
      # JUDGMENT: not_configured for git_available false, blocked_state_required for worktree_selected or
      # compare_target_resolvable false (UI_Command_Catalog.md:698), stale_projection per the 2.0B clause.
      aliases: []
    - command_id: cmd.git.worktree.create
      ucc_units: [UCC-054]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Creating a worktree is a durable mutation
      # (UI_Command_Catalog.md:699) and W-084 binds child flows to this command.
      response_kind: owner_operation
      args:
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity repo_id (always); UCC-230 envelope common optional repo_id restated required"
        worktree_lifecycle_state:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when domain_action (UCC-230 row_groups); create mutates worktree state"
        path:
          type: path
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row says "Creates a new git worktree at specified path" (UI_Command_Catalog.md:699) but
            names no field. JUDGMENT: the caller-specified worktree path, required because the row fixes
            the location as specified; FileSafe owns normalization at run time (DL-333 resolution 11,
            no literal default for path).
        branch:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            No canon names the new worktree's branch field. W-007 requires existing branches to be
            verified and safe ones reused without unsafe deletion, so a branch argument is implied but
            unnamed. JUDGMENT: absent means the owner derives the branch per W-007.
        base_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            W-007 fixes the semantics ("the configured base branch or explicit ref") but names no payload
            field. JUDGMENT: absent means the configured base branch; present means the explicit ref.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeCreateResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required, stale_projection]
      # JUDGMENT: not_configured for git_available false, blocked_state_required for
      # worktree_limit_reached (UI_Command_Catalog.md:699), stale_projection per the 2.0B clause.
      aliases: []
    - command_id: cmd.git.worktree.remove
      ucc_units: [UCC-054, UCC-055]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind here; destructive removal after gates
      # (UI_Command_Catalog.md:705) and the W-078 escalation ladder are durable mutations.
      response_kind: owner_operation
      args:
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity repo_id (always); UCC-230 envelope common optional repo_id restated required"
        worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:705) per UCC-230 identity rule"
        worktree_lifecycle_state:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when domain_action (UCC-230 row_groups); remove mutates worktree state"
        safe_point_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity safe_point_id; safe action rows carry optional safe_point_id (UI_Command_Catalog.md 2.5C rules)"
        target_worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "GitHub_Integration.md Worktree Topology Commands destructive confirmation field target_worktree_id (GitHub_Integration.md:2117); the confirm-surface subject, the same worktree as worktree_id"
        expected_path:
          type: path
          required: true
          default: none
          provenance: canon
          source: "GitHub_Integration.md Worktree Topology Commands destructive confirmation field expected_path (GitHub_Integration.md:2117)"
        expected_branch:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "GitHub_Integration.md Worktree Topology Commands destructive confirmation field expected_branch (GitHub_Integration.md:2117)"
        confirmation_text:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "GitHub_Integration.md Worktree Topology Commands destructive confirmation field confirmation_text (GitHub_Integration.md:2117)"
        permission_snapshot_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "GitHub_Integration.md Worktree Topology Commands destructive confirmation field permission_snapshot_id (GitHub_Integration.md:2117)"
        override_record_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            W-078 requires run-owned or blocked_preserved removal to go through "the recorded override
            policy" with a double confirmation, but no field names the recorded override or its shape.
            JUDGMENT: a ref to the recorded override record, present only on the override ladder step.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeRemoveResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, permission_required, blocked_state_required, stale_projection]
      # Canon: the Worktree Topology Commands disabled states dirty_worktree, untracked_files,
      # protected_branch, missing_remote, permission_denied, operation_in_progress
      # (GitHub_Integration.md:2118) map through the UCC-230 owner_state_code_map to
      # blocked_state_required, not_configured, permission_required (DL-333 resolution 6); the locked
      # refusal (W-077) is blocked_state_required; stale_projection per the 2.0B clause.
      aliases: []
    - command_id: cmd.git.worktree.prune
      ucc_units: [UCC-054, UCC-055]
      command_kind: domain_action
      # Canon: destructive prune after gates (UI_Command_Catalog.md:701); domain_action per the family.
      response_kind: owner_operation
      args:
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity repo_id (always); UCC-230 envelope common optional repo_id restated required"
        worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:701) per UCC-230 identity rule"
        worktree_lifecycle_state:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when domain_action (UCC-230 row_groups); prune mutates worktree state"
        safe_point_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity safe_point_id; safe action rows carry optional safe_point_id (UI_Command_Catalog.md 2.5C rules)"
        approved_request_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            GI-041 makes the approved request the command's subject ("it requires the approved request as
            its subject"; direct prune execution without an approved request is invalid) but names no field
            for it. JUDGMENT: a ref to the approved prune request produced by cmd.git.worktree.request_prune.
        target_worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "GI-041 destructive confirmation field target_worktree_id (GitHub_Integration.md:2491 canonical_text)"
        expected_path:
          type: path
          required: true
          default: none
          provenance: canon
          source: "GI-041 destructive confirmation field expected_path (GitHub_Integration.md:2491 canonical_text)"
        expected_branch:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "GI-041 destructive confirmation field expected_branch (GitHub_Integration.md:2491 canonical_text)"
        confirmation_text:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "GI-041 destructive confirmation field confirmation_text (GitHub_Integration.md:2491 canonical_text)"
        permission_snapshot_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "GI-041 destructive confirmation field permission_snapshot_id (GI-041 preserved_exact_tokens; GitHub_Integration.md:2491 canonical_text)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreePruneResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, permission_required, blocked_state_required, stale_projection]
      # Canon: GI-041's six disabled states map through the UCC-230 owner_state_code_map to
      # blocked_state_required, not_configured, permission_required (DL-333 resolution 6); the locked
      # refusal (W-077) is blocked_state_required; stale_projection per the 2.0B clause.
      aliases: []
    - command_id: cmd.git.worktree.request_prune
      ucc_units: [UCC-054]
      command_kind: domain_action
      # Canon: its own command since DL-333 resolution 5 (UCC-054 stale_retired_dispositions), the
      # non-mutating approval-request phase of the two-phase prune flow (GI-041).
      response_kind: owner_operation
      args:
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity repo_id (always); UCC-230 envelope common optional repo_id restated required"
        worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:707) per UCC-230 identity rule"
        worktree_lifecycle_state:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when domain_action (UCC-230 row_groups); carried as the observed state for the stale_projection guard even though the command produces a request rather than mutating anything (GI-041)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeRequestPruneResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, permission_required, blocked_state_required, stale_projection]
      # JUDGMENT: canon names no disabled set for this row. GI-041 gates the request form on ownership
      # badges, admin override policy, prune protection defaults and safe-point awareness; those map to
      # permission_required and blocked_state_required, plus not_configured for git_available false
      # (UI_Command_Catalog.md:707) and stale_projection per the 2.0B clause.
      aliases: []
    - command_id: cmd.git.worktree.reuse
      ucc_units: [UCC-054, UCC-055]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Rebinding a clean worktree to a new owner after gates
      # (UI_Command_Catalog.md:703) is a durable ownership mutation.
      response_kind: owner_operation
      args:
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity repo_id (always); UCC-230 envelope common optional repo_id restated required"
        worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:703) per UCC-230 identity rule"
        worktree_lifecycle_state:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when domain_action (UCC-230 row_groups); reuse mutates ownership state"
        safe_point_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity safe_point_id; safe action rows carry optional safe_point_id (UI_Command_Catalog.md 2.5C rules)"
        new_owner:
          type: object
          required: true
          default: none
          fields:
            kind:
              type: enum
              required: true
              default: none
              values: [run, lane, package]
              provenance: gap
              gap_note: "the owner class of the union; canon words are the prose 'run/lane/package owner' (UI_Command_Catalog.md:703)"
            owner_ref:
              type: ref
              required: true
              default: none
              provenance: gap
              gap_note: "the run, lane or package reference; no field name in canon"
          provenance: gap
          gap_note: >-
            The new owner is a run | lane | package union (UI_Command_Catalog.md:703) with no field or
            discriminator. JUDGMENT: a tagged object, kind plus owner_ref. The 2.5C rule that safe
            actions carry "lane/run/package refs" (UI_Command_Catalog.md 2.5C rules) names the same
            concepts without field names.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeReuseResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required, stale_projection]
      # JUDGMENT: not_configured for git_available false, blocked_state_required for ownership_resolvable,
      # worktree_clean or lineage_gate_passed false (UI_Command_Catalog.md:703) and the W-077 locked
      # refusal, stale_projection per the 2.0B clause.
      aliases: []
    - command_id: cmd.git.worktree.recover
      ucc_units: [UCC-054, UCC-055]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Reopening or rebinding from stored lineage, with the
      # unknown ownership marking (UI_Command_Catalog.md:704), is a durable recovery mutation.
      response_kind: owner_operation
      args:
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity repo_id (always); UCC-230 envelope common optional repo_id restated required"
        worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:704) per UCC-230 identity rule"
        worktree_lifecycle_state:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when domain_action (UCC-230 row_groups); recover rebinds worktree state"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeRecoverResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required, stale_projection]
      # JUDGMENT: not_configured for git_available false, blocked_state_required for worktree_selected
      # false (UI_Command_Catalog.md:704), stale_projection per the 2.0B clause.
      aliases: []
    - command_id: cmd.git.worktree.focus_lineage
      ucc_units: [UCC-054]
      command_kind: navigation_wrapper
      # JUDGMENT: canon states no command_kind. The row focuses a lineage context without mutating it
      # (UI_Command_Catalog.md:705); the wiring row records a route/open disposition.
      response_kind: local_projection
      args:
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity repo_id (always); UCC-230 envelope common optional repo_id restated required"
        worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:705) per UCC-230 identity rule"
        lineage_target:
          type: enum
          required: false
          default: none
          values: [owner_run, branch_lineage, receipt, orphaned_tombstone]
          provenance: gap
          gap_note: >-
            Which lineage context to focus ("owner run, branch lineage, receipt, or /orphaned tombstone
            context", UI_Command_Catalog.md:705) has no field. JUDGMENT: an enum absent when the command
            focuses the row's default lineage context; orphaned_tombstone spells the "/orphaned" prose
            token as a snake_case value. Alternative: a typed ref per member.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required, stale_projection]
      # JUDGMENT: not_configured for git_available false, blocked_state_required for worktree_selected
      # false (UI_Command_Catalog.md:705), stale_projection per the 2.0B clause.
      aliases: []
    - command_id: cmd.git.worktree.release
      ucc_units: [UCC-054]
      command_kind: domain_action
      # JUDGMENT: canon states no command_kind. Releasing runtime ownership changes durable ownership
      # eligibility (UI_Command_Catalog.md:706; W-082 release is distinct from physical cleanup).
      response_kind: owner_operation
      args:
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity repo_id (always); UCC-230 envelope common optional repo_id restated required"
        worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:706) per UCC-230 identity rule"
        worktree_lifecycle_state:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when domain_action (UCC-230 row_groups); release mutates ownership state"
        override_record_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row releases ownership after "lineage-safe completion, archival, or an explicit recorded
            override" (UI_Command_Catalog.md:706), but no field names the recorded override. JUDGMENT:
            a ref to the recorded override, present only on the explicit-override path. W-082's release
            fences (holder, generation, epoch, TopologyGeneration, SourceLocationId) are lease-side
            checks on the owner record, not named payload fields here.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeReleaseResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required, stale_projection]
      # JUDGMENT: not_configured for git_available false, blocked_state_required for worktree_selected
      # or ownership_resolvable false (UI_Command_Catalog.md:706), stale_projection per the 2.0B clause.
      aliases: []
    - command_id: cmd.git.worktree.lock
      ucc_units: [UCC-054]
      command_kind: domain_action
      # canon: UI_Command_Catalog.md:12162 (Worktree and GitHub PR rows).
      response_kind: owner_operation
      args:
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity repo_id (always); UCC-230 envelope common optional repo_id restated required"
        worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:712) per UCC-230 identity rule"
        worktree_lifecycle_state:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when domain_action (UCC-230 row_groups); lock mutates worktree state"
        reason:
          type: string
          required: true
          default: none
          constraints: {min_length: 1}
          provenance: canon
          source: "W-077: lock requires a reason string, stored and displayed with the lock (WorktreeGitImprovement.md:5408 canonical_text); lock provenance user or run-owned is recorded with the lock"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeLockResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      # canon: UI_Command_Catalog.md:12162 disabled_reasons stale_projection.
      aliases: []
    - command_id: cmd.git.worktree.unlock
      ucc_units: [UCC-054]
      command_kind: domain_action
      # canon: UI_Command_Catalog.md:12163 (Worktree and GitHub PR rows).
      response_kind: owner_operation
      args:
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity repo_id (always); UCC-230 envelope common optional repo_id restated required"
        worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_locked (UI_Command_Catalog.md:713): the locked worktree is the subject, per UCC-230 identity rule"
        worktree_lifecycle_state:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when domain_action (UCC-230 row_groups); unlock mutates worktree state"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeUnlockResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection, permission_required]
      # canon: UI_Command_Catalog.md:12163 disabled_reasons stale_projection, permission_required.
      # W-077's refusal of a run-owned lock while the owner is live is an owner refusal naming the owner,
      # not a closed-set disabled code.
      aliases: []
  results:
    WorktreeSelectResultV1:
      fields:
        worktree_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the worktree now selected"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt; the wiring row requires a receipt effect (catalog.git_worktree_select)"}
    WorktreeCreateResultV1:
      fields:
        worktree_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the created worktree"}
        path: {type: path, required: true, default: none, provenance: gap, gap_note: "the worktree path as materialized"}
        branch: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: "the branch the worktree was created on"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_create)"}
    WorktreeRemoveResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_remove)"}
    WorktreePruneResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_prune)"}
    WorktreeRequestPruneResultV1:
      fields:
        prune_request_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the produced prune request, the subject cmd.git.worktree.prune executes (GI-041)"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_request_prune)"}
    WorktreeReuseResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_reuse)"}
    WorktreeRecoverResultV1:
      fields:
        worktree_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the recovered or rebound worktree; ownership may resolve to the unknown ownership marking (UI_Command_Catalog.md:704)"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_recover)"}
    WorktreeReleaseResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_release)"}
    WorktreeLockResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_lock)"}
    WorktreeUnlockResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_unlock)"}
```
