# Shard 039: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/usage-feature.md`

Source lines: L7170-L7295

Source SHA256: `f1b1de40aa84794ec9f37bed185aa8e0cceb55d41081c952386c33822f6afc65`

---

## Wand Modules Redesign Addendum (2026-09-27)

The 2026-09-27 redesign of the Puppet Master 5.6 Pro wand modules (design spec §6.4, §8.0 and §9.1, frozen at `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md`, SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`) shows a time and cost estimate before a collaboration run starts ("About 5–15 min · stops at $6.00 · an estimate, not a promise") and a live cost while it runs. Neither had a Usage owner. This addendum gives them one. It changes no UsageRecord field, no source class and no settlement rule. Pricing rates stay owned by `Plans/Models_System.md` §4.2; `usage_group_ref` and the run's limits stay owned by `Plans/Collaborative_Workflows.md` §2.4.

### UF-104 - Pre-Start Run Estimate

```yaml
plan_unit_id: UF-104
unit_type: schema_contract
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  A surface that offers to start a run may show a pre-start estimate. The estimate is one pure function of the run's definition, estimate(definition) → {duration_s?: [lo, hi], cost_microdollars?: [lo, hi], replies?, basis: {pricing_snapshot_id?, latency_sample_ref?}, source_class: pricing_estimated}, computed without any provider call before Start. cost_microdollars is priced from the pricing snapshot named in basis.pricing_snapshot_id and duration_s from the latency samples named in basis.latency_sample_ref; replies is present only for kinds that count replies. An estimate is never a UsageRecord: it is never persisted as usage, never aggregated, never settled and never counted against a quota or a limit. Every figure it produces is shown as a range with "about" and labelled as an estimate ("an estimate, not a promise"). Each figure is decided separately: with pricing but no latency basis, show only the cost range and say time depends on the work; with latency but no pricing basis, show only the duration range and say cost depends on the work. If neither basis exists, show Time and cost depend on the work without a figure, never a number or "$0.00" (DL-138).
gui_related: true
gui_classification_reason: The estimate line under a start control is user-visible, and its honesty rules bind every surface that shows it.
depends_on: [UF-085, UF-090]
unblocks: []
acceptance_criteria:
  - A known basis produces only its own figure; the unknown figure gets a depends-on-the-work sentence.
  - The estimate is computed with zero provider attempts and zero UsageRecords.
  - Its source_class is pricing_estimated and its basis names the pricing snapshot and the latency samples it used.
  - A shown estimate is a range with "about" and the words "an estimate, not a promise".
  - With no basis, no number and no "$0.00" is shown.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
  - python3 scripts/pm-new-contracts-verify.py
risk_class: estimate_presented_as_usage
reasoning_tier: standard
context_scope: usage_prestart_estimate
implementation_surfaces: [Plans/usage-feature.md, Plans/Models_System.md, Plans/Collaborative_Workflows.md, Plans/usage_run_estimate_contracts.schema.json]
node_compile_hint: {mode: usage_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md sha256:345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c (DL-138)"
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#6.4, #8.0, #9.1 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-USE-01 (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
preserved_exact_tokens: ["duration_s", "cost_microdollars", "pricing_snapshot_id", "latency_sample_ref", "pricing_estimated", "an estimate, not a promise", "$0.00", "time depends on the work", "cost depends on the work"]
negative_constraints:
  - Do not persist, aggregate or settle an estimate as usage.
  - Do not call a provider to produce an estimate.
  - Do not show a number or "$0.00" when there is no basis.
owner_hints: [Plans/usage-feature.md, Plans/Models_System.md]
```

ContractRef: ContractName:Plans/usage-feature.md#UF-085, ContractName:Plans/Models_System.md#42-pricing-metadata-and-stale-pricing-behavior, ContractName:Plans/Collaborative_Workflows.md

### UF-105 - Live Run Cost From The Run Group

```yaml
plan_unit_id: UF-105
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  The live cost a collaboration run shows while it runs, and after it ends, is read from the UsageRecords attributed to the run's usage_group_ref, split per participant with each participant's requested and effective identity and each record's source_class and settlement state. The run-level figure is the sum of those attributed records and nothing else; a participant whose cost is unknown stays unknown and is never counted as zero. Back Seat Driver calls that watch the run are attributed as Back Seat Driver usage (UF-091) and are never added to the run's figure. Which limit a live figure is compared against is owned by the run's limit contract (Plans/Collaborative_Workflows.md §2.4 and executionLimits), not by this unit.
gui_related: true
gui_classification_reason: The live cost on a run card, in the dock and on the run view's cost tab is user-visible.
depends_on: [UF-085, UF-090, UF-091]
unblocks: []
acceptance_criteria:
  - The run figure equals the sum of UsageRecords attributed to its usage_group_ref and shows per-participant rows.
  - Unknown participant cost is shown as unknown and not as zero.
  - Back Seat Driver usage is never included in the run's figure.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: run_cost_misattribution
reasoning_tier: standard
context_scope: usage_collaboration_run_cost
implementation_surfaces: [Plans/usage-feature.md, Plans/Collaborative_Workflows.md, Plans/Back_Seat_Driver.md]
node_compile_hint: {mode: usage_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#4.3, #7.5, #8.1, #9.1 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-USE-02 (part) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
preserved_exact_tokens: ["usage_group_ref", "source_class", "Back Seat Driver", "executionLimits"]
negative_constraints:
  - Do not fabricate or zero-fill a run's cost.
  - Do not fold Back Seat Driver usage into a run's cost.
owner_hints: [Plans/usage-feature.md, Plans/Collaborative_Workflows.md]
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/usage-feature.md#UF-091

### UF-106 - Live Run Cost Against The Run's Effective Limit

```yaml
plan_unit_id: UF-106
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  A run's live cost (UF-105) is shown against the run's effective limit, which Usage reads from the run's limit contract (Plans/Collaborative_Workflows.md and executionLimits) and never resolves itself. By the owner's decision DL-131 (card p16, E-33), when a run's definition sets its own time or cost limit (DL-131 names a Crew's own limit, for example 45 minutes or $6), that limit overrides the general run limit rather than the tighter of the two winning. So a run whose own limit overrides the general one is never shown against the general limit, and a run with no limit of its own is shown against the general run limit. How a run that reaches its effective limit ends is the run owner's, not Usage's: per the lead's DL-131 follow-up it settles cancelled with a limit stop_reason and reads Stopped at your limit (Plans/Collaborative_Workflows.md, CWR-029), and its live cost stays the sum of its UsageRecords. A hard budget or ceiling, including the Plan budget, caps the effective run limit even when the run requested more; Usage displays the effective cap read from the run owner beside live cost and the requested amount remains visible in the sheet (DL-138).
gui_related: true
gui_classification_reason: The limit shown beside a run's live cost is user-visible.
depends_on: [UF-105]
unblocks: []
acceptance_criteria:
  - The live figure is compared with the run owner's effective hard cap, not the uncapped requested amount.
  - A run with its own time or cost limit shows live use against the run owner's effective cap after hard-budget enforcement, with its requested limit shown separately; it may exceed a softer general default only while remaining inside every hard cap.
  - A run without a limit of its own shows its live cost against the run owner's effective limit after hard-budget enforcement; the general run limit applies only when no tighter hard cap applies.
  - Usage reads the effective limit from the run's limit contract and never computes the tighter of the two.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: run_cost_against_wrong_limit
reasoning_tier: standard
context_scope: usage_collaboration_run_cost
implementation_surfaces: [Plans/usage-feature.md, Plans/Collaborative_Workflows.md]
node_compile_hint: {mode: usage_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md sha256:345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c (DL-138)"
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#9.1 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-USE-02 (WAIT part, card p16 E-33) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
  - Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
  - Plans/Decision_Log.md#DL-131
preserved_exact_tokens: ["effective limit", "general run limit", "executionLimits", "DL-131", "hard budget"]
negative_constraints:
  - Do not show a run's cost against the general run limit when the run's own limit overrides it.
  - Do not let Usage choose between limits; it reads the run's effective limit.
owner_hints: [Plans/usage-feature.md, Plans/Collaborative_Workflows.md]
```

ContractRef: ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Collaborative_Workflows.md#CWR-029, ContractName:Plans/usage-feature.md#UF-105, ContractName:Plans/Decision_Log.md#DL-131
