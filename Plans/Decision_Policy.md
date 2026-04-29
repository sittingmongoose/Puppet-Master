# Decision Policy (Canonical)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum
  - Highest-Impact Docs
  - Cleanup Priorities

#### Source target target-0178
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
  - Settings scopes are still too coarse.** Global/project toggles are common, but package/seam/lane/run/account-aware settings or policy scopes are mostly absent.
  - Contamination policy is still a vocabulary gap.** Safe-point language exists in newer addenda, but contamination classification, restore-before-reuse, and lane quarantine semantics are mostly absent from the main SCM/worktree contracts.
  - Why it matters: SCM, Source Control UI, Orchestrator UI, and recovery policy all depend on it, but no single canonical lane-pool model exists yet.
  - what likely new model pressure is: package-based lane pools, contamination quarantine, restore-before-reuse policy, Source Control plus Orchestrator shared visibility.
  - why it matters: define package-based lane-pool worktree policy end-to-end, including contamination, safe-point, restore, and visibility rules shared by Orchestrator and Source Control.
  - What is still missing is an explicit shared trust policy for all projection-backed surfaces, especially Orchestrator tabs.
  - `archived` is visibility/operational-surface policy
  - archived
  - archival policy should be separate from semantic validity
  - Keep visibility policy (`archived`, hidden from default lists) separate from semantic state (`historical`, `revoked`, `superseded`).
  - historical
  - revoked
  - superseded
  - What is missing is a shared policy for Orchestrator/runtime actions specifically.
  - This may help avoid every major object family inventing bespoke "decision summary" fields.
  - `Inherited from Project policy`
  - Inherited from Project policy
  - account policy
  - requested platform/model/variant/auth/account policy
  - Worker policy likely needs the same treatment:
  - requested account policy is not the same as effective account
  - `Account policy: Auto switch (Project policy)`
  - Account policy: Auto switch (Project policy)
  - Extend the same model to worker policy, not just provider/model/persona/account.
  - The exact persona ids may still evolve, but the mapping policy should be explicit now.
  - `FinalGUISpec.md` has scattered virtualization/pagination language for other surfaces, but not an Orchestrator-wide large-run policy.
  - FinalGUISpec.md
  - What is still missing is a rewrite-specific action policy for:
  - The command infrastructure is ahead of the Orchestrator-specific safety policy.
  - What is still missing is a shared Orchestrator-wide execution policy for:
  - Current docs establish canonical vs derived storage, but not the UI policy that follows from that distinction.
  - This seam connects directly to the earlier confirmation policy:
  - What was still missing was the interaction policy:
  - usually operational surfaces first, with user escalation only if persistence or decision need crosses threshold
  - Current docs define many notification pieces, but not enough of the interaction policy between concern state, blocked ownership, and projection trust.
  - `Plans/Decision_Policy.md`
  - Plans/Decision_Policy.md
  - Requested/effective identity is canonical enough to affect policy and permissions now, but those docs still treat it as adjacent detail rather than core decision context.
  - Define intent-specific orchestration/worktree modes explicitly, including single-branch exceptions and contract-unification conflict policy.
  - several downstream docs therefore cannot represent a user-selected concrete account on the requested side without collapsing it into policy text
  - concern actions should NOT inherit that policy because concerns are canonical operational/governance records rather than ephemeral layout state
  - `merge` / `split` / `supersede` without dedicated action policy will create silent lineage ambiguity
  - merge
  - split
  - supersede
  - Add a canonical concern action policy table with at least:
  - `provider_accounts.run_snapshot` still stores only an opaque `policy_hash` rather than a queryable policy version/ref
  - provider_accounts.run_snapshot
  - policy_hash
  - strongest policy owner, but still missing switch-history records, queryable snapshot lineage, and a canonical requested-side account identifier
  - `storage-plan.md` already has `selected_repo_id` and project-scoped `provider_accounts.*` policy state
  - storage-plan.md
  - selected_repo_id
  - provider_accounts.*
  - `GitHub_Integration.md` still lacks an explicit current-repo / current-account contract even though `storage-plan.md` already models `selected_repo_id` and project-scoped account policy state.
  - GitHub_Integration.md
  - this decision applies to Orchestrator `Progress`; it does not automatically decide the final persistence rule for Usage or Dashboard
  - Progress
  - still strongest policy owner, but its “no design-open questions remain” claim is now contradicted by unresolved requested-account/history/trust ownership across adjacent SSOTs
  - one canonical decision for requested concrete-account representation
  - one canonical decision for operational identity / execution role disclosure
  - one canonical decision for projection-freshness vocabulary and owner doc
  - `manual_preferred_account_id` in project policy is not enough.
  - manual_preferred_account_id
  - a run snapshot needs to preserve the requested-side decision after policy has been frozen
  - Current canonical wording implies requested-side truth can be explained with policy alone, which is no longer sufficient.
  - The **operational identity** addendum is now a real schema gap, not just a policy note:
  - Role-scoped account policy exists, but the eventual runtime records still do not expose the winning role dimension cleanly.
  - `account_switch_event` records the actual routing change or failed-switch decision
  - account_switch_event
  - a failed or blocked switch decision is still historically important even when the effective account did not change
  - still needs CUP governance, handoff identity completeness, and explicit isolation/worktree policy fields
  - Wizard handoff still leaves identity/worktree policy implicit where the rewrite now needs them explicit.
  - `Multi-Account.md` should own policy, selection rules, provider capability posture, and account-routing semantics
  - Multi-Account.md
  - own selection policy and role/account precedence rules
  - the important split is blocked-episode approval versus session-wide policy; the docs still do not formalize that boundary
  - Add explicit wizard/runtime lineage and isolation policy fields so CUP, validation passes, wizard handoff, Orchestrator receipts, and Source Control all share one auditable chain.
  - `execution_role` is now visibly required by multi-account routing policy, yet it is still absent from canonical effective-resolution/runtime snapshot families.
  - execution_role
  - pre-run lineage and worktree/isolation policy are still too ambiguous for deterministic audit.
  - Recommended owner decision
  - Boundary / term / policy owner docs are also lagging the rewrite:
  - Reconcile reserved slash-command override policy into one canonical rule and register all real `cmd.chat.*` / `cmd.orchestrator.*` IDs in the catalog before more UI wiring lands.
  - cmd.chat.*
  - cmd.orchestrator.*
  - It should consume canonical execution/runtime context by reference and keep only selection/decomposition helpers that are local to subagent policy.
  - This object is allowed to stay tier-shaped if the integration policy still wants [retired-token-8]/iteration selectors, but it should no longer pretend to be the canonical runtime context.
  - these fields identify the concrete execution unit and the scheduler decision that produced it
  - `Multi-Account.md` already makes execution-role-aware routing canonical through role-by-provider and role-by-account policy, but the runtime event/attempt packets still do not carry an explicit `execution_role`.
  - retry/backoff policy is now more clearly blocked on counter-family ownership because `retry_count` is display-only yet policy wording still acts like a generic “attempts” ceiling is enough.
  - retry_count
  - reserved-name policy remains split across command-system, chat-design, and command-catalog owners with no single enforceable boundary.
  - counter-family ownership is clearer, but backoff shape remains unowned and policy still needs to bind ceilings to canonical stored counters, not generic “attempts.”
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - plan-mode tooling policy still denies `lsp` even though LSP context is assumed for planning/interview features.
  - lsp
  - `Formatters_System.md` still conflicts with LSP formatting ownership, has no DAE reconciliation semantics for formatter writes, bypasses FileSafe/tool policy for custom formatter commands, and defines unregistered `format.*` / `file.edited` event families.
  - Formatters_System.md
  - format.*
  - file.edited
  - Treat this as a persistence-contract decision, not as appendix-level wording trivia.
  - `Plugins_System.md` still contains a concrete post-permission mutation bypass, TOML namespace collisions for plugin tool IDs, and mutation-capable mode bypass risk when policy keys remain name-based.
  - Plugins_System.md
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - If tier-level settings remain as user-facing configuration, they need to be reframed as approval-trigger policy, not as canonical approval object identity.
  - provider-account policy and requested/effective identity fields are closer to the rewrite direction than several consumer docs
  - UI/behavior docs often contain the top-level statement, but not the **operational policy layer** implementation agents would need.
  - Missing the fuller blocked-owner taxonomy, resurfacing/aging rules, concern action policy details, projection fallback ladder, saved-view / sort-default behavior, historical-mode behavior, search scope/switch disclosure, and dense-tab scale rules.
  - Missing shared escalation ladder semantics, system-notification narrowing rules, project-card blocked-owner / primary-reason / pressure-summary details, settings display grammar, help-system structure, and action-surface / shortcut / context-menu policy.
  - `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/Decision_Policy.md`, `Plans/FinalGUISpec.md`
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
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

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- DETERMINISTIC DECISION POLICY

