# DG-OWN-B — original Goal lifecycle custody

Branch: `plans/ea-goal-own-b-20261105`. Base: `cfb7e550746c08a989bb41583286d72acc47e68d` (`origin/plans/ea-goal-depth-20261104`). Prepared without admission. Native execution is **NOT_RUN**.

This package authors separate original host/source/result contracts for `goal.blocked`, ordinary `goal.completed`, and DL-081 approved-exception completion. Every route has its own source edition, physical roles, method roots, original receipt resolution and immutable result. They use the sole shared body transaction. They do not install a writer or change a selector.

## Findings and responses

| Review item | Response |
|---|---|
| **O2** | GRS-1120/1121, SP-1120/1121 and CV-1120/1121 define original host/caller capture, body/control/currentness/Stop and accepted-head joins, narrow body/receipt/pending transaction, frozen event, independent first/full-value receipt resolution, recovery and final publication. Post-body failure preserves the original effect. |
| **O3** | GRS-1122, EP-1120, HITL-1120, PS-1120, SIR-1120, CV-1122 and SP-1122 define the distinct approved verification-exception route. The Project-owning user approves every exact risk/disposition. The original failed result stays failed, with the truthful exception label. Standard certification sources, enums and `goal_run.certified` remain unchanged. |
| **O9** | ATS-1113/1114/1115 name separate whole-protocol suites. The new oracle resolves independent TEST_ONLY source, owner, body-receipt and Event-receipt records at entry/helper/final boundaries. It exercises pending/unknown recovery and original result replay. The vector catalog is input to the shared isolation sweep, not a claim that that sweep ran. |
| **C3-F2** | The existing completion predicate now checks `accepted_skip_ref` as null or a nonempty string before interpreting it. Wrong-type/representation cases accompany the fix; a long opaque reference remains valid rather than acquiring an invented length cap. The new whole protocol additionally resolves the exact accepted item/list/revision disposition. |
| **C3-F1 witnesses** | Each existing successor receives a coherent negative Stop epoch and a 257-character body-receipt reference. No shared inventory/removal machinery is edited. |
| **C3-F1/F3, S1, S2/O12** | Shared isolation, format and number/retained-recipe work remains for the authorized sweep. Existing guard-table success is not legal predicate-isolation clearance. No new serializer, numeric cap or physical-float normalization is introduced. |

## New contracts and scope

New IDs: **GRS-1120..1122, SP-1120..1122, CV-1120..1122, EP-1120, HITL-1120, PS-1120, SIR-1120, ATS-1113..1115**. No other IDs are minted.

Existing units amended: **GRS-064/065/203/204, SP-287/429/430, CV-422/423**. Other lanes' units are read-only. New units are contiguous at the end of each governing document. The shared-file table below records exact final ranges for integration; generated files must be regenerated after merging.

`Plans/goal_lifecycle_host_contracts/` supplies whole schemas, method roots and a hash-pinned transitive resource bank. Original resources are referenced, not copied or weakened. The exception source explicitly selects the whole generic original certification grammar and its separately typed original source inputs; it never widens the Standard source. Physical source/reservation/pending/result and Workflow-receipt values use the existing Case L-2/SP-026/SP-236 canonical MessagePack codec under DL-270/SP-339. Existing Goal semantic hashes keep their own canonical JSON inputs. Five prepared shared physical successors use outer versions 2.0.0 (control 3.0.0), with whole original logical roots and inline-or-reference records. They require actual Storage edition/migration/reader installation before source activation; no registry is edited. Every stored part is measured in actual encoded bytes, including reserved control/intent and pending values containing a frozen event.

New bindings, separately owned for each route:

| Route | Source edition | Original owner | Physical roles |
|---|---|---|---|
| `goal.blocked` | `pm.goal.host.blocked_source.v1` | `owner.goal.lifecycle.blocked.v1@1.0.0` | `goal_lifecycle_blocked_{source,reservation,pending,result}` |
| ordinary `goal.completed` | `pm.goal.host.completed_source.v1` | `owner.goal.lifecycle.completed.v1@1.0.0` | `goal_lifecycle_completed_{source,reservation,pending,result}` |
| exception `goal.completed` | `pm.goal.host.exception_source.v1` | `owner.goal.lifecycle.approved_exception.v1@1.0.0` | `goal_lifecycle_exception_{source,reservation,pending,result}` |

