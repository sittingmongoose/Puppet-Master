- Authority is still framed too monolithically in several places:
  - policy docs still assume a stronger single "Puppet Master" authority center
  - the rewrite now needs seam/package overseer scopes, blocked-owner attribution, and clearer separation between runtime/system/user authority
- Workflow entry and worktree rules are no longer globally uniform:
  - `chain-wizard-flexibility.md` introduces intent-specific execution modes
  - `ContributePr` explicitly disables tier worktrees and forces single-branch execution
  - adaptive phase planning and contract unification create a broader orchestration-mode matrix than older docs assume
- Canonical invariants are increasingly runtime-object-first:
  - `node_id` / `attempt_id` / `blocked_reason_code` / lane dispatch order / safe points
  - but surrounding policy/HITL/permission docs still frequently reason through tier context and less precise ownership terms

### Impacted docs
- `Plans/Decision_Policy.md`
- `Plans/Permissions_System.md`
- `Plans/Architecture_Invariants.md`
- `Plans/chain-wizard-flexibility.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/Executor_Protocol.md`
- `Plans/human-in-the-loop.md`

### Contradictions / gaps surfaced
- Requested/effective identity is canonical enough to affect policy and permissions now, but those docs still treat it as adjacent detail rather than core decision context.
- `HITLRequest` / blocked-flow thinking still leans on `tier_id` / `tier_type` in places while the runtime increasingly uses `node_id` and attempt-scoped records as the canonical execution anchors.
- `Decision_Policy.md` does not yet explain who can acknowledge concerns, revoke promotions, confirm corroboration outcomes, or own blocked states under the new overseer model.
- `chain-wizard-flexibility.md` creates a real exception to "always use isolated worktrees," meaning worktree policy is now conditional on intent rather than globally uniform.
- Contract unification is treated as deterministic, but the conflict-resolution authority/rules are still underdefined for contradictory upstream phase outputs.

### Candidate fixes to carry forward
- Extend `Decision_Policy.md` with first-class policy objects and transitions for:
  - concerns
  - corroboration
  - promotions
  - superseded/revoked/reopened states
- Require requested/effective identity fields in decision/permission records, not just runtime event records.
- Add architecture invariants for:
  - canonical runtime object families
  - lane scheduler integrity
  - mutation-safe-point enforcement
- Re-anchor blocked/HITL/policy flows on canonical node/attempt identifiers where appropriate.
- Define intent-specific orchestration/worktree modes explicitly, including single-branch exceptions and contract-unification conflict policy.

### Do-not-forget details
- `blocked_reason_code` should remain the SSOT instead of ad hoc blocked strings
- `attempt_id` must stay unique per dispatch; retry/resume should not reuse old attempt ids
- acknowledged concerns must reduce noise without suppressing true blockers
- recovery snapshots in wizard-driven flows need enough intent/wizard-step state to avoid restoring into the wrong execution mode
- this cluster suggests reconciliation risk now lives in authority semantics as much as in storage/schema drift

