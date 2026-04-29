# Storage plan (seglog, redb, Tantivy, projectors)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum
  - Storage/delivery clarification pressure from user
  - Emerging execution-settings direction
  - [retired-token-5] settings
  - Highest-Impact Docs
  - Runtime / Storage / Contract Impacts
  - Cleanup Priorities
  - Suggested Research Follow-Ups

#### Source target target-0647
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
  - Storage/delivery clarification pressure from user
  - Emerging execution-settings direction
  - [retired-token-5] settings
  - Highest-Impact Docs
  - Runtime / Storage / Contract Impacts
  - Cleanup Priorities
  - Suggested Research Follow-Ups
- Exact required items represented:
  - pin down whether handoff/retry artifacts are literally JSON/JSONL/[retired-token-23]-backed records/projections
  - specify the concrete project-scoped paths or storage domains that own them
  - specify how a worker receives the handoff packet: inline prompt block, referenced artifact, fetched context, or mixed model
  - Define distinct defaults/overrides for provider/model at run/global, feature seam, work package, node, work package overseer, feature seam overseer, and overseer-delegated node worker levels.
  - Make requested vs effective provider/model visible at all levels where [retired-token-4] can occur.
  - Specify node persona selection as dynamic-by-default from node scope/type; node-worker persona override is policy-owned, not per-node [retired-token-2].
  - Specify whether overseers may use subagents for node work and what provider/model policy applies to delegated node workers.
  - [retired-token-5] settings structure across project settings, run snapshot, attempt record
  - precedence between provider/account/execution-role rules
  - user-configurable threshold that determines when automatic account switching occurs
  - [retired-token-5] [retired-token-6] should be on by default for every [retired-token-7] that uses a provider
  - thresholding/policy granularity by provider, account, [retired-token-7]
  - Replace tier-rooted execution with package/seam/lane model
  - Define package overseer + seam overseer roles
  - Add node/package/seam/lane/attempt/effective_identity fields to contracts and storage
  - Redefine gates to package-complete / seam-complete
  - Rename or retire Tiers UI/tab and tier_tree/progress bars
  - Add node_id
  - Add package_id
  - Add seam_id
  - Add lane_id
  - Add attempt_id
  - Add effective_identity
  - Normalize requested/effective account identity shapes
  - Normalize blocked_[retired-token-24]/allowed_action_ids and [retired-token-26]/[retired-token-27]/[retired-token-28] terminology
  - Remove legacy `[retired-token-24]` / `[retired-token-25]` drift and [retired-token-30].
  - Normalize [retired-token-26] / [retired-token-27] / [retired-token-28] / [retired-token-29] terminology into one authoritative mapping and event taxonomy.
  - Decide which objects are persisted canonically (`package`, `seam`, `lane`, `promotion`, `review`, `resolution_thread`) and which are projections only.
  - Unify requested vs effective execution identity to include account, lane/worktree, and overseer class.
  - Specify package-based worktree lane pools, including lane ownership, pool sizing, [retired-token-29] detection, [retired-token-26] restore behavior, and Source Control visibility.
  - Storage direction is already close to what the rewrite needs:
  - The `provider_account_id` problem is now cross-doc, not local to usage: identity, storage, and provider docs all risk normalizing it differently.
  - provider_account_id
  - [retired-token-22] is canonical
  - `[retired-token-23]`, Tantivy, JSONL mirrors, rollups, and UI-facing keys are projections or derived state
  - [retired-token-23]
  - Research Progress - 2026-03-16 - Gemini broader second-sweep delta cluster (identity, storage, UI ownership)
  - `selected_repo_id` already exists in storage planning; the gap is now in UI contract adoption, not in basic storage vocabulary.
  - selected_repo_id
  - `Plans/UI_Command_Catalog.md` + `[retired-token-35]`
  - Plans/UI_Command_Catalog.md
  - [retired-token-35]
  - canonical events stay in [retired-token-22]
  - Reconcile `base_branch` storage ownership before more Source Control/UI work lands on conflicting keys.
  - base_branch
  - approval identity and field-name drift (`allowed_actions` vs `allowed_action_ids`) still cut across recovery, replay, and storage.
  - allowed_actions
  - allowed_action_ids
  - `.puppet-master/state/active-git-operations.json` cannot become canonical audit if storage-plan keeps [retired-token-22]/receipts as the source of truth.
  - .puppet-master/state/active-git-operations.json
  - schema-family authority, missing storage key owner, and missing attempt/project identity remain unresolved.
  - stored in [retired-token-22] as `artifact_type: validation_pass_report`
  - artifact_type: validation_pass_report
  - Research Progress - 2026-03-16 - Storage owner gaps for missing record/projection families
  - The broader lesson is that storage ownership is lagging behind the rewrite’s stronger UI/runtime object model. Some downstream docs are not merely “too detailed”; they are revealing object families the storage plan now genuinely needs.
  - The current storage families are still more attempt/block/usage-centric than lane/worktree/concern/project-attention-centric, even though the rewrite now relies on those object families elsewhere.
  - the storage gap is now about concrete missing object families, not just incomplete wording
  - it must be rebuildable from [retired-token-22]
  - Recommended worktree/lane storage family
  - Research Progress - 2026-03-16 - Revised readiness posture after owner-doc and storage passes
  - missing runtime-artifact schema family / storage registration
  - spot-checks against `[retired-token-35]`, `Plans/Runtime_Artifacts_Panel.md`, and `Plans/usage-feature.md`
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/usage-feature.md
  - This seam is one of the cleaner ones: storage already contains most of the right model; the lag is mainly in the universal-open/file-centric docs.
  - Surface docs and storage docs are converging on identity-native navigation, but they are doing it without a stable shared contract owner.
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - storage owns persisted refs
  - `workspace_tab_id` and `browser_tab_id` exist in storage and command docs, but they are not `target_kind` values.
  - workspace_tab_id
  - browser_tab_id
  - target_kind
  - declare that storage and surface docs consume, not own, navigation identity
  - persist refs like `resume_url`
  - resume_url
  - `open_source` for non-persisted Deep Plan and non-file artifact classes already resolves to transient `generated://<artifact_id>` buffers
  - open_source
  - generated://<artifact_id>
  - storage owns persisted subject identity and restore joins
  - `[retired-token-35]` continues that ambiguity:
  - Research Progress - 2026-03-17 - Blocked/thread/wizard storage families still straddle two execution eras
  - The runtime/blocking model now wants node/attempt/blocked-sequence identity, but storage still keeps several core families on `[retired-token-11]`.
  - [retired-token-11]
  - `[retired-token-35]` is the strongest carrier of stale canonical scope:
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - No planning-doc edits were made outside the required work-item ledger/meta files; session-local `plan.md` was updated for execution tracking only.
  - plan.md
  - `Decision_Log.md` is presented as the place for final plan decisions, but it does not record the rewrite decisions that now govern multiple owner docs
  - Decision_Log.md
  - [retired-token-23] persistence text keyed to `request_id`, `[retired-token-11]`, `tier_type`, `request_kind`, and `allowed_actions`
  - request_id
  - tier_type
  - request_kind
  - The persistence section still instructs storage to persist request-era fields that later sections explicitly demote.
  - Storage family ownership still needs explicit additions for:
  - state / storage / command / audit-trail behavior
  - Cluster B - Storage / governance / record-schema transfer misses
  - `[retired-token-46]`, `[retired-token-35]`, `[retired-token-39]`, `Plans/UI_Command_Catalog.md`
  - [retired-token-46]
  - [retired-token-39]
  - `[retired-token-46]`, `[retired-token-35]`, `Plans/Decision_Policy.md`, `[retired-token-39]`
  - Plans/Decision_Policy.md
  - `[retired-token-47]`, `[retired-token-35]`, `[retired-token-39]`, `Plans/Models_System.md`, `Plans/Multi-Account.md`, `Plans/Personas.md`, `Plans/Prompt_Pipeline.md`
  - [retired-token-47]
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Personas.md
  - Plans/Prompt_Pipeline.md
  - `[retired-token-39]`, `Plans/Glossary.md`, `[retired-token-47]`, `[retired-token-35]`, `Plans/usage-feature.md`
  - Plans/Glossary.md
  - `[retired-token-46]`, `[retired-token-35]`, `Plans/UI_Command_Catalog.md`, `Plans/Crosswalk.md`, `Plans/Wiring_Matrix.md`, `Plans/Progression_Gates.md`, `Plans/FileManager.md`, `Plans/Project_Output_Artifacts.md`
  - Plans/Crosswalk.md
  - Plans/Wiring_Matrix.md
  - Plans/Progression_Gates.md
  - Plans/FileManager.md
  - Plans/Project_Output_Artifacts.md
  - `**Verdict:** The plan is **fully fleshed out** for MVP for all adopted items (§23.4). No remaining gaps; **accessibility** is explicitly not MVP.`
  - **Verdict:** The plan is **fully fleshed out** for MVP for all adopted items (§23.4). No remaining gaps; **accessibility** is explicitly not MVP.
  - `[retired-token-35]:879-910` confirms partial transfer for bridge/activity payload canon:
  - [retired-token-35]:879-910
  - result: storage receipt/activity gaps should continue to be treated as under-transfer / anchor failures, not as total missing-content claims
  - `[retired-token-35]:325`
  - [retired-token-35]:325
  - `[retired-token-35]:894-897`
  - [retired-token-35]:894-897
  - `[retired-token-35]:1335-1383`
  - [retired-token-35]:1335-1383
  - `[retired-token-35]:330-337`
  - [retired-token-35]:330-337
  - `[retired-token-35]:468-590`
  - [retired-token-35]:468-590
  - `[retired-token-35]:788-817`
  - [retired-token-35]:788-817
  - `[retired-token-35]:1330-1391`
  - [retired-token-35]:1330-1391
  - summary: Re-audited the condensed blocker bundle against live plan sections in bounded chunks and confirmed all eight blocker families remain, but one storage item was overstated and several blocker reasons needed sharper exact wording.
  - `[retired-token-38]` still is not present in `[retired-token-35]`, and the required owner headings `### Required [retired-token-23] keys` and `[retired-token-37]` still are not discoverable.
  - [retired-token-38]
  - ### Required [retired-token-23] keys
  - [retired-token-37]
  - `[retired-token-35]` still omits `run_id` from the receipt minimum-fields list and still does not carry `pass_verdict`, `phase_plan_ref`, or `requirements_quality_report_ref`.
  - run_id
  - pass_verdict
  - phase_plan_ref
  - requirements_quality_report_ref
  - `[retired-token-35]:1548-1568`
  - [retired-token-35]:1548-1568
  - `[retired-token-35]:322-337`
  - [retired-token-35]:322-337
  - `[retired-token-35]:941-956`
  - [retired-token-35]:941-956
  - Wave 2 targeted the storage/receipt/blocked subset around `[retired-token-50]`, `gap-004`, and `gap-005` (`[retired-token-35]`, `Plans/Project_Output_Artifacts.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/interview-subagent-integration.md`, `Plans/usage-feature.md`, `Plans/Tools.md`, `Plans/assistant-chat-design.md`) and only reconfirmed the already-recorded missing anchors/fields plus the already-known owner-vs-consumer split for blocked-packet fields.
  - [retired-token-50]
  - gap-004
  - gap-005
  - Plans/interview-subagent-integration.md
  - `[retired-token-35]:1289-1300`
  - [retired-token-35]:1289-1300
  - summary: Re-audited the condensed blocker bundle against live plan sections in delegated chunks and found one material overstatement in receipt lineage plus several exact owner/consumer refinements that leave all eight blocker families unresolved but sharper.
  - `[retired-token-35]:324-337`
  - [retired-token-35]:324-337
  - `[retired-token-35]:541-590`
  - [retired-token-35]:541-590
  - `[retired-token-35]:1289-1391`
  - [retired-token-35]:1289-1391
  - `[retired-token-35]:1322-1391`
  - [retired-token-35]:1322-1391
  - `[retired-token-43]` sharpened: the broken `[retired-token-41]` reference survives not only in `[retired-token-40]` but also in `[retired-token-35]` and `[retired-token-42]`, while `[retired-token-39]` still preserves the `[retired-token-44]` contradiction.
  - [retired-token-43]
  - [retired-token-41]
  - [retired-token-40]
  - [retired-token-42]
  - [retired-token-44]
  - `[retired-token-35]:1650-1654`
  - [retired-token-35]:1650-1654
  - summary: Ran another bounded audit pass after the blocked Ready Check; the first wave sharpened the storage and glossary blocker families with missing discoverable anchors and broken consumer references, and the follow-up sweeps produced zero new exact missing items beyond those refinements.
  - `[retired-token-50]` sharpened: `[retired-token-35]` still lacks a discoverable `[retired-token-45]` heading even though it contains inline `[retired-token-45] for this feature set...` prose and a `canonical_record.v1:{project_id}:{record_id}` authoritative container, and `[retired-token-47]` still points at the missing `[retired-token-35]#[retired-token-45]` anchor from three different sections.
  - [retired-token-45]
  - [retired-token-45] for this feature set...
  - canonical_record.v1:{project_id}:{record_id}
  - [retired-token-35]#[retired-token-45]
  - `[retired-token-35]:1389-1396`
  - [retired-token-35]:1389-1396
  - `[retired-token-50]` sharpened: `[retired-token-46]` still points at the missing `[retired-token-35]#[retired-token-45]` anchor, and both `[retired-token-47]` and `[retired-token-42]` still point at the missing `[retired-token-35]#Restart and stale history` anchor in addition to the already-carried missing `[retired-token-45]` heading.
  - [retired-token-35]#Restart and stale history
  - `gap-004` sharpened: `Plans/Runtime_Artifacts_Panel.md` still points directly at the missing `[retired-token-35]#Cross-surface receipt record` anchor, so the receipt blocker now includes a live broken consumer reference rather than only missing owner/consumer headings.
  - [retired-token-35]#Cross-surface receipt record
  - `[retired-token-43]` downgraded: the prior `[retired-token-44]` contradiction was overstated because `[retired-token-35]` now cleanly separates runtime safe points from project-scoped [retired-token-44] and `[retired-token-39]` explicitly forbids presenting safe points as [retired-token-44]; the remaining blocker is structural-heading and broken-reference drift.
  - `[retired-token-35]:1616-1625`
  - [retired-token-35]:1616-1625
  - Wave 1 rechecked `[retired-token-50]`, `gap-004`, and `gap-008` against live storage, runtime-artifact, receipt, and usage docs and only reconfirmed the already-recorded missing storage/receipt headings, broken `[retired-token-35]` anchor consumers, missing `[retired-token-38]` naming, and missing usage-side account-history / degrade sections.
  - gap-008
  - `[retired-token-35]:323-337`
  - [retired-token-35]:323-337
  - `[retired-token-35]:941-954`
  - [retired-token-35]:941-954
  - `cov-034` / `obl-016` remains unresolved because the ledger requires a canonical concern-lifecycle owner section with explicit `active` / `acknowledged` / `resolved` / `dismissed` semantics, `resolution_kind` coverage including `accepted_risk`, and a concern-action confirmation matrix, but the live docs only expose fragments: `[retired-token-47]:12-13` keeps concern and notification surfaces distinct from health/activity, `[retired-token-35]:294` lists `concern_record.v1`, `Plans/GUI_Rebuild_Requirements_Checklist.md:31` calls for first-class concern lifecycle and lineage, and `[retired-token-46]:649` only names `concern` as a routable object. Exact ledger evidence remains at `working_ledger.md:L3070-L3092`, `working_ledger.md:L3170-L3182`, `working_ledger.md:L5990-L6015`, and `working_ledger.md:L6442-L6490`.
  - cov-034
  - obl-016
  - active
  - acknowledged
  - resolved
  - dismissed
  - resolution_kind
  - accepted_risk
  - `[retired-token-35]:294`
  - [retired-token-35]:294
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #7 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #8 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #9 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #10 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #11 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #12 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #13 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #14 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #15 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #16 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #17 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #18 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #19 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #20 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #21 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #22 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #23 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #24 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #25 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #26 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #27 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #28 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #29 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #30 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #31 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #32 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #33 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #34 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #35 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #36 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #37 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #38 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #39 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #40 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #41 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #42 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #43 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #44 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #45 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #46 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #47 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #48 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #49 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #50 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-002: Owner-first fidelity recovery order
- Coverage rows: cov-002
- Fidelity gap refs: cov-002
- Required fidelity items:
- Exact required item: Apply owner-doc corrections before consumer and mirror cleanup
- Exact required item: Rerun fidelity audit only after owner and consumer corrections are in place
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-002: Owner-first fidelity recovery order` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-002` repair states the exact requirement: Apply owner-doc corrections before consumer and mirror cleanup
- Exact acceptance check: The `cov-002` repair states the exact requirement: Rerun fidelity audit only after owner and consumer corrections are in place
- Exact acceptance check: The `cov-002` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-013: Shared governance/runtime record envelope

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0667
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - record and artifact must remain different objects
  - JSON summary export is not equivalent to canonical record export unless it preserves the exact record envelope
  - Preserve canonical ids/refs in artifact and record exports; do not invent export-local shadow identity.
  - config bundles, render exports, artifact exports, and Orchestrator record exports are different families and should not be blurred together
  - filtered JSON is not automatically a canonical record export
  - `Runtime_Artifacts_Panel.md` now has a stronger failure: it mandates a concrete envelope + 19 per-type JSON schema files that do not exist, making its validation contract unimplementable as written.
  - Runtime_Artifacts_Panel.md
  - export-family distinctions (Evidence / Artifact / Ledger / Run / Record)
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-013
- Fidelity gap refs: cov-013
- Required fidelity items:
- Exact required item: Define one shared record envelope with canonical lineage refs and artifact/evidence refs
- Exact required item: Keep record objects distinct from artifacts and rendered summaries
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-013: Shared governance/runtime record envelope` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-013` repair states the exact requirement: Define one shared record envelope with canonical lineage refs and artifact/evidence refs
- Exact acceptance check: The `cov-013` repair states the exact requirement: Keep record objects distinct from artifacts and rendered summaries
- Exact acceptance check: The `cov-013` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-018: Export taxonomy and manifest contract

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0668
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - what is the canonical manifest
  - `Evidence export`
  - Evidence export
  - `Artifact export`
  - Artifact export
  - `Ledger export`
  - Ledger export
  - `Ledger export` should be record-shaped first, CSV/JSON second
  - `Evidence export` should preserve evidence/artifact distinction
  - Candidate manifest fields:
  - Evidence / artifact export direction
  - Evidence export should likely include:
  - Artifact export should likely focus on:
  - Add a shared Orchestrator export manifest contract.
  - `Orchestrator_Page.md` still has relatively thin export language:
  - Orchestrator_Page.md
  - no strong run/evidence/history/record-bundle export contract yet
  - Good manifest fields:
  - export convenience must not redefine canonical source-of-truth
  - This means artifact export should remain linked to the exact record/identity model, not become a detached blob dump with lost context.
  - or re-query from canonical/current backing data before export
  - `Runtime_Artifacts_Panel.md` depends on artifact identity opens without fully owning the resolver contract, so the open-by-identity behavior still risks being re-invented per surface.
  - Runtime_Artifacts_Panel.md
  - `storage-plan.md` and `FinalGUISpec.md` are already speaking in stronger identity terms (`preview_subject_id`, `doc:<document_id>`, `artifact:<artifact_id>`), but that identity model has not been lifted into the cross-cutting contract layer.
  - storage-plan.md
  - FinalGUISpec.md
  - preview_subject_id
  - doc:<document_id>
  - artifact:<artifact_id>
  - any non-trivial bundle export should preserve canonical IDs/refs and include a manifest
  - Reuse `Project_Output_Artifacts.md` manifest discipline as the strongest model for general export bundles.
  - Project_Output_Artifacts.md
  - `FinalGUISpec.md` and adjacent docs already contain enough `doc:` / `artifact:` / `generated://` concepts to imply `OpenSubject`, but there is still no owner contract stating that split directly.
  - doc:
  - artifact:
  - generated://
  - OpenSubject
  - shared Orchestrator export manifest contract
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-018
- Fidelity gap refs: cov-018
- Required fidelity items:
- Exact required item: Define record export, bundle export, and view export as distinct export classes
- Exact required item: Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-018: Export taxonomy and manifest contract` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-018` repair states the exact requirement: Define record export, bundle export, and view export as distinct export classes
- Exact acceptance check: The `cov-018` repair states the exact requirement: Require export manifests with export_id/export_kind/project scope/included ids/trust-state disclosure
- Exact acceptance check: The `cov-018` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-020: Concern record family definition
- Coverage rows: cov-020
- Fidelity gap refs: cov-020
- Required fidelity items:
- Exact required item: Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request
- Exact required item: Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-020: Concern record family definition` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-020` repair states the exact requirement: Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request
- Exact acceptance check: The `cov-020` repair states the exact requirement: Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata
- Exact acceptance check: The `cov-020` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-025: Concern lifecycle and resolution kinds

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0670
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - subject kinds should at minimum include `doc:<document_id>` and `artifact:<artifact_id>`
  - doc:<document_id>
  - artifact:<artifact_id>
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-025
- Fidelity gap refs: cov-025
- Required fidelity items:
- Exact required item: Use active/acknowledged/resolved/dismissed as concern lifecycle states
- Exact required item: Use fixed/accepted_risk/superseded/merged/split/invalidated/obsoleted_by_patch/obsoleted_by_recovery as resolution_kind values
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-025: Concern lifecycle and resolution kinds` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-025` repair states the exact requirement: Use active/acknowledged/resolved/dismissed as concern lifecycle states
- Exact acceptance check: The `cov-025` repair states the exact requirement: Use fixed/accepted_risk/superseded/merged/split/invalidated/obsoleted_by_patch/obsoleted_by_recovery as resolution_kind values
- Exact acceptance check: The `cov-025` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-039: Focused run and historical routing contract

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0671
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Routing contract direction
  - Reuse the same routing contract for:
  - Attempts have a clearer historical contract than other major record families.
  - Routing contract implication
  - live backing removed while historical identity may still persist
  - Research Progress - 2026-03-16 - GPT-5.2 Contract / Routing Deepening
  - `[retired-token-3]` still contradicts itself on persona field names, still truncates auth/account identity from its shared-runtime contract, still writes “blocked bundle” language against `[retired-token-1]`, and still contains a likely routing bug (`[retired-token-2]`) inside its pseudo-tier message keys.
  - [retired-token-3]
  - [retired-token-1]
  - [retired-token-2]
  - `UI_Command_Catalog.md` therefore has to carry routing meaning indirectly in per-command arg tables instead of relying on a shared contract family.
  - UI_Command_Catalog.md
  - That is useful, but it should be treated as one serialized transport form of the broader routing model, not as the hidden canonical navigation contract.
  - The routing and command-normalization model now depends on checks that `GATE-010` cannot express, which means the gate layer is behind the owner contract layer.
  - GATE-010
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-039
- Fidelity gap refs: cov-039
- Required fidelity items:
- Exact required item: Use active_run_id/focused_run_id with focus_mode = live | historical
- Exact required item: Keep cross-tab deep links and search pivots coherent on the focused run
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-039: Focused run and historical routing contract` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-039` repair states the exact requirement: Use active_run_id/focused_run_id with focus_mode = live | historical
- Exact acceptance check: The `cov-039` repair states the exact requirement: Keep cross-tab deep links and search pivots coherent on the focused run
- Exact acceptance check: The `cov-039` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-043: Source Control and worktree handshake
- Coverage rows: cov-043
- Fidelity gap refs: cov-043
- Required fidelity items:
- Exact required item: Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator
- Exact required item: Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-043: Source Control and worktree handshake` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-043` repair states the exact requirement: Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator
- Exact acceptance check: The `cov-043` repair states the exact requirement: Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows
- Exact acceptance check: The `cov-043` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-044: Projection trust and action gating
- Coverage rows: cov-044
- Fidelity gap refs: cov-044
- Required fidelity items:
- Exact required item: Use current/refreshing/stale/degraded/unavailable projection states
- Exact required item: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-044: Projection trust and action gating` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-044` repair states the exact requirement: Use current/refreshing/stale/degraded/unavailable projection states
- Exact acceptance check: The `cov-044` repair states the exact requirement: Gate sensitive actions on current or direct canonical revalidation and fall back to record-backed views when degraded
- Exact acceptance check: The `cov-044` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-060: Lane vs worktree lifecycle split

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0673
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - lane/worktree lifecycle split
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-060
- Fidelity gap refs: cov-060
- Required fidelity items:
- Exact required item: Gate cleanup on runtime/recovery/lineage checks rather than age alone
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-060: Lane vs worktree lifecycle split` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-060` repair states the exact requirement: Gate cleanup on runtime/recovery/lineage checks rather than age alone
- Exact acceptance check: The `cov-060` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-074: Historical semantic consistency
- Coverage rows: cov-074
- Fidelity gap refs: cov-074
- Required fidelity items:
- Exact required item: Keep family-local workflow states distinct and reconcile remediation.resolved enum conflict
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-074: Historical semantic consistency` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-074` repair states the exact requirement: Keep family-local workflow states distinct and reconcile remediation.resolved enum conflict
- Exact acceptance check: The `cov-074` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-077: Project summary projection

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0674
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - parent-summary artifact vs evidence summary
  - Research Progress - 2026-03-16 - project summary and attention storage contract cluster
  - summary: Rewrote the work item bundle to the v2 artifact shapes and re-confirmed that mutation planning is still blocked because eight material blocker families remain.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-077
