# DF — review round 1 fixes

Branch: `plans/ea-w2-filesafe-20261104`. Assessed source head: `a73fe06f238b88db8b2f4280bcec34af65ee6e75`. Repair commit: `42b9a62384`. Retention-summary correction: `a73fe06f238b88db8b2f4280bcec34af65ee6e75`. Reviewed starting head: `be2b254338c4d5fd4d79e63df8a74f9dda651f44`. Report/self-grade commit follows without changing the assessed source tree.

All nine families have their technical source/oracle defects repaired. Two have 11 PASS / 0 PARTIAL / 1 ABSENT; seven have 10 PASS / 1 PARTIAL / 1 ABSENT. Every membership cell remains ABSENT. The seven PARTIAL cells are exact narrowed event-history retention questions. No 12/12, native certification or emission permission is claimed.

## Review round 1: findings and responses

- **B1 — fixed (`42b9a62384`).** Each safe-point family now requires its own complete application method-output composition: original record, canonical manifest, exact blob inventory and, for restored, full journal/operation list, pre/post manifests and equality/hold result. Body bytes are decoded against closed roots and compared to complete typed originals; independently rehashed mismatch negatives reject wrong subjects, counts, blob selection, SCM, cursor, lease, holds, operation state/staging and outcomes. Original Project resources are byte-identical. Evidence: `Plans/Contracts_V0.md:25039`; `Plans/Contracts_V0.md:25122`; `scripts/pm_filesafe_event_authority.py` application_original_failures; both own `.schema.json`/`.contract.json` resources. Verify with the full authority checker, including all five application restore outcomes and the original Project positives.
- **B2 — fixed (`42b9a62384`).** Durable original-operation phase is separate from volatile prepared/event/receipt caches; crash discards caches. Recovery refusal persists through retries and further crashes until explicit successful same-operation recovery. Terminal publication and retry independently resolve complete original EventRecord/full-value custody/unchanged first receipt. Issued-row loss, missing custody and changed first receipt refuse in both scopes for all nine. Retained retries and survivor rebuilds pass after original domain controls are disposed. Evidence: `Plans/storage-plan.md:29534`, corresponding SP-551..558; `ProtocolOracle`, `issued_failures`, every family's own `fix1` protocol rows. Verify with full authority checker and external exact review reproductions.
- **B3 — fixed (`42b9a62384`).** Pending work starts at owner commit, including before prepare, and must reconcile before reader cutoff. Each synthetic owner bank carries an independently captured complete retained boundary and source generation. Rebuild verifies coverage/full values against that boundary rather than accepting the current mutable map; loss before rebuild/cutoff or caller reduction refuses. Publication checks complete coverage and source/reader generation before CAS publication. No synthetic deletion permission or new retention decision is introduced. Evidence: own SP-550..558 withdrawal authority paragraphs and own Project/application traces. Verify with full authority checker and external exact review reproductions.
- **B4 — fixed (`42b9a62384`, `a73fe06f238b88db8b2f4280bcec34af65ee6e75`).** Existing Case L-3 exact-kind defaults assign `filesafe.destructive_override_granted` to `RP-AUTHORITY-INDEFINITE` and `filesafe.policy_degraded` to `RP-OPERATIONAL-2555D`; the graph and canonical summaries agree. Both current premises were checked against CV-552/F2-052/F2-213 and current FileSafe advisory text/CV-556. The other seven were separately audited and retain only the exact questions below; no source-body/index policy is reopened. Evidence: `Plans/storage-plan.md:29663`; `Plans/storage-plan.md:29928`; `fix1/retention-audit.json` pins all nine independent owner rationales. Verify with graph checks and full authority suite's wrong-retention assignment negatives. No finding disputed.
- **B5 — fixed (`42b9a62384`, refreshed `a73fe06f238b88db8b2f4280bcec34af65ee6e75`).** The earlier sparse generation omitted 16 currentness-inventoried ledger/schema/state/source files plus one committed `.evidence` input. Its validation ran against the same incomplete tree and passed locally; the committed readiness report failed with actual complete inputs. All 15 ignored currentness-edition files were already the right edition. This pass copies/verifies those 15 and confirms every one of the 269 inventoried source files exists before regeneration. Never hand-edited `_shards` or `.plan_index`. Correct generation removes all 17 false missing-source rows; top-level index validation is pass/exit 0. Readiness remains `blocked_runtime_certification_incomplete`; governance/runtime drift is preserved. Verify with `pm-plan-index.py validate`, parsed top-level status, and the readiness report's zero `event_authority_currentness_source_missing` rows.

## Family grades before and after

