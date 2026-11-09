# Shard 034: Command payload definitions (DL-333, 2026-11-05)

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L5790-L7727

Source SHA256: `b65da80fa9e1ab91fac385dad2e2b8aa4ff0ba744b1a9ce5489c6cdb1436aa1b`

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
  release carries the W-082 lease fences its caller expects in expected_lease, remove, prune, reuse
  and recover carry them whenever the worktree has a lease, and create carries them whenever it
  materializes a reserved lease, so the owner can refuse a stale fence.
  cmd.git.worktree.open records the assistant alias cmd.chat.worktree.open_files (CV-160).
  create records the compatibility spelling cmd.worktree.provision and release records cmd.worktree.release,
  the two worktree compatibility intents of CS-066 and UCC-145.
  Amended 2026-11-09 (DL-471): the same block also defines the external-list commands
  cmd.git.worktree.merge (UCC-132), cmd.git.worktree.open_topology and cmd.git.worktree.repair
  (UCC-231). Merge retains W-081/W-082/W-084 exact-result, lease and independent protection fences.
  The topology view is decided by DL-471 Q-ID6; DL-471 Q-ID7b decides to keep repair unavailable until its exact operation is defined. An undefined repair returns handler_unavailable without mutation, never an inferred destructive action.
  Plans/Decision_Log.md#DL-471, Q-ID5d decided by the owner: [cmd.git.worktree.merge], owner_request = "none". the typed UI args cross the owner boundary directly.
  Plans/Decision_Log.md#DL-471, Q-ID6 decided by the owner: [cmd.git.worktree.open_topology], command_kind = "shell_view". reveal this repository's existing topology projection.
  Plans/Decision_Log.md#DL-471, Q-ID6 decided by the owner: [cmd.git.worktree.open_topology], response_kind = "local_projection". existing topology projection and dispatch receipt only.
  Plans/Decision_Log.md#DL-471, Q-ID6 decided by the owner: [cmd.git.worktree.open_topology], disabled_reason_codes = ["not_configured"]. not_configured for missing repository tooling.
  Plans/Decision_Log.md#DL-471, Q-ID7b decided by the owner: [cmd.git.worktree.repair], command_kind = "domain_action". conservatively mutation-capable; refuse handler_unavailable without mutation until its exact owner repair operation is admitted.
  Plans/Decision_Log.md#DL-471, Q-ID7b decided by the owner: [cmd.git.worktree.repair], disabled_reason_codes = ["blocked_state_required", "stale_projection", "permission_required"]. reuse the existing UCC-230 worktree state mappings and stale/permission fences.
  Plans/Decision_Log.md#DL-471, Q-ID7b decided by the owner: [cmd.git.worktree.repair], owner_request = "none". no fabricated owner request; return handler_unavailable until an admitted exact repair operation exists.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible project-scope worktree commands (Worktrees rows, Review mode, destructive confirmations, lock actions).