Goal: remove deferred-decision ambiguity by defining deterministic defaults.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This policy applies whenever a plan or implementation encounters an ambiguity that is not resolved by Spec Lock, Crosswalk, DRY Rules, or Glossary.

ContractRef: PolicyRule:Decision_Policy.md

---

## 1. Precedence (non-negotiable)
Resolve ambiguity in this order:
1. `Plans/Spec_Lock.json`
2. `Plans/Crosswalk.md`
3. `Plans/DRY_Rules.md`
4. `Plans/Glossary.md`
5. This policy

ContractRef: SchemaID:Spec_Lock.json

---

<a id="2"></a>
## 2. Deterministic defaults (must be autonomous)
When multiple valid choices exist and higher-precedence sources do not decide:

1) **Prefer the simplest safe default** that does not expand scope.
   - Example: choose a single host (GitHub.com) rather than adding multi-host abstractions.

2) **Prefer API-only over CLI subprocesses** when both are possible and Spec Lock forbids the CLI.

3) **Prefer idempotent behavior**.
   - If an operation can be repeated safely, implement it as idempotent (no double-side-effects).

4) **Prefer bounded retries**.
   - Retries MUST have explicit limits and backoff.
   ContractRef: PolicyRule:Decision_Policy.md§2

5) **Prefer stable IDs over inferred labels**.
    - UI commands use `cmd.*` IDs; event types use stable `type` strings.

