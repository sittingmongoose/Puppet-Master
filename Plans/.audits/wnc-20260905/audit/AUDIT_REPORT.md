# Independent Audit Report — PM-WNC-2026-09-05-v1 (work item `wnc-20260905`)

> **UPDATE (post-repair):** the four findings below were repaired, resealed, and re-audited — see `REAUDIT_1.md` and `repair_closure_audit.jsonl`. Final status after re-audit 1: **PASS_WITH_WARNINGS** (zero outstanding `repair_required=true` findings; three pre-existing out-of-scope gate failures remain documented there; runtime layers NOT_RUN). The BLOCKED verdict below describes the original audited subject and is retained as the audit record.

**Verdict: BLOCKED** — full in-scope coverage was audited and the implementation is substantively faithful, but four narrow unresolved findings carry `repair_required=true`. Under the audit runbook, `PASS_WITH_WARNINGS` requires zero unresolved `repair_required=true` findings, so certification is withheld until the narrow repair scope below is executed. No finding questions the core fidelity of the Plans change.

## 1. Subject identity (verified by content, not by report)

- Packet `PM-WNC-2026-09-05-v1`, work item `wnc-20260905`; packet validator pass (23 files, hashes OK, 85 requirements, 62 scenarios, goal lengths OK).
- Baseline HEAD: `4c88c0f01300cea36135b73eec96991d73969aa2` (main) — identical at audit time; **HEAD does not include the subject**.
- Subject = the **uncommitted working tree**, located by work-item identity (`Plans/.audits/wnc-20260905/implementation/implementation_manifest.json`, `packet_manifest_sha256 e2a503f0…`) and content hashes.
- Manifest hash verification: **43/49 matched; 6 drifted**. Attribution (from mtimes + content): `FinalGUISpec.md`, `Spec_Lock.json` drifted in the implementer's own post-manifest final steps (05:44/05:51); `00-plans-index.md`, `Automated_Testing_System.md`, `Planning_Wizard.md`, `settings_inventory.json` were edited later (12:12–12:21) by an unrelated Guided-Tour owner-reconciliation session that explicitly retains the WNC settings controls and Working-Notebook ownership. Per the runbook the audit evaluates **current live content**; all WNC anchors were re-verified in current files.
- Baseline dirty files (19, unrelated forge-backup/pm7-tools in-flight work) preserved untouched — verified still differing from HEAD.

## 2. Coverage counts

- 418-row `audit_scope_manifest.jsonl`: 85 requirements + 156 acceptance-check details + 62 scenarios + 66 changed/consumer docs + 38 PlanUnit-family rows + 12 artifacts. Every row classified; no sampling.
- Requirement verdicts (live canonical evidence, 7 read-only specialist families F1–F7): **81 pass, 3 partial (WNC-N10, WNC-C08, WNC-S05), 1 fail (WNC-V01), 0 not_found.**
- Scenario fidelity: 62/62 have owner coverage; 8+ scenario classes have materialized static fixtures (positive + 14 negative, validator-verified); the rest are `owner_prose_only` with honest disclosure; **runtime status `not_run` is truthful on all 62 rows** (no overclaim found).
- Changed docs: 46 reviewed at diff level; all additive WNC content except the items in §4. New owner doc follows the New Plan Authoring Profile (20 PlanUnits, `gui_related` on every unit — true only on WN-019; lineage, negative constraints, validation surfaces on all).
- Reciprocal lineage: 76 packet-lineage PlanUnits verified present with substantive canonical text; consumer support verified in both directions (e.g., read-parity stated in both Tools.md and Permissions_System.md; journal/summary boundary in both Working_Notebook.md and agent-rules-context.md).
- `doc_impact_matrix`: 66 rows; no duplicate notebook owner anywhere (grep-verified); Contracts_V0, Commands_System, FinalGUISpec, FileManager, Plan_Document_System, event/wiring/storage/settings registries no-change claims verified with exact live evidence — except the two missing rows in §4.

## 3. Semantic stress checks (runbook §B)

Traced with live evidence: notebook vs memory/ledger/journal/Goal/Plan/To-Do authority (WN-001/011/012, GRS-057, APR-013, TDR-010, PLS-022); exact search-to-read and direct-ID permissions (T-183/PS-140, both directions); mute/revoked derivative propagation incl. already-sent-bytes boundary (PS-140/PP-090); blind Review/BrainStorm isolation across read/search/import/capsule/shared-note routes (CWR-013); read-only fresh windows without mode escalation (PP-088/RM-052); checkpoint reserve inside the existing contingency bucket, no double-count (PP-086/MS-138); seven crash cut points, CAS/idempotency, Stop-epoch fencing, late-result fencing (SIR-036/EP-115/GRS-057); one effective controller + honest opacity (CBP-030/031); usage replay/fork/retry exactly-once, inclusive/exclusive semantics, unknown≠zero (UF-099..101); BSD independence (BSD-025); Debug cleanup currentness (RAP-055/ACD-451); PRD/Wizard mandatory ledger writes (PRDB-012/PWIZ-026); host lease fencing (PSB-006/SRV-014/SIR-037); backup/copy/import identity remapping and no auto-execution (BRS-020/PJCT-006); UI states and fail-closed command candidates (ACD-449..451/UCC-158/UIW-019). No stale competing clauses were found that defeat the new policy; AMS §5.3 residual literal wording is reconciled by an explicit strengthening statement (warning AUD-W01).