- Fidelity gap refs: cov-077
- Required fidelity items:
- Exact required item: Define project_summary with activity_state, attention_state, health_state, owner, and projection trust disclosure
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-077: Project summary projection` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-077` repair states the exact requirement: Define project_summary with activity_state, attention_state, health_state, owner, and projection trust disclosure
- Exact acceptance check: The `cov-077` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-080: Project attention projection

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0675
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - attention fields:
  - project card should surface background work independently from blocked attention
  - the attention center should still point to the canonical owning object and next action path, not just show copied banner text
  - `resume_url` can remain one serialized route form, but project attention should ultimately align with the shared internal route payload model
  - resume_url
  - primary attention reason field
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-080
- Fidelity gap refs: cov-080
- Required fidelity items:
- Exact required item: Keep attention rows consumable across Orchestrator, Dashboard, and notifications
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-080: Project attention projection` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-080` repair states the exact requirement: Keep attention rows consumable across Orchestrator, Dashboard, and notifications
- Exact acceptance check: The `cov-080` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-163: Coverage blocker concern lifecycle owner section
- Coverage rows: cov-163
- Fidelity gap refs: cov-163
- Required fidelity items:
- Exact required item: Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics
- Exact required item: Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-163: Coverage blocker concern lifecycle owner section` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-163` repair states the exact requirement: Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics
- Exact acceptance check: The `cov-163` repair states the exact requirement: Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section
- Exact acceptance check: The `cov-163` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-176: Concern source-event vs record vs projection split
- Coverage rows: cov-176
- Fidelity gap refs: cov-176
- Required fidelity items:
- Exact required item: Distinguish concern_source_event_ref, concern_record, and concern_projection as separate structural layers
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-176: Concern source-event vs record vs projection split` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-176` repair states the exact requirement: Distinguish concern_source_event_ref, concern_record, and concern_projection as separate structural layers
- Exact acceptance check: The `cov-176` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-181: Runtime attribution ownership split

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0676
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Runtime_Artifacts_Panel.md` still collides with `Contracts_V0.md` on what “envelope” means, still requires missing schema files, still omits `attempt_id` from the common identity set, and still does not pin whether artifact attribution comes from embedded runtime snapshots or mandatory attempt joins.
  - Runtime_Artifacts_Panel.md
  - Contracts_V0.md
  - attempt_id
  - Runtime artifact schema ownership is still split awkwardly:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-181
- Fidelity gap refs: cov-181
- Required fidelity items:
- Exact required item: Let Contracts_V0 own cross-family attribution packet shape
- Exact required item: Let storage-plan own persistence and projection of attempt/usage/receipt/artifact joins
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-181: Runtime attribution ownership split` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-181` repair states the exact requirement: Let Contracts_V0 own cross-family attribution packet shape
- Exact acceptance check: The `cov-181` repair states the exact requirement: Let storage-plan own persistence and projection of attempt/usage/receipt/artifact joins
- Exact acceptance check: The `cov-181` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-182: Bridge-field precedence for attempt/provider/usage/receipt joins

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0677
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Add a bridge-field precedence note to the canonical runtime/storage owner docs:
  - evidence / artifact joins still lack the canonical fields needed to move from runtime/worktree receipts to concrete artifact/evidence subjects.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-182
- Fidelity gap refs: cov-182
- Required fidelity items:
- Exact required item: Use attempt_id as local anchor, provider_attempt_ref as provider/runtime bridge, usage_event_ref as usage bridge, and receipt refs as external side-effect lineage bridge
- Exact required item: None of those bridge fields replace the primary local key
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-182: Bridge-field precedence for attempt/provider/usage/receipt joins` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-182` repair states the exact requirement: Use attempt_id as local anchor, provider_attempt_ref as provider/runtime bridge, usage_event_ref as usage bridge, and receipt refs as external side-effect lineage bridge
- Exact acceptance check: The `cov-182` repair states the exact requirement: None of those bridge fields replace the primary local key
- Exact acceptance check: The `cov-182` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-188: Projection fields for startup rehydration

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0678
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - startup recovery wakeups are named but not tied to a concrete blocked-episode restoration rule
  - startup recovery should rehydrate unresolved blocked episodes, not create fresh ones opportunistically
  - startup recovery still lacks a single owner, but GPT-5.2 also exposed that the governance UX wants a stable `blocked_owner` field that the canonical blocked projection schema still does not define.
  - blocked_owner
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-188
- Fidelity gap refs: cov-188
- Required fidelity items:
- Exact required item: Carry blocked_reason_code and lifecycle state in worktree projections for startup recovery
- Exact required item: Carry dirty_state and conflict_state in worktree projections
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-188: Projection fields for startup rehydration` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-188` repair states the exact requirement: Carry blocked_reason_code and lifecycle state in worktree projections for startup recovery
- Exact acceptance check: The `cov-188` repair states the exact requirement: Carry dirty_state and conflict_state in worktree projections
- Exact acceptance check: The `cov-188` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-190: Artifacts index exact indexed fields
- Coverage rows: cov-190
- Fidelity gap refs: cov-190
- Required fidelity items:
- Exact required item: Index attempt_id and thread_id in artifact index families to preserve attempt-native artifact routing
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-190: Artifacts index exact indexed fields` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-190` repair states the exact requirement: Index attempt_id and thread_id in artifact index families to preserve attempt-native artifact routing
- Exact acceptance check: The `cov-190` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

### Fidelity recovery cov-205: Lane cleanup lineage fields
- Coverage rows: cov-205
- Fidelity gap refs: cov-205
- Required fidelity items:
- Exact required item: Keep package/work-package linkage and cleanup/archive lineage explicit in lane_record and lane_projection families
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-205: Lane cleanup lineage fields` exists in `Plans/storage-plan.md`.
- Exact acceptance check: The `cov-205` repair states the exact requirement: Keep package/work-package linkage and cleanup/archive lineage explicit in lane_record and lane_projection families
- Exact acceptance check: The `cov-205` repair is in the owner section for `Plans/storage-plan.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

**Date:** 2026-02-20
**Status:** Implementation checklist + detailed design
**Cross-references:** Plans/rewrite-tie-in-memo.md, Plans/assistant-chat-design.md (§10-§11, §24), Plans/assistant-memory-subsystem.md, Plans/usage-feature.md, Plans/FileManager.md (§2.9), Plans/Tools.md (§8.0, §8.4 -- tool events and rollups), AGENTS.md. **Validation:** Deterministic verifier gates plus SSOT acceptance/evidence contracts are authoritative for this stack (`python3 scripts/pm-plans-verify.py run-gates`, `Plans/Progression_Gates.md`, `Plans/evidence.schema.json`); SQLite remains off the table.

---

## Summary

Storage for the rewrite follows a multi-store design: **seglog** as the canonical append-only event stream, **redb** for durable KV state (settings, sessions, runs, checkpoints, editor state, analytics rollups), and **Tantivy** for full-text search. Projectors consume seglog and maintain a JSONL mirror, Tantivy indices, and redb state. Analytics scan jobs compute rollups from seglog and store them in redb for fast dashboard and Usage queries. This plan specifies **how** we implement it: file locations, event format, redb schema, projector behavior, and how we address gaps, failure modes, and optional enhancements.

---

## Table of Contents

1. [Definitions and concepts](#1-definitions-and-concepts)
2. [How we're going to do it](#2-how-were-going-to-do-it)
3. [Implementation checklist](#3-implementation-checklist)
4. [Impact on chat (Assistant / Interview)](#4-impact-on-chat-assistant--interview)
5. [Gaps and how we address them](#5-gaps-and-how-we-address-them)
6. [Potential problems and solutions](#6-potential-problems-and-solutions)
7. [Enhancements](#7-enhancements)
8. [Implementation order and testing](#8-implementation-order-and-testing)

---

## 1. Definitions and concepts
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md

### Additional shell/runtime identities required by the promoted Section 15 feature set

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0662
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - evidence set / source refs
  - event/addendum supersession should be explicit enough that implementers do not need to diff three addenda to know the final field set
  - they do not yet expose the non-provider operational identities that live on top of or beside those credentials
  - Keep the initial canonical set deliberately small:
  - The canonical `object_kind` set is:
  - object_kind
  - After this merge, the entire remaining partial set should sit uniformly at `Gemini + Opus + Sonnet`; there is no longer any unevenness inside the tail.
  - Gemini + Opus + Sonnet
  - These should be treated as **secondary** findings behind the ledger-backed missed-transfer set above.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
The storage model MUST treat the following as first-class identities when the feature is enabled:
ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

- `workspace_tab_id`
- `window_id`
- `browser_tab_id`
- `preview_session_id`
- `terminal_section_id`
- `terminal_tab_id`
- `terminal_pane_id`
- `terminal_session_id`
- `dev_session_id`
- `branch_id` for branched conversation/session lineage

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

Identity rules:
- `project_id` is stable across path rebinding and restore operations; raw path is not the canonical identity
- `workspace_tab_id` is distinct from `project_id`
- `browser_tab_id` is distinct from `preview_session_id`
- `terminal_section_id` owns presentation continuity and dock or detach realization
- `terminal_tab_id` owns tab continuity, label, pin state, and order within a terminal section
- `terminal_pane_id` owns split-tree slot continuity and visible binding location
- `terminal_session_id` owns exact PTY continuity
- `dev_session_id` owns higher-level dev workflow continuity and MUST NOT replace `terminal_session_id` when exact shell reuse is required
- detached windows and ephemeral automation/auth sessions have separate persistence scope from workspace-tab shell state

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md

Additional terminal identity rule:
- command-block and transcript metadata may reference stable per-session command-block identifiers, but command-block identity is subordinate to `terminal_session_id` rather than a peer replacement for it

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md
## 2. How we're going to do it

### 2.1 File locations and directory layout

All storage lives under a single **app data root** (for example `~/.puppet-master/`, `$XDG_DATA_HOME/puppet-master/`, `%APPDATA%/puppet-master`, or `~/Library/Application Support/puppet-master`). Project-scoped runtime state still lives under `.puppet-master/` inside the workspace when the feature is inherently project-local.

| Path (relative to app data root) | Purpose |
|----------------------------------|---------|
| `storage/seglog/` | Append-only seglog segments or rolling event log files |
| `storage/redb/` | redb database files for settings, checkpoints, snapshots, and rollups |
| `storage/jsonl/` | Human-readable JSONL mirror emitted by projectors |
| `storage/tantivy/projects/{project_id}/` | Per-project Tantivy indices (`chat`, `code`, `logs`, optional `docs`) |
| `storage/blobs/` | Blob store for large secrets-scrubbed payloads referenced by `blob_ref` |
| `storage/backups/` | Optional point-in-time recovery copies |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md

#### Local project regex-index layout

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0689
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Evidence has local search/filter
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

| Path (relative to project root) | Purpose |
|----------------------------------|---------|
| `.puppet-master/project/state/regex_index/` | Root directory for the per-project sparse n-gram index |
| `.puppet-master/project/state/regex_index/frequency_table.bin` | Project-specific blended frequency table (256x256 `u16`) used by both build and query |
| `.puppet-master/project/state/regex_index/gen-{N}/` | Generation-numbered snapshot directory (`u64`) |
| `.puppet-master/project/state/regex_index/gen-{N}/postings.bin` | Roaring Bitmap posting lists keyed by xxh3 hash |
| `.puppet-master/project/state/regex_index/gen-{N}/lookup.bin` | Sorted mmap-friendly hash-to-offset table |
| `.puppet-master/project/state/regex_index/gen-{N}/file_map.bin` | `u32 file_id -> relative path` mapping, forward-slash normalized |
| `.puppet-master/project/state/regex_index/gen-{N}/index_meta.json` | Snapshot metadata: anchor, schema version, checksums, generation, compatibility flags |

ContractRef: ContractName:Plans/Tools.md, Invariant:INV-002, ContractName:Plans/Architecture_Invariants.md

#### Remote Git project regex-index cache layout

| Path (relative to app data root) | Purpose |
|----------------------------------|---------|
| `.puppet-master/cache/r/{hash8}/` | Remote project cache root (`hash8` = first 8 chars of xxh3(project_id)) |
| `.puppet-master/cache/r/{hash8}/git/` | Bare Git clone for the primary repository |
| `.puppet-master/cache/r/{hash8}/git/m/{sub_hash8}/` | Bare Git clones for submodules (recursive, max depth 5) |
| `.puppet-master/cache/r/{hash8}/dirty/` | Local staging area for remote dirty-file content used by verification and re-anchor merge |
| `.puppet-master/cache/r/{hash8}/regex_index/` | Same snapshot layout as local projects (`frequency_table.bin` + `gen-{N}/...`) |
| `.puppet-master/cache/r/{hash8}/manifest.json` | `hash8 -> project_id/submodule_path` mapping for recovery, MAX_PATH mitigation, and cleanup |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/BinaryLocator_Spec.md

#### Remote non-Git project regex-index cache layout

| Path (relative to app data root) | Purpose |
|----------------------------------|---------|
| `.puppet-master/cache/r/{hash8}/` | Remote project cache root |
| `.puppet-master/cache/r/{hash8}/regex_index/` | Transferred sparse n-gram snapshot built on the remote host |
| `.puppet-master/cache/r/{hash8}/regex_index/frequency_table.bin` | Remotely computed blended frequency table copied to local cache |
| `.puppet-master/cache/r/{hash8}/regex_index/gen-{N}/postings.bin` | Transferred postings snapshot |
| `.puppet-master/cache/r/{hash8}/regex_index/gen-{N}/lookup.bin` | Transferred lookup snapshot |
| `.puppet-master/cache/r/{hash8}/regex_index/gen-{N}/file_map.bin` | Transferred file map snapshot |
| `.puppet-master/cache/r/{hash8}/regex_index/gen-{N}/index_meta.json` | Transferred metadata snapshot |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/Tools.md

Total local footprint for a remote project: Git cache (varies by clone depth and history size) + sparse n-gram index (~1-10% of source size). Shallow and partial clone settings reduce the Git cache portion; index size scales with current source tree size, not repository history depth.

#### Binary file contracts

All binary index files use **little-endian** byte order with no inter-field padding.

- **`file_map.bin`:** header `PMFM` + `schema_version:u32` + `entry_count:u32`. Entries are `path_byte_length:u32` + UTF-8 path bytes. File IDs are generation-local only and MUST NOT be treated as stable across builds or across snapshot generations.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md

- **`lookup.bin`:** header `PMLK` + `schema_version:u32` + `entry_count:u32`. Entries are sorted `(xxh3_hash:u64, postings_offset:u64)` pairs. `lookup.bin` remains a separate mmap file from offset 0; if a future packed format combines files, the lookup region MUST begin at a 64 KB-aligned offset for Windows `MapViewOfFile` compatibility. Startup validation checks both `12 + entry_count * 16` sizing and every referenced postings offset before mmap. When two distinct n-grams produce the same xxh3 64-bit hash, their posting lists are merged at index time (Roaring union); the lookup table has exactly one entry per unique hash. Collisions broaden candidates but never affect correctness.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Architecture_Invariants.md

- **`postings.bin`:** header `PMPL` + `schema_version:u32`. Entries are `bitmap_byte_length:u32` + portable-format Roaring Bitmap bytes. Postings store `u32` file IDs only; line-level precision always comes from ripgrep verification on candidate files.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md

- **`index_meta.json`:** metadata object with these required fields: `anchor_sha: string | null`, `build_timestamp_utc: string`, `schema_version: u32`, `file_count: u32`, `generation: u64`, `checksums: { file_map, lookup, postings }`, `case_sensitive_fs: bool`, and `roaring_format: "portable"`. Dirty-layer state is NOT persisted in `index_meta.json`; it is reconstructed as needed because the index is a cache.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md, Invariant:INV-002

#### Frequency table, path compatibility, and validation rules

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0688
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - schema validation
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- **Base table source:** `frequency_table.bin` is derived from a shipped 256x256 `u16` base matrix built from The Stack Smol, counted on CRLF-stripped ASCII-lowercased bytes. The base table is compiled into the PM binary as a `static` constant (`[u16; 65536]`, ~128 KB); it is not shipped as a separate file.
- **Blend rule:** Local and remote full builds compute per-project counts on the same normalized byte stream and blend them with the base table using `effective[a][b] = 0.5 * base[a][b] + 0.5 * project[a][b]`.
- **Stability rule:** `frequency_table.bin` is shared by both build and query logic and is recomputed only on full rebuilds. Incremental rebuilds reuse the current stored table.
- **Boundary-failure fallback:** When weighting cannot place sparse boundaries for a segment of length >= 3, the builder and query path fall back to fixed-width 3-gram extraction for that segment.
ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md

- **Path normalization:** `file_map.bin` stores forward-slash relative paths on every platform. Conversion to native separators happens only at I/O time.
- **Filesystem compatibility:** `case_sensitive_fs` records whether the snapshot was built on a case-sensitive filesystem. On case-insensitive filesystems, bare-clone path enumeration deduplicates by lowercase path and logs collisions.
- **Startup validation:** snapshot load validates the per-file xxh3 checksums, the lookup-table size and offsets, and (for Git snapshots) whether `anchor_sha` is still reachable. Unreachable anchors or invalid metadata invalidate the generation and force rebuild.
- **Windows MAX_PATH mitigation:** In addition to the `hash8` short-path scheme for cache directories, the PM Windows app manifest declares `<longPathAware>true</longPathAware>` as defense-in-depth against MAX_PATH limits.
- **OS indexer exclusion:** regex-index directories use OS-specific indexer exclusions (`FILE_ATTRIBUTE_NOT_CONTENT_INDEXED` on Windows, `.metadata_never_index` on macOS; none required on Linux) to reduce contention.
ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Tools.md

#### Index sizing guidance

Sparse n-gram index is typically 1-10% of source code size: 50 MB source produces ~0.5-5 MB index, 500 MB → ~5-50 MB, 1 GB → ~50-100 MB, 50 GB → ~2-5 GB. Only the hash lookup table is mmap'd in process memory; the OS pages in what is needed per query. Peak RSS contribution is typically <500 MB even for large repositories.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md

### 2.2 seglog: format, writer, rotation

#### 2.2.1 Mandatory CRC32 per record

Every seglog record MUST include a CRC32 checksum computed over the record payload. This is a mandatory correctness requirement, not an optional enhancement.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md

On read, CRC32 MUST be validated before the record is processed. If validation fails:
- the corrupt record is skipped
- PM emits a recovery/integrity event including record offset and expected vs observed CRC
- projectors resume from the last known-good checkpoint rather than replaying the corrupt record

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Runtime_Artifacts_Panel.md

#### 2.2.2 Concrete wire format

Seglog uses a length-prefixed binary record stream. The canonical payload codec is MessagePack; mirrors and diagnostics may expose the same envelope in JSON, but JSON is not the on-disk authority.

Canonical record structure:
```text
SeglogRecord {
  header: SeglogHeader,
  payload: bytes
}
```

Canonical header fields:
```text
SeglogHeader {
  version: u8,
  segment_generation: u32,
  event_type: string,
  sequence_id: u64,
  source_timestamp_ns?: u64,
  observed_timestamp_ns: u64,
  session_id?: string,
  project_id?: string,
  payload_length: u32,
  checksum_crc32: u32,
  compression: "none" | "lz4"
}
```

Wire-format rules:
- `payload` is the encoded event payload after any payload-only compression step.
- `checksum_crc32` is computed over the stored payload bytes.
- readers validate `payload_length`, then checksum, then decode.
- a single append operation produces exactly one record; record order is the canonical event order.
- `source_timestamp_ns?` preserves upstream/authored time when the source provides it; `observed_timestamp_ns` is always populated by the seglog writer.

#### 2.2.3 Deterministic rotation

Seglog rotation is deterministic and generation-aware.

Rules:
- there is exactly one active writable segment per seglog generation
- active segment path: `storage/seglog/seg-{generation:06}-{start_seq:020}.active`
- closed segment path: `storage/seglog/seg-{generation:06}-{start_seq:020}-{end_seq:020}.seglog`
- rotate on size threshold, clean shutdown, explicit maintenance, or schema-generation change
- closed segments are immutable; no in-place rewrite is allowed
- projectors and rebuild tools consume closed segments in lexicographic order, then the active segment tail when present

#### 2.2.4 Replay and rebuild rules

Replay/rebuild rules:
- redb projections, JSONL mirror files, and Tantivy indices are rebuildable from seglog plus stable checkpoints; none of them outrank seglog as authority
- on restart, replay begins from the last committed checkpoint `{ segment_generation, segment_name, byte_offset, last_seq }`
- if the active segment ends with a partial/corrupt tail, rebuild truncates only after the last verified record and records the recovery action
- rebuild MUST preserve `sequence_id` ordering; regenerated mirrors or indices may differ in file timestamps but not in semantic event order

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

### 2.3 redb: schema, migrations, key patterns

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0655
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - There is still no canonical redb key pattern or record shape for:
  - one canonical route-payload schema owner
  - Several downstream docs now fail at the schema level, not only at the prose level:
  - adjacent owner docs pulled for contradiction checks (`[retired-token-1]`, `[retired-token-7]`, `[retired-token-11]`, `[retired-token-4]`, `[retired-token-5]`, `[retired-token-8]`, `[retired-token-9]`, `[retired-token-10]`, `[retired-token-3]`, `[retired-token-2]`, `[retired-token-6]`)
  - [retired-token-1]
  - [retired-token-7]
  - [retired-token-11]
  - [retired-token-4]
  - [retired-token-5]
  - [retired-token-8]
  - [retired-token-9]
  - [retired-token-10]
  - Artifact / HITL / tool surfaces still have direct schema and key mismatches:
  - canonical redb key registration
  - `pm.evidence.schema.v1` still cannot encode the tri-state or machine-readable arrays that GATE-011/GATE-012 now demand.
  - pm.evidence.schema.v1
  - `evidence.schema.json` is also very generic here. It can store pass/fail checks, but it has no structured slot for wrapper-normalization or alias-resolution evidence.
  - evidence.schema.json
  - the route schema remains the owner of actual route-target structure
  - `[retired-token-10]` is intentionally lean, which is good, but it means verification must mostly derive normalization expectations from the catalog rather than from repeated row-local metadata.
  - deprecated field names such as `allowed_actions[]` must not appear in new canonical schemas
  - allowed_actions[]
  - Storage or key registration landed without the **field schema / value-shape contract**.
  - account-pressure and account-switch key families remain present; the missing transfer is schema and contract ownership, not simple existence.
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #7 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #8 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #9 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #10 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #11 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

#### Canonical records baseline

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0686
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - evidence records
  - selected-object bundle (for example selected concerns + linked evidence + relevant records)
  - prefer notifications rooted in canonical events/blocked records rather than derived rollups
  - `account_switch_reason` appears on attempt/runtime identity records
  - account_switch_reason
  - likely owners for role-aware snapshots, operational-identity disclosure, and switch-history records
  - Promote artifact/memory/live/runtime-observability records to full owner status:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Canonical records are the single source of truth for run, node, lane, and execution state.
- Canonical records are immutable once committed; corrections require a new record with explicit lineage.
- All canonical records include `created_at_utc`, `updated_at_utc`, and `created_by` for audit.

### Concern record and lifecycle canon

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0664
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - migration aliases MUST NOT become permanent parallel canon
  - Older request/tier-era canon still coexists with newer blocked-runtime canon.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Concern is a first-class durable record distinct from review finding, annotation, blocked episode, and graph patch request.
- Define concern_id/project_id/run and scope refs, evidence/source refs, lineage refs, severity/category/status, and governance metadata.
- Create one canonical concern-lifecycle owner section with explicit active/acknowledged/resolved/dismissed semantics.
- Carry resolution_kind including accepted_risk and a concern-action confirmation matrix into that owner section.
- Storage persists concern_record separately from concern_projection and blocked_episode linkage so lifecycle ownership stays durable and queryable.

#### Required redb keys baseline
- `run:<run_id>`: Run context and policy.
- `node:<node_id>`: Node definition and execution state.
- `lane:<lane_id>`: Lane lifecycle and worktree allocation.
- `execution_unit:<execution_unit_id>`: Execution unit context and identity.
- `receipt:<receipt_id>`: Execution receipt and artifact linkage.

### Historical semantic consistency
- Define shared historical vocabulary: historical, stale_historical, superseded, revoked, reopened, archived, removed.
- Keep family-local workflow states distinct and reconcile remediation.resolved enum conflict.
- Historical terms stay shared across concern, receipt, artifact, worktree, and usage families without collapsing family-local workflow states.

#### Cross-surface receipt record baseline

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0687
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The cross-surface receipt record is already the strongest trust-safe pivot anchor; follow-on doc cleanup should prefer receipt/attempt-based routing over ad-hoc page-local refs.
  - `storage-plan.md` promotes `usage_event_ref?` into receipt and cross-surface bridge records but still never defines its concrete format or stability semantics
  - storage-plan.md
  - usage_event_ref?
  - now owns the sharpest receipt/actor-snapshot contradictions and needs a project+actor-aware canonical cross-surface receipt contract
  - Current fields like `effective_project_id` or receipt refs do not solve this.
  - effective_project_id
  - artifact identity and receipt identity should not diverge once attempt-centric orchestration is canonical
  - receipt refs do not replace artifact identity
  - `gap-004` therefore narrows to the missing `### Cross-surface receipt record` anchor, the unresolved fields `run_id`, `pass_verdict`, `phase_plan_ref`, and `requirements_quality_report_ref`, and the still-missing consumer anchors.
  - gap-004
  - ### Cross-surface receipt record
  - run_id
  - pass_verdict
  - phase_plan_ref
  - requirements_quality_report_ref
  - `gap-004` is stable as written; no further storage/lineage audit was productive beyond confirming that the remaining defects are the missing `### Cross-surface receipt record` anchor, four unresolved receipt fields, and the absent consumer anchors.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Receipt records bind execution results to canonical run, node, and lane identity.
