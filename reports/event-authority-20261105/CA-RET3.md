# CA-RET3 — Third-sitting retention answers, 2026-11-05

**Branch:** `plans/ea-retention-cards3-20261105`. **Base:** `origin/main`, `2989975e8f8a4a1e49235e8ae2095b3df7ea0321`. Implementation worker only; no landing. Before creation, `/` had 106 GB available and `free -g` reported 15 GB available; both required thresholds passed.

Jared's verbatim answer is **"The rest I will defer to your recommendations."** The presented deck's fast-reply rule maps approval to option A on every item, so all twelve items (DL-453–DL-464) are answered A. This change applies items 1.a–7.e to the Storage owner text and policy objects. The Decision Log entries are supplied separately on `plans/ea-cards3-answers-20261105` (not yet pushed at application time); that branch is not merged here.

Each new application policy has one shared Storage-instance count, `cardinality_scope=instance`, not a per-type, per-user, per-Server or per-Project count. Each allows at most 2,000,000 retained records; only expired records free of legal/investigation holds, active references, recovery obligations and protected backups can be removed. Never remove early for space. If the full bucket has no eligible expiry, refuse the new history record while retaining feature availability. No cross-bucket borrowing, double count, access grant or GitHub sign-in widening. The new 2555-day policies use `anchor_kind=creation` because every third-sitting bounded clock is a first-durable-save clock ("first successful save that survives a restart" of the recorded change or result); `terminal_transition` ("the transition that finishes the operation") would contradict item 3.a's explicit "never waits for the operation's later finish" and items 5.a/7.a/7.d/7.e's first-save wording.

## Per-item changes

| Item / authority | Owner text changed | Registry policy entry | Open item |
|---|---|---|---|
| **1.a / DL-453** | `Plans/storage-plan.md:17506` — 47 further histories kept permanently: 27 Both-scope, 14 Project-only, 6 application-only; the 33 Both/application types keep the permanent rule outside Projects. No age/count expiry, no new allowance. Deletion and storage-pressure rules as decided. | Reuses `RP-AUTHORITY-INDEFINITE@1.0.0`; no new object | None; full-contract completion/admission remains separate. |
| **2.a / DL-454** | `Plans/storage-plan.md:17519` — 33 routine histories kept 90 days from first durable save; 26 Project-eligible types share `RP-TELEMETRY-90D`; 29 application-eligible types share one new 2,000,000 bucket. No reset on retry, reprocessing or restore. | `Plans/storage_value_registry.json:686`, `RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0` | None for the clock/count; admission remains separate. |
| **3.a / DL-455** | `Plans/storage-plan.md:17527` — 24 operational/security/recovery histories kept seven years from the original saved change each entry records; a recorded start begins its own clock at first save. 19 Project-eligible types share `RP-OPERATIONAL-2555D`; 16 application-eligible types share one new 2,000,000 bucket. | `Plans/storage_value_registry.json:702`, `RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0` | None for the clock/count; the shared Project object keeps its values, the card clock governs these entries. |
| **4.a / DL-456** | `Plans/storage-plan.md:17539` — Four session-prompt histories kept as long as the target chat, counted in its 250,000 shared limit with linked continuation; chat deletion hides at once, purges unheld active copies in 24 h and backup bytes in 30 d. | Reuses `RP-CHAT-THREAD-LIFETIME@1.0.0`; no new object | None. |
| **5.a / DL-457** | `Plans/storage-plan.md:17541` — `planning.question_budget_exhausted` kept 2,555 days from the first durable save of the refusal/next-step result across Plan, Deep Plan and question banks. Project records share `RP-OPERATIONAL-2555D`; one new 2,000,000 application bucket, no fresh allowance per chat/workflow/participant/source. | `Plans/storage_value_registry.json:718`, `RP-QUESTION-BUDGET-APPLICATION-2555D@1.0.0` | None. |
| **6.a / DL-458** | `Plans/storage-plan.md:17543` — Cross-chat `browser.context_share_revoked` kept until the last affected recipient chat is deleted; counted once in each affected chat's 250,000 allowance; single-recipient case keeps the G10 Chat rule unchanged. | Reuses `RP-CHAT-THREAD-LIFETIME@1.0.0`; no new object | None; binds the DS15 pending cross-chat question. |
| **6.b / DL-459** | `Plans/storage-plan.md:17545` — Two Browser reader checkpoints under the existing disposable-checkpoint rule: current copy while needed, at most three copies per reader per Project/Server history, replaced copies kept seven days (604,800 s), mixed-chat deletion boundary. Zero new event families. | Reuses `RP-PROJECTION-3GEN@1.0.0`; no new object | None; binds both DS15 pending checkpoint questions. |
| **7.a / DL-460** | `Plans/storage-plan.md:17551` — `filesafe.command_denied` outside Projects: own 2,000,000 allowance, already-chosen 2,555 days from the saved original result's first durable save; scoped deletion/protection rule at `:17549`. | `Plans/storage_value_registry.json:734`, `RP-FILESAFE-BLOCKED-COMMAND-APPLICATION-2555D@1.0.0` | None; Project edition keeps its decided rule. |
| **7.b / DL-461** | `Plans/storage-plan.md:17552` — `filesafe.destructive_override_denied` outside Projects kept permanently, no age/count expiry, Server-wide boundary, scoped deletion rule. | Reuses `RP-AUTHORITY-INDEFINITE@1.0.0`; no new object | None. |
| **7.c / DL-462** | `Plans/storage-plan.md:17553` — `filesafe.destructive_override_requested`: same as 7.b. | Reuses `RP-AUTHORITY-INDEFINITE@1.0.0`; no new object | None. |
| **7.d / DL-463** | `Plans/storage-plan.md:17554` — `filesafe.guard_init_failed` outside Projects: own 2,000,000 allowance, 2,555-day first-durable-save clock, scoped deletion rule. | `Plans/storage_value_registry.json:750`, `RP-FILESAFE-GUARD-FAILURE-APPLICATION-2555D@1.0.0` | None. |
| **7.e / DL-464** | `Plans/storage-plan.md:17555` — `filesafe.path_denied` outside Projects: own 2,000,000 allowance, 2,555-day first-durable-save clock, scoped deletion rule. | `Plans/storage_value_registry.json:766`, `RP-FILESAFE-DENIED-PATH-APPLICATION-2555D@1.0.0` | None. |

