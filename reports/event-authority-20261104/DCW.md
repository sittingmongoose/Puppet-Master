# DCW — fix round 1, Event Authority

Branch: `plans/ea-w2-chain-wizard-20261104`. Reviewed head: `a9c2916df1ac3e37922392dc07545a662ada2bc9`. Implementation head: `033c16f9400206b3c8842f1b448cae1212570d0e`. Final report-only follow-up preserves this assessed source tree. Worker: DCW-FIX1, VM; detached sparse worktree `/home/sittingmongoose/pm-worktrees/DCW-fix1`, local clone `/home/sittingmongoose/src/PuppetMaster`.

Prepared without admission. No mail, subagents, main push, landing, lock, reseal, event registry append, admission or Decision Log edit. Entry: 18 GB available RAM, 113 GB free disk; pre-completion: 14 GB RAM and 128 GB disk. The 6 GB memory and 50 GB disk thresholds were satisfied. The worktree is removed after the final branch push.

## Outcomes and before/after grades

Before means the independent Sol review. PASS describes normative depth, never native execution. Membership ABSENT and retention PARTIAL are the two instructed exceptions for prepared status.

| Exact family | Before | After | Outcome |
|---|---|---|---|
| bundle.revision_requested | 6 PASS / 3 PARTIAL / 2 CONFLICT / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared |
| bundle.revision_started | 6 PASS / 3 PARTIAL / 2 CONFLICT / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared |
| bundle.revision_completed | 6 PASS / 3 PARTIAL / 2 CONFLICT / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared |
| bundle.revision_interrupted | 6 PASS / 3 PARTIAL / 2 CONFLICT / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared |
| wizard.opened | 6 PARTIAL / 6 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared |
| wizard.deferred_payload.loaded | 6 PARTIAL / 6 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | prepared |
| wizard.blocked | 6 PARTIAL / 6 ABSENT | 6 PARTIAL / 6 ABSENT | stopped for Jared, Q1a |
| wizard.unblocked | 6 PARTIAL / 6 ABSENT | 6 PARTIAL / 6 ABSENT | stopped for Jared, Q1b |

Prepared-family passes: **0/4 drafted (0/8 assigned) → 6/6 drafted (6/8 assigned)**. Zero exclusions/admissions. All eight retention cells remain PENDING_RETENTION_DECISION. The six prepared source contracts also defer the original source lifetime to RT. No TTL or indefinite policy was selected. `DCW.self-grade.json` records every criterion with exact current source quotes; hold owner_doc cells are PARTIAL, never CONFLICT with a retired owner.

## Review round 1: findings and responses

