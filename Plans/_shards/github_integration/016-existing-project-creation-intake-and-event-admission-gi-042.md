# Shard 016: Existing Project creation intake and event admission — GI-042

Source: `Plans/GitHub_Integration.md`

Source lines: L2518-L2604

Source SHA256: `a8d9c1a920d9cc7c09bed2758a8ee8f04033f1d5e5ef34362b0e9dfe25bcb5ca`

---

## Existing Project creation intake and event admission — GI-042

The existing `cmd.project.new_github_repo` normalizes to Project System's
`project_action_request`; PJCT-008 owns registration and terminal Project success.
GI-032 remains the remote-side-effect/durable-receipt boundary. GitHub API account
authorization is distinct from Copilot; GitHub remains optional. The approved owner
intent resolves account, organization/owner, options and target source binding.
No credentials, auth-bearing URLs, absolute local paths or mutable UI field bags
enter the event payload. The former catalog field-list summary is not a second DTO.

`github.repo.create_requested` records one durably accepted creation intent by
`GitHubIntegration.repository_creation`, after current actor permission, explicit
remote-side-effect approval, GitHub API account authorization, source/FileSafe
preflight and registry-currentness checks, before API mutation. It does not mean
the repository or Project exists. It uses application-scoped EventRecord v2 with
`project_id=null`. The typed payload is
`Plans/github_project_event_payloads.schema.json#/$defs/create_requested`.
Original request digest, operation ID, approved source/repository/Home Server refs,
actor and admission receipt bind later results. Account/Server resolution must be
authenticated by owners, not asserted by producers or Clients.

API creation and local source preparation retain their exact receipts. Only
PJCT-008 publishes `project.github_repo_bound` after atomic commit/readback. Both
names were already required by one production-intent placement: these are separate
transitions, not two mandatory effects of every dispatch. Denied/cancelled/duplicate
intake emits no new requested event. Later failure preserves historical intake
without fabricating a bound event. Creation replay returns original owner truth
without re-running API/clone/registration or re-emitting either transition.

Rows 0/1 of `Plans/github_project_event_admission.json` bind the two payloads to
`Plans/event_family_registry.json`, existing Case L storage and hold-aware
`RP-AUTHORITY-INDEFINITE` 1.0.0 retention. No new physical family is introduced.
Producer, actor/scope, request/result digest and receipt joins are checked before
admission. Closed metadata-only payloads have a 65,536 UTF-8 byte maximum and
`no_secrets`; no alias, legacy extension or migration is admitted. Unowned
thread/run/node/attempt and account envelope identities stay null. Correlation is
the original operation; the transition idempotency key hashes command, event type,
resolved Server, actor and request idempotency key. The separate payload digest
detects changed content under that key.

Case L deduplicates event ID and scoped event-type/idempotency identity. Duplicate
delivery repeats no effects and does not advance the projection checkpoint;
conflicting content/IDs or unknown events quarantine without advancing it. Owner
operation binding additionally rejects a changed original request/admission receipt
between intake and Project binding, and a second Project result for the same
creation operation even under a new transport ID or Project partition. A scoped
consumer resolves original intake through its retained owner receipt; it need not
have independently consumed the application-scoped event first.
Historical replay resolves the retained original approved request, receipts and
readback, not present-day Client permission claims; it cannot execute work.
Restart uses that retained stream. Keep the request/receipts needed to interpret
an event for its retention/hold term. Synthetic fixtures are not durability proof.

Static validation proves only these two admissions and owner joins, preserving all
96 preceding event rows. The global denominator stays `UNKNOWN_OPEN`; historical
kernel pins are not rewritten into a seal. Native authentication/receipt resolution,
API/clone/registry adapters, restart persistence, production dispatch and runtime
security evidence remain unimplemented/unproved.

### GI-042 - Existing GitHub creation intake and transition admission

```yaml
plan_unit_id: GI-042
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: The existing GitHub Project-creation command records approved application-scoped intake separately from PJCT-008 committed Project binding, using the existing Project action family, explicit GitHub API authority, retained receipts and typed Case L events; acknowledgement, duplicate delivery and replay never fabricate completion or execute effects.
gui_related: false
gui_classification_reason: Non-visual command, authority, event and replay integration.
depends_on: [GI-032, PJCT-001, PJCT-002]
unblocks: [PJCT-008]
acceptance_criteria:
- Approved intake has no invented Project and proves GitHub API account/actor, permission, remote approval, FileSafe and currentness bindings.
- Both events have closed metadata-only payloads, exact owner/scope/receipt joins, retained original authority and hold-aware EventRecord retention.
- Unknown, foreign, changed-content and unauthorized events fail closed; duplicate delivery and replay execute no effects.
- No new command, handler, physical family, UI design, native proof, readiness or global audit pass is inferred.
validation_surfaces: [Plans/github_project_event_admission.json, Plans/github_project_event_payloads.schema.json, Plans/github_project_event_fixtures.json, scripts/pm-github-project-integration.py, tests/test_pm_github_project_integration.py]
risk_class: duplicate_remote_effect_or_false_project_creation
reasoning_tier: high
context_scope: existing_github_creation_transition_admission
implementation_surfaces: [Plans/GitHub_Integration.md, Plans/Project_System.md, Plans/event_family_registry.json]
node_compile_hint: {mode: static_owner_integration_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/GitHub_Integration.md#GI-032, Plans/Project_System.md#3-actions-commands-and-results, Plans/Wiring_Matrix.production.json#/entries/catalog.project_new_github_repo]
negative_constraints: [No Copilot-as-GitHub-API authority., No credentials or content payloads., No provisional Project scope., No replayed effects., No legacy admission or native/global certification claim.]
```

ContractRef: ContractName:Plans/Project_System.md#PJCT-008, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/storage-plan.md#case-l-5-eventrecord-persistence-legacy-normalization-and-dedupe
