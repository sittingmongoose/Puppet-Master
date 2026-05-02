
### Targeted docs read
- `Plans/assistant-chat-design.md`
- `Plans/interview-subagent-integration.md`
- `Plans/chain-wizard-flexibility.md`
- `Plans/FinalGUISpec.md`
- `Plans/Multi-Account.md`
- `Plans/Personas.md`
- `Plans/Models_System.md`

### Key findings
- The shared provider-runtime contract is already broader than Orchestrator:
  - `Multi-Account.md` explicitly says the behavior applies to assistant, interviewer, requirements builder, PRD builder, overseers, node workers, and provider-backed chat/tool turns
  - requested/effective provider/model/effort/persona/auth/account and selection reason are already shared runtime concepts
- The conversational/document-production surfaces already require runtime-identity visibility:
  - Interview activity pane and chat must show effective Persona, selection reason, effective platform/model, and skipped-control disclosure
  - Requirements Builder must show effective Persona, selection reason, effective platform/model, and skipped unsupported Persona controls for the active stage/pass
  - chat subagent blocks and interview activity panes are already expected to expose the same effective-runtime fields for active work blocks
- The shared failure/remediation taxonomy also already crosses the boundary:
  - Interview uses the shared `failure_class` / `blocked_reason_code` taxonomy
  - chat blocked notices render from canonical `allowed_action_ids[]` and blocked metadata instead of inventing thread-local recovery semantics
  - wizard/interview blocked state is explicit and persistent, not a soft conversational inconvenience

### Main boundary clarification
- Strong recommendation:
  - conversational actors and document-production actors share provider/runtime identity semantics, but they are not orchestration execution objects
- That means:
  - they do share:
    - requested/effective provider/model/persona/account/auth semantics
    - selection reason
    - skipped/honored control disclosure
    - blocked/retry/remediation/degradation taxonomy where applicable
    - shared activity/event-stream infrastructure
  - they do NOT automatically become:
    - `Feature Seams`
    - `Work Packages`
    - graph `Nodes`
    - lane-pool objects
    - package/seam-governance objects

### Identity-model direction
- The docs imply multiple identity families that must stay distinct:
  - conversation identity:
    - `thread_id`
  - wizard/builder identity:
    - `wizard_id`
    - builder stage/run ids
    - bundle/review ids
  - orchestration identity:
    - `run_id`
    - package/seam/node ids
    - attempt ids
- These can be linked, but should not be collapsed into one object model.
- Example:
  - an Interview run may have runtime identity and blocked/remediation state
  - but it is still an interview/document-production run, not an Orchestrator package/node execution record

### Shared-runtime surface parity direction
- Good emerging rule:
  - when multiple surfaces present the same active conversational/document-production run, they should consume the same underlying runtime state and expose the same requested/effective visibility fields
- Existing examples already support this:
  - Interview chat surface and Interview activity pane share the same active run state
  - Builder and Interview reuse the shared agent activity pane
  - chat subagent blocks preserve persona/task/runtime identity in-thread rather than using a separate weaker model

### Blocked-state implication
- Another important finding:
  - blocked state is not Orchestrator-exclusive
- Chat, Interview, and Wizard flows already use:
  - `attention_required`
  - `blocked`
  - `blocked_reason_code`
  - `allowed_action_ids[]`
  - `resume_url`
- This is useful because it means the shared runtime contract should stay broad.
- But it also means reconciliation later must avoid accidentally renaming all blocked semantics as “Orchestrator” semantics.

### Non-goal / anti-drift rule
- Recommended explicit rule to carry forward:
  - shared provider runtime does not imply shared execution ontology
- In plain terms:
  - same provider/account/model/runtime machinery
  - different object families, lifecycle semantics, and UI surfaces
- This will matter especially when reconciling:
  - search
  - record envelopes
  - history/ledger
  - settings override presentation
  - glossary/help terminology

### Search / record implication
- Search and record systems should be able to span these actors without flattening them into one type.
- Good direction:
  - keep a shared runtime-identity field family
  - keep distinct actor/run kinds
