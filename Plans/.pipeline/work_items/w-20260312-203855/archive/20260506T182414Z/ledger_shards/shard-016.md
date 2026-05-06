{"line_start":3001,"line_end":3200,"invocation":"inv-c2-20260505-W02-i016"}

    - `concern projection`
- Working interpretation:
  - `concern record` = canonical durable object with stable identity and lifecycle
  - `concern source event/ref` = review finding, corroboration result, blocked episode, patch result, recovery outcome, etc. that supports the concern
  - `concern projection` = surface-specific rendering for Progress / Seams / Evidence / History / Ledger

### Recommended minimum concern record shape
- Concern record should likely carry:
  - `concern_id`
  - `project_id`
  - `run_id?`
  - scope object refs:
    - `seam_id?`
    - `package_id?`
    - `node_id?`
    - `attempt_id?`
    - `lane_id?`
    - `worktree_id?`
  - `category`
  - `severity`
  - `status`
  - `summary`
  - `detail_ref?`
  - `owner_kind`
  - `owner_ref?`
  - `created_by_kind`
  - `created_by_ref?`
  - `first_seen_at_utc`
  - `last_seen_at_utc`
  - `resolved_at_utc?`
  - `dismissed_at_utc?`
  - `acknowledged_at_utc?`
  - evidence/source refs:
    - `source_refs[]`
    - `evidence_refs[]`
    - `artifact_refs[]`
    - `review_refs[]`
    - `corroboration_refs[]`
    - `graph_patch_refs[]`
    - `recovery_refs[]`
  - lineage refs:
    - `parent_concern_id?`
    - `superseded_by_concern_id?`
    - `merged_into_concern_id?`
    - `split_from_concern_id?`
  - attention fields:
    - `visibility_level`
    - `attention_level`
    - `chatworthy`
    - `blocking_effect?`

### Category / severity direction
- Good category set likely needs to align with weak-integration groupings plus runtime/governance classes:
  - `wiring`
  - `workflow`
  - `state_contract`
  - `gui_alignment`
  - `design_architecture`
  - `quality`
  - `evidence_gap`
  - `corroboration`
  - `recovery`
  - `account_usage_pressure`
  - `projection_trust`
- Severity should probably stay independent from blocking semantics:
  - severity answers "how bad is it"
  - blocking_effect answers "what does it prevent"

### Lifecycle direction
- Existing lifecycle still seems right:
  - `active`
  - `acknowledged`
  - `resolved`
  - `dismissed`
- Strong clarification:
  - `acknowledged`
    - user/operator has seen and accepted the concern as still real but not requiring immediate noise
  - `dismissed`
    - concern presentation was intentionally hidden/rejected as actionable framing
    - should require rationale when it disagrees with corroborated/high-severity evidence
  - `resolved`
    - underlying truth changed
    - should record `resolution_kind`
- Candidate `resolution_kind` values:
  - `fixed`
  - `accepted_risk`
  - `superseded`
  - `merged`
  - `split`
  - `invalidated`
  - `obsoleted_by_patch`
  - `obsoleted_by_recovery`

### Merge / split / supersession direction
- Concerns should not duplicate endlessly when the same underlying issue reappears.
- Recommended rules:
  - same issue persists with more evidence:
    - update existing concern
    - append sources/evidence
    - allow severity/attention escalation
  - one concern was too broad and really contains separate issues:
    - split into child concerns with lineage links
  - two concerns are actually the same issue:
    - merge into one retained concern id
    - close/redirect the merged-away ids explicitly
  - an older framing is replaced by a better/newer concern object:
    - mark older concern as `resolved` with `resolution_kind = superseded` or use explicit supersession linkage

### Relationship to reviews / corroboration / graph patch / recovery
- Recommended relationship model:
  - reviews and corroboration do not have to create new concern ids every time
  - they may:
    - create a new concern
    - reinforce an existing concern
    - downgrade/invalidate an existing concern
- Specific interaction rules:
  - review finding:
    - may nominate a concern or attach evidence to an existing concern
  - corroboration outcome:
    - may confirm/deny/escalate/downgrade concern credibility
    - should be able to turn a nominated concern into an accepted canonical concern
  - graph patch:
    - may resolve a concern
    - may supersede a concern with successor concerns if the patch reframes the issue
  - recovery:
    - may resolve operational concerns
    - may create follow-on concerns if restore/recovery exposes deeper integrity issues

### Concern ownership / authority direction
- Need to distinguish:
  - concern owner for follow-up
  - concern creator/source
  - concern resolver
- Good owner kinds still look like:
  - `Runtime`
  - `Package Overseer`
  - `Seam Overseer`
  - `Corroboration`
  - `Graph Patch`
  - `Recovery`
  - `User`
  - `External Resource`
- A concern should be allowed to change owner over time without changing identity.

### Search / routing direction
- Concern results should be object-first.
- Search result should route based on what the user likely needs:
  - operational concern summary -> `Progress` or `Seams`
  - proof/evidence-heavy concern -> `Evidence`
  - exact concern record / merge-split lineage -> `Ledger`
  - lifecycle story -> `History`
- Concern result should carry:
  - focused run implications
  - target tab
  - selected concern id
  - related object context

### UI direction
- `Progress`
  - concern attention/urgency projection
- `Seams`
  - grouped concern clusters by seam/package and weak-integration category
- `Evidence`
  - concern-backed proof and source artifacts
- `History`
  - concern timeline and major lifecycle transitions
- `Ledger`
  - exact concern record, sources, lineage, merge/split/supersession, acknowledgment/dismissal rationale

### Contradictions / gaps surfaced
- Concern importance is already established, but canonical storage/contract shape is still underdefined.
- There is no obvious current concern event family or concern record family in the local docs comparable to attempts/blocked/remediation.
- Merge/split/supersession logic for concerns is currently discussion-only, not contract-level.
- Concern interaction with corroboration and graph patch is conceptually clear but not yet formally modeled.

### Candidate fixes to carry forward
- Add a canonical concern record family and corresponding projection contract.
- Add explicit concern lineage fields for merge/split/supersession.
- Add `resolution_kind` and rationale requirements for dismiss/resolve paths.
- Define how nominated findings become canonical concerns.
- Define concern-to-review/corroboration/patch/recovery linkage explicitly.

### Do-not-forget details
- concerns should remain shared objects across surfaces, not duplicated local alert rows
- blockers requiring action must not be trivially dismissible into a false sense of health
- projection-trust failures and weak-integration findings may both mint real concerns, but they are not the same category of concern

## Research Progress - 2026-03-16 - Action Confirmation / Undo Policy

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/storage-plan.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/MiscPlan.md`
- `Plans/Contracts_V0.md`

### Key findings
- The docs already contain many action-specific confirmation rules:
  - cancel run -> confirmation
