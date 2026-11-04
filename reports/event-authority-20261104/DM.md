# DM — DL-408 application, 2026-11-04

Worker: DM-APPLY, VM. Branch: `plans/ea-w2-small-owners-20261104`. Input head: `c9d623f793cf59c501a0fce48b9ff66d94de5f16`. Canonical application head: `6757da332b26353112ee795c9bdeaeb00bfb3217`.

## Dispositions

| Exact family | Before | After | Successor |
|---|---|---|---|
| `settings.updated` | stopped for Jared | retired as superseded (DL-408) | `settings.layer.changed` |
| `settings.theme.updated` | stopped for Jared | retired as superseded (DL-408) | `settings.layer.changed` |

Every Settings change uses only the successor, including the Memory panel save-unverified switch, theme changes and eventual DRY-guard mutations. No current writer emits either retired name. Historical dedicated `settings.agent_rules.dry_method_default_guard.updated` records remain readable without an alias or byte rewrite. The DRY guard stays disabled with `owner_contract_missing` until exact key-to-valid-setting-ID and writer mapping is proven; `app.agent_rules.dry_method_default_guard` is not silently equated with `memory.assembly.dry-method-guard`. Existing Settings owner-adoption prerequisites remain.

## Authority and premise check

Read the shared brief, CARDS1-APPLY lane instructions, presented card 2d and DL-408 from `origin/plans/ea-cards1-answers-20261104`. Presented-card SHA-256: `578a6774525bc474ce7ee36da2bd22fae52520aaf940d33c99d0a3aeeb58d696`. DL-408 selects 2d A and replaces DL-041 naming. Current SSYS section 3.6, UCC-084/104/108, UI Wiring DRY boundary, WM-040 and SP-348 retained the older generic/theme spellings. Those current obligations are now reconciled to the approved single name. DL-300 registration and owner-adoption conditions stand. No old premise was used to decide anything beyond 2d A.

## Every owner passage changed (new line numbers)

- `Plans/Settings_System.md`: 2312
- `Plans/UI_Command_Catalog.md`: 1118, 6188, 6230, 6236, 7823, 7828, 7830, 7861, 8554, 8558, 8641, 8651, 8688
- `Plans/UI_Wiring_Rules.md`: 977
- `Plans/Wiring_Matrix.md`: 4393, 4395, 4403, 4435
- `Plans/storage-plan.md`: 28944

The UCC changes cover the memory command table and PlanUnit (including retained-token retirement metadata), DRY command contract and acceptance, all four theme command effects and their retirement note, and theme PlanUnit/preview event-silence clauses. Wiring changes preserve all disabled-state and historical-read boundaries. Storage replaces its unresolved not-an-alias statement with explicit retirement and historical-readability disposition.

## Verification

| Check | Exit |
|---|---:|
| Shard generate / check | 0 / 0 |
| Index generate / validate (parsed top-level `pass`) | 0 / 0 |
| Exact-family checker (4,158 assertions) | 0 |
| All-ten standing checks 1–5; Settings rows retired/not applicable | 0 |
| Standing checks 6–8 extension | 1 |
| Failure-oracle process exits (eight deliberate failures, each nonzero) | 0 |
| 22 weakened-checker mutations | 0 |
| Existing independent cycle-2 mutation probe | 0 |
| Storage recovery self-test | 0 |
| Storage profile | 1 |
| DL-408 retirement / disabled-guard / unchanged-registry assertions | 0 |
| Evidence quotes / whitespace | 0 / 0 |

**Standing-check gap:** check 6 confirms Storage metadata is excluded from caller semantic retry identity; check 7 confirms positive checkpoint Storage identities match, but the mismatch negative fails for all eight existing prepared families: `rebuild_publication` accepts a foreign `new_checkpoint.durable_read_token.storage_instance_id`. Check 8 confirms invalid producer witnesses are refused; isolated corrupted positives exit nonzero. The original checker and fixture are byte-identical to input head (proof in `apply/standing-extra-baseline-proof.json`). This is an existing technical gap exposed by the expanded standing checks, not repaired in this 2d-only task. The eight `consumers_checkpoints` self-grade cells are downgraded to PARTIAL, with the gap retained for follow-up.

**Storage profile:** same 41 missing application profiles, byte-identical to prior fix2 output. No registry/profile change made.

Eight non-Settings rows retain their prior contracts and pending retention decisions; no Card 1 policy is applied. Two retired rows receive disposition evidence rather than fabricated current-writer/oracle grades: owner and compatibility PASS, membership ABSENT, nine current-writer criteria NOT_APPLICABLE each. This self-grade is not independent review, admission or native proof. Native execution remains NOT_RUN.

Exact commands, exit codes, output SHA-256 and evidence paths are in `DM-checks.json`. Raw outputs are retained under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/apply/`; report and self-grade copies are in the parent delivery directory. All 15 currentness files were copied and SHA-256 verified before index generation. Regenerated shards belong only to the four edited configured owners; global index artifacts were regenerated normally.

## Scope and cleanup

New IDs and newly authored technical bindings: none. No registry append, admission, validator, Decision Log, Spec Lock, `.evidence`, `.gitignore`, `auto_decisions.jsonl`, pm-mail, subagents, landing or main push. Entry resources: 15 GiB available memory, 104 GiB available root disk. The missing requested worktree was recreated sparse and detached at the exact input head. After source and report pushes, remove `/home/sittingmongoose/pm-worktrees/DM-apply`; retain only cited delivery evidence. No server/browser/venv was started.
