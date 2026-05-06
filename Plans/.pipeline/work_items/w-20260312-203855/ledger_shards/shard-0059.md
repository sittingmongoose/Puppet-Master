  - `Plans/FinalGUISpec.md`
  - `Plans/Media_Generation_and_Capabilities.md`
  - `STATE_FILES.md`
  - `Plans/evidence.schema.json`

### Contradictions / gaps surfaced
- Several owner docs are still broken in ways that directly defeat the machine-verification/gate story they claim to support.
- Event/command naming and routing are still split enough that two “correct” implementations could disagree materially and still point at different local SSOTs.
- Glossary/Crosswalk still are not strong enough to absorb and normalize rewrite-era terms and primitives, which keeps downstream specs append-only and contradictory.
- Runtime-governance docs still lack a few critical ownership fields/rules (startup recovery handshake, blocked-owner attribution, DAE restart/intercept model).
- Newtools and memory remain the strongest examples of plan-local obligations not yet absorbed by canonical state/event/command owners.

### Candidate fixes to carry forward
- After this final tranche, run closeout verification before claiming completion; Codex still found useful signal, but it also suggests the main remaining risk is uneven coverage on docs that never got the full ordered pass sequence.
- Use the next coverage audit to decide whether the remaining uncovered authored docs still need the same six-model treatment or whether this broader second sweep has reached sufficient high-signal closure.
- Any future reconciliation work should prioritize:
  - command/event namespace unification,
  - wiring/gate extraction/schema hardening,
  - artifact/run/workflow identity closure,
  - Glossary/Crosswalk strengthening,
  - startup/blocked/DAE governance ownership.

### Do-not-forget details
- Codex did not invalidate earlier findings; it mostly tightened them into more concrete, machine-verification-relevant failures.
- The owner-doc tranche now has the full requested multi-model sequence and is a strong reference set for what “fully swept” looks like.
- The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.

## Research Progress - 2026-03-16 - Search, attention, and usage deep-links still route locally

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/usage-feature.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Orchestrator_Page.md`
- `Plans/assistant-chat-design.md`

### Key findings
- Search, attention, and usage/artifact pivots all preserve useful local identity, but they still do so in separate feature-specific ways rather than through a shared route-target model.
- `FinalGUISpec.md` thread search already says result clicks navigate to the exact message in its thread, but that behavior is still expressed as search-local prose rather than as one normalized route payload.
- Wizard attention flows use `resume_url` plus `thread_id`, which again makes that flow stronger and more explicit than generic app navigation.
- `usage-feature.md` and `Runtime_Artifacts_Panel.md` both describe `Show in Ledger` / `Show in Usage` behavior using identifiers like:
  - `artifact_id`
  - `usage_event_ref?`
  - `run_id?`
  - `thread_id?`
  - time/filter context
  but they still frame those as view-specific navigation instructions, not as a canonical target model.
- `UI_Command_Catalog.md` mirrors the same fragmentation: artifact actions, thread usage actions, panel switches, and Orchestrator pivots all carry their own local arg sets.
- `Orchestrator_Page.md` still uses simple links like `View in Usage` filtered by `run_id`, which is directionally correct but still narrower than the richer context now available elsewhere.

### Impacted docs
- Primary owners:
  - `Plans/FinalGUISpec.md`
  - `Plans/usage-feature.md`
  - `Plans/Runtime_Artifacts_Panel.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Orchestrator_Page.md`
- Cross-owner docs implicated by this seam:
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
  - `Plans/assistant-chat-design.md`

### Contradictions / gaps surfaced
- `resume_url` and some attention flows are more exact than general-purpose search and cross-surface pivots, which is backwards.
- Search results, artifact pivots, and usage pivots all carry enough identity to benefit from a shared routing model, but they are still encoded as local behavior text or per-command payloads.
- There is still no single place to say that a result should restore not just a destination surface, but also scope such as `project_id`, `focused_run_id`, `thread_id`, selected object, and inspector target.

### Candidate fixes to carry forward
- Route search-result activation, attention-item activation, artifact `Show in *` actions, and Usage pivots through the same canonical route-target model rather than separate ad hoc behaviors.
- Treat `resume_url` as one serialized transport for that same model so wizard attention is no longer a special stronger path.
- Let surface-specific commands remain as wrappers where helpful, but normalize their internal target payloads.
- Preserve richer context on activation:
  - `project_id`
  - `focused_run_id?`
  - `thread_id?`
  - `artifact_id?`
  - `usage_event_ref?`
  - `object_kind?`
  - `object_id?`
  - `tab_id?`
  - `inspector_target?`

### Do-not-forget details
- The issue here is less missing identity than missing normalization; the local docs already know what context they need.
- Usage/artifact/search/attention all now look like natural consumers of the same route-target contract.
- Once this is normalized, several existing `open in X` and `show in Y` actions may turn into thin wrappers instead of independent navigation systems.

## Research Progress - 2026-03-16 - Exports still need identity-preserving manifest discipline

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/usage-feature.md`
- `Plans/Project_Output_Artifacts.md`
- `Plans/FinalGUISpec.md`
- `Plans/assistant-chat-design.md`

### Key findings
- The canonical-storage side is already disciplined:
  - `seglog` is canonical
  - JSONL mirror is derived
  - Project Plan Package artifacts are canonically persisted and filesystem materializations are staging/export/cache
  - packaged document sets already have explicit `manifest.json` ownership