- Receipts include `execution_unit_id`, `result_summary`, `artifacts`, and `evidence_ref`.
- Dashboard, CLI, and API surfaces query receipt records to display execution results.

#### Projection freshness, health, and startup rehydration baseline
- Projections are derived from canonical records and events.
- Projection freshness is tracked per projection type; stale projections are recomputed at startup.
- Startup rehydration restores projections from seglog and redb canonical records.

#### Account pressure, history, and runtime attribution baseline

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0685
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Provider/account pressure`
  - Provider/account pressure
  - provider/account pressure present
  - `Gemini pressure: high`
  - Gemini pressure: high
  - The current docs do not yet define how thousands-of-node runs with many generations should remain readable by default without collapsing history away.
  - `Showing canonical history slice`
  - Showing canonical history slice
  - removed live backing should not imply erased canonical history
  - `History vs Ledger`
  - History vs Ledger
  - Preserve `signal_confidence` and `source_kind` in the history family so pressure timelines do not overstate certainty.
  - signal_confidence
  - source_kind
  - Use `inspector_target = history` for chronological/detail-history focus inside an already-selected object.
  - inspector_target = history
  - `inspector_target = details | history`
  - inspector_target = details | history
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Account pressure metrics are stored per account and updated at node/lane boundaries.
- History records (account-level and execution-level) are immutable and linked to canonical run/node identity.
- Runtime attribution tracks which actor/role executed each node or phase.

#### Artifacts index, export manifests, and route/open linkage baseline
- Artifacts are indexed by artifact ID and linked to run, node, and receipt records.
- Export manifests bind artifact collections to project deliverables.
- Route/open linkage documents which route args and open contracts were active during execution.

#### Worktree/lane lifecycle, handshake, and cleanup lineage baseline

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0691
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - they are not enough to replace durable worktree/lane lifecycle records
  - Add explicit first-class storage families for durable worktree/lane lifecycle:
  - durable worktree/lane lifecycle state
  - missing storage families for runtime-artifact indexing and worktree/lane lifecycle
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Worktree lifecycle records track allocation, usage, and reclamation events.
- Handshake records document the Source Control → Orchestrator worktree allocation contract.
- Cleanup lineage ensures stale worktrees are eventually removed and audited.

#### Naming and migration rules baseline

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0690
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `extract_tier_id()` is now a named migration trap, not just a vocabulary issue.
  - extract_tier_id()
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Schema keys follow `entity_type:entity_id:sub_key` patterns for consistency.
- Migrations are versioned and idempotent; old schema versions must be supported for at least one major release.
- Deprecation is explicit and documented in migration notes.

### Fidelity recovery order
- Apply owner-doc corrections before consumer and mirror cleanup.
- Rerun fidelity audit only after owner and consumer corrections are in place.
- Storage-owner sequencing follows the same order: canonical owner records first, dependent projections and mirrors second, and fidelity rerun evidence only after both are complete.

### Canonical records (runtime/storage families)
Storage owns one shared record envelope with canonical lineage refs plus artifact/evidence refs. Record objects remain distinct from rendered views, mirrors, exports, and summaries.

Required record families include:
- `attempt_record.v1:{project_id}:{node_id}:{attempt_number}`
- `blocked_projection.v1:{project_id}:{node_id}`
- `concern_record.v1:{project_id}:{concern_id}`
- `worktree_record.v1:{project_id}:{worktree_id}`
- `worktree_projection.v1:{project_id}:{worktree_id}`
- `lane_record.v1:{project_id}:{lane_id}`
- `lane_projection.v1:{project_id}:{lane_id}`
- `project_summary.v1:{project_id}`
- `project_attention_item.v1:{project_id}:{attention_item_id}`
- `account_pressure_episode.v1:{provider_id}:{account_id}:{episode_id}`
- `account_switch_event.v1:{provider_id}:{event_id}`

Concern canon:
- concern is a first-class durable record distinct from review findings, annotations, blocked episodes, and graph patch requests
- lifecycle states are `active`, `acknowledged`, `resolved`, and `dismissed`
- `resolution_kind` values are `fixed`, `accepted_risk`, `superseded`, `merged`, `split`, `invalidated`, `obsoleted_by_patch`, and `obsoleted_by_recovery`
- source-event refs, concern records, and concern projections are separate structural layers rather than one collapsed object

Historical vocabulary stays explicit: `historical`, `stale_historical`, `superseded`, `revoked`, `reopened`, `archived`, and `removed` are shared storage terms, while family-local workflow states remain family-local.

### Required redb keys (project/runtime families)
- `artifacts_index.v1:{project_id}:{artifact_id}`
- `artifacts_project_state.v1:{project_id}`
- `projector.checkpoint.runtime_artifacts:{project_id}`
- `attempt_record.v1:{project_id}:{node_id}:{attempt_number}`
- `blocked_projection.v1:{project_id}:{node_id}`
- `concern_record.v1:{project_id}:{concern_id}`
- `project_summary.v1:{project_id}`
- `project_attention_item.v1:{project_id}:{attention_item_id}`
- `worktree_record.v1:{project_id}:{worktree_id}`
- `worktree_projection.v1:{project_id}:{worktree_id}`
- `lane_record.v1:{project_id}:{lane_id}`
- `lane_projection.v1:{project_id}:{lane_id}`
- `account_pressure_episode.v1:{provider_id}:{account_id}:{episode_id}`
- `account_switch_event.v1:{provider_id}:{event_id}`

### Cross-surface receipt record (required fields)
Required fields:
- `attempt_id`
- `provider_attempt_ref`
- `usage_event_ref`
- `workflow_refs`
- `docker_refs`
- `kubernetes_refs`
- `validation_pass_report`
- `workflow_run_id`
- `run_id`
- `pass_verdict`
- `phase_plan_ref`
- `requirements_quality_report_ref`

Rules:
- `attempt_id` is the primary local anchor.
- `provider_attempt_ref` is the provider/runtime bridge, `usage_event_ref` is the usage bridge, and receipt refs are the external side-effect lineage bridge; none of them replace the local key.
- Runtime artifacts are attempt-native by default and stay joinable to receipts, usage, workflow, and validation lineage.
- Artifact open flows resolve by `artifact_id` first and then by linked envelope refs.

### Scope split (durable store boundaries)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0684
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Keep `generated://<artifact_id>` as the transient editor/source realization for those subjects, not the durable identity.
  - generated://<artifact_id>
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
| Scope | Store | What belongs here |
|---|---|---|
| Secret | OS credential store only | GitHub API tokens, Docker PATs, browser-login derived credentials, registry/helper secrets |
| Global app state | redb | shared Source Control defaults, Actions defaults, Docker Manager defaults, hidden-subview policy |
| Project state | redb | selected repo/worktree, panel subviews, pinned workflows, selected runtime/context, requested auth mode, template repo state |
| Event ledger | seglog | auth validation, blocked/recovery outcomes, workflow actions, publish results, runtime receipts, cross-surface linkage |

