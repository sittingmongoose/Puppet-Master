# CA-RET2 — Card 1 retention answers, 2026-11-05

**Branch:** `plans/ea-retention-cards2-20261105`. **Stack base:** `origin/plans/ea-retention-cards1-20261104`, `2663667e14346235daaa561d193e959422640b6e`. Implementation worker only; no landing. Before creation, `/` had 81 GB available and `free -g` reported 14 GB available; both required thresholds passed.

Jared’s verbatim answer is **“i approve all of it”**. The presented deck’s fast-reply rule maps approval to option A on every item. This change applies only Card 1.a–1.g, DL-415–DL-421, with DL-401’s previously approved durations, Project limits and protection rules. The new Decision Log entries are being supplied separately on `plans/ea-cards2-answers-20261105`; DL-401 is on the first answers stack. Neither answer branch is merged here.

Each no-project policy has one shared installation/Storage-instance count, `cardinality_scope=instance`, not a per-type, per-user, per-Server or per-Project application count. Each allows at most 2,000,000 retained records; only expired records free of legal/investigation holds, active references, recovery obligations and protected backups can be removed. Never remove early for space. If the full bucket has no eligible expiry, refuse the new history record while retaining feature availability. No cross-bucket borrowing, double count, private-memory merging, access grant or GitHub sign-in widening.

## Per-item changes

| Item / authority | Owner text changed | Registry policy entry | Open item |
|---|---|---|---|
| **1.a / DL-415** | `Plans/storage-plan.md:17437` — First successful save that survives restart anchors all 13 surviving names; retries, reprocessing and recovery never restart 90 days. Project count remains 2,000,000. | `Plans/storage_value_registry.json:574`, `RP-TELEMETRY-90D@1.0.0` | None for the clock; full-contract completion/admission remains separate. |
| **1.b / DL-416** | `Plans/storage-plan.md:17495` — Nine exact Debug investigation types share one no-project 2,000,000 bucket; 2,555 days from original recorded operation-finishing transition; no reprocessing/recovery reset. | `Plans/storage_value_registry.json:590`, `RP-DEBUG-APPLICATION-2555D@1.0.0` | Debug owner must reconcile the older Project-required payload with existing application-chat Debug. |
| **1.c / DL-417** | `Plans/storage-plan.md:17496` — Twelve exact private-chat memory-maintenance types share one no-project 2,000,000 bucket; the same 2,555-day original-operation-completion clock; no memory text or cross-corpus access. | `Plans/storage_value_registry.json:606`, `RP-MEMORY-MAINTENANCE-APPLICATION-2555D@1.0.0` | No counting question remains; maintenance execution/duplicate-sweep work belongs to the separate memory lane. |
| **1.d / DL-418** | `Plans/storage-plan.md:17497` — Five exact plugin load/tool/permission types share one no-project 2,000,000 bucket; the same 2,555-day original-operation-completion clock; permission-override emission remains fenced. | `Plans/storage_value_registry.json:622`, `RP-PLUGIN-OPERATIONS-APPLICATION-2555D@1.0.0` | None for counting; the permission-override candidate is not enabled here. |
| **1.e / DL-419** | `Plans/storage-plan.md:17498` — Three exact plugin-hook types share one no-project 2,000,000 bucket; 90 days on DL-415’s first durable-save clock. | `Plans/storage_value_registry.json:638`, `RP-PLUGIN-HOOK-APPLICATION-90D@1.0.0` | None for counting. |
| **1.f / DL-420** | `Plans/storage-plan.md:17499` — Only model.catalog_refreshed uses its no-project 2,000,000 bucket; 90 days on DL-415’s clock; formatter/LSP excluded. | `Plans/storage_value_registry.json:654`, `RP-MODEL-CATALOG-APPLICATION-90D@1.0.0` | None for counting. |
| **1.g / DL-421** | `Plans/storage-plan.md:17500` — Approved no-project preview policy has a 2,000,000 cap and 90-day DL-415 clock, with zero assigned types until exact-type owner confirmation. | `Plans/storage_value_registry.json:670`, `RP-PREVIEW-APPLICATION-90D@1.0.0` | All three preview types remain unconfirmed; see the pinned owner evidence below. |

The common no-project terms are at `Plans/storage-plan.md:17491`. The 90-day assignment heading is updated at `Plans/storage-plan.md:17478`. The telemetry default row is updated at `Plans/storage-plan.md:17414`. SP-237’s `depends_on` includes DL-415 beside DL-401 and DL-416–DL-421; its acceptance criteria and source lineage carry the clock/count rules (`Plans/storage-plan.md:17900`). SP-291 gains the previously disclosed DL-401 dependency/source-lineage repair without changing its existing buckets (`Plans/storage-plan.md:23937`).

