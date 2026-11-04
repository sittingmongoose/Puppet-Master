# DFM — Event Authority, review round 2 (final fix round)

Branch: `plans/ea-w2-filemanager-20261104`. Reviewed head: `1759a1240228c12bb475fccc091700323ea2cc3e`. Repaired canonical content head: `17acc3db0ca87a6f1bb63b53528d87bfa0ddc4f0`. The following report-only commit records the self-grade; its parent is this content head.

Prepared without admission. These are author self-grades, not an independent PASS. Native execution remains `NOT_RUN`. All twelve event-history policies remain `PENDING_RETENTION_DECISION`; membership remains ABSENT. No new product decision was made.

## Per-family regrade

Before is the cycle-2 independent review. After is a fresh regrade of all 144 cells against the repaired canonical head. Each family upgrades only redaction_custody, compatibility_withdrawal and positive_negative_oracles; the other nine cells retain their independent grades.

| Family | Own unit | Before | After |
|---|---|---|---|
| file.copied | F-150 | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| file.created | F-151 | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| file.deleted | F-152 | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| file.exported | F-153 | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| file.moved | F-154 | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| file.renamed | F-155 | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| folder.copied | F-156 | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| folder.created | F-157 | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| folder.deleted | F-158 | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| folder.exported | F-159 | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| folder.moved | F-160 | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| folder.renamed | F-161 | 7 PASS / 4 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |

Totals: **84 PASS / 48 PARTIAL / 12 ABSENT → 120 PASS / 12 PARTIAL / 12 ABSENT**. Self-assessed prepared count: 0/12 → 12/12, subject to independent review and later retention/admission. No native, governance or admission certification follows.

## Review round 2: findings and responses

1. **Fixed — compatibility-only replay policy accepted.** Commit `104be70aef994610c66447aefb700a6a29730699`. `scripts/pm-filemanager-event-contracts.py:116` now refuses `projector_replay_only` as `replay_only_not_appendable` for both the complete original and retry request. Each own F-150–F-161 contract independently binds this refusal (first: `Plans/FileManager.md:5606`). Every family has coherent `writer-replay-only`, `retry-replay-only` and terminal replay-only negatives; all copies, semantic digest and full-value commitments are updated before the writer test, so another equality guard cannot mask it. Verify with the full checker, standing-check audit and unchanged cycle-2 probes.
2. **Fixed — missing profiles and oversized inline companions.** Commit `104be70aef994610c66447aefb700a6a29730699`. `Plans/storage-plan.md:29599`, `Plans/filemanager_operation_contracts.schema.json:738` and `Plans/storage_value_registry.json:127674` bind both canonical profiles, existing coordination_and_storage advisory budget (2147483648 bytes), canonical MessagePack encoding and a 16384-byte physical limit. Closed physical unions preserve the literal family schema header and all original closed logical fields. Larger operation/control values use SP-337 references to complete logical values; large EventRecord bodies use empty inline payload plus a BLAKE3/byte-size/media reference. Actual payload:v1:<blake3_hex> index/pack origin, exact resolution, final equality, pre-reference durability, coherent backup and retention/access fences are explicit. Every family tests 16383/16384/16385-byte bodies and both companions, large draining controls, packed reader/transition positives and inline/missing/changed/size/backup/late-reference negatives. Missing/wrong profiles and weakened literal headers have own negatives. The unchanged profile checker now reports exactly the pinned baseline's 41 unrelated omissions, down from 43; no DFM profile error remains.
3. **Fixed — terminal CAS accepted an unrelated EventRecord.** Commit `104be70aef994610c66447aefb700a6a29730699`. `scripts/pm-filemanager-event-contracts.py:391` and `Plans/storage-plan.md:29651` bind the actual effect_settled pre-CAS row exactly to before, preserve immutable acceptance/settlement, and validate the candidate through the same original complete-event, first-receipt, strict v2 request/result/commitment, current control/source/access and final equality rules. The uncommitted history_settled candidate cannot impersonate the stored original. Every family rejects unrelated event types, changed payload/receipt, missing/semantic/wrong full-value proof, substituted pre-CAS originals and already-published rows offered as the original. Existing transition arguments are unchanged; the positive terminal transition now supplies a model of the actual pre-CAS authority.
4. **Fixed — regrade.** This report-only commit, whose parent is `17acc3db0ca87a6f1bb63b53528d87bfa0ddc4f0`, updates `reports/event-authority-20261104/DFM.md:7` and `DFM.self-grade.json:4`. All twelve families/all 144 cells were re-read and regraded against that content head. Exact source citations are mechanically verified in `fix2/citation-audit.json`. Membership ABSENT, retention PARTIAL and native NOT_RUN are preserved. Resolve this report commit with `git log -1 --format=%H -- reports/event-authority-20261104/DFM.self-grade.json`; final handoff/completion records its exact SHA.

No finding is disputed or stopped for a new Jared decision. Cycle-1 operation custody, separate full-value interface, withdrawal authority and copy/create identity repairs remain intact; all 731 reviewed negative cases and 312 transition inputs are preserved. Round 2 is the review cap; no further review worker was launched.