Each route independently defines `capture`, `reserve`, `commit_body`, `freeze_event`, `append`, `resolve`, `publish` and `inspect`, with exact IDs and request/result roots in `methods.json`. The exception also binds `pm.workflow.approved_verification_exception.v1` and `approval.goal_verification_exception.v1`. Physical keys use the encoded `project~` partition and exact UTF-8 hex identities. There is no family projector; each exact family's existing `none_required` disposition and SP-278/SP-339 generic reader adoption remain.

## Per-family search and premise checks

At the pinned DG base, searches covered live top-level Plans Markdown/JSON, Goal body/event/source/custody/schema/resource banks and admission records separately for each family. The evidence directory retains both search captures. For `goal.blocked`, GRS-203/SP-429/CV-422 described the ordering and specifically disclaimed a complete original host source/result bank. For `goal.completed`, GRS-204/SP-430/CV-423 did the same; GRS-065 and DL-081 preserved the exception meaning but left its route unbound. No complete bank supplying these original interfaces was found. Each newly authored contract labels that negative finding and reuses the actual body/receipt owners, rather than borrowing a sibling's contract.

The ID search read every origin ref's live top-level Plan blobs after `git ls-remote`: **548 refs, 1,382 distinct blobs, zero allocation hits**. `id-scan.json` records the pattern and result. The two requested memory files were absent from the specified Nas1 paths; the explicit lane allocation and full-ref scan supplied the applicable allocation/currentness instructions.

