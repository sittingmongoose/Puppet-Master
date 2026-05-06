## Research Progress - 2026-03-16 - attention center and project-attention routing cluster

### Targeted docs read
- `Plans/Glossary.md`
- `Plans/FinalGUISpec.md`
- `Plans/assistant-chat-design.md`
- `Plans/storage-plan.md`
- `Plans/feature-list.md`
- current ledger routing/escalation/project-summary clusters

### Key findings
- The shell already has the right high-level idea:
  - `attention center` is the canonical shell surface for background, blocked, or action-needed items outside the current active project/thread
  - multiple surfaces already emit attention-like objects: wizard cards, thread badges, dashboard CtAs, blocked-node lists, auth badges, and resume URLs
- What is still missing is a shared project-attention item contract.
  - today the docs describe several separate UI manifestations
  - they do not yet define one normalized object that can back:
    - attention-center rows
    - project-card badges
    - title-bar attention badges
    - command-palette “resume/fix” entries
    - cross-surface “go to the right place” behavior
- The existing `resume_url` pattern is a strong precedent.
  - wizard and thread flows already preserve precise recovery routes through a stored deep link
  - the rewrite should generalize that idea beyond wizards so project-level attention objects can route to Orchestrator, Chat, Source Control, GitHub, Usage, or Settings with the same internal payload model
- Project-level attention should remain object-first, not notification-first.
  - a project may have many badges or warnings
  - the attention center should still point to the canonical owning object and next action path, not just show copied banner text
- Trust matters at this layer too.
  - canonical blocked episodes, approval waits, and persisted thread/wizard states can drive strong routing
  - projection-derived warnings should still appear, but their rows need trust qualification and should not pretend to be equally authoritative

### Impacted docs
- `Plans/Glossary.md`
- `Plans/FinalGUISpec.md`
- `Plans/storage-plan.md`
- `Plans/assistant-chat-design.md`
- future Projects/attention-center docs and command/deep-link docs

### Contradictions / gaps surfaced
- `attention center` exists in the glossary, but there is no concrete payload/schema for attention-center items.
- `resume_url` exists for wizard/thread recovery, but no generalized equivalent is yet defined for:
  - blocked run items
  - concern-driven attention
  - auth/account issues
  - Source Control / GitHub action-needed items
  - degraded-trust inspection prompts
- Current docs still risk coupling routing too tightly to one surface.
  - for example, a blocked project card might imply “open Orchestrator”
  - but the real owner might be `Auth`, `Source Control`, `GitHub`, or `Usage pressure`
- There is still no explicit precedence rule for how multiple attention items collapse into one project badge while remaining individually actionable in the attention center.

### Candidate fixes to carry forward
- Add a shared `project_attention_item` projection or equivalent normalized row model.
- Recommended minimum shape:
  - `attention_item_id`
  - `project_id`
  - `severity` (`advisory | attention_required | blocked`)
  - `owner_kind`
  - `reason_code`
  - `source_kind`
  - `source_object_ref`
  - `primary_route_payload`
  - `secondary_route_payload?`
  - `projection_trust_state`
  - `created_at_utc`
  - `updated_at_utc`
  - `dismissibility_kind` (`none | quiet_only | dismissible`)
  - `active`
- Recommended rollup rule:
  - project badge/card shows highest-severity active item plus count
  - attention center shows each active item separately
  - rows remain object-linked; they do not collapse into one synthetic “project blocked” blob
- Recommended routing rule:
  - project attention rows should route through the same internal payload model as deep links/search/palette results
  - URLs and in-app actions should decode to the same route payload
  - `resume_url` can survive as one serialized transport form of that shared route payload
- Recommended disclosure rule:
  - if an attention item is projection-derived rather than canonical-runtime-backed, the row should show that reduced trust explicitly and avoid overconfident imperative copy

### Do-not-forget details
- attention center rows should identify the owning object and likely next surface, not merely repeat severity
- project badges need aggregation; attention center rows need precision
- `quiet` or temporary suppression should only affect resurfacing of advisory items, not erase canonical blocked/approval-wait rows
- a single project can legitimately have mixed attention sources at once: blocked run, auth trouble, and background advisory pressure

