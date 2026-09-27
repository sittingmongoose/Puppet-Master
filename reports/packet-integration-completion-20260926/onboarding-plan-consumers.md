# Onboarding plan consumers — Project recovery projection completion

Final integration status and current evidence are in README.md and validation.md. Producer handoff sections below retain intermediate counts and next steps for lineage; they are not the remaining-work list.

Date: 2026-09-26 (bounded consumer lane per the cross-owner map).
Owner scope: `Plans/product_onboarding_contracts.schema.json`,
`Plans/product_onboarding_contract_fixtures.json`,
`Plans/Settings_System.md` (SSYS-036 only), `Plans/FinalGUISpec.md`
(F3-520 only), and this report. Implements the Product Onboarding and
Settings rows of
`/home/sittingmongoose/PM-Experiments/packet-integration-completion-20260926/reviews/cross-owner-consumers.md`
against the repaired Project owner (`Plans/Project_System.md` §3.1.1,
PJCT-007/008) and the Forge FGI-021 admissions. Static contracts only:
no native handler, runtime, provider, recovery-execution, visual, or
readiness proof is claimed, and no concept fixture is runtime evidence.

## 1. What changed

- New consumer definition
  `onboarding_project_recovery_route_projection`
  (`pm.product_onboarding.project_recovery_route_projection.v2`,
  v2.0.0) in the onboarding schema, added to the `oneOf` root and to
  `x-owner-contract-refs` (PWIZ-021, PJCT-007, the three Project
  recovery defs, FGI-021). It is a reference/currentness/route
  **view** over the retained Project
  `project_creation_recovery_context`; it stores no recovery state,
  mints no command, and the 13 `ui.onboarding.*` actions are unchanged.
- `observation_kind` separates `original_result_observation`
  (resume_attempt ids null, disposition
  `observe_original_terminal_result`) from
  `authorized_resume_attempt` (resume-namespaced ids matching the
  Project owner patterns `^command:project:resume:.+` /
  `^idempotency:project:resume:.+`, disposition
  `resume_by_fresh_authorized_attempt`).
- Exact owner shapes are referenced, not mirrored:
  `verified_repository_identity`,
  `onboarding_project_setup_binding`,
  `creation_recovery_resume_claim`,
  `creation_recovery_effect` (settled/remaining sets), and the full
  `recovery_route_availability` with its eligibility/availability
  split. `original_command_id` consumes the narrowed owner anchor
  (`cmd.project.new_github_repo` only).
- Schema-enforced consumer rules: identity fields present iff
  `verified_created`; `unknown` and `failed_before_effect` force
  `selected_route=reconcile_only`; Continue requires an authorized
  attempt plus owner `resume_eligible=true`; actual dispatch remains gated by owner `available`; Open requires owner
  `available=true` with original observation; Delete requires the
  `forge_owner_gated` reason with original observation; route reasons
  must agree with binding presence; verified implies settled
  `remote_repository_create`; unknown never settles it; all six
  effects are settled/remaining disjoint; `listed_project_id` and
  `setup_commit_binding` are null (no identity, binding, or provider
  phase from a recovery view).
- Fixtures: 8 projection positives (observed-but-blocked,
  claimed-resume Continue, unknown, failed-before-effect,
  concurrent-claim-holds, Open selected, Delete-to-Forge, settled
  Settings not re-applied), 3 `ui.onboarding.open_owner_flow`
  request positives (resume/open/delete with exact owner command
  ids), 16 structural negatives (unknown+delete, failed+identity,
  original-namespace reuse, observation-with-attempt, 2 currentness
  flips, concurrent-claims-available, Settings re-applied, verified
  without settled create, speculative Project, minted binding,
  local anchor, open-reason contradiction, Continue-without-owner-eligibility,
  delete-reason contradiction, Open-with-attempt), plus
  `resolved_owner_inputs["request:project-resume-01"]` carrying the
  verbatim Project resume request. Coverage totals updated
  (30 requests, 212 invalids) with three new recovery counters.
- SSYS-036: one canonical-text sentence plus one acceptance row and
  one negative row — a Project resume consumes the same exact
  rebind/apply outcome, skips settled `settings_rebind_apply`, and
  reconciles unknown Settings effects through Settings. No Settings
  recovery DTO/command was added.