6) **Prefer redaction**.
   - If data might be a secret, treat it as a secret and do not persist it.

ContractRef: Invariant:INV-002, SchemaID:Spec_Lock.json#github_operations

---

## 3. Tie-break rules (ordering)
If two choices are otherwise equal:
- Choose the option that is already referenced by an existing plan document.
- If still tied, choose lexicographically smallest stable ID.

ContractRef: PolicyRule:Decision_Policy.md§2

### 3.1 Autonomous decision logging contract

When Puppet Master resolves an ambiguity without human input, it MUST emit exactly one schema-valid auto-decision row for that resolved ambiguity.

ContractRef: SchemaID:pm.auto_decisions.schema.v1, PolicyRule:Decision_Policy.md§2

Two logging scopes exist:
- `Plans/auto_decisions.jsonl` — internal Puppet Master plan-governance decisions.
- `.puppet-master/project/auto_decisions.jsonl` — user-project decisions made while generating or validating project artifacts.

Path selection rule:
- If the decision changes or explains Puppet Master internal SSOT documents, write to `Plans/auto_decisions.jsonl`.
- If the decision changes or explains generated user-project artifacts under `.puppet-master/project/**`, write to `.puppet-master/project/auto_decisions.jsonl`.

Field semantics:
- `scope` MUST identify the decision domain deterministically.
- `inputs_hash` MUST be computed from the ambiguity inputs actually used to make the choice, using a deterministic byte representation chosen by the owning subsystem.
- `decision` MUST name the winning choice in stable language.
- `rationale` MUST state why the winning choice was required by the precedence stack or deterministic defaults.
- `applied_to[]` MUST identify the concrete targets affected by the decision.
- `contract_refs[]` MUST include the authoritative references that justified the choice.

