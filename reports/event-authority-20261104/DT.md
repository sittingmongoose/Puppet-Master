# DT-FIX1 — Event Authority review round 1

Branch: `plans/ea-w2-tools-gates-approvals-20261104`. Reviewed head: `f4dcd88acc501f57c340c0475a31e126f0740df1`. Assessed implementation head: `63759b5b631505d09e0349cfdd0d409892a8e4a3`. The following publication changes reports only. Worktree `/home/sittingmongoose/pm-worktrees/DT-fix1` is removed after the push.

**16/18 families pass as prepared**, with membership ABSENT throughout. `tool.denied` retains producer/transition CONFLICT for the FileSafe emission facet; its specified policy/user path is prepared. `tool.custom_headless.skipped` remains stopped. Usage retains a technical setting-driven retention adapter dependency, and requirements/worktree retention retain only the three narrow product residuals below. No recommendation is adopted. Native execution remains NOT_RUN; original-owner and SP-278 authentication remain assumed adapters in these static models.

## Review round 1: findings and responses

- **F1 — stopped for Jared; permitted path fixed (`b20c80659d413cfe9344fdc5365beddf693b72e8`).** Where: `Plans/Contracts_V0.md:24863`, SP-590, ATS-295, route-map `tool.denied.transition` and `stopped_facets`. Cause: the draft silently selected FileSafe emission despite competing owners. Fix: independently prepare only specified policy/user refusal, with positive policy/user/headless cases and explicit non-emission for allow/schema/already-dispatched boundaries. FileSafe is `owner_conflict_stopped` with no append from the unresolved facet; that fence is not an answer about eventual product emission. Exact owner question: **Should FileSafe blocks emit tool.denied, reconciling Tools.md:1496 (do not emit tool.denied for FileSafe blocks) with FileSafe.md:2839-2846 (Align tool.denied emission with filesafe_blocked)?** Producer and transitions stay CONFLICT. Verify the full DT checker and `tool.denied.non_emission_cases`/`source_join_negatives`.
- **F2 — fixed (`b20c80659d413cfe9344fdc5365beddf693b72e8`).** Where: `Plans/Contracts_V0.md:24863`, `$defs/tool_denied`, both source editions and both registry mirrors. Cause: mapping fields and original blocked episode were not preserved. Fix: closed top-level canonical blocked reason, failure class, ordered actions, headless flag, effective permission snapshot and executed-at-all flag join immutable original before together with blocked_sequence/approval_scope_key. This specified pre-dispatch population has no classified attempt outcome, so failure_class is typed null and executed_at_all is false; no transient failure is invented. Full mapped policy/user/headless positives pass. Transplanted episodes, changed/reordered/expanded actions, permission snapshot, headless flag and non-applicable transient class refuse through the full checker.
- **F3 — fixed independently for all three gates (`b20c80659d413cfe9344fdc5365beddf693b72e8`).** Where: `Plans/Contracts_V0.md:24672`, CV-606/607, SP-585/586/587 and ATS-293. Cause: bare scores had no original dispatch context. Fix: reuse Executor's exact five-field tuple; source before freezes the original dispatch ref/tuple and threshold, and the authentic completed outcome supplies the numeric score. Each scalar exposure requires tuple/ref and matching node. Ref/tuple/result/threshold joins are checked separately. Positive scored cases and missing/wrong-context/bare-score regressions pass through the full checker. Gate scoring and ranking policies are unchanged.
- **F4 — fixed (`b20c80659d413cfe9344fdc5365beddf693b72e8`).** Where: `Plans/Contracts_V0.md:25021`, both Usage source definitions and registry mirrors. Cause: optional identity absence could not survive the required closed before record. Fix: required nullable account_id/billing_entity_id/provider_account_ref source slots prove absence; payload omits absent identities and real identities join exactly. Project/app absent-account and unknown/no-provider-evidence/local/CLI cases pass, while fabricated and changed account identities refuse. Existing cost/quota/lineage/accounting coverage remains.
- **F5 — fixed (`b20c80659d413cfe9344fdc5365beddf693b72e8`).** Where: `Plans/Contracts_V0.md:24979`, SP-593, ATS-296 and all embedded payload/source schema copies. Cause: closed web meta omitted canonical map/source/body variants and did not exercise batch lineage. Fix: preserve edges_count, sources_ref/map_ref/content_ref and current operation-specific counters/refs, source IDs, enums and required context. Original normalized structured operation_input resolves by ref; previews cannot replace it. before.web_request joins frozen request and parent/URL identity; owner_result.meta joins actual redacted result metadata. Complete map/read/extract/research and one-parent/two-URL-child positives pass. Wrong operation/tier, missing context/provider attempt, changed outcome/URL/parent, missing or duplicate child and incorrect aggregate regressions refuse. No new event family or inline full body is introduced.
- **F6 — fixed as an adjudication/binding repair (`b20c80659d413cfe9344fdc5365beddf693b72e8`); residuals remain explicit.** Where: `Plans/storage-plan.md:29645`, SP-588/590/593/594/595/596, CV-614, route map and source registry rows. Cause: blanket retention paragraphs mislabeled technical omissions as new policy choices. Fix: bind existing operational/runtime assignments and SP-349 app counterparts; bind Usage's decided setting and permanent totals, with its remaining structured adapter explicitly technical and deletion/admission fenced. Replace the copied class menu with the review's exact per-family residuals. No duration or deletion recommendation is selected. Verify `retention_binding`, `retention_binding_oracle`, retention vectors and the source registry mirrors.