- F3-520: canonical-text recovery sentence, two acceptance rows
  (exact three choices with owner commands and exact disabled
  reasons; no binding/provider phase before the listed persisted
  Project), one narrow carve-out to the auto-advance row (a
  recovery-required result presents the explicit choices instead of
  auto-advancing), three new exact tokens (`Continue Setup`,
  `Open Repository`, `Delete Repository`, each occurring in the
  unit text), and PJCT-007/FGI-021 source-lineage rows.
- Assessed and left unchanged: F3-521 (tour-only, no conflicting
  statement), F3-528/529 (RecoveryKitHandoff owner-result/no-secret
  boundary already correct), `Plans/00-plans-index.md` (the
  2026-09-10 "exact once-only Project commit binding" summary
  remains true for first commit plus explicit recovery).

## 2. Exact owner refs, types, and actions consumed

| Consumer element | Owner contract |
|---|---|
| `reviewed_setup_binding` | `project_system_contracts.schema.json#/$defs/onboarding_project_setup_binding` |
| `repository_binding` | `...#/$defs/verified_repository_identity` |
| `settled_effect_names`, `remaining_effects` items | `...#/$defs/creation_recovery_effect` |
| `active_resume_claim` | `...#/$defs/creation_recovery_resume_claim` |
| `route_availability` | `...#/$defs/recovery_route_availability` |
| Continue Setup dispatch | `cmd.project.resume_creation` + `creation_recovery_resume_binding` (PJCT-007 §3.1.1) |
| Open Repository dispatch | `cmd.forge.repository.open_in_browser` on the verified binding |
| Delete Repository route | `cmd.forge.repository.delete` (FGI-021), exact currentness + fresh target-bound human confirmation |
| Unknown remote | reconcile-only; no repeat create, delete, or inferred identity |
| Local trigger | `ui.onboarding.open_owner_flow` only; no `cmd.onboarding.*` |

## 3. Validation (scoped, single pass)

- `Draft202012Validator.check_schema` on the edited schema: pass.
- Own pair via the gate's own helpers
  (`validator_for` + `offline_schema_registry` +
  `onboarding_semantic_failures`, current tree): 111/111 positives
  structurally and semantically valid; 212/212 negatives rejected
  (206 structural incl. all 16 new, 6 pre-existing semantic-rule).
- `tests/test_pm_onboarding_phases.py`: 41/42 pass, including both
  whole-pack iteration tests and the exact-13-actions test. The one
  failure is `test_existing_family_and_retention_census_is_unchanged`
  (storage-registry digest), caused by the peer Project lane's
  `Plans/storage_value_registry.json` SP-321 edit, which is outside
  this lane's owned files; not fixed here per the preserve-peer-edits
  rule. No full gates were run while peer schemas evolve.

## 4. Semantic comparisons for the separate validator producer

Single-record JSON Schema cannot compare fields across records, so
the accepting adapter/central validator must additionally compare,
with exact string/integer/deep/set equality against the
owner-resolved retained `project_creation_recovery_context`:

1. `recovery_ref`, `recovery_composition_revision`,
   `recovery_composition_sha256` equal the retained recovery.
2. `reviewed_setup_binding` deep-equals the retained reviewed
   binding (all nine fields).
3. Original command/instance/idempotency/operation identities plus
   terminal result ref and digest equal the retained originals.
4. Forge create result/receipt refs and `repository_binding`
   deep-equal the retained verified create result (all four
   identity fields).
5. `settled_effect_names`/`remaining_effects` equal the retained
   sets and are disjoint (schema covers the six pairwise
   disjointness rules only).
6. `active_resume_claim` attempt ids equal the authorized
   attempt's ids at a fresh generation, or null when no attempt is
   active; a second attempt under another held claim is
   rejected/coalesced.
7. The `currentness` block is a transport echo: the adapter
   re-compares session, plan revision/hash, target, revision,
   continuation, projection generation, and composition before
   accepting; a `true` boolean grants no authority.

## 5. Required outside-scope deltas

- Central validator producer: implement §4 (this lane changed no
  scripts). Continue stays `handler_unavailable` until central
  registration, wiring, and native handler gates land with native
  evidence; Forge open/delete rows stay separately gated by Forge.
- Peer lanes own: Project/Forge/Commands/catalog/wiring dispatch
  admission, the storage-census test reseal after the SP-321
  registry edit lands, and any `cmd.forge.repository.delete`
  confirmation-flow companions.

Final paired validation additionally resolves the two unknown/failed original Project terminal results, recomputes their canonical digests, and compares exact owner route availability. Selecting Continue records intent; owner eligibility does not confer central dispatch availability.
