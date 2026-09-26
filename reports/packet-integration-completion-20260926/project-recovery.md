# Project creation recovery/resume — typed integration completion

Final integration status and current evidence are in README.md and validation.md. Producer handoff sections below retain intermediate counts and next steps for lineage; they are not the remaining-work list.

Date: 2026-09-26 (bounded repair per accepted independent review).
Owner scope: `Plans/Project_System.md`, `Plans/Planning_Wizard.md`,
`Plans/project_system_contracts.schema.json`,
`Plans/project_system_contract_fixtures.json`, `Plans/storage-plan.md`
(SP-321 only), `Plans/storage_value_registry.json` (one disposition row
only), and this report. This delivery repairs the open typed-integration
item **F-02** from
`reports/concept-packet-integration-20260926/project-recovery-owner.md`
(which remains the prior prose record) against the five accepted findings
in the Sol review at
`/home/sittingmongoose/PM-Experiments/packet-integration-completion-20260926/reviews/project-recovery.md`.
The prior static-shape pass did not close F-02; this repair closes the
owner-contract half (prose, typed companions, durable custody
registration). Central integration is NOT complete and is NOT claimed:
§6 hands precise deltas to the next workers.

Static contracts only. No native handler, runtime, provider,
recovery-execution, visual, or readiness proof is claimed. The resume
command stays `handler_unavailable` until the central companions in §6
land with native evidence, and the Forge delete row stays separately
`handler_unavailable` under its own owner.

## 1. What changed

Prose (preserving all `Continue Setup`, `Open Repository`, `Delete Repository`,
`effect_unknown`, and `reconcile ambiguous timeouts before retrying` tokens):

- `Plans/Project_System.md` §3.1.1: the Project-owned recovery/resume
  transition is contracted with owner-resolved join authority. The eleven
  `project_action_id` values admit exactly one resume action,
  `cmd.project.resume_creation`, and the contradictory constraint is narrowed:
  no *second* generic wrapper/alias/duplicate receipt family; the durable
  recovery context is custody, not a receipt family. Replaying the original
  creation idempotency key re-observes its terminal result with
  `replayed=true` and MUST NOT resume; a resume carries a fresh attempt
  identity bound to the original recovery. Join authority comes only from
  owner-resolved comparison of actual fields; the six `join_checks` booleans
  are an owner-computed transport echo and client values never grant
  authority. Owner `resume_eligible` is distinct from effective dispatch
  `available`; a verified created remote alone never forces
  `available=true`. Exactly one atomic-claim resume is active per recovery;
  a second new attempt is rejected or coalesced; child effects adopt only
  under the winning claim generation; crash restart reconciles in-flight
  effects first. Only `cmd.project.new_github_repo` through GI-042/GI-032
  anchors a recovery today; `new_local` never does and `add_existing` does
  only with an owned receipted remote-create chain (none defined). Delete
  Repository is consumed from the Forge FGI-021
  `cmd.forge.repository.delete` admission, never Project-local, never
  automatic, never on unknown remote. PJCT-007 and PJCT-008 acceptance,
  constraints, and lineage updated consistently; GitHub stays a PJCT-008
  consumer of the generic composition.
- `Plans/Planning_Wizard.md` PWIZ-021: the consumer projection references the
  owner-resolved join with client booleans never authoritative; Continue
  Setup is eligible only with that join and stays visible-but-unavailable
  until current draft, permission, recovery claim, central registration,
  wiring, and handler availability all hold, or while another attempt holds
  the claim; Delete consumes the Forge FGI-021 admission.
- `Plans/storage-plan.md` SP-321: new durable-custody unit for
  `pm.project.creation_recovery_context.v1` under declared key
  `project_creation_recovery_context.v1:{recovery_id}` — original
  command-instance/idempotency lookup, immutable original terminal-result
  ref/digest and Forge create evidence, composition currentness,
  one-atomic-claim admission, claim fencing, crash-restart reconciliation,
  retention until a terminal listed or owner-confirmed-abandoned outcome,
  and restart lookup that returns the retained recovery. Disposition-only:
  `physical_family_registration_pending`, no families row, no writer, no
  EventRecord, no receipt family, census unchanged.

Machine contracts (`Plans/project_system_contracts.schema.json`):

- `project_action_id` keeps `cmd.project.resume_creation` as the sole
  Project recovery action (sole planned target
  `handlers::project::resume_creation`, `handler_unavailable`).
- `project_creation_recovery_context` gains immutable
  `original_terminal_result_ref`/`_sha256`, nullable `active_resume_claim`
  (`creation_recovery_resume_claim`: attempt instance/key, claim generation,
  timestamp), and a narrowed `original_command_id` enum holding only
  `cmd.project.new_github_repo`. Verified contexts now require
  `resume_eligible=true` with `available=false` (reason
  `central_dispatch_unavailable` or `concurrent_resume_active`).