No stopped questions: every item's option A states its lifetime, clock, counting, deletion and protection completely.

The common third-sitting terms are at `Plans/storage-plan.md:17504`. The FileSafe application boundary is at `Plans/storage-plan.md:17547`. SP-237's `depends_on` includes DL-453–DL-464 beside the earlier decisions; its acceptance criteria and source lineage carry the new assignment rules (`Plans/storage-plan.md:17955`). The census pin moves 35 → 41 policies (`Plans/storage-plan.md:533`).

## Families and groups per item

- **1.a (47):** Repository-hosting services 15, Source Control 9, Testing and capture 2, Back Seat Driver 2, Backup 1, Remote Access 1, Server 4, Assistant Plans 5, External Research 3, Goals 2, Notebook 3 (`Plans/storage-plan.md:17507-17517`).
- **2.a (33):** Repository-hosting services 14, Source Control 4, Artifacts 1, Testing and capture 7, Remote Access 4, Server 3 (`Plans/storage-plan.md:17520-17525`).
- **3.a (24):** Repository-hosting services 5, Source Control 6, Artifacts 1, Testing and capture 2, Backup 1, Remote Access 3, Restore 1, Server 2, External Research 2, Notebook 1 (`Plans/storage-plan.md:17528-17537`).
- **4.a (4):** Requests sent to chats: `session_prompt.admitted`, `session_prompt.cancelled`, `session_prompt.expired`, `session_prompt.rejected` (`Plans/storage-plan.md:17539`).
- **5.a (1):** `planning.question_budget_exhausted` (`Plans/storage-plan.md:17541`).
- **6.a (1):** `browser.context_share_revoked`, cross-chat case only (`Plans/storage-plan.md:17543`).
- **6.b (2 checkpoint types):** `projector.checkpoint.ds15.browser_context_shared:{scope_key}`, `projector.checkpoint.ds15.browser_context_share_revoked:{scope_key}` (`Plans/storage-plan.md:17545`).
- **7.a–7.e (1 each):** `filesafe.command_denied`, `filesafe.destructive_override_denied`, `filesafe.destructive_override_requested`, `filesafe.guard_init_failed`, `filesafe.path_denied` (`Plans/storage-plan.md:17551-17555`).