## Research Progress - 2026-03-16 - GPT-5.4 Identity / Actor Envelope Deepening

### Targeted docs read
- `Plans/Multi-Account.md`
- `Plans/Models_System.md`
- `Plans/Personas.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/usage-feature.md`

### Key findings
- The missing requested-side concrete account field is now clearly blocking multiple downstream contracts, not just storage purity:
  - `Multi-Account.md` already supports manual preferred-account behavior and role-by-account overrides
  - `Prompt_Pipeline.md`, `Contracts_V0.md`, and `Models_System.md` still only expose `requested_account_policy` plus `effective_account_id`
  - GPT-5.4 sharpened that this now blocks truthful requested-vs-effective runtime inspectors for Orchestrator, Run Graph, and conversational actor surfaces
- The rewrite now needs a first-class actor envelope, not just a richer run record:
  - `Models_System.md` still frames deterministic selection around provider/model/variant and availability sets
  - `Prompt_Pipeline.md` still lacks `actor_kind` / `execution_role`
  - `storage-plan.md` still keys provider account snapshots only by `run_id`
  - the multi-account/runtime model already applies to assistant, interviewer, builders, overseers, and node workers, so the missing actor envelope now blocks auditability and replay across non-run actors
- Prompt Pipeline has become internally split on what the dispatch boundary actually carries:
  - §6.5 defines a rich runtime identity record with auth/account/switch fields
  - later handoff/addenda collapse the bundle back to IDs + model/permission refs and even lose `thread_id`
  - this now creates a concrete SSOT fracture between Prompt Pipeline, bridged providers, and conversational surfaces
- Orchestrator/Run Graph identity consumers are still materially below the contract the upstream docs now imply:
  - stale `_persona_id` names remain in required worker identity fields
  - graph/use pivots still rely on `tier_id` where storage/receipts have moved to `attempt_id` + `usage_event_ref`
  - worker/verifier identity still lacks auth mode, account, project context, switch reason, and applied/skipped control visibility
- Account pressure and switching are still modeled as current state plus per-attempt reason, not durable shared history:
  - `recent_switch_reason` and `account_switch_reason` exist
  - there is still no append-only `account_switch_event` / `account_pressure_episode` family for History, Ledger, Usage, and Dashboard to share
  - GPT-5.4 reinforced that the lack of history now blocks runtime-story and audit surfaces, not just analytics completeness

### Highest-risk impacted docs
- `Plans/Prompt_Pipeline.md`
  - now clearly needs one canonical handoff/runtime object and execution-role ownership
- `Plans/Multi-Account.md`
  - still strongest policy owner, but its “no design-open questions remain” claim is now contradicted by unresolved requested-account/history/trust ownership across adjacent SSOTs
- `Plans/Models_System.md`
  - now clearly under-specifies deterministic selection because provider/model selection is no longer enough without actor/auth/account inputs
- `Plans/storage-plan.md`
  - needs actor-scoped snapshots and durable account-switch/pressure history families
- `Plans/Orchestrator_Page.md` + `Plans/Run_Graph_View.md`
  - still cannot faithfully render the runtime identity bundle or pivot by the newer attempt/receipt/usage anchors

### Contradictions / gaps surfaced
- `Multi-Account.md` says there are no design-open questions left while cross-doc ownership is still unresolved for requested concrete account, switch history, conversational actor fields, and trust behavior.
- `Prompt_Pipeline.md` still has a richer canonical runtime record than its own later handoff sections.
- `Models_System.md` calls its runtime contract cross-system while omitting already-canonical auth/account fields.
- Orchestrator/Run Graph still consume stale `_persona_id` naming and tier-era pivoting.
- History is still closer to a run index than to the runtime/account-switch/recovery story the rewrite now needs.