- Candidate actor/run kinds:
  - assistant conversation turn/run
  - interview phase/document/review run
  - builder stage/review run
  - orchestrator node/attempt/run
- This makes cross-surface search and ledger inspection possible without pretending they are all graph nodes.

### Contradictions / gaps surfaced
- The shared runtime semantics are already distributed across multiple docs, but the “shared runtime, separate ontology” rule is still mostly implicit.
- Without an explicit boundary rule, later reconciliation could over-unify:
  - treating builder/interview/chat runs as orchestration objects
  - or under-unify:
  - duplicating provider/account/runtime identity logic for conversational flows
- The current docs are stronger on visibility requirements than on naming this boundary explicitly.

### Candidate fixes to carry forward
- Add an explicit shared-runtime boundary statement:
  - assistant/interviewer/builders share provider/account/runtime identity semantics with Orchestrator
  - but remain upstream conversational/document-production actors, not package/seam/node execution objects
- Preserve distinct actor/run kinds in record/search/routing contracts.
- Reuse one runtime-identity disclosure grammar across these surfaces without collapsing their lifecycle models.
- Keep blocked/remediation taxonomy shared, while preserving actor-specific state machines and object identities.

### Do-not-forget details
- `thread_id`, `wizard_id`, bundle/review ids, and orchestration `run_id`/attempt ids must remain linkable but distinct
- chat blocked notices already prove shared blocked taxonomy does not require shared object ontology
- Builder/Interview activity panes already give a concrete model for “same runtime state, different surface”

## Research Progress - 2026-03-16 - Export Contracts

### Targeted docs read
- `Plans/usage-feature.md`
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/storage-plan.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/chain-wizard-flexibility.md`

### Key findings
- The current docs already contain several different export families:
  - config sync/export bundles (`.pm-bundle`)
  - render/preview exports (for example Mermaid `SVG` / `PNG`)
  - runtime artifact export from the Artifacts panel
  - Usage/Ledger CSV/JSON exports
  - project-output materialization and optional derived exports under `.puppet-master/project/**`
  - generic thread/run history export from seglog / JSONL mirror
- These families are conceptually different, but the docs still do not give Orchestrator a unified export contract that ties them together.
- `Runtime_Artifacts_Panel.md` is notably disciplined:
  - artifacts stay on canonical runtime identity
  - `Show in Ledger` / `Show in Usage` route back to canonical surfaces
  - artifacts do not create shadow data models
- `chain-wizard-flexibility.md` is also disciplined on canonical vs derived export:
  - sharded plan graph is canonical
  - monolithic graph export is derived convenience only
- `Orchestrator_Page.md` still has relatively thin export language:
  - filtered ledger CSV/JSON export
  - no strong run/evidence/history/record-bundle export contract yet

### Recommended export taxonomy
- Strong recommendation:
  - keep the earlier three export classes and sharpen them:
    - `record export`
    - `bundle export`
    - `view export`
- Working interpretation:
  - `record export`
    - exact canonical record(s) with stable ids/refs and schema-aware payloads
  - `bundle export`
    - portable package containing multiple records/artifacts plus manifest
  - `view export`
    - user-facing filtered table/render output such as CSV, JSON summary, rendered image, or currently filtered list

### Orchestrator-specific direction
- Good candidate Orchestrator exports:
  - `record export`
    - specific concern
    - promotion
    - corroboration result
    - graph patch request/result
    - recovery record
    - exact ledger slice
  - `bundle export`
    - run evidence bundle
    - selected-object bundle (for example selected concerns + linked evidence + relevant records)
    - historical run package with manifest + linked artifacts/records
  - `view export`
    - filtered ledger CSV/JSON
    - filtered concerns table
    - search results export
    - graph image/render convenience export

### Manifest direction
- Important rule:
  - any non-trivial Orchestrator bundle export should carry a manifest
- Good manifest fields:
  - `export_id`
  - `export_kind`
  - `schema_version`
  - `project_id`
  - `focused_run_id?`
  - `source_surface`
  - `generated_at_utc`
  - `filter_summary?`
  - `included_record_ids[]`
  - `included_artifact_ids[]`
