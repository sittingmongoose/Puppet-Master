  - missing project-summary / project-attention projection family
- Several docs still falsely claim “no open questions” while adjacent ledger work shows unresolved ownership.
  - this is a reconciliation risk because it can hide live design seams inside supposedly locked SSOTs
- Multiple consumer docs still use stale forbidden or obsolete vocabulary:
  - tier-era execution terms
  - widget-era non-Progress Orchestrator assumptions
  - non-canonical persona field names

### Candidate criteria before reconciliation is actually safe
- one canonical decision for requested concrete-account representation
- one canonical decision for operational identity / execution role disclosure
- one canonical decision for projection-freshness vocabulary and owner doc
- one canonical route-payload schema owner
- one canonical project-summary / project-attention projection owner
- one explicit reconciliation plan for contradictory event/record families already identified in SSOTs

### Working classification of remaining seams
- **Still needs research decisions**
  - requested concrete account
  - operational identity / actor role
  - switch-history / pressure timeline
  - projection-freshness naming/ownership
  - any unresolved authority split on concern transitions
- **Primarily reconciliation work after those decisions**
  - Orchestrator page retargeting from tiers to seams/packages/graph
  - Widget System hostability/persistence cleanup
  - glossary/help inventory expansion
  - UI command / route normalization across existing commands
  - project card / attention-center surface alignment
  - consumer-doc cleanup for requested/effective identity fields

### Do-not-forget details
- “ready for reconciliation” should mean downstream docs can update toward a stable owner model without repeatedly reopening core semantic questions
- if a seam still requires inventing a new canonical event/record family, it probably is not done being researched
- current posture is: significant progress, but still `active`, not handoff-ready

## Research Progress - 2026-03-16 - requested concrete-account ownership cluster

### Targeted docs read
- `Plans/Prompt_Pipeline.md`
- `Plans/Multi-Account.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`
- `Plans/usage-feature.md`

### Key findings
- The gap is real and now very concrete:
  - canonical docs already model `requested_account_policy`
  - canonical docs already model `effective_account_id`
  - but there is still no canonical way to represent a requested concrete account on the requested side
- That makes several user-visible states impossible to describe truthfully:
  - “use account X if possible”
  - “must use account X”
  - “project default policy preferred X, but runtime used Y”
  - “user pinned X, runtime fell back to Y because X was unavailable / disallowed / exhausted”
- `manual_preferred_account_id` in project policy is not enough.
  - it is a policy/default input
  - it is not the same as the requested account on a particular run/attempt/message
  - a run snapshot needs to preserve the requested-side decision after policy has been frozen
- A bare `requested_account_id` alone is still slightly insufficient, because it leaves one ambiguity unresolved:
  - is the requested account a soft preference or a hard requirement?
- The cleaner model is therefore:
  - `requested_account_policy`
  - `requested_account_id?`
  - `requested_account_binding`
  - `effective_account_id?`
  - `account_switch_reason?`
- That keeps policy, explicit pinning, and actual runtime outcome separate.

### Recommended contract direction
- Add canonical requested-side fields:
  - `requested_account_id?`
  - `requested_account_binding?`
- Recommended `requested_account_binding` values:
  - `none`
  - `preferred`
  - `required`
- Meaning:
  - `none`: no concrete account was requested; policy/routing chose from the eligible pool
  - `preferred`: a concrete account was requested as a preference, but fallback is allowed
  - `required`: a concrete account was explicitly pinned; fallback is not silent and must surface as blocked or explicit override failure if unmet
- `requested_account_policy` still remains necessary.
  - it explains the routing/control frame under which selection occurred
  - it does not replace the concrete account pin when one exists

### Impacted docs
- `Plans/Prompt_Pipeline.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Multi-Account.md`
- `Plans/FinalGUISpec.md`
- `Plans/usage-feature.md`
- consumer docs that disclose requested/effective runtime identity

### Contradictions / gaps surfaced
- Current canonical wording implies requested-side truth can be explained with policy alone, which is no longer sufficient.
- `manual_preferred_account_id` currently risks being misused as both:
  - project policy default
  - per-run requested concrete account
  - those are not the same thing and should not collapse
- Without `requested_account_binding`, later consumers will infer hard-vs-soft semantics heuristically from UI context or switch reasons, which will drift immediately.

### Candidate fixes to carry forward
- Extend the effective-resolution/runtime snapshot family with:
  - `requested_account_id?`
  - `requested_account_binding?`
