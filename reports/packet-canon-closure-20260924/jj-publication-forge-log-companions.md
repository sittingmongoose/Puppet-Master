# JJ publication and Forge selected log contracts

ACT039 and ACT075 now have selected-input, native observation, original-dispatch
and shared-response composition on the repair branch. This specifies and tests
static contracts; it does not implement native publication or provider log reads.

JJ publication preserves the complete original bookmark selection, native-qualified
per-target refspec/head/precondition and force guards, actual resulting heads,
receipt and reconciliation. Accepted work is not completion; partial and unknown
effects retain their actual truth. Forge log selection preserves the actual
AutomationBinding/run and whole-run, job or stage selection, cursor, bounded page,
content-byte/hash custody, current disclosure and readback. It does not fabricate
a job to satisfy the historical job-only common request. Its disjoint authority
copy changes only identity, exact command and that selection conditional; the
predecessor schema and all other authority constraints remain intact.

Both paths require actual SIR originals, full identity and caller/receipt joins
through the real shared response helper. Independent native authentication,
permission/lease, source custody and physical persistence remain prerequisites.
Fixtures and synthetic adapters are not evidence that these prerequisites exist.

Only cmd.jujutsu.git.push and cmd.forge.pipeline.open_logs public request/result
routes change. IDs, handlers, unavailable status and no-event dispositions remain.
Six new logical storage dispositions produce 74 total: 31 physical-family pending,
one external-store pending, 38 nonpersisted and four existing-family rows. All
previous 68 rows and all 294 physical families are preserved. No governance binding,
retention policy or physical writer is created.

Independent JJ final cycle 2 PASS:
`/mnt/Cursor/PM-Experiments/jj-publication-selected-20260925-8HsKuW/INDEPENDENT-REVIEW.md`,
SHA-256 `ff6a33c4091c443094ff212a7b0ee8cf98a5a2b3646603defb067279f43f6283`.
The first-cycle receipt/lease identity findings were corrected before this review.
Independent Forge cycle 1 PASS:
`/mnt/Cursor/PM-Experiments/forge-log-selection-20260925/INDEPENDENT-REVIEW.md`,
SHA-256 `74a130636f489e9e2f233ee77621451e536e321c7988a24e06fae264228f8e4f`.
All 12 installed companion files matched the frozen reviewed bytes; the common
central hook was merged narrowly over the existing Backup path.

Installed checks PASS: 21 JJ domain, 15 JJ response, 22 Forge logs, 25 Backup reads,
12 shared UI response and nine manifest tests. The final three selected-route/
Touch/disposition tests and 60 Touch source tests also pass.
Full contract gate PASS: 54 pairs / 50 unique schemas, 1,341 positive cases,
4,440 negative cases rejected, 12 internal self-tests and zero findings:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/jj-forge-selected-integrated-gate-001/stdout`,
SHA-256 `f56c9787205deb3e3a4e0d54b0296d0f70c1a1c64893c407fe5be633ddad8341`.
Shard generation/check PASS: 99 documents / 2,749 shards, only the four edited
configured roots commands_system/shared_integration_runtime/storage_value_registry/
ui_command_catalog. Index generation PASS: 6,734 PlanUnits / 26,452 acceptance units;
PlanUnit IDs are unchanged.

Root's subsequent consumer check corrected four existing Touch row profile
assignments: JJ push, Forge logs and the earlier approve/request-changes pair.
Three narrow profiles bind their actual successor schemas, preserving partial
status and residuals. The checker now recognizes those profiles and the five
previously integrated JJ operand commands. Profile count is explicitly 138;
643 rows, 65 aliases, 58 exclusions and 1,142 production rows are unchanged.
No external registry hash binding was changed.

The worktree was expanded before the meaningful full Touch comparison; the earlier
sparse run's missing-Concept findings are not product gaps. Full before capture:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/jj-forge-touch-before-002-full/stdout`,
SHA-256 `504168b915a21a95f9333da05ef667c8560b7f30ee99a5de54081a46937bee08`.
Full after capture in sibling `jj-forge-touch-after-002-full/stdout`, SHA-256
`a89c9c2bb183a1bc8ae04523e5b028f074a1ce63f10eeb23c82239ca2ad6c42d`.
Exact full failure-set delta: seven to one, zero added, six removed (five JJ operand
profile mismatches and the obsolete profile denominator). The remaining finding is
TCR-SETTINGS-PACKET-COMMANDS disposition registry hash drift: expected
10e1ffd1062a9a3aebd5c418acc7289fb5bb3d0261ef08edc65a461a47685632, found
43e215863fc05d2d2bc1bd863cbaca64042e167af6331e99eac3122a6b68e866.
This is not a fresh main-vs-branch aggregate comparison or authority to land.

Native implementation/proof, remaining selected contracts, physical custody,
unanswered product decisions, main landing and whole-packet closure remain open.
Protected newer designs are untouched; no additional Azure scope was introduced.