## Research Progress - 2026-03-16 - Opus broader second-sweep delta cluster (canonical contract drift and native-surface ownership)

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/usage-feature.md`
- `Plans/storage-plan.md`
- `Plans/GitHub_API_Auth_and_Flows.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/GitHub_Integration.md`
- `Plans/Widget_System.md`
- supporting references from `Prompt_Pipeline.md`, `Multi-Account.md`, `FinalGUISpec.md`, `Executor_Protocol.md`, and current ledger findings

### Key findings
- Canonical field-name and schema ownership drift is sharper than the earlier Gemini pass suggested:
  - `Contracts_V0.md` prohibits canonical `requested_persona_id` / `effective_persona_id`
  - but downstream docs still use those names normatively or mix them with canonical names
  - `attempt.started` / usage / storage / auth surfaces still lack one crisp contract for how requested/effective/provider/account identity propagates end to end
- Usage and storage are still under-modeled for the rewrite's runtime object family:
  - `usage-feature.md` remains centered on `tier_id` and omits lane/package/remediation dimensions now present elsewhere
  - `storage-plan.md` still lacks one shared governance-record envelope for concerns/reviews/promotions/corroboration/graph-patch/recovery records
  - `provider_account_id` now looks like a real shadow-identity risk because it appears in usage/storage without canonical contract ownership
- Native-surface ownership is still not reconciled:
  - `Widget_System.md` and `Orchestrator_Page.md` continue to treat multiple Orchestrator tabs as widget-composed
  - Opus strongly reinforces the ledger direction that only `Progress` should remain widget-heavy while Graph / Seams / Evidence / History / Ledger become stronger native surfaces
- Run graph and Orchestrator page docs remain structurally tier-bound:
  - `Run_Graph_View.md` has near-zero awareness of concern/corroboration/promotion/graph-patch/lane/package object families
  - `Orchestrator_Page.md` still specifies `Tiers` and widget/persistence contracts around that obsolete structure
- GitHub-facing docs still lag the identity/runtime rewrite:
  - auth/integration flows model effective GitHub identity weakly or single-account-only
  - cross-surface pivots into Source Control/GitHub still do not carry lane/package/degraded-trust context cleanly

### Impacted docs
- `Plans/Contracts_V0.md`
- `Plans/usage-feature.md`
- `Plans/storage-plan.md`
- `Plans/GitHub_API_Auth_and_Flows.md`
- `Plans/GitHub_Integration.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Widget_System.md`

### Contradictions / gaps surfaced
- Canonical naming conflict:
  - some docs still normalize around `requested_persona_id` / `effective_persona_id`
  - `Contracts_V0.md` explicitly says those are not canonical persisted names
- Identity propagation gap:
  - prompt/runtime resolution records, usage records, auth events, graph detail panels, and artifact views still do not share one obvious identity disclosure contract
- Storage projection gap:
  - event envelope and projected-record families are still structurally separate without one shared governance-record template
  - missing families now matter more because the rewrite depends on concerns, promotions, corroboration, graph patches, and recovery as first-class durable objects
- Widget/native contradiction:
  - widget-hostability and widget-layout persistence still imply non-Progress Orchestrator tabs are widget pages
  - the rewrite direction keeps calling for native specialized tabs instead
- Trust/freshness gap:
  - Opus confirms that widget/page/graph docs still do not make degraded/stale projection states operational enough for mutation gating and historical-run rendering

### Candidate fixes to carry forward
- Normalize all persona/runtime identity field names to the canonical `requested_*` / `effective_*` contract from `Contracts_V0.md`, and remove drifted `_id` variants where they are being treated as canonical names.
- Define a shared requested/effective/provider/account identity disclosure pattern reusable across:
  - auth events
  - usage records
  - graph details
  - artifacts
  - blocked/recovery records
- Add a governance-record template to storage/contracts so concern/review/promotion/corroboration/graph-patch/recovery records stop emerging ad hoc.
- Rework usage/storage attribution around lane/package/seam/attempt/remediation dimensions instead of centering `tier_id`.
- Reclassify Orchestrator surfaces so only `Progress` is widget-composed and move non-Progress tabs onto native view-state contracts.

### Do-not-forget details
- `provider_account_id` needs an explicit relationship to `effective_account_id` / `effective_provider_identity` or it will become a hidden second identity system
- historical-run mode needs to be designed for widgets and graph/page surfaces, not just live mode
- graph patch lineage and concern/promotion visibility are now contract-level omissions, not just UI polish gaps
- GitHub realm isolation still matters; fixing multi-account/runtime identity must not collapse `github_api` and `copilot_github` into one identity bucket
- Opus reinforces that contract naming drift and native-surface ownership are among the highest-risk reconciliation areas

## Research Progress - 2026-03-16 - Sonnet broader second-sweep delta cluster (requested-account asymmetry and event-schema precision)

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/usage-feature.md`
- `Plans/storage-plan.md`
- `Plans/GitHub_API_Auth_and_Flows.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/GitHub_Integration.md`
- `Plans/Widget_System.md`
- supporting references from `Multi-Account.md`, `Prompt_Pipeline.md`, and the current ledger