## Per-family grades before and after

Before uses the independent review's six-family re-grade; unsampled rows use its carried dispositions and prior exact cells. Counts are PASS cells out of twelve, not admission or native execution grades.

| Family | Before | After | Remaining non-PASS cells |
|---|---:|---:|---|
| `approval.requested` | 11 | 11 | membership_version ABSENT |
| `approval.granted` | 11 | 11 | membership_version ABSENT |
| `approval.denied` | 11 | 11 | membership_version ABSENT |
| `approval.timeout` | 11 | 11 | membership_version ABSENT |
| `config.migrated` | 10 | 11 | membership_version ABSENT |
| `gate.evaluation_started` | 9 | 11 | membership_version ABSENT |
| `gate.failed` | 9 | 11 | membership_version ABSENT |
| `gate.passed` | 9 | 11 | membership_version ABSENT |
| `requirements.clarification_requested` | 10 | 10 | membership_version ABSENT, retention PARTIAL |
| `run.background_enqueued` | 11 | 11 | membership_version ABSENT |
| `tool.denied` | 5 | 9 | membership_version ABSENT, producer CONFLICT, transitions CONFLICT |
| `tool.execution_completed` | 11 | 11 | membership_version ABSENT |
| `tool.execution_started` | 11 | 11 | membership_version ABSENT |
| `tool.invoked` | 8 | 11 | membership_version ABSENT |
| `usage.event` | 8 | 10 | membership_version ABSENT, retention PARTIAL |
| `worktree.created` | 10 | 10 | membership_version ABSENT, retention PARTIAL |
| `worktree.deleted` | 10 | 10 | membership_version ABSENT, retention PARTIAL |
| `tool.custom_headless.skipped` | 1 | 1 | membership_version ABSENT, producer PARTIAL, closed_payload_schema ABSENT, scope_identity ABSENT, replay_idempotency PARTIAL, retention ABSENT, redaction_custody ABSENT, transitions PARTIAL, consumers_checkpoints ABSENT, compatibility_withdrawal ABSENT, positive_negative_oracles ABSENT |

After counts: {'ABSENT': 25, 'PASS': 182, 'PARTIAL': 7, 'CONFLICT': 2}. All 216 current quote/line references are mechanically revalidated. Every drafted family has its own writer/retry negative for `projector_replay_only`, preserves encoded `project~` positives and CV-366 application key formatting, and refuses inline bodies over SP-337's 16 KiB boundary while retaining verified/refused payload-reference cases. The stopped Doctor family receives no invented writer/oracle.

## Retention adjudication — exact populations

| Family | Existing binding / remaining work |
|---|---|
| `config.migrated` | RP-OPERATIONAL-2555D: 2,555 days / 2,000,000 per Project, original terminal migration anchor. SP-349 already supplies the one Server-wide app counterpart bucket with identical limits/TTL/holds. Event and both source rows bind it. No app-counting question remains. |
| `tool.denied` | RP-RUNTIME-365D for the drafted runtime-attributed actual-run/attempt policy/user-denial path, with existing holds and SP-349 app counterpart. FileSafe emission still requires the F1 owner answer. No independently permitted non-authority diagnostic population is invented. |
| `tool.invoked` | RP-RUNTIME-365D for actual runtime-attributed invocation history, original run completion and existing holds; SP-349 app counterpart. No copied class menu remains. |
| `usage.event` | SP-341/UF-108: ai.usage.usage-retention detail window (90-day default) in seglog and Parquet; permanent canonical daily account/provider/model totals committed before detail retirement and backed up. Structured `retention_binding` pins those decided terms. `PENDING_RETENTION_BINDING` is only the RT setting-driven policy-object/expiry-anchor adapter dependency; unknown binding remains materially incomplete and permits no deletion/admission. |
| `requirements.clarification_requested` | Review residual: “Ask which class and expiry anchor govern this report request where a run-completion anchor is inapplicable; do not assume that a ref-only report request is chat content. Runtime-linked cases should reuse existing runtime minima.” Exact question: **Which class and expiry anchor govern this report request where a run-completion anchor is inapplicable?** GATE-012 is pre-execution and has no required run. |
| `worktree.created` | Review residual: “Resolve the runless event's class/anchor and required lineage dependencies; the projection policy does not automatically register this event's retention.” Exact question: **What are the runless event's class/anchor and required lineage dependencies?** Runtime allocation history retains existing runtime minima; Project/thread operations outside an executor are distinct. |
| `worktree.deleted` | Review residual: “Neither name alone decides whether this exact event is that authority. Ask only that event/authority distinction and applicable anchor.” Exact question: **Is this exact event deletion-tombstone authority, or runless lifecycle history, and what is its applicable anchor?** Runtime history is distinct from runless lifecycle and `worktree_lane_thread_families`; RP-WORKTREE-TOMBSTONE-365D already protects that projection's tombstones while historical links exist. |

