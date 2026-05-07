- Codex confirmed the sharpest provider-side contract bug is still the **OpenCode `thread_id` collision**:
  - canonical `thread_id` remains PM correlation
  - OpenCode session ID is still being treated as if it were that canonical field
  - this must move into provider-native correlation before shared-runtime event joins become trustworthy
- The provider boundary still lacks a legal place for rewrite-era correlation and pressure semantics:
  - bridged envelopes remain thinner than their own addenda
  - A2A still forbids new categories while the rewrite needs actor/role/account/switch/trust signals at the stream layer
  - `provider_attempt_ref?` and similar continuity fields are still conceptually present but not fully owned by a stable schema slot
- Codex added a stronger **permission semantics contradiction**:
  - `ask/plan -> deny` for mutating tools still conflicts with `external_publish_side_effect` being a non-bypassable ask/approval path
  - until reconciled, remote side-effect approval behavior can diverge by surface or mode
- Permission control is still unsafe for parallel actors unless it gets a canonical scope key:
  - `always`, reject-cascade, and doom-loop behavior still hinge on vague “same session” semantics
  - shared-runtime actors, lanes, and accounts now make that ambiguity a correctness bug, not just a UX rough edge
- Permission snapshots remain thinner than rewrite needs:
  - requested/effective capability state is required conceptually
  - but snapshots still omit requested values, downgrade reasons, effective account/operational identity, and actor/surface scope
  - this leaves blocked overlays unable to explain who/what would have executed the side effect under the final runtime identity model

### Highest-risk impacted docs
- `Plans/Provider_OpenCode.md`
  - needs immediate correction of canonical/session identity ownership
- `Plans/CLI_Bridged_Providers.md`
  - needs a versioned correlation/context block and account-health semantics stronger than auth lifecycle alone
- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`
  - needs stream version governance before actor/account/trust semantics can be added cleanly
- `Plans/Permissions_System.md`
  - needs scope-keyed approval semantics and richer permission snapshots
- `Plans/Contracts_V0.md` + `Plans/storage-plan.md`
  - likely owners for canonical blocked/approval identity linkage and pressure/switch projection families

### Contradictions / gaps surfaced
- OpenCode still misuses canonical `thread_id` for provider-native session identity.
- Bridged contracts still cannot legally carry all correlation/account/trust metadata their addenda already imply.
- A2A still blocks clean category growth despite rewrite-era semantics needing first-class stream representation.
- Permission mode override semantics still conflict on remote side effects.
- Permission approval caching and reject-cascade still lack actor/lane/account scope.
- Permission snapshots still do not project requested/effective identity richly enough for blocked/approval truth.

### Candidate fixes to carry forward
- Move OpenCode session IDs into provider-native correlation fields.
- Add a versioned stream/provider correlation block for actor/attempt/account/trust metadata.
- Reconcile `ask/plan` and `external_publish_side_effect` semantics in one canonical algorithm.
- Define an Approval Scope Key spanning actor/lane/run/account context.
- Upgrade permission snapshots to carry requested/effective values, downgrade reasons, and identity context.
- Add explicit versioning/migration notes where A2A or bridged categories/fields must grow.

### Do-not-forget details
- `origin` must remain audit-only even after actor identity becomes first-class elsewhere.
- Provider continuity can stay opaque, but only if opacity is explicit and projected as such.
- Blocked/approval truth and account/pressure truth are now intertwined; fixing one without the other will still leave misleading surfaces.

## Research Progress - 2026-03-16 - operational identity and actor-role disclosure cluster

### Targeted docs read
- `Plans/Multi-Account.md`
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/usage-feature.md`
- `Plans/Orchestrator_Page.md`

### Key findings
- `Multi-Account.md` already contains the key insight in its operational-identity addendum:
  - provider account identity is not enough
  - the system also needs operational identity classes like GitHub API identity, registry/namespace identity, and Kubernetes context/cluster identity
- But that distinction is still not carried into the shared runtime snapshot.
  - current canonical fields cover provider/model/auth/account identity
  - they do not yet expose the non-provider operational identities that live on top of or beside those credentials
- A second missing dimension is `execution_role` / `actor_role`.
  - role-scoped pools already exist in policy/storage via `allowed_roles?` and `disallowed_roles?`
  - but the shared effective-resolution/runtime records and usage records still do not identify which role actually executed the attempt/message
- Those two gaps are related but distinct:
  - `execution_role` explains who the runtime actor was
  - `operational_identity` explains which side-effect identity or target context the action used