Security rule:
- Auto-decision rows MUST NOT contain secrets or credential material in `decision`, `rationale`, or `applied_to[]`.

ContractRef: SchemaID:pm.auto_decisions.schema.v1, PolicyRule:Decision_Policy.md§1, PolicyRule:no_secrets_in_storage, Invariant:INV-002

---

## 4. "No human in the loop" rule
Plans MUST NOT depend on humans making decisions mid-run.
If a plan describes optionality, it MUST declare a deterministic default and cite this policy.

ContractRef: PolicyRule:Decision_Policy.md§2

---

<a id="spec-lock-update-protocol"></a>
## 5. SpecLock Update Protocol (autonomous; no human readers)

**Rule:** `Plans/Spec_Lock.json` is a lockfile; agents MUST only update it via this protocol and MUST proceed deterministically (no interactive human-decision pauses; deterministic logging remains required where this protocol says to append to `auto_decisions.jsonl`).
ContractRef: SchemaID:Spec_Lock.json, PolicyRule:Decision_Policy.md§2, SchemaID:pm.auto_decisions.schema.v1

### 5.1 When Spec Lock updates are allowed

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0185
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - allowed on `[retired-token-2]`, often allowed on `[retired-token-3]`, sometimes allowed on `[retired-token-1]`
  - [retired-token-2]
  - [retired-token-3]
  - [retired-token-1]
  - usually allowed if the target object identity is still valid
  - `project_summary` is current-state only and overwritten by projector updates
  - project_summary
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_[retired-token-3]_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Spec Lock updates are allowed only when at least one locked invariant/decision must change to satisfy a higher-level requirement (e.g., a new official toolkit version, a required auth scope change).  
ContractRef: SchemaID:Spec_Lock.json

### 5.2 Required steps (deterministic)
When an update is required, agents MUST:
1. Update `Plans/Spec_Lock.json` fields (no partial updates).  
   ContractRef: SchemaID:Spec_Lock.json, PolicyRule:Decision_Policy.md#spec-lock-update-protocol
2. Recompute and update `canonical_ssot_hashes[*].sha256` for every SSOT file listed in Spec Lock.  
   ContractRef: SchemaID:Spec_Lock.json#canonical_ssot_hashes
3. Append one JSONL row to `Plans/auto_decisions.jsonl` describing the change and its deterministic rationale.  
   ContractRef: SchemaID:auto_decisions.schema.json, PolicyRule:Decision_Policy.md#spec-lock-update-protocol
4. Produce an evidence bundle for the update (schema-valid) and run the verifier gates.  
   ContractRef: SchemaID:evidence.schema.json, Gate:GATE-001, PolicyRule:Decision_Policy.md#spec-lock-update-protocol

### 5.3 Prohibited update behaviors
Agents MUST NOT:
- add `TBD` / `Open Questions` / `ask later` language as part of a Spec Lock update  
  ContractRef: ContractName:Plans/DRY_Rules.md#4
- leave hashes stale after changing SSOT docs  
  ContractRef: SchemaID:Spec_Lock.json#canonical_ssot_hashes

---

### PolicyRule: no_secrets_in_storage

**Scope:** All persistent stores (seglog, redb, Tantivy indexes).

**Rule:** Persistent stores MUST NOT contain secrets (tokens, passwords, API keys, OAuth refresh tokens). Tokens live only in the OS credential store (platform keyring). Violations are P0 bugs requiring immediate remediation.

**Rationale:** Secrets in persistent stores risk exfiltration via backup, log export, or crash dump. The OS credential store provides encrypted, access-controlled storage.

