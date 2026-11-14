# PNC-019 s4r retention mapping

Base: `3c33510c576d87a9ad512c4519d417e4fd4441df`. Branch: `plans/ea-pnc-s4r-20261114`.

**152 cells: 147 BOUND, 5 PENDING.** Binding is a retention-only owner amendment, not event admission, a whole-family depth regrade, producer execution or governance clearance. No IDs were minted. Historical self-grades remain unchanged for the oracle lanes; this map is the current retention delta.

The earlier pending prose is preserved as source text and explicitly superseded only for assigned facets by each existing unit amendment. Original record, event, checkpoint and referenced-body assignments remain distinct. DL-500..509 are applied only to their enumerated stored values; no source lifetime is inferred from an event lifetime.

## Counts

| Lane | Bound | Pending |
|---|---:|---:|
| DCH | 17 | 1 |
| DCW | 8 | 0 |
| DDBG | 7 | 0 |
| DF | 5 | 0 |
| DFM | 12 | 0 |
| DG6A | 15 | 1 |
| DG6B | 19 | 0 |
| DM | 6 | 2 |
| DMEM | 12 | 0 |
| DO | 25 | 0 |
| DS15 | 18 | 0 |
| DT | 3 | 1 |

## Pending questions

- **usage.event** — How is ai.usage.usage-retention bound to the structured EventRecord policy and preserved expiry anchor (SP-341/UF-108)? DL-507 assigns the original source rows only; it does not supply the event adapter. `Plans/storage-plan.md:34720`.
- **chat.response_stop_requested** — Which policy governs the separately saved Stop outcome record (dch_stop_outcome)? DL-401 G15 assigns request history; DL-427 permits outcome drafting but does not assign its lifetime. `Plans/storage-plan.md:40525`.
- **bundle.annotation_state_changed** — Which policy governs the existing compatibility mapping custody for bundle.annotation_state_changed? F3-708 creates no new operation value. DL-500 assigns its checkpoint; DL-501 does not assign this mapping custody. `Plans/FinalGUISpec.md:52851`.
- **settings.theme.updated** — Which retention rule applies to already written historical bytes under this retired spelling? DL-408 preserves their readability but assigns no new writer retention. `Plans/storage-plan.md:30460`.
- **settings.updated** — Which retention rule applies to already written historical bytes under this retired spelling? DL-408 preserves their readability but assigns no new writer retention. `Plans/storage-plan.md:30460`.

## Verification

- `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json`: PASS.
- `python3 scripts/pm-plan-index.py validate`: PASS.
- `python3 /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/s4r/verify.py`: 152 exact readiness targets, 147 bound / 5 pending; policy refs and owner statements resolve; 2,828 existing structured units preserve IDs, metadata and prior canonical text.
- Derived changes are confined to shards of the six edited owner docs and the index. No Spec Lock, evidence bundle, auto-decision row, frozen validator or event registry was edited.
- Global governance/landing checks are the integration lead’s next phase. Existing governance hashes are stale by design; no reseal was performed.


Complete row citations are in retention-map.json (owner, owner_line, decisions, separate stored values and questions). Full external REPORT: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/s4r/REPORT.md
