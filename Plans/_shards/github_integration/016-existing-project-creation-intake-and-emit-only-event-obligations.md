# Shard 016: Existing Project creation intake and emit-only event obligations — GI-042

Source: `Plans/GitHub_Integration.md`

Source lines: L2518-L2618

Source SHA256: `a128627d85b0eb7cafb591dd7f33e769fcad42a272294631f99c93f272a50e4c`

---

## Existing Project creation intake and emit-only event obligations — GI-042

DL-039 `EMIT-PERSIST-026 = ACCEPT_EMIT_OBLIGATION_ONLY` keeps both exact events
`quarantined_not_admitted`. Their typed payload and command/result joins remain
candidate contracts; they authorize no EventRecord registration, persistence,
admitted-event replay, projection or checkpoint advance. This corrects the earlier
admission claim while preserving the fixed54 holding receipt and validator.

The existing `cmd.project.new_github_repo` normalizes to Project System's
`project_action_request`; PJCT-008 owns registration and terminal Project success.
GI-032 remains the remote-side-effect/durable-receipt boundary. GitHub API account
authorization is distinct from Copilot; GitHub remains optional. The approved owner
intent resolves account, organization/owner, options and target source binding.
No credentials, auth-bearing URLs, absolute local paths or mutable UI field bags
enter the event payload. The former catalog field-list summary is not a second DTO.

The send-only `github.repo.create_requested` payload describes one durably accepted
command intent by
`GitHubIntegration.repository_creation`, after current actor permission, explicit
remote-side-effect approval, GitHub API account authorization, source/FileSafe
preflight and registry-currentness checks, before API mutation. It does not mean
the repository or Project exists. Its candidate EventRecord v2 scope is application
with `project_id=null`, without permission to append that record. The typed payload is
`Plans/github_project_event_payloads.schema.json#/$defs/create_requested`.
Original request digest, operation ID, approved source/repository/Home Server refs,
actor and admission receipt bind later results. `admission_receipt_ref` is the
owner's command-intake receipt, never an Event Authority registration receipt.
Account/Server resolution must be
authenticated by owners, not asserted by producers or Clients.

API creation and local source preparation retain their exact receipts. Only
PJCT-008 owns the `project.github_repo_bound` send-only obligation after atomic
commit/readback. Both
names were already required by one production-intent placement: these are separate
transitions, not two mandatory effects of every dispatch. Denied/cancelled/duplicate
intake emits no new requested event. Later failure preserves historical intake
without fabricating a bound event. Creation replay returns original owner truth
without re-running API/clone/registration or re-emitting either transition.
Neither send-only obligation authorizes persisted EventRecord emission.

Rows 0/1 of `Plans/github_project_event_admission.json` record explicit non-admission;
the retained filename grants no authority. Family/scope metadata, Case L storage and
hold-aware `RP-AUTHORITY-INDEFINITE` 1.0.0 are proposals for any separately authorized
future storage decision, not registered bindings or operative retention assignments.
No new physical family is introduced. Producer, actor/scope, request/result digest
and receipt joins are checked independently of admission. Closed metadata-only
candidate payloads have a 65,536 UTF-8 byte maximum and
`no_secrets`; no alias, legacy extension or migration is admitted. Unowned
thread/run/node/attempt and account envelope identities stay null. Correlation is
the original operation; the transition idempotency key hashes command, event type,
resolved Server, actor and request idempotency key. The separate payload digest
detects changed content under that key.

Every attempted EventRecord append or replay of either event is quarantined,
including valid candidates, duplicate/changed transport IDs and old retained
records. No event identity, operation binding or dedupe key is consumed; no fact is
projected and no existing checkpoint advances. Candidate validation remains separate
and checks exact original request, intake receipt, committed result and readback;
the no-admission denial must not make malformed-payload tests pass vacuously.
Command-result retry still resolves the original approved request and retained
owner receipts under GI-032/PJCT-008 without repeating remote or local effects.
That command behavior is distinct from, and does not enable, persisted-event replay.
Synthetic owner snapshots are not authenticated lookups or durability proof.

Static validation proves candidate joins and the explicit no-admission boundary,
preserving the pre-existing 92 event rows with these two absent. It does not turn
six withdrawn Testing/GitHub memberships into exclusions from the fixed54 holding
cohort. The global denominator stays `UNKNOWN_OPEN`; historical
kernel pins are not rewritten into a seal. Native authentication/receipt resolution,
API/clone/registry adapters, restart persistence, production dispatch and runtime
security evidence remain unimplemented/unproved.

### GI-042 - Existing GitHub creation intake and emit-only transitions

```yaml
plan_unit_id: GI-042
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: The existing GitHub Project-creation command joins approved application-scoped intake to PJCT-008 committed Project binding through the existing Project action family, explicit GitHub API authority and retained receipts; its two typed candidate event obligations remain quarantined_not_admitted under DL-039 and authorize no persisted append or replay.
gui_related: false
gui_classification_reason: Non-visual command, authority, event and replay integration.
depends_on: [GI-032, PJCT-001, PJCT-002]
unblocks: [PJCT-008]
acceptance_criteria:
- Approved intake has no invented Project and proves GitHub API account/actor, permission, remote approval, FileSafe and currentness bindings.
- Both candidates have closed metadata-only payloads and exact owner/scope/receipt joins; proposed retention/storage metadata grants no registered binding.
- Candidate validation rejects malformed/foreign/unauthorized bindings independently of the no-admission guard; valid candidates still cannot append or replay.
- Duplicate, changed-ID and restart inputs quarantine without consuming identity or changing existing checkpoint/projection state; command-result retry remains separately owner-routed.
- No new command, handler, physical family, UI design, native proof, readiness or global audit pass is inferred.
validation_surfaces: [Plans/github_project_event_admission.json, Plans/github_project_event_payloads.schema.json, Plans/github_project_event_fixtures.json, scripts/pm-github-project-integration.py, tests/test_pm_github_project_integration.py]
risk_class: duplicate_remote_effect_or_false_project_creation
reasoning_tier: high
context_scope: existing_github_creation_emit_obligations
implementation_surfaces: [Plans/GitHub_Integration.md, Plans/Project_System.md, Plans/event_family_registry.json]
node_compile_hint: {mode: static_owner_integration_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-039, Plans/GitHub_Integration.md#GI-032, Plans/Project_System.md#3-actions-commands-and-results, Plans/Wiring_Matrix.production.json#/entries/catalog.project_new_github_repo]
negative_constraints: [No Copilot-as-GitHub-API authority., No credentials or content payloads., No provisional Project scope., No replayed effects., No event admission or persisted append/replay authorization., No holding-receipt or validator rewrite., No legacy admission or native/global certification claim.]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-039, ContractName:Plans/Project_System.md#PJCT-008, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/storage-plan.md#case-l-5-eventrecord-persistence-legacy-normalization-and-dedupe