1. **Fixed — appendable writer policy** (`033c16f9400206b3c8842f1b448cae1212570d0e`). Where: `Plans/Contracts_V0.md:24471` through CV-593; `scripts/pm_bundle_revision_events.py:35`. Cause: projector_replay_only is compatibility-reader-only and normal append refuses it. Fix: every bundle writer uses dedupe_by_idempotency_key with its existing frozen identity; passive consumers stay effect-free. All six full fixtures test normal append acceptance, projector_replay_only append refusal and passive compatibility reads. The original 179 checks remain; no rule was weakened to admit the old writer selection.
2. **Fixed — original revision custody** (`033c16f9400206b3c8842f1b448cae1212570d0e`). Where: `Plans/storage-plan.md:29876`, `Plans/dcw/revision_run.schema.json`, the extracted `revision_run` storage-value row. Cause: the source key was still inside a deferred GUI inventory. Fix: remove only that key from the deferred group, materialize its closed original intent/result/phase/event/receipt value, and bind exclusive source-key/value_revision CAS, lost-ack recovery, original epoch preservation and mandatory coherent backup/restore. Every phase intent_ref resolves the same embedded immutable original intent; there is no new deferred request/receipt store. See per-family SP-575–578 adoption. Verify source/receipt/restore/terminal negative cases through the full checker.
3. **Fixed — full oracles** (`033c16f9400206b3c8842f1b448cae1212570d0e`). Where: `Plans/dcw_event_contract_fixtures.json`, `scripts/pm_dcw_event_oracles.py`, invoked by the original full checker. Cause: local shape/predecessor checks did not exercise the physical/source composition. Fix: 629 additional full-composition cases, 808 total. They cover complete closed EventRecords, append policy, admission, original source/intent/result/document/first receipt, full-value commitments, prepared-before-append, lost ack, terminal exclusion, interrupted resume, historical earlier phases, current permissions/deletion, restore, cutoff/drain/fence, withdrawn/unsupported readers and complete replacement rebuild. The shared SP-278 checkpoint/live token is selected from the existing `event_index_consumer_adoption_fixtures.json` composite; no local replacement checkpoint contract. Native source authentication, actual sync/CAS/restore and codec adapters remain authored NOT_RUN obligations.
4. **Fixed — false action-existence stop removed** (`033c16f9400206b3c8842f1b448cae1212570d0e`). Where: `Plans/Planning_Wizard.md:4062`, `Plans/Planning_Wizard.md:4119`, `Plans/Contracts_V0.md:24764`, `Plans/Contracts_V0.md:24833`, `Plans/storage-plan.md:29992`, `Plans/storage-plan.md:30007`. Cause: the reviewed draft omitted UCC-002/current §2.1A's explicit deferred Planning Wizard routing. Fix: two independent current contracts for the existing real Project/current intake child. Open observes the original successful open result; load observes successful canonical seed acceptance and joins the original open receipt. Every canonical PWIZ-001 seed kind has positive cases; stale/unsupported raw legacy seeds, missing child/context/original open/receipt are rejected. No Chain Wizard feature or event-name alias is introduced.
5. **Fixed — wizard owner classification and narrowed holds** (`033c16f9400206b3c8842f1b448cae1212570d0e` plus this report-only follow-up). Current CV-233/CV-234 and intake routing survive; CWF is retired, so it is not a second live owner. The held owner cells are PARTIAL. Q2 is removed. Q1a/Q1b below identify the actual unresolved current subject and emission/resolution predicates, with review recommendations separately labeled and unapplied.
6. **Preserved — sound bundle reconciliation** (`033c16f9400206b3c8842f1b448cae1212570d0e`). ACD-049/050 and ACD-571–574 remain the semantic owners for the existing Deep Plan targeted-revision path. No PRD/PlanningRun revision producer, automatic Multi-Pass Review or execution grant is added. The two Wizard intake observations are separately grounded in their existing current intake action.

No finding is disputed. Recommendations for blocked/unblocked remain unapplied.

## Questions for Jared — card-ready, no answer applied

**Q1a — wizard.blocked / current subject and emission predicate.** Under `Plans/Contracts_V0.md:14896` (CV-233) and `Plans/Contracts_V0.md:2686`, which exact existing PlanningRun or topic owner identity must `wizard_id` identify, and which existing blocked/remediation predicate emits this observation, including the current source of `round_count`? PWIZ-002 owns the current aggregate/topic model; shared route_target/blocked identity does not decide that subject or predicate.

**Review recommendation, unapplied:** retain an observation of the existing Planning Wizard blocked/remediation episode after Jared confirms its actual current subject/trigger. Use current route/blocked identity; do not resurrect a three-round threshold or separate wizard_status state machine. Subsequent identity/schema/checkpoint work is technical.

**Q1b — wizard.unblocked / matching current resolution predicate.** Under `Plans/Contracts_V0.md:14944` (CV-234), for that same confirmed current subject and blocked/remediation episode, which existing authorized resolution transition emits the corresponding observation, and how does `resolution_source` identify that actual resolution and preserve causality?

**Review recommendation, unapplied:** the corresponding observation when that same owner episode clears through an existing authorized resolution, preserving subject and causality. Confirm with Q1a; a route-open or replay never counts as resolution.

Current supporting evidence: `Plans/assistant-chat-design.md:3524`; `Plans/Planning_Wizard.md:116`. These holds do not reopen already-decided intake action existence or choose retirement/historical-only disposition. **Jared's answers: PENDING.**

## Current-canon search, premise checks and new technical bindings