depends_on: [UCC-230, UCC-054, UCC-055, UCC-058, GI-041, W-007, W-075, W-077, W-078, W-082, W-084, CV-160, CS-066, UCC-145, DL-333, DL-341]
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
preserved_exact_tokens: [cmd.git.worktree.list, cmd.git.worktree.select, cmd.git.worktree.open, cmd.git.worktree.compare, cmd.git.worktree.create, cmd.git.worktree.remove, cmd.git.worktree.prune, cmd.git.worktree.request_prune, cmd.git.worktree.reuse, cmd.git.worktree.recover, cmd.git.worktree.focus_lineage, cmd.git.worktree.release, cmd.git.worktree.lock, cmd.git.worktree.unlock, cmd.git.worktree.merge, cmd.git.worktree.open_topology, cmd.git.worktree.repair]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token (cmd.git.worktree.open_files, cmd.git.worktree.switch, cmd.chat.worktree.open_files, cmd.worktree.provision, cmd.worktree.release, retired cmd.git.worktree.open_other).
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
    - command_id: cmd.git.worktree.merge
      ucc_units: [UCC-132]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        project_id: {type: id, required: true, default: none, provenance: canon, source: "W-084 requires a real destination Project for PM Project worktree commands; UCC-230 common project_id type id"}
        repo_id: {type: id, required: true, default: none, provenance: canon, source: "UCC-230 project-scope worktree identity repo_id, always"}
        worktree_id: {type: id, required: true, default: none, provenance: canon, source: "UCC-132 Merge Worktree requires worktree_selected; UCC-230 types worktree_id as id"}
        worktree_lifecycle_state: {type: string, required: true, default: none, provenance: canon, constraints: {min_length: 1, max_length: 256}, source: 'Plans/Decision_Log.md#DL-471, Q-ID5a decided by the owner: nonempty owner state string of at most 256 characters, rechecked at dispatch.'}
        result_ref: {type: ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-ID5b decided by the owner: required result_ref identifies the immutable result, full OID, patch or verified-empty receipt and digest.'}
        baseline_ref: {type: ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-ID5b decided by the owner: required baseline_ref to the immutable baseline.'}
        target_observation_ref: {type: ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-ID5b decided by the owner: required ref bound to the exact target and generation, freshness rechecked.'}
        approval_ref: {type: ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-ID5b decided by the owner: required immutable approval ref tied to this result, baseline and target.'}
        permission_snapshot_id: {type: id, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-ID5b decided by the owner: require that id and independently re-admit Permissions at the exact target/generation.'}
        confirmation_ref: {type: ref, required: true, default: none, provenance: canon, source: "UCC-132 merge registration requires two_step confirmation; UCC-230 common confirmation_ref is ref"}
        protection_receipt_ref: {type: ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-ID5b decided by the owner: required exact-target protection receipt revalidated by FileSafe.'}
        expected_lease: {type: contract, ref: Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease, required: false, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-ID5c decided by the owner: optional full typed observed lease record; owner requires it whenever its selected worktree has a lease and compares lease_id, holder, generation, epoch, topology generation and Source Location, refusing absent/mismatched fences without mutation.'}
        topology_generation:
          type: integer
          required: false
          default: none
          constraints: {minimum: 0}
          provenance: canon
          source: >-
            W-082 requires comparison of the caller's observed topology generation whenever the selected
            worktree has a lease; the name and type follow W-095's topology_generation fence and
            Plans/shared_runtime_command_contracts.schema.json#/$defs/command_request_envelope. Placement is
            decided by DL-471 Q-ID5e (Jared, 2026-11-09, "Two separate fields (Recommended)"): a sibling arg
            beside the complete expected_lease. The owner requires it whenever the selected worktree has a
            lease, independently of caller omission of expected_lease; absent or unequal observed/current
            fences refuse merge without mutation.
        source_location_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: >-
            W-082 requires comparison of the caller's observed Source Location whenever the selected worktree
            has a lease; the name and type follow W-095's source_location_id fence and the UCC-230 id rule.
            Placement is decided by DL-471 Q-ID5e (Jared, 2026-11-09, "Two separate fields (Recommended)"): a
            sibling arg beside the complete expected_lease. The owner requires it whenever the selected
            worktree has a lease, independently of caller omission of expected_lease; absent or unequal
            observed/current fences refuse merge without mutation. Compare the full lease's lease_id,
            holder_identity_ref, generation and epoch plus these two observed extension fences against the
            same current owner observation before mutation.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeMergeResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection, permission_required]
      aliases: []
    - command_id: cmd.git.worktree.open_topology
      ucc_units: [UCC-231]
      command_kind: shell_view
      response_kind: local_projection
      args:
        repo_id: {type: id, required: true, default: none, provenance: canon, source: "UCC-230 project-scope worktree identity repo_id, always; GitHub_Integration Worktree Topology Commands registers open_topology"}
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured]
      aliases: []
    - command_id: cmd.git.worktree.repair
      ucc_units: [UCC-231]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        repo_id: {type: id, required: true, default: none, provenance: canon, source: "UCC-230 project-scope worktree identity repo_id, always"}
        worktree_id: {type: id, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-ID7a decided by the owner: require the exact selected worktree id.'}
        worktree_lifecycle_state: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-ID7a decided by the owner: bounded nonempty owner state string, rechecked.'}
        target_worktree_id: {type: id, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-ID7a decided by the owner: required id equal to worktree_id.'}
        expected_path: {type: path, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-ID7a decided by the owner: required FileSafe-normalized path, equality rechecked by the owner.'}
        expected_branch: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-ID7a decided by the owner: required bounded branch identity; detached worktrees remain refused pending an exact representation.'}
        confirmation_text: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-ID7a decided by the owner: required bounded exact-target confirmation string checked by the owner.'}
        permission_snapshot_id: {type: id, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-ID7a decided by the owner: required id with fresh independent Permissions and FileSafe admission.'}
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeRepairResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection, permission_required]
      aliases: []
    - command_id: cmd.git.worktree.list
      ucc_units: [UCC-054]
      command_kind: shell_view
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
      judgments:
        - key: command_kind
          choice: shell_view
          gap_note: >-
            Canon states no command_kind for this row. The row only shows the worktree inventory with its
            stale/blocked ownership projection state (UI_Command_Catalog.md:699) and changes no durable state.
        - key: response_kind
          choice: local_projection
          gap_note: >-
            Follows the shell_view choice: the wiring row catalog.git_worktree_list names no request or result
            schema, only a no-persist dispatch receipt, so no owner result is carried.
        - key: disabled_reason_codes
          choice: [not_configured]
          gap_note: >-
            Canon names no disabled set for this row. not_configured covers git_available false
            (UI_Command_Catalog.md:699); the row renders stale and blocked state instead of being disabled by it.
      aliases: []
    - command_id: cmd.git.worktree.select
      ucc_units: [UCC-054]
      command_kind: domain_action
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
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_row_available (UI_Command_Catalog.md:700) per UCC-230 identity_typing"
        filter_state:
          type: object
          required: false
          default: none
          fields:
            lifecycle_state:
              type: list
              required: false
              default: none
              item: {type: enum, values: [reserved, active, blocked_preserved, released, orphaned]}
              constraints: {unique_items: true}
              provenance: gap
              gap_note: >-
                The values are W-075's lifecycle state dimension, spelled as canon spells them
                (WorktreeGitImprovement.md:5304). Canon names no field for the dimension: lifecycle_state
                is its snake_case name. unique_items is a choice (a chip is on or off); absent or empty means
                the dimension does not filter.
            owner_class:
              type: list
              required: false
              default: none
              item: {type: enum, values: [thread, orchestrator-lane, manual, agent-role]}
              constraints: {unique_items: true}
              provenance: gap
              gap_note: >-
                The values are W-075's owner class dimension in canon's own spelling, hyphens kept
                (WorktreeGitImprovement.md:5304-5305). Canon names no field: owner_class is the dimension's
                snake_case name; unique_items as for lifecycle_state.
            row_flags:
              type: list
              required: false
              default: none
              item: {type: enum, values: [locked, prunable, dirty, repairable]}
              constraints: {unique_items: true}
              provenance: gap
              gap_note: >-
                The values are W-075's row flags dimension (WorktreeGitImprovement.md:5305). Canon names no
                field: row_flags is the dimension's snake_case name; unique_items as for lifecycle_state.
            blocked_reason_family:
              type: list
              required: false
              default: none
              item: {type: enum, values: [approval-gated, policy-blocked, preflight-blocked, auth-blocked, governance-blocked, stale-data-blocked]}
              constraints: {unique_items: true}
              provenance: gap
              gap_note: >-
                The values are W-075's blocked-reason family dimension in canon's own spelling
                (WorktreeGitImprovement.md:5306-5307). Canon names no field: blocked_reason_family is the
                dimension's snake_case name; unique_items as for lifecycle_state.
          provenance: gap
          gap_note: >-
            The row says select "persists selected worktree/filter state per project" (UI_Command_Catalog.md:700)
            and names no field. W-075 fixes the filters: exactly four dimensions with enumerated values, OR within a
            dimension and AND across dimensions, persisted per project with the panel state
            (WorktreeGitImprovement.md:5302-5311). The object has one optional list per dimension, and the OR/AND
            rule is the owner's evaluation of it. The field name filter_state and the dimension field names are not
            canon. Absent means the persisted filter selection is unchanged.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeSelectResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Canon states no command_kind for this row. Select persists the selected worktree and filter state per
            project (UI_Command_Catalog.md:700), and that persisted selection gates every worktree_selected
            command, so it is a durable owner selection. The other reading, shell_view
            with a local_projection response like cmd.git.worktree.list, also fits canon: W-075 keeps the selected
            worktree an owner runtime/view record (WorktreeGitImprovement.md:5317-5318). UCC-230 lists select as a
            domain_action that does not mutate worktree state (not_mutating, DL-341).
        - key: omitted:worktree_lifecycle_state
          choice: omitted
          gap_note: >-
            The overlay requires worktree_lifecycle_state only "when mutating worktree state"
            (UI_Command_Catalog.md:8851), and UCC-230 lists select under not_mutating (DL-341), so the field is
            left out.
        - key: disabled_reason_codes
          choice: [not_configured, blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. not_configured covers git_available false,
            blocked_state_required covers worktree_row_available false (UI_Command_Catalog.md:700), and
            stale_projection is the 2.0B projection-freshness clause.
      aliases: []
    - command_id: cmd.git.worktree.open
      ucc_units: [UCC-054, UCC-058]
      command_kind: navigation_wrapper
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
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:701) per UCC-230 identity_typing"
        focus_target:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            No field names the open focus or target. The alias cmd.git.worktree.open_files supplies a "File
            Manager focus" argument (UI_Command_Catalog.md:702 and the Cozy Shelves alias table row at :12495), and
            the retired cmd.git.worktree.open_other folded a "target argument" into open (alias table row at
            :12496); neither names the field or its values. Choice: absent means the worktree root itself (the
            row's own behavior, :701); present is a target surface name. The bounds 1..256 are not canon. A typed
            union of focus targets is the alternative, and no canon enumerates one.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: navigation_wrapper
          gap_note: >-
            Canon states no command_kind for this row. It opens or focuses the selected worktree root
            (UI_Command_Catalog.md:701), a route/open like cmd.testing.open_receipt.
        - key: response_kind
          choice: local_projection
          gap_note: >-
            A route/open with no owner result: the wiring row catalog.git_worktree_open names no request or result
            schema, only a dispatch receipt or route/open disposition.
        - key: disabled_reason_codes
          choice: [not_configured, blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. not_configured covers git_available false,
            blocked_state_required covers worktree_selected or worktree_path_resolvable false
            (UI_Command_Catalog.md:701), and stale_projection is the 2.0B clause.
        - key: aliases
          choice: [cmd.git.worktree.open_files, cmd.git.worktree.switch, cmd.chat.worktree.open_files]
          gap_note: >-
            UCC-054 makes cmd.git.worktree.switch a compatibility alias for "select plus open"
            (UI_Command_Catalog.md:714) and names no single target. It is recorded on open, not on select, because
            the alias ends in the open (the select is the selection open already requires, precondition
            worktree_selected, :701), and one alias token is recorded on one definition. open_files is open's alias
            (:702, :12495). GitHub_Integration.md:2115 lists switch among its Command IDs; the catalog, which keeps
            aliases, makes it an alias, and this definition follows the catalog. cmd.chat.worktree.open_files is
            recorded here too. Canon conflict: CV-160 lets it route to the canonical assistant worktree commands
            (Contracts_V0.md:1889, :11253), but none of the six opens files, while the catalog routes Open Files
            through this project-scope command (UI_Command_Catalog.md:773) and lets the thread-scoped family
            normalize to project-scope worktree operations (:718). The catalog keeps aliases, so this definition
            takes its side.
      aliases:
        - {command_id: cmd.git.worktree.open_files, kind: compatibility_alias,
           source: "UCC-054 compatibility_only_notes; UI_Command_Catalog.md:702 and the Cozy Shelves alias table row cmd.git.worktree.open_files (:12495, open plus File Manager focus argument)"}
        - {command_id: cmd.git.worktree.switch, kind: compatibility_alias,
           source: "UCC-054 compatibility_only_notes; UI_Command_Catalog.md:714 (compatibility alias for select plus open until callers migrate)"}
        - {command_id: cmd.chat.worktree.open_files, kind: compatibility_alias,
           source: "CV-160 acceptance (Contracts_V0.md:11253) and the 7.1 registration note (:1889); the catalog's Open Files route through cmd.git.worktree.open (UI_Command_Catalog.md:773); UCC-230 non_definition_tokens targets it to this command"}
    - command_id: cmd.git.worktree.compare
      ucc_units: [UCC-054]
      command_kind: navigation_wrapper
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
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:703) per UCC-230 identity_typing"
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
              gap_note: "the union discriminator; canon names the four members in prose only (UI_Command_Catalog.md:703), so the field and its value spellings are not canon"
            base_branch:
              type: string
              required: false
              default: none
              constraints: {min_length: 1, max_length: 256}
              required_when: {field: kind, in: [base_branch]}
              provenance: gap
              gap_note: "the base branch member; the SCM status payload names a base_branch field (WorktreeGitImprovement.md:297) but gives no type or bounds, and no canon names it as a compare argument; the bounds are not canon"
            other_worktree_id:
              type: id
              required: false
              default: none
              required_when: {field: kind, in: [other_worktree]}
              provenance: gap
              gap_note: "the other-worktree member; no field name in canon"
            pr_target:
              type: ref
              required: false
              default: none
              required_when: {field: kind, in: [pr_target]}
              provenance: gap
              gap_note: "the PR target member; no field name in canon"
            commit_range:
              type: object
              required: false
              default: none
              required_when: {field: kind, in: [commit_range]}
              fields:
                from_commit_oid: {type: string, required: true, default: none, constraints: {pattern: "^[0-9a-f]{40}([0-9a-f]{24})?$"}, provenance: gap, gap_note: "range start; no field name in canon, named after canon's *_commit_oid fields (head_commit_oid, baseline_commit_oid, WorktreeGitImprovement.md:297). Full object ids only: 40 hex characters (SHA-1) or 64 (SHA-256); a short id is refused. The pattern is not canon."}
                to_commit_oid: {type: string, required: true, default: none, constraints: {pattern: "^[0-9a-f]{40}([0-9a-f]{24})?$"}, provenance: gap, gap_note: "range end; as from_commit_oid"}
              provenance: gap
              gap_note: "the commit-range member; no field name in canon"
          provenance: gap
          gap_note: >-
            The compare target is a union (base branch | another worktree | PR target | commit range,
            UI_Command_Catalog.md:703). Canon names an optional compare_target in the SCM status payload
            (WorktreeGitImprovement.md:297) but gives it no shape, discriminator or member fields. Choice: a tagged
            object, kind plus the one member field that kind requires. Alternatives: (a) the compare_origin ref the
            chat consumer uses for branch-to-branch review (WorktreeGitImprovement.md:121, ACD-058); (b) leaving the
            target to Review mode settings (WorktreeGitImprovement.md:452) and keeping only the selection. W-075
            keeps exact compare targets owner runtime/view records (WorktreeGitImprovement.md:5317-5318), which
            either reading respects.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: navigation_wrapper
          gap_note: >-
            Canon states no command_kind for this row. It opens Review mode for the selected worktree
            (UI_Command_Catalog.md:703), a route/open into the diff-centric Source Control lens
            (WorktreeGitImprovement.md:452).
        - key: response_kind
          choice: local_projection
          gap_note: >-
            A route/open with no owner result: the wiring row catalog.git_worktree_compare names no request or
            result schema.
        - key: disabled_reason_codes
          choice: [not_configured, blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. not_configured covers git_available false,
            blocked_state_required covers worktree_selected or compare_target_resolvable false
            (UI_Command_Catalog.md:703), and stale_projection is the 2.0B clause.
      aliases: []
    - command_id: cmd.git.worktree.create
      ucc_units: [UCC-054]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        repo_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity repo_id (always); UCC-230 envelope common optional repo_id restated required"
        worktree_lifecycle_state:
          type: enum
          required: true
          default: none
          values: [reserved, active]
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when mutating; UCC-230 lists cmd.git.worktree.create as mutating (DL-341). Values: two of the reserved lifecycle state names (WorktreeGitImprovement.md:299) spelled as W-075 spells them (WorktreeGitImprovement.md:5304), the two a worktree that does not exist yet can enter"
        path:
          type: path
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row says "Creates a new git worktree at specified path" (UI_Command_Catalog.md:704) but names no
            field. Choice: the caller-specified worktree path, required because the row fixes the location as
            specified. FileSafe owns normalization at run time (DL-333 resolution 11: no literal default for path).
        branch_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity branch_ref (UCC-230 row_groups; ref per identity_typing); W-007 creation verifies existing branches and reuses safe ones (WorktreeGitImprovement.md:1231)"
        base_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            W-007 fixes the semantics ("the configured base branch or explicit ref", WorktreeGitImprovement.md:1231)
            but names no payload field. Choice: absent means the configured base branch; present is the explicit
            ref.
        expected_lease:
          type: object
          required: false
          default: none
          fields:
            lease_id:
              type: id
              required: true
              default: none
              provenance: gap
              gap_note: "the lease the surface observed: the Worktree lease extension's lease_id (WorktreeGitImprovement.md:886; W-082 preserved token, :5682), typed id by the UCC-230 _id rule; canon does not make it an arg"
            holder_identity_ref:
              type: ref
              required: true
              default: none
              provenance: gap
              gap_note: "the holder the surface observed, W-082's holder fence (WorktreeGitImprovement.md:5653) under the shared lease record's name holder_identity_ref (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            generation:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the lease generation the surface observed, W-082's generation fence (WorktreeGitImprovement.md:5653), named and typed as the shared lease record's generation, an integer from 0 (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            epoch:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the lease epoch the surface observed, W-082's epoch fence (WorktreeGitImprovement.md:5653), named and typed as the shared lease record's epoch, an integer from 0 (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            topology_generation:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the TopologyGeneration the lease binds (WorktreeGitImprovement.md:884), W-082's topology generation fence (:5653), spelled and typed as the shared command request envelope's topology_generation (Plans/shared_runtime_command_contracts.schema.json#/$defs/command_request_envelope); canon does not make it an arg"
            source_location_id:
              type: id
              required: true
              default: none
              provenance: gap
              gap_note: "the SourceLocationId the lease binds exactly (WorktreeGitImprovement.md:884), W-082's Source Location fence (:5653), spelled as the shared command request envelope's source_location_id (Plans/shared_runtime_command_contracts.schema.json#/$defs/command_request_envelope) and typed id by the UCC-230 _id rule; canon does not make it an arg"
          provenance: gap
          gap_note: >-
            W-082 names the lease fences (holder, generation, epoch, topology generation and Source Location,
            WorktreeGitImprovement.md:5653) and the Worktree lease extension names lease_id (:886), but canon
            names no arg that carries the values a caller expects, and no typed carrier binds them for a
            worktree command: the shared runtime_resource_lease is the lease record itself and has no topology
            generation or Source Location, and the UICommand envelope carries none of the six. Choice: one
            object holding the six values the dispatching surface observed, each named as canon's lease
            records name it; the object's name and shape are not canon.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeCreateResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, permission_required, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: dirty_worktree, code: blocked_state_required}
        - {owner_state: untracked_files, code: blocked_state_required}
        - {owner_state: protected_branch, code: blocked_state_required}
        - {owner_state: missing_remote, code: not_configured}
        - {owner_state: permission_denied, code: permission_required}
        - {owner_state: operation_in_progress, code: blocked_state_required}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Canon states no command_kind for this row. Creating a worktree is a durable mutation
            (UI_Command_Catalog.md:704), UCC-230 lists it as mutating (DL-341), and W-084 binds child flows to this
            command.
        - key: field:worktree_lifecycle_state
          choice: the lifecycle state the new worktree enters, reserved or active
          gap_note: >-
            Canon requires the field when a command mutates worktree state but does not say, for create, whether it
            is an observed or a target state; a worktree that does not exist yet has no observed state, so on
            create the field is the state the created worktree enters, while on the other seven mutating commands
            it is the state observed at dispatch. Canon gives no create-time state (WorktreeGitImprovement.md has
            none). The values are narrowed to reserved and active, the two states a new worktree can enter:
            blocked_preserved needs a blocked episode, released follows lineage-safe completion, archival or a
            recorded override (UI_Command_Catalog.md:711), and orphaned marks a worktree whose owner is gone, and
            none of these exists before the worktree does.
        - key: field:branch_ref
          choice: absent means the owner derives the branch per W-007
          gap_note: >-
            The overlay names branch_ref as an optional identity of the group, and W-007 implies a branch input
            (verify existing branches, reuse safe ones), but canon does not say what create does when it is absent.
        - key: field:expected_lease
          choice: a create that materializes a reserved lease presents that reservation's lease edition; the owner compares lease_id, holder, generation, epoch, topology generation and Source Location with its current lease record and refuses any mismatch, or an absent expected_lease where its record holds a reservation for the worktree or run the envelope names, with stale_projection, before anything is materialized; a create with no reservation omits it
          gap_note: >-
            W-082 fences every create with holder, generation, epoch, topology generation and Source Location
            (WorktreeGitImprovement.md:5653, :5666; the lease section, :888), and only the current reservation
            generation may invoke cmd.git.worktree.create (:866), after ownership is recorded as the typed lease
            (:865); W-084 sends child flows through this command (:5749). The owner's own lease record supplies
            only the current side of that comparison, and canon names no field for the caller's side.
            Optional, as on cmd.git.worktree.remove, because a create without a reservation (a Manual worktree,
            GitHub_Integration.md:160) has no lease to present.
        - key: disabled_reason_codes
          choice: [not_configured, permission_required, blocked_state_required, stale_projection]
          gap_note: >-
            The GitHub_Integration Worktree Topology disabled states, which cover cmd.git.worktree.create
            (GitHub_Integration.md:2115-2117), map through the UCC-230 owner_state_code_map to
            blocked_state_required (dirty_worktree, untracked_files, protected_branch, operation_in_progress),
            not_configured (missing_remote) and permission_required (permission_denied). The choice is the rest:
            not_configured also covers git_available false, blocked_state_required covers worktree_limit_reached
            (UI_Command_Catalog.md:704), and stale_projection is the 2.0B clause.
      aliases:
        - {command_id: cmd.worktree.provision, kind: compatibility_alias,
           source: "Commands_System.md:4087 (compatibility spelling, not registered; canonical command cmd.git.worktree.create) and the catalog's candidate compatibility and rejection table (UI_Command_Catalog.md:14253, alias intent, no new row); a thread-scoped caller may use only the existing thread wrapper (DRY_Rules.md:2272; Shared_Integration_Runtime.md:352); UCC-230 non_definition_tokens targets it to this command"}
    - command_id: cmd.git.worktree.remove
      ucc_units: [UCC-054, UCC-055]
      command_kind: domain_action
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
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:705) per UCC-230 identity_typing"
        worktree_lifecycle_state:
          type: enum
          required: true
          default: none
          values: [reserved, active, blocked_preserved, released, orphaned]
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when mutating; UCC-230 lists cmd.git.worktree.remove as mutating (DL-341). Values: WorktreeGitImprovement.md:299 spelled as W-075 spells them (:5304)"
        safe_point_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity safe_point_id; safe worktree action commands carry optional safe_point_id (UI_Command_Catalog.md:720)"
        expected_lease:
          type: object
          required: false
          default: none
          fields:
            lease_id:
              type: id
              required: true
              default: none
              provenance: gap
              gap_note: "the lease the surface observed: the Worktree lease extension's lease_id (WorktreeGitImprovement.md:886; W-082 preserved token, :5682), typed id by the UCC-230 _id rule; canon does not make it an arg"
            holder_identity_ref:
              type: ref
              required: true
              default: none
              provenance: gap
              gap_note: "the holder the surface observed, W-082's holder fence (WorktreeGitImprovement.md:5653) under the shared lease record's name holder_identity_ref (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            generation:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the lease generation the surface observed, W-082's generation fence (WorktreeGitImprovement.md:5653), named and typed as the shared lease record's generation, an integer from 0 (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            epoch:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the lease epoch the surface observed, W-082's epoch fence (WorktreeGitImprovement.md:5653), named and typed as the shared lease record's epoch, an integer from 0 (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            topology_generation:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the TopologyGeneration the lease binds (WorktreeGitImprovement.md:884), W-082's topology generation fence (:5653), spelled and typed as the shared command request envelope's topology_generation (Plans/shared_runtime_command_contracts.schema.json#/$defs/command_request_envelope); canon does not make it an arg"
            source_location_id:
              type: id
              required: true
              default: none
              provenance: gap
              gap_note: "the SourceLocationId the lease binds exactly (WorktreeGitImprovement.md:884), W-082's Source Location fence (:5653), spelled as the shared command request envelope's source_location_id (Plans/shared_runtime_command_contracts.schema.json#/$defs/command_request_envelope) and typed id by the UCC-230 _id rule; canon does not make it an arg"
          provenance: gap
          gap_note: >-
            W-082 names the lease fences (holder, generation, epoch, topology generation and Source Location,
            WorktreeGitImprovement.md:5653) and the Worktree lease extension names lease_id (:886), but canon
            names no arg that carries the values a caller expects, and no typed carrier binds them for a
            worktree command: the shared runtime_resource_lease is the lease record itself and has no topology
            generation or Source Location, and the UICommand envelope carries none of the six. Choice: one
            object holding the six values the dispatching surface observed, each named as canon's lease
            records name it; the object's name and shape are not canon.
        expected_owner:
          type: object
          required: false
          default: none
          fields:
            kind:
              type: enum
              required: true
              default: none
              values: [run, lane, package]
              provenance: gap
              gap_note: "the owner class the surface observed; canon's words are the prose 'lane/run/package refs' (UI_Command_Catalog.md:720), so the field and its value spellings are not canon"
            owner_ref:
              type: ref
              required: true
              default: none
              provenance: gap
              gap_note: "the run, lane or package reference the surface observed; no field name in canon"
          provenance: gap
          gap_note: >-
            Safe worktree action commands "carry enough repo_id, worktree_id, optional safe_point_id, lane/run/package
            refs, blocked/recovery lineage, and blocked reason payloads to preserve stale-run and crashed-session
            safety" (UI_Command_Catalog.md:720), but canon names no field for the lane/run/package ref. Choice: the
            run, lane or package owner the dispatching surface observed, a tagged object shaped like
            cmd.git.worktree.reuse's new_owner; absent means the surface observed no run, lane or package owner. The
            owner compares it with its own record before it mutates and refuses a mismatch with stale_projection, so
            a stale view of the owner cannot act. The field names are not canon.
        expected_lineage_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            UI_Command_Catalog.md:720 asks safe worktree actions to carry the blocked/recovery lineage but names no
            field. Choice: a ref to the blocked episode or recovery lineage record the dispatching surface observed;
            absent means it observed none. The owner compares it as it compares expected_owner. The name is not
            canon.
        expected_blocked_reason:
          type: object
          required: false
          default: none
          fields:
            family:
              type: enum
              required: true
              default: none
              values: [approval-gated, policy-blocked, preflight-blocked, auth-blocked, governance-blocked, stale-data-blocked]
              provenance: gap
              gap_note: "the blocked-reason family the surface observed, in W-075's own spelling (WorktreeGitImprovement.md:5306-5307); canon names no field for it"
            reason_ref:
              type: ref
              required: false
              default: none
              provenance: gap
              gap_note: "a ref to the full blocked reason record the surface observed; no field name in canon"
          provenance: gap
          gap_note: >-
            UI_Command_Catalog.md:720 asks safe worktree actions to carry blocked reason payloads but names no field
            or shape. Choice: the blocked reason the dispatching surface observed, as its W-075 blocked-reason family
            plus an optional ref to the full reason record; absent means the surface observed the worktree not
            blocked. The owner compares it as it compares expected_owner. The names are not canon.
        target_worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "GitHub_Integration.md:2117 Worktree Topology Commands destructive confirmation field target_worktree_id (id per the UCC-230 *_id typing); the confirm-surface subject, the same worktree as worktree_id"
        expected_path:
          type: path
          required: true
          default: none
          provenance: gap
          gap_note: "GitHub_Integration.md:2117 names the destructive confirmation field expected_path and makes it required, but states no type. Choice: the vocabulary's path type; FileSafe normalizes it at run time (DL-333 resolution 11)."
        expected_branch:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "GitHub_Integration.md:2117 names the destructive confirmation field expected_branch and makes it required, but states no type or bounds. Choice: a branch-name string of 1..256 characters."
        confirmation_text:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "GitHub_Integration.md:2117 names the destructive confirmation field confirmation_text and makes it required, but states no type or bounds. Choice: a string of 1..256 characters."
        permission_snapshot_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "GitHub_Integration.md:2117 Worktree Topology Commands destructive confirmation field permission_snapshot_id (id per the UCC-230 *_id typing)"
        override_record_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Manual remove is forbidden while the worktree is active or blocked_preserved "unless explicit override
            policy allows it and records the override" (UI_Command_Catalog.md:719; UCC-055 negative_constraints),
            and W-078 requires run-owned or blocked_preserved removal to go through "the recorded override policy"
            with a double confirmation (WorktreeGitImprovement.md:5464-5465). No field names the recorded override.
            Choice: a ref to the recorded override, present only on the override ladder step.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeRemoveResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, permission_required, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: dirty_worktree, code: blocked_state_required}
        - {owner_state: untracked_files, code: blocked_state_required}
        - {owner_state: protected_branch, code: blocked_state_required}
        - {owner_state: missing_remote, code: not_configured}
        - {owner_state: permission_denied, code: permission_required}
        - {owner_state: operation_in_progress, code: blocked_state_required}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Canon states no command_kind for this row. Removal after gates (UI_Command_Catalog.md:705) and the W-078
            escalation ladder are durable mutations, and UCC-230 lists remove as mutating (DL-341).
        - key: field:worktree_lifecycle_state
          choice: the worktree's lifecycle state as observed at dispatch, which the owner compares before it mutates
          gap_note: >-
            Canon requires the field when a command mutates worktree state but does not say whether it is the
            observed or the target state.
        - key: field:expected_lease
          choice: when the surface observed a lease on the worktree it presents that lease edition; the owner compares lease_id, holder, generation, epoch, topology generation and Source Location with its current lease record and refuses any mismatch, or an absent expected_lease where its record holds a lease, with stale_projection, without mutation
          gap_note: >-
            W-082 fences every cleanup with holder, generation, epoch, topology generation and Source Location,
            and a stale one cannot mutate a worktree (WorktreeGitImprovement.md:5653, :5666; the lease section,
            :888); remove is physical cleanup, which follows release (:870, :891). The owner's own lease record
            supplies only the current side of that comparison, and canon names no field for the caller's side.
            Optional, unlike on cmd.git.worktree.release, because a worktree can have no lease at all (the
            Manual owner label, GitHub_Integration.md:160).
        - key: disabled_reason_codes
          choice: [not_configured, permission_required, blocked_state_required, stale_projection]
          gap_note: >-
            The Worktree Topology Commands disabled states dirty_worktree, untracked_files, protected_branch,
            missing_remote, permission_denied and operation_in_progress (GitHub_Integration.md:2117) map through the
            UCC-230 owner_state_code_map to blocked_state_required, not_configured and permission_required (DL-333
            resolution 6). The choice is the rest: the W-077 locked refusal and the row's other preconditions
            (UI_Command_Catalog.md:705) are blocked_state_required, git_available false is not_configured, and
            stale_projection is the 2.0B clause. Canon conflict: W-078 lets a dirty worktree be removed after a
            confirmation that previews the dirty paths (WorktreeGitImprovement.md:5463), while the row's precondition
            worktree_clean (UI_Command_Catalog.md:705) and GI's dirty_worktree disabled state
            (GitHub_Integration.md:2117) block it. The definition takes the
            row and GI side, so a dirty worktree is blocked_state_required; the owner doc has not reconciled them.
      aliases: []
    - command_id: cmd.git.worktree.prune
      ucc_units: [UCC-054, UCC-055]
      command_kind: domain_action
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
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:706) per UCC-230 identity_typing"
        worktree_lifecycle_state:
          type: enum
          required: true
          default: none
          values: [reserved, active, blocked_preserved, released, orphaned]
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when mutating; UCC-230 lists cmd.git.worktree.prune as mutating (DL-341). Values: WorktreeGitImprovement.md:299 spelled as W-075 spells them (:5304)"
        safe_point_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity safe_point_id; safe worktree action commands carry optional safe_point_id (UI_Command_Catalog.md:720)"
        expected_lease:
          type: object
          required: false
          default: none
          fields:
            lease_id:
              type: id
              required: true
              default: none
              provenance: gap
              gap_note: "the lease the surface observed: the Worktree lease extension's lease_id (WorktreeGitImprovement.md:886; W-082 preserved token, :5682), typed id by the UCC-230 _id rule; canon does not make it an arg"
            holder_identity_ref:
              type: ref
              required: true
              default: none
              provenance: gap
              gap_note: "the holder the surface observed, W-082's holder fence (WorktreeGitImprovement.md:5653) under the shared lease record's name holder_identity_ref (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            generation:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the lease generation the surface observed, W-082's generation fence (WorktreeGitImprovement.md:5653), named and typed as the shared lease record's generation, an integer from 0 (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            epoch:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the lease epoch the surface observed, W-082's epoch fence (WorktreeGitImprovement.md:5653), named and typed as the shared lease record's epoch, an integer from 0 (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            topology_generation:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the TopologyGeneration the lease binds (WorktreeGitImprovement.md:884), W-082's topology generation fence (:5653), spelled and typed as the shared command request envelope's topology_generation (Plans/shared_runtime_command_contracts.schema.json#/$defs/command_request_envelope); canon does not make it an arg"
            source_location_id:
              type: id
              required: true
              default: none
              provenance: gap
              gap_note: "the SourceLocationId the lease binds exactly (WorktreeGitImprovement.md:884), W-082's Source Location fence (:5653), spelled as the shared command request envelope's source_location_id (Plans/shared_runtime_command_contracts.schema.json#/$defs/command_request_envelope) and typed id by the UCC-230 _id rule; canon does not make it an arg"
          provenance: gap
          gap_note: >-
            W-082 names the lease fences (holder, generation, epoch, topology generation and Source Location,
            WorktreeGitImprovement.md:5653) and the Worktree lease extension names lease_id (:886), but canon
            names no arg that carries the values a caller expects, and no typed carrier binds them for a
            worktree command: the shared runtime_resource_lease is the lease record itself and has no topology
            generation or Source Location, and the UICommand envelope carries none of the six. Choice: one
            object holding the six values the dispatching surface observed, each named as canon's lease
            records name it; the object's name and shape are not canon.
        expected_owner:
          type: object
          required: false
          default: none
          fields:
            kind:
              type: enum
              required: true
              default: none
              values: [run, lane, package]
              provenance: gap
              gap_note: "the owner class the surface observed; canon's words are the prose 'lane/run/package refs' (UI_Command_Catalog.md:720), so the field and its value spellings are not canon"
            owner_ref:
              type: ref
              required: true
              default: none
              provenance: gap
              gap_note: "the run, lane or package reference the surface observed; no field name in canon"
          provenance: gap
          gap_note: >-
            Safe worktree action commands "carry enough repo_id, worktree_id, optional safe_point_id, lane/run/package
            refs, blocked/recovery lineage, and blocked reason payloads to preserve stale-run and crashed-session
            safety" (UI_Command_Catalog.md:720), but canon names no field for the lane/run/package ref. Choice: the
            run, lane or package owner the dispatching surface observed, a tagged object shaped like
            cmd.git.worktree.reuse's new_owner; absent means the surface observed no run, lane or package owner. The
            owner compares it with its own record before it mutates and refuses a mismatch with stale_projection, so
            a stale view of the owner cannot act. The field names are not canon. The approved
            request may carry the same context; the payload carries what the surface saw when it executes it.
        expected_lineage_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            UI_Command_Catalog.md:720 asks safe worktree actions to carry the blocked/recovery lineage but names no
            field. Choice: a ref to the blocked episode or recovery lineage record the dispatching surface observed;
            absent means it observed none. The owner compares it as it compares expected_owner. The name is not
            canon.
        expected_blocked_reason:
          type: object
          required: false
          default: none
          fields:
            family:
              type: enum
              required: true
              default: none
              values: [approval-gated, policy-blocked, preflight-blocked, auth-blocked, governance-blocked, stale-data-blocked]
              provenance: gap
              gap_note: "the blocked-reason family the surface observed, in W-075's own spelling (WorktreeGitImprovement.md:5306-5307); canon names no field for it"
            reason_ref:
              type: ref
              required: false
              default: none
              provenance: gap
              gap_note: "a ref to the full blocked reason record the surface observed; no field name in canon"
          provenance: gap
          gap_note: >-
            UI_Command_Catalog.md:720 asks safe worktree actions to carry blocked reason payloads but names no field
            or shape. Choice: the blocked reason the dispatching surface observed, as its W-075 blocked-reason family
            plus an optional ref to the full reason record; absent means the surface observed the worktree not
            blocked. The owner compares it as it compares expected_owner. The names are not canon.
        approved_request_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            GI-041 makes the approved request the command's subject ("it requires the approved request as its
            subject"; direct prune execution without an approved request is invalid, GitHub_Integration.md:2500-2504)
            but names no field. Choice: a ref to the approved prune request that cmd.git.worktree.request_prune
            produced: the value of WorktreeRequestPruneResultV1.prune_request_ref once that request is approved.
        target_worktree_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "GI-041 canonical_text destructive confirmation field target_worktree_id (GitHub_Integration.md:2501; id per the UCC-230 *_id typing)"
        expected_path:
          type: path
          required: true
          default: none
          provenance: gap
          gap_note: "GI-041 names the destructive confirmation field expected_path (GitHub_Integration.md:2501) and its acceptance criterion requires all five, but canon states no type. Choice: the vocabulary's path type; FileSafe normalizes it at run time (DL-333 resolution 11)."
        expected_branch:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "GI-041 names the destructive confirmation field expected_branch (GitHub_Integration.md:2501) but states no type or bounds. Choice: a branch-name string of 1..256 characters."
        confirmation_text:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "GI-041 names the destructive confirmation field confirmation_text (GitHub_Integration.md:2501) but states no type or bounds. Choice: a string of 1..256 characters."
        permission_snapshot_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "GI-041 canonical_text destructive confirmation field permission_snapshot_id (GitHub_Integration.md:2501; id per the UCC-230 *_id typing)"
        override_record_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Manual prune is forbidden while the worktree is active or blocked_preserved "unless explicit override
            policy allows it and records the override" (UI_Command_Catalog.md:719; UCC-055 negative_constraints;
            WorktreeGitImprovement.md:299). No field names the recorded override. Choice: a ref to the recorded
            override, present only when the override policy applies, as on cmd.git.worktree.remove.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreePruneResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, permission_required, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: dirty_worktree, code: blocked_state_required}
        - {owner_state: untracked_files, code: blocked_state_required}
        - {owner_state: protected_branch, code: blocked_state_required}
        - {owner_state: missing_remote, code: not_configured}
        - {owner_state: permission_denied, code: permission_required}
        - {owner_state: operation_in_progress, code: blocked_state_required}
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Canon states no command_kind for this row. Prune after gates (UI_Command_Catalog.md:706) is a durable
            mutation, and UCC-230 lists it as mutating (DL-341).
        - key: field:worktree_lifecycle_state
          choice: the worktree's lifecycle state as observed at dispatch, which the owner compares before it mutates
          gap_note: >-
            Canon requires the field when a command mutates worktree state but does not say whether it is the
            observed or the target state.
        - key: field:expected_lease
          choice: when the surface observed a lease on the worktree it presents that lease edition; the owner compares lease_id, holder, generation, epoch, topology generation and Source Location with its current lease record and refuses any mismatch, or an absent expected_lease where its record holds a lease, with stale_projection, without mutation
          gap_note: >-
            W-082 fences every cleanup with holder, generation, epoch, topology generation and Source Location,
            and a stale one cannot mutate a worktree (WorktreeGitImprovement.md:5653, :5666; the lease section,
            :888); prune is physical cleanup, which follows release (:870, :891). The owner's own lease record
            supplies only the current side of that comparison, and canon names no field for the caller's side.
            Optional, unlike on cmd.git.worktree.release, because a worktree can have no lease at all (the
            Manual owner label, GitHub_Integration.md:160).
        - key: disabled_reason_codes
          choice: [not_configured, permission_required, blocked_state_required, stale_projection]
          gap_note: >-
            GI-041's six disabled states (GitHub_Integration.md:2502-2503) map through the UCC-230
            owner_state_code_map to blocked_state_required, not_configured and permission_required (DL-333
            resolution 6). The choice is the rest: the W-077 locked refusal and the row's other preconditions
            (UI_Command_Catalog.md:706) are blocked_state_required, git_available false is not_configured, and
            stale_projection is the 2.0B clause.
      aliases: []
    - command_id: cmd.git.worktree.request_prune
      ucc_units: [UCC-054]
      command_kind: domain_action
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
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:707) per UCC-230 identity_typing"
        safe_point_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity safe_point_id; safe worktree action commands carry optional safe_point_id (UI_Command_Catalog.md:720); GI-041 gates the request form on safe-point awareness (GitHub_Integration.md:2498), and the cmd.git.worktree.prune that executes the request carries the same optional field"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeRequestPruneResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, permission_required, blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Canon states no command_kind for this row. It is its own command since DL-333 resolution 5, the
            approval-request phase of the two-phase prune flow (GI-041): it writes a durable prune request without
            mutating the worktree, and UCC-230 lists it as a domain_action under not_mutating (DL-341).
        - key: omitted:worktree_lifecycle_state
          choice: omitted
          gap_note: >-
            The overlay requires worktree_lifecycle_state only "when mutating worktree state"
            (UI_Command_Catalog.md:8851); the row says the command acts "without mutating it" (:707), GI-041 says
            "request_prune never mutates worktree state", and UCC-230 lists it under not_mutating (DL-341).
        - key: disabled_reason_codes
          choice: [not_configured, permission_required, blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. GI-041 gates the request form on ownership badges, admin
            override policy, prune protection defaults and safe-point awareness (GitHub_Integration.md:2497-2498);
            those map to permission_required and blocked_state_required. not_configured covers git_available false
            (UI_Command_Catalog.md:707), and stale_projection is the 2.0B clause.
      aliases: []
    - command_id: cmd.git.worktree.reuse
      ucc_units: [UCC-054, UCC-055]
      command_kind: domain_action
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
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:708) per UCC-230 identity_typing"
        worktree_lifecycle_state:
          type: enum
          required: true
          default: none
          values: [reserved, active, blocked_preserved, released, orphaned]
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when mutating; UCC-230 lists cmd.git.worktree.reuse as mutating (DL-341). Values: WorktreeGitImprovement.md:299 spelled as W-075 spells them (:5304)"
        safe_point_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity safe_point_id; safe worktree action commands carry optional safe_point_id (UI_Command_Catalog.md:720)"
        expected_lease:
          type: object
          required: false
          default: none
          fields:
            lease_id:
              type: id
              required: true
              default: none
              provenance: gap
              gap_note: "the lease the surface observed: the Worktree lease extension's lease_id (WorktreeGitImprovement.md:886; W-082 preserved token, :5682), typed id by the UCC-230 _id rule; canon does not make it an arg"
            holder_identity_ref:
              type: ref
              required: true
              default: none
              provenance: gap
              gap_note: "the holder the surface observed, W-082's holder fence (WorktreeGitImprovement.md:5653) under the shared lease record's name holder_identity_ref (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            generation:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the lease generation the surface observed, W-082's generation fence (WorktreeGitImprovement.md:5653), named and typed as the shared lease record's generation, an integer from 0 (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            epoch:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the lease epoch the surface observed, W-082's epoch fence (WorktreeGitImprovement.md:5653), named and typed as the shared lease record's epoch, an integer from 0 (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            topology_generation:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the TopologyGeneration the lease binds (WorktreeGitImprovement.md:884), W-082's topology generation fence (:5653), spelled and typed as the shared command request envelope's topology_generation (Plans/shared_runtime_command_contracts.schema.json#/$defs/command_request_envelope); canon does not make it an arg"
            source_location_id:
              type: id
              required: true
              default: none
              provenance: gap
              gap_note: "the SourceLocationId the lease binds exactly (WorktreeGitImprovement.md:884), W-082's Source Location fence (:5653), spelled as the shared command request envelope's source_location_id (Plans/shared_runtime_command_contracts.schema.json#/$defs/command_request_envelope) and typed id by the UCC-230 _id rule; canon does not make it an arg"
          provenance: gap
          gap_note: >-
            W-082 names the lease fences (holder, generation, epoch, topology generation and Source Location,
            WorktreeGitImprovement.md:5653) and the Worktree lease extension names lease_id (:886), but canon
            names no arg that carries the values a caller expects, and no typed carrier binds them for a
            worktree command: the shared runtime_resource_lease is the lease record itself and has no topology
            generation or Source Location, and the UICommand envelope carries none of the six. Choice: one
            object holding the six values the dispatching surface observed, each named as canon's lease
            records name it; the object's name and shape are not canon.
        expected_owner:
          type: object
          required: false
          default: none
          fields:
            kind:
              type: enum
              required: true
              default: none
              values: [run, lane, package]
              provenance: gap
              gap_note: "the owner class the surface observed; canon's words are the prose 'lane/run/package refs' (UI_Command_Catalog.md:720), so the field and its value spellings are not canon"
            owner_ref:
              type: ref
              required: true
              default: none
              provenance: gap
              gap_note: "the run, lane or package reference the surface observed; no field name in canon"
          provenance: gap
          gap_note: >-
            Safe worktree action commands "carry enough repo_id, worktree_id, optional safe_point_id, lane/run/package
            refs, blocked/recovery lineage, and blocked reason payloads to preserve stale-run and crashed-session
            safety" (UI_Command_Catalog.md:720), but canon names no field for the lane/run/package ref. Choice: the
            run, lane or package owner the dispatching surface observed, a tagged object shaped like
            cmd.git.worktree.reuse's new_owner; absent means the surface observed no run, lane or package owner. The
            owner compares it with its own record before it mutates and refuses a mismatch with stale_projection, so
            a stale view of the owner cannot act. The field names are not canon. On reuse it is
            the current owner being replaced; new_owner is the incoming one.
        expected_lineage_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            UI_Command_Catalog.md:720 asks safe worktree actions to carry the blocked/recovery lineage but names no
            field. Choice: a ref to the blocked episode or recovery lineage record the dispatching surface observed;
            absent means it observed none. The owner compares it as it compares expected_owner. The name is not
            canon.
        expected_blocked_reason:
          type: object
          required: false
          default: none
          fields:
            family:
              type: enum
              required: true
              default: none
              values: [approval-gated, policy-blocked, preflight-blocked, auth-blocked, governance-blocked, stale-data-blocked]
              provenance: gap
              gap_note: "the blocked-reason family the surface observed, in W-075's own spelling (WorktreeGitImprovement.md:5306-5307); canon names no field for it"
            reason_ref:
              type: ref
              required: false
              default: none
              provenance: gap
              gap_note: "a ref to the full blocked reason record the surface observed; no field name in canon"
          provenance: gap
          gap_note: >-
            UI_Command_Catalog.md:720 asks safe worktree actions to carry blocked reason payloads but names no field
            or shape. Choice: the blocked reason the dispatching surface observed, as its W-075 blocked-reason family
            plus an optional ref to the full reason record; absent means the surface observed the worktree not
            blocked. The owner compares it as it compares expected_owner. The names are not canon.
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
              gap_note: "the owner class of the union; canon's words are the prose 'run/lane/package owner' (UI_Command_Catalog.md:708), so the field and its value spellings are not canon"
            owner_ref:
              type: ref
              required: true
              default: none
              provenance: gap
              gap_note: "the run, lane or package reference; no field name in canon"
          provenance: gap
          gap_note: >-
            The new owner is a run | lane | package union (UI_Command_Catalog.md:708) with no field or
            discriminator. Choice: a tagged object, kind plus owner_ref. The 2.5C rule that safe actions carry
            "lane/run/package refs" (UI_Command_Catalog.md:720) names the same concepts without field names.
        override_record_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Manual reuse is forbidden while the worktree is active or blocked_preserved "unless explicit override
            policy allows it and records the override" (UI_Command_Catalog.md:719; UCC-055 negative_constraints),
            and "Manual /prune/reuse remains blocked while ownership is active or blocked_preserved unless override
            policy records the ownership change" (WorktreeGitImprovement.md:299). No field names the recorded
            override. Choice: a ref to the recorded override, present only when the override policy applies, as on
            cmd.git.worktree.remove.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeReuseResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Canon states no command_kind for this row. Rebinding a clean worktree to a new owner after gates
            (UI_Command_Catalog.md:708) is a durable ownership mutation, and UCC-230 lists it as mutating (DL-341).
        - key: field:worktree_lifecycle_state
          choice: the worktree's lifecycle state as observed at dispatch, which the owner compares before it mutates
          gap_note: >-
            Canon requires the field when a command mutates worktree state but does not say whether it is the
            observed or the target state.
        - key: field:expected_lease
          choice: when the surface observed a lease on the worktree it presents that lease edition; the owner compares lease_id, holder, generation, epoch, topology generation and Source Location with its current lease record and refuses any mismatch, or an absent expected_lease where its record holds a lease, with stale_projection, without mutation
          gap_note: >-
            W-082 fences every attach with holder, generation, epoch, topology generation and Source Location,
            and a stale one cannot mutate a worktree (WorktreeGitImprovement.md:5653, :5666; the lease section,
            :888); reuse rebinds the worktree to a new owner, a scope change that needs an explicit ownership
            transfer or a new lease (:889). The owner's own lease record supplies only the current side of that
            comparison, and canon names no field for the caller's side.
            Optional, unlike on cmd.git.worktree.release, because a clean worktree can have no lease at all (the
            Manual owner label, GitHub_Integration.md:160).
        - key: disabled_reason_codes
          choice: [not_configured, blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. not_configured covers git_available false;
            blocked_state_required covers ownership_resolvable, worktree_clean or lineage_gate_passed false
            (UI_Command_Catalog.md:708) and the W-077 locked refusal; stale_projection is the 2.0B clause.
      aliases: []
    - command_id: cmd.git.worktree.recover
      ucc_units: [UCC-054, UCC-055]
      command_kind: domain_action
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
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:709) per UCC-230 identity_typing"
        worktree_lifecycle_state:
          type: enum
          required: true
          default: none
          values: [reserved, active, blocked_preserved, released, orphaned]
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when mutating; UCC-230 lists cmd.git.worktree.recover as mutating (DL-341). Values: WorktreeGitImprovement.md:299 spelled as W-075 spells them (:5304)"
        safe_point_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity safe_point_id; safe worktree action commands carry optional safe_point_id (UI_Command_Catalog.md:720); safe-point restore is a named lifecycle trigger (WorktreeGitImprovement.md:299)"
        expected_lease:
          type: object
          required: false
          default: none
          fields:
            lease_id:
              type: id
              required: true
              default: none
              provenance: gap
              gap_note: "the lease the surface observed: the Worktree lease extension's lease_id (WorktreeGitImprovement.md:886; W-082 preserved token, :5682), typed id by the UCC-230 _id rule; canon does not make it an arg"
            holder_identity_ref:
              type: ref
              required: true
              default: none
              provenance: gap
              gap_note: "the holder the surface observed, W-082's holder fence (WorktreeGitImprovement.md:5653) under the shared lease record's name holder_identity_ref (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            generation:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the lease generation the surface observed, W-082's generation fence (WorktreeGitImprovement.md:5653), named and typed as the shared lease record's generation, an integer from 0 (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            epoch:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the lease epoch the surface observed, W-082's epoch fence (WorktreeGitImprovement.md:5653), named and typed as the shared lease record's epoch, an integer from 0 (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            topology_generation:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the TopologyGeneration the lease binds (WorktreeGitImprovement.md:884), W-082's topology generation fence (:5653), spelled and typed as the shared command request envelope's topology_generation (Plans/shared_runtime_command_contracts.schema.json#/$defs/command_request_envelope); canon does not make it an arg"
            source_location_id:
              type: id
              required: true
              default: none
              provenance: gap
              gap_note: "the SourceLocationId the lease binds exactly (WorktreeGitImprovement.md:884), W-082's Source Location fence (:5653), spelled as the shared command request envelope's source_location_id (Plans/shared_runtime_command_contracts.schema.json#/$defs/command_request_envelope) and typed id by the UCC-230 _id rule; canon does not make it an arg"
          provenance: gap
          gap_note: >-
            W-082 names the lease fences (holder, generation, epoch, topology generation and Source Location,
            WorktreeGitImprovement.md:5653) and the Worktree lease extension names lease_id (:886), but canon
            names no arg that carries the values a caller expects, and no typed carrier binds them for a
            worktree command: the shared runtime_resource_lease is the lease record itself and has no topology
            generation or Source Location, and the UICommand envelope carries none of the six. Choice: one
            object holding the six values the dispatching surface observed, each named as canon's lease
            records name it; the object's name and shape are not canon.
        expected_owner:
          type: object
          required: false
          default: none
          fields:
            kind:
              type: enum
              required: true
              default: none
              values: [run, lane, package]
              provenance: gap
              gap_note: "the owner class the surface observed; canon's words are the prose 'lane/run/package refs' (UI_Command_Catalog.md:720), so the field and its value spellings are not canon"
            owner_ref:
              type: ref
              required: true
              default: none
              provenance: gap
              gap_note: "the run, lane or package reference the surface observed; no field name in canon"
          provenance: gap
          gap_note: >-
            Safe worktree action commands "carry enough repo_id, worktree_id, optional safe_point_id, lane/run/package
            refs, blocked/recovery lineage, and blocked reason payloads to preserve stale-run and crashed-session
            safety" (UI_Command_Catalog.md:720), but canon names no field for the lane/run/package ref. Choice: the
            run, lane or package owner the dispatching surface observed, a tagged object shaped like
            cmd.git.worktree.reuse's new_owner; absent means the surface observed no run, lane or package owner. The
            owner compares it with its own record before it mutates and refuses a mismatch with stale_projection, so
            a stale view of the owner cannot act. The field names are not canon. Recover
            reads the stored lineage itself (UI_Command_Catalog.md:709), and ownership may resolve to unknown
            ownership; these fields carry what the surface saw, so the owner can tell a view older than its record.
        expected_lineage_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            UI_Command_Catalog.md:720 asks safe worktree actions to carry the blocked/recovery lineage but names no
            field. Choice: a ref to the blocked episode or recovery lineage record the dispatching surface observed;
            absent means it observed none. The owner compares it as it compares expected_owner. The name is not
            canon.
        expected_blocked_reason:
          type: object
          required: false
          default: none
          fields:
            family:
              type: enum
              required: true
              default: none
              values: [approval-gated, policy-blocked, preflight-blocked, auth-blocked, governance-blocked, stale-data-blocked]
              provenance: gap
              gap_note: "the blocked-reason family the surface observed, in W-075's own spelling (WorktreeGitImprovement.md:5306-5307); canon names no field for it"
            reason_ref:
              type: ref
              required: false
              default: none
              provenance: gap
              gap_note: "a ref to the full blocked reason record the surface observed; no field name in canon"
          provenance: gap
          gap_note: >-
            UI_Command_Catalog.md:720 asks safe worktree actions to carry blocked reason payloads but names no field
            or shape. Choice: the blocked reason the dispatching surface observed, as its W-075 blocked-reason family
            plus an optional ref to the full reason record; absent means the surface observed the worktree not
            blocked. The owner compares it as it compares expected_owner. The names are not canon.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeRecoverResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Canon states no command_kind for this row. Reopening or rebinding from stored lineage, with the unknown
            ownership marking (UI_Command_Catalog.md:709), is a durable recovery mutation, and UCC-230 lists it as
            mutating (DL-341).
        - key: field:worktree_lifecycle_state
          choice: the worktree's lifecycle state as observed at dispatch, which the owner compares before it mutates
          gap_note: >-
            Canon requires the field when a command mutates worktree state but does not say whether it is the
            observed or the target state.
        - key: field:expected_lease
          choice: when the surface observed a lease on the worktree it presents that lease edition; the owner compares lease_id, holder, generation, epoch, topology generation and Source Location with its current lease record and refuses any mismatch, or an absent expected_lease where its record holds a lease, with stale_projection, without mutation
          gap_note: >-
            W-082 fences reconciliation as it fences release: a stale holder, generation, epoch, topology
            generation or Source Location cannot reconcile a replacement lease or mutate a worktree
            (WorktreeGitImprovement.md:5653, :5666; the lease section, :888, :892). The owner's own lease record
            supplies only the current side of that comparison, and canon names no field for the caller's side.
            Optional, unlike on cmd.git.worktree.release, because recover runs where ownership may not resolve
            after restart (UI_Command_Catalog.md:709), so the surface may have observed no lease.
        - key: disabled_reason_codes
          choice: [not_configured, blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. not_configured covers git_available false,
            blocked_state_required covers worktree_selected false (UI_Command_Catalog.md:709), and stale_projection
            is the 2.0B clause.
      aliases: []
    - command_id: cmd.git.worktree.focus_lineage
      ucc_units: [UCC-054]
      command_kind: navigation_wrapper
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
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:710) per UCC-230 identity_typing"
        lineage_target:
          type: enum
          required: false
          default: none
          values: [owner_run, branch_lineage, receipt, orphaned_tombstone]
          provenance: gap
          gap_note: >-
            Which lineage context to focus ("owner run, branch lineage, receipt, or /orphaned tombstone context",
            UI_Command_Catalog.md:710) has no field, and canon spells the members in prose only, so these value
            spellings are not canon. Choice: an enum, absent when the command focuses the row's default lineage
            context; orphaned_tombstone stands for the "/orphaned tombstone" prose. A typed ref per member is the
            alternative.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_route, invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: navigation_wrapper
          gap_note: >-
            Canon states no command_kind for this row. It focuses a lineage context without mutating it
            (UI_Command_Catalog.md:710), a route/open.
        - key: response_kind
          choice: local_projection
          gap_note: >-
            A route/open with no owner result: the wiring row catalog.git_worktree_focus_lineage names no request or
            result schema.
        - key: disabled_reason_codes
          choice: [not_configured, blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. not_configured covers git_available false,
            blocked_state_required covers worktree_selected false (UI_Command_Catalog.md:710), and stale_projection
            is the 2.0B clause.
      aliases: []
    - command_id: cmd.git.worktree.release
      ucc_units: [UCC-054]
      command_kind: domain_action
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
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:711) per UCC-230 identity_typing"
        worktree_lifecycle_state:
          type: enum
          required: true
          default: none
          values: [reserved, active, blocked_preserved, released, orphaned]
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when mutating; UCC-230 lists cmd.git.worktree.release as mutating (DL-341). Values: WorktreeGitImprovement.md:299 spelled as W-075 spells them (:5304)"
        safe_point_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-054..UCC-055 optional identity safe_point_id; safe worktree action commands carry optional safe_point_id (UI_Command_Catalog.md:720); safe-point-preserved worktrees stay reserved until an explicit release (WorktreeGitImprovement.md:295)"
        expected_lease:
          type: object
          required: true
          default: none
          fields:
            lease_id:
              type: id
              required: true
              default: none
              provenance: gap
              gap_note: "the lease the surface observed: the Worktree lease extension's lease_id (WorktreeGitImprovement.md:886; W-082 preserved token, :5682), typed id by the UCC-230 _id rule; canon does not make it an arg"
            holder_identity_ref:
              type: ref
              required: true
              default: none
              provenance: gap
              gap_note: "the holder the surface observed, W-082's holder fence (WorktreeGitImprovement.md:5653) under the shared lease record's name holder_identity_ref (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            generation:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the lease generation the surface observed, W-082's generation fence (WorktreeGitImprovement.md:5653), named and typed as the shared lease record's generation, an integer from 0 (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            epoch:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the lease epoch the surface observed, W-082's epoch fence (WorktreeGitImprovement.md:5653), named and typed as the shared lease record's epoch, an integer from 0 (Plans/shared_runtime_contracts.schema.json#/$defs/runtime_resource_lease); canon does not make it an arg"
            topology_generation:
              type: integer
              required: true
              default: none
              constraints: {minimum: 0}
              provenance: gap
              gap_note: "the TopologyGeneration the lease binds (WorktreeGitImprovement.md:884), W-082's topology generation fence (:5653), spelled and typed as the shared command request envelope's topology_generation (Plans/shared_runtime_command_contracts.schema.json#/$defs/command_request_envelope); canon does not make it an arg"
            source_location_id:
              type: id
              required: true
              default: none
              provenance: gap
              gap_note: "the SourceLocationId the lease binds exactly (WorktreeGitImprovement.md:884), W-082's Source Location fence (:5653), spelled as the shared command request envelope's source_location_id (Plans/shared_runtime_command_contracts.schema.json#/$defs/command_request_envelope) and typed id by the UCC-230 _id rule; canon does not make it an arg"
          provenance: gap
          gap_note: >-
            W-082 names the lease fences (holder, generation, epoch, topology generation and Source Location,
            WorktreeGitImprovement.md:5653) and the Worktree lease extension names lease_id (:886), but canon
            names no arg that carries the values a caller expects, and no typed carrier binds them for a
            worktree command: the shared runtime_resource_lease is the lease record itself and has no topology
            generation or Source Location, and the UICommand envelope carries none of the six. Choice: one
            object holding the six values the dispatching surface observed, each named as canon's lease
            records name it; the object's name and shape are not canon.
        expected_owner:
          type: object
          required: false
          default: none
          fields:
            kind:
              type: enum
              required: true
              default: none
              values: [run, lane, package]
              provenance: gap
              gap_note: "the owner class the surface observed; canon's words are the prose 'lane/run/package refs' (UI_Command_Catalog.md:720), so the field and its value spellings are not canon"
            owner_ref:
              type: ref
              required: true
              default: none
              provenance: gap
              gap_note: "the run, lane or package reference the surface observed; no field name in canon"
          provenance: gap
          gap_note: >-
            Safe worktree action commands "carry enough repo_id, worktree_id, optional safe_point_id, lane/run/package
            refs, blocked/recovery lineage, and blocked reason payloads to preserve stale-run and crashed-session
            safety" (UI_Command_Catalog.md:720), but canon names no field for the lane/run/package ref. Choice: the
            run, lane or package owner the dispatching surface observed, a tagged object shaped like
            cmd.git.worktree.reuse's new_owner; absent means the surface observed no run, lane or package owner. The
            owner compares it with its own record before it mutates and refuses a mismatch with stale_projection, so
            a stale view of the owner cannot act. The field names are not canon. The W-082
            lease fences travel in expected_lease; this field adds the run, lane or package owner the surface
            saw.
        expected_lineage_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            UI_Command_Catalog.md:720 asks safe worktree actions to carry the blocked/recovery lineage but names no
            field. Choice: a ref to the blocked episode or recovery lineage record the dispatching surface observed;
            absent means it observed none. The owner compares it as it compares expected_owner. The name is not
            canon.
        expected_blocked_reason:
          type: object
          required: false
          default: none
          fields:
            family:
              type: enum
              required: true
              default: none
              values: [approval-gated, policy-blocked, preflight-blocked, auth-blocked, governance-blocked, stale-data-blocked]
              provenance: gap
              gap_note: "the blocked-reason family the surface observed, in W-075's own spelling (WorktreeGitImprovement.md:5306-5307); canon names no field for it"
            reason_ref:
              type: ref
              required: false
              default: none
              provenance: gap
              gap_note: "a ref to the full blocked reason record the surface observed; no field name in canon"
          provenance: gap
          gap_note: >-
            UI_Command_Catalog.md:720 asks safe worktree actions to carry blocked reason payloads but names no field
            or shape. Choice: the blocked reason the dispatching surface observed, as its W-075 blocked-reason family
            plus an optional ref to the full reason record; absent means the surface observed the worktree not
            blocked. The owner compares it as it compares expected_owner. The names are not canon.
        override_record_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row releases ownership after "lineage-safe completion, archival, or an explicit recorded override"
            (UI_Command_Catalog.md:711), but no field names the recorded override. Choice: a ref to the recorded
            override, present only on the explicit-override path.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeReleaseResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, blocked_state_required, stale_projection]
      judgments:
        - key: command_kind
          choice: domain_action
          gap_note: >-
            Canon states no command_kind for this row. Releasing runtime ownership changes durable ownership
            eligibility (UI_Command_Catalog.md:711; W-082 keeps release distinct from physical cleanup), and UCC-230
            lists it as mutating (DL-341).
        - key: field:worktree_lifecycle_state
          choice: the worktree's lifecycle state as observed at dispatch, which the owner compares before it mutates
          gap_note: >-
            Canon requires the field when a command mutates worktree state but does not say whether it is the
            observed or the target state.
        - key: disabled_reason_codes
          choice: [not_configured, blocked_state_required, stale_projection]
          gap_note: >-
            Canon names no disabled set for this row. not_configured covers git_available false,
            blocked_state_required covers worktree_selected or ownership_resolvable false (UI_Command_Catalog.md:711),
            and stale_projection is the 2.0B clause.
        - key: field:expected_lease
          choice: the caller presents the lease edition it observed; the owner compares lease_id, holder, generation, epoch, topology generation and Source Location with its current lease record and refuses any mismatch with stale_projection, without mutation
          gap_note: >-
            W-082 fences every release with holder, generation, epoch, topology generation and Source Location,
            and a stale one cannot release (WorktreeGitImprovement.md:5653, :5666); the lease section makes
            release compare all applicable fences and generation-checked (:888, :891). The owner's own lease
            record supplies only the current side of that comparison: after a same-holder renewal advances the
            generation (:889), a release prepared for the earlier generation would otherwise carry the same args
            as one prepared for the current one. Canon names no field for the caller's side, and no existing
            typed carrier binds it.
            Required here, because release releases runtime ownership (UI_Command_Catalog.md:711), and runtime
            ownership is recorded as the typed lease before anything is created (WorktreeGitImprovement.md:865;
            W-082, :5653), so a worktree with runtime ownership to release has a lease the surface observed. A
            worktree with no lease (the Manual owner label, GitHub_Integration.md:160) has no runtime ownership
            to release; canon does not say whether release is offered on one.
      aliases:
        - {command_id: cmd.worktree.release, kind: compatibility_alias,
           source: "Commands_System.md:4088 (compatibility spelling, not registered; canonical command cmd.git.worktree.release) and the catalog's candidate compatibility and rejection table (UI_Command_Catalog.md:14253, alias intent, no new row); DRY_Rules.md:2273 and Shared_Integration_Runtime.md:353 normalize it to this command; UCC-230 non_definition_tokens targets it to this command"}
    - command_id: cmd.git.worktree.lock
      ucc_units: [UCC-054]
      command_kind: domain_action
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
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_selected (UI_Command_Catalog.md:712; Cozy Shelves Worktree and GitHub PR row cmd.git.worktree.lock, :12628) per UCC-230 identity_typing"
        worktree_lifecycle_state:
          type: enum
          required: true
          default: none
          values: [reserved, active, blocked_preserved, released, orphaned]
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when mutating; UCC-230 lists cmd.git.worktree.lock as mutating (DL-341). Values: WorktreeGitImprovement.md:299 spelled as W-075 spells them (:5304)"
        reason:
          type: string
          required: true
          default: none
          constraints: {min_length: 1}
          provenance: canon
          source: "W-077 canonical_text: 'Lock requires a reason string, stored and displayed with the lock' (WorktreeGitImprovement.md:5414); a required reason is non-empty"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeLockResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      judgments:
        - key: field:worktree_lifecycle_state
          choice: the worktree's lifecycle state as observed at dispatch, which the owner compares before it mutates
          gap_note: >-
            Canon requires the field when a command mutates worktree state but does not say whether it is the
            observed or the target state.
        - key: omitted:lock_provenance
          choice: omitted
          gap_note: >-
            W-077 says "Every lock records provenance as user or run-owned" (WorktreeGitImprovement.md:5415) but names
            no field. This command is the user's lock action; run-owned locks are the system's auto-lock while a run,
            lane or package owns the worktree. So the owner records user provenance from the envelope actor_ref, and
            the payload carries no provenance field.
        - key: omitted:expected_lease
          choice: omitted
          gap_note: >-
            W-082's lease fences guard create, attach, renew, result capture, merge, release and cleanup
            (WorktreeGitImprovement.md:5652-5654; the lease section, :888); a lock is not among them, so canon does not
            require the caller's expected lease edition here. W-082's acceptance criterion bars a stale lease
            holder from mutating a worktree (:5666); a user lock is not made under a lease, so it does not reach
            this command. A run-owned lock is the system's auto-lock while
            a run, lane or package owns the worktree (W-077, :5415), not this user action.
      aliases: []
    - command_id: cmd.git.worktree.unlock
      ucc_units: [UCC-054]
      command_kind: domain_action
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
          source: "overlay UCC-054..UCC-055 optional identity worktree_id; made required by the row precondition worktree_locked (UI_Command_Catalog.md:713; Cozy Shelves Worktree and GitHub PR row cmd.git.worktree.unlock, :12629): the locked worktree is the subject, per UCC-230 identity_typing"
        worktree_lifecycle_state:
          type: enum
          required: true
          default: none
          values: [reserved, active, blocked_preserved, released, orphaned]
          provenance: canon
          source: "overlay UCC-054..UCC-055 required identity worktree_lifecycle_state when mutating; UCC-230 lists cmd.git.worktree.unlock as mutating (DL-341). Values: WorktreeGitImprovement.md:299 spelled as W-075 spells them (:5304)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:WorktreeUnlockResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection, permission_required]
      judgments:
        - key: field:worktree_lifecycle_state
          choice: the worktree's lifecycle state as observed at dispatch, which the owner compares before it mutates
          gap_note: >-
            Canon requires the field when a command mutates worktree state but does not say whether it is the
            observed or the target state.
        - key: error_codes
          choice: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
          gap_note: >-
            The narrowing rule adds blocked_state_required only when the disabled reasons include it, and the
            row's disabled reasons are stale_projection and permission_required (Cozy Shelves row
            cmd.git.worktree.unlock, UI_Command_Catalog.md:12629). W-077 says unlock of a run-owned lock while the
            owner is live "is refused with a blocked explanation naming the owner" (WorktreeGitImprovement.md:5418-5419);
            that refusal happens at dispatch, so blocked_state_required is added for it to travel in.
        - key: omitted:expected_lease
          choice: omitted
          gap_note: >-
            W-082's lease fences guard create, attach, renew, result capture, merge, release and cleanup
            (WorktreeGitImprovement.md:5652-5654; the lease section, :888); an unlock is not among them, so canon does not
            require the caller's expected lease edition here. W-082's acceptance criterion bars a stale lease
            holder from mutating a worktree (:5666); a user unlock is not made under a lease, so it does not
            reach this command. Unlocking a run-owned lock while its owner is live
            is refused from the owner's own lock record (W-077, :5418-5419), not from a caller-supplied fence.
      aliases: []
  results:
    WorktreeSelectResultV1:
      fields:
        worktree_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the worktree now selected"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt; the wiring row requires a receipt effect (catalog.git_worktree_select, cmd.git.worktree.select.dispatch_receipt)"}
    WorktreeCreateResultV1:
      fields:
        worktree_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the created worktree"}
        worktree_path: {type: path, required: true, default: none, provenance: gap, gap_note: "the worktree path as materialized; named after the SCM status payload field worktree_path (WorktreeGitImprovement.md:297), which states no type"}
        branch_name: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: "the branch the worktree was created on; named after the SCM status payload field branch_name (WorktreeGitImprovement.md:297), which states no type or bounds"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_create)"}
    WorktreeRemoveResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_remove)"}
    WorktreePruneResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_prune)"}
    WorktreeRequestPruneResultV1:
      fields:
        prune_request_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "the produced prune request, the subject cmd.git.worktree.prune executes once approved, where it is the value of approved_request_ref (GI-041, GitHub_Integration.md:2499-2500)"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_request_prune)"}
    WorktreeReuseResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_reuse)"}
    WorktreeRecoverResultV1:
      fields:
        worktree_id: {type: id, required: true, default: none, provenance: gap, gap_note: "the recovered or rebound worktree; ownership may resolve to the unknown ownership marking (UI_Command_Catalog.md:709)"}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_recover)"}
    WorktreeReleaseResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_release)"}
    WorktreeLockResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_lock)"}
    WorktreeMergeResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-ID5d decided by the owner: required custody-preserving operation receipt identifying the verified outcome, approved result and exact target. Failure preserves W-081 result custody, never a success-shaped receipt.'}
    WorktreeRepairResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: canon, source: 'Plans/Decision_Log.md#DL-471, Q-ID7b decided by the owner: operation receipt on an admitted successful repair only; handler_unavailable is a UICommandResponse error with no fabricated owner result.'}
    WorktreeUnlockResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "dispatch receipt (catalog.git_worktree_unlock)"}
```
