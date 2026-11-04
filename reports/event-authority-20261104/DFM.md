# DFM — FileManager Event Authority, review round 1

Branch: `plans/ea-w2-filemanager-20261104`. Reviewed head: `eae066d2c9149060e119990cdee630d5c5d5d23d`.
Repaired canonical content head: `ea0d649b5499b62add57a6dc44b7c47549ad037b`. Base remains `be4766513ff71776346fc73b84f2542990f955af`.
Prepared without admission. Native execution: `NOT_RUN`. This report and the self-grade are the following report-only commit.

## Per-family regrade

Before means the Sol blind review, not the superseded author's grade. After means a fresh self-grade of all 144 cells from the repaired canonical head. All twelve are now self-graded register (prepared), subject to independent re-review; registry membership is ABSENT and event retention remains PARTIAL / `PENDING_RETENTION_DECISION`.

| Family | Own unit | Before | After |
|---|---|---|---|
| file.copied | F-150 | 5 PASS / 6 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| file.created | F-151 | 5 PASS / 6 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| file.deleted | F-152 | 6 PASS / 5 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| file.exported | F-153 | 6 PASS / 5 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| file.moved | F-154 | 6 PASS / 5 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| file.renamed | F-155 | 6 PASS / 5 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| folder.copied | F-156 | 5 PASS / 6 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| folder.created | F-157 | 5 PASS / 6 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| folder.deleted | F-158 | 6 PASS / 5 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| folder.exported | F-159 | 6 PASS / 5 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| folder.moved | F-160 | 6 PASS / 5 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| folder.renamed | F-161 | 6 PASS / 5 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |

Totals: 68 PASS / 64 PARTIAL / 12 ABSENT before; 120 PASS / 12 PARTIAL / 12 ABSENT after. Prepared-family count: 0/12 before, 12/12 self-assessed after. No admission or native certification follows from those grades.

## Review round 1: findings and responses

1. **Fixed — original operation custody.** Commit `ea0d649b5499b62add57a6dc44b7c47549ad037b`. `Plans/FileManager.md:5492` (F-150 and each own F-151–161 adoption), `Plans/storage-plan.md:29494` (SP-560), `Plans/filemanager_operation_contracts.schema.json:260`, and the two appended storage-value rows bind literal redb tables/keys, immutable original acceptance epoch/descriptor, settled exact payload, original path snapshots and native-origin resolvers. Accepted -> effect_settled -> history_settled CAS and the separate closed no_event_settled branch preserve completed, failed/cancelled/no-op and uncertain outcomes; uncertainty stays fenced; it never repeats an uncertain effect. Physical key is a SHA-256 token over the four unambiguous hex identities; the bounded receipt ref resolves it directly without a missing mapping service. Coherent original backup/restore and current access/deletion checks are explicit. Verify with the full checker, its key/epoch/path/transition/restore negatives, and schema/registry equality checks.
2. **Fixed — separate complete-value proof.** Commit `ea0d649b5499b62add57a6dc44b7c47549ad037b`. `Plans/FileManager.md:5515` and each own family counterpart explicitly adopt `storage.first_append_receipt.resolve_full_value.v1`, the original complete `full_value_request`, closed `full_value_result`, strict canonical v2 witness, exact original event ID, CV-339 commitment and final request/row/owner/candidate/currentness/access rechecks. Semantic `resolve.v2` is acknowledgement replay only. Original equality is type-sensitive; equal-looking integer/float values cannot satisfy it. v1, alternate IDs, changed typed values, returned receipt/ref/commitment mismatch and late source/control changes fence without backfill or fallback. Verify with the full checker and its separately named full-value negatives.
3. **Fixed — stored writer cutoff.** Commit `ea0d649b5499b62add57a6dc44b7c47549ad037b`. `Plans/storage-plan.md:29570`, `Plans/filemanager_operation_contracts.schema.json:491` and each family's exact key adoption bind closed `family_control`, durable revision CAS, actual admission prerequisite, issued high-water, frozen in-flight drain set, atomic final cutoff and reader retirement/revalidation. Both control and operation originals belong to mandatory coherent backup/restore; an older active backup cannot reopen a withdrawn writer. Verify with positive activation/issuance/drain/withdrawal/retirement models and negative missing-control, bad-key, premature cutoff, CAS/ABA, reader, late-change and backup-skew cases.
4. **Fixed — contradictory identities.** Commit `ea0d649b5499b62add57a6dc44b7c47549ad037b`. `scripts/pm-filemanager-event-contracts.py:267` and F-150/F-151/F-156/F-157 check actual `result_*_ref != source_*_ref` for copies and `result_*_ref != destination_container_ref` for creates, independently of the semantic booleans. Native aliases of the same object are also prohibited by owner text and remain a native verification obligation. Four own negative fixtures preserve true semantic booleans, update original payload/retry identity, and require the exact identity refusal, preventing another guard from masking the test. The reviewer's unchanged four-probe script now exits 0 with four REJECTED results.
5. **Fixed — grades.** This report-only commit (whose parent is the repaired canonical head) updates `reports/event-authority-20261104/DFM.md:7` and `reports/event-authority-20261104/DFM.self-grade.json:4` and regrades all twelve families/all 144 cells from `ea0d649b5499b62add57a6dc44b7c47549ad037b`, records the blind-review prior per cell, and replaces stale citations with current exact quotations. `DFM.self-grade.json` and `fix1/citation-audit.json` verify every citation. Pending retention and absent membership are preserved.
6. **Acknowledged — generation timestamps.** No source fix was required. This report-only commit records the note here; the generated timestamp remains in each of `Plans/.plan_index/doc_cards.json`, `dependencies.json`, `coverage_report.json` and `node_readiness_report.json` under `generated_at_utc`. Normal regeneration was used; generated files were never hand-edited or restamped. Four JSON index exports may change top-level `generated_at_utc`, as the review already established; the two JSONL outputs have no such timestamp exception. The normal index validator passes.