### Projection freshness, health, and startup rehydration (operational rules)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0681
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Provider/account identity stays shared-runtime truth; operational identity stays side-effect/target truth.
  - operational identity / side-effect target identity
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Required rules:
- Use active_run_id/focused_run_id with focus_mode = live | historical
- Keep cross-tab deep links and search pivots coherent on the focused run
- Split projection_freshness from projection_health
- Reserve trust_tier for preview/browser semantics and tie action gating to both axes

Canonical storage rules:
- Project state stores `active_run_id`, `focused_run_id`, and `focus_mode = live | historical` so live dashboards, historical inspectors, and restart rehydration all resolve the same focused run.
- Cross-tab deep links and search pivots MUST target the focused run context; switching tabs or reopening the app does not silently retarget links back to the active run when `focus_mode = historical`.
- `projection_freshness` remains the recency axis and `projection_health` remains the integrity/availability axis; storage and consumers MUST NOT collapse them into a single trust field.
- Sensitive action gating evaluates both axes together: stale-but-healthy projections can require refresh, degraded projections can fall back to canonical record reads, and unavailable projections block projection-dependent actions.
- `trust_tier` is retired as canonical projection vocabulary and is reserved only for preview/browser semantics where UI transport trust must still be disclosed without replacing freshness or health.

### Account pressure, history, and runtime attribution (ownership split)

Required rules:
- Introduce execution_unit_context as canonical runtime-facing context object
- Demote TierContext to a derived or compatibility-only selection/decomposition helper
- Anchor worker spawn, recovery, remediation, coordination, and UI inspection to execution_unit_context
- Let Contracts_V0 own cross-family attribution packet shape
- Let storage-plan own persistence and projection of attempt/usage/receipt/artifact joins

Canonical ownership split:
- `execution_unit_context` is the canonical runtime-facing context object persisted with account pressure episodes, switch history, runtime artifacts, receipts, and usage joins.
- Any `TierContext` or `tier_id` decomposition is compatibility-only derived metadata for legacy selection helpers and MUST NOT own runtime canon, storage keys, or join identity.
- Worker spawn, recovery, remediation, coordination, and UI inspection all resolve runtime identity from `execution_unit_context` so restart flows and inspectors reuse the same run/node/attempt/account anchors.
- Contracts_V0 owns the cross-family attribution packet shape, including run/attempt/thread/node/artifact/provider/usage anchors plus execution/runtime identity.
- storage-plan owns persistence and projection of the attempt/usage/receipt/artifact joins that materialize that packet for history, audit, and inspector consumers.

### Artifacts index, export manifests, and route/open linkage (ownership split)
- Make runtime artifacts attempt-native by default with artifact identity, routing refs, content refs, and provider/usage linkage.
- Resolve artifact open flows by artifact_id and then by linked envelope refs.
- Let Contracts_V0 own canonical route_target and OpenSubject contracts.
- Keep Crosswalk limited to primitive boundary ownership and FileManager OpenFile narrow and path-based.
- Export manifests and artifact indices carry route/open linkage by reference rather than redefining route payload shapes locally.

### Worktree/lane lifecycle, handshake, and cleanup lineage (ownership split)
- Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator.
- Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows.
- Register worktree_record/worktree_projection and lane_record/lane_projection families.
- Use worktree_id as durable filesystem/git identity and lane_id as operational lineage identity.
- Keep package/work-package linkage and cleanup/archive lineage explicit in lane_record and lane_projection families.
- Handshake and cleanup history remain lineage-bearing storage records instead of ad hoc UI-only summaries.

### Naming and migration rules (forward-only storage policy)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0680
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - still drifts from canonical storage namespaces and lacks settled hostability, migration, and trust contracts
  - role-scoped pools already exist in storage and Multi-Account selection rules
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Storage migrations are forward-only and monotonic.

Required rules:
- new fields are additive first; destructive renames require a migration note in the same section that introduces them
- stable semantic names stay aligned across runtime, persistence, and events unless an explicit translation layer is defined
- account/profile-backed runtime records and server-profile-backed runtime records stay distinct durable shapes even when surfaced through one GUI ontology
- consumer docs follow owner-first reconciliation order: owner correction here first, then consumer propagation, then fidelity audit rerun

### Canonical records (owner reconciliation)
Storage owns discoverable record families for runtime, receipt, and projection truth.

### Required redb keys (owner reconciliation)
- `artifacts_index.v1:{project_id}:{artifact_id}`
- `artifacts_project_state.v1:{project_id}`
- `projector.checkpoint.runtime_artifacts:{project_id}`
- `worktree_record.v1:{project_id}:{worktree_id}`
- `lane_record.v1:{project_id}:{lane_id}`
- `worktree_projection.v1:{project_id}:{worktree_id}`
- `lane_projection.v1:{project_id}:{lane_id}`
- `orchestrator.project_state.{project_id}`