- Current fields like `effective_project_id` or receipt refs do not solve this.
  - they are useful correlation fields
  - but they do not make the requested vs effective operational identity visible as first-class runtime truth

### Recommended contract direction
- Extend the shared effective-resolution/runtime identity model with:
  - `execution_role`
  - `requested_operational_identity?`
  - `effective_operational_identity?`
- Recommended `execution_role` examples:
  - `assistant`
  - `interviewer`
  - `requirements_builder`
  - `prd_builder`
  - `package_overseer`
  - `seam_overseer`
  - `node_worker`
  - `reviewer`
  - `corroborator`
  - `recovery_actor`
- Recommended operational-identity shape:
  - `kind`
  - `requested_ref?`
  - `effective_ref?`
  - `selection_reason?`
  - `partial_capability?`
- Recommended operational-identity kinds:
  - `github_api_account`
  - `registry_namespace`
  - `kubernetes_context`
  - future provider/surface-specific kinds as needed
- Rule:
  - operational identity may be displayed alongside provider/account identity
  - but it must not be implied to share the same ownership or token source unless the owning auth contract says so

### Impacted docs
- `Plans/Multi-Account.md`
- `Plans/Contracts_V0.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/storage-plan.md`
- `Plans/usage-feature.md`
- consumer docs for graph/detail/history/ledger/runtime inspectors

### Contradictions / gaps surfaced
- Current runtime snapshots can explain which provider account was used, but not which operational identity the action was actually aimed at.
- Role-scoped account policy exists, but the eventual runtime records still do not expose the winning role dimension cleanly.
- Usage and receipt surfaces can correlate to external systems via refs, but that is weaker than first-class requested/effective operational identity disclosure.
- Without a dedicated operational-identity layer, later UI surfaces will either:
  - overload provider/account fields incorrectly
  - or invent local one-off displays for GitHub/registry/Kubernetes context

### Candidate fixes to carry forward
- Add `execution_role` to:
  - effective-resolution record
  - `attempt_record`
  - `tier_runtime_record` or successor graph-owned runtime record
  - `usage_record`
- Add operational-identity blocks to runtime records where side-effectful or externally-scoped actions matter.
- Keep cross-surface receipt refs, but treat them as linkage, not as the sole operational-identity disclosure model.
- Ensure GUI inspectors can show:
  - requested/effective provider/account identity
  - requested/effective operational identity
  - execution role
  - selection/switch reason

### Do-not-forget details
- `execution_role` is not the same as `run_kind`
- operational identity is not the same as provider account identity
- `effective_project_id` remains useful correlation context, but it is not a substitute for operational identity
- this seam affects Orchestrator, GitHub Actions, Docker Manager, Usage, History, and Ledger at the same time

## Research Progress - 2026-03-16 - account switch-history and pressure-episode cluster

### Targeted docs read
- `Plans/Multi-Account.md`
- `Plans/storage-plan.md`
- `Plans/usage-feature.md`
- `Plans/Contracts_V0.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/FinalGUISpec.md`

### Key findings
- Current docs are relatively strong on current-state disclosure:
  - `current effective account`
  - `recent switch reason`
  - cooldown state
  - `signal_confidence`
  - provider/account health snapshots
- But they are weak on durable history.
  - switching currently exists mostly as:
    - `account_switch_reason` on runtime snapshots
    - `recent_switch_reason` on account health state
    - notification copy examples
  - that is not enough for History, Ledger, Usage, and Orchestrator to share one truthful timeline
- The missing piece is an append-only switch/pressure episode family.
  - one family for “why routing pressure existed”
  - one family for “what switch decision actually happened”
  - or one unified family with episode type + outcome
- Without that, the UI will keep reconstructing history heuristically from:
  - current health snapshots
  - last known reason fields
  - usage rollups
  - error strings
- This is especially risky because the rewrite now cares about:
  - projected pressure before hard failure
  - confidence/source of the signal
  - soft vs hard switching
  - no-backup-account outcomes
  - policy-disallowed outcomes
  - role/account interactions

### Recommended contract direction
- Add a canonical append-only event/record family for account-pressure and switching.
- Recommended minimum concepts:
  - `account_pressure_episode`
  - `account_switch_event`
- If kept as two families:
  - `account_pressure_episode` tracks the pressure state and its confidence/source over time
  - `account_switch_event` records the actual routing change or failed-switch decision
- If kept as one family:
  - it still needs both pressure cause and switch outcome fields; otherwise history will stay ambiguous

### Recommended fields
- `account_pressure_episode`
  - `episode_id`