No finding was disputed or stopped for a new Jared decision.

## Search and newly authored bindings

The immutable original per-family search is retained at `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/canonical-search.json`, SHA-256 `b1e2eec88ec45180435a41c115da4895b0e38edc96966cfca09319bf5793824d`. It covers current non-generated, non-ledger Plans prose, schemas, both registries, commands and Decision Log at the original base. Existing commands and closed schemas were reused before new technical bindings. Each exact family's own F unit remains its semantic owner; no sibling supplies its contract.

The repair's additional current-canon search is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/fix1/custody-search.json`, SHA-256 `2b1aad3840e958a4228aed53b5a7212e77ef73f35a955e3cdd832461b0659b96`. It searches tracked non-generated/non-ledger current Plans at the reviewed head for original-operation custody, family control, path refs and the separate full-value interface. It confirms the missing FileManager companions and reuses the actual SP-286/CV-339 interface. The review's custody-search evidence and every finding were read, not treated as closure proof.

For each row above the newly authored operating reader remains `reader.filemanager.<family_with_underscore>.v1@1.0.0`; each own F unit explicitly adopts SP-278's exact nine-field token/live snapshot, generic checkpoint/CAS and rebuild owner. These history-only readers own no projection or checkpoint. Each own identity remains its exact six-string RFC8785 tuple and family-prefixed SHA-256 event/idempotency recipe, frozen to original acceptance epoch and subject.

New bounded technical companions under DL-045 are `filemanager_operation_custody`, `filemanager_family_control`, `filemanager.operation_custody.commit.v1`, `filemanager.operation_custody.resolve.v1`, `filemanager.path_snapshot.resolve.v1` and `storage.filemanager_family_control.cas.v1`. Each exact family independently adopts the companions, its literal versioned control key and original resolvers. The original normal receipt baseline is deferred; FileSafe rewrite/restore journals and SP-286 append custody are not misrepresented as custody for missing normal file operations.

These are original domain receipt/admission-authority values. Case L-3 explicitly names receipts, audit authority and source lineage; that unchanged premise supplies their existing `RP-AUTHORITY-INDEFINITE` binding. It does not classify or settle any of the twelve event-history retention cells. No new policy ID, expiry, deletion choice, feature, command or user-visible behavior is introduced.

## Premise checks and retention

- DL-045's frozen exact scope still contains every row. Current UCC §2.1B and FileManager's current operation owners still specify these commands; technical companions are permitted for those existing behaviors only.
- Current SP-286/CV-339 explicitly separates semantic `resolve.v2` from `resolve_full_value.v1`; original v1 cannot establish complete-value proof. SP-336/SP-347 group durability supersedes historical per-group manifest sync. The repair adopts the current versions.
- DL-076 and current SP-278 retain the nine-field stored token with a live snapshot join and no persisted `redb_snapshot_id`.
- F2-205 remains accepted/ratified and distinguishes OS trash, confirmed permanent deletion and journaled tombstone custody. No deletion answer is extended or changed.
- No August/September event-retention answer is applied. DL-075's runtime-artifact ruling is not transferred to file operations. Failed answer-premise checks: none.
- Project-only 1.0.0 schemas remain Project-only. Current app/root behavior is not assigned a fabricated Project or a new app event edition.

All twelve `retention_policy_ref` values remain `PENDING_RETENTION_DECISION`. Existing RT/CC-L5-1 remains the owner question: indefinite content-free audit/receipt history, indefinite deletion with bounded other operation history, or bounded history with separate authority/tombstone retention? DFM chooses none. File bodies, OS trash and FileSafe journals/tombstones retain their own policies. No other product question blocks this repair.

