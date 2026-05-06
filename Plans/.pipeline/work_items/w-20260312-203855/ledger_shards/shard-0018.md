  - `source_refs[]`
  - `artifact_refs[]`
  - `evidence_refs[]`
  - `summary`
  - `detail_ref?`
- Benefit:
  - Ledger and exports can inspect different record families consistently
  - search/routing can reuse common routing fields

### Review record direction
- A review record likely needs:
  - `review_id`
  - review kind:
    - package review
    - seam review
    - verifier/reviewer review
  - target scope refs
  - requested/effective reviewer identity
  - review criteria/profile
  - findings summary
  - finding refs / concern refs
  - verdict / decision
  - linked artifacts/evidence
  - timestamps
- Important rule:
  - review findings may nominate or update concerns, but the review record itself should remain distinct from concern records

### Corroboration record direction
- Corroboration likely wants at least two layers:
  - `corroboration_request` / packet
  - `corroboration_result`
- Packet should likely carry:
  - claim/issue under test
  - target scope
  - why corroboration was triggered
  - evidence set / source refs
  - required quorum model
  - participating actor refs
- Result should likely carry:
  - participant outputs
  - quorum result
  - accepted / not accepted / advisory-only result
  - resulting concern/promotion/patch implications

### Graph patch record direction
- Graph patch likely needs:
  - `graph_patch_request`
  - `graph_patch_result`
- Request should carry:
  - patch point
  - triggering issue/concern refs
  - requested structural change summary
  - affected generation
  - requester identity
- Result should carry:
  - old generation
  - new generation
  - invalidated path refs
  - new path refs
  - surviving/rejoined path refs
  - resulting concern/promotion/recovery implications

### Promotion record direction
- Promotion record should likely include:
  - promotion class
    - `lane_to_package`
    - `package_to_seam`
    - `seam_completion`
  - source scope and target scope refs
  - eligibility state at decision time
  - blocking refs / concern refs
  - review/corroboration refs
  - decision outcome
  - revocation/reopen lineage if it later changes

### Recovery record direction
- Recovery record likely needs:
  - recovery kind
    - safe-point restore
    - restart reconciliation
    - blocked prerequisite resolution
    - lane/worktree restore
  - target scope refs
  - trigger reason
  - preconditions
  - result
  - resulting attempt/run linkage
  - affected concern refs

### State transition report direction
- A state transition report looks useful as a shared exact record for consequential transitions:
  - from state
  - to state
  - target object
  - actor/source
  - why transition occurred
  - prerequisite evidence / review / corroboration refs
  - resulting downstream obligations
- This may help avoid every major object family inventing bespoke "decision summary" fields.

### Artifact vs record distinction
- Strong recommendation:
  - keep records and artifacts separate
- Working interpretation:
  - record = canonical structured object in Ledger/export/search/routing
  - artifact = file/blob/renderable output linked from the record
- Examples:
  - review markdown summary = artifact
  - review record = structured ledger object
  - corroboration packet JSON/markdown = artifact
  - corroboration result record = structured object

### Export implication
- Export contracts should likely use the record envelope as the manifest backbone.
- Then artifact files/blobs attach by reference rather than replacing record structure.

### Contradictions / gaps surfaced
- The product already assumes many exact record families, but the local docs do not shape them consistently.
- Artifacts are discussed more concretely than the governing record objects in several places.
- Search, deep links, and Ledger exact-record views will remain awkward until these record shapes are normalized.

### Candidate fixes to carry forward
- Define a shared record-envelope convention for governance/runtime record families.
- Define exact minimum shapes for:
  - review
  - corroboration request/result
  - graph patch request/result
  - promotion
  - recovery
  - state transition report
- Keep file/blob artifacts linked to records, not substituted for records.

### Do-not-forget details
- `Evidence` and `Artifacts` panes should remain distinct even when both link back to the same underlying record.
- parent-summary artifacts and UI evidence summaries are not interchangeable and should not be collapsed.
- search and deep-link routing will benefit a lot from record envelopes carrying stable scope refs.

## Research Progress - 2026-03-16 - Export Contracts

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/usage-feature.md`
- `Plans/Widget_System.md`

### Key findings
- Export support already exists in fragments:
  - config bundles are clearly defined (`.pm-bundle`)
  - thread export/share is defined
  - Usage/Ledger export is mentioned as CSV/JSON
  - Evidence items can be exported
  - storage plan mentions thread/run history export to JSONL/JSON
- Orchestrator-specific export contracts are still underspecified.
- Current language often says "export filtered view" but does not clearly answer:
  - what is the canonical manifest
  - whether exports are view-shaped or record-shaped
  - how artifacts, records, and references are packaged together
  - what happens when exported content includes historical, superseded, or removed backing objects

### Recommended export split
- Strong recommendation:
  - distinguish:
    - `record export`
    - `bundle export`
    - `view export`
- Working interpretation:
  - `record export`
    - exact structured object(s), canonical ids, references, metadata
  - `bundle export`
    - manifest + records + attached artifacts/blobs/files
  - `view export`
    - user-facing convenience representation of the current filtered table/list/chart

### Recommended Orchestrator export families
- Likely export families needed:
  - `Evidence export`
  - `Artifact export`
  - `Ledger export`
  - `Run export`
  - `Record export` for single exact records
- Working expectation:
  - `Ledger export` should be record-shaped first, CSV/JSON second
  - `Evidence export` should preserve evidence/artifact distinction
  - `Run export` should include a manifest that ties together:
    - run metadata
    - exact records
    - linked artifacts/evidence
    - historical/superseded status flags where relevant

### Manifest direction
- Strong recommendation:
  - every non-trivial Orchestrator export should include a manifest
- Candidate manifest fields:
  - `export_id`
  - `export_kind`
  - `project_id`
  - `run_id?`
  - `focused_run_id?`
  - `generated_at_utc`
