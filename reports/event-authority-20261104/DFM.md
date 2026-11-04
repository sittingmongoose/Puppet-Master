# DFM — Event Authority, review round 3

Branch: `plans/ea-w2-filemanager-20261104`. Reviewed head: `04af7f14ef84e1ac0390202292ba502f8522a4e6`. Repaired content head: `d4f735beff84c4516c163cad55a3a283b41348a0`. The following report-only commit records this assessment; resolve it with `git log -1 --format=%H -- reports/event-authority-20261104/DFM.md`.

Prepared without admission. These are author self-grades, not an independent PASS. Native execution remains `NOT_RUN`. Membership remains ABSENT and all twelve event-history assignments remain `PENDING_RETENTION_DECISION`. No product decision or new binding was authored this round.

## Per-family regrade

Before is Astra’s independent grade. Counts are PASS / PARTIAL / ABSENT. Only `positive_negative_oracles` upgrades; the 132 other normative cells retain their independently checked grades after current citation and unchanged-source verification. The 144 cells and 372 exact current citations are in the companion self-grade and citation audit.

| Family | Own unit | Before | After |
|---|---|---|---|
| file.copied | F-150 | 9 / 2 / 1 | 10 / 1 / 1 |
| file.created | F-151 | 9 / 2 / 1 | 10 / 1 / 1 |
| file.deleted | F-152 | 9 / 2 / 1 | 10 / 1 / 1 |
| file.exported | F-153 | 9 / 2 / 1 | 10 / 1 / 1 |
| file.moved | F-154 | 9 / 2 / 1 | 10 / 1 / 1 |
| file.renamed | F-155 | 9 / 2 / 1 | 10 / 1 / 1 |
| folder.copied | F-156 | 9 / 2 / 1 | 10 / 1 / 1 |
| folder.created | F-157 | 9 / 2 / 1 | 10 / 1 / 1 |
| folder.deleted | F-158 | 9 / 2 / 1 | 10 / 1 / 1 |
| folder.exported | F-159 | 9 / 2 / 1 | 10 / 1 / 1 |
| folder.moved | F-160 | 9 / 2 / 1 | 10 / 1 / 1 |
| folder.renamed | F-161 | 9 / 2 / 1 | 10 / 1 / 1 |

Totals: **108 PASS / 24 PARTIAL / 12 ABSENT → 120 PASS / 12 PARTIAL / 12 ABSENT**. Self-assessed preparation: 0/12 → 12/12, subject to independent review, event retention, admission and native gates.

## Review round 3: findings and responses

1. **Fixed (`d4f735beff84c4516c163cad55a3a283b41348a0`) — snapshot facts contradict the operation.** `scripts/pm-filemanager-event-contracts.py:474` joins accepted selection and source kind/reference, settled source/result kind/reference, creation absence and exact container identity/Computer/root/parent geometry, and rename Computer/root/parent/basename. Both reader/recovery and settlement/terminal paths use the joins. Creation positives, transitions and copied witnesses now put the result under the claimed container. All 26 Astra counterexamples reject with semantic booleans unchanged and selected/final/backup witnesses synchronized; 86 own snapshot negatives run through the full checker. Verify `snapshot-proof.json`, the full checker and own `snapshot-*` cases.
2. **Fixed (`d4f735beff84c4516c163cad55a3a283b41348a0`) — unvisited unresolved references pass.** `scripts/pm-filemanager-event-contracts.py:21` validates the complete registered graph before fixtures, including all unused definitions and optional properties. It follows dialect-defined schema positions with scoped `$id`/anchor/JSON-Pointer resolution, so properties literally named `$schema` or `$ref` are not misread as schemas. All 16 consumed schema documents/335 references resolve; both embedded companion schemas are also traversed. There are 48 own missing-pointer/document boundary negatives, 48 per-family full-checker preflight mutations and 68 graph-engine faults across every consumed document and both embedded companions. Valid unused, recursive, anchor and escaped-pointer references still resolve. Verify `reference-proof.json` and `graph-proof.json`.
3. **Fixed (`d4f735beff84c4516c163cad55a3a283b41348a0`) — custody mismatches mask lexical failures.** Identifier negatives now exercise the closed payload/companion schema directly, cloned from a fully valid custody baseline. They mutate one lexical value; custody comparisons cannot become an alternate rejection in that schema oracle. Derived receipt tokens cannot lawfully acquire LF while retaining their computed spelling, so the lexical oracle deliberately tests that boundary separately from full custody equality, as the review allows. Every LF/malformed case is otherwise schema-valid, demonstrated by weakening its own guard. Raw paths now satisfy length constraints; creation raw-path cases change one destination only. Every negative has a required exact error or schema-validator/instance-path expectation. Skip-effect and skip-drain cases also have correct revision increments, isolating their forbidden edge. Verify `guard-proof.json`, `case-audit.json` and `check_negative_reason`.