The fetched-main comparison is pinned to `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. **DL-045, DL-081, GRS-048/050/051/064/065 are byte-identical** to the DG base. GRS-086 differs only in validation-surface strings; its application scope does not adopt these Project contracts. DL-045's existing-behavior technical authority and DL-081's Project-owner exception approval remain applicable in both directions. DL-270 and SP-337/339/340 are also byte-identical between the base and fetched main. Their MessagePack/16 KiB/payload-store precedence remains applicable. The initial physical JSON draft was corrected before commit; no old physical JSON interpretation is extended into a new writer. No failed product premise was found. The existing application Stop question **7.a** is outside this package and remains with Jared; no application Stop edition is authored.

No registry, admission, Decision Log, `.gitignore`, frozen validator, Spec Lock, governance evidence, auto-decisions, retention/deletion policy or historical Project schema is changed. No test file under `tests/` is edited. All authentication/durability fixtures are explicitly TEST_ONLY.

## Verification and grades

Final command results, counts and evidence hashes follow. Old DG removal tables remain qualified by the shared-tool sweep. A green oracle is not native installation, durability, admission or readiness evidence.

Before: both families **8/12** (`P P p p p P P P P P P p`). Proposed re-grade: both **9/12** (`P P P p p P P P P P P p`), upgrading only the authored producer/source criterion. The v3 payload/scope selectors remain unintegrated, and the oracle cell remains PARTIAL pending the shared sweep. Existing registered family membership is preserved; membership of each prepared v3 selector remains **ABSENT**. The adjacent self-grade JSON supplies current exact quotations for all 24 cells. Native NOT_RUN is not itself a reason for a lower grade.

Open integration items: independently reviewed exact selector adoption (O11), shared guard-isolation and format/number/retained-recipe sweeps, and actual native installation/acceptance. The two original host source gaps and the approved exception route have newly authored contracts here; they are not new questions for Jared. Actual reviewed Storage successor/migration/reader installation is also required before enabling these fresh host sources.

## Final checks

All generators/checkers ran one at a time with `PM_GOAL_AUDIT_WORKERS=1`. Memory pauses below 6 GiB resumed at 7 GiB or more; no continuous below-6 episode reached 45 minutes. No main push, landing lock, pm-mail, subagent or native run occurred.

| Check | Exit | Top-level result | Cases / negatives | Existing removal rows |
|---|---:|---|---:|---:|
| New whole-protocol suite | 0 | pass | 569 / 503 | not claimed |
| Existing lifecycle + C3-F2/F1 | 0 | pass | 539 / 510 | 110 |
| DG current writer | 0 | pass | 931 / 861 | 143 |
| DG run Stop/block | 0 | pass | 478 / 427 | 90 |
| DG historical readers | 0 | pass | 6,143 / 6,032 | 650 |
| `shards-generate` | 0 | **pass** | — | — |
| `index-generate` | 0 | **pass** | — | — |
| `shards-check` | 0 | **pass** | — | — |
| `index-validate` | 1 | **fail** | — | — |

The new suite adds **569 cases: 66 positives / 503 negatives**, across blocked, ordinary completed and approved exception routes. Its 131 named refusal classes map to exact negative vector IDs in `Plans/goal_lifecycle_host_contracts/oracle_vectors.json`. The catalog distinguishes positive assertions and derived/redundant sites; it does not treat refusal classes or a compound `need` call as isolated predicates. Individual schema facets, compound peers and genuine same-invariant duplicates still require the shared tool's independent inventory/cuts. No C3-F1/F3, S1 or S2 clearance is claimed. The prior DG tables are preserved as qualified reproduction evidence only.

The existing lifecycle fixture adds **25 cases**: 2 blocked and 23 completed. Its accepted-skip field now requires null or a nonempty string and resolves genuine dispositions in the new suite. The fixture's obsolete `done` spelling was corrected to the actual TDR-004/005 `completed` status; all five owner statuses and wrong forms are covered. The negative epoch and 257-character payload body-receipt reference are coherent C3-F1 witnesses. A long opaque accepted-skip reference remains a positive.

The new suite eagerly resolves **15 complete resources / 1,504 refs**. Physical resource-hash tampering, method-bank tampering, an unused dangling ref and an unsupported anchor each force the complete checker to exit 1; exact original bytes were restored. Native transactions, authentication, crash/durability, source/Storage migration installation and actual selector admission remain **NOT_RUN**.

Index generation is **pass**, coverage **pass**, with 7,471 PlanUnits and readiness `blocked_runtime_certification_incomplete`. The unmodified index validator is **fail / exit 1** with exactly **22 C3-N1 baseline failures**: one `plan_unit_removed_without_ledger_decision` for newer `origin/main`'s DL-302, plus 21 `plan_unit_removal_ledger_invalid` legacy rows. Decision_Log.md and those ledgers are unchanged. This is not a passing validation; integration must reconcile the later main and regenerate/rerun. No baseline/ref/check is weakened. Shards are **pass**, 99 sources / 3,092 shards. Their changes name only this package's eight owner documents.

Reproduction dependencies for the new runner: `jsonschema`, `referencing`, `blake3`, `msgpack`. The run used temporary external dependencies (blake3 and msgpack 1.2.4), not committed local machine state. Example: `PYTHONPATH=<dependency environment> python3 scripts/pm_goal_own_b_oracles.py --output <external evidence path>`. The repository's existing canonical MessagePack encoder is imported unchanged; no lane-local number serializer is authored.


## Exact unit and merge map

`DG-OWN-B-merge-map.json` records every old/new hunk and exact unit span against the pinned base. Each added/amended unit has one row here:

| Unit | Change | Final source span |
|---|---|---|
| **GRS-064** | amended | `Plans/Goal_Runtime_System.md:6194-6279` |
| **GRS-065** | amended | `Plans/Goal_Runtime_System.md:6315-6383` |
| **GRS-203** | amended | `Plans/Goal_Runtime_System.md:8647-8692` |
| **GRS-204** | amended | `Plans/Goal_Runtime_System.md:8709-8754` |
| **GRS-1120** | added | `Plans/Goal_Runtime_System.md:8935-9036` |
| **GRS-1121** | added | `Plans/Goal_Runtime_System.md:9040-9146` |
| **GRS-1122** | added | `Plans/Goal_Runtime_System.md:9150-9253` |
| **SP-287** | amended | `Plans/storage-plan.md:22412-22494` |
| **SP-429** | amended | `Plans/storage-plan.md:30143-30186` |
| **SP-430** | amended | `Plans/storage-plan.md:30202-30245` |
| **SP-1120** | added | `Plans/storage-plan.md:30441-30579` |
| **SP-1121** | added | `Plans/storage-plan.md:30583-30721` |
| **SP-1122** | added | `Plans/storage-plan.md:30725-30876` |
| **CV-422** | amended | `Plans/Contracts_V0.md:24601-24641` |
| **CV-423** | amended | `Plans/Contracts_V0.md:24647-24687` |
| **CV-1120** | added | `Plans/Contracts_V0.md:24825-24908` |
| **CV-1121** | added | `Plans/Contracts_V0.md:24912-24995` |
| **CV-1122** | added | `Plans/Contracts_V0.md:24999-25091` |
| **EP-1120** | added | `Plans/Executor_Protocol.md:9185-9253` |
| **HITL-1120** | added | `Plans/human-in-the-loop.md:2808-2874` |
| **PS-1120** | added | `Plans/Permissions_System.md:11106-11146` |
| **SIR-1120** | added | `Plans/Shared_Integration_Runtime.md:3298-3339` |
| **ATS-1113** | added | `Plans/Automated_Testing_System.md:7475-7518` |
| **ATS-1114** | added | `Plans/Automated_Testing_System.md:7522-7565` |
| **ATS-1115** | added | `Plans/Automated_Testing_System.md:7569-7612` |

Shared source ranges for the merge (new-file line numbers, all changed hunks):

| File | Ranges |
|---|---|
| `Plans/Goal_Runtime_System.md` | 6199-6216, 6218-6227, 6230-6246, 6248-6253, 6258-6260, 6266-6274, 6276-6278, 6301, 6320-6330, 6332-6339, 6342-6352, 6354-6358, 6363-6364, 6370-6374, 6376-6378, 6380-6382, 8653-8655, 8667, 8674, 8702, 8715-8717, 8729, 8736, 8764, 8769, 8932-9253 |
| `Plans/storage-plan.md` | 22417-22439, 22441-22450, 22453-22469, 22474-22477, 22490-22493, 30149-30150, 30168, 30196, 30208-30209, 30227, 30255, 30438-30876 |
| `Plans/Contracts_V0.md` | 24607-24608, 24623, 24643, 24653-24654, 24664, 24669, 24689, 24822-25091 |
| `Plans/Executor_Protocol.md` | 9182-9253 |
| `Plans/human-in-the-loop.md` | 2805-2874 |
| `Plans/Permissions_System.md` | 11103-11146 |
| `Plans/Shared_Integration_Runtime.md` | 3295-3339 |
| `Plans/Automated_Testing_System.md` | 7472-7612 |
| `scripts/pm_goal_lifecycle_successor_oracles.py` | 2, 6, 52-54, 75 |
| `Plans/goal_lifecycle_successor_fixtures.json` | 96, 213, 330, 447, 564, 681, 798, 915, 1032, 1149, 1266, 1383, 1500, 1617, 1734, 1851, 1968, 2085, 2202, 2320, 2437, 2554, 2671, 2788, 2905, 3022, 3139, 3258, 3377, 3493, 3610, 3727, 3844, 3961, 4078, 4195, 4312, 4429, 4546, 4663, 4780, 4897, 5014, 5131, 5248, 5365, 5483, 5601, 5719, 5837, 5955, 6074, 6192, 6310, 6428, 6546, 6664, 6782, 6900, 7017, 7134, 7251, 7368, 7485, 7602, 7719, 7836, 7953, 8072, 8189, 8306, 8423, 8540, 8659, 8776, 8893, 9010, 9127, 9244, 9363, 9480, 9597, 9714, 9831, 9948, 10067, 10184, 10301, 10418, 10535, 10652, 10680, 10682-10685, 10686, 10688, 10703, 10708-10802, 10803, 10805, 10818, 10825-11022, 13262, 13381, 13500, 13619, 13738, 13857, 13976, 14095, 14214, 14333, 14452, 14571, 14690, 14809, 14928, 15047, 15166, 15285, 15404, 15524, 15643, 15762, 15881, 16000, 16119, 16238, 16357, 16476, 16595, 17309, 17428, 17547, 17666, 17784, 17903, 18022, 18141, 18260, 18379, 18498, 18617, 18736, 18855, 18974, 19093, 19212, 19331, 19450, 19569, 19686, 19806, 19926, 20046, 20166, 20286, 20407, 20527, 20646, 20761, 20881, 21001, 21121, 21241, 21360, 21479, 21598, 21717, 21836, 21955, 22074, 22193, 22312, 22433, 22552, 22671, 22790, 22909, 23030, 23149, 23268, 23387, 23506, 23625, 23746, 23865, 23984, 24103, 24222, 24341, 24462, 24581, 24700, 24819, 24938, 25057, 25176, 25295, 25414, 25533, 25652, 25771, 25890, 26009, 26128, 26249, 26368-29109 |

The new package directory and `scripts/pm_goal_own_b_oracles.py` are lane-owned. Regenerate the eight owner shard directories and the whole `.plan_index` after integration; do not hand-merge them. No common oracle helper is modified. No new Jared question is established. The exact already-reserved 7.a remains: “For ordinary application-scope runs that can already be stopped, should Stop save an application edition of `goal_run.stopped`, or should application Stop use its existing owner state/receipts without that event?” It is outside this Project-only package and is not decided or re-asked.


## Evidence

All paths below are relative to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-OWN-B/`. Raw captures stay outside the repository.

