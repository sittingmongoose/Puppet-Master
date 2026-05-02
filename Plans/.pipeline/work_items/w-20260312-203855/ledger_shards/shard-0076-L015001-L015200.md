
### Key findings
- The docs currently carry several different ref families under one loose “link” idea:
  - inspection/detail refs
  - report/evidence refs
  - provenance/source refs
  - receipt/external-operation refs
  - navigation/deep-link refs
- The current examples are already distinct enough to separate cleanly:
  - `detail_ref` points to exact report/detail inspection
  - `report_ref` points to canonical quality/governance report artifacts
  - `evidence_ref` points to evidence payloads or summaries
  - `usage_event_ref` points to canonical usage identity
  - `workflow_refs`, `docker_refs`, `kubernetes_refs` point to external-operation receipt linkage
  - `message_id` and `thread_id` are stable conversational object identity
  - `resume_url` is the only field in this cluster that is trying to act as navigation transport
- `assistant-chat-design.md` is already using stable object identity for search/jump behavior.
- `Orchestrator_Page.md` still uses `evidence_ref` for summary/evidence surfaces, which is aligned with record inspection, not routing.

### Impacted docs
- Primary owner docs:
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
- Strong adjacent consumers:
  - `Plans/Runtime_Artifacts_Panel.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/Orchestrator_Page.md`

### Contradictions / gaps surfaced
- `resume_url` is currently the only ref field trying to carry actual navigation, which is why it keeps colliding with the route/open-by-identity work.
- Other ref families are mostly record-inspection or provenance links already, but the owner docs still do not state that distinction clearly.
- Without an explicit split, consumer docs will keep treating `detail_ref`, `report_ref`, and `resume_url` as interchangeable “open this thing” fields.

### Candidate fixes to carry forward
- Make the owner-doc distinction explicit:
  - inspection/provenance refs stay in event and record payloads
  - route/open contracts own navigation identity
- Keep:
  - `detail_ref`
  - `report_ref`
  - `evidence_ref`
  - `usage_event_ref`
  - `workflow_refs`
  - `docker_refs`
  - `kubernetes_refs`
  as record/provenance families, not route payload surrogates
- Keep `resume_url` only as serialized transport derived from canonical route identity.

### Do-not-forget details
- This split will make the owner-doc rewrite much easier because most refs do not need replacement.
- The real conflict sits almost entirely on `resume_url`, not on the broader `*_ref` family.

## Research Progress - 2026-03-17 - Blocked/thread/wizard storage families still straddle two execution eras

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/assistant-chat-design.md`
- `Plans/Executor_Protocol.md`
- `Plans/Orchestrator_Page.md`

### Key findings
- `Plans/storage-plan.md` is still carrying two execution models at once inside its canonical-record section.
- The newer aligned pieces are:
  - `blocked_projection` keyed by `run_id`, `node_id`, `blocked_sequence`
  - canonical `allowed_action_ids[]`
  - `attempt_record` with scheduler/safe-point/remediation/runtime identity fields
- The stale pieces are still structural, not incidental:
  - `tier_runtime_record` keyed by `run_id`, `tier_id`
  - `usage_record` keyed by `run_id`, `tier_id`, `attempt_id?`, `usage_sequence`
  - `evidence_record` keyed by `run_id`, `tier_id`, `evidence_id`
  - many earlier event examples in the file still center `tier_id`
- `thread_blocked_notice` and `wizard_runtime_state` are also still mixed:
  - they correctly carry blocked/wizard state
  - but they still carry `resume_url?`, which keeps navigation transport inside persisted state as if it were canonical identity
- `assistant-chat-design.md` is already stricter than storage here:
  - blocked notices are rendered from `allowed_action_ids[]` plus blocked metadata
  - chat must not invent thread-local recovery semantics
- `Executor_Protocol.md` is already aligned on node/attempt/blocked-sequence runtime identity.

### Impacted docs
- Primary owner-gap doc:
  - `Plans/storage-plan.md`
- Strong adjacent owners:
  - `Plans/Contracts_V0.md`
  - `Plans/Executor_Protocol.md`
- Strong consumers:
  - `Plans/assistant-chat-design.md`
  - `Plans/Orchestrator_Page.md`

### Contradictions / gaps surfaced
- The runtime/blocking model now wants node/attempt/blocked-sequence identity, but storage still keeps several core families on `tier_id`.
- That means the same storage plan now says:
  - blocked episodes are node-native
  - usage/evidence/runtime rollups are still tier-native
- `thread_blocked_notice` and `wizard_runtime_state` still treat `resume_url?` as stored state alongside canonical blocked metadata, which keeps the navigation transport/model split unresolved.

### Candidate fixes to carry forward
- Reconcile `storage-plan.md` so:
  - blocked/runtime families stay node-native
  - stale `tier_runtime_record` framing is reduced to derived compatibility state or replaced by rewrite-era execution-context projections
  - usage and evidence families stop using `tier_id` as their primary cross-surface key
- Keep thread/wizard blocked state on canonical blocked/wizard identity and derived route/object identity, not on stored `resume_url` as if it were primary.

### Do-not-forget details
- This is one of the clearest places where routing and execution-context reconciliation meet.
- `storage-plan.md` is not only lagging the route model. It is still lagging the execution-core rewrite in the same record families.

## Research Progress - 2026-03-17 - Blocked-family contracts are still uneven across node, wizard, and thread surfaces

### Targeted docs read
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/assistant-chat-design.md`

