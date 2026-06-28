# Shard 004: Canonical data-shape reconciliation

Source: `Plans/Permissions_System.md`

Source lines: L34-L87

Source SHA256: `d6156ef7d2dcf06217ce1334dcb57dfa7a187389f90e9f03ba41ee75ed6df69a`

---

## Canonical data-shape reconciliation
### Required data shape

#### Acceptance carry-through
- Add requested_account_id alongside requested_account_policy
- Add requested_account_binding and govern provider_account_id as subordinate provider-native metadata
- Carry requested/effective account identity through runtime, bridged-provider, and permission envelopes
- Move OpenCode session IDs to provider-native correlation fields instead of canonical thread_id
- Define Approval Scope Key across actor/lane/run/account context and reuse it across permissions, HITL, doom-loop, and session approval caching
- Under `## Canonical data-shape reconciliation` -> `### Required data shape`, explicitly place `requested_account_id` alongside `requested_account_policy`.
- Define `requested_account_binding` and keep `provider_account_id` governed only as subordinate provider-native metadata rather than canonical account identity.
- Require requested/effective account identity to survive runtime, bridged-provider, and permission envelopes.
- State that OpenCode session IDs move into provider-native correlation fields instead of canonical `thread_id`.
- Define `approval_scope_key` across actor/lane/run/account context and require reuse across permissions, HITL, doom-loop, and session approval caching.

### P5 permission authority recovery

Permission prompts are no longer session-centric or under-bound: `ask -> deny unless HITL at current tier boundary` is a deprecated tier-era behavior, and the active blocked-overlay flow requires HITL, `/account`, `/lane/run/account`, shared-runtime, actor, lane, run, account, and operational identity scope on approval snapshots and approval caching.

Session-scoped approval logic, permission session cache, reject cascade, and OpenCode SSE/session isolation must resolve through actor/lane-aware boundaries: the explicit `/actor/lane` scope key includes actor, run, lane, account, and package/seam context before approval reuse. The permission layer must not mix tier-boundary governance with tool-level HITL approval semantics; tier-boundary language is compatibility only, while tool-level approval, HITL approval, and blocked-state approval use the shared approval scope and permission snapshot fields.

Permission resolution and approval carryover/cascade are execution-entity scoped. Lane, package, `/lane/account`, effective-account, and effective account `/identity` facts remain part of the approval snapshot, and blocked cards must explain which effective account/identity would have executed before any `/cascade` or reject-cascade reuse applies.

Runtime artifact permission drill-through preserves `Plans/Runtime_Artifacts_Panel.md`, `/Runtime_Artifacts_Panel.md`, `/schema-family`, attempt-key, envelope family, and deterministic drill-through ownership when a permission prompt points into runtime artifacts.

Runtime state hooks must carry blocked_reason_code?, allowed_action_ids[]?, failure_class?, permission_snapshot_id?, provider_attempt_ref?, blocked_reason_code, allowed_action_ids, failure_class, permission_snapshot_id, and provider_attempt_ref so permission cards and blocked-state records share the same hook vocabulary.

Blocked-state approval actions map from canonical allowed_action_ids[] and allowed_action_ids, while graph approval actions target request_id; consumer surfaces must not split blocked-state authority away from request identity.

Worktree permission policy references `Plans/WorktreeGitImprovement.md`, `/WorktreeGitImprovement.md`, and per-subtask only as lineage; lane pools and parallel toggles must be reconciled before per-subtask worktrees can drive permission scope.

Decision policy integration preserves `Plans/Decision_Policy.md`, `/Decision_Policy.md`, and `/storage/runtime` deterministic policy ownership for executor, storage, and runtime surfaces that consume permission decisions.

Remote side effects and mode-override semantics reconcile `ask/plan -> deny`, `/plan`, `/approval`, external_publish_side_effect, side-effect, and non-bypassable approval behavior so mutating remote publication cannot diverge by surface or mode.

Provider-gap disclosure is separate from overrides: provider-gap states honored, skipped, and clamped describe requested/effective provider behavior and must not be collapsed into generic override wording.

Requested/effective permission display may stay compact only when requested == effective and no control was skipped or `/clamped`; if they differ, the permission UI must expand and `/disclose` the reason visibly on the owning surface.

Degraded-trust and projection-health are permission-visible trust inputs. Permission cards, approval surfaces, Orchestrator, Usage, widgets, and provider surfaces consume one degraded-trust / projection-health / concern bridge so stale, degraded, or restricted-trust render states cannot masquerade as fresh authority. Artifact and `/file` routing must support attempt_id and other runtime object ids directly, and read-only, historical, and restricted-trust rendering must be explicit in the permission disclosure.

DRY reference integrity remains permission-visible: `DRY_Rules.md`, DRY_Rules, ContractRef, ContractName, and cross-reference cleanup must stay internally consistent where permission cards link gates, anchors, or contract examples.

Route contracts keep line `/range` under OpenFile, and object-family-specific anchors must justify themselves instead of defaulting every special case into the base route contract.

GATE-003, GATE, owner-doc, and ContractRef syntax defects are hard owner-doc integrity failures, not style preferences, when permission or gate cards expose contract links.

Search permission surfaces distinguish global object search from tab-local filtering; tab-local and tab-local filtering narrow an already selected surface, while global object search crosses surfaces and needs separate permission disclosure.

Route-target and subject-open permissions approve the exact target they display. Permission cards must preserve route-target, subject-open, `/output`, OpenFile, path-based `/file` opens, `line?` / `range?` targeting when path-based, and editor-group realization as separate target facts instead of hiding them behind a generic file-open prompt.

Navigation approvals inherit the same layered target model: the shared target object comes first, specialized open `/navigation` verbs sit above it, and path-open is one specialization rather than the base primitive.

Small permission surfaces keep canonical terms and compact labels. Source Control remains worktree-first, graph badges and inspector chips stay dense, and `/contextual` help links expand to deeper explanations instead of renaming local jargon.