- User-facing export behavior is much looser. Across thread export, ledger/export, usage export, runtime artifact export, and history export, the docs still mostly describe:
  - output format
  - filter/date-range behavior
  - where the file goes
  rather than a normalized identity-preserving export contract
- `storage-plan.md` mentions export of thread/run history to JSONL/JSON, but only at a coarse enhancement level.
- `usage-feature.md` and `FinalGUISpec.md` describe export surfaces such as Ledger/Usage CSV/JSON and thread export, but they do not yet require one stable manifest shape for non-trivial bundles.
- `Project_Output_Artifacts.md` is ahead here because it already treats manifests and canonical artifact IDs/path rules seriously; that same discipline has not yet propagated to general app exports.
- The result is a likely split:
  - simple tabular/view exports can stay lightweight
  - any non-trivial bundle export should preserve canonical IDs/refs and include a manifest

### Impacted docs
- Primary owners:
  - `Plans/storage-plan.md`
  - `Plans/usage-feature.md`
  - `Plans/Runtime_Artifacts_Panel.md`
  - `Plans/FinalGUISpec.md`
  - `Plans/assistant-chat-design.md`
- Cross-owner docs implicated by this seam:
  - `Plans/Project_Output_Artifacts.md`
  - `Plans/Contracts_V0.md`
  - `Plans/UI_Command_Catalog.md`

### Contradictions / gaps surfaced
- Exports are frequently described as output-format features, but not yet as identity-preserving artifacts in their own right.
- There is still no shared rule for when an export is just a convenience view versus when it becomes a structured bundle with manifest, canonical refs, trust disclosure, and reproducibility expectations.
- Thread/run/history exports risk flattening rich object identity unless they explicitly preserve canonical refs like `thread_id`, `run_id`, `artifact_id`, `usage_event_ref`, and route/open hints.

### Candidate fixes to carry forward
- Keep the earlier export taxonomy:
  - `view export`
  - `record export`
  - `bundle export`
- Require manifests for non-trivial bundle exports, and make those manifests preserve canonical IDs/refs rather than export-local surrogate identities.
- Allow simple CSV/table exports to remain lightweight convenience outputs.
- For exports built from stale/degraded projections, carry trust disclosure or re-query canonical backing first.
- Reuse `Project_Output_Artifacts.md` manifest discipline as the strongest model for general export bundles.

### Do-not-forget details
- This seam is mostly about propagating existing rigor, not inventing a new concept.
- The biggest risk is that export features get implemented as “dump whatever the current view shows” and quietly lose canonical identity.
- Bundle manifests and route/subject normalization fit together naturally; exports should preserve the same object vocabulary the UI uses.

## Research Progress - 2026-03-16 - Attention/CtA surfaces still encode route context locally

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/assistant-chat-design.md`
- `Plans/storage-plan.md`
- `Plans/feature-list.md`
- `Plans/Orchestrator_Page.md`

### Key findings
- Dashboard CtA cards, thread badges, and blocked/attention notices already carry the right kinds of identity:
  - `resume_url`
  - `thread_id`
  - `wizard_step`
  - `message_id`
  - blocked metadata
- The problem is not lack of context. The problem is that these attention surfaces still encode it as card-local or notice-local fields instead of as one normalized route target.
- `FinalGUISpec.md` wizard attention and blocked CtA cards are especially explicit: they already define concrete actions like `Resume Wizard` and `View in Thread`, but those actions still resolve through special-case fields rather than a shared navigation object.
- `assistant-chat-design.md` likewise treats thread attention and blocked notices as persistent shell behaviors, but the activation path is still described behaviorally instead of via a reusable route payload.
- `storage-plan.md` preserves `resume_url?` on `thread_blocked_notice` and `wizard_runtime_state`, which is useful for recovery, but it also reinforces the current special-casing if no stronger route-target contract exists.

### Impacted docs
- Primary owners:
  - `Plans/FinalGUISpec.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/storage-plan.md`
- Cross-owner docs implicated by this seam:
  - `Plans/Contracts_V0.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/feature-list.md`
  - `Plans/Orchestrator_Page.md`

### Contradictions / gaps surfaced
- Attention/CtA surfaces are some of the most operationally important navigation points in the app, yet they still rely on local field conventions rather than the generalized route-target model the rest of the rewrite increasingly wants.
- `resume_url` remains stronger and more explicit than most other navigation mechanisms.
- There is still no canonical statement that a CtA card or blocked notice should restore both destination and scope using the same internal payload model as search results, artifact pivots, and thread usage jumps.

### Candidate fixes to carry forward
- Treat CtA card actions and blocked-notice actions as first-class consumers of the canonical route-target model.
- Keep `resume_url` as one persisted/serialized form for recovery/deep-link transport, but not as the hidden canonical navigation primitive.
- Normalize attention-surface target fields so they can restore:
  - destination surface
  - `project_id`
  - `thread_id?`
  - `focused_run_id?`
  - `wizard_id?`
  - `wizard_step?`
  - `message_id?`
  - selected object / inspector context

### Do-not-forget details
- This is one of the highest-value consumers of the route-target work because attention/CtA actions are exactly where users most need precise restoration.
