# F106 to F109 — continuation 3 corrections

Each entry names the existing promise or contradiction it repairs, the passage it cites, and what changed. That is
what makes each one a correction rather than a feature.

## F106 — restore readiness consistency

Repairs JJI-008 (`Plans/Jujutsu_Integration.md`), which already requires the workspace and captured-file relationship
to be true before activation, already blocks dual-writer or identity collision, and already forbids promoting a
blocked or conflicted result to successful Backup activation. The readiness conditional in
`Plans/jujutsu_integration_contracts.schema.json#/$defs/backup_jj_restore_verification_receipt` enforced
`historical_operation_result`, `object_closure_result`, `conflict_refs`, `collision_refs` and
`activation_config_disposition`, but not `workspace_map_result`, `colocation_activation_disposition` or
`working_copy_relation`. A receipt could therefore claim `ready_for_owner_activation` while also reporting
`collision_blocked`, `blocked_dual_writer_or_identity_collision` or `unverified`.

Change: a new conditional scoped to `outcome=ready_for_owner_activation` restricts those three fields to their
non-blocking values; JJI-008 gains the matching acceptance criterion; one positive and three negative fixtures are
added. `verified_read_only` keeps its existing conditions, and `owner_rebind_non_colocated_required` remains a valid
readiness path.

## F107 — graph page consistency and adjacency bounds

Repairs SCS-017 (`Plans/Source_Control_System.md`), which already requires bounded pagination and hydration, stable
node and edge references, identity preservation, and visibly stale or partial pages.
`Plans/source_control_contracts.schema.json#/$defs/source_graph_projection` capped nodes at 200 and edges at 600
independently, but accepted a page whose `returned_count` contradicted its node array, a page larger than its own
`page_size`, a current page declaring `has_more` with a null `next_cursor_ref`, two nodes sharing a `node_ref` with
different `revision_ref` values, and a node carrying unbounded `parent_refs` behind `unbounded_hydration=false`.

Change: a new conditional requires a non-null `next_cursor_ref` on a `current` page declaring `has_more`, and
`parent_refs` carries a finite per-node bound. SCS-017 gains four acceptance criteria covering all four obligations.
One positive and two negative fixtures are added.

The adjudication requires a finite parent bound but reserves its exact value for the owner: "Exact adjacency
bound/partial representation needs owner specification and cannot be inferred from the 600-edge cap alone", with
"Do not impose a one-parent or arbitrary exact parent cap from the probe" in `excluded_scope`. The schema therefore
enforces a **provisional** bound of 600 `parent_refs` per node, which is not derived from the 200-node page cap or the
600-edge adjacency cap and is pending the owner's specification of the exact bound and of how a node with more parents
than the bound is represented. That is open question `q-001` in this ledger. An earlier draft stated the bound as
following from the edge budget; that derivation was withdrawn on independent review.

The count arithmetic and the in-page `node_ref` uniqueness rule are relational and JSON Schema cannot express them;
they land as owner obligations and are recorded in `validation_surfaces` as awaiting a `source_control_contracts`
branch in the contract semantic gate, which lives under `scripts/` outside this thread's edit scope. That branch is
question `q-002`, which Jared has since authorized.

## F108 — clone identity before native initialization

Repairs JJI-002 and JJI-003 (`Plans/Jujutsu_Integration.md`). JJI-002 defines revision and snapshot fields as exact
native state and forbids synthetic workspace identity; section 3.1 already admits a dedicated clone to a destination
Source Location and its cancellation settlement. Yet `command_request.expected_revision`,
`currentness.snapshot_id`, `currentness.expected_operation_id` and `command_result.before_revision` unconditionally
required native values, so the one phase in which the destination does not exist natively yet could only be expressed
by fabricating four native identities. The pinned upstream clone code admits an absent or empty destination and calls
`init_workspace` only after destination admission, and it rejects `--at-op`.

Change: a `native_state_phase` discriminator with `destination_not_initialized`, admitted only for
`cmd.jujutsu.git.clone`, a phase-restricted `currentness_fence_uninitialized_destination`, and an `if/then/else` that
nulls exactly those four native fields in that phase while the initialized path keeps its existing exact
requirements. Two positive and six negative fixtures are added, including both-way truthfulness: the phase cannot
claim a native snapshot or operation it does not have, and the initialized path still cannot null its native
preconditions. No fence, lease, permission, FileSafe decision, idempotency key or caller context is waived, and clone
stays distinct from the ordinary Git clone.

## F109 — required transport credential evidence

Repairs SCS-003 and section 3.3 (`Plans/Source_Control_System.md`), which already require HTTPS path scoping and SSH
known-host and no-forwarding binding. The `credential_lease` transport conditionals in
`Plans/source_control_contracts.schema.json` constrained `use_http_path`, `known_hosts_receipt_ref` and
`forwarding_disabled` only when present, and neither the common required list nor either transport branch required
their presence, so an omitted field was an unconstrained field.