### Cross-surface receipt record (storage rules)
Required fields:
- `attempt_id`
- `provider_attempt_ref`
- `usage_event_ref`
- `workflow_refs`
- `docker_refs`
- `kubernetes_refs`
- `validation_pass_report`
- `workflow_run_id`
- `run_id`
- `pass_verdict`
- `phase_plan_ref`
- `requirements_quality_report_ref`

Rules:
- Receipt fields remain lineage-bearing rather than summary prose.
- Runtime artifacts, worktree records, lane records, and project-state keys stay storage owned.

### Scope split (owner reconciliation)

| Scope | Store | What belongs here |
|---|---|---|
| Secret | OS credential store only | GitHub API tokens, Docker PATs, browser-login derived credentials, registry/helper secrets |
| Global app state | redb | shared Source Control defaults, Actions defaults, Docker Manager defaults, hidden-subview policy |
| Project state | redb | selected repo/worktree, panel subviews, pinned workflows, selected runtime/context, requested auth mode, template repo state |
| Event ledger | seglog | auth validation, blocked/recovery outcomes, workflow actions, publish results, runtime receipts, cross-surface linkage |

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/newtools.md, PolicyRule:no_secrets_in_storage

The promoted provider/runtime rewrite and the updated terminal/editor model require durable record and projection families that preserve concrete runtime surfaces, account/profile identity, entitlement attribution, and terminal layout continuity.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md

Required canonical record and projection families include:
- `attempt_record.v1:{project_id}:{node_id}:{attempt_number}`
- `blocked_projection.v1:{project_id}:{node_id}`
- `artifacts_index.v1:{project_id}:{artifact_id}`
- `lane_record.v1:{project_id}:{lane_id}`
- `lane_projection.v1:{project_id}:{lane_id}`
- `worktree_record.v1:{project_id}:{worktree_id}`
- `worktree_projection.v1:{project_id}:{worktree_id}`
- `concern_record.v1:{project_id}:{concern_id}`
- `project_summary.v1:{project_id}`
- `project_attention_item.v1:{project_id}:{attention_item_id}`
- `provider_account_record.v1:{provider_id}:{account_id}`
- `provider_entitlement_context_record.v1:{provider_id}:{account_id}:{billing_entity_id}`
- `server_profile_record.v1:{provider_id}:{connection_profile_id}`
- `account_pressure_episode.v1:{provider_id}:{account_id}:{episode_id}`
- `account_switch_event.v1:{provider_id}:{event_id}`
- `terminal_workspace_state.v1:{project_id}:{workspace_tab_id}`
- `terminal_section_record.v1:{project_id}:{terminal_section_id}`
- `terminal_tab_record.v1:{project_id}:{terminal_tab_id}`
- `terminal_pane_record.v1:{project_id}:{terminal_pane_id}`
- `terminal_leaf_pane_record.v1:{project_id}:{terminal_leaf_pane_id}`
- `terminal_workgroup_record.v1:{project_id}:{terminal_workgroup_id}`
- `editor_terminal_panel_state.v1:{project_id}:{workspace_tab_id}:{editor_terminal_panel_id}`
- `terminal_session_record.v1:{project_id}:{terminal_session_id}`
- `terminal_command_block.v1:{project_id}:{terminal_session_id}:{command_block_id}`
- `dev_session_record.v1:{project_id}:{dev_session_id}`
- `mcp_server_record.v1:{mcp_server_id}`
- `mcp_runtime_availability.v1:{mcp_server_id}:{provider_id}:{runtime_subject_id}`
- `mcp_tool_record.v1:{mcp_server_id}:{tool_id}`
- `skill_record.v1:{skill_id}`
- `skill_runtime_readiness.v1:{skill_id}:{provider_id}:{runtime_subject_id}`
- `debug_investigation_record.v1:{project_id}:{investigation_id}`
- `gha_panel_state.v1:{project_id}`
- `bundle_registry.v1:{project_id}:{bundle_id}`
- `note_record.v1:{bundle_id}:{note_id}`
- `revision_run.v1:{bundle_id}:{revision_id}`
- `composer_prep_state.v1:{thread_id}`
- `preview_state.v1:{project_id}:{preview_id}`
- `browser_session_state.v1:{session_id}`
- `browser_profile_state.v1:{profile_name}`

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/Skills_System.md

Canonical key reconciliation notes:
- `attempt_record.v1:{project_id}:{node_id}:{attempt_number}` is the canonical attempt key. `project_id` is required for cross-project queries, retention, and cleanup; `run_id` and `attempt_id` remain stored fields on the record but are not key components.
- `blocked_projection.v1:{project_id}:{node_id}` is the canonical blocked-state key. The value includes `{ blocked_reason_code, blocked_at, blocked_family, approval_scope_key?, allowed_action_ids[] }`.
- older 3-component or run-scoped variants are superseded by the canonical forms above and remain migration-read aliases only.

GitHub Actions panel state:

```text
gha_panel_state.v1:{project_id} {
  pinned_workflows: string[],      // workflow IDs pinned to panel header
  filter_status: "all" | "failed" | "running" | "success",
  auto_refresh_interval_ms: u64,   // default: 30000
  collapsed_sections: string[],    // collapsed workflow groups
  last_viewed_run_id: string?,
  notification_prefs: {
    notify_on_failure: bool,       // default: true
    notify_on_success: bool,       // default: false
  },
}
```

Document bundle registry persistence:

```text
bundle_registry.v1:{project_id}:{bundle_id} {
  bundle_id: string,
  project_id: string,
  created_at: ISO8601,
  status: "draft" | "in_review" | "approved" | "rejected" | "merged",
  files: BundleFile[],
  review_gate: {
    required_approvals: u32,
    current_approvals: u32,
    auto_merge: bool,
  },
  notes: NoteRecord[],
}

note_record.v1:{bundle_id}:{note_id} {
  note_id: string,
  bundle_id: string,
  file_path: string,
  line_range: [u32, u32],
  content: string,
  author: "user" | "agent",
  created_at: ISO8601,
  resolved: bool,
  resolution: string?,
}
```

Targeted revision persistence:

```text
revision_run.v1:{bundle_id}:{revision_id} {
  revision_id: string,
  bundle_id: string,
  trigger: "note_reply" | "resubmit" | "auto_fix",
  note_reply_index: NoteReplyRef[],  // which notes triggered this revision
  status: "pending" | "running" | "completed" | "failed",
  changes: FileChange[],
  created_at: ISO8601,
}

composer_prep_state.v1:{thread_id} {
  draft_text: string,
  attachments: AttachmentRef[],
  mode_overlay: ModeOverlay?,
  persona_id: string?,
  saved_at: ISO8601,
}
```

Preview and browser persistence:

```text
preview_state.v1:{project_id}:{preview_id} {
  preview_id: string,
  preview_type: "web" | "markdown" | "component",
  source_file: string,
  port: u16?,
  status: "starting" | "running" | "stopped" | "error",
  last_refresh: ISO8601,
}

browser_session_state.v1:{session_id} {
  url: string,
  viewport: { width: u32, height: u32 },
  scroll_position: { x: f64, y: f64 },
  zoom_level: f64,
  dev_tools_open: bool,
}

browser_profile_state.v1:{profile_name} {
  user_agent: string?,
  cookies_enabled: bool,
  javascript_enabled: bool,
  custom_headers: Record<string, string>,
}
```

**runtime artifact index** authoritative record families:

```text
artifacts_project_state.v1:{project_id} {
  project_id: string,
  projection_freshness: "current" | "refreshing" | "stale",
  projection_health: "healthy" | "degraded" | "unavailable",
  artifacts: [{
    artifact_id: string,
    artifact_type: string,
    run_id?: string,
    thread_id?: string,
    node_id?: string,
    attempt_id?: string,
    worktree_id?: string,
    lane_id?: string,
    repo_id?: string,
    path_ref?: string,
    branch_ref?: string,
    baseline_ref?: string
  }]
}

projector.checkpoint.runtime_artifacts:{project_id} {
  project_id: string,
  projection_freshness: "current" | "refreshing" | "stale",
  projection_health: "healthy" | "degraded" | "unavailable"
}
```

**worktree record** and **lane record** authoritative fields:

```text
worktree_record.v1:{project_id}:{worktree_id} {
  project_id: string,
  worktree_id: string,
  lane_id?: string,
  repo_id?: string,
  path_ref?: string,
  branch_ref?: string,
  baseline_ref?: string
}

lane_record.v1:{project_id}:{lane_id} {
  project_id: string,
  lane_id: string,
  worktree_id?: string,
  repo_id?: string,
  path_ref?: string,
  branch_ref?: string,
  baseline_ref?: string
}

worktree_projection.v1:{project_id}:{worktree_id} {
  project_id: string,
  worktree_id: string,
  projection_freshness: "current" | "refreshing" | "stale",
  projection_health: "healthy" | "degraded" | "unavailable"
}

lane_projection.v1:{project_id}:{lane_id} {
  project_id: string,
  lane_id: string,
  projection_freshness: "current" | "refreshing" | "stale",
  projection_health: "healthy" | "degraded" | "unavailable"
}
```

Related events:
- `preview.session.started`
- `preview.session.stopped`
- `preview.session.refreshed`
- `browser.session.navigated`
- `browser.session.resized`

Required identity and attribution fields across runtime-linked record families include:
- `project_id`
- `run_id`
- `node_id?`
- `attempt_id?`
- `blocked_sequence?`
- `feature_seam_id?`
- `work_package_id?`
- `lane_id?`
- `worktree_id?`
- `execution_role?`
- `requested_platform?`
- `effective_platform?`
- `provider_family_id?`
- `requested_runtime_platform_id?`
- `effective_runtime_platform_id?`
- `requested_model?`
- `effective_model?`
- `requested_auth_mode?`
- `effective_auth_mode?`
- `requested_account_policy?`
- `requested_account_id?`
- `requested_billing_entity_id?`
- `effective_account_id?`
- `effective_billing_entity_id?`
- `effective_billing_entity_label?`
- `effective_entitlement_class?`
- `connection_profile_id?`
- `account_switch_reason?`
- `provider_attempt_ref?`
- `usage_event_ref?`
- `workspace_tab_id?`
- `terminal_section_id?`
- `terminal_tab_id?`
- `terminal_pane_id?`
- `terminal_leaf_pane_id?`
- `terminal_workgroup_id?`
- `editor_terminal_panel_id?`
- `terminal_session_id?`
- `dev_session_id?`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-chat-design.md

Projection-state families must expose both freshness and health:
- `projection_freshness`: `current | refreshing | stale`
- `projection_health`: `healthy | degraded | unavailable`

Rules:
- stale and degraded are different states and must not collapse into one generic trust field.
- account-backed runtime records and server-profile-backed runtime records remain distinct durable shapes even though the GUI presents them in one runtime ontology.
- usage attribution records store effective billing/entity context when it explains the active quota bucket, but they do not persist scheduler-only debug internals.
- GUI projection key `terminal_state:v1` may remain a GUI-facing projection name, but canonical ownership stays with terminal workspace, section, workgroup, tab, leaf-pane, panel, session, and command-block records.
- route restoration resolves through canonical record identity, not through feature-local ad hoc payloads.
- PM-generated CLI adapter config and projection files are derived artifacts and MUST NOT become the canonical ownership store for accounts, MCP state, instruction state, or skills.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/storage-plan.md

ContractRef: Plans/Runtime_Artifacts_Panel.md#4. redb key and projector, Plans/WorktreeGitImprovement.md#4.1 Assistant-created worktree lifecycle

### Runtime artifact and projection storage scope

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0683
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - why impacted: still acts like a primary runtime owner for orchestration UX and identity projection.
  - Runtime / Storage / Contract Impacts
  - likely issue: state and artifact paths still preserve old tier/workspace assumptions and need per-project, per-run, per-package/lane scoping.
  - exporting an artifact alone should still preserve enough metadata to know what record/run/object it came from
  - Storage and usage docs already hold canonical-ish runtime data, but still encode obsolete routing/grouping terms:
  - Artifact and file-opening semantics are not yet fully aligned with recovery/run-aware identity:
  - Runtime artifact contracts are thinner than the runtime identity model they are supposed to support:
  - Artifact envelopes still cannot answer who produced the artifact under which identity/trust state.
  - `[retired-token-1]` now looks more fragile than earlier passes suggested: `[retired-token-2]` is still absent from the canonical artifact ID set, producer identity is anonymous at the envelope boundary, `[retired-token-4]` still has no minimum payload semantics, `[retired-token-3]` drill-through still rests on optional `[retired-token-5]`, and the artifacts panel still has no degraded/stale projection contract.
  - [retired-token-1]
  - [retired-token-2]
  - [retired-token-4]
  - [retired-token-3]
  - [retired-token-5]
  - Runtime artifact contracts are still not carrying enough runtime identity:
  - but the storage owner doc does not yet make it a first-class family with key registration, lifecycle, and failure/rebuild semantics at the same level as the newer runtime records
  - Research Progress - 2026-03-16 - Proposed storage families for worktree/lane and artifact index
  - add missing artifact types,
  - `usage_record` is closer to canonical runtime identity than several artifact and tool docs are, but it still keeps old `tier_id` joins alive.
  - usage_record
  - tier_id
  - canonical artifact identity:
  - the docs still use `task_id` language in the artifact packet even though wider execution identity is moving toward node/package/seam/lane-native structures.
  - task_id
  - `artifact:<artifact_id>`
  - artifact:<artifact_id>
  - `Open Artifact` / `Open Report` / routed open when the target is identity-native
  - Open Artifact
  - Open Report
  - command palette, search, artifact deep-links, blocked notices, and FileManager/Editor opens should all resolve through the same internal target model
  - it keeps `resume_url`, search jumps, palette entries, and artifact pivots semantically aligned
  - resume_url
  - The addenda in `Wiring_Matrix.md` increasingly ask the matrix to cover runtime producers, blocked/recovery actions, and projection consumers, but the actual schema still models only UI element rows. The prose is now expecting more than `Wiring_Matrix.schema.json` can encode.
  - Wiring_Matrix.md
  - Wiring_Matrix.schema.json
  - planning drafts and unsaved/generated content use `artifact:<artifact_id>`
  - canonical persisted subject identity = `doc:<document_id>` / `artifact:<artifact_id>`
  - doc:<document_id>
  - `generated://<artifact_id>` should remain an ephemeral source buffer transport, not become the canonical persisted identity. The canonical identity is still `artifact:<artifact_id>`.
  - generated://<artifact_id>
  - first-class identity is the staged/generated artifact
  - Route search-result activation, attention-item activation, artifact `Show in *` actions, and Usage pivots through the same canonical route-target model rather than separate ad hoc behaviors.
  - Show in *
  - There is still no canonical statement that a CtA card or blocked notice should restore both destination and scope using the same internal payload model as search results, artifact pivots, and thread usage jumps.
  - `subject_id = artifact:<artifact_id>`
  - subject_id = artifact:<artifact_id>
  - resolve a canonical subject such as `doc:<document_id>` or `artifact:<artifact_id>`
  - `resume_url` sits on the `route_target` side, not the `OpenSubject` side, because it restores app navigation context rather than just opening a source artifact.
  - route_target
  - OpenSubject
  - `generated://<artifact_id>` is not a subject field. It is a resolved source transport chosen by the `OpenSubject` executor when an artifact subject has no workspace-backed document.
  - `backing_document_id` is not an `OpenSubject` field. It is resolver/storage data used to decide whether an artifact subject opens a real document or a transient generated buffer.
  - backing_document_id
  - document or artifact content identity
  - the `[retired-token-3] runtime artifact and Show in Ledger / Show in Usage` section appears twice with effectively the same content
  - [retired-token-3] runtime artifact and Show in Ledger / Show in Usage
  - Research Progress - 2026-03-17 - Owner docs still leak tier-era scope language into canonical runtime wording
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Required fields:
- artifact_type
- repo_id
- path_ref
- branch_ref
- baseline_ref

