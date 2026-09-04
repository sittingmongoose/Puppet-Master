# Event Authority currentness audit — 2026-08-13

This directory is a fail-closed live-corpus custody checkpoint. It **does not**
close the Event Authority denominator, certify contract depth, mutate the event
registry, enable PNC-019, or authorize product implementation.

The inventory covers every direct `Plans/*.md` file and the registered machine
inputs carried forward from the prior inventory or referenced by the live index,
registry, and shared-runtime registration. Every excluded source class is listed
explicitly in `CURRENT_EVENT_SOURCE_INVENTORY.json`.

Current result: `UNKNOWN_OPEN`. The live registry has 39 rows.
Mechanical discovery found 75 unregistered likely-persisted tokens,
9 contested tokens, and 153 unregistered ambiguous
event-like tokens. Those are review queues, not automated dispositions.

The `adjudication/` subtree preserves seven exact source groups containing 252
unique row-local findings. `GROUP_ARTIFACT_MANIFEST.json` proves exact equality
to `EXPECTED_252_EVENT_TYPES.tsv`; every consolidated row is forcibly marked
`KEEP_QUARANTINED_NO_REGISTRY_OR_CHECKPOINT_ADVANCE`. Source-row objects remain
unchanged inside the wrappers regardless of their draft disposition wording.

The August PASS is retained only as stale, void, fail-open discovery lineage.
Its own decertification remains controlling.

Validate without writes:

```bash
python3 scripts/pm-event-authority-currentness.py validate
python3 scripts/pm-event-authority-currentness.py self-test
```

Any source-set, byte, registry, status, or artifact drift makes validation fail.
Regeneration is appropriate only after the live Plan corpus is deliberately
restabilized; regeneration never changes `closed=false`.