### Candidate fixes to carry forward
- Add one canonical requested concrete-account field to the shared runtime identity grammar, distinct from `requested_account_policy`.
- Add `actor_kind` / `execution_role` and actor-scoped refs to the shared runtime identity bundle, snapshots, and handoff objects.
- Consolidate Prompt Pipeline onto one canonical handoff/runtime object that preserves thread/auth/account/switch data across dispatch boundaries.
- Add append-only `account_switch_event` / `account_pressure_episode` records and bind History/Ledger/Usage/Progress projections to them.
- Replace worker/verifier/page contracts with canonical runtime snapshot refs or inline canonical runtime bundles instead of ad hoc persona/provider/model strings.

### Do-not-forget details
- `requested_account_policy` and requested concrete account solve different problems; both are needed.
- `usage_event_ref` + `attempt_id` are now the safer Usage pivots than `tier_id` on graph/history surfaces.
- `effective_account_id` remains the stable internal key; provider-facing identities stay disclosure-only.
- Actor/runtime unification must preserve ontology separation: conversational actors share provider runtime without becoming orchestration-node objects.

## Research Progress - 2026-03-16 - GPT-5.4 Bridged Runtime / Permissions / Trust Deepening

### Targeted docs read
- `Plans/CLI_Bridged_Providers.md`
- `Plans/Provider_OpenCode.md`
- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`
- `Plans/Permissions_System.md`
- `Plans/assistant-chat-design.md`
- `Plans/interview-subagent-integration.md`
- `Plans/Widget_System.md`
- `Plans/FinalGUISpec.md`

### Key findings
- Bridged-provider contracts are now visibly weaker than direct-provider contracts in the exact places the rewrite needs strongest parity:
  - direct providers must expose capability metadata like multi-account support, switch boundary, quota signal sources/confidence, and role-scoped pools
  - bridged-provider sections still do not expose equivalent capability blocks
  - that means multi-account routing and pressure interpretation are currently stronger on paper for direct providers than for bridged providers
- `CLI_Bridged_Providers.md` is internally inconsistent on normalized correlation shape:
  - early envelope is only `{ run_id, seq, type, payload }`
  - later addenda require preservation of `thread_id`, `attempt_id`, `node_id`, generation, snapshot IDs, and remediation lineage
  - there is still no canonical envelope slot for those fields, so the doc cannot satisfy its own preservation rule cleanly
- OpenCode still preserves the older model/permission snapshot view of runtime identity, not the newer auth/account bundle:
  - it carries requested/effective model IDs and permission snapshots
  - but not requested/effective auth/account fields, upstream provider identity ownership, or switch attribution
  - GPT-5.4 sharpened that the OpenCode transport platform vs upstream provider identity split now needs explicit ownership
- The A2A stream seam is still more dangerous than “stale tier wording” suggests:
  - it still productizes `tier_boundary` and tier-audit semantics at the normalized stream layer
  - it still leaves no normalized path for account-switch, pressure/confidence, or actor-class disclosure
  - `SelectSpeakerEvent` remains `raw_observation`, so shared conversational/runtime actor changes are still largely invisible as durable lineage
- Permissions are still effectively session-centric and under-bound to identity:
  - base headless `ask -> deny unless HITL at current tier boundary` language is still tier-era and conflicts with unified blocked-overlay contracts
  - permission snapshots do not carry effective auth/account or operational identity context
  - approval caching still lacks an explicit actor/lane/run/account scope rule, which is unsafe under shared-runtime parallel actors
- Degraded-trust and concern escalation remain under-owned across provider/runtime/UI boundaries:
  - auth/account health, switch pressure, provider confidence, and projection freshness still do not flow through one reusable trust/concern contract
  - Assistant chat is ahead of interview/builder docs on requested/effective auth-account visibility, which is useful evidence of parity drift across conversational actors

### Highest-risk impacted docs
- `Plans/CLI_Bridged_Providers.md`
  - now clearly needs a versioned correlation/event envelope and bridged-provider capability parity
- `Plans/Provider_OpenCode.md`
  - now clearly needs explicit transport-vs-upstream identity ownership and full auth/account runtime disclosure
- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`
  - still hard-wires tier scope and drops actor/account/trust metadata at the stream boundary
- `Plans/Permissions_System.md`
  - still needs runtime-overlay terminology, identity linkage, and approval cache scoping for multi-actor execution
