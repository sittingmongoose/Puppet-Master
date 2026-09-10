# Shard 022: Browser Event Contract Admission — 2026-09-10

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L11259-L11296

Source SHA256: `e2a2fa44e0fb4f80abda779e2e8f7acb1e713877407e6614a2fad13323b52fb9`

---

## Browser Event Contract Admission — 2026-09-10

<a id="browser-event-contract-admission-20260910"></a>

The 53 exact Browser event names in §15.11 remain the required Browser admission set.
`Plans/browser_event_payloads.schema.json` gives each a closed, event-specific payload candidate
and reuses the existing Browser identity/lineage definitions. Its companion candidate inventory
records each exact name, schema identity, semantic checks, producer/consumer roles, and proposed
retention. These are admission inputs, not central registry entries or runtime emission authority.
The existing `pm.event.v0` EventRecord envelope is unchanged; no Browser-specific envelope,
per-page event store, arbitrary payload catch-all, or duplicate event registry is introduced.

Admission is row-local, not a blanket approval of the set. Each row requires current owner and
payload-schema evidence, exact envelope/payload scope agreement, one producer owner, exact
consumer/checkpoint disposition, replay/idempotency behavior, state/concurrency rules,
retention/recovery/migration, redaction, compatibility disposition, and an executable oracle.
The existing central Event Authority rules determine whether that evidence admits the row into
`Plans/event_family_registry.json`. A candidate file or passing structural schema test alone does
not. Unadmitted names remain quarantined without checkpoint advance. A missing historical cohort
or raw packet is a custody gap, not evidence that the cohort passed or is now irrelevant.

The Browser command catalogue already declares the fifteen exact owner commands. Reuse those
rows and their sole future handler targets. `cmd.browser.program.inspect` remains
`handlers::browser_program::inspect`, read-only, receipt/projection-only, and without a required
persisted Browser event. The other fourteen declarations do not imply executable native handlers.
Their disabled-reason contract must express `handler_unavailable` and `event_authority_unavailable`
as distinct reasons from `runtime_unavailable`; none is a successful dispatch. Event-producing
paths require admission for the exact family. A read-only inspection path does not manufacture an
event merely to satisfy a wiring count.

For each production-intent row, command, request/result/error/availability schema references,
state selector, disabled reason, sole handler, effect, expected event set, return route, consumers,
and evidence requirements must agree. Internal lease, generation, compiler, segment, timeout,
routing, routine, and reconstruction events do not require invented GUI commands. Navigation,
visibility, a controller token string, a result card, or a percent-complete display never grants
Browser mutation, test-verdict, protected-auth, or build-readiness authority.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/event_record.schema.json, ContractName:Plans/event_family_registry.json, ContractName:Plans/storage-plan.md, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.production.json, ContractName:Plans/Permissions_System.md