Before is the independent review, not the superseded P2 self-grade. Counts are PASS / PARTIAL / ABSENT.

| Family | Before | After | Owner units |
|---|---|---|---|
| `filesafe.command_denied` | 9 / 2 / 1 | 10 / 1 / 1 | CV-550, SP-550, ATS-275 |
| `filesafe.destructive_override_denied` | 9 / 2 / 1 | 10 / 1 / 1 | CV-551, SP-551, ATS-275 |
| `filesafe.destructive_override_granted` | 9 / 2 / 1 | 11 / 0 / 1 | CV-552, SP-552, ATS-276 |
| `filesafe.destructive_override_requested` | 9 / 2 / 1 | 10 / 1 / 1 | CV-553, SP-553, ATS-276 |
| `filesafe.guard_init_failed` | 9 / 2 / 1 | 10 / 1 / 1 | CV-554, SP-554, ATS-277 |
| `filesafe.path_denied` | 9 / 2 / 1 | 10 / 1 / 1 | CV-555, SP-555, ATS-277 |
| `filesafe.policy_degraded` | 9 / 2 / 1 | 11 / 0 / 1 | CV-556, SP-556, ATS-278 |
| `safe_point.created` | 8 / 3 / 1 | 10 / 1 / 1 | CV-557, SP-557, ATS-279 |
| `safe_point.restored` | 8 / 3 / 1 | 10 / 1 / 1 | CV-558, SP-558, ATS-279 |

`producer` returns PARTIAL → PASS for each safe-point family. `positive_negative_oracles` returns PARTIAL → PASS independently for all nine. `retention` becomes PASS for only the two exact-kind assignments. All other review statuses are carried after rereading each family's own owner evidence. All 108 cells have exact current citations and file/quote hashes, mechanically rechecked.

## Exact retention questions stopped for Jared

Each question is copied exactly from its own SP retention paragraph. The five security questions do not reopen a runtime class; the two snapshot-history questions explicitly separate already-governed originals. These are the remaining cells, not unfixed technical review findings.