Canonical terms and values:
- artifacts_project_state.v1:{project_id}
- projector.checkpoint.runtime_artifacts:{project_id}

Labels:
- runtime artifact index
- worktree record
- lane record

Behavioral rules:
- Runtime-artifact indexing and durable worktree/lane identity are storage-owned families.
- Projection state and projector checkpoints must be first-class rather than panel-owned leftovers.

### Canonical terminal persistence decomposition

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0663
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - terminal instances can be pinned to a specific `tier_id`
  - tier_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Storage-plan is the canonical source for terminal persistence keys. The terminal surface persists as the following decomposed key families:

1. `terminal_session.v1:{terminal_session_id}` — PTY session state
2. `terminal_layout.v1:{project_id}` — terminal panel layout
3. `terminal_history.v1:{terminal_session_id}` — command history
4. `terminal_profile.v1:{profile_name}` — shell profile config
5. `terminal_env.v1:{project_id}` — environment variable overrides
6. `terminal_cwd.v1:{terminal_session_id}` — working directory
7. `terminal_scroll.v1:{terminal_session_id}` — scroll buffer state
8. `terminal_font.v1:global` — terminal font settings
9. `terminal_color.v1:global` — terminal color scheme

FinalGUISpec §15.1 references `terminal_state:v1` as a subset alias. The canonical keys above provide the full decomposition.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md

### Naming and migration rules (terminal/storage keys)
Storage migrations are forward-only and monotonic.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Required rules:
- New fields must be additive first; destructive renames require a migration note in the same section that introduces them.
- Keys MUST keep stable semantic names across runtime, persistence, and events unless this plan explicitly defines a translation layer.
- `session_id`, `thread_id`, `run_id`, `message_id`, `step_id`, `tool_call_id`, `approval_id`, `provider_session_id`, `terminal_session_id`, and `dev_session_id` keep their existing meanings everywhere they appear.
- If two subsystems need different terminology, the owner doc must define the mapping explicitly rather than silently overloading a shared field name.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### Storage-owned rewrite contract
All non-append durable-store rewrites MUST use same-directory temporary files and atomic promotion.
- Replacement writes for state files, manifests, checkpoints, segment rewrites, or similar durable storage artifacts MUST create `<target>.tmp.<random>` in the target directory, write the full replacement payload there, `fsync` the temp file, and then rename/promote it into place.
- Append-only seglog/event writers are exempt from temp-rename promotion, but they remain subject to durable flush and corruption-detection rules.
- Per-session temp directories MAY hold scratch artifacts or janitor-managed work files, but they MUST NOT be used for replacement writes that rely on same-filesystem atomic rename.
- Failure to create the temp file, `fsync` it, or rename/promote it is a hard error; PM MUST NOT silently fall back to direct overwrite.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md

Storage root selection order:
1. Explicit user-configured storage root (if valid and permitted).
2. Project-scoped durable root when the feature is project-owned.
3. App-level durable root for cross-project state.
4. Session temp root only for explicitly temporary data.

Selection rules:
- A feature may write to a session temp root only if its contract explicitly classifies the artifact as temporary or disposable.
- Durable state MUST survive process restart unless the owning contract explicitly says otherwise.
- Remote-mode projects keep durable storage colocated with the owning authority defined by `Plans/GitHub_Integration.md`; temp mirrors are not durable ownership transfers.

Durable-store safety rules:
- Never rewrite durable files via cross-filesystem temp paths when the final correctness contract depends on atomic rename.
- Janitor cleanup MAY remove abandoned temp files, but it MUST NOT touch active durable targets or preserved checkpoints.
- When a durable store is unavailable, writers fail closed and surface a structured error instead of downgrading silently to temp-only persistence.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md

#### Active durable-store lock identity
The active durable-store lock is keyed by `(storage_root, authority_scope, store_family)`.
- Session or run ids are not sufficient durable-store lock identities by themselves.
- Store families that require independent recovery or retention policies must not share a lock identity merely because they live under the same root.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md

#### Concrete bounded collections
Live storage-managed collections MUST have explicit bounds or retention contracts.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/LSPSupport.md

| Collection / family | Bound type | Bound source | Notes |
|---|---|---|---|
| Active assistant and child-session state maps | Max cardinality | Active run envelope plus `max_total_active_agents` | Historical data moves to durable history/checkpoints instead of staying in live maps. |
| MCP connection and auth-handle caches | Max cardinality | Registered server count x active auth scopes | Superseded or idle handles are evicted instead of accumulating indefinitely. |
| LSP session and host/root attachment maps | Max cardinality | Open project/worktree roots x configured servers | Restart/rebind replaces prior attachments instead of widening the map. |
| Projector and analytics work queues | Max queue depth | Per-projector batch limits plus checkpoint/resume contract | Excess work spills via checkpointed resume rather than unbounded in-memory growth. |
| Safe points, snapshot metadata, and undo indexes | TTL + cardinality | Session/run lineage plus configured retention window | Preserved or legal-hold items opt out explicitly; ordinary session artifacts age out. |
| Temp artifacts and stale rewrite remnants | TTL | Janitor sweep plus configured max age | `.tmp.*` rewrite remnants and abandoned scratch artifacts are cleaned deterministically. |

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/LSPSupport.md

### 2.4 Projector pipeline: consumption, JSONL mirror, Tantivy, checkpoints

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0656
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - several older rollup sections still speak in `usage.jsonl` and tier-based aggregation language rather than canonical object-first pivots
  - usage.jsonl
  - `usage.jsonl` aggregation is tier-based
  - Mirror docs should be updated only after their owner docs are reconciled.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
**Consumption model:** Each projector advances in canonical seglog order:

1. Read checkpoint from redb (`segment_generation`, `segment_name`, `byte_offset`, `last_seq`).
2. Open seglog at that location and read records in order.
3. For each event, update only the projections that own it (JSONL mirror, Tantivy, redb snapshot/projector state, analytics enqueue, etc.).
4. Commit the new checkpoint only after the owned projection writes are durable.

**JSONL mirror policy:**
- JSONL mirror is derived, human-readable, and rebuildable. It is never authoritative over seglog.
- The mirror preserves the canonical event envelope in sequence order; projector-local metadata may exist in file naming or side metadata, but not as a semantic fork of the event payload.
- Mirror files rotate deterministically with seglog generations/segments so replay, diffing, and corruption recovery stay explainable.
- A missing or stale mirror file is repaired by replaying the corresponding seglog range; PM MUST NOT backfill seglog from JSONL.
- Mirror retention follows the source seglog retention/preservation decision. A preserved or legal-hold seglog range keeps its mirror unless the mirror is explicitly regenerated in place from the same source range.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md

**Tantivy/index rebuild rules:**
- Tantivy indices, analytics rollups, and other projections rebuild from seglog or the canonical source range chosen by the owning projector.
- Projector checkpoints are durable ownership boundaries; partial projection writes do not advance checkpoints.
- Rebuild after schema-version change clears only the derived projection state being regenerated; the canonical seglog and unrelated redb families remain untouched.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

**Checkpoint guarantees:**
- checkpoints encode enough information to resume without duplicate semantic writes
- sequence order, not file mtime, is the source of truth for replay ordering
- checkpoint advancement is atomic with projector durability, not with UI refresh timing
- projector checkpoints are not a substitute for runtime recovery checkpoint markers. Runtime/executor-owned checkpoint marker events and safe-point lineage records MUST be durably emitted to seglog before mutation-capable execution resumes or restore flows continue.
- recovery resume logic uses the canonical runtime checkpoint marker stream plus projector checkpoints; projector checkpoints alone are insufficient for mutation/recovery replay.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### 2.5 Analytics scan jobs

**Trigger:** Periodic (e.g. every 5 minutes) or on-demand (e.g. when Usage view is opened). Can run in a background task or a separate thread; must not block the main UI. On-demand refresh should leave the previously written rollups visible until the new scan completes.

**Scan range:** Last N hours (e.g. at least 7d for `tool_usage.7d`) or since last scan checkpoint. Read from seglog (or JSONL mirror) in order; filter by event type (`usage.event`, `run.completed`, `tool.invoked`). Canonical tool-usage windows for MVP are `5h`, `24h`, and `7d`; `1h` remains optional.

**Compute:** For 5h/7d: aggregate `usage.event` by platform, sum tokens (or request count) in sliding 5h and 7d windows. For tool latency: collect `tool.invoked` latencies, compute percentiles (p50, p95). For error rates: count run failures / total runs in window. For **tool usage** (Usage tool widget, Plans/Tools.md §8.4): aggregate `tool.invoked` by `tool_name` over the window -- count, p50/p95 ms, error_count (count only events where `success = false`). `tool.denied` events and FileSafe blocks do **not** contribute to `tool_usage.{window}` because the widget reflects executed calls only.

**Write:** Store results in redb under `rollups` namespace (e.g. `usage_5h.{platform}`, `usage_7d.{platform}`, `tool_latency.{window}`, **`tool_usage.{window}`**, `tool_usage_meta.{window}`). Usage view and tool usage widget read from these keys; no direct seglog read for dashboard.

**Checkpoint:** Store "last scanned up to seq X" or "last scanned timestamp" in redb so the next run doesn't rescan from the beginning. Idempotent: recomputing the same window and writing the same keys is safe.

---

## 3. Implementation checklist
- [ ] **Resolve app data root** and create `storage/seglog`, `storage/redb`, `storage/jsonl`, `storage/tantivy`.
- [ ] **Implement seglog writer:** envelope format (ts, seq, type, payload); rotation by size or day; flush on append.
- [ ] **Define event type schemas** for `chat.message`, `chat.thread_created`, `run.started`, `run.completed`, `usage.event`, `tool.invoked` (include optional `success`, `error`, `thread_id` per Plans/Tools.md §8.0), optional `tool.denied`, runtime checkpoint-marker events, and any editor lifecycle events per FileManager.md.
- [ ] **Implement redb schema + migrations:** namespaces (settings, sessions, runs, checkpoints, editor, rollups, review_rules); key patterns as in §2.3; migration runner and version bump.
- [ ] **Implement projector: seglog -> JSONL mirror** (tail, checkpoint, write mirror).
- [ ] **Implement projector: seglog -> Tantivy** (chat index; optional docs/logs); incremental index updates; checkpoint.
- [ ] **Persist projector checkpoints** in redb under `checkpoints` namespace.
- [ ] **Emit runtime checkpoint-marker events:** before mutation-capable execution resumes, before safe-point restore continues, and when recovery resumes from a stored runtime checkpoint; persist the marker lineage needed for replay.
- [ ] **Implement analytics scan:** scan seglog (or JSONL) for usage/tool/run events; compute 5h/7d, tool latency, and **tool_usage** (per-tool count, p50/p95, error_count) rollups; write to redb `rollups` (including `tool_usage.{window}` per Plans/Tools.md §8.4); store scan checkpoint.
- [ ] **Wire chat persistence:** thread list and thread content write to seglog; read from redb (session metadata) and seglog or redb snapshots for full thread load (per assistant-chat-design.md).
- [ ] **Wire editor state:** open tabs, active tab, scroll/cursor per FileManager.md §2.9 into redb `editor` namespace.
- [ ] **Wire Usage/dashboard:** read 5h/7d and rollups from redb; trigger analytics scan on interval or when Usage view opens (per usage-feature.md).
- [ ] **Emit usage.event with thread_id and parent lineage:** When recording usage for Assistant or Interview runs, include `thread_id`, `parent_run_id` when applicable, and the canonical attribution fields needed for per-thread and parent-rollup aggregation.
- [ ] **Emit usage.event for hidden/background model work:** title generation, summaries, compaction helpers, tool-triggered model calls, and other helper invocations still write canonical `usage.event` records even when not directly user-visible.
- [ ] **Emit run.completed with optional usage snapshot:** When a run finishes, include optional `usage` in the `run.completed` payload using the canonical usage field set (`input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`, `reasoning_tokens`, `total_tokens`, `cost_microdollars`, `provider_id`, `model_id`, `account_id?`, `billing_entity_id?`, `entitlement_class?`, `thread_id`, `parent_run_id?`, `cache_hit?`, `cache_strategy?`). Canonical per-request data remains `usage.event`.

## 4. Impact on chat (Assistant / Interview)

Assistant and Interview surfaces persist thread-local state, activity traces, and reviewable history, but they do not become the canonical owner of runtime identity.

Shared runtime identity projection is consumed across chat, widgets, audit, and delegated execution. Storage keeps the canonical field names and their meanings aligned.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Personas.md

| Field | Meaning |
|---|---|
| `requested_persona` | Persona requested for the run. |
| `effective_persona` | Persona actually in effect. |
| `requested_account_binding` | Requested account or provider binding before routing and policy resolution. |
| `operational_identity` | Stable runtime identity used for execution and audit. |
| `effective_account_label` | Human-readable effective account label shown to the user. |
| `effective_provider_identity` | Effective provider/account pair used after routing. |
| `effective_project_id` | Project identity bound to the execution context. |

Storage rules:
- these fields are additive and do not replace the existing requested/effective vocabulary
- `_id` aliases such as `requested_persona_id` are not canonical runtime snapshot fields
- chat and GUI surfaces consume the same stored field names rather than projecting local variants

ContractRef: Plans/Multi-Account.md#4. Data model, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)

Required fields:
- requested_account_id
- requested_account_policy
- effective_account_id
- execution_role
- account_id
- credential_ref
- login
- auth_realm

Canonical terms and values:
- requested_account_id
- requested_account_policy
- effective_account_id
- execution_role
- account_id
- credential_ref
- login
- auth_realm

Labels:
- requested account
- operational identity

Behavioral rules:
- Requested/effective identity must survive in storage snapshots.
- GitHub durable identity uses stable internal account keys while login remains display metadata.

Permission carry-through:
- permission snapshots and usage surfaces must preserve `effective_account_id` and `execution_role`
### 4.2 Question and clarification state

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0657
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The owner question is settled:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Question schema canonical names and enums are locked, including QuestionItem fields, canonical freeform and multi-select field names, and answer source metadata.

Labels and values:
- questionnaire
- single_question
- unavailable
- dismissed

Rules:
- question_id
- question
- allow_freeform
- multi_select
- default_values?: string[]
- draft_value?: string
- response_kind
- validation_state
### 4.3 Plan and TODO state

This section defines the canonical contract for this surface.

Core rules:
- Plan and Deep Plan must both project to a normalized TODO list, with a named Q&A loop before Deep Plan execution and a locked TODO item schema/status set.
- Plan/TODO persistence is locked to explicit revision states, structural-edit gating after approval, bounded revision history, and emission of `chat.plan_todo_updated` for durable TODO mutations.
- TODO tool behavior is locked so todowrite and todoread use the normalized TODO schema, todowrite is not blanket auto-denied in ask/plan mode, and Deep Plan edits must resync the TODO projection before execution.
- `chat.plan_todo_updated` must have an explicit owner-contract definition for durable normalized TODO mutation, and `todoread` must not survive as a `source_surface` mutation source.

Fields:
- Q&A loop
- todo_id
- title
- summary
- status
- dependencies[]
- owner_hint
- verification_hint
- pending | in_progress | completed | blocked | skipped
- superseded
- draft
- approved
- executing
- completed
- blocked
- Structural edits = adding / removing / reordering TODO items
- chat.plan_todo_updated
- todowrite
- todoread
- todowrite can create, reorder, update statuses/notes
- todoread returns current normalized list for active thread/run
- Remove `todowrite` from blanket `ask/plan` mode auto-deny
- editing Deep Plan markdown (the rich artifact) MUST update the normalized TODO projection BEFORE execution begins
ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events

