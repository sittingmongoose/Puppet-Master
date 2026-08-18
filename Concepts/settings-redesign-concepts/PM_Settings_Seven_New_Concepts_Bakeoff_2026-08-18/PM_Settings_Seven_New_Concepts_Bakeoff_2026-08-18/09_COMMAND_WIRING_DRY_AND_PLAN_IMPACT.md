# Command, Wiring, DRY, Data, and Plan Impact

This is concept work. Do not edit canonical Plans, inventory/schema, Command Catalog, Wiring Matrix, DRY owners, events, receipts, or runtime code.

## Candidate impact discipline

Every meaningful interaction must be inventoried against current canon before proposing an ID. Record reuse, alias, supersession, collision, missing handler, or new-candidate status. Candidate IDs remain provisional.

Every semantic action needs future closure for:

- canonical command ID and owner;
- typed payload/result/error;
- current Project and object identity;
- availability/disabled reason;
- expected revision, idempotency, fencing, stale-result handling;
- permission/FileSafe/confirmation;
- persistence/event/receipt effect;
- ObservableWork operation link;
- cancellation, rollback, recovery, and reconnect;
- route/deep-link/focus effect;
- GUI, natural-language, command-palette, and automation equivalence;
- production wiring evidence and regression fixture.

## DRY boundaries

Preserve singular owners such as ResourceGovernor, ObservableWork, BinaryLocator, shared integration lifecycle, provider readiness/usage, Project identity, browser sessions, and owner modules named in the base packet.

New concepts may propose shared headless components, but must not create a second state owner or a universal visible renderer. Candidate DRY entries should distinguish data/semantic reuse from concept-native presentation.

## Required candidate files per concept

```text
impact-register.json
manager-coverage.json
candidate-command-delta.json
candidate-wiring-delta.json
candidate-dry-delta.json
plan-owner-delta.md
search-route-matrix.json
manager-route-matrix.json
test-evidence.json
```

At model-folder root also write a cumulative reference review and final test report. Do not mutate canon based on these reports.