| File | SHA-256 |
|---|---|
| `id-scan.json` | `7230204ce27609d83aba1d1700a933c0914e4448607e02858f6883bb1a6cbac1` |
| `origin-refs.txt` | `df74ca7b9ce8a7ee5154450a05589659e36632949a3ce37b279c061a3c47ab20` |
| `goal.blocked.search.txt` | `81e7824997077b93daa7b6df5538f9298db6d23b28908433c1671b55b2b09fcf` |
| `goal.completed.search.txt` | `4ac21d0d0524e7a9710620a91426f708050fbde10e861625fc2214fe57462a70` |
| `premise-comparison.json` | `98c48aff25f87114a9af3c3b0a3dd60be818a3f2764f7d2f30509d07a63d8c3c` |
| `storage-codec-premises.json` | `5b5a2764c2ea30c103fb62d24abbb0a30419b8ece905c6aa0e9214423664e9bd` |
| `currentness-inputs.json` | `7a2b96b2f32113bff004a1cf50cb905ccaf35a6f3d12a9064e67eb76be7abcfc` |
| `verification.json` | `b6fcc81529ea73b89930a9cc4b16248c91cf27bbe85c5e934362b564c33cc99b` |
| `protocol-check.json` | `466eefe481e5b2b6e4e406e059b1b1b45f02e9b710c06e7997ed2928b4fb8054` |
| `protocol-check.txt` | `81af99010326a093e751e95cfc59b0246cded49bd67c923d442c983149107efa` |
| `lifecycle-check.txt` | `cf17b993739e03cd6940a95a4d9724a8726e963dbd7f24acbd11fed1a1941945` |
| `current-check.txt` | `b98b0d24fbfe8f258120a9a80277ea30119e75be815b0d1061d681a99c94f5e9` |
| `stop-block-check.txt` | `93b034b2b4b12e7fb158553f72898e1d4eef2e24523451d078d2f0c9f5fff49e` |
| `history-check.txt` | `3aa00fc9525946c57f1dd80d9fff41c643c33e2d0361386e7d56a3eeb38525d8` |
| `lifecycle-guards.json` | `89830586e13ec8c0792dc8bacc86e8348b323e60b8d70bb538e7c04ca19ba413` |
| `current-guards.json` | `c6f3bf866bfa0b03a59b59110246e766a4262c68e276c08a3c399cf4de34c3f6` |
| `stop-block-guards.json` | `1bb67253a22ad91ffde6c9285a73917e0252cc4863cc09cd96ecb52dc3aafe8c` |
| `history-guards.json` | `8d4e8a4b539f3bab9805372b1a8af60df1ee0b0eb553d2f47fa6685c4a3332cf` |
| `physical-mutants.json` | `c1ceb5b5b693e938f97e15c64631517fe715c5b3d50dfec04cc83e7f8cc45265` |
| `shards-generate.txt` | `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4` |
| `index-generate.txt` | `64adee60c466a8ce72c6ae5a0281f90c8cc092dc6cc192fe593ad9f15082708d` |
| `shards-check.txt` | `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21` |
| `index-validate.txt` | `e530bbabe753e0327373ed209572e6cc3de98b1f78c8abfb782d2cc2cb30f5e7` |
| `final-audit.json` | `efda653ad94185c55a7ab9574b2df29209cbf6a129af599763859ad54ce588f2` |
