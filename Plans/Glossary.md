# Glossary (Canonical)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum
  - Highest-Impact Docs
  - Cleanup Priorities

#### Source target target-0337
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
  - Highest-Impact Docs
  - Cleanup Priorities
- Exact required items represented:
  - Replace tier-rooted execution with package/seam/lane model
  - Define package overseer + seam overseer roles
  - Add node/package/seam/lane/attempt/effective_identity fields to contracts and storage
  - Redefine gates to package-complete / seam-complete
  - Rename or retire Tiers UI/tab and tier_tree/progress bars
  - Extend Glossary.md, Crosswalk.md, Decision_Policy.md, and 00-plans-index.md with first-class ownership for feature seam, work package, package/seam overseers, promotion class, lane pool, contamination, and effective execution identity.
  - Clarify which docs own [retired-token-11] vs UI-only overlays.
  - `Plans/00-plans-index.md`, `Plans/Crosswalk.md`, `Plans/Glossary.md`
  - Plans/00-plans-index.md
  - Plans/Crosswalk.md
  - Plans/Glossary.md
  - `[retired-token-12]`
  - [retired-token-12]
  - There is not yet one shared semantic glossary for `historical` / `superseded` / `revoked` / `reopened` / `archived` / `removed`.
  - historical
  - superseded
  - revoked
  - reopened
  - archived
  - removed
  - `canonical term system`
  - canonical term system
  - Glossary = canonical short definitions
  - Keep canonical term names stable across Expert and ELI5.
  - Use Glossary as the canonical short-definition inventory.
  - Terms that now need canonical glossary ownership
  - glossary owns short canonical definitions
  - when a more precise canonical term is required
  - `Glossary.md` is still too small and too pre-rewrite to anchor the newer Orchestrator vocabulary.
  - Glossary.md
  - canonical concept definition / glossary entry
  - canonical term names do not change between Expert and ELI5
  - `attention center` exists in the glossary, but there is no concrete payload/schema for attention-center items.
  - attention center
  - `Executor_Protocol.md` still has a broken Glossary forward reference, an incomplete wake-reason set, no real `blocked_reason_code` table, no `blocked_sequence` integration, and no actor/lifecycle model for reviewer/corroboration flows.
  - Executor_Protocol.md
  - blocked_reason_code
  - blocked_sequence
  - missing advertised sections and dead glossary references
  - `Overseer` is currently a dead glossary reference in multiple rewrite-owner docs.
  - Overseer
  - `glossary` and execution-evidence style artifact types remain unregistered in the canonical artifact-type table.
  - glossary
  - multiple adjacent docs cite `Plans/Glossary.md §2` for `Overseer`, but no such entry exists.
  - Plans/Glossary.md §2
  - `attempt` / `attempt_id`, `safe point`, `lane`, `work package`, and related rewrite-era vocabulary still have no Glossary owner.
  - attempt
  - attempt_id
  - safe point
  - lane
  - work package
  - Glossary's broad `effective state` wording now shadows the narrower requested/effective execution-identity model used elsewhere.
  - effective state
  - add missing Glossary entries for rewrite-era terms,
  - with `Plans/Glossary.md` and `Plans/Crosswalk.md` still high-risk due to SSOT routing/term ownership failures.
  - `Glossary.md` is still being cited as the owner of `Overseer` while not defining it, and `effective state` is now clearly too broad to safely stand in for requested/effective runtime identity.
  - runtime nouns like `attempt_id`, `safe_point_id`, `scheduler_lane`, `blocked_sequence`, `provider_attempt_ref`, and handoff/promotion namespaces still lack Glossary ownership.
  - safe_point_id
  - scheduler_lane
  - provider_attempt_ref
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - `Plans/Orchestrator_Page.md` / `Plans/FinalGUISpec.md` / `Plans/Glossary.md`
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
  - `Plans/FinalGUISpec.md`, `Plans/Glossary.md`, `Plans/Orchestrator_Page.md`, `Plans/storage-plan.md`, `Plans/usage-feature.md`
  - Plans/storage-plan.md
  - Plans/usage-feature.md
  - `Plans/Glossary.md` and `Plans/Orchestrator_Page.md` already carry real token/label/behavior blocks, but still lack the required discoverable owner headings in the audited canon clusters.
  - `Plans/Glossary.md:34-67`
  - Plans/Glossary.md:34-67
  - `Plans/Glossary.md:102-126`
  - Plans/Glossary.md:102-126
  - `Plans/Glossary.md` already carries the labels `why it matters`, `what it is not`, and `related concepts`; `gap-006` therefore narrows to missing owner headings and instantiated help-entry rows rather than missing labels.
  - why it matters
  - what it is not
  - related concepts
  - gap-006
  - `Plans/Glossary.md:30-127`
  - Plans/Glossary.md:30-127
  - Wave 1 targeted the structural/survivor subset around `gap-002`, `gap-006`, and `gap-007` (`Plans/UI_Command_Catalog.md`, `Plans/Glossary.md`, `Plans/Orchestrator_Page.md`, `Plans/GitHub_Integration.md`, `Plans/FinalGUISpec.md`) and only reconfirmed the already-recorded missing owner headings plus existing `detached_window`, `result_id`, `restore points`, and the broken `#11. Source Control boundary` reference.
  - gap-002
  - gap-007
  - Plans/UI_Command_Catalog.md
  - Plans/GitHub_Integration.md
  - `Plans/Glossary.md` already carries the required help-entry field template and labels, but still does not have the named `### Orchestrator rewrite terms` / `### Runtime and routing terms` sections or populated help-entry rows.
  - ### Orchestrator rewrite terms
  - ### Runtime and routing terms
  - `Plans/Glossary.md:30-67`
  - Plans/Glossary.md:30-67
  - `Plans/Glossary.md:30-70`
  - Plans/Glossary.md:30-70
  - `gap-006` sharpened: `Plans/Glossary.md` still lacks `### Orchestrator rewrite terms` / `### Runtime and routing terms`, and the live glossary still instantiates terms as two-column `Term | Definition` tables or inline bullets instead of the full help-entry field set (`canonical_name`, `short_definition`, `why_it_matters`, `what_it_is_not`, `common_related_states`, `related_concepts`, `surface_examples`).
  - Term | Definition
  - canonical_name
  - short_definition
  - why_it_matters
  - `Plans/Glossary.md:34-85`
  - Plans/Glossary.md:34-85
  - `gap-006` sharpened: `Plans/Orchestrator_Page.md` history and concern sections still point at the missing `Plans/Glossary.md#Orchestrator rewrite terms` anchor, so the glossary/help blocker now includes live broken consumer references in addition to the missing owner headings and incomplete help-entry structure.
  - Plans/Glossary.md#Orchestrator rewrite terms
  - `Plans/Glossary.md:30-85`
  - Plans/Glossary.md:30-85
  - Wave 1 rechecked `gap-006` and `gap-007` against live glossary and orchestrator docs and only reconfirmed the already-recorded missing glossary/orchestrator owner headings plus the broken `Plans/Glossary.md#Orchestrator rewrite terms` and `Plans/Orchestrator_Page.md#11. Source Control boundary` references.
  - Plans/Orchestrator_Page.md#11. Source Control boundary
  - `Plans/Glossary.md:30-90`
  - Plans/Glossary.md:30-90
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
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_[retired-token-12]_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-061: Glossary and help governance

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0340
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `contextual help system`
  - contextual help system
  - Simple help must simplify explanation, not rename the model.
  - Which concepts need dedicated help entries
  - exact records first, but should still offer concept help links for unfamiliar states/actions
  - contextual help can simplify wording, but must not mutate the underlying semantics
  - Use glossary definitions as the canonical short-definition source for future help entries.
  - Expand `Glossary.md` so it becomes the owner for the stable term list, while longer help entries can explain:
  - Glossary.md
  - Rewrite-era governance and runtime terms still have no canonical glossary owner, even while multiple docs explicitly point readers there.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-061