## All eight standing checks, for every exact family

| Check | Result |
|---|---|
| Current writer and retry replay-only policy | PASS: own coherent writer, retry and terminal negatives in all twelve families. |
| CV-366 application idempotency | N/A for each: all twelve 1.0.0 contracts remain Project-only; no application edition or fabricated Project. |
| Project partition | PASS: project~Zml4dHVyZTE encodes fixture1; every raw-partition negative rejects. |
| 16 KiB / SP-337 | PASS: exact byte boundaries, both physical profiles, reference resolution/equality and large drain controls. |
| Identifier trailing LF | PASS: safe_id, non_secret_ref and path_ref patterns have a full-match tail; own payload and companion LF negatives reject. Private filesystem components retain their filename grammar. |
| Semantic retry comparison | PASS: exactly CV-339 producer fields; Storage sequence/observed/persisted metadata changes are accepted, semantic changes reject, and the original event ID is still required. Full-value proof separately preserves the complete original. |
| Checkpoint storage identities | PASS: own transient adopted SP-278 delivery bindings match the original store/epoch/event/encoded partition; each foreign join rejects. No family checkpoint or persisted snapshot ID is created. |
| Failure oracles reject success | PASS: for each exact family, an injected successful return (0) for its replay-only negative makes the actual full checker exit 1 with that family's accepted-negative assertion. |

## Search, technical bindings and premise checks

The per-family canonical search remains at drafts/DFM/canonical-search.json (SHA-256 b1e2eec88ec45180435a41c115da4895b0e38edc96966cfca09319bf5793824d). The round-1 original-custody search remains at drafts/DFM/fix1/custody-search.json (SHA-256 2b1aad3840e958a4228aed53b5a7212e77ef73f35a955e3cdd832461b0659b96). Paths are under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/. Round 2 searches tracked live non-generated/non-ledger Plans prose, schemas and registries at the reviewed head for payload references, BLAKE3, value limits and the exact companions. See fix2/storage-search.json and its hash below. It reuses SP-337, SP-339, SP-340 and the existing group/profile/pack-index contracts; no concrete FileManager wire reference was found before authoring this bounded representation.

Newly authored technical bindings are operation_custody_value / family_control_value and their closed reference alternatives in the existing companion schema, two family_profiles for the existing storage companions, and the exact pm-payload-ref:v1:blake3:<hex>:<byte size>:application/vnd.msgpack spelling. Existing operation/control keys, resolvers, original family IDs, handlers, history readers and six-string identity recipes are retained. Each exact family independently adopts the representation and guards in its own F unit. These are DL-045 technical bindings for existing commands, not a new feature, retention policy or claimed pre-existing implementation.

- DL-045 still names all twelve families; current UCC §2.1B and each FileManager operation owner still specify the same behavior. No owner conflict was found.
- SP-337/SP-340 currently require BLAKE3/size/media references above 16 KiB, physical redb limits and canonical-versus-derived profiles; the selected coordination_and_storage budget already exists and remains advisory. The repair changes no budget/default or canonical-pruning policy.
- Current SP-286/CV-339 separates semantic acknowledgement replay from original full-value proof. Current append envelope explicitly makes projector_replay_only compatibility-reader-only. Both rules are adopted without changing their shared owners.
- DL-076 and SP-278 retain the nine-field durable token/current live-snapshot join. The lane still owns no checkpoint/projection.
- SP-336/SP-347 group durability and F2-205 deletion distinctions remain unchanged. No historical per-group-manifest sync or silent permanent-delete fallback is introduced.
- Case L-3 already names receipt/audit/source-lineage authority; the two original receipt/control companions retain RP-AUTHORITY-INDEFINITE. No August/September answer is extended to the twelve pending event-history retention assignments. Failed answer-premise checks: none.

## Final checks

| Command / audit | Exit | Result |
|---|---:|---|
| python3 scripts/pm-filemanager-event-contracts.py | 0 | 12 families / 1751 cases; all old negatives retained; native NOT_RUN. |
| Unchanged cycle-1 review_probes.py | 0 | Twelve positive/schema models and four copy/create identity refusals. |
| Unchanged cycle-2 review-probes-cycle2.py | 0 | 136 probes; 0 unexpected acceptances / 0 infrastructure errors. Its embedded reviewed_head label is the original review pin; input path is this repaired worktree. |
| standing-checks.py | 0 | Every standing check for every family; 696 boundary cases and twelve full-checker false-success injections. |
| python3 scripts/pm-storage-profile-check.py | 1 | Exactly 41 pre-existing unrelated missing profiles; pinned baseline comparison is identical; no new/DFM errors. |
| Unchanged readiness storage registry data validator | 0 comparison | Same three pre-existing failures as the reviewed head; no DFM/new failures. |
| pm-shard-plans.py --generate --config Plans/sharding_config.json | 0 | Normal regeneration, five expected owner groups only. |
| pm-plan-index.py generate | 0 | Six normal aggregate exports; currentness edition copied and all 15 SHA-256 values matched first. |
| pm-shard-plans.py --check --config Plans/sharding_config.json | 0 | Top-level pass. |
| pm-plan-index.py validate | 0 | Parsed top-level pass; runtime certification remains blocked. |
| Scope, original-case and citation audits; git diff --check | 0 | 344 other storage rows and existing profile/root fields preserved; protected files untouched; all exact quotes verified. |