- Extend storage/runtime records accordingly:
  - `attempt_record`
  - `tier_runtime_record`
  - any run-start/runtime snapshot events that already carry requested/effective auth-account fields
- Extend GUI disclosure grammar accordingly:
  - `Requested account`
  - `Requested binding`
  - `Effective account`
  - `Switch reason`
- Extend usage/history/ledger views to preserve the distinction:
  - usage is still attributed to `effective_account_id`
  - but the requested-side fields should remain queryable/auditable where the run snapshot is shown

### Do-not-forget details
- `required` concrete-account requests should not silently degrade into ordinary switching behavior
- `preferred` concrete-account requests should remain visible even when runtime legitimately switches away
- this requested-account model is orthogonal to auth-surface selection; both requested auth mode and requested account can coexist
- `requested_account_id` must use the stable internal account id, not provider-native display identity

## Research Progress - 2026-03-16 - GPT-5.3-Codex Identity / Projection Closure

### Targeted docs read
- `Plans/Multi-Account.md`
- `Plans/Models_System.md`
- `Plans/Personas.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/usage-feature.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`

### Key findings
- Codex confirmed the final missing connective tissue between account routing and truthful projections is now **durable actor/role projection**:
  - role-scoped pools already exist
  - selection starts with execution role
  - but runtime snapshots, usage records, and surface payloads still do not carry a canonical `execution_role` / `actor_kind`
  - without it, requested/effective account decisions remain only partially auditable even after adding account fields
- The **operational identity** addendum is now a real schema gap, not just a policy note:
  - `Multi-Account.md` defines GitHub/registry/Kubernetes operational identities
  - but prompt/runtime/storage schemas still have no parallel operational-identity block
  - this leaves side-effect surfaces at risk of collapsing provider-account identity and operational identity into one misleading runtime story
- Codex sharpened a concrete **UsageRecord contradiction**:
  - Usage surfaces want switch explanations
  - but canonical usage records still omit `account_switch_reason` and any durable switch/signal pointer
  - this means Usage can display current account context but still cannot natively explain switch lineage or join it safely to History/Ledger
- Prompt Pipeline still has one last schema ownership hole: it requires explicit blocked/degraded behavior when no eligible account exists, but the canonical effective-resolution record still lacks a first-class blocked/degraded reason family and still only carries singleton `account_switch_reason?`
- `Models_System.md` still needs one explicit split between **transport host identity** and **upstream provider identity**, or requested/effective identity renderers will keep colliding those concepts

### Highest-risk impacted docs
- `Plans/Prompt_Pipeline.md`
  - needs explicit role/actor and blocked/degraded disclosure in the canonical runtime record
- `Plans/storage-plan.md`
  - now clearly needs switch-history and actor/role-aware projection families plus Usage parity
- `Plans/usage-feature.md`
  - now clearly needs switch-event linkage or equivalent durable explanation path
- `Plans/Multi-Account.md`
  - now clearly needs its operational-identity rules bound into the shared runtime grammar
- `Plans/Models_System.md`
  - still needs transport/upstream identity cleanup to prevent projection ambiguity

### Contradictions / gaps surfaced
- Role-scoped routing is policy-visible but still not durably projected in runtime/event/usage schemas.
- Operational identities are declared but still absent from shared runtime snapshots.
- Usage still wants switch explanations without carrying switch lineage in its canonical records.
- Prompt Pipeline still requires blocked/degraded behavior without owning a matching canonical field family.
- Transport-vs-upstream provider identity remains ambiguous in model/runtime examples.

### Candidate fixes to carry forward
- Add `execution_role` / `actor_kind` to canonical runtime, attempt, and usage records.
- Introduce an `operational_identity` block parallel to provider-account identity in the shared runtime snapshot.
- Extend canonical usage records with `account_switch_reason?` plus `switch_event_ref?` or equivalent durable linkage.
- Add blocked/degraded reason fields and confidence/source hooks to the effective-resolution record.
- Split transport host identity from upstream provider identity in model/provider contracts and downstream projection payloads.

### Do-not-forget details
- `requested_account_policy` still cannot stand in for a concrete account request.
- Preview `trust_tier` and runtime projection-freshness trust still need distinct vocabularies.
- If actor/role projection is not owned centrally, every surface will keep reconstructing it differently.

## Research Progress - 2026-03-16 - GPT-5.3-Codex Provider / Permission Closure

### Targeted docs read
- `Plans/CLI_Bridged_Providers.md`
- `Plans/Provider_OpenCode.md`
- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`
- `Plans/Permissions_System.md`
- `Plans/human-in-the-loop.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`

### Key findings
