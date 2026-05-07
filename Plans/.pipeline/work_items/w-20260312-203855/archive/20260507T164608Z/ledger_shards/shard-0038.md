- `Plans/assistant-chat-design.md` + `Plans/interview-subagent-integration.md`
  - now show a concrete parity gap on auth/account disclosure for conversational actors sharing provider runtime

### Contradictions / gaps surfaced
- Bridged providers still lack the capability metadata already required of direct providers.
- CLI bridged envelope minimal shape still conflicts with later preservation requirements.
- OpenCode still exposes transport platform/model without clear ownership of upstream provider/account identity.
- A2A still bakes tier scope into normalized diagnostics and still lacks actor/account/provenance trust hints.
- Permissions still use tier-boundary wording and still cannot explain which effective account/identity a blocked action would have used.
- Shared degraded-trust / concern escalation remains absent across provider, permissions, widgets, and conversational surfaces.

### Candidate fixes to carry forward
- Add a versioned correlation block to bridged-provider normalized events and require actor/thread/attempt/lineage refs there.
- Make bridged providers expose the same capability block expected of direct providers, or centralize that capability block for both classes.
- Extend OpenCode and bridged request/runtime bundles with the full auth/account identity block plus explicit upstream-provider identity rules.
- Re-anchor A2A scope away from tier-specific required keys and add actor/account/provenance/trust hints for stream consumers.
- Replace permission tier-boundary language with runtime-overlay/blocked-state terminology and key approval cache scope by actor/run/lane/account context.
- Add one shared degraded-trust / projection-health / concern bridge that provider, permissions, Orchestrator, Usage, and widget surfaces can all consume.

### Do-not-forget details
- `origin` in bridged-provider requests is audit-only today; do not overload it into behavior-driving actor identity.
- OpenCode must preserve its split between transport realm and upstream provider/account realm.
- A2A’s duplicate attempt-continuity addenda and tier-boundary schema are signals that this seam needs consolidation plus version governance, not more scattered annotations.
- Multi-account projection fixes should not create a second provider-local quota subsystem outside the shared Usage pipeline.

## Research Progress - 2026-03-16 - project summary and attention storage contract cluster

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`
- `Plans/Contracts_V0.md`
- `Plans/assistant-chat-design.md`
- current ledger project-summary / attention-routing clusters

### Key findings
- The existing storage split is already pointing toward the right answer:
  - `projects:v1` is a registry
  - `project_state:v1:{project_id}` is shell/UI state
  - runtime/blocked/wizard objects already use their own record families and projection rows
- That means project summary and project attention should NOT be jammed into either:
  - `projects:v1` as overloaded status blobs
  - `project_state:v1:{project_id}` as UI-only convenience flags
- The cleaner model is a dedicated projection family:
  - one current `project_summary` row per project
  - many `project_attention_item` rows per project
- This fits the existing storage style well:
  - canonical events stay in seglog
  - projectors build durable current-state rows in redb
  - UI reads redb projections and routes through the shared deep-link payload model
- It also preserves the important distinction between:
  - registry identity
  - shell restore state
  - operational summary
  - actionable attention objects

### Impacted docs
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`
- `Plans/Contracts_V0.md`
- future Projects/attention-center docs

### Contradictions / gaps surfaced
- `projects:v1` currently mixes true registry fields with an under-defined `health status`.
  - that invites it to become an accidental junk drawer for operational rollups
- `project_state:v1:{project_id}` is explicitly UI-state shaped.
  - if project attention gets stored there, the app will blur operational truth with last-opened-view convenience state
- There is still no canonical redb key pattern or record shape for:
  - per-project operational summary
  - per-project active attention items
  - attention-item archival/resolution behavior

### Candidate fixes to carry forward
- Keep `projects:v1` narrow:
  - project registry only
  - path, display metadata, detection metadata, last-opened, stable config references
  - remove or sharply narrow free-form `health status` wording there
- Keep `project_state:v1:{project_id}` narrow:
  - view selection
  - panel layout
  - editor/file-tree/chat shell restore state
  - no canonical blocked/attention truth
- Add dedicated redb projections, for example:
  - `project_summary.v1:{project_id}`
  - `project_attention_item.v1:{project_id}:{attention_item_id}`
  - optional `project_attention_index.v1:{project_id}` if needed for efficient active ordering/counts
- Recommended `project_summary` fields:
  - `project_id`
  - `activity_state`
  - `attention_state`
  - `health_state`
  - `primary_owner_kind?`
  - `primary_reason_code?`
  - `primary_attention_item_id?`
  - `primary_object_ref?`
  - `active_run_count`
  - `background_run_count`
  - `blocked_run_count`
  - `attention_item_count`
  - `historical_run_count`
  - `projection_trust_state`
  - `summary_generated_at_utc`
  - `last_activity_at_utc`