- **`filesafe.command_denied`:** Does the retained command-denial EventRecord constitute audit authority (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`filesafe.destructive_override_denied`:** Does the retained destructive-override refusal EventRecord constitute an authority decision receipt (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`filesafe.destructive_override_requested`:** Does the retained destructive-override request EventRecord itself constitute approval/audit authority (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`filesafe.guard_init_failed`:** Does the retained fail-closed guard-initialization EventRecord constitute audit authority (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`filesafe.path_denied`:** Does the retained path-denial EventRecord constitute audit authority (RP-AUTHORITY-INDEFINITE), or non-authority security diagnostic history (RP-OPERATIONAL-2555D)?
- **`safe_point.created`:** Is safe_point.created EventRecord history an authority/capture receipt (RP-AUTHORITY-INDEFINITE), non-authority recovery operational history (RP-OPERATIONAL-2555D), or runtime history (RP-RUNTIME-365D), independently of the already-governed released snapshot bodies?
- **`safe_point.restored`:** Is safe_point.restored EventRecord history an authority/outcome receipt (RP-AUTHORITY-INDEFINITE), non-authority recovery operational history (RP-OPERATIONAL-2555D), or runtime history (RP-RUNTIME-365D), independently of the already-governed original restore transaction and snapshot bodies?

## Newly authored bindings and premise checks

- **safe_point.created:** Own application_records method output and application record/manifest/blob roots, exact body-root/codec graph joins, canonical manifest equality and complete capture/source/actor/SCM joins. Search scope and negative evidence are in its own `fix1/safe_point.created.search.txt`; existing F2-213/CV-366 and FileSafe 11.1.2b definitions were reused first.
- **safe_point.restored:** Own application_records method output with complete target/pre/post manifests, original safe-point record, blob inventory, restore journal/operations and equality/hold roots. Scope-safe application subject identity joins real Server/safe-point IDs; it introduces no physical table or second engine. Its own current-canon search is retained separately. Original Project key, codec and source bytes remain exact.
- **DL-045:** Both exact family names remain in the authorized technical-binding scope. Current F2-213 requires the same complete original mutation/restore protocol for app work, and CV-366 requires complete original-source resource/method closure. These premises still hold. No old answer is extended.
- **Retention:** Today's Case L-3 exact-kind text decides only the two assignments above on the inspected current evidence. Each of the other seven has a separately recorded rationale and question in `retention-audit.json`. No DL-045 reserved choice is answered.
- **Storage:** SP-286/CV-339 strict full-value v2 and SP-278/DL-076 remain adopted per family; original first receipt and nine-field durable token are preserved. Generic index/checkpoint policies and original body/transaction owners remain independent.

## Checks and limits

| Check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_filesafe_event_authority.py` | 0 | pass; 30 positives, 1,166 negatives, 396 protocol traces; all nine families and both scopes |
| `python3 scripts/pm_filesafe_event_contracts.py` | 0 | pass; all existing payload/schema/identity cases preserved |
| Exact independent B2/B3 reproductions extended to both scopes | 0 | pass; 18 family/scope rows refuse every reviewed counterexample |
| Shard generation and `--check --config Plans/sharding_config.json` | 0 | pass; only Contracts, Storage and Automated Testing owners changed |
| Index generation and `pm-plan-index.py validate` | 0 | top-level pass; zero false currentness missing-source rows; readiness stays blocked |
| All self-grade citations | 0 | 108 cells and all current file/quote hashes verified |
| `git diff --check` and scope guards | 0 | no whitespace defects, forbidden edits or Project source-resource drift |

No tests file was edited; the targeted entry points discovered under scripts/tests are the two FileSafe checkers, both run in full. No existing checker rule was weakened. New recovery/withdrawal/app-body cases run through the complete authority checker. Wrong policy assignments are also tested through that checker. Native authenticity, fsync, physical payload addressing, actual filesystem equality/effects, authorization/hold deletion, backup custody and CAS remain NOT_RUN. No admission, registry append, Decision Log entry, reseal, baseline refresh, landing or main push occurred.

Initial resources passed the stop rules: 110 GB available disk and 17 GB available RAM before worktree creation; sparse `Plans scripts reports tests` checkout from the pinned branch. All currentness dependencies were present for generation. No subagents; after loading the fix brief, no pm-mail. An initial read-only mailbox inbox/who call under the standing instructions preceded loading its prohibition; no messages were sent. The temporary fix worktree is removed after the final pushed report.

## IDs and shared paths

Reused existing **CV-550..558, SP-550..558, ATS-275..279** (23 units). No new PlanUnit/family/revision/Decision IDs. CV-559/SP-559 remain unused. Shared owner hunks are confined to CV-557/558 application-original prose, SP-550..558 recovery/withdrawal/retention text (including SP-552/556 canonical summaries), and ATS-275..279 regression obligations. Own schemas/graphs, fixtures and the authority checker accompany those edits. Derived shard changes belong only to the three edited owner documents; the index is regenerated. Registry, storage-value registry, original Project resources, governance locks/evidence and frozen validators are unchanged.

## Evidence custody

All retained evidence is below `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix1/`. Source searches, complete command outputs, independent reproductions, retention audit and currentness/input verification stay outside the repository. The complete manifest is `fix1/manifest.json`.

| Evidence path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix1/input-completeness.json` | `b28eeb82ec3b398a4a0813dc9c051b48abf08bca29b1dbb1ff44fb4b437fcf31` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix1/scope-final.json` | `58688509c4dc04c44ef52715c56bc5c93570663ea5f9f520dec331855699e026` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix1/checks.json` | `34e0401547bc734a72be75a04c7a5f41e6c9dbb709d7e83c952792ad6c6cb923` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix1/authority.json` | `a86ec4ecca72297bd7c60a21f2292722965af5cbc8568212cf5fc1ad4bcdb5f7` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix1/payload.json` | `8f7d3c1856e3d51f2147aa2f9833ff0158a30678adcf3ea5b526f21861d688ad` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix1/shards.json` | `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix1/index-validate.json` | `377a818416329f16e082d143d5f33b41cfaec317e6678ebc86225a2069f8aaa7` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix1/review-probe.py` | `fa5280ea5301bdea4f724c802c01b2e5c4428efbc5b7477be40e9e43ba5e000d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix1/review-probe.json` | `910dac810d2a8d034470127708913588a3a6825c46802b253405f5c1cec3c3d6` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix1/currentness.json` | `9b236515cb2a9b9ffc00b5c988addf5baa4a9b3fcc6e47acf6314ffa3532c4d8` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix1/grade-citations.json` | `29f667137ef037fa49d69a2537f12bc6b1f4f3f036e5a4f90882b54e45358692` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix1/retention-audit.json` | `521e8ddd84010590249c35aaa4b58da68c85ef036b45be7911340716ebed7a7d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix1/safe_point.created.search.txt` | `b2f4b670b4b8a1d73a42982b2d91ce30702036f2fc31ba1e05c5908e0241db7a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/fix1/safe_point.restored.search.txt` | `ad475257d294ee3a6936e731eaacdb69bd695881a149769e4758cf75262acf66` |