No finding is disputed or stopped for a new Jared decision. All 1,751 original cases remain, including all 731 `negative_cases` and 312 transition cases. The suite now has 2,183 cases: 336 positives and 1,847 negatives. Current-state changes do not rewrite retained facts; explicit historical positives cover later move/rename/delete/replacement, while retired readers and forged retained sources reject.

## Per-family standing checks

P = PASS. F = fixed in `d4f735beff`. P* = Project-only scope fence passes; application-key format is inapplicable to this exact edition. The task calls these ten checks; the current brief also numbers negative isolation as check 11, included here.

1 writer/retry replay-only refusal; 2 CV-366 application identity/scope; 3 encoded Project partition; 4 16 KiB/SP-337; 5 identifier LF/grammar; 6 caller semantic retry; 7 checkpoint identity; 8 false-success oracle; 9 complete references; 10 retained history versus current live state; 11 isolated negative reasons.

| Family | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| file.copied | P | P* | P | P | F | P | P | P | F | P | F |
| file.created | P | P* | P | P | F | P | P | P | F | P | F |
| file.deleted | P | P* | P | P | F | P | P | P | F | P | F |
| file.exported | P | P* | P | P | F | P | P | P | F | P | F |
| file.moved | P | P* | P | P | F | P | P | P | F | P | F |
| file.renamed | P | P* | P | P | F | P | P | P | F | P | F |
| folder.copied | P | P* | P | P | F | P | P | P | F | P | F |
| folder.created | P | P* | P | P | F | P | P | P | F | P | F |
| folder.deleted | P | P* | P | P | F | P | P | P | F | P | F |
| folder.exported | P | P* | P | P | F | P | P | P | F | P | F |
| folder.moved | P | P* | P | P | F | P | P | P | F | P | F |
| folder.renamed | P | P* | P | P | F | P | P | P | F | P | F |

`standing-checks.json` records every family/check. Check 8 injects successful return `0` into each own replay-only negative and invokes the actual complete `main()`; all twelve fail with the accepted-negative assertion. Reference faults also invoke that complete entry point and fail before instances.

## Guard-weakening proof

For each family, weaken each of `safe_id`, `non_secret_ref` and `path_ref` separately in its payload schema and the adopted companion schema: **72 guard contexts, two mutations each, 144 experiments**. Replacing only `(?![\s\S])` with `$` makes every matching LF negative pass schema validation. Removing only the chosen pattern makes every matching LF/malformed negative pass. All other rules, including lengths, remain active. Each experiment also invokes the actual full checker with all twelve families/cases retained (target cases reordered first); every weakened guard causes an accepted-negative assertion, exit 1. Production patterns are unchanged.

| Family | LF negatives pass with `$` | All lexical negatives pass without pattern | Full checker detects mutations |
|---|---:|---:|---:|
| file.copied | 14 | 29 | 12 / 12 |
| file.created | 13 | 27 | 12 / 12 |
| file.deleted | 13 | 27 | 12 / 12 |
| file.exported | 14 | 29 | 12 / 12 |
| file.moved | 14 | 29 | 12 / 12 |
| file.renamed | 14 | 29 | 12 / 12 |
| folder.copied | 15 | 31 | 12 / 12 |
| folder.created | 13 | 27 | 12 / 12 |
| folder.deleted | 14 | 29 | 12 / 12 |
| folder.exported | 15 | 31 | 12 / 12 |
| folder.moved | 14 | 29 | 12 / 12 |
| folder.renamed | 14 | 29 | 12 / 12 |