**Cross-references:**
- Architecture_Invariants.md#INV-002
- Crosswalk.md §3.5 (SessionStore rules)
- Crosswalk.md §3.6 (AuthState rules: "Tokens MUST NOT be persisted in AuthState")

ContractRef: PolicyRule:no_secrets_in_storage, Plans/Architecture_Invariants.md#INV-002

---

<a id="6"></a>
## 6. Ambiguity vs. Missing User Intent

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0179
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - red = missing directory / corrupt repo / critical config errors
  - whether something actually needs user or operator action
  - no unresolved conflict workflow the user still needs to inspect
  - owner is effectively the user
  - Sonnet specifically highlighted missing concern/corroboration/promotion/graph-patch fields, missing trust state, and command-catalog gaps rather than just high-level conceptual absence
  - That missing depth model matters more now because several concepts are easy to misuse if reduced to a one-line tooltip:
  - historical-only projects should still have a current `project_summary` row; their activity state is neutral, not missing
  - project_summary
  - missing role/actor dimension in effective/runtime records
  - A second missing dimension is `execution_role` / `actor_role`.
  - execution_role
  - actor_role
  - The remaining unresolved seams now look less like “missing content” and more like “owner mismatch”.
  - Sonnet confirms the downstream cohort still contains enough high-signal drift that stopping at Opus+Sonnet would leave the user’s requested multi-model breadth visibly unfinished.
  - envelope/schema-family ambiguity and missing attempt-key ownership still block deterministic drill-through.
  - `Orchestrator_Page.md` currently advertises a missing section; that is a spec-integrity problem, not only a content gap.
  - Orchestrator_Page.md
  - The missing fields are now fairly clear:
  - still-structural gaps** where canonical model/owner decisions are still missing
  - reject when `project_id` is missing
  - project_id
  - remaining issues are increasingly exact structural mismatches rather than missing concepts
  - Do **not** treat these as missing transfer:
  - The rerun did **not** overturn the prior conclusion that the major issue is incomplete ledger transfer rather than missing whole primitives.
  - some earlier baseline framing implied a fully new trust-state model was missing; the stronger reading is that the **operationalization** of trust states is missing, not the base freshness/health model itself.
  - major missing material is still concentrated in:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### 6.1 Ambiguity (multiple valid choices)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0186
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Multiple "owner-of-owners" docs (`[retired-token-2]`, `[retired-token-6]`, `[retired-token-4]`, `[retired-token-5]`, `[retired-token-3]`, `[retired-token-1]`) are stale enough that they amplify downstream drift rather than containing it.
  - [retired-token-2]
  - [retired-token-6]
  - [retired-token-4]
  - [retired-token-5]
  - [retired-token-3]
  - [retired-token-1]
  - `subject_id` routes are valid for content subjects only.
  - subject_id
  - `object_kind` routes are valid for non-subject objects only.
  - object_kind
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

**Definition:** The specification leaves open a technical or design choice where multiple options would equally satisfy user intent.

**Resolution rule:** Apply a deterministic default from §2. Log to `Plans/auto_decisions.jsonl` with schema `pm.auto_decisions.schema.v1`. No user interaction required.

**Examples:**
- Choosing a buffer size
- Picking a retry count
- Selecting a color within a brand palette

ContractRef: `PolicyRule:Decision_Policy.md§2`, `SchemaID:auto_decisions.schema.json`

---

### 6.2 Missing User Intent / Insufficient Specification

**Definition:** The user has not expressed what they want — the system cannot infer intent because the choice materially affects product behavior or scope. This is NOT a technical implementation detail; it is a product decision only the user can make.

**Resolution rule:** The system MUST generate a clarification question. It MUST NOT apply a deterministic default. The clarification question is captured in the requirements quality report (`Plans/requirements_quality_report.schema.json`, field `needs_user_clarification[]`).

**Examples:**
- "Should the wizard allow importing from a URL or only local files?"
- "Should failed iterations retry automatically or pause for user review?"

