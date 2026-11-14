# PNC-019 s4r retention mapping — signed E8 follow-up

**152 bound or closed; 0 pending:** 150 BOUND and 2 CLOSED_NOT_APPLICABLE.

Branch: `plans/ea-pnc-s4r-20261114`. Initial mapping base: `3c33510c576d87a9ad512c4519d417e4fd4441df`; E8 follow-up base: `4da9cf585ac8fd01f3886f1fc1049f33bf2ce93b`.

## Signed answers applied

Signed answer record: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-8_20261114.md`, signed at 3:25 PM EST / 20:25 UTC, send `f66b1af9-f851-493f-a2ee-6b666b477920`. Its SHA-256 is carried in every affected map row. No DL ID was minted; the integration lead writes the later Decision Log entry.

| Card | Cell | Result | Binding |
|---|---|---|---|
| E8-1 A | usage.event | BOUND | Existing ai.usage.usage-retention setting; each entry’s immutable first durable save is its expiry anchor. No fixed telemetry-policy substitution or count eviction. |
| E8-2 A | chat.response_stop_requested / dch_stop_outcome | BOUND | The existing assistant_turn_stop_outcome record uses the request history’s RP-CHAT-THREAD-LIFETIME@1.0.0 policy and original owning chat (DL-401 G15). |
| E8-3 A | bundle.annotation_state_changed mapping custody | BOUND | Existing mapping custody uses its annotation history’s RP-AUTHORITY-INDEFINITE@1.0.0 policy. No new operation family. |
| E8-4 written | settings.updated | CLOSED_NOT_APPLICABLE | No saved records and no keep-rule. Writer remains retired. |
| E8-4 written | settings.theme.updated | CLOSED_NOT_APPLICABLE | No saved records and no keep-rule. Writer remains retired. |

Jared’s E8-4 words, verbatim: "If they are retired already, PM isnt built yet...how would anything have records in them, they would have never been used...."

DL-408 remains unchanged. Its older dedicated DRY-guard readability requirement is preserved as compatibility, without inventing saved records for these two retired generic Settings spellings. Live Settings changes still use settings.layer.changed.

These are retention owner bindings only. They grant no Event Authority admission, hold release, native execution, WorkNodes, or governance clearance. Original source rows, receipts, referenced bodies and derived checkpoints keep their independent existing policies. Earlier pending prose is superseded for the exact signed facets, not treated as a current open question. Historical grade reports remain snapshots; the map is the current retention delta.

## Counts

| Lane | Bound | Closed, not applicable | Pending |
|---|---:|---:|---:|
| DCH | 18 | 0 | 0 |
| DCW | 8 | 0 | 0 |
| DDBG | 7 | 0 | 0 |
| DF | 5 | 0 | 0 |
| DFM | 12 | 0 | 0 |
| DG6A | 16 | 0 | 0 |
| DG6B | 19 | 0 | 0 |
| DM | 6 | 2 | 0 |
| DMEM | 12 | 0 | 0 |
| DO | 25 | 0 | 0 |
| DS15 | 18 | 0 | 0 |
| DT | 4 | 0 | 0 |

## Verification

- `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json`: PASS.
- `python3 scripts/pm-plan-index.py validate`: PASS.
- `python3 /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/s4r/verify.py`: PASS; 152 exact readiness targets, 150 bound / 2 not applicable / 0 pending; all 5 signed answer citations and hashes verified.
- Existing structured PlanUnit IDs, metadata and pre-s4r canonical text remain preserved. No DL entry, policy ID, event-registry entry, frozen validator, Spec Lock or governance evidence was changed.
- Only storage-plan.md and FinalGUISpec.md were amended by E8; derived shards and index were regenerated. Independent review, admission and landing remain with the lead.


Full row citations and resolved-question lineage: retention-map.json. External REPORT: /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/s4r/REPORT.md