## Preview scope evidence

There are **no affirmative exact-type owner confirmations** to cite. At `024adc567a2cf4f1c6da898c3951b9110df3b59e` on `plans/ea-w2-section15-newtools-20261104`, each prepared owner contract explicitly says `Scope: project_only`:

| Unconfirmed exact type | Owner source at the pinned commit |
|---|---|
| `preview.session.started` | `Plans/Section15_MVP_Promoted_Features_Spec.md:13651`, SMPFS-315 |
| `preview.session.refreshed` | `Plans/Section15_MVP_Promoted_Features_Spec.md:13706`, SMPFS-316 |
| `preview.session.stopped` | `Plans/Section15_MVP_Promoted_Features_Spec.md:13761`, SMPFS-317 |

The whole owner document’s SHA-256 is `ba88db62e4060c2a935b9164403ef8ab07071985833384ba8cfcf8de8bd85496`. General no-project preview availability does not confirm these three exact histories. The bucket is approved and materialized, but has **zero eligible members**. Do not broaden the Project-only contracts here. Each owner must supply confirmation and reconcile its payload/scope before any corresponding application assignment or admission. The four dev-session types remain Project-bound.

## Scope and invariance

- **Registry:** all 28 prior policy objects and every non-policy registry value are byte-equivalent after parsing; all 344 family rows are unchanged. Seven policy objects added, total 35. No family append, admission record, Decision Log entry, schema change or governance reseal.
- **Owner:** every original G01–G29 assignment row remains exact. Only the telemetry clock, six no-project policy definitions, their metadata/census companions and the disclosed DL-401 lineage repair change. No PlanUnit ID is added or removed.
- **Companions:** the readiness policy census and explicitly allowed onboarding-test policy census move 28 → 35. Family/status/tier pins and validation guards are unchanged. `.gitignore:83` explicitly allows `tests/test_pm_onboarding_phases.py`.
- **Pending-language sweep:** active top-level Plans source and the Storage owner were searched for the old clock/count questions, unselected anchor and unpublished-policy markers. Those Card 1 markers are replaced. Prior CA-RET reports, review artifacts and source ledgers retain their historical as-recorded status; this report supersedes their Card 1 clock/count open questions. Separate memory execution and preview-scope work remains separate.
- **Derived:** only the `storage-plan` and `storage_value_registry` shard namespaces and their manifests change, plus the six complete index outputs. The ignored currentness edition was copied from the shared checkout; all 15 SHA-256 values matched before generation. An ignored agent-packet evidence symlink was provided for the earlier checkers.

## Checks and exits

Commands ran in the requested sparse worktree (`Plans scripts reports tests`). These are static planning/contract checks, not native runtime proof. The full-tree landing check and aggregate governance reseal are not performed by this implementation worker.