- Recommended `project_attention_item` fields:
  - `attention_item_id`
  - `project_id`
  - `severity`
  - `owner_kind`
  - `reason_code`
  - `source_kind`
  - `source_object_ref`
  - `primary_route_payload_ref` or inline route payload
  - `secondary_route_payload?`
  - `projection_trust_state`
  - `dismissibility_kind`
  - `quiet_until_utc?`
  - `active`
  - `created_at_utc`
  - `updated_at_utc`
  - `resolved_at_utc?`
- Recommended lifecycle rule:
  - `project_summary` is current-state only and overwritten by projector updates
  - `project_attention_item` rows should retain enough historical semantics to support active vs resolved/dismissed/quieted behavior without erasing audit lineage
  - if the canonical source object already owns durable history, the attention row may stay projection-level but must preserve a stable `source_object_ref`
- Recommended projector rule:
  - project summary derives from canonical runtime/thread/wizard/usage/auth/source-control records and from active attention rows
  - it must not invent synthetic blocked states unsupported by canonical owners

### Do-not-forget details
- `resume_url` can remain one serialized route form, but project attention should ultimately align with the shared internal route payload model
- project-summary freshness should disclose projector trust/freshness separately from the underlying owner state
- historical-only projects should still have a current `project_summary` row; their activity state is neutral, not missing
- counts on `project_summary` should support compact badges, while `project_attention_item` supports precise lists and routing

## Research Progress - 2026-03-16 - route payload and `resume_url` normalization cluster

### Targeted docs read
- `Plans/UI_Command_Catalog.md`
- `Plans/Contracts_V0.md`
- `Plans/FinalGUISpec.md`
- `Plans/assistant-chat-design.md`
- `Plans/Widget_System.md`
- `Plans/GitHub_Integration.md`
- current ledger routing/deep-link/project-attention clusters

### Key findings
- The command catalog is already stronger than most surface docs:
  - stable `cmd.*` IDs exist for many cross-surface pivots
  - several commands already carry meaningful context payloads (`run_id`, `attempt_id`, `worktree_id`, workflow refs, thread ids)
  - `cmd.panel.switch` also already acts like a coarse route command with `panel_id`, optional `project_id`, and context block
- But the navigation model is still fragmented:
  - wizard flows use serialized `resume_url`
  - palette/search/thread jumps use their own local concepts
  - cross-surface commands often define bespoke args
  - “Show in Usage/Ledger” and Orchestrator pivots still encode object routing as command-specific payloads rather than one shared route structure
- That leaves the current system upside down:
  - the serialized deep-link form (`resume_url`) is more conceptually advanced than the internal shared route model
  - the app should instead have one internal canonical route payload, with `resume_url` as one transport/serialization form of it
- `cmd.panel.switch` is the best local starting point for general navigation, but it is still too panel-centric and too shallow for:
  - focused run restoration
  - inspector target restoration
  - tab-native filters
  - object identity restoration
  - trust/historical mode context
- The newer project-attention model makes this gap more urgent:
  - attention-center rows, project cards, command palette actions, and search results all need to restore precise scope and target
  - otherwise they will keep inventing slightly different “open the right place” behavior

### Impacted docs
- `Plans/UI_Command_Catalog.md`
- `Plans/Contracts_V0.md`
- `Plans/FinalGUISpec.md`
- `Plans/assistant-chat-design.md`
- `Plans/GitHub_Integration.md`
- `Plans/Widget_System.md`
- future Projects / attention-center docs

### Contradictions / gaps surfaced
- There is still no canonical internal `route_payload` or equivalent schema in the contracts docs.
- `resume_url` is carried in storage/events for wizard and thread blocked flows, but there is no normalized rule for how equivalent non-wizard object routes are represented.
- Navigation-style commands are currently inconsistent in granularity:
  - some are pure open/focus commands
  - some encode object refs directly
  - some carry filter state
  - some rely on ambient UI state
- `cmd.widget.*` still uses a generic `page: string`, which now conflicts with the move toward stronger native-surface vocabulary and typed routing.

### Candidate fixes to carry forward
- Define one canonical internal route payload, separate from command IDs.
- Recommended minimum route payload fields:
  - `project_id?`
  - `workspace_tab_id?`
  - `destination_surface`
  - `destination_tab?`
  - `focused_run_id?`
  - `historical_mode?`
  - `thread_id?`
  - `wizard_id?`
  - `object_kind?`
  - `object_id?`
  - `record_id?`