Total: **167 LF acceptances with `$`; 346 lexical acceptances with only the pattern removed; 144/144 full-checker failures**. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/fix3/guard-proof.json`, SHA-256 `3e261367673724880a74cf97fa6c84810a2719eacba856c9b0e0ba3ea72b8603`. These acceptances are the intended proof that the guard alone rejects each schema negative.

## Earlier findings and verification

| Command/proof | Exit | Result |
|---|---:|---|
| `python3 scripts/pm-filemanager-event-contracts.py` | 0 | 12 families / 2,183 cases; all exact negative reasons; native NOT_RUN. |
| `audit-cases.py` | 0 | 2,171 nonbaseline cases: 324 positives / 1,847 negatives; baseline adds 12 positives. |
| Unchanged cycle-1 `review_probes.py` | 0 | Twelve original positives and four copy/create identity refusals. |
| Unchanged cycle-2 `review-probes-cycle2.py` | 0 | 136 probes, zero unexpected acceptances/infrastructure errors. |
| Unchanged cycle-3 `review-probes-cycle3.py` | 0 | 1,071 probes, zero failures, including custody, full-value interfaces, cutoff, physical size/references/profiles, replay-only refusal, semantic retry/checkpoints and terminal-CAS substitutions. |
| `snapshot-proof.py` | 0 | All 26 Astra source-kind/source-reference/copy-alias/create-Computer/rename-parent mutations reject. |
| `standing-checks.py` | 0 | All twelve families, checks 1–10; 12 full-checker false-success and 48 unvisited-reference mutations. Check 11 joins the complete reason audit and guard proof. |
| `graph-proof.py` | 0 | 68 missing-document/pointer faults reject; valid unused/recursive/anchor/escaped-pointer cases pass. |
| `guard-proof.py` | 0 | 72 guards / 144 experiments; isolated negatives pass only after their guard is weakened, and full main fails. |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | Top-level pass. |
| `python3 scripts/pm-plan-index.py validate` | 0 | Parsed top-level pass; ignored currentness edition copied and all 15 SHA-256 values matched first. |
| `python3 scripts/pm-storage-profile-check.py` | 1 | Exactly the same 41 baseline omissions; zero new/DFM profile errors. |
| Current-citation audit / original-case audit / `git diff --check` | 0 | 372 current exact quotes; all original cases retained; no whitespace errors. |

No `Plans/*.md` or schema rule changed this round; the existing F-150–F-161/SP-560 prose already requires these invariants. Derived regeneration is unnecessary; existing shards and index validation pass. No governance reseal, baseline restamp or native execution was performed.

## Search, bindings, premises and scope

Per-family search inputs remain the exact-family rows in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/canonical-search.json` (SHA-256 `b1e2eec88ec45180435a41c115da4895b0e38edc96966cfca09319bf5793824d`), `fix1/custody-search.json` (`2b1aad3840e958a4228aed53b5a7212e77ef73f35a955e3cdd832461b0659b96`) and `fix2/storage-search.json` (`4447c37e92c5433fcf93179f335ea8dc5cd5a713813e8c96fbeddbbc6d7e360f`). Each family’s own F unit independently adopts its producer, identity, reader, full-value interface, operation custody, path snapshot, withdrawal control and physical references. No sibling supplies a missing contract. This round adds executable joins/oracles for those already authored bindings, not a new feature or technical binding.

The checked DL-045 scope/UCC commands, DL-076/SP-278 token adoption, SP-286/CV-339 full-value and semantic separation, SP-337/SP-340 bounds, F2-205 deletion distinctions and Case L-3 companion authority premises remain unchanged from the reviewed head. No older answer was extended to event-history retention, and no unlanded retention-card answer was applied. Failed premise checks: none.

Changed content paths this round: `scripts/pm-filemanager-event-contracts.py` and `Plans/filemanager_event_contract_fixtures.json`; report companions follow separately. No registry append, admission, Decision Log, Spec Lock, `.evidence`, auto-decisions, frozen validator, `.gitignore`, test file, main push, landing lock or reseal. Existing IDs used: **F-150–F-161, SP-560, CV-560, ATS-280**; new IDs minted: **none**.

## Resources, evidence and handback

VM resource gates passed before checkout: 19 GiB available memory and 89 GB free root disk; verification samples stayed at or above 15 GiB / 89 GB, and the handback memory sample was 11 GiB available, above the 6 GiB / 50 GB floors. Sparse detached worktree: `/home/sittingmongoose/pm-worktrees/DFM-fix3`, created from the exact assigned branch. No pm-mail, delegate, subagent, browser or server was used. The branch is pushed; the worktree is removed at handback.

Evidence is under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/fix3/`; the report/self-grade overwrite their parent DFM copies. Reproduction scripts are retained beside the result evidence. `SHA256SUMS` pins final outputs. Selected pins:

| Artifact | SHA-256 |
|---|---|
| full-check.log | `8a296f70abc9df861608371f8565888056562a6c7c61c4a95732fe0a03287c74` |
| case-audit.json | `27476cb66974f0470a91cc9d20737a5a102d5024c23b8ec401da38a847ebf2d4` |
| snapshot-proof.json | `b0098ccc315837e8a8603767c4db32395f31de5dea1809c7ead3b38121370297` |
| graph-proof.json | `d802bdf5c1b9c001d3e6286d89b71fce9c4f69cb8d4bef59bd49ea5cb24472fd` |
| reference-proof.json | `d9caa506b33d4d4243b520bb68412ec3d92e7c62a4487c8a23e5d29e47e626c9` |
| failure-oracles.json | `19bef5ef975154d39653867e422a3d0a94f1af17959412017dc100ccd0d0ffc1` |
| standing-checks.json | `a1cd9548d9427d7cd72f3e9b9e917c0e02acea731a769b81eb6ee421884c0a66` |
| review-cycle1.json | `489d295c47c7b5fa9a86e0f90e3ec27a7d37c2f189322d6902e6cab938b83629` |
| review-cycle2.json | `8025569510cad957e6d99bb3f490e9eca84eae169ea0e0695687b242d03c4b13` |
| review-cycle3.json | `271f2f86e8d776fc152bc788ce5dad88beec61d2bb7434d10f5f141f7e096096` |
| citation-audit.json | `abe245c8bc0948e0e96ee0151a5f8540dc71c39757a906e1c02a267e114bd48e` |

Open items are the existing twelve event-history retention assignments and later independent review/admission/native/governance integration. No new product question blocks this fix round.