All pending facets preserve source/receipt/reference closure and existing holds. Retention bindings grant no family admission.

## Doctor question and unadopted recommendation

**Exact question:** Is skipped eligible only on a Project's first-ever Doctor invocation, or on the first invocation that observes `tools.custom_headless` absent? If the first invocation has the key, may a later absence emit? What resets eligibility across a configuration revision, key removal/re-addition, Project import/clone or older restore?

**Recommendation to Jared, requiring a new decision:** emit on the **first invocation that observes absence for the actual stable Project identity**. A present-key first invocation leaves eligibility unused. After one issued skipped event, ordinary configuration revisions and key removal/re-addition do not reset it; later Doctor checks still record their actual outcome through `doctor.custom_headless.checked`. A clone/import is eligible only if the Project owner actually creates a new Project identity. Same-identity restore preserves original issuance/eligibility coherently; missing post-backup issuance evidence fences a repeat rather than guessing that no event occurred. This is proposed behavior, explicitly **not inferred from canon**.

**Disposition:** STOPPED. The question and recommendation above are copied from the review. Neither is a recorded Jared decision. This branch changes no first-run/eligibility/reset behavior and creates no duplicate DT Doctor contract.

## Searches, premise checks and newly authored bindings

`DT-binding-search.json` preserves first/pass-2 lineage and adds a separate round-1 search for each affected family. Scope: current live top-level owner documents before the DT units, existing schemas and current cited owner passages; generated/lineage/DT companion bindings are excluded as recovered authority. Each search records exact terms, current matches and negative evidence for the missing exact-family source join. The gates each get their own original dispatch-context binding; tool.denied gets its original runtime mapping/blocked-episode join; tool.invoked gets web request/result and batch parent/URL-child bindings; Usage gets nullable optional identity custody. These are newly authored technical bindings under DL-045 for already specified behavior, not recovered definitions or sibling inference.

Sixteen cited canonical source spans match current origin/main, including Tools/FileSafe, Executor scoring, Contracts runtime mapping, Case L-3/SP-349, UF-085/UF-108, GATE-012 and runless worktree operations. The earlier blanket retention premise and FileSafe-emission premise failed and were removed. Approval identity remains distinct from app chat approvals under current CV-355/CV-366, PS-145 and DL-300. No older answer is extended, no recommendation is adopted, and no other owner decision is taken. RT coordination is a report dependency only; no pm-mail or subagent was used.

## Validation and scope

| Check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm-dt-event-contracts.py` | 0 | 3,231 assertions / 17 drafted families PASS; original-owner/SP-278 authentication assumed; native NOT_RUN |
| DT schema + Storage registry schema + 24 exact source-schema mirrors | 0 | PASS |
| `python3 scripts/pm-storage-recovery-contracts.py --self-test` | 0 | 22 checks PASS |
| `python3 scripts/pm-storage-profile-check.py` | 1 | Same 41 errors as review baseline; zero new errors |
| Currentness copy SHA-256 | 0 | All 15 files match the required shared edition |
| Shard generation/check | 0 | Only automated_testing_system, contracts_v0, storage-plan, storage_value_registry groups change |
| Plan index generation/validation | 0 | Top-level PASS |
| DT PlanUnit YAML and self-grade evidence | 0 | 43 blocks parse; all 216 cell quotes/lines match |
| Cited canonical source-span premise comparison | 0 | All 16 spans match current origin/main |
| `git diff --check` | 0 | PASS |

The first index generation caught indentation in nine appended ATS canonical-text blocks (exit 1). Those blocks were corrected, all 43 DT blocks parsed, and generation/validation reran successfully. The initial and corrected logs are retained in `fix1/`; no check was weakened. No aggregate governance or native execution pass is claimed. The first staging list omitted 38 newly generated Storage shards; they are committed in 63759b5b631505d09e0349cfdd0d409892a8e4a3. A final committed-tree audit verifies all 3,463 manifest/index/shard blobs and their SHA-256 values, with no missing, changed or untracked paths.

Shared-file hunks remain entirely in CV-600..616, SP-580..596, ATS-290..298 and the existing DT source registry rows. Existing non-DT registry rows/policy objects and all profile objects are unchanged. Derived shards/indexes are regenerated, never hand-merged. No PlanUnit IDs were minted: **SP-580..596, CV-600..616, ATS-290..298 remain the IDs used**; unused tails remain unused.

No main push, landing lock, reseal, admission, registry append, Decision Log entry, protected governance/frozen-validator edit, .gitignore change or test-file edit. Branch push and literal-path worktree removal follow FIX-ROUND.md. Full report/self-grade copies and cited check outputs are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DT/`; round-1 logs/premise/currentness records are in its `fix1/` directory. `DT-evidence-sha256.json` records each retained check's exact path and SHA-256.
