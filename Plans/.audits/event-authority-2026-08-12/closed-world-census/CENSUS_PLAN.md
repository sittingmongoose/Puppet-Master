# Fresh Event Authority Census Plan

## Claim boundary
This is a bounded, content-addressed census design and initial source freeze over current working-tree Plans authority. It does **not** register a family, edit Plans, close the denominator, prove contract depth, or certify PNC-019. Known37 remains unchanged. The full recensus remains fail-closed.

## EA-27 binding
Baseline: `Q:/PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase3/event-authority/EA-27_PRODUCER_UNION_AND_DENOMINATOR.json`, bound to `.../corpus-refresh-2026-07-19/05_PHASE3_LIVE_SOURCE_FREEZE_MANIFEST.json`. July content-addressed 153 sources, scanned all frozen sources, and retained `complete_denominator=UNKNOWN_OPEN`.

Carry forward unchanged:
- Regex: `^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$`.
- Admission (**v2, Advisor-2 corrected**): confirmed persisted rows require **direct authoritative binding** of the exact token as an EventRecord/seglog `event_type` (registry/table/enum/EventRecord producer declaration), or current registry authority. Nearby persistence cues alone are **not** sufficient. Bare emit/log/example/command/receipt/schema/field/wildcard/config-key/method-call evidence is not promoted. See `admission/CENSUS_ADMISSION_RULE_V2.md`. Rejected lexical candidates sink to `rejected-lexical/`, never IndividualDisposition.
- Dedupe: byte-exact `event_type` after explicitly documented one-hop compatibility normalization; aliases stay separate evidence rows and are not persisted-family counts.
- Counts only after union and byte-exact dedupe; never add slice counts.
- Every row needs an exact-token citation and bounded nonblank context that supports classification; expanded context never substitutes for an exact occurrence.

No current canon reviewed here explicitly changes either rule. Any proposed relaxation for undotted, uppercase, wildcard, schema-only, or emit-only names is `OWNER_DECISION_REQUIRED` and cannot be applied by the recensus agent.

## Source freeze
`CURRENT_SOURCE_INVENTORY.json` freezes 180 current sources: 72 non-hidden direct-child `Plans/*.md`; 83 canon-evidenced machine schemas; and 25 canon-evidenced machine registries/contracts/evidence inputs. This includes active `Plans/ledgers/v2/schemas/plan_unit.schema.json` and `Plans/ledgers/v2/ledger_registry.json`; ledgers remain excluded only as prose authority. Machine inclusion uses current `Plans/00-plans-index.md` registrations (including lines 24, 31-33, 588-601, and 5312-5313) and the July canonical-machine classification rechecked against current paths; it is not filename-only. Exclude ledger histories, `_shards/**`, `.audits/**`, `.evidence/**`, and generated index/readiness/migration outputs as prose authority. Active machine contracts beneath hidden or ledger directories remain included when current canon explicitly names them; generated `buildability_gate_report.json` remains excluded. A schema can prove payload shape, never membership or the other contract fields by itself.

Rehash every row before a full run. Drift requires a new freeze; never mix snapshots or silently reuse July citations.

## Executable procedure
1. Enumerate the rule above; sort paths bytewise; record path, class, bytes, SHA-256; digest `path<TAB>class<TAB>sha256<TAB>bytes<LF>` rows.
2. Decode UTF-8; extract maximal candidates; validate the entire string against the unchanged regex; retain exact spelling, path, lines, and bounded context. Discovery never admits.
3. Reject filenames/extensions, abbreviations, URLs, package paths, JSON pointers, fields, commands, examples, receipts, wildcards, and schema IDs unless independent context binds the exact token to Event Authority. Record exclusions.
4. Require explicit current EventRecord persistence, seglog persistence/append, canonical event ledger, or current registry binding. Emit-only and schema-only stay non-admitted.
5. Compare with EA-27 as history, not authority. Keep one-hop aliases separate. Conflicting membership, identity, or owner fails closed.
6. Independently cite all 12 fields: membership/version; owner; producer; closed payload schema; scope/identity; replay/idempotency; retention; redaction/custody; transitions; consumers/checkpoints; compatibility/withdrawal; positive/negative oracles. `ADMIT_CANDIDATE` requires all fields. Missing product decisions become `OWNER_DECISION_REQUIRED`; missing evidence becomes `NEEDS_MORE_EVIDENCE`.
7. Independent validator rehashes, reruns extraction, verifies exact-token containment and contextual support, checks dedupe/aliases, preserves Known37, and checks all admitted candidates against all fields.
8. Report bounded lexical/classification/persisted-floor deltas. Keep `denominator_closed=false` until independent source-world and contract-depth closure. Do not register families in this phase.

## Full-run outputs
Freeze plus canonical digest; occurrence ledger; deduped classification ledger; alias ledger; 12-field worksheets; owner-decision batch; exclusion/non-exact ledger; independent mechanical and semantic receipts; bounded delta report against EA-27 and live39.

## Stop conditions
Fail closed on drift, undecodable input, ambiguous boundaries, unsupported contextual rebinding, owner conflict, alias ambiguity, or any incomplete contract field. Never infer across event rows.