# Jujutsu continuation 3 — correction landing (2026-09-16)

Four adjudicated corrections from continuation 3 of the Jujutsu research, compiled into live Plans canon on branch
`plans/jj-corrections-20260916` and stopped for independent review before landing on main. F110, the
new-repository object-format picker, is an unapproved optional capability and is **not** landed.

Ledger: `Plans/ledgers/v2/pldg-20260916-001-jujutsu-continuation-corrections/`, registered in
`Plans/ledgers/v2/ledger_registry.json`.

- [Currentness re-check before editing](currentness-before-edit.json)
- [Evidence receipts with SHA-256](evidence-receipts.json)
- [Derived-file scope](derived-scope.json)
- [Static verification](verification.json)
- [Ledger validation result](ledger-final.json)

## What each correction repairs

### F106 — restore readiness consistency

**Existing promise.** `Plans/Jujutsu_Integration.md#JJI-008` already requires workspace and captured-file
relationship truth before activation, already blocks dual-writer or identity collision, and already forbids
promoting a blocked or conflicted result to successful Backup activation.

**Contradiction.** The readiness conditional in `backup_jj_restore_verification_receipt` constrained
`historical_operation_result`, `object_closure_result`, `conflict_refs`, `collision_refs` and
`activation_config_disposition`, but left `workspace_map_result`, `colocation_activation_disposition` and
`working_copy_relation` free. A receipt could report `ready_for_owner_activation` and `collision_blocked` at the
same time.

**Change.** A conditional scoped to `outcome=ready_for_owner_activation` restricts those three fields to their
non-blocking values. JJI-008 gains the matching acceptance criterion. One positive and three negative fixtures.
`verified_read_only` is untouched and `owner_rebind_non_colocated_required` stays a valid readiness path.

### F107 — graph page consistency and adjacency bounds

**Existing promise.** `Plans/Source_Control_System.md#SCS-017` already requires bounded pagination and hydration,
stable node and edge references, identity preservation, and visibly stale or partial pages.

**Contradiction.** `source_graph_projection` enforced independent per-field caps only. It accepted a
`returned_count` that disagreed with the node array, a page larger than its own `page_size`, a `current` page
declaring `has_more` with a null `next_cursor_ref`, two nodes sharing a `node_ref` with different `revision_ref`
values, and a node carrying 1001 `parent_refs` behind `unbounded_hydration=false`.

**Change.** Schema-enforced: `parent_refs` is bounded at 600, the adjacency budget the contract already applies to
`edges`; and a `current` page declaring `has_more` must carry a non-null `next_cursor_ref`. One negative fixture.
SCS-017 gains four acceptance criteria covering all four obligations.

**Partially enforced.** The count arithmetic and in-page `node_ref` uniqueness are relational rules JSON Schema
cannot express. This repository evaluates such rules in `contract_semantic_failures` inside
`scripts/pm-new-contracts-verify.py`, and `scripts/` is outside this thread's `CLAUDE.md` edit scope, so those two
land as owner obligations with no validator surface. SCS-017 `validation_surfaces` says so explicitly. This is the
one open question for Jared.

### F108 — clone identity before native initialization

**Existing promise.** `Plans/Jujutsu_Integration.md#JJI-002` defines revision and snapshot fields as exact native
state and forbids synthetic workspace identity; section 3.1 already admits a dedicated clone to a destination
Source Location, with cancellation settlement.

**Contradiction.** `command_request.expected_revision`, `currentness.snapshot_id`,
`currentness.expected_operation_id` and `command_result.before_revision` unconditionally required native values,
so the one phase in which the destination does not exist natively yet could only be expressed by fabricating four
native identities. The pinned upstream clone admits an absent or empty destination and calls `init_workspace` only
after destination admission.

**Change.** A `native_state_phase` discriminator with `destination_not_initialized`, admitted only for
`cmd.jujutsu.git.clone`; a phase-restricted `currentness_fence_uninitialized_destination`; and an `if/then/else`
that nulls exactly those four fields in that phase while the initialized path keeps its exact requirements. Two
positive and six negative fixtures, including both-way truthfulness. JJI-002 and JJI-003 gain acceptance criteria;
sections 3.1 and 3.3 gain the matching prose. No fence, lease, permission, FileSafe decision, idempotency key or
caller context is waived, and clone stays distinct from the ordinary Git clone.

### F109 — required transport credential evidence

**Existing promise.** `Plans/Source_Control_System.md` section 3.3 and `#SCS-003` already require HTTPS path
scoping and SSH known-host and no-forwarding binding.

**Contradiction.** The `credential_lease` transport branches constrained `use_http_path`,
`known_hosts_receipt_ref` and `forwarding_disabled` only when present, and neither the common required list nor
either branch required them. An omitted field was an unconstrained field.

**Change.** `required` added to each transport branch; existing `const` and non-empty constraints unchanged. One
SSH positive fixture and four omission negatives. SCS-003 gains the acceptance criterion and section 3.3 gains the
matching paragraph. Opposite-transport fields stay optional.

## Currentness

All six cited canon files and the repository validator were byte-identical to the frozen 2026-09-13 review snapshot
at branch base `8bcac66937`. No passage had moved, so **no correction was dropped as already covered** and none
conflicted with another thread's direction. Hashes are in `currentness-before-edit.json`.

## Results

| Check | Result |
| --- | --- |
| `pm-new-contracts-verify.py` | pass, 0 findings, 30 pairs, positives 1028 to 1032, negatives 3338 to 3352 |
| `pm-shard-plans.py --check --config Plans/sharding_config.json` | pass, 98 docs, 2676 shards, 0 failures |
| `pm-plan-index.py validate` | pass, 0 failures, 6643 PlanUnits, 25798 acceptance units |
| `pm-bootstrap-ledger-validate.py` | fail on three pre-existing governance coverage omissions, 0 warnings, every ledger-internal check passing |

The ledger failure is the same class the F001 landing recorded in commit `1eb900ca2b`: neither owner doc is a
`sharding_config` source on `origin/main`, and this branch changed no `sharding_config`, `Spec_Lock` or plan-graph
file. Governance reseals belong to the designated Plans agent.

## Claim boundary

Static schema, fixture, shard and index integrity only. No runtime, native adapter, clean-host recovery, security,
performance, visual, governance seal or readiness claim.