- Fidelity gap refs: cov-061
- Required fidelity items:
- Exact required item: Define inline help, context help, and canonical help entry layers while keeping canonical term names stable
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-061: Glossary and help governance` exists in `Plans/Glossary.md`.
- Exact acceptance check: The `cov-061` repair states the exact requirement: Define inline help, context help, and canonical help entry layers while keeping canonical term names stable
- Exact acceptance check: The `cov-061` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-194: Help entry template and related-concept clusters

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0341
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `help entry system`
  - help entry system
  - each dedicated help entry should have a small fixed template
  - Good template fields:
  - clicking or hovering a term/badge/state should know whether to show a short tooltip, a richer side explanation, or route to a dedicated help entry
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-194
- Fidelity gap refs: cov-194
- Required fidelity items:
- Exact required item: Define a dedicated help-entry template and related-concept linking clusters
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-194: Help entry template and related-concept clusters` exists in `Plans/Glossary.md`.
- Exact acceptance check: The `cov-194` repair states the exact requirement: Define a dedicated help-entry template and related-concept linking clusters
- Exact acceptance check: The `cov-194` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- CANONICAL TERMINOLOGY

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This glossary defines canonical terms used across plan documents.
It exists to prevent drift and synonym creep.

ContractRef: Primitive:Glossary

---

## 1. Canonical platform name
- **Puppet Master** -- the only correct platform name.
- **legacy naming** -- the only allowed way to refer to older platform naming.

ContractRef: Invariant:INV-010

---

## 2. Core terms