| Check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | pass; output `shards-generate.txt` |
| `python3 scripts/pm-plan-index.py generate` | 1 | fail; output `index-generate.txt` |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass; output `shards-check.txt` |
| `python3 scripts/pm-plan-index.py validate` | 1 | fail; output `index-validate.txt` |
| `python3 scripts/pm-plans-verify.py validate-new-contracts --subcheck-timeout-seconds 900` | 0 | pass; output `plans-verify-validate-new-contracts.txt` |
| `python3 scripts/pm-plans-verify.py validate-projects-refresh-contracts --subcheck-timeout-seconds 900` | 0 | pass; output `plans-verify-validate-projects-refresh-contracts.txt` |
| `python3 scripts/pm-plans-verify.py validate-browser-event-admission --subcheck-timeout-seconds 900` | 0 | pass; output `plans-verify-validate-browser-event-admission.txt` |
| `python3 scripts/pm-plans-verify.py validate-testing-session-event-admission --subcheck-timeout-seconds 900` | 0 | pass; output `plans-verify-validate-testing-session-event-admission.txt` |
| `python3 scripts/pm-plans-verify.py validate-github-project-integration --subcheck-timeout-seconds 900` | 0 | pass; output `plans-verify-validate-github-project-integration.txt` |
| `python3 scripts/pm-plans-verify.py validate-working-notebook-contracts --subcheck-timeout-seconds 900` | 0 | pass; output `plans-verify-validate-working-notebook-contracts.txt` |
| `python3 scripts/pm-plans-verify.py validate-case-l-non-event-materialization --subcheck-timeout-seconds 900` | 0 | pass; output `plans-verify-validate-case-l-non-event-materialization.txt` |
| `python3 scripts/pm-plans-verify.py validate-implementation-readiness --subcheck-timeout-seconds 900` | 1 | fail; output `plans-verify-validate-implementation-readiness.txt` |
| `python3 scripts/pm-plans-verify.py verify-spec-lock` | 1 | fail; output `plans-verify-verify-spec-lock.txt` |
| `python3 scripts/pm-plans-verify.py lint-contractrefs` | 1 | fail; output `plans-verify-lint-contractrefs.txt` |
| `python3 scripts/pm-implementation-readiness.py validate` | 1 | fail; output `readiness-validate.txt` |
| `python3 scripts/pm-implementation-readiness.py self-test` | 1 | fail; output `readiness-self-test.txt` |
| `python3 scripts/pm-implementation-readiness.py validate-case-l` | 0 | pass; output `readiness-validate-case-l.txt` |
| `python3 -m unittest tests/test_event_authority_holding_bucket.py` | 1 | see retained output; output `test_event_authority_holding_bucket.txt` |
| `python3 -m unittest tests/test_pm_emit_only_event_boundaries.py` | 1 | see retained output; output `test_pm_emit_only_event_boundaries.txt` |
| `python3 -m unittest tests/test_pm_pnc019_currentness.py` | 1 | see retained output; output `test_pm_pnc019_currentness.txt` |
| `python3 -m unittest tests/test_pm_coordination_events.py` | 1 | see retained output; output `test_pm_coordination_events.txt` |
| `python3 -m unittest tests/test_pm_onboarding_phases.py` | 1 | see retained output; output `test_pm_onboarding_phases.txt` |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | pass; output `final-shards-generate.txt` |
| `python3 scripts/pm-plan-index.py generate` | 1 | fail; output `final-index-generate.txt` |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass; output `final-shards-check.txt` |
| `python3 scripts/pm-plan-index.py validate` | 1 | fail; output `final-index-validate.txt` |
| `python3 /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET2/audit_scope.py` | 0 | pass; output `final-scope-audit.txt` |
| `git diff --check` | 0 | see retained output; output `final-diff-check.txt` |
| Registry JSON Schema + `storage_value_registry_data_failures` + invariance/population audit | 0 | Zero schema/data failures; 28 policies/344 families preserved, seven distinct policies, original exact-name groups preserved; no new PlanUnit IDs. |
| PlanUnit-retention baseline probe against current `origin/main` | 0 | Base and tip produce the same 22 failures; see below. |

**Index blockers:** generation writes all six outputs but exits 1 because SP-237’s DL-401/DL-415–DL-421 and SP-291’s DL-401 dependencies are outside this stack (nine dependency edges). Validation additionally has 22 unchanged baseline failures: 21 invalid legacy ledger decision files and DL-302 absent from this older stack relative to current `origin/main`. Calling the unmodified `plan_unit_retention_failures` on the base index and the regenerated tip index yields identical 22 rows. The other three index validation rows are the required unresolved-dependency report and its two blocked build-order consequences. No missing decision is fabricated and no dependency is hidden.

Other failing validators/tests retain their output for review rather than being represented as passes. The checker analysis below distinguishes current failures and earlier recorded results.

## Open items and integration

1. **Preview scope:** obtain each of the three exact-type confirmations above; none is assigned to the no-project bucket here.
2. **Answer stack:** integrate the answers carrying DL-401 and DL-415–DL-421, then regenerate and validate the complete index. Keep the required dependency edges.
3. **Debug payload:** owner reconciliation of the older Project-required minimum remains technical work, not another availability/count decision.
4. **Existing index/readiness failures:** the unchanged legacy ledger issues and missing DL-302 require the integration tree/current-main context. No unrelated ledger or decision entry is edited.
5. **Governance currentness:** request the assigned reseal for edited Storage sources and the readiness script after integration. Do not update Spec Lock, evidence, frozen validators or currentness edition in this branch. Full admission/native verification remains outside this implementation step.

## Evidence custody