- `creation_recovery_resume_binding` gains `recovery_composition_revision`,
  the same narrowed original enum, and explicitly de-authorized
  `join_checks` (`x-owner-computed-after-resolution`,
  `x-client-attestation-grants-no-authority`): the semantic validator
  ignores the booleans and compares actual fields.
- New `creation_recovery_resume_round_trip`
  (`pm.project.creation_recovery_resume_round_trip.v1`): paired retained
  context + candidate resume request + original rejected terminal result +
  `expected_semantic_outcome`, with nineteen `x-semantic-invariants`
  covering the entire draft binding, original identities, Forge
  result/receipt refs with repository binding, composition revision/hash,
  settled/remaining sets with disjointness, rejected-terminal original
  identity, and claim fencing. Seventeen named semantic failures (§6) are
  the authority the script implementer enforces.
- Resume requests keep the disjoint `idempotency:project:resume:` and
  `command:project:resume:` namespaces, explicit authorization, and
  binding-only draft. Resume results accept only as listed/persisted.
  `project_setup_commit_binding` admits the resume command; no commit
  binding forms from a bare recovery context.
- `recovery_route_availability`: Continue Setup splits owner
  `resume_eligible`/`eligible_reason` from effective dispatch
  `available`/`reason` (`available=true` still implies
  `resume_join_contracted`, which no fixture claims while central gates
  are unmet); Open Repository only with a verified binding; Delete
  Repository stays const-unavailable in Project scope with reason
  `forge_owner_gated` consuming FGI-021. Unknown remote state forces
  reconcile-only availability with no repository identity anywhere.

Fixtures (`Plans/project_system_contract_fixtures.json`): prior 6 positives
updated to the repaired shapes plus 9 new round-trip positives (one full
match pass, six adversarial mismatches with every boolean true —
operation, draft, repository, stale composition, settled-effect replay,
concurrent attempt, original-result identity — and one self-claim pass);
8 new structural negatives (new_local/add_existing originals, missing
composition revision, stale delete reason, eligible-unknown, missing
terminal digest, missing claim slot); the 5 bool-flip negatives kept as
transport invariants with corrected meanings; the stale
available-must-be-true negative inverted to eligible-not-dispatchable.

Registry (`Plans/storage_value_registry.json`): one new
`contract_family_dispositions` row `scd.project.recovery_context.v1`
(durable, `physical_family_registration_pending`, runtime evidence
false). Families array untouched at 294 rows; census unchanged.

## 2. Command census basis

Central catalog review before naming: no `cmd.project` resume or
creation-recovery ID exists. `cmd.project.move.resume` and
`cmd.project.move.retry` are Project Sync and Backbone PSB-005 move
operations; `cmd.authentication.resume` (with `cmd.auth_session.*` aliases)
is the authentication continuation; `cmd.forge.pipeline.retry` and related
retries are Forge-owned. The new `cmd.project.resume_creation` is therefore a
new Project-owned primary with sole planned target
`handlers::project::resume_creation`, not an alias of any runtime retry or
auth resume. Fixtures reject both nearest-neighbor spellings.

## 3. Recovery/resume semantics (normative summary)

1. A creation attempt that created a remote repository and then failed locally
   retains one `project_creation_recovery_context` under SP-321 custody. No
   half-listed Project, no speculative identity, no commit binding. Only
   `cmd.project.new_github_repo` anchors one today; `new_local` never does.
2. Replaying the original idempotency key re-observes the terminal result and
   never advances it.
3. While the remote effect is `unknown`, only Forge/SCM reconciliation runs —
   no repeat create, no delete, no inferred identity
   (`reconcile ambiguous timeouts before retrying`; Forge `effect_unknown`
   admits only reconciliation-only retry).
4. A resume is explicitly authorized, uses a fresh resume-namespaced attempt
   identity bound to the original recovery, revalidates identity, currentness,
   and permissions, and executes only remaining effects. Authority is
   owner-resolved field comparison; client booleans are ignored.
5. Stale/changed draft, mismatched repository binding or original operation, a
   repeated settled effect, or an unverified/unknown remote fails closed —
   even with every `join_checks` boolean true.
6. The composition persists under its recovery identity with revision and hash;
   Close, reload, or Client loss re-observes the same recovery.
7. Exactly one atomic-claim resume is active per recovery; a second new
   attempt is rejected or coalesced; child effects adopt only under the
   winning claim; crash restart reconciles in-flight effects first.
8. Owner eligibility (`resume_eligible`) is distinct from effective dispatch
   (`available`); verified-created alone never dispatches.
9. Settings rebind (SSYS-036) settles under the resumed operation before
   listing, exactly as on first attempt.