ContractRef: `SchemaID:pm.requirements_quality_report.schema.v1`, `PolicyRule:Decision_Policy.md§4`

---

### 6.3 Interaction with the "No Human in the Loop" Rule (§4)

The §4 rule ("plans must not depend on humans making decisions mid-run") applies to **runtime execution** (orchestrator runs, agent iterations, verification gates).

Clarification questions under §6.2 are generated **prior to execution**, during wizard/interview artifact generation. This does NOT violate §4.

**Timing:** Clarification questions surface during Chain Wizard or Interview phase, before any orchestrator run begins.

**Blocking rule:** If a clarification question cannot be resolved before an orchestrator run begins, the run MUST NOT start. The wizard state transitions to `attention_required` and blocks the "Start Run" action.

ContractRef: `PolicyRule:Decision_Policy.md§4`, `ContractName:Plans/chain-wizard-flexibility.md`

---

### 6.4 Requirements quality report boundary, severity, and persistence

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0187
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - unresolved conditions should resurface based on severity and persistence, not on every heartbeat/update
  - concern severity + blocking effect + owner + persistence decide escalation
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The `requirements_quality_report` is a pre-execution artifact. It MUST be generated during the mandatory validation sweep defined in `Plans/chain-wizard-flexibility.md §12` after Contract Unification and before any orchestrator run, plan-node execution, or user-visible "Start Run" action begins.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, ContractName:Plans/chain-wizard-flexibility.md

Blocking rule:
- Execution MAY continue only when the latest canonical report has `verdict: "PASS"` and `needs_user_clarification[]` is empty.
- If `needs_user_clarification[]` is non-empty, the workflow MUST transition to the clarification/escalation path instead of starting execution.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, PolicyRule:Decision_Policy.md§4

Deterministic severity rules:
- `missing_scenarios`, `missing_boundary`, `missing_anchor`, `missing_acceptance`, and `missing_research` are always `blocking`.
- `contradiction` is `blocking` when it changes product behavior, acceptance expectations, or contract/plan routing; otherwise it MAY be `warning` only when a deterministic autofix resolves it fully.
- `vagueness` is `blocking` when it prevents executable acceptance, boundary declaration, or user-intent resolution; otherwise it MAY be `warning`.

Persistence safety rule:
- Before persisting `description`, `before`, `after`, `context`, or `question` fields in the quality report, Puppet Master MUST redact secret-like values and MUST NOT copy credentials or tokens into the artifact.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, PolicyRule:no_secrets_in_storage

Lifecycle note:
- Clarification-round limits and `blocked` transition semantics are owned by `Plans/chain-wizard-flexibility.md §15`; this section defines the pre-execution boundary and severity rules only.

ContractRef: SchemaID:pm.requirements_quality_report.schema.v1, PolicyRule:Decision_Policy.md§4, PolicyRule:no_secrets_in_storage, Invariant:INV-002, ContractName:Plans/chain-wizard-flexibility.md#12-three-pass-canonical-validation-workflow-mandatory-invariant-sweep

## Runtime Decision Rules Addendum (2026-03-08)

### 1. No hidden orchestration fallbacks

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0181
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - orchestration identity:
  - `provider_account_id` needs an explicit relationship to `effective_account_id` / `effective_provider_identity` or it will become a hidden second identity system
  - provider_account_id
  - effective_account_id
  - effective_provider_identity
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Runtime and consumer docs must not preserve tier-era or request-era canon as silent fallback behavior once replacement canon is locked.

ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Crosswalk.md

### 2. Deterministic blocked and approval identity

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0182
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - whether the approval is specific to one blocked episode vs reusable session policy
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Blocked and approval decisions resolve through runtime blocked episodes.

Rules:
- blocked actions target `run_id`, `node_id`, `blocked_sequence`, and `attempt_id?`
- `request_id` is lineage/compatibility only
- `allowed_action_ids[]` is canonical

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/UI_Command_Catalog.md