### Orchestrator rewrite terms

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0344
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The rewrite now depends on canonical terms that do not yet have canonical glossary ownership.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- **Execution Unit Context** -- the canonical runtime-facing object that names `execution_unit_id`, `execution_unit_type`, parent lineage, and the `execution_role` that owns execution.
- **Concern Record** -- the durable record for a concern lineage, including `concern_id`, `blocked_episode_id`, `blocked_sequence`, escalation frames, and recovery posture.
- **Trust State** -- the runtime trust decision for whether a route, provider, or mutation surface is readable, writable, degraded, or blocked.
- **Degraded State** -- a temporary runtime condition where read-only inspection may continue but write mutations or resumptions remain gated until recovery clears the degraded posture.
- **Inline Help** -- lightweight help rendered directly beside the active control, row, or blocked state without changing the canonical term name.
- **Context Help** -- a resolved help payload scoped to the active concern, execution context, route target, or inspector surface.
- **Canonical Help Entry** -- the durable help record keyed by canonical concern and state terms; inline help and context help both point back to this entry instead of minting new synonyms.

Use these canonical names verbatim in rewrite docs so execution objects, states, trust semantics, and help layers stay stable across Orchestrator, inspectors, and recovery surfaces.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md

### Runtime and routing terms

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0346
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - search/routing can reuse common routing fields
  - how blocked-owner influences message routing
  - likely routing owner:
  - Promote `project_id`, `attempt_id`, generated/runtime identity routing, and artifact/evidence join fields to first-class owners in the artifact/file/storage docs.
  - project_id
  - attempt_id
  - wrapper-command routing to a canonical target
  - Preserve the current seglog-first / staging-second model from `Project_Output_Artifacts.md`; it aligns well with subject-open routing.
  - Project_Output_Artifacts.md
  - This is one of the most actionable owner fixes found in this routing tranche.
  - `resume_url` does not define a second routing ontology
  - resume_url
  - If `subject_id` expands carelessly, the whole routing model becomes muddy again.
  - subject_id
  - Owner docs already identified in the routing tranche:
  - `Decision_Log.md` and rewrite-root routing gaps
  - Decision_Log.md
  - `rewrite-tie-in-memo.md` first as rewrite-root routing
  - rewrite-tie-in-memo.md
  - `rewrite-tie-in-memo.md` needs explicit rewrite-root routing for:
  - 1. Owner docs and rewrite-root routing
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