## 4. Actionable findings (all `repair_required=true`; details in `findings.jsonl`)

1. **AUD-F01 (WNC-N10/V03, scenario A12, minor)** — WN-015 asserts "Import and injection fixtures preserve the instruction/data boundary" but no such fixture exists in `working_notebook_contract_fixtures.json`. Add the representable fixture or reword the criterion.
2. **AUD-F02 (WNC-C08/V03, scenarios A25–A27, minor)** — SIR-036/C08 acceptance bullet "Crash-before/after-commit and crash-after-activation fixtures" is not materialized (only `neg_committed_checkpoint_without_receipt` approximates mid-write). Add crash-edge fixtures or reclassify those assertions as runtime-only NOT_RUN surfaces.
3. **AUD-F03 (WNC-V01, minor)** — `doc_impact_matrix.json` omits packet candidates `Plans/Skills_System.md` and `Plans/Plugins_System.md` (required review under WNC-I10); IMPLEMENTATION_REPORT claims "all 61". Add both rows with no-change evidence; correct the claim.
4. **AUD-F04 (WNC-S05/A56, minor)** — `Plans/orchestrator-subagent-integration.md` (~line 1929): pre-existing Rust example `reason: format!("Verification failed: {:?}", …),` corrupted into a quoted string literal; unrelated-to-WNC loss inside the audited diff (file was clean at baseline). Restore the original line.

Non-blocking warnings (AUD-W01..W09) include the AMS §5.3 standalone-read conflict (explicit supersession exists), CBP-031 PROVIDER-011 anchor imprecision, UF-099 fixture disclosure, subject-hash drift, and schema nuance (char-vs-byte body cap compensated by validator invariant).

## 5. Static gates (disposable copy; zero validator mutations — before/after tree fingerprints identical)

- Packet validator: **pass** (exit 0).
- `pm-plans-verify.py run-gates`: **exit 1** — classified, not masked: (a) pre-existing evidenced at baseline: `validate_audit_closure`, `validate_implementation_readiness` (PNC-019 stale receipt), `validate_touch_closure`, `lint_*`, `json_syntax` components; (b) **real drift, not WNC-introduced**: `verify_spec_lock`, `validate_plan_graph`, `validate_evidence`, `check_shards`, audit-status-index/buildability components — every stale hash targets exactly the five post-implementation-edited files (later Guided-Tour session + FinalGUISpec post-manifest edit) that were not followed by a re-seal; (c) slim-copy environment artifacts (missing Concepts/tests paths). The WNC subject itself was clean at close (implementer final run 23/26 with only the 3 evidenced pre-existing failures; `validate_pm7_gui_fixtures` baseline failure now passes; zero introduced failures).
- `pm-shard-plans.py --check`: exit 1 — stale sources are exactly those same five drifted files; `working_notebook` shards clean (source hash matches current doc).
- `pm-working-notebook-contracts.py`: **pass** (exit 0; 14/14 negatives rejected; explicit "runtime NOT_RUN" evidence boundary). Unit tests: **7/7 OK**.
- Raw logs: `logs/` in this directory; classifications in `validator_results.json`.

## 6. No-build / forbidden changes

**Clean.** No product/runtime/concept code by this work; no WorkNodes/NodeSeeds/candidates, executable queues/manifests, runtime success receipts, or readiness unlocks (PNC-019 neither unlocked nor claimed; `create_worknodes:false`/`create_nodeseeds:false` on all new units). Storage registry: 4 families `deferred_not_build_blocking`; event families remain unregistered candidates with truthful `candidate_not_registered` dispositions; 3 UI commands are catalog candidates, absent from `Wiring_Matrix.production.json`, fail-closed via exclusions; settings are 4 Project-scoped static inventory registrations; global closure registry untouched; no validator weakening (diffs inspected). Details: `forbidden_changes.json`.

## 7. Pre-existing blockers and NOT_RUN layers

Pre-existing (left closed, out of scope): PNC-019 certification receipt staleness; audit-closure registry hash pinning; touch-closure drift (other in-flight work); legacy chatsearch `k?` bound. Runtime layers NOT_RUN (per packet, not counted against Plans coverage): native handlers/wiring (commands fail closed), tool/command execution, provider interaction and native-context opacity behavior, crash recovery, runtime permission enforcement, security, visual quality, performance/efficiency measurement.

## 8. Exact next safe action

Execute `REPAIR_GOAL.md` (narrow, ≤4 findings, no Plan-semantic rewrites), then re-run `run-gates` + `pm-shard-plans.py --check` in a disposable checkout and — because the later Guided-Tour session's edits stale-dated the governance seal — re-run the serial supported seal scripts before re-audit. Only the four findings above block certification; everything else is warning-grade.