### 3. No silent runtime identity collapse

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0183
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - These should not collapse into a generic "old" state.
  - `History` and `Ledger` especially need precise help because they are easy to collapse into one generic “past activity” concept
  - History
  - Ledger
  - those are not the same thing and should not collapse
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Provider/account identity, execution role, and operational identity remain distinct.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md

### 4. Projection-state action policy
Mutating actions must not rely silently on stale or degraded projections.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FinalGUISpec.md
## Runtime Recovery Deterministic Defaults Reconciliation Addendum (2026-03-09)

Where higher-precedence sources do not decide, use these defaults:
- scored event-driven scheduling is the default runtime model
- canonical event names and enum families from `Plans/Contracts_V0.md` win over older aliases
- `watchdog_recheck` may emit redundant wakeups defensively, but MUST NOT become the primary correctness path
  ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md
- no critical-path scheduler term in MVP
- blind retry is forbidden
- default retry ceiling remains `3` attempts unless a higher-precedence contract narrows it
- default remediation ceiling remains `3` generations unless a higher-precedence contract narrows it
- blocked outcomes preserve completed local work by default when execution stopped because a prerequisite or remote side effect was unresolved
- prerequisite resolution always creates a new attempt snapshot rather than mutating an old one in place
- draft decomposition may degrade only before graph lock
- canonical graph integrity failures do not degrade silently

Where earlier policy prose is ambiguous, these defaults win.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md
## Canonical Runtime Recovery Matrix Completion

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0180
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - seam/package completion truth
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### Additional blocked rows
| classifier family | classifier | automatic next step | counter family | backoff | requires safe-point restore | remediation | terminal / escalation |
|---|---|---|---|---|---|---|---|
| `blocked_reason_code` | `validation_blocked` | wait for corrected input or explicit user action | `manual_resume_count` | none | no | optional | remain blocked |
| `blocked_reason_code` | `remediation_ceiling_exceeded` | no automatic retry | none | none | no | no | remain blocked until replan, manual fix, or abort |
| `blocked_reason_code` | `worktree_conflict` | wait for conflict resolution | `manual_resume_count` | none | maybe | no | remain blocked |
| `blocked_reason_code` | `dirty_worktree` | wait for cleanup or restore action | `manual_resume_count` | none | maybe | no | remain blocked |
| `blocked_reason_code` | `plugin_hook_blocked` | wait for hook resolution or explicit override action | `manual_resume_count` | none | no | no | remain blocked |

### Timeout normalization
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md
`tool_outcome = timed_out` MUST first normalize to `failure_class = provider_transient`, then follow the canonical provider-transient row.
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md

### Field-level override

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0188
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - source: project/package/node override source
  - provider-gap disclosure (`honored` / `skipped` / `clamped`) is a third concept, not just another word for override
  - honored
  - skipped
  - clamped
  - MUST override:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
When a blocked payload sets `requires_safe_point_restore = true`, that field overrides the row-default rerun path.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/FileSafe.md

## Source Control, GitHub Actions, and Docker Manager Blocked-State Addendum (2026-03-12)

Additional deterministic blocked defaults for this packet:

| blocked trigger | default posture | required user-visible effect |
|---|---|---|
| `worktree_conflict` | remain blocked until resolution | show Source Control recovery CTA |
| `dirty_worktree` | remain blocked until cleanup or restore action | show Source Control recovery CTA |
| `failure_class = auth_expired` for GitHub-hosted Actions admin/run actions when refresh cannot recover | remain blocked until auth refresh | show GitHub Actions recovery CTA |
| `external_side_effect_blocked` for Docker repo create/push/template push | remain blocked until approval or explicit decline | preserve local build/publish result |
| Kubernetes apply/exec/port-forward prerequisite block | remain blocked until context/prerequisite resolves | show Docker Manager Kubernetes CTA |

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Containers_Registry_and_Unraid.md
