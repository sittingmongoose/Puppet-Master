# AUG-CP-001 — August consumer/checkpoint drafts (parent veto)

Canonical draft artifacts for the two remaining provisional August IndividualDisposition rows. These are **draft-for-veto** worksheets only: they do not edit `Plans/event_family_registry.json`, do not authorize admission, and do not set `consumers_checkpoints=PASS`.

## Artifacts

| File | Purpose |
|---|---|
| `AUGUST_CHECKPOINT_DRAFTS.jsonl` | Machine-readable draft (one object per August event) |
| `SUMMARY.md` | What owner must affirm before depth can close |

## Result

| Event | `veto_status` | `consumers_checkpoints` | Invented IDs | Registry append |
|---|---|---|---|---|
| `workspace.layout_changed` | **PENDING** | **UNKNOWN** | none | not authorized |
| `terminal.workgroup_moved` | **PENDING** | **UNKNOWN** | none | not authorized |

Acceptance:

- Draft-level `consumers_checkpoints=UNKNOWN` means owner choice is still pending; the corresponding IndividualDisposition rows stay `evidence.consumers_checkpoints.status=OWNER_REQUIRED` and `provisional=true` until that owner choice is applied.
- Draft artifacts exist for both events: **yes**
- No `scripts/**` edits: **yes**
- No invented consumer IDs without citation trail: **yes** (all ID fields remain `null`; descriptive registry strings are explicitly not promoted)
- `FixAugustIndivRows` rows left `provisional=true`: **yes** (drafts do not enable PASS without inference)

## Authority read (binding inputs)

### Shared projector/checkpoint mechanics

`Plans/storage-plan.md:1519-1524` defines the consumption model:

1. Read checkpoint from redb (`segment_generation`, `segment_name`, `byte_offset`, `last_seq`).
2. Open seglog at that location and read records in order.
3. For each event, update only the projections that own it.
4. Commit the new checkpoint only after the owned projection writes are durable.

Checkpoint guarantees at `Plans/storage-plan.md:1541-1546` add: no duplicate semantic writes on resume; sequence order (not mtime) is replay truth; checkpoint advancement is atomic with projector durability.

**Note on prior row citations:** `Plans/event_family_registry.schema.json:305-429` is the `family` object definition (membership fields only). It has **no consumers/checkpoints section** — that absence is an `OWNER_REQUIRED` gap, not a cited binding. Shared projector/checkpoint mechanics come from `Plans/storage-plan.md:1510-1546` only; drafts do **not** cite the schema for checkpoint authority.

### Per-event cited authority

| Event | Membership | Payload | Producer (bounded) | Semantic owner |
|---|---|---|---|---|
| `workspace.layout_changed` | `Plans/event_family_registry.json:2319-2354` | `Plans/event_payloads/workspace_layout_changed.schema.json` | `Plans/Wiring_Matrix.production.json:37154-37213` (reset_layout); `39380-39441` (move_workgroup co-emission) | `Plans/FinalGUISpec.md:334-346`; `Plans/Contracts_V0.md:3402-3407` |
| `terminal.workgroup_moved` | `Plans/event_family_registry.json:2357-2392` | `Plans/event_payloads/terminal_workgroup_moved.schema.json` | `Plans/Wiring_Matrix.production.json:39380-39441` (`handlers::terminal::move_workgroup`) | `Plans/Section15_MVP_Promoted_Features_Spec.md:8483-8522`; `Plans/Contracts_V0.md:3408-3411` |

### Related storage-value families (not EventRecord consumer bindings)

| Event | Cited storage family | Why insufficient alone |
|---|---|---|
| `workspace.layout_changed` | `home_workspace_layout` (`Plans/storage_value_registry.json:10717-10738`) | Proves presentation record key/schema; does not attest EventRecord consumer ID or checkpoint |
| `terminal.workgroup_moved` | `terminal_workgroup_record` (`Plans/storage_value_registry.json:4281-4314`) | Proves workgroup metadata row exists; not attested as EventRecord consumer output. `home_workspace_layout` explicitly must not copy pane trees/PTYs (`Plans/storage-plan.md:17810-17814`) |

## What owner must decide (owner sheet IDs)

Until these are attested with Plans citations, keep both rows `consumers_checkpoints=OWNER_REQUIRED` and `provisional=true`.

| Owner sheet ID | Event | Decision |
|---|---|---|
| `AUG-CP-WLC-001` | `workspace.layout_changed` | Choose one of the owner-sheet outcomes: affirm the cited draft as the exact consumer/checkpoint contract, keep the family registered but provisional, or reclassify it out of registry |
| `AUG-CP-TWM-001` | `terminal.workgroup_moved` | Choose one of the owner-sheet outcomes: affirm the cited draft as the exact consumer/checkpoint contract, keep the family registered but provisional, or reclassify it out of registry |

Post-owner effect on the validator:

1. `AFFIRM_DRAFT_AS_PROPOSED` can clear `registered_contract_depth_incomplete` for that row only after the draft, row artifact, and ledger are regenerated so `consumers_checkpoints=PASS` and `provisional=false` with no invented IDs.
2. `VETO_KEEP_REGISTERED_PROVISIONAL` leaves that row intentionally open: `registered_contract_depth_incomplete` and `individual_dispositions_provisional` remain blocking, so the denominator must not be sealed.
3. `RECLASSIFY_OUT_OF_REGISTRY` can remove that row from the registered-depth blocker only after the registry/census/ledger artifacts are regenerated coherently; it still does not admit the family into the denominator by itself.

### Field-level gaps (both events)

1. **Stable consumer/projector ID** — `OWNER_REQUIRED`
2. **Owned EventRecord projection/output** — `OWNER_REQUIRED` for terminal; `PARTIAL` (storage-value only) for workspace
3. **Checkpoint key + schema + version** — `OWNER_REQUIRED` (`event_family_registry.schema.json` has no consumers/checkpoints section; shared mechanics only at `storage-plan.md:1510-1546`)
4. **Event-specific replay start/order** — `PARTIAL` (shared seglog order only)
5. **Durability pairing** — `OWNER_REQUIRED`
6. **Event-specific unsupported-schema matrix** — `OWNER_REQUIRED`
7. **Consumer replay oracles** — `OWNER_REQUIRED` (producer/receipt oracles are cited; consumer/projector replay oracles are not)

## Explicit non-claims

1. Descriptive strings such as `"Home workspace layout projector"`, `"terminal GUI"`, and `"Section15 terminal section presentation"` are **not** stable Event Authority consumer IDs.
2. Shared `storage-plan.md` projector mechanics do **not** create event-specific `consumers_checkpoints=PASS`.
3. `home_workspace_layout` transactional persistence (`SP-245`) is layout authority; it is **not** silently reclassified as the EventRecord consumer checkpoint for either August family.
4. No analogy from `workspace.layout_changed` to `terminal.workgroup_moved` consumer binding.

## Non-effects

- No edits to `Plans/event_family_registry.json` or other production registries
- No `ADMIT_CANDIDATE` / package admission materialization
- No `consumers_checkpoints=PASS` on IndividualDisposition rows
- No `scripts/**` changes
- `deepen/FixAugustIndivRows` rows unchanged (`provisional=true` retained)

Generated: 2026-08-12 (AugustCPDraft)
