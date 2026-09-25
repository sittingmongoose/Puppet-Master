# Current-main reconciliation — 2026-09-25

The 71 repair commits through `bc64fdb3848e31ff22b7d513360ea9498ae13973`
were rebased onto `1e5d9b097b46aa58e7af488a9c38a87efb780d5f` as
`a70dd46f7b629d37c6fdb20b63be644856ad5ff5`. This is prelanding verification,
not a main landing, governance seal, native proof, or whole-packet closure.

The exact owner-text union preserves newer-main Section15 and Storage changes,
including terminal moves, original append receipts and nine-field durable tokens.
All 167 main-only authored paths, 206 repair-only authored paths and eight changed
governance paths matched their respective pinned source at the rebased checkpoint.
The five joint authored paths were reconciled explicitly; generated indexes and
shards were regenerated, never hand-merged.

Registry value comparison retains all 294 physical families and 27 retention
policies, the four exact newer-main checkpoint rows, the repair's Onboarding row,
and all 47 repair contract dispositions. Five wrong-family mutations are rejected.
No new physical family, retention policy, native handler or governance binding is
admitted by this reconciliation.

Follow-up verification repairs are deliberately narrow:

- Four Onboarding/Forge census tests use the explicitly reviewed main physical
  projection plus the existing Onboarding materializer. Historical migration,
  isolated Azure conditional and Forge disposition assertions remain separate;
  unrelated later contract dispositions no longer masquerade as physical drift.
- The Goal handoff test retains its exact pair and 27/95 fixture assertions while
  consuming the central manifest's count; that manifest independently pins 39.
- The optional archived-Project-map integration test checks its actual adapter
  result and preserves the full pre-existing validator failure list. A negative
  sentinel proves adapter failures cannot disappear. No production check was
  relaxed and no source binding refreshed.
- One escaped em dash in the storage registry was restored to the materializer's
  UTF-8 rendering. Parsed JSON values are unchanged. Its derived shard files,
  including the newly named final shard, are included with this correction.
- One extra EOF blank line in the historical JJ repair report was removed.

At the rebased checkpoint, the plan index validates: 6,733 PlanUnits and 26,385
acceptance units; runtime certification remains blocked. The shard check covers
99 sources and 2,737 shards. Four newer-main regression suites pass all 132 tests.
The first broad run found stale test pins and the rendering issue above; it is
retained as a failed run, not relabelled. The post-correction run passes all 46
changed test files; its full receipt and individual log hashes are recorded below.

## Full-report boundary

The current-main comparison uses authentic, existing ignored audit inputs copied
without alteration. This does not refresh governance. The main capture records
complete exports, uncapped audit errors and explicit reruns of two leaf checks
whose ignored inputs were initially absent; original reports remain intact.

One known unresolved source-binding finding is
`TCR-SETTINGS-PACKET-COMMANDS: disposition registry hash drift`, expected
`10e1ffd1062a9a3aebd5c418acc7289fb5bb3d0261ef08edc65a461a47685632`, actual
`43e215863fc05d2d2bc1bd863cbaca64042e167af6331e99eac3122a6b68e866`.
The current checker does not classify that text as staleness. It is not silently
included in the older three-file exception. The binding remains untouched;
complete main/branch failure-key comparison and explicit landing adjudication
remain required. No readiness number is excused merely because a sample looks
like hash drift.

## Evidence

Paths below are under
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`.

- `rebased-owner-preservation-001/stdout`:
  SHA-256 `e1b9481a8773b6d74ded142310b08732f3bd4c60b7dac3ed215afea8c261172d`.
- `rebased-authored-preservation-001/stdout`:
  SHA-256 `2315ba12147acb26c1607fb4a1fa944ee9f04b4bb8198f19c29ffe12ba95e83d`.
- `rebased-index-validation-001/stdout`:
  SHA-256 `01e4b538f57315d0ab685af079c91e04467472dbfd67082a11ceeab7d9341e1b`.
- `packet-wide-rebaseline/rebased-extra-main-tests-a70dd46-final.json`:
  SHA-256 `997f8d71af0f657814754364e28ff226fc6625421cbe64f0a6cbf3c8c28ede54`.
- `rebased-changed-tests-002/summary.json`:
  SHA-256 `36d6a4e4abef790abed5f05a00790d80556acb015931a4a5c654ccaade4f29de`.

Separate main capture summary:
`/mnt/Cursor/PuppetMaster-Evidence/scratch/packet-main-landing-current-20260925-TUhJrn/SUMMARY.md`,
SHA-256 `1e00d4c037bb0fd6a77a6416a264e6c8ae6d7c3bed52831558402975a03829f9`.