Change: `required` is added to each transport branch; the existing `const` and non-empty constraints are unchanged.
One SSH positive fixture and four omission negatives are added. Opposite-transport fields stay optional, and a
non-empty known-host reference remains evidence that a decision was recorded, not proof that its referent resolves.

## Currentness re-check against current main

Every cited canon file was byte-identical to the frozen 2026-09-13 review snapshot at branch base `8bcac66937`, so no
correction was dropped as already covered and none conflicted with another thread's direction.

| Path | SHA-256 |
| --- | --- |
| `Plans/Jujutsu_Integration.md` | `3e0d626da7873a67224fa2cd7fc13f512157b444fc2d2d32f9f488f01fdb258a` |
| `Plans/jujutsu_integration_contracts.schema.json` | `de5570c37d5f502f2d6f3e511d322a117e9e958600aebf3d7a0d14ee9f7f4711` |
| `Plans/jujutsu_integration_contract_fixtures.json` | `4beb3d1a8a340555a01b395ed0eda88566594a9dc8d214aaee8dc5d789354868` |
| `Plans/Source_Control_System.md` | `7695846ddacdedf0f3a81f99830269dd7931e1719d78d19feb532ab90c1b080c` |
| `Plans/source_control_contracts.schema.json` | `39dda3e18a9cd96e7d561919a7a110c950db2826564c7e5fc76cf25565cb8a5a` |
| `Plans/source_control_contract_fixtures.json` | `2c53e4f9d331a326db8cd320f48fbad07a275444e09e1e114c3b7e859f823642` |

## Evidence

| Path | SHA-256 |
| --- | --- |
| `reports/jujutsu-research-2026-09-11/continuation3/final/comparison.json` | `c3006253a5c68074109312747feb67130fb6e12d4f82c66132b268487156370b` |
| `reports/jujutsu-research-2026-09-11/continuation3/final/independent-review.json` | `923df1b300d4de20d29eff414046661590835902074e95a36df3e350161bf28b` |
| `reports/jujutsu-research-2026-09-11/continuation3/final/symmetric-adjudication.json` | `531c6d831890598a99b159ae160aa7bd501d13c2885ef1344f51acaaea74bcc2` |
| `reports/jujutsu-research-2026-09-11/continuation3/final/closing-job-reviews.json` | `e3c64edd60a6ea7664fc98d1541f649665ef2b681915bf249e50046e6917d5e1` |
| `reports/jujutsu-research-2026-09-11/continuation3/final/historical-candidate-passages.json` | `b6d5b2f6d1252ddaf5527fc54ed06a5a011403c8c6ddaa68b77232ce099b2d86` |
| `reports/jujutsu-research-2026-09-11/continuation3/end/restore-readiness-validation.json` | `0cff481c4069a0554e734c6079b3979496ab2a441965bd60b2853fdd0dcac261` |
| `reports/jujutsu-research-2026-09-11/continuation3/end/adjudication/premium-J0020.json` | `d1d67461c7b239a59164e2edebd34969b2b3c8c0d195c02d943bfb1d01eb8188` |
| `reports/jujutsu-research-2026-09-11/continuation3/end/adjudication/remaining17-bulk-review.json` | `1f2d5519829bd63357e2accf3c7e375261d10e5ca5a1b31ed07ef01544140efb` |
| `reports/jujutsu-research-2026-09-11/continuation3/end/evidence-manifest.json` | `79f74fa24511c3b14ae3c1cc2dec250e82497c25e54bee8f0896fdd369d948af` |

Three of the four corrections have an out-of-repository direct job: F107 is `hybrid/J0017-compare`, F109 is
`hybrid/J0018-compare`, and F108 is `premium/J0026-compare`. Their per-job notes, probes and source captures are raw
evidence and live outside this repository under
`/mnt/Cursor/PuppetMaster-Evidence/jujutsu-followup-20260911/continuation3/`; the independent review records their
paths and hashes, and F108's chain is restated in the landing bundle's `evidence-receipts.json` under
`out_of_repository_evidence.f108_chain`. Only F106's direct job, `premium/J0020-compare`, has an in-repository per-job
review. The one in-repository file that names `J0026-compare` is `end/adjudication/remaining17-bulk-review.json`,
whose entry records it as not examined within the bounded evaluator allocation; it is listed above as that fact, not
as support. An earlier draft of this shard and of the bundle receipt wrongly attributed F108 to `premium-J0021.json`
and `premium-J0019.json`, which contain no F108 content; those citations were removed on independent review.
Per-finding review pointers are `independent-review.json#/candidates/0` (F106), `/candidates/1` (F107),
`/candidates/2` (F108) and `/candidates/3` (F109).

Targets: `Plans/Jujutsu_Integration.md#JJI-002`, `#JJI-003`, `#JJI-008`;
`Plans/Source_Control_System.md#SCS-003`, `#SCS-017`; companion schemas and fixtures. No new PlanUnit.