## Shared paths and IDs

- `Plans/FileManager.md`: only the existing draft F-150–F-161 sections are repaired, one independent full adoption per exact family.
- `Plans/storage-plan.md`: only the existing draft SP-560 is expanded with physical custody, resolver/transaction/control and backup/restore rules.
- `Plans/Contracts_V0.md`: only the existing draft CV-560 gains the closed companion and cross-field bindings.
- `Plans/Automated_Testing_System.md`: only the existing draft ATS-280 gains the repair oracle obligations.
- `Plans/storage_value_registry.json`: append two rows only; all 344 prior rows and all other root fields remain exactly equal. Critical/MVP arrays are unchanged. The companion schema and Plans fixture/checker are updated; no `tests/` file changes.
- Generated shard owners are exactly `automated_testing_system`, `contracts_v0`, `filemanager`, `storage-plan`, `storage_value_registry`; six aggregate index exports are regenerated. No unrelated owner shard remains changed.
- PlanUnit IDs used remain F-150–F-161, SP-560, CV-560, ATS-280. No additional PlanUnit ID, event-family registry ID, admission ID, Decision Log ID or policy ID is minted. New storage family/schema/binding names are listed above.

## Checks

All final commands below exit 0; logs are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/fix1`.

| Command | Result |
|---|---|
| `python3 scripts/pm-filemanager-event-contracts.py` | PASS; 1055 model cases / 12 families; every original negative retained, new negatives exercised; native NOT_RUN |
| Unchanged review `review_probes.py <worktree>` | PASS; 12 schemas/positive models and all four adversarial identity rejections |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | PASS; 99 docs / 3103 shards |
| `python3 scripts/pm-plan-index.py generate` | PASS |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | PASS |
| `python3 scripts/pm-plan-index.py validate` | PASS, parsed top-level status |
| `git diff --check` | PASS |
| Exact citation audit | PASS; 144 cells, 204 exact current citations |
| Scope/registry/derived-owner audit | PASS; 344 existing rows preserved, two additions, protected paths unchanged |

The full checker also validates closed companion schemas, exact schema/registry agreement and registry schema conformance, immutable original operation transitions and cutoff control transitions. Targeted script/test discovery finds only the FileManager event checker for these exact families. Its existing canonical MessagePack fixture encoder is reused from the repository; the suite exercises the closed integer/ASCII fixture domain, not native arbitrary-value codec certification. A development-only attempt to import a missing third-party MessagePack package was removed; the final checker introduces no such dependency.

Nas1 start: `df -BG /` 470 GB available; `free -g` 7 GB available, meeting the 50 GB / 6 GB rules. Sparse checkout: Plans, scripts, reports, tests. Fifteen ignored currentness-edition files were copied from the shared checkout and SHA-256 matched before index generation. The two optional memory notes named in the shared brief are absent at their stated Nas1 paths; the assigned wave-2 ID block and existing IDs were used without minting more.

No pm-mail, subagents, main push, landing lock, reseal, registry admission append, Decision Log entry, frozen validator change or timestamp hand-edit. Governance/admission/native work remains with later assigned stages. The pushed detached fix worktree is removed at handback under the fix-round disk rule. Reports and the self-grade are copied to the persistent drafts/DFM directory.

## Evidence

Hashes below are SHA-256 of files relative to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/fix1`. Original review evidence remains in the review directory; this repair does not overwrite it.

| File | SHA-256 |
|---|---|
| custody-search.json | `2b1aad3840e958a4228aed53b5a7212e77ef73f35a955e3cdd832461b0659b96` |
| currentness-sha256.json | `97f0aba3bd0d844c9663e5f22539d6c43ca711138551fc43a3d8ebbd069a56a8` |
| filemanager-check.json | `1669e4fb9d4797380a80da8f24563b44dc4dd3b540a52002dccfb3e58a0e073c` |
| review-probes.json | `489d295c47c7b5fa9a86e0f90e3ec27a7d37c2f189322d6902e6cab938b83629` |
| shard-generate.json | `65857140a4b1c7ca0370c518e557344577bbd4604a7681c70f69142efaea8c54` |
| index-generate.json | `2221825d6929556dafa91abbeb6cf4c368968298eefb9089b61c6c7a328dda9f` |
| shard-check.json | `6cb1ecff15d6afd58becb8a36421b904357b2fd47ff258309043184d96056120` |
| index-validate.json | `e391035793e478ada5943a2b90eb5f2797d6b699e35a9780d0b5c5763b0386e4` |
| scope-audit.json | `ee479c21c7ed68f647a1a711c55ba94de221e30025243b23330e91fb90faf9dc` |
| citation-audit.json | `28da85c3e71bdb751f1beb474036873a4361d3ee18ce13b18c5c31039ad1dc19` |