## 4. Forge coordination

Repository deletion is Forge-owned and stays undispatched from Project scope.
This delivery consumes the parallel Forge owner's FGI-021 admission of
`cmd.forge.repository.delete` (sole future handler
`handlers::forge::repository_delete`, `handler_unavailable`): exact
provider, variant, normalized host, stable account, PM `repo_id`, provider
repository ID, locator, binding generation, current direct revalidation
with `mutation_safety=verified`, effective authority, `remote_side_effect`
permission with a human actor, verified-create result and receipt refs,
and fresh target-bound human confirmation, with `effect_unknown` admitting
only reconciliation-only retry. It never runs as automatic rollback, never
as part of Continue Setup or any resume, never while the remote effect is
unknown, and never on provider-scope or selected-source-authentication
reuse. Project System dispatches no delete command, phantom or otherwise;
Project-scope Delete stays `forge_owner_gated` until the Forge owner
proves its own dispatch gates. The prior
`forge_delete_contract_not_admitted` reason is removed from the owner
schema.

## 5. GitHub consumer boundary

PJCT-008 is unchanged in authority: for the exact
`cmd.project.new_github_repo` / GI-042 case it consumes this generic
composition with the GI-042 terminal create result as the verified remote
result and GI-032 as the remote-side-effect boundary. All other provider
routes stay open under PJCT-007 until their own command chains supply verified
remote results.

## 6. Central companion delta handoff

None of the following are in this delivery (shared central files, scripts,
and generated artifacts are untouched by design). Central integration is
not complete.

### 6a. Semantic script implementer spec (separate worker, no script edits here)

Add a `creation_recovery_resume_round_trip` semantic function to the
central contracts gate (same pattern as `server_remote_semantic_failures`
for `command_round_trip`). Input: one round-trip bundle. The function
MUST NOT read `join_checks`. It resolves the retained context, the
original terminal result, and the Forge create result/receipt server-side
and compares actual values with exact string equality, exact integer
equality, deep object equality (key order irrelevant, no coercion), and
set equality:

- `resume_original_command_mismatch`: binding `original_command_id` !=
  retained `original_command_id`.
- `resume_original_instance_mismatch`: binding
  `original_command_instance_id` != retained.
- `resume_original_idempotency_mismatch`: binding
  `original_idempotency_key` != retained.
- `resume_original_operation_mismatch`: binding `original_operation_ref`
  != retained. (This is the review's counterexample: a changed operation
  ref with all booleans true must fail.)
- `resume_reviewed_draft_mismatch`: binding `reviewed_setup_binding` !=
  retained deep-equal over the entire binding (plan ref/revision/hash,
  draft ref/revision, consent, preflight, Settings preview ref/hash).
- `resume_forge_result_ref_mismatch` / `resume_forge_receipt_ref_mismatch`:
  binding Forge refs != retained refs.
- `resume_repository_binding_mismatch`: binding `repository_binding` !=
  retained deep-equal (provider, normalized host, account, provider
  repository ID).
- `resume_composition_revision_stale`: binding
  `recovery_composition_revision` != retained `composition_revision`.
- `resume_composition_hash_mismatch`: binding
  `recovery_composition_sha256` != retained `composition_sha256`.
- `resume_settled_effects_mismatch`: set of binding
  `settled_effect_names` != set of retained `settled_effects` keys.
- `resume_remaining_effects_mismatch`: binding `remaining_effects` !=
  retained `remaining_effects` as sets.
- `resume_settled_remaining_overlap`: binding settled ∩ remaining is
  non-empty (a settled effect would repeat).
- `resume_remote_effect_not_verified`: retained `remote_effect_state` !=
  `verified_created`.
- `resume_original_result_identity_mismatch`: original result `action_id`
  or `command_instance_id` != retained original command/instance.
- `resume_original_result_not_rejected_terminal`: original result
  `outcome` != `rejected` or `project_id` != null.
- `resume_concurrent_active_attempt`: retained `active_resume_claim` is
  non-null and its `attempt_command_instance_id` != the candidate
  `command_instance_id`.

Accepted iff the failure list is empty. The 9 round-trip fixtures in §1
are the conformance vectors: the script's computed failures must equal
each bundle's `expected_semantic_outcome`. After the function lands, the
adversarial bundles should additionally be promoted to `semantic_rule`
negatives in a follow-up (not done here: no script edits in this
delivery).

### 6b. Central catalog / wiring / DRY deltas (separate worker)

- Commands_System: register primary `cmd.project.resume_creation` with
  owner `Plans/Project_System.md` / PJCT-007, sole target
  `handlers::project::resume_creation`, request
  `Plans/project_system_contracts.schema.json#/$defs/project_action_request`,
  result `...#/$defs/project_action_result`, initial `handler_unavailable`,
  `expected_event_types=[]`, receipt-only effects.