Labels and values:
- Plan
- Deep Plan
Activity transparency payloads carry canonical runtime bridge fields and receipt refs used across audit, artifacts, and usage surfaces.

ContractRef: Plans/Tools.md#8.0 Event payloads (seglog), Plans/Runtime_Artifacts_Panel.md#Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)

**activity payload**

| Field | Requirement |
| --- | --- |
| `node_id` | Runtime node identity for the emitted activity payload. |
| `attempt_id` | Canonical local execution anchor for the activity record. |
| `lane_id` | Lane identity associated with the activity payload. |
| `package_id` | Package identity associated with the activity payload. |
| `execution_role` | Effective execution-role disclosure for the activity payload. |
| `effective_account_id` | Effective account identity carried into the activity payload. |
| `operational_identity` | Stable runtime identity for audit and joins. |
| `provider_attempt_ref` | Provider-side bridge reference that remains subordinate to `attempt_id`. |
| `usage_event_ref` | Usage-side reference for accounting and evidence joins. |
| `detail_ref` | Inspection reference for drilldown payloads. |
| `report_ref` | Inspection reference for report payloads. |

**receipt refs** remain inspection and provenance links rather than route/open surrogates.

Labels:
- activity payload
- bridge fields

Behavioral rules:
- Inspection refs remain inspection/provenance refs; route/open contracts remain route/open contracts.
- Bridge-field precedence must be explicit rather than inferred.

Permission carry-through:
- effective actor and account identity must survive into activity payloads
### 4.5 Inline visualizer persistence

Inline visualizer persistence stores only PM-managed source, metadata, and PM-owned outputs.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

Persistence rules:
- persisted fields include source fragment, title, kind, version, and PM-managed output or draft values
- arbitrary JS heap state is not persisted
- replay or reload re-renders from the persisted source plus metadata
- visible fallback and error state are persisted as PM-owned display state, not as arbitrary client script state
## 5. Gaps and how we address them

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0648
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Event-schema precision gaps are wider than the earlier passes suggested:
  - once the remaining structural owner gaps above are explicitly assigned/resolved
  - Close the runtime-governance owner gaps:
  - Runtime-governance closeout sharpened a few final owner gaps:
  - `newtools.md` and assistant-memory still ended with unresolved canonicalization gaps:
  - newtools.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The remaining persistence gaps for the rewrite shell are addressed by explicit owner-aligned state instead of feature-local ad hoc blobs.

### 5.1 Unsaved editor recovery is required, not optional

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0658
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - optional effective persona/platform/model
  - optional disclosure fields
  - `effective_provider_identity` / `provider_identity` / `effective_project_id` are already treated as optional non-secret disclosure fields. That makes them the wrong place to encode actor role or side-effect target identity.
  - effective_provider_identity
  - provider_identity
  - effective_project_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Rules:
- recover-unsaved is required MVP behavior for local and remote-backed buffers
- recovery snapshots store local buffer state, capture metadata, host/path identity, and write availability at capture time
- remote-backed recovery banners must say `Recovered local edits — remote destination not yet synchronized`
- save success is only claimed after the effective destination confirms the write

Implementation spec:
- key: `editor_state.v1:{project_id}:{file_path_hash}`
- stores: cursor position, scroll offset, selection ranges, undo stack reference, and unsaved changes flag
- recovery trigger: on session restore, reload each open editor's state before restoring focus
- conflict handling: if the file changed on disk since the last save, show a diff and let the user choose how to resolve the mismatch

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md

### 5.2 Requested vs effective runtime state must remain visible

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0659
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - runtime blocked reasons like `dirty_worktree` and `worktree_conflict` remain runtime truth, not Source Control-local statuses
  - dirty_worktree
  - worktree_conflict
  - `dirty_worktree` and `worktree_conflict` are canonical blocked reasons and must remain visible in both surfaces without becoming generic SCM errors.
  - historical lineage must remain visible even when live targets disappear
  - `Requested model: claude/sonnet`
  - Requested model: claude/sonnet
  - `Effective model: claude/sonnet`
  - Effective model: claude/sonnet
  - `Reasoning effort: requested high -> skipped`
  - Reasoning effort: requested high -> skipped
  - effective platform/model/variant/auth/account
  - requested and honored exactly
  - requested and clamped
  - requested and skipped
  - not requested at all
  - effective account/auth emphasis, with project-policy and manual-preferred-account source disclosure where relevant
  - effective: what runtime actually used
  - effective runtime result
  - requested vs effective runtime identity
  - If any of those hold, the object should remain `retained`, `suspect`, or `restoring`, not `cleanup_eligible`.
  - retained
  - suspect
  - restoring
  - cleanup_eligible
  - derived exports stay useful, but they must remain visibly derived
  - Sonnet sharpened the identity problem from "requested vs effective is missing" to a more specific structural asymmetry:
  - `preferred` concrete-account requests should remain visible even when runtime legitimately switches away
  - preferred
  - but they do not make the requested vs effective operational identity visible as first-class runtime truth
  - Concern/corroboration/promotion objects remain absent from core runtime protocols.
  - `storage-plan.md` still has both `attempt_record` and `tier_runtime_record`. That may remain acceptable, but only if `tier_runtime_record` becomes clearly derived/view-oriented rather than the place where runtime identity hides.
  - storage-plan.md
  - attempt_record
  - tier_runtime_record
  - `orchestrator-subagent-integration.md` is now sharper than earlier passes suggested: `TierContext` declares runtime identity fields that its own constructor never populates, while active coordination/hook structs remain fully tier-rooted and cannot be joined losslessly to attempt/worktree/permission/runtime records.
  - orchestrator-subagent-integration.md
  - TierContext
  - runtime identity parity and routing-key correctness remain visibly incomplete.
  - Structural owner docs remain actively unsafe:
  - `yolo` is still overstated as approval-free even though non-bypassable step-7 guards remain in force.
  - yolo
  - Make destination-local state reuse conditional on not obscuring the requested target.
  - Domain mutation/runtime commands remain separate again. They act on canonical runtime or domain identity and are not just navigation with a side effect.
  - If graph-local wrappers remain for UX readability, their normalization target and arg derivation must be explicit and consistent with `cmd.runtime.approve` / `cmd.runtime.decline`.
  - cmd.runtime.approve
  - cmd.runtime.decline
  - requested vs effective identity is called out later
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
The persistence model stores enough context to reconstruct effective behavior honestly after restart.

Required stored distinctions:
- requested vs effective browser runtime/capabilities
- requested vs effective LSP enablement and attached-server set
- freshness vs health vs write availability for remote-backed projections
- restore outcome for historical Search, LSP, browser, and editor recovery surfaces

Implementation spec:
- key patterns: `{resource_type}_requested.v1:{scope}:{id}` and `{resource_type}_effective.v1:{scope}:{id}`
- requested state is what the user or system asked for; effective state is what actually applies after resolution
- projection freshness is persisted as `current`, `refreshing`, or `stale`
- `current` means just resolved, `refreshing` means re-resolution is in progress, and `stale` means the projection needs refresh before it should be treated as current

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md

### 5.3 Search and Source Control keep separate projection state

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0660
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Search results should not merely highlight text.
  - If there is no explicit relationship, runs should appear as separate entries only.
  - Keep `projects:v1` narrow:
  - projects:v1
  - Keep `account_switch_reason` on effective/runtime snapshots as the current-run disclosure field.
  - account_switch_reason
  - keep `effective_provider_identity` and `provider_identity` exactly what they already are:
  - effective_provider_identity
  - provider_identity
  - they must not invent separate artifact-local identity
  - keep `OpenFile { path... }` for canonical workspace-file opens
  - OpenFile { path... }
  - Search, attention, and usage/artifact pivots all preserve useful local identity, but they still do so in separate feature-specific ways rather than through a shared route-target model.
  - keep the canonical target object small
  - Keep line/range under `OpenFile`.
  - OpenFile
  - Keep wrapper metadata contract-level and narrow:
  - Keep `OpenFile` separate and narrow:
  - Keep blocked-episode identity explicit:
  - keep `OpenFile` narrow
  - Keep `OpenFile` strictly path/editor scoped.
  - keep `WiringEntry` after them
  - WiringEntry
  - Reconcile `allowed_actions[]` versus `allowed_action_ids[]` language so owner docs do not keep teaching two peer action vocabularies.
  - allowed_actions[]
  - allowed_action_ids[]
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Rules:
- Search state stores text query intent and query snapshots
- Source Control state stores repo projections, compare origins, and review context
- diff-local search does not get persisted as project Search state
- editor markers consume Source Control/LSP projections but do not become a substitute owner

Implementation spec:
- keys: `search_projection.v1:{project_id}` and `sc_projection.v1:{project_id}`
- Search projection stores last query, results, filter state, and scope
- Source Control projection stores branch, diff state, staged files, and commit message draft
- editor markers consume these projections but do not own them

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md

### 5.4 Host-aware LSP persistence and restart behavior
Rules:
- LSP lifecycle and restart budgets are persisted by host-aware session key
- restart/reconnect preserves enough state to disclose whether a projection is current, refreshing, stale, degraded, or unavailable
- remote-mode projects never restore into a silent local fallback path

Implementation spec:
- key: `lsp_server_state.v1:{host_id}:{server_id}:{root_hash}`
- stores: server config, capabilities snapshot, last known status, and restart count
- recovery path: on session restore, restart LSP servers using the persisted config
- persisted restart counts survive reconnects so budget enforcement and degraded-state disclosure remain stable after restart

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

## 6. Potential problems and solutions

| Problem | Solution |
|---------|----------|
| **seglog corruption or partial write** | Append-only with flush and last-complete-record recovery. CRC32 per record is mandatory; validate on every read; corrupt record -> skip + recovery event. |
| **redb corruption** | Restore from backup or rebuild projections from canonical seglog. |
| **Projector falls behind** | Buffer events in bounded batches and checkpoint only after a successful commit. |
| **Analytics scan blocks UI** | Run analytics scans in the background; UI shows last committed rollup plus freshness state. |
| **Disk full / storage I/O** | Surface a user-facing error, stop unsafe writes, and retry only per storage I/O policy. |
| **Migration failure** | Leave previous version intact; do not open a half-migrated store. |
| **Multiple app instances** | Acquire exclusive flock on the active durable-store lock path derived from the selected logical storage root or safe-local fallback before any writes. If the lock is held, enter read-only/viewer mode and notify the user. |

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

| Problem | Solution |
|---------|----------|
| **Checkpoint lost** | Rebuild from seglog / last retained segment. |
| **API contract (caller handling errors)** | `append()` / redb write operations return structured `Result`; no silent swallow. |
| **Projector panic or crash** | Do not advance checkpoint; restart from last good checkpoint. |
| **File record LRU eviction** | Cap in-memory file records at 10,000 entries and rebuild lazily on access. |
| **Boot-time janitor** | After active durable-store lock acquisition, sweep stale `.tmp.*` artifacts, validate lock freshness, and emit a `storage.boot_recovery` event if cleanup was required. |
| **DB / redb shutdown hygiene** | Close the DB handle in the shutdown sequence before process exit. |

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileSafe.md

## 7. Enhancements

- **Compaction:** Specified in §2.2.1. Optional for MVP, but when enabled it MUST preserve `seq`, exclude the active segment, and keep replay/projector correctness intact.
- **Backup/restore:** Scheduled backups MUST snapshot canonical stores at one shared boundary, validate checksums before restore, and rebuild disposable projections (JSONL/Tantivy) after restore rather than treating them as authoritative.
- **Export:** Export thread or run history to JSONL/JSON for user (e.g. from seglog or JSONL mirror filtered by thread_id).
- **Read replicas:** Not applicable for embedded redb; if we move to a server-backed store later, read replicas can serve dashboard/Usage reads.
- **Per-project seglog:** Specified in §2.1.2; default remains app-global.
- **Event schema registry:** Required infrastructure for payload validation and doc generation; this plan owns payload registry/workflow while `Plans/Contracts_V0.md` owns the top-level envelope.
- **Streaming projector:** Optional richer UX path; correctness still depends on committed projector state and durable checkpoints.

---

## 8. Implementation order and testing

### 8.1 Phased implementation order

- **Phase 1 -- seglog foundation**
  Build first: app data root resolution, directory creation (`storage/seglog`, `storage/redb`, `storage/jsonl`, `storage/tantivy`), and seglog writer only (envelope format, seq, flush, optional rotation by size/day). No projectors, no redb.
  **Exit criterion:** We can append events and read them back (by tailing or reading the segment file).

- **Phase 2 -- redb and schema**
  Build: redb open under app data root, schema (namespaces/tables per §2.3: settings, sessions, runs, checkpoints, editor, rollups, review_rules), key patterns, and a migrations runner (version in meta, run migrations on open).
  **Exit criterion:** We can read/write settings and checkpoints (e.g. put/get in `settings` and `checkpoints` namespaces).

- **Phase 3 -- projector: seglog → JSONL mirror**
  Build: single projector that tails seglog from a checkpoint, appends to the JSONL mirror (same envelope format), and persists its checkpoint in redb (`checkpoints` namespace).
  **Exit criterion:** Tail seglog, write mirror, resume from checkpoint after restart (no duplicate mirror lines, checkpoint advances).

- **Phase 4 -- projector: seglog → Tantivy (chat index)**
  Build: projector (or second projector) that reads seglog from checkpoint, indexes `chat.message` (and optionally `chat.thread_created`) into a Tantivy chat index (fields: thread_id, content, role, ts, message_id), and persists its checkpoint in redb.
  **Exit criterion:** Events are indexed and search returns results (e.g. by content or thread_id).

- **Phase 5 -- analytics scan and rollups**
  Build: analytics scan job (periodic or on-demand) that scans seglog (or JSONL mirror) over a time range, computes 5h/7d usage rollups, tool latency, and tool_usage (per-tool count, p50/p95, error_count per Plans/Tools.md §8.4), writes to redb `rollups` namespace, and stores a scan checkpoint.
  **Exit criterion:** 5h/7d and tool rollups are written to redb and the UI (or a test reader) can read them.

- **Phase 6 -- wire chat, editor, and Usage**
  Build: wire chat persistence (thread list and thread content to seglog; read from redb + seglog/snapshots per assistant-chat-design), editor state to redb `editor` namespace (FileManager.md §2.9), Usage/dashboard reading rollups from redb and triggering analytics scan (usage-feature.md); emit `usage.event` with `thread_id` and `run.completed` with optional usage snapshot.
  **Exit criterion:** Full flow works: create thread, send message, events in seglog; projectors update mirror and index; Usage view shows rollups; editor state persists.

**Dependencies:** seglog writer before any projector; redb open + schema + migrations (including `checkpoints` and `rollups` namespaces) before projectors and analytics scan; projectors must not start until redb is open and checkpoints namespace exists; analytics scan must not run until rollups namespace (and scan checkpoint key) exists. Projectors may start once the seglog writer is initialized (current segment may be empty). When checkpoint is missing and seglog is empty, projector starts from position 0 and has nothing to process; when checkpoint is missing and seglog has data, projector starts from the beginning of the first segment.

### 8.2 Dependency graph

- **seglog writer** before any projector (projectors read seglog).
- **redb open + schema + migrations** before projector checkpoints (checkpoints namespace must exist).
- **checkpoints namespace** before any projector runs (projectors read/write checkpoint).
- **Event type schemas** (minimal set for writer) before or with Phase 1; full set before Phase 3/4/5.
- **rollups namespace** before analytics scan writes (Phase 2 defines it; Phase 5 uses it).
- **Tantivy chat index** before chat search UX (Phase 4 before Phase 6 chat wiring).
- **Chat/editor/Usage wiring** after Phase 1-5 storage primitives exist.