### Key findings
- The blocked family is no longer conceptually unclear, but the owner docs still describe its members at different maturity levels.
- `node.blocked` is the strongest contract:
  - `run_id`
  - `node_id`
  - `attempt_id?`
  - `blocked_reason_code`
  - `blocked_sequence`
  - `allowed_action_ids[]`
  - `preserved_local_work`
  - `detail_ref?`
  - `failure_class?`
- `blocked_notice` in chat is also relatively aligned:
  - blocked reason
  - allowed actions
  - preserved-local-work
  - detail ref
  - node/attempt references
  - explicit rule that chat action buttons come from ordered `allowed_action_ids[]`
- `wizard.blocked` is still the weakest member of the family in the owner docs:
  - earlier definition is only `wizard_id`, `thread_id?`, `round_count`, `report_ref`, `resume_url`, `ts`
  - later addendum strengthens it substantially, but the document still carries both shapes
- `storage-plan.md` mirrors that inconsistency:
  - blocked projections are fairly strong
  - wizard runtime state is still comparatively thin and still carries `resume_url?`

### Impacted docs
- Primary owner docs:
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
- Strong aligned consumer:
  - `Plans/assistant-chat-design.md`

### Contradictions / gaps surfaced
- `wizard.blocked` is still partly living in a pre-runtime-escalation shape while `node.blocked` and `blocked_notice` have already moved to the stronger blocked taxonomy.
- This makes wizard-blocked behavior look like a special deep-link flow instead of a peer member of the canonical blocked family.
- The docs do not yet say clearly which blocked fields are cross-family minimums versus family-local additions.

### Candidate fixes to carry forward
- Define a cross-family blocked minimum for canonical blocked objects:
  - blocked reason
  - ordered allowed actions where applicable
  - preserved-work / local-state disclosure where applicable
  - stable blocked-episode identity or family-local equivalent
  - detail/report inspection refs
- Keep family-local additions separate:
  - node-blocked keeps `blocked_sequence`, `attempt_id`, `failure_class`
  - wizard-blocked keeps wizard-specific clarification/report fields
  - thread blocked notices stay as rendered/persisted consumer state, not canonical blocked ownership
- Reconcile the early thin `wizard.blocked` definition out of `Contracts_V0.md`.

### Do-not-forget details
- This is a family-contract mismatch, not a request for one giant shared blocked payload.
- `assistant-chat-design.md` is already stronger than the owner docs in how it treats blocked thread actions.

## Research Progress - 2026-03-17 - Usage and evidence families still use tier-era correlation

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/usage-feature.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Runtime_Artifacts_Panel.md`

### Key findings
- Usage and evidence are now the strongest remaining cross-surface families still tied to tier-era correlation.
- `Plans/storage-plan.md` still defines:
  - `usage_record` with `tier_id`
  - `evidence_record` in a section surrounded by tier-keyed families
  - many earlier event examples and keys still centered on `tier_id`
- `Plans/usage-feature.md` still says:
  - Run Graph and Orchestrator aggregate by `tier_id` and `attempt_id?`
  - `usage.jsonl` aggregation is tier-based
- `Plans/Run_Graph_View.md` still routes Usage by node-through-tier:
  - “View in Usage” filters by `tier_id`
  - usage correlation is explicitly by `tier_id`
- `Plans/Orchestrator_Page.md` still uses:
  - `run_id`, `tier_id`, `attempt_id?` for per-node model/token tracking
  - evidence tables and filters by `tier_id`
  - worker output filtered by active `tier_id`
- `Plans/Runtime_Artifacts_Panel.md` is already stronger than these docs on the usage side:
  - `cost_usage` routes by canonical usage identity
  - not by tier-local filters

### Impacted docs