- UI_Command_Catalog: mirror the primary row with consumers Projects page,
  Product Onboarding automatic_preparation, palette/API. No alias rows:
  `cmd.project.move.resume`, `cmd.project.move.retry`, and
  `cmd.authentication.resume` must not normalize to or from this ID.
- Wiring_Matrix production rows for the three recovery routes: Continue
  Setup dispatches the resume command only when the retained context
  reports `resume_eligible=true` AND central availability holds (never on
  eligibility alone); Open Repository dispatches existing
  `cmd.forge.repository.open_in_browser` with the verified binding; Delete
  Repository has no Project wiring row (Forge owner wires
  `cmd.forge.repository.delete` under FGI-021 with its confirmation).
- DRY/consumers: Product Onboarding and Final GUI companions consume the
  owner eligibility/availability split and the FGI-021 delete admission
  without re-owning them; no consumer may map `verified_created` or
  `resume_eligible` directly to dispatch-available.
- Permission/currentness gates: revalidate actor creation permission,
  registry revision/hash, recovery composition revision/hash, and
  reviewed-draft revision/hash at dispatch; stale or mismatched values
  reject before any owner effect. FileSafe evidence is required where the
  remaining steps touch local writes.
- Manager routes: Projects page recovery notice, Onboarding
  `automatic_preparation` projection over the recovery context (consumer
  of the owner record, never a second writer), Settings rebind path
  unchanged.

### 6c. Native and storage follow-ups (separate workers)

- Native handler: implement `handlers::project::resume_creation` with the
  §6a comparisons at dispatch, atomic compare-and-swap admission of the
  one-active-resume claim (reject or coalesce a second new attempt),
  claim-generation/attempt fencing of child effects and result adoption,
  remaining-effects-only execution with no second remote create, Forge
  terminal result/receipt verification through the Forge owner, and
  crash-restart reconciliation of in-flight effects before retry.
  `handler_unavailable` lifts only with source-hashed native evidence.
- Storage physical registration: materialize
  `project_creation_recovery_context.v1:{recovery_id}` under the SP-251
  layer with the SP-321 retention/lookup contract; no writer until then.
- Positive cases: verified-create→local-failure→resume→listed;
  unknown→reconcile→verified→resume; failed-before-effect retains no
  identity; self-claim re-dispatch coalesces; resumed commit binding
  unlocks provider setup.
- Negative cases: every fixture in §1 replayed natively, plus restart
  during resume re-observing the same recovery, concurrent second-attempt
  rejection, central-unavailable dispatch refusal, and Delete attempted
  outside the Forge FGI-021 gates.

## 7. Verification (read-only, targeted only)

- Targeted owned-pair probe `/tmp/check_project_recovery_repair.py` (kept
  outside the repo for re-runs): schema valid Draft 2020-12; 64/64 owned
  positives valid; 94/94 owned negatives rejected; 9/9 round-trip bundles
  discriminate exactly as specified with every adversarial bundle keeping
  all six booleans true. TOTAL_FAILURES=0. The probe additionally
  implements the §6a comparison algorithm independently and reproduces
  each bundle's `expected_semantic_outcome`, including the review's
  operation-ref counterexample.
- Targeted registry check: `Plans/storage_value_registry.json` validates
  against `Plans/storage_value_registry.schema.json` with 0 errors; the
  new `scd.project.recovery_context.v1` row is present; families array
  stays at 294 rows (census unchanged).
- Full `pm-new-contracts-verify.py`, `run-gates`, shard/index/governance
  checks, and generation were deliberately NOT run: other workers are
  editing in this worktree and repository-wide gates would measure their
  diffs, not this bounded repair.
- Prose/token grep: all preserved exact tokens (`Continue Setup`, `Open
  Repository`, `Delete Repository`, `effect_unknown`, `reconcile ambiguous
  timeouts before retrying`) intact in PJCT-007/PJCT-008/PWIZ-021; no
  remaining `forge_delete_contract_not_admitted`, no
  available-must-be-true, and no replay-as-resume wording in the owned
  docs; no owned edit outside the seven owned paths; no shard/index/
  governance writes; no commits, pushes, branches, or subagents.

## Focused second-review integration

Root added explicit recovery-ref equality, two-field self-claim identity, and CV-333 canonical original-result digest requirements to the owner/schema semantic contract. Round-trip fixtures now carry real hashes from the existing static integer/string-only owner-result oracle, plus three schema-valid adversarial cases for wrong recovery identity, changed original payload under an unchanged digest, and a same-instance/different-key claim. The dedicated semantic validator consumes these relationships; this remains static evidence and does not authenticate a native resolver.
