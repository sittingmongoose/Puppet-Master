# Shard 043: DL-043 — Accepted Jujutsu Surface And Contract Planning (2026-09-11)

Source: `Plans/Permissions_System.md`

Source lines: L9525-L9697

Source SHA256: `268972ec2c2406fd01166c743dcd8bbac9848781c4d5ae53876f7742f3e40582`

---

## DL-043 — Accepted Jujutsu Surface And Contract Planning (2026-09-11)

This addendum compiles accepted planning decisions only. Live semantic owners retain command admission, native behavior, authorization and evidence authority. Existing command schemas and production wiring remain unchanged.

### PS-142 — Jujutsu Action Specific Authorization And Read Boundaries

```yaml
plan_unit_id: PS-142
unit_type: security_contract
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: The accepted Jujutsu capabilities retain effect-specific Permissions and independent FileSafe
  admission through the existing owner services. Browsing, displaying a capability, creating a preview or operating
  an internal adapter service never grants execution authority for a later effect.
gui_related: false
gui_classification_reason: Defines envelope or authorization owner requirements rather than visual presentation.
depends_on:
- JJI-003
- PS-139
- SCS-018
- F2-211
- F2-212
- BRS-022
- JJI-009
unblocks: []
acceptance_criteria:
- Group undo, redo, selected-operation reversal, adoption/repair, convergence, duplicate, merge, absorption, back-out
  and selected-hunk/drag mutations revalidate exact target/native revision, writer lease, current permission,
  FileSafe, confirmation tier and idempotency at dispatch. Preview or earlier approval does not authorize a changed
  scope.
- Physically read-only browsing and earlier-state inspection cannot trigger migrations, metadata repair, snapshots
  or remote completion. Any permitted isolated read support has no write authority over the protected source.
- Marker metadata and hide/unhide require their metadata owner permission and cannot grant repository mutation,
  deletion, retention changes or ownership release. Hiding active work cannot suppress its safety warnings.
- Managed rewrite preview is an effectful workflow when it writes objects or permits external effects; preview
  creation and application each receive their applicable effect authorization. Cancellation/expiry requires truthful
  cleanup outcome, and application requires the current reviewed preview scope.
- History maintenance is explicit and target-bound, retaining Backup holds/capture/GC fences and destructive confirmation.
  Missing-data completion separately authorizes remote/credential/cost scope; browse/verify does not fetch and
  a prior credential lease does not grant completion.
- Diagnostic export requires explicit scope and destination authorization plus redaction of secrets and private
  path/content data. Technical log access respects read/redaction policy; knowledge of an operation ID or command
  string does not grant access.
- The separate internal adapter service carries the initiating identity and policy decisions; it has no independent
  authority, public service, external agent surface or permission bypass. Denied/unavailable outcomes use owner
  receipts without fabricated execution.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/Permissions_System.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d001
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d002
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d003
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d004
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d007
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d008
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d009
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d010
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d011
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d012
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d013
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d014
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d019
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d022
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d031
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d035
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d037
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d038
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d042
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d043
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d044
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```

### PS-143 — Conditional Jujutsu Publication And Forge Workflow Authorization

```yaml
plan_unit_id: PS-143
unit_type: security_contract
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: Local conflicts remain first-class local state, but publication of unresolved conflicts is blocked
  by default and any advanced path requires a qualified compatible target and current effect-specific authority.
  Bookmark selection and hosted workflow support never widen local mutation or credential authority.
gui_related: false
gui_classification_reason: Defines envelope or authorization owner requirements rather than visual presentation.
depends_on:
- PS-138
- PS-142
- JJI-019
- FGI-016
- FGI-017
unblocks: []
acceptance_criteria:
- Qualification is exact to adapter version, target and supported content behavior; unsupported or unknown compatibility
  stays blocked. Advanced publication approval binds the reviewed unresolved-content/remote scope and cannot waive
  branch protection, FileSafe, native expected-state fences or provider policy.
- Conflicted-bookmark resolution displays exact alternatives and applies only an existing admitted bookmark mutation
  with current permission and identity checks; selecting a visible candidate alone does not mutate.
- One explicitly supported stack workflow is authorized at a time with independent publication and hosted review
  creation/update scopes, provider instance, immutable revisions, credentials and current permission. Partial
  success and effect_unknown cannot be retried as though no effects occurred.
- An additional review service requires a concrete user workflow plus provider-specific authentication, identity,
  submit and recovery support; enabling it does not replace local history or authorize other providers. Local
  history remains usable when hosting is unavailable.
validation_surfaces:
- Future owner-qualified request/result, stale identity, denied, cancellation, partial and unknown-effect fixtures
- python3 scripts/pm-plan-index.py validate
risk_class: jujutsu_identity_authority_or_effect_misrepresentation
reasoning_tier: high
context_scope: dl043_accepted_jujutsu_planning
implementation_surfaces:
- Plans/Permissions_System.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d027
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d028
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d039
- source_ref:pldg-20260911-002-jujutsu-decisions:atom-jj-d5-d040
- Plans/Decision_Log.md:DL-043
negative_constraints:
- 'Planning only: no new admitted command ID, native handler, runtime readiness, EventRecord family, schema widening,
  WorkNode, NodeSeed or governance seal follows from this unit.'
- Declined DL-043 dispositions remain declined; do not reopen them or add a third-party diff/source-control library,
  external IDE/MCP interface, shared public service, custom publish hooks, specialized storage or specialized
  AI workspace-review workflow.
owner_boundary_notes:
- Jujutsu and Source Control own native semantics and admitted command contracts; Final GUI owns presentation,
  Backup owns restore/completion/maintenance policy, FileManager owns newline behavior, Permissions and FileSafe
  independently own safety, and Forge owns hosted workflows.
owner_hints:
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
- Plans/FinalGUISpec.md
- Plans/Backup_Restore_System.md
- Plans/FileManager.md
- Plans/Forge_Integrations.md
- Plans/FileSafe.md
```