Total: 115 event families plus 2 checkpoint types = 117 targets over 12 items. All 117 exact Appendix A names were extracted mechanically from the presented deck and verified present in the new section (`scope-audit.json`).

## Scope and invariance

- **Registry:** all 35 prior policy objects and every non-policy registry value are byte-equivalent after parsing; all 344 family rows are unchanged. Six policy objects added, total 41. No family append, admission record, Decision Log entry, schema change or governance reseal.
- **Owner:** every original G01–G29 assignment row and every Card 1.b–1.g no-project row remains exact. Only the new third-sitting section, the SP-237 unit and the census pin change. No PlanUnit ID is added or removed.
- **Companions:** the readiness policy census and the explicitly allowed onboarding-test policy census move 35 → 41. Family/status/tier pins and validation guards are unchanged.
- **Derived:** only the `storage-plan` and `storage_value_registry` shard namespaces and their manifests change, plus the six complete index outputs. The ignored currentness edition was copied from the shared checkout; all 15 SHA-256 values matched before generation. The ignored agent-packet evidence symlink was provided for the checkers.
- **Wave-3 lanes:** no lane branch touched. Lanes bind their rows to these policies in phase 2.

## Checks and exits

Commands ran in a full worktree. Base outputs were captured on the pristine tree before application; tip outputs after. These are static planning/contract checks, not native runtime proof. The full-tree landing check and aggregate governance reseal are not performed by this implementation worker.

| Check | Base exit | Tip exit | Result |
|---|---:|---:|---|
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | 0 | pass |
| `python3 scripts/pm-plan-index.py generate` | 0 | 1 | 1 blocker: SP-237's 12 unresolved DL-453–DL-464 edges (answers branch unmerged) |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | 0 | pass |
| `python3 scripts/pm-plan-index.py validate` | 0 | 1 | 3 rows: the required unresolved-dependency report and its two blocked build-order consequences; zero retention rows at base and tip |
| `python3 scripts/pm-plans-verify.py validate-new-contracts --subcheck-timeout-seconds 900` | 0 | 0 | pass |
| `python3 scripts/pm-plans-verify.py validate-projects-refresh-contracts --subcheck-timeout-seconds 900` | 0 | 0 | pass |
| `python3 scripts/pm-plans-verify.py validate-browser-event-admission --subcheck-timeout-seconds 900` | 0 | 0 | pass |
| `python3 scripts/pm-plans-verify.py validate-testing-session-event-admission --subcheck-timeout-seconds 900` | 0 | 0 | pass |
| `python3 scripts/pm-plans-verify.py validate-github-project-integration --subcheck-timeout-seconds 900` | 0 | 0 | pass |
| `python3 scripts/pm-plans-verify.py validate-working-notebook-contracts --subcheck-timeout-seconds 900` | 0 | 0 | pass |
| `python3 scripts/pm-plans-verify.py validate-case-l-non-event-materialization --subcheck-timeout-seconds 900` | 0 | 0 | pass |
| `python3 scripts/pm-plans-verify.py validate-implementation-readiness --subcheck-timeout-seconds 900` | 1 | 1 | 59 → 61 rows; only the two build-order/report-status rows are new |
| `python3 scripts/pm-plans-verify.py verify-spec-lock` | 1 | 1 | 25 rows both; only the 3 edited files' stale-hash actuals refresh |
| `python3 scripts/pm-plans-verify.py lint-contractrefs` | 1 | 1 | 1 identical row |
| `python3 scripts/pm-implementation-readiness.py validate` | 1 | 1 | 59 → 61 rows; same two new rows |
| `python3 scripts/pm-implementation-readiness.py self-test` | 0 | 0 | pass |
| `python3 scripts/pm-implementation-readiness.py validate-case-l` | 0 | 0 | pass |
| `python3 -m unittest tests/test_event_authority_holding_bucket.py` | 1 | 1 | 34 run, same 2 failing names at base and tip |
| `python3 -m unittest tests/test_pm_emit_only_event_boundaries.py` | 1 | 1 | 13 run, same 1 failing name |
| `python3 -m unittest tests/test_pm_pnc019_currentness.py` | 1 | 1 | 9 run, same 1 failing name |
| `python3 -m unittest tests/test_pm_coordination_events.py` | 1 | 1 | 50 run, same 14 failing names |
| `python3 -m unittest tests/test_pm_onboarding_phases.py` | 0 | 0 | 50 run, pass; the 41-policy census assertion passes at tip |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` (final) | — | 0 | pass |
| `python3 scripts/pm-plan-index.py generate` (final) | — | 1 | same 1 blocker |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` (final) | — | 0 | pass |
| `python3 scripts/pm-plan-index.py validate` (final) | — | 1 | same 3 rows |
| scope audit | — | 0 | 35 policies preserved, 6 added, 117 names verified |
| `git diff --check` | — | 0 | clean |