The checker uses the VM's installed Python blake3 module to verify real SP-337 content identities; it does not substitute SHA-256 for BLAKE3. Existing repository canonical MessagePack encoding remains a bounded static integer/ASCII model, not native arbitrary-value codec or filesystem proof. Required native pack durability, CAS, original-origin authentication, crash/restore, permissions and SP-278/SP-286 execution remain NOT_RUN.

## Scope, resources and open items

Only existing F-150–F-161, SP-560, CV-560 and ATS-280 prose, the twelve own payload schemas, existing companion schema/fixtures/checker and two existing storage rows plus their new profiles changed. Derived shards are exactly automated_testing_system, contracts_v0, filemanager, storage-plan and storage_value_registry; six aggregate index exports were regenerated. No unrelated owner changes, tests-file edits, event-family registry append, admission record, Decision Log, Spec Lock, .evidence, auto_decision, frozen validator, .gitignore, main push, landing lock or reseal.

IDs used: **F-150–F-161, SP-560, CV-560, ATS-280**. No new PlanUnit, family/admission, Decision Log or policy ID was minted.

VM start: 109 GB free disk / 16 GB available RAM; later samples remained above the required 50 GB disk / 6 GB RAM floors. Sparse worktree: /home/sittingmongoose/pm-worktrees/DFM-fix2, detached from the exact assigned branch head. No subagent or message was sent. Initial read-only pm-mail inbox/who checks occurred before the task-specific no-pm-mail rule was read; no registration or subsequent pm-mail action occurred.

Open items remain the existing twelve event-history retention decisions and later independent review/admission/native/governance integration. Governance artifacts are intentionally not resealed in this fix task. The branch is pushed; the fix worktree is removed at handback. This report and self-grade overwrite the drafts/DFM copies.

## Evidence

All files below are under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/fix2/. Values are SHA-256. The original blind-review artifacts are untouched.

| File | SHA-256 |
|---|---|
| storage-search.json | `4447c37e92c5433fcf93179f335ea8dc5cd5a713813e8c96fbeddbbc6d7e360f` |
| currentness-sha256.json | `f94540a3ef77e52f5cc56f9aa625c007e16956f5340ffd34f05f33e6f5888c18` |
| filemanager-check.json | `d8f73283f28068a73357e97782cb4560383088280667eeb244e740f1409e4289` |
| review-probes-cycle1.json | `489d295c47c7b5fa9a86e0f90e3ec27a7d37c2f189322d6902e6cab938b83629` |
| review-probes-cycle2.json | `f9d6fedfe28bf6e9a20bfdff5a7af0ba51be5360c99e0a602a88f80bc2a9c066` |
| standing-checks.py | `ff1c7d361ec07feb7985478df7cac1609b32c5c630aeab2ff3ac6fe2e82c3d6c` |
| standing-checks.log | `7c73c640b6d261ba8e97f0a7beb4bb0fa4e2914f6c2fdb906ceabe91e7d1bb49` |
| standing-checks.json | `642283eff4066542a8f70b3228881c9980e869c718d540820dc6867014f60947` |
| failure-oracles.json | `a1bde089a849be11a03a15bc56b67c95941a751167293f08a1d55e8b335bb973` |
| storage-profile.json | `1f358c8eb2b26dd7f869c8a24784c64ea0e16b0d9c18b23d52a0ec9e69426a0d` |
| storage-profile-base.json | `89d47858adcab797033a9feca549351641cfb6a2f6ee5da75a2c62082b3d450b` |
| storage-profile-comparison.json | `716f68bcb804412697889e96d4423138b06a051f3a88b5cedc73503d2a90ff7f` |
| registry-data-check.json | `14c66d3bf84bdfb2136a590036ebb3789a442477e6a1e4d26ce6e2e7a574e6b9` |
| shard-generate.json | `5b172afd4a3f3b16555cb621d9a7bcf34e977907ff0d123a82802db037768e51` |
| index-generate.json | `5f0972b4e9ef508b55c38908779a6374b21cdb76bc023525d4f78f4862b3f462` |
| shard-check.json | `25e03937700c17eaf1c5af802b6ea0730d0222ae7ca02f62e39577442c305420` |
| index-validate.json | `a3785fe817e2155166c56057c91d2c6ec776ba4107e4fcd6b1e232c4587f9077` |
| scope-audit.py | `b898ee54210e241b429b070dddbd0de045ac1fc5945248526c9f3f443f37a28c` |
| scope-audit.json | `ee95dee5d2bcc41fc9e53ff94d9ed061a3d0e0afd25f1afb32b845ab5cd47524` |
| citation-audit.json | `6fe4de5b7f322e53d5128eb358cf75b95fefb5c5d34df5796582db84439a794d` |