Per-family base search: top-level Plans owner Markdown, event_payloads JSON and event/storage registries; generated shards and ledgers are excluded as semantic evidence. The original four bundle searches are retained at `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/base-family-search.json` (SHA-256 `96832ddf6013b0116d2adff5ac939f365bb6928a4b2454d59435a1881d0f605a`). Before new Wizard drafting, both exact names were separately searched at the reviewed head; `fix1-wizard-search.json` records the scope, matches and bounded absence of exact emitters, schemas, identity/read/source contracts. A negative search never substitutes for source custody.

- **Bundle reuse:** ACD-049/050, Storage's exact lifecycle audit names and Contracts' requested minimum establish the four current behaviors; ACD-571–574 keep them Deep Plan-only. Retirement of CWF does not retire them.
- **Wizard correction:** UCC-032 and UCC-002/current §2.1A (`Plans/UI_Command_Catalog.md:330`, `Plans/UI_Command_Catalog.md:1315`) decide deferred Planning Wizard routing, real Project and actual child/current refs. PWIZ-001 (`Plans/Planning_Wizard.md:22`) decides the three traceable accepted seed families. The old draft's action-existence premise failed; no owner answer was required.
- **Blocked hold:** current CV-233/CV-234 and ACD's shared taxonomy are live, while CWF/WM-036 old lifecycle text is compatibility-only. The missing exact current subject/predicates remain a Jared choice.
- **Shared prerequisites:** current SP-286/CV-339 full-value v2 and SP-336/SP-347/SeglogFrameV2 are explicitly adopted; DL-076's nine-field durable token rule is preserved. No older product answer is applied to pick retention or a Wizard trigger. DL-045 supplies bounded technical scope only.

New source contract: SP-579 materializes existing `revision_run.v1`, original intent and phase source_ref recipe (`revision_run_phase:` + compact-array SHA-256), original result joins and complete receipt/recovery/restore protocol. This closes an existing source, without installing a runner or admitting an event. Bundle emitter/read identifiers and identity recipes remain the four previously authored independent contracts, now corrected and completed.

New independent Wizard bindings: `emitter.wizard_opened@1.0.0`, `reader.wizard_opened_history@1.0.0`, `emitter.wizard_deferred_payload_loaded@1.0.0`, `reader.wizard_deferred_payload_loaded_history@1.0.0`; each exact payload schema, compact JSON/SHA-256 identity over exact event/Project/PlanningRun/intake child/request, and original source family `wizard_open_evidence` or `wizard_seed_load_evidence`. Each physical source has its own closed schema/key/result/original receipt and restore protocol under its own Storage heading, with its own materialized storage-value row. All are labeled newly authored technical contracts, never pre-existing definitions. Both reuse the current command instance and actual child/Named Plan/context and preserve all canonical seed warnings/amendments/lineage and overlapping work intents.

All six independent history consumers explicitly reuse SP-278's existing generic projector/reader/checkpoint, global coverage and prior-value CAS; no per-family persisted cursor/projection/dedupe namespace is added. Permanent EventRecord identities stay with the existing global/scoped indexes. Existing index/checkpoint retention is unchanged.

## Shared-file hunks and IDs

- `Plans/Contracts_V0.md`: edit only lane units CV-590–593; append CV-594/595.
- `Plans/storage-plan.md`: edit only lane units SP-575–578; append SP-579 and two separately named exact-family Storage custody sections. The named sections avoid minting additional SP IDs beyond the allocated block.
- `Plans/Planning_Wizard.md`: append PWIZ-097/098. Main's maximum was PWIZ-037; neither new ID existed on the initial 501 origin refs. The final pinned scan covers 506 refs and distinguishes the expected declarations on this pushed lane from collisions elsewhere.
- `Plans/storage_value_registry.json`: extract only revision_run from `github_bundle_note_preview_browser_families`, add its materialized original-source row and two independent Wizard original-source rows. Unrelated deferred keys remain deferred.
- New three source schemas, two Wizard payload schemas, six-family full fixtures and the static oracle module; extend the original checker. Existing four bundle payload schemas/fixtures remain valid. No tests file is edited.
- Derived files regenerated only for contracts_v0, planning_wizard, storage-plan, storage_value_registry and the global `.plan_index` outputs. No other owner's shard directory changes.

