  - `source_surface`
  - `filter_summary`
  - `record_counts`
  - `artifact_counts`
  - `included_record_ids[]`
  - `included_artifact_ids[]`
  - `status_notes`
  - `schema_version`
- This makes exported bundles inspectable and auditable later.

### Record-shaped export rule
- Recommended rule:
  - exact-record surfaces should export canonical records, not UI-specific transformed rows
- Implication:
  - `Ledger` export should preserve canonical ids and structured fields
  - CSV is fine as a convenience projection
  - JSON/JSONL should remain close to canonical record structure

### Evidence / artifact export direction
- Evidence export should likely include:
  - evidence records
  - linked artifact refs
  - evidence summaries
  - concern/review/corroboration linkage where present
- Artifact export should likely focus on:
  - actual files/blobs
  - metadata manifest
  - source record refs
- Important rule:
  - exporting an artifact alone should still preserve enough metadata to know what record/run/object it came from

### Historical / removed-object implication
- Exports must preserve historical truth even when live backing objects no longer exist.
- Example:
  - removed worktree or retired graph path still exports as record metadata with historical status
  - absence of a live backing file/worktree should not corrupt the exported record bundle

### Filtered-view export direction
- `view export` is still useful, but should be clearly labeled as a convenience format.
- Example:
  - filtered ledger CSV
  - filtered concern table CSV
  - analytics chart/table export
- These should not be treated as canonical archival formats.

### Contradictions / gaps surfaced
- Config export/import is much more explicit than Orchestrator export contracts.
- Current Orchestrator usage/evidence export language is too UI-view-centric.
- No shared export-manifest contract is obvious for Orchestrator record families.

### Candidate fixes to carry forward
- Add a shared Orchestrator export manifest contract.
- Define record-first exports for Ledger/History/concern/review/promotion/patch/recovery families.
- Keep CSV/table exports as convenience view exports, not as canonical archival exports.
- Preserve historical/superseded/removed semantics in exported metadata.

### Do-not-forget details
- exact-record exports will depend on the record-envelope work from the previous seam
- Evidence and artifact exports should not collapse into one undifferentiated zip of files
- export/import of config bundles is already strong; Orchestrator exports should reach similar clarity

## Research Progress - 2026-03-16 - Settings Override Presentation

### Targeted docs read
- `Plans/Multi-Account.md`
- `Plans/Models_System.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/Personas.md`
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/storage-plan.md`

### Key findings
- The docs already define most of the raw data needed for this seam:
  - requested/effective Persona display requirements
  - requested/effective platform/model/variant/runtime controls
  - scoped override lifecycle for Persona overrides
  - project-owned multi-account policies plus run snapshots and effective account selection
  - provider-gap disclosure rules (`honored`, `skipped`, `clamped`)
- The main gap is presentation coherence.
- The system currently has at least three different concepts that the UI must not blur:
  - `inherit/override` from configuration layering
  - `requested/effective` from runtime resolution
  - `honored/skipped/clamped` from provider capability handling

### Recommended conceptual split
- Strong recommendation:
  - treat these as three separate axes:
    - `source axis`
    - `request axis`
    - `execution/result axis`
- Working interpretation:
  - `source axis`
    - where the configured value came from
    - e.g. app default, project override, role policy, tier mapping, manual override
  - `request axis`
    - what the run/attempt actually asked for at execution start
  - `execution/result axis`
    - what the provider/runtime actually used and whether controls were honored/skipped/clamped

### Recommended display grammar
- Good canonical display groups:
  - `Inherited from`
  - `Overridden by`
  - `Requested`
  - `Effective`
  - `Reason`
  - `Support`
- Example mental model:
  - config/source:
    - `Inherited from Project policy`
    - `Overridden by Package override`
  - request:
    - `Requested model: claude/sonnet`
  - execution:
    - `Effective model: claude/sonnet`
    - `Reasoning effort: requested high -> skipped`
    - `Reason: provider does not support effort on this model`

### Source-layer direction
- Likely source layers that need explicit labeling:
  - app default
  - project override
  - surface default
  - role policy
  - seam/package/node mapping
  - manual override
  - turn/session/run/task/subagent scoped override
- Important rule:
  - UI should show the winning source, not force the user to reconstruct precedence from docs
- Especially important for:
  - Persona
  - provider/model/variant/effort
  - auth mode
  - account policy
  - worker policy (`subagent` vs `agent`, fresh vs reused worker)

### Requested/effective direction
- Requested/effective must remain runtime-facing and auditable.
- Minimum runtime-facing fields still align with earlier findings:
  - requested Persona
  - effective Persona
  - requested platform/model/variant/auth/account policy
  - effective platform/model/variant/auth/account
  - selection/switch reason
  - skipped/clamped controls
- Recommended UI rule:
  - if requested == effective and nothing was skipped/clamped, compact display is fine
  - if they differ, the UI must expand/disclose the difference visibly

### Honored / skipped / clamped direction
- This is not the same as requested/effective difference in general.
- A control may be:
  - requested and honored exactly
  - requested and clamped
  - requested and skipped
  - not requested at all
- Recommended display:
  - use explicit support chips or rows for runtime controls
  - examples:
    - `Reasoning effort: High -> Skipped`
    - `Temperature: 0.2 -> Honored`
    - `Top-p: 1.0 -> Clamped to 0.9`

### Surface-specific presentation direction
- `Settings`
  - source-axis heavy
  - show inheritance and override origin clearly
  - should answer: "what will be requested if I run from here?"
- `Orchestrator / Graph inspector / run detail`
  - request/execution-axis heavy
  - should answer: "what did this run/attempt request, what actually happened, and why?"
- `Progress`
  - compact requested/effective summary for live context
- `History` / `Ledger`
  - exact audit trail of requested/effective + reason + source snapshot refs
- `Authentication` / `Usage`
  - effective account/auth emphasis, with project-policy and manual-preferred-account source disclosure where relevant

### Worker-policy implication
- The same display grammar should extend beyond provider/model/persona/account.
- Worker policy likely needs the same treatment:
  - source: project/package/node override source
  - requested: `subagent`, `fresh_worker`
  - effective: what runtime actually used
  - reason: why it changed if it changed
- This will matter in node inspector and run detail views.

### Multi-account implication
- Multi-account adds a second layer of confusion if not presented carefully:
  - requested account policy is not the same as effective account
  - manual preferred account is not the same as guaranteed selected account
  - project policy snapshot is not the same as live runtime decision
- Recommended display in runtime surfaces:
  - `Account policy: Auto switch (Project policy)`
  - `Effective account: gemini-oauth-2`
  - `Switch reason: rate_limit_pressure`

### Historical-run implication
- Historical run views should show the frozen requested/effective state from that run, not recompute from current settings.