External bundle: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET2`. The report is copied there as `CA-RET2.md`. `SHA256SUMS` covers the copied report, sources manifest, audit, scope evidence, retained checker outputs and reproducible check helpers. Each source is pinned in `source-hashes.json`; direct hashes follow.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/BRIEF-DRAFT.md` — SHA-256 `41864b36b0ec066dd89e05ce02241cd87dbdcfcedcd3cc6bfaad43830e322191`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/CARDS2-APPLY.md` — SHA-256 `95289dc973f3a0696eb7f7099345130f57ec42368654f387f2a7da8a813e0891`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md` — SHA-256 `e7e8d3f3a2f23737b201becddd94ff0c707815520a366ab32758088c720927fd`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md` — SHA-256 `6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-RET-sol/REVIEW.md` — SHA-256 `3f16860e9d61d6c7bd1b1c238d99e9a8ba65415fdb62c936afebfdf5b9812623`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-RET-sol/REVIEW-cycle2.md` — SHA-256 `98c35c333706290f3e2bdab26fb42c18337298369afe565310a6aa84c14c4ded`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-RET-sol/REVIEW-astra.md` — SHA-256 `ba5d5f1dd4f30e62fda8a20864f441d822a3b2a5aedd7e97c0e9a3f1f6fb37c4`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET2/scope-audit.json` — SHA-256 `cb4dfda2b3f9ddb21e70af139019b6b7ead3dc37a38438c670f23623c0fd40a6`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET2/index-retention-baseline.json` — SHA-256 `85b0a077983228db8f6fc007b311258299d75eaf1604e0d47826401aa2a8afcc`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET2/preview-scope-evidence.json` — SHA-256 `7772f1b877904d5a5966209c74ad2fc43484140ee1931edb533970ecd42eee36`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET2/currentness-copy.json` — SHA-256 `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET2/pending-marker-audit.json` — SHA-256 `55f553a1fd9b85a946fc09d2e282446c66e34735474ebc02ea44d986c98bd360`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET2/card1-approved-options.json` — SHA-256 `21b5b9ec043a8fdffea58426644774e4125d4804d60ba7b1ab040a0f8c75c5de`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET2/onboarding-tail.json` — SHA-256 `fcedda347079ec054c5efe25da7eafadb78a58229eb6001cf4e8b6a83fa9e032`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET2/checker-comparison.json` — SHA-256 `7f6c30bb08d06fcfa237244be8a961f7290b657fc776f00fa94b9473b9e2701d`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET2/checks/results.json` — SHA-256 `0ee595c58510ce7352fd8abb920ae9f528bb8eb18fa2c2e58f52188f88100bb1`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET2/checks/final-results.json` — SHA-256 `b9d5938633c955bcf0dfa44a3d0c9a7d89c02b4b3cc309d3643765b0356441c1`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET2/checks/SHA256SUMS` — SHA-256 `5b515fdac24c9137633cf9fe1ff582005c9ffb4bb8bd265cdcbe88b3ebd3faf2`.

## Checker failure analysis

All five complete test suites exit 1 with **exactly the same failing test/subtest names** as the retained CA-RET fix1 outputs. This compares recorded outputs, not a fresh full-tree baseline run.

| Suite | Tests run | Failing test/subtest names |
|---|---:|---:|
| `test_event_authority_holding_bucket` | 34 | 2 |
| `test_pm_emit_only_event_boundaries` | 13 | 1 |
| `test_pm_pnc019_currentness` | 9 | 1 |
| `test_pm_coordination_events` | 50 | 14 |
| `test_pm_onboarding_phases` | 47 | 1 |

The onboarding census test still stops at the unchanged **342-family pin versus 344 registry families**, before reaching the retention assertion. Its policy/storage/gate tail was invoked directly: **35 policies, zero storage errors, one onboarding contract checked and valid** (`onboarding-tail.json`, exit 0).

The readiness wrapper and direct validator report **109 rows**. Compared with the recorded earlier 50, the only error-count changes are:

- `buildability_report_node_readiness_field_mismatch`: 0 → 1 (+1).
- `event_authority_currentness_source_drift`: 22 → 79 (+57).
- `node_readiness_build_order_unavailable`: 0 → 1 (+1).

The 79 currentness-drift rows use the prescribed current ignored edition copied for this run; the older report used its earlier edition. The two build-order/report-status rows follow the explicit missing answer dependencies. The remaining error-kind counts equal the recorded earlier output. This is not a fresh full readiness baseline comparison. There are no registry policy-count or storage-value data failures.

Readiness self-test exits 1 on `case_l_verification_integration`, specifically `event_legacy_two_positive_full_negative_matrix_recomputes=false`, as in the prior output. The unchanged legacy-normalization golden fixture has registry revision `2026-08-27.1` where the checker expects `2026-11-04.1`.

Spec Lock exits 1 with nine `stale_hash` rows. Contract-reference lint exits 1 on the same ignored audit input absent in the sparse worktree: `Plans/00-plans-index.md:255` → `Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json`. Neither failure is hidden or repaired outside this worker’s scope.

The full checker suite ran before a final prose correction from “never start or reset” to “never restart”, so a first successful save reached after an earlier failed attempt is unambiguously the anchor. The final shard/index regeneration, shard/index validation, full registry/scope audit and whitespace check ran after that correction. No registry, schema, policy value, script or test changed after the full suite.