### 8.3 Startup and shutdown

**Startup order:**
1. Resolve the app data root (environment override optional).
2. Probe the selected storage root for durable-store safety and establish any required safe local fallback before durable stores are opened.
3. Derive the active durable-store root and its lock path, then acquire exclusive lock ownership before any writer opens durable state. If the lock is already held, PM enters read-only/viewer mode and stops before writer startup.
4. Create `storage/seglog`, `storage/redb`, `storage/jsonl`, `storage/tantivy` if missing.
5. Open redb and run migrations.
6. Open the seglog writer.
7. Start projectors that tail seglog and write JSONL/Tantivy/checkpoints.
8. Start optional analytics schedulers and per-project index services.

If durable-store fallback is active, PM routes lock files, durable DB state, and session snapshot metadata to the safe local fallback while preserving the selected logical storage root for lineage and user-visible diagnostics.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md

**Regex-index startup recovery:** After a project context is known and before the first indexed `grep` or Search-panel regex query for that project:
1. Scan the relevant `regex_index/` directory.
2. Pick the highest valid `gen-{N}/` candidate.
3. Validate `index_meta.json`, per-file xxh3 checksums, and `lookup.bin` sizing / offsets before mmap.
4. For Git-backed caches, verify `anchor_sha` is still reachable (`git cat-file -t {anchor_sha}`). Unreachable anchors invalidate the snapshot and trigger rebuild from current HEAD.
5. If a valid snapshot exists, create `IndexSnapshot`, mmap `lookup.bin`, and mark the project `ready`.
6. If no valid snapshot exists, mark the project `no_index` and transparently serve raw ripgrep until the background full build completes.
7. Delete orphaned or partial generations opportunistically during this recovery path.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Architecture_Invariants.md

**Shutdown:**
1. Signal projectors to stop and flush outputs.
2. Cancel in-flight regex builds and wait briefly for partial-generation cleanup.
3. Flush and close the seglog writer.
4. Close redb.
5. Release the active durable-store lock after the final writer flush completes.
6. Leave the last valid regex snapshot and any reusable remote cache state in place; ordinary shutdown does not evict caches.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

**Concurrency and single-writer rules:** Seglog remains a single-writer stream. Regex-index publication is likewise single-writer per project: one build path publishes snapshots, while readers use lock-free `ArcSwap` snapshots and never observe partially-written generations.
ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

### 8.4 First run / empty state

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0661
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Reconcile owner docs so canonical approval/blocking semantics are runtime-native first.
  - upstream owner docs first
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- **Dirs:** If app data root exists but `storage/*` dirs are missing, create them (§2.1).
- **Seglog:** If `storage/seglog/` is empty, writer creates the first segment on first append; projectors reading checkpoint "none" start from offset 0 and see no events until the first append.
- **redb:** On first open, if no `schema_version` (or missing `meta` namespace), run initial migration that creates all namespaces and sets `schema_version` to 1. redb is created on first open if the file does not exist (standard redb behavior).
- **Projectors:** When checkpoint is missing, treat as "start from beginning of seglog" (first segment, offset 0); when seglog is empty, no work.
**Analytics Scan When Checkpoint Missing (Resolved):**

When the analytics scan checkpoint is missing (first run or after reset):
- Scan from **seq 0** (beginning of seglog).
- Rationale: ensures no data is missed. The seglog is append-only, so a full scan is safe and idempotent.
- For large seglogs, the scan is paginated: process **1000 events per batch**, yielding between batches to avoid blocking the event loop.
- After the scan completes, write the checkpoint to redb (`analytics:scan_checkpoint` → last processed seq).
- Subsequent runs resume from the checkpoint.
- Config: `analytics.scan_batch_size`, default `1000`.

### 8.5 Testing strategy

- **Phase 1:** Unit: app data root resolution; dir creation idempotent; seglog writer append and read-back/tail; rotation. Integration: append N events, close writer, open for read, assert all N lines and envelope fields.
- **Phase 2:** Unit: redb open/create; put/get in each namespace; migration runner. Integration: run migrations from version 0 to current; assert all namespaces usable.
- **Phase 3:** Unit: checkpoint read/write; tail logic; mirror append. Integration: append N events; run JSONL projector; assert mirror has N lines; restart projector, assert no duplicates and checkpoint advanced.
- **Phase 4:** Unit: Tantivy index add document and search by content and thread_id. Integration: append chat.message events; run chat projector; assert search results.
- **Phase 5:** Unit: rollup computation (usage by platform, tool percentiles). Integration: fixture seglog with known usage.event and tool.invoked; run analytics scan; assert rollup values in redb.
- **Phase 6:** Integration: end-to-end thread + message + projectors + search + Usage + editor state.

### 8.6 Acceptance criteria per phase

| Phase | Acceptance criteria |
|-------|----------------------|
| **1** | App data root resolved and storage dirs exist; seglog writer appends envelope-format events and they can be read back in order. |
| **2** | redb opens with current schema; migrations run on version change; settings and checkpoints can be written and read. |
| **3** | JSONL projector tails seglog, appends to mirror, and resumes from checkpoint after restart without duplicating or skipping events. |
| **4** | Chat projector indexes seglog events into Tantivy; search by content and thread_id returns expected results. |
| **5** | Analytics scan writes 5h/7d and tool_usage rollups to redb; a reader (e.g. UI or test) can read them. |
| **6** | Chat, editor, and Usage use seglog and redb; full flow (thread + message + projectors + search + Usage + editor state) works end-to-end. |

---

## Version history

| Date | Change |
|------|--------|
| 2026-02-20 | Initial checklist. |
| 2026-02-22 | Validation reference migrated from file-specific citation to verifier/evidence-based validation contracts. |
| 2026-02-22 (current) | Implementation-ready pass: §8 (phased implementation order, dependencies, startup/shutdown, first-run, testing, acceptance criteria); definitions (project_id, path_hash, window); extended event types (HITL, interview, run tier/iteration/verification, queue, plan_todo, thread archive/delete, subagent, editor lifecycle); extended redb keys (queue, plan_todo, thread_usage, file_tree_expanded, layout, recent_files, run/interview/hitl checkpoints) and value encoding; §5 gaps (implementation order, projectors when seglog empty); §6 problems (API contract, projector panic, project/thread lifecycle, queue/HITL restore, interview vs thread, retention, editor keys, thread_checkpoint cleanup, multi-instance HITL). |
| 2026-02-20 | Fleshed out: definitions, §2 how we do it (locations, seglog format, redb schema, projectors, analytics), §5 gaps, §6 problems, §7 enhancements; expanded checklist. |

## Scheduler Runtime, Safe-Point, and Remediation Storage Addendum (2026-03-08)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0654
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - strongest owner for switch/pressure behavior, but still lacks durable switch-history storage and does not align cleanly with scheduler dispatch or usage/storage identity fields
  - storage and UI consumers now have no single obviously-canonical payload block for scheduler, safe point, and remediation lineage
  - `MiscPlan.md` still embeds sequential tier-era cleanup/remediation assumptions, including a cleanup-remediation loop outside the canonical runtime failure matrix and prepare/cleanup ordering that can erase safe-point baselines.
  - MiscPlan.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Required storage support for the runtime scheduler feature cluster.

### Event ingestion

The storage layer MUST ingest and project the following canonical events (using canonical names, not legacy aliases):

**Scheduler events:**
- `scheduler.pass` (canonical; legacy alias: `run.scheduler_analysis`)
- `node.blocked` (canonical; legacy alias: `run.node_blocked`)
- `node.unblocked` (canonical; legacy alias: `run.node_unblocked`)

**Safe-point events:**
- `safe_point.created`
- `safe_point.restored`

**Remediation events:**
- `remediation.spawned` (canonical; legacy alias: `run.remediation_started`)
- `remediation.resolved` (canonical; legacy alias: `run.remediation_completed`)

> **Migration rule:** Storage consumers MUST accept both canonical and legacy event names during migration but MUST normalize to canonical names before writing projections. New storage code MUST NOT emit legacy names.

### redb key projections

```
scheduler_pass.{run_id}.{scheduler_pass_id}
blocked_projection.{run_id}.{node_id}.{blocked_sequence}
remediation.{run_id}.{remediation_root_id}
safe_point.sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}
```

Canonical note:
- `blocked_projection.{run_id}.{node_id}.{blocked_sequence}` is superseded by canonical `blocked_projection.v1:{project_id}:{node_id}`
- canonical blocked-projection values include `{ blocked_reason_code, blocked_at, blocked_family, approval_scope_key?, allowed_action_ids[] }`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md
## Runtime Attempt / Safe Point / Queue Analysis Storage Addendum (2026-03-09)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0652
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - live execution mutations should stay narrow unless the runtime has an explicit safe batch semantic for that exact action
  - `attempt.started` / usage / storage / auth surfaces still lack one crisp contract for how requested/effective/provider/account identity propagates end to end
  - attempt.started
  - Storage already has the stronger blocked and attempt identities, but still preserves tier-era keys as peer canonical records.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Storage and projections MUST persist the scheduler and recovery model without SQLite.

### Projection rules
- run-graph and orchestrator projections MUST resolve by `attempt_id` rather than only by `node_id`
- the latest blocked state must remain inspectable after app restart
- `ready_since_utc` must survive projection refresh while the node remains continuously ready
- stale attempts from an older `replan_generation` must remain queryable for history but may not be resumed as active work

### Persistence safety rules
- safe-point metadata must persist before mutation-capable attempt execution begins
- local-work-preserved blocked outcomes must be represented explicitly, not inferred from missing failure rows
- queue-analysis records are append-only observability data; later projections may summarize them, but the canonical pass history must remain reconstructable
## Runtime Attempt / Safe Point / Queue Analysis Reconciliation Addendum (2026-03-09)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0651
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Decision_Log.md` currently gives downstream reconciliation no durable place to point when explaining why rewrite-era ownership changed.
  - Decision_Log.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Storage and projections MUST persist the scheduler and recovery model without ambiguity.

### Counter semantics

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0665
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - now clearly needs a versioned correlation/context block and stronger account-health semantics
  - Reconcile `ask/plan` and `external_publish_side_effect` semantics in one canonical algorithm.
  - ask/plan
  - external_publish_side_effect
  - Concern/corroboration/promotion semantics are still absent or only gestured at:
  - still needs consolidation plus rewrite-era actor/corroboration/concern/wake semantics
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- `attempt_count` is the ground-truth count of started attempts for a node in a run, including the first attempt.
- `retry_count` is derived display data only: `max(attempt_count - 1, 0)`.
- sub-counter decomposition is additive attribution, not a replacement for `attempt_count`: `attempt_count = initial_attempts + retry_attempts + resume_attempts + remediation_retry_attempts`.
- permission, auth, approval, safe-point, or revalidation changes produce new attempt snapshots/records; they do not mutate prior attempt counters in place.
- projections that need lineage MUST join through `attempt_id` and the immutable attempt snapshot, not infer history from `retry_count` alone.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md

- run-graph and orchestrator projections MUST resolve by `attempt_id`, not only `node_id`
- blocked projections remain historical after resolution; unblocking does not overwrite prior blocked rows
- `ready_since_utc` survives projection refresh only while the node remains continuously ready
- attempts from older generations remain queryable but are labeled stale and are never resumable

ContractRef: Plans/Widget_System.md#2. Hostability and data contracts, Plans/FinalGUISpec.md#10.6 Blocked and recovery surfaces

Required fields:
- projection_freshness
- projection_health
- last_projected_at_utc
- projector_lag
- degraded_reason_code
- fallback_policy

Canonical terms and values:
- projection_freshness
- projection_health
- last_projected_at_utc
- projector_lag
- degraded_reason_code
- fallback_policy
- runtime_artifact.*

Labels:
- projection freshness
- projection health
- fallback

Behavioral rules:
- Projection freshness is not the same thing as action authority.
- Projection-backed surfaces must degrade to direct-record views when trust drops.
- Runtime-artifact projections must be rebuildable from canonical seglog events.

Permission carry-through:
- action gating must respect projection trust before surfacing mutation actions
### Snapshot refresh rules
- permission/auth/approval/replan resolution creates a new attempt snapshot; old attempt snapshots remain immutable
- safe-point restore does not mutate the originating attempt record in place; it leads to a new attempt record tied back by lineage
## Runtime Recovery Persistence and Restart Reconciliation Addendum (2026-03-09)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0653
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Runtime Recovery Canonicalization Gate Addendum` appears twice with the same body
  - Runtime Recovery Canonicalization Gate Addendum
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### Restart and stale history
Required fields:
- `historical`
- `archived`
- `removed`
- `projection_freshness`
- `projection_health`
- `historical_lineage_refs[]`
- `worktree_id`
- `lane_id`
- `last_seen_at_utc`
- `owner_run_id`
- `owner_attempt_id`

Rules:
- Restart and cleanup must keep `historical`, `archived`, and `removed` distinct.
- Missing live worktrees or lanes remain historically inspectable instead of disappearing.
- Projection trust remains explicit through `projection_freshness` and `projection_health`.
## Permission Snapshot Storage and Safe-Point Namespace Addendum

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0650
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - command/event namespace unification,
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### Permission snapshot storage

`Plans/storage-plan.md` owns only the durable storage binding for permission snapshots. `Plans/Permissions_System.md` owns the snapshot schema, enums, approval-surface expectations, and blocked-action semantics.

**Canonical storage binding:**
- durable family: `permission_snapshot_record.v1:{project_id}:{snapshot_id}`
- immutable link from attempt state: `attempt_record.permission_snapshot_id`
- projector/query fields MAY cache `blocked_family`, `approval_scope_key`, `approval_target_ref`, and `revalidation_required` for indexing, but they MUST NOT redefine the nested snapshot schema locally

**Rules:**
1. The snapshot record is written before the corresponding attempt becomes durable/dispatchable.
2. The snapshot payload is immutable after creation. Later approval or policy changes create a new snapshot and a new attempt lineage entry; they do not rewrite the old one.
3. Snapshot retention follows attempt lineage and any stronger preservation/hold rule.
4. storage-plan MUST reference the owner-doc schema instead of embedding a competing schema copy.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

### Safe-point vs restore-point namespace separation

Safe points and restore points use distinct storage key prefixes:

| Type | Key prefix | Scope |
|------|-----------|-------|
| Safe point | `sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}` | Runtime-internal, scoped to run/node/attempt |
| Restore point | `rp:{project_id}:{restore_point_id}` | User-facing, scoped to project |

These namespaces MUST NOT overlap. Queries for safe points MUST use the `sp:` prefix; queries for restore points MUST use the `rp:` prefix.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/newfeatures.md, ContractName:Plans/Contracts_V0.md

## Assistant Worktree Binding Storage Addendum
Source Control remains the Git/worktree owner surface.

Rules:
- Storage projections reference the live `Plans/Orchestrator_Page.md#Source Control boundary` heading rather than the stale numbered anchor.
- Worktree-binding persistence remains worktree-first when it hands off to Source Control.
## 8. Web content caching persistence

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- The PM-owned web cache contract must preserve two-phase lookup, state vocabulary, and per-project cache sizing.
- Cache routing must skip read-time cache for requests with actions, may still store the post-action result, and must preserve PM-cache precedence over Firecrawl cache with diff-reuse audit states.

Fields:
- hit
- miss
- bypassed
- expired_used_for_diff
- normalized_url
- formats_hash
- adapter_id
- 500 MB

Rules:
- If request includes `actions`, skip cache entirely (always fresh-execute)
- Cache STORE still applies to the final result after actions execute
- PM cache takes precedence for serving cached content
- Firecrawl cache serves as provider-side optimization only
- `cache_state: "hit" | "miss" | "bypassed" | "expired_used_for_diff"`