### Key findings
- Sonnet sharpened the identity problem from "requested vs effective is missing" to a more specific structural asymmetry:
  - canonical contracts expose `requested_account_policy`
  - but not an equally canonical `requested_account_id`
  - several downstream docs therefore cannot represent a user-selected concrete account on the requested side without collapsing it into policy text
- Event-schema precision gaps are wider than the earlier passes suggested:
  - `run.started` / `usage.event` / `hitl.*` / config-validation rows in `storage-plan.md` still under-specify or mis-key the runtime identity and execution anchors they are supposed to carry
  - `safe_point.created`, `scheduler.pass`, and `remediation.resolved` still have multi-addendum field drift inside `Contracts_V0.md`
- GitHub docs have a very specific identity-contract flaw:
  - `login` still acts like a stable key in `GitHub_API_Auth_and_Flows.md`
  - but canonical contracts want stable internal `account_id` plus display-only provider identity
  - the gap is not just "missing multi-account support" but "mutable display identity used as storage/routing anchor"
- Widget/page/native-surface docs still lack operational idle/trust-state detail:
  - `Widget_System.md` has no concrete chrome slot for trust state
  - Dashboard-hosted push widgets still lack a no-active-run/historical-run render contract
  - `Orchestrator_Page.md` still uses tier-era scoping in concrete table/column/widget definitions
- Run Graph remains under-modeled at the command and struct level:
  - Sonnet specifically highlighted missing concern/corroboration/promotion/graph-patch fields, missing trust state, and command-catalog gaps rather than just high-level conceptual absence

### Impacted docs
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/usage-feature.md`
- `Plans/GitHub_API_Auth_and_Flows.md`
- `Plans/GitHub_Integration.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Widget_System.md`

### Contradictions / gaps surfaced
- Requested-side identity gap:
  - canonical contracts have `requested_account_policy` but no robust requested-side concrete account anchor
  - downstream docs therefore improvise or omit requested account selection semantics
- Mutable-key gap:
  - GitHub auth still keys by `login`
  - canonical contracts want stable internal `account_id`
  - username rename risk is now a concrete contract inconsistency, not just a theoretical identity concern
- Event-table vs prose-rule mismatch:
  - storage/contracts often require richer snapshots in prose than they enumerate in their registered field tables
  - this creates an implementation trap where the "official row" is weaker than the surrounding normative text
- Native-surface precision gap:
  - non-Progress Orchestrator tabs remain described partly as widget pages and partly as deeper native surfaces
  - widget commands and persistence keys still do not clearly enforce the native-tab boundary
- Historical/degraded-mode gap:
  - Sonnet reinforces that historical-run rendering, idle widget rendering, and degraded projection gating are still missing from the surface-level specs rather than only from storage docs

### Candidate fixes to carry forward
- Add a canonical requested-side concrete account field or explicit equivalent rule wherever user-selected account pinning must be represented.
- Reconcile event-table rows with the richer prose MUSTs for:
  - `run.started`
  - `usage.event`
  - `hitl.*`
  - related runtime/config validation events
- Replace mutable display identities like GitHub `login` as storage keys with stable internal account ids while keeping display identities audit-only.
- Add explicit trust/idle/historical rendering contracts to widget/page specs, including a chrome-level trust indicator and no-active-run states for Dashboard-hosted push widgets.
- Tighten Run Graph and Orchestrator page schemas around canonical runtime objects (`node_id`, `attempt_id`, `lane_id`, `seam_id`, `package_id`) and add the missing governance object hooks/commands.

### Do-not-forget details
- `provider_account_id` remains risky because Sonnet reinforces that it still conflicts conceptually with `effective_provider_identity`
- command payloads with generic `page: string` or tier-bound filters will quietly undermine any native-surface cleanup if they are not constrained at the same time
- the GitHub realm split is still correct; the fix is stable account identity inside each realm, not realm collapse
- event/addendum supersession should be explicit enough that implementers do not need to diff three addenda to know the final field set
- Sonnet adds important precision but mostly confirms the same hotspot docs; those remain the right focus for GPT-5.4 / GPT-5.2 / GPT-5.3-Codex next