**Route Target**: A destination for output or side-effects (file://, github://, workspace://, share://, etc.). Resolved through a cascading resolver and permission checks.

**OpenSubject**: A resource or concern being opened/inspected (file, concern, help_entry, project_state, run, artifact_storage). Normalized into a shared routing model so all surfaces handle them uniformly.

**Runtime Identity**: The execution context including requested_account_id, effective_account_id, execution_role, and account_switch_lineage. Persistent across retries and restarts.

**Account Switch Lineage**: The ordered list of account IDs that the execution has switched through, with metadata (switch_reason, switch_time_utc). Used for recovery and auditing.

**Artifact**: An output or byproduct of execution (log, diff, output, input, trace). Indexed by (concern_id, route_target, artifact_type, timestamp) and tied to the execution unit that produced it.

### Projection freshness and health terms

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0345
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - remove or sharply narrow free-form `health status` wording there
  - health status
  - project-summary freshness should disclose projector trust/freshness separately from the underlying owner state
  - provider/account health snapshots
  - health axis: `healthy | degraded | unavailable`
  - healthy | degraded | unavailable
  - freshness, mutation-risk, or blocked-action preconditions
  - `Architecture_Invariants.md` still lacks concrete invariant ownership for execution-role identity, run-scoped requested/effective snapshots, graph-lock degradation boundaries, projection freshness, blocked/failure classification, role-scoped account-pool contamination, and safe-point vs restore-point immutability rules.
  - Architecture_Invariants.md
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- **Projection Freshness** -- the recency of the projection relative to the live runtime source. It answers "how old is this copy?" and is evaluated with states such as `fresh`, `warm`, `stale`, and `expired`.
- **Projection Health** -- the quality and executability of the projection. It answers "is this state safe and complete enough to act on?" and is evaluated with states such as `healthy`, `degraded`, `blocked`, or `unknown`.
- Action gating uses both axes together: a projection can be fresh-but-unhealthy or healthy-but-stale, and either condition can block a route/open or mutation surface.
- `trust_tier` is reserved for preview/browser semantics such as DOM confidence, scraper provenance, or visual inspection confidence.
- Retire `trust_tier` from action-gating terminology; route/open admissibility and mutations key from `projection_freshness` plus `projection_health` instead.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

### Help architecture and project status terms

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0342
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - At the same time, the canonical model is getting denser, so “simple help” must not mutate the underlying terms or invent alternate semantics.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- **Help Entry Architecture** -- the dedicated help-entry architecture with related-concept linking. Each help entry is keyed by canonical concern/state terms and can expose related concepts without renaming the underlying canon.
- **Project `activity_state`** -- the project-wide activity summary (`planning`, `running`, `waiting`, `blocked`, `cooling_down`, `archived`) that answers what the project is doing now.
- **Project `attention_state`** -- the project-wide urgency summary (`quiet`, `watch`, `needs_attention`, `urgent`) that answers how strongly the project should surface alerts, badges, and resurfacing reminders.
- **Blocked-owner taxonomy** -- the canonical owner classes for who must act next (`runtime_owner`, `approval_owner`, `account_owner`, `route_owner`, `policy_owner`).
- **Escalation ladder** -- the deterministic progression from inline help to context help to canonical help entry to owner-targeted remediation to explicit human escalation.
- **Resurfacing / aging rules** -- the thresholds that age unresolved blockers, raise `attention_state`, and resurface the same help entry until the blocker is resolved, dismissed, or reassigned.

This section defines project `activity_state`, project `attention_state`, blocked-owner taxonomy, escalation ladder, and resurfacing/aging rules so the same vocabulary can be reused across Orchestrator, project inspectors, and help surfaces.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md

### Help-entry template and related-concept clusters

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0343
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Missing help-entry template, related-concept linking, and distinction rules for high-risk term pairs.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

A dedicated help-entry template and related-concept linking cluster uses this canonical shape:

```text
Title
Canonical definition
When this appears
Affected execution context or surface
Recovery steps
Escalation path
Related concepts
Evidence / inspector links
```

Related-concept clusters group help entries by canonical concern/state families such as `auth`, `approval`, `route/open`, `runtime recovery`, and `projection health`. Each cluster keeps durable links between sibling help entries so inline help, context help, and full help views can pivot without inventing new terminology.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md

## 4. Evidence
- **Evidence bundle** -- a structured record of commands/checks/artifacts that demonstrates a requirement is met.

ContractRef: SchemaID:evidence.schema.json

---

## 5. Secret handling

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0339
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - still needs explicit auth/account/role disclosure and thread-level switch/trust handling
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- **Secret** -- any credential/token or material that could authenticate/authorize.
- **Credential store** -- OS-backed keychain/credential manager; the only allowed persistence for secrets.

ContractRef: Invariant:INV-002

---

## 6. Primitives

### DRYRules
The reuse-first methodology and tagging system (`DRY:WIDGET`, `DRY:DATA`, `DRY:FN`, `DRY:HELPER`) used to prevent code duplication. Canonical definition in `Plans/DRY_Rules.md`.

ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md

### PatchPipeline
The Git + PR workflow pipeline covering worktrees, branches, commits, push, and hosting operations. Local git operations are owned by `Plans/WorktreeGitImprovement.md`; hosting operations are owned by `Plans/GitHub_API_Auth_and_Flows.md`.

ContractRef: Primitive:PatchPipeline, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md

### SessionStore
The persistent storage boundary for sessions, runs, events, and artifacts. Implementation uses seglog (append-only event ledger), redb (durable KV state/projections), and Tantivy (full-text search). Secrets are forbidden.

ContractRef: Primitive:SessionStore, ContractName:Plans/storage-plan.md, PolicyRule:no_secrets_in_storage

### InstantGrep
The promoted feature name for transparent regex-grep acceleration. Instant Grep is not a second tool name and not a separate index family; it is the user-facing name for the SparseNgramIndex plus its `grep` and Search-panel integration.

ContractRef: Primitive:SparseNgramIndex, ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md

### SparseNgramIndex
The per-project sparse n-gram regex index that transparently accelerates `grep` and Search-panel regex queries. Build time extracts all sparse n-grams from normalized content; query time extracts only a minimal covering set. Posting lists are Roaring Bitmaps keyed by xxh3 hashes; snapshots live in generation-numbered directories and publish via ArcSwap. The index narrows candidate files only; ripgrep verifies final correctness.

ContractRef: Primitive:SparseNgramIndex, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

### DirtyLayer
The generation-aware in-memory map of dirty paths used by the SparseNgramIndex freshness model. PM-mediated writes update DirtyLayer synchronously before returning success. External file changes arrive via the file watcher. Dirty entries are always considered during verification, and generation-stamped clearing prevents long-running rebuilds from dropping new changes.

ContractRef: Primitive:SparseNgramIndex, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

### SearchDomainSplit
`grep` owns raw regex matching over file content, accelerated by SparseNgramIndex when possible. `codesearch` owns Tantivy and LSP-backed keyword, snippet, and symbol retrieval. File Manager search remains a local tree filter, and LSP symbol/reference surfaces keep their own semantics.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md

## References
- `Plans/Architecture_Invariants.md`
- `Plans/Contracts_V0.md`
- `Plans/Spec_Lock.json`