No source file changed after the full tip suite; the final regeneration, validation, scope audit and whitespace check ran on the committed state.

## Checker failure analysis

All four failing unittest suites exit 1 with **exactly the same failing test/subtest names at base and tip** (fresh full-tree base run in this worktree, not recorded outputs). The onboarding suite passes 50/50 at both, including the re-pinned 41-policy retention assertion at tip.

Readiness reports **61 rows at tip versus 59 at base**. The only error-count changes are `buildability_report_node_readiness_field_mismatch` 0 → 1 and `node_readiness_build_order_unavailable` 0 → 1, both following the twelve explicit missing answer dependencies. All other error-kind counts are equal; the stale-hash rows for the three edited files refresh their actual hashes without changing kind or count. There are no registry policy-count or storage-value data failures.

Index generation writes all six outputs but exits 1 on the single required blocker: SP-237's twelve `depends_on` edges to DL-453–DL-464, whose entries live on the unmerged parallel answers branch. Index validation's 3 rows are that unresolved-dependency report and its two build-order consequences. No missing decision is fabricated and no dependency is hidden.

Spec Lock exits 1 with the same 25 `stale_hash` rows; only the three edited files' actuals refresh. Contract-reference lint exits 1 on the same single pre-existing row. Neither failure is hidden or repaired outside this worker's scope.

## Open items and integration

1. **Answer stack:** integrate the answers carrying DL-453–DL-464, then regenerate and validate the complete index. Keep the required dependency edges.
2. **Wave-3 phase 2:** lanes bind their rows to these policies on their own branches; nothing here edits them.
3. **Governance currentness:** request the assigned reseal for edited Storage sources and the readiness script after integration. Do not update Spec Lock, evidence, frozen validators or currentness edition in this branch. Full admission/native verification remains outside this implementation step.

## Evidence custody

External bundle: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET3`. The report is copied there as `CA-RET3.md`. `SHA256SUMS` covers the copied report, sources manifest, audit, scope evidence, retained checker outputs and reproducible check helpers. Direct hashes follow.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/CARDS3-APPLY.md` — SHA-256 `2539a87dc104edb4b150829a7451718fff08802057e21448c04e8cc6d6469237`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-3.as-presented-a7d00c73.md` — SHA-256 `a7d00c733539daa94b8a85bd9725d3658a4bbfcd7c1927507db0a4ace626db1f`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET3/scope-audit.json` — SHA-256 `ec987768cb1929cb04af931d708062a7af2df01ee7f23cbe86523cf6901175e0`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET3/currentness-copy.json` — SHA-256 `96364a0f7300e0035a3139a09f19442d8f6858150db575f49c3409afca1c49f2`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET3/families.json` — SHA-256 `6f79c160854c272e5b5e253220474ef550f87e8ffd7bf9e27890bd567704d477`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET3/checks/results.json` — SHA-256 `77fe89c508b7906f26e7957ae649bda2a660fd1f9d354313395bbd433a63c3d8`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET3/checks/base-results.json` — SHA-256 `60a182f50fdce70f4e374cf62934b19ef3e8ec7afa032484d4b912bd8c962f47`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET3/checks/final-results.json` — SHA-256 `2f885544ce013cc4828f8e49e289297abba78d86c684c4622a379f699fb3c20b`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-RET3/checks/SHA256SUMS` — SHA-256 `9d6ec77741bbbc4e908a7bf142c8d8d69aa541351500fca58e0d6c19d92147ab`.