IDs used in this lane: **CV-590–595, SP-575–579, ACD-571–574, PWIZ-097/098**. New in round 1: **CV-594/595, SP-579, PWIZ-097/098**. The initial 501-ref scan found no existing declarations before minting; the final pinned 506-ref scan finds only this lane's expected declarations and no collision on another ref. No ATS, registry, admission, Decision Log, WorkNode or decision-card ID is minted. Q1a/Q1b are report-local unanswered labels.

## Verification and limits

| Check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_bundle_revision_events.py` | 0 | PASS, 808 static cases, 629 full-composition cases |
| Full storage-value registry Draft 2020-12 validation and source-schema mirror checks | 0 | PASS |
| `python3 scripts/pm-storage-recovery-contracts.py --self-test` | 0 | top-level status pass; failures empty |
| 13 edited/new PlanUnit YAML/token checks; path/admission/derived-owner checks | 0 | PASS |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | pass |
| `python3 scripts/pm-plan-index.py generate` | 0 | top-level pass |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass |
| `python3 scripts/pm-plan-index.py validate` | 0 | top-level pass |
| `git diff --check` | 0 | pass |
| Final self-grade quote verification and 506-ref ID scan | 0 | pass |

All 15 ignored currentness-edition files were copied before index generation and matched SHA-256. An intermediate index validation overlapped a later source edit and reported one stale generated readiness artifact; final regeneration/validation replaces that result. The storage checker first required its documented --self-test selector; the successful invocation above is the recorded result. No validator was weakened. No aggregate governance/landing gates or reseal were run for this unlanded drafting fix.

Static source/codec/receipt fixtures use synthetic trusted owner observations. Actual native source authentication, original issuance/sync, protected-store CAS/atomicity, backup and recovery remain NOT_RUN. Materialized here means a complete planning schema/contract, not deployed storage or Event Authority activation. Admission and RT retention remain the integration work; the two narrowed Wizard questions remain Jared's.

## Retained evidence

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DCW-sol/REVIEW.md`, SHA-256 `a464f0fef0d3e7f52419b3abc0b35f2f1e7816aec4e2d2621498cccaba445e07`. Full fix outputs below use directory `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW` plus filename and SHA-256; the report/self-grade are copied there after the final push. Scratch authoring scripts are removed, and no raw captures or logs are committed.

| Evidence file | SHA-256 |
|---|---|
| `fix1-check-results.json` | `3cc01253dbdefc747b89416bedb09f65dcb3f070cbdb063a0781530e70957fff` |
| `fix1-contract-check.txt` | `406c4aa137f6f4aa246a4d7883120f0d36df29bf6d89cd819206633701d781f9` |
| `fix1-currentness-sha256.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `fix1-diff-check.txt` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `fix1-id-collision-check.json` | `b5ea43f43475f93daa36ff18081a68d052a235a726ada0ffda29339c9c664026` |
| `fix1-index-generate.txt` | `63064fc44b7ec58d9bf002403a748696f276de638733932c91ca9295b963189b` |
| `fix1-index-validate.txt` | `4937662c8dfcfd75243ced0cc207e035f27b67e10f53ad31e7374e3e2ca9b5d0` |
| `fix1-quote-check.json` | `9f8144ac6a5eca1be9226f90477cf9a0db35ea02c33b595da6a589eb2f153955` |
| `fix1-shard-check.txt` | `a715ce384c99d89a8b5576fb6a07f92786372746197d08d9bad57c619fec35c1` |
| `fix1-shard-generate.txt` | `d7cfdf85905b1af45d5817cf77df09f8ece650942ade45163f90dd6f61b3ad68` |
| `fix1-storage-recovery-check.txt` | `e56e543c18588569abd7a299f25004750f6954e919c5571c6a669b38668eca1a` |
| `fix1-structural-checks.json` | `b8b48bb398f00e2fdb6f0e2538b60716478bee4928e8b4cfba773a69534d4946` |
| `fix1-wizard-search.json` | `324dffe4d7426126626a8fe31fc4262d501880855d81d357a2c4441e5621180f` |
