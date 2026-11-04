# DM — review round 1 fixes, 2026-11-04

Branch: `plans/ea-w2-small-owners-20261104`. Reviewed head: `247e523f69b1f647cc7b23958ba038d9a71c7397`. Canonical fix commit: `9f276c6e08bef5d0680fe9f7b7f61ac5324408fc`. Worker: DM-FIX1, VM. Base remains `be4766513ff71776346fc73b84f2542990f955af`; no rebase, landing or main push.

**Findings 1–5 fixed. Note 6 confirmed.** Eight candidates now self-grade PASS on the remaining technical criteria, with membership intentionally ABSENT and the six non-context retention cells still PENDING. The two Settings families stay stopped for Jared. Independent re-review is still required. All native execution is NOT_RUN.

## Family grades before and after

Before is the blind DM-sol review, not the overgraded original branch report. Both stopped oracle cells were already ABSENT in that review; this round corrects their original branch PARTIAL self-grade to ABSENT. Twelve cells per family:

| Exact family | Before: independent review | After: fixed self-grade | Outcome |
|---|---|---|---|
| `format.applied` | 7 PASS, 3 PARTIAL, 1 CONFLICT, 1 ABSENT | 10 PASS, 1 PARTIAL, 1 ABSENT | prepared without admission |
| `git.clone.completed` | 7 PASS, 3 PARTIAL, 1 CONFLICT, 1 ABSENT | 10 PASS, 1 PARTIAL, 1 ABSENT | prepared without admission |
| `lsp.server.lifecycle_changed` | 7 PASS, 3 PARTIAL, 1 CONFLICT, 1 ABSENT | 10 PASS, 1 PARTIAL, 1 ABSENT | prepared without admission |
| `model.catalog_refreshed` | 7 PASS, 3 PARTIAL, 1 CONFLICT, 1 ABSENT | 10 PASS, 1 PARTIAL, 1 ABSENT | prepared without admission |
| `project.added` | 7 PASS, 3 PARTIAL, 1 CONFLICT, 1 ABSENT | 10 PASS, 1 PARTIAL, 1 ABSENT | prepared without admission |
| `project.created` | 7 PASS, 3 PARTIAL, 1 CONFLICT, 1 ABSENT | 10 PASS, 1 PARTIAL, 1 ABSENT | prepared without admission |
| `settings.theme.updated` | 6 PARTIAL, 6 ABSENT | 6 PARTIAL, 6 ABSENT | stopped for Jared |
| `settings.updated` | 6 PARTIAL, 6 ABSENT | 6 PARTIAL, 6 ABSENT | stopped for Jared |
| `subagent.context_rehydrated` | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS, 1 ABSENT | prepared without admission |
| `subagent.context_shrunk` | 8 PASS, 2 PARTIAL, 1 CONFLICT, 1 ABSENT | 11 PASS, 1 ABSENT | prepared without admission |

## Exact-family bindings

Each row is an independently authored refinement under DL-045. Existing per-family pre-draft search evidence is preserved in DM-search.json; its review_round_1 field records the reviewed-head gap and reused shared contracts. No new owner IDs or persisted source/value families were introduced.

| Exact family | Owner / Contracts / Storage | Existing profile selected | Exact original time join | Current citations |
|---|---|---|---|---|
| `format.applied` | FS-075, CV-620, SP-600 | `secret_refs_only` | `occurred_at_utc=payload.timestamp` | `Plans/Formatters_System.md:1123` (joins), `:1125` (profile), `:1129` (oracles) |
| `lsp.server.lifecycle_changed` | LSPS-173, CV-621, SP-601 | `no_secrets` | `occurred_at_utc=payload.ts` | `Plans/LSPSupport.md:7262` (joins), `:7264` (profile), `:7268` (oracles) |
| `model.catalog_refreshed` | MS-199, CV-622, SP-602 | `secret_refs_only` | `occurred_at_utc=payload.completed_at_utc` | `Plans/Models_System.md:9921` (joins), `:9923` (profile), `:9927` (oracles) |
| `subagent.context_rehydrated` | PP-151, CV-623, SP-603 | `secret_refs_only` | `occurred_at_utc=payload.occurred_at_utc` | `Plans/Prompt_Pipeline.md:6056` (joins), `:6058` (profile), `:6062` (oracles) |
| `subagent.context_shrunk` | PP-152, CV-624, SP-604 | `secret_refs_only` | `occurred_at_utc=payload.occurred_at_utc` | `Plans/Prompt_Pipeline.md:6106` (joins), `:6108` (profile), `:6112` (oracles) |
| `project.added` | PJCT-072, CV-625, SP-605 | `secret_refs_only` | `occurred_at_utc=payload.completed_at_utc` | `Plans/Project_System.md:998` (joins), `:1000` (profile), `:1004` (oracles) |
| `project.created` | PJCT-073, CV-626, SP-606 | `secret_refs_only` | `occurred_at_utc=payload.completed_at_utc` | `Plans/Project_System.md:1048` (joins), `:1050` (profile), `:1054` (oracles) |
| `git.clone.completed` | SCS-085, CV-627, SP-607 | `secret_refs_only` | `occurred_at_utc=payload.completed_at_utc` | `Plans/Source_Control_System.md:2156` (joins), `:2158` (profile), `:2162` (oracles) |

The seven `secret_refs_only` selections keep the family's specified bodies and sensitive details behind authorized refs; LSP uses `no_secrets` because its bounded inline identities/states/sanitized reason contain no secret or raw log body. These values come from the closed EventRecord enum (`Plans/event_record.schema.json:123–129`, `Plans/Contracts_V0.md:1020`), with a separate rationale in each family and all three owner copies. No enum or payload-schema widening was needed.

Every original actor/correlation/operation/scope/subject join is now explicit. Full frozen payloads and all present-null lineage/account/causal joins are compared to that family's original owner facts. A retrying Client, ambient Project, current time or valid sibling payload cannot replace those facts. EventRecord owns the envelope shape. SP-286/CV-339 full-value, SP-336/SP-347 group issuance and SP-278 index/checkpoint contracts are reused by name.

Each exact payload schema remains `Plans/event_payloads/<exact_name_with_underscores>.schema.json`, revision 1.0.0; the envelope remains 2.0.0. Original reader identities remain independently bound in the same units: `reader.evidence.format_applied@1.0.0`, `reader.lsp.lifecycle@1.0.0`, `reader.models.catalog_refresh@1.0.0`, `reader.context.rehydrated@1.0.0`, `reader.context.shrunk@1.0.0`, `reader.project.added@1.0.0`, `reader.project.created@1.0.0`, `reader.scm.git_clone_completed@1.0.0`. They have no own persisted progress and reuse the existing global SP-278 checkpoint, schema and atomic CAS. No storage_value_registry row is needed or changed.

## Review round 1: findings and responses

1. **Blocking 1 — fixed (`9f276c6e08`).** Replaced invalid `redacted_refs_only` with each row's justified existing profile in all three owners. The full EventRecord suite tests required-present fields, the invalid enum, every other valid-but-wrong profile and the original binding. Verify `python3 scripts/pm-small-owner-events.py`; source locations are in the bindings table and self-grade evidence.
2. **Blocking 2 — fixed (`9f276c6e08`).** The exact-family join paragraphs bind original actor_ref, non-empty original correlation_id, operation/subject/scope joins and each different payload timestamp. Only schema-nullable joins can be null. Every envelope join and every payload member has an original-source mismatch negative. Verify the same full checker; scope_identity evidence cites the current owner line for each row.
3. **Blocking 3 — fixed (`9f276c6e08`).** ATS-300–304 and the three separate ATS-304 supplements now adopt each exact family's full fixture matrix. Plans/small_owner_event_fixtures.json carries independent original operation/result/EventRecord/receipt/result/complete-value examples and admission/withdrawal/read/rebuild cuts; scripts/pm-small-owner-events.py executes them. The complete-value encoder matches the pre-existing canonical golden bytes/hash, so a producer-only digest cannot substitute for full stored value. Native execution remains NOT_RUN; the static criterion is now PASS.
4. **Should-fix 4 — fixed (`9f276c6e08`).** Removed child/revision clauses from formatter, LSP and Models contracts, and LSP state/supervisor clauses from formatter, Models and context contracts, including all Contracts/Storage copies. Removed unrelated file_path and runtime-retention sentences from families without those fields/roles. Retained each context revision/child rule and LSP's own supervisor rule. Verify the individual owner units in the table; no sibling contract grants another family's binding.
5. **Should-fix 5 — fixed (report/self-grade follow-up to `9f276c6e08`).** Both stopped Settings positive_negative_oracles grades are ABSENT, with static_checks_seen=[]; no new Settings event cases, alias, retirement or admission were authored. Verify DM-self-grade.json by exact family/criterion.
6. **Note 6 — confirmed (`9f276c6e08`, no reconciliation change).** Current Project_System section 2 still makes clone a separate owner operation before add_existing and requires reviewed admission plus atomic listed/readback completion. PJCT-072/073 preserve registration versus creation; SCS-085 still uses the ordinary Git command and original terminal receipt, with Jujutsu separate. No Project/Git row is sent back for an owner decision.

## Questions for Jared — stopped, recommendations only

| Exact family / review form | Exact question for the card | Recommendation beside the question |
|---|---|---|
| **`settings.theme.updated`: GENUINE exact-family disposition choice** | Should current emission of the old exact `settings.theme.updated` family be explicitly retired, keeping its historical bytes readable and committed atomic theme-pair changes on `settings.layer.changed`, or must it remain a distinct current event obligation? The current startup/onboarding preview prohibition stays in force. | **Explicitly retire current emission of the old exact family**, preserve historical bytes, and use the current layer family for committed theme-pair changes. Startup/read-only previews remain event-silent. Reconcile the retained table and record any application/exclusion only after Jared answers. No payload-compatible alias is inferred and DL-300 did not already retire it. |
| **`settings.updated`: GENUINE successor/overlap choice; key/writer mapping is a separate technical hold** | Should `settings.layer.changed` become the single future generic Settings-change history through a new narrow ruling superseding DL-041's future `settings.updated` spelling and the retained memory auto-save expectation, or do the two exact families remain independently required? Preserve `app.agent_rules.dry_method_default_guard` and its transaction identity. | **Use the current layer family as the single future generic Settings-change history, only by an explicit new Jared ruling.** Preserve the exact guard setting identity and historical bytes. Separately prove the valid setting-ID/writer mapping or keep the guard disabled. Never equate it to `memory.assembly.dry-method-guard`. Until a new answer, DL-041 stays in force and neither alias nor exclusion is authorized. |

Premises rechecked at this head: `UI_Command_Catalog.md:8555–8558` retains the old theme effects; UCC-108 at `8642–8649,8683–8686` routes current look controls through the Settings pair and forbids startup/preview effects. SSYS-010 at `Settings_System.md:585–604` uses the current writer; SSYS-060 at `1693–1697` and DL-300 admit only the current application-only layer family. DL-041 at `Decision_Log.md:439–445` still chooses `settings.updated`; `Settings_System.md:2312` repeats it and keeps the guard disabled pending real mapping. `storage-plan.md:28944` preserves owner_contract_missing with no inferred alias; `UI_Command_Catalog.md:1118` still expects the old auto-save event. These are genuine disposition choices, not a reason to ask Jared for technical consumer/checkpoint IDs. **No recommendation is applied.**

## Verification and limitations

- **PASS:** targeted full checker, 3,411 assertions; shard generate/check; index generate/validate (parsed top-level status); whitespace check; all self-grade quotes; changed-path boundary check. Commands, exit codes, raw output paths and SHA-256 are in DM-checks.json.
- **Admission/crash matrix:** missing membership/schema/retention/permission/dedupe/source/original intent/result/owner acceptance/body/current lease/restore controls refuse. A missing or unsynced group yields no issued receipt. A durable commit with lost receipt delivery or lagging custody rows preserves original issuance. The original acceptance epoch/session/restore occurrence cannot be relabeled after withdrawal.
- **Immutable replay/withdrawal/rebuild matrix:** original eleven-field receipt and four-field result; every producer-semantic and stored-value mutation; v1 full-value refusal; coherent covered-original restore versus unavailable protected authority; current permission/deletion/hold/source/version/token refusals; all live token/source-selection fields; nine-field durable token; complete publication versus failed CAS/currentness/source/coverage. Fresh re-enable uses a genuinely different accepted operation, while old intent stays fenced. Global indexing remains available for other families.
- **NOT_RUN:** actual native owner acceptance, filesystem sync/crash recovery, protected restore authority, concurrent CAS and action spies. Synthetic source/control observations authorize nothing. No raw source capture, new operation journal, persisted checkpoint family, writer installation or native success is claimed.
- **Retention:** six rows retain PENDING_RETENTION_DECISION for RT, with the original Case L-3 candidate citations. Both child-context rows retain the existing Runtime/run/child-attempt 365-day class; generic checkpoint/index policies remain source-coupled/three-generation.

## Scope, IDs and cleanup

This round amends the already allocated FS-075, LSPS-173, MS-199, PP-151/152, PJCT-072/073, SCS-085, CV-620..627, SP-600..607 and ATS-300..304. **New IDs used: none.** CV-628/629 and SP-608/609 remain unused. Shared-file hunks are confined to those Contracts/Storage/ATS units and the three independent ATS supplements. Derived files were regenerated by repository scripts; shard changes are only for configured edited documents. No registry append, admission, Decision Log edit, exclusion, governance reseal, frozen-validator change, tests edit, subagent or main push.

Entry checks: 19 GiB available RAM, 113 GiB free root disk (above 6/50 GiB hard stops); sparse local clone worktree. Prescribed ID/currentness memory files were present on this VM and read in full. All 15 currentness-copy digests match. A single initial inbox read preceded discovery of the task's no-pm-mail rule; no mailbox registration or messages were sent and no further pm-mail was used. Worktree is removed after the final report push per FIX-ROUND.md.

Evidence and overwritten report/self-grade copies: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/`; round-specific raw check outputs and digest manifests: its `fix1/` directory. No browser/server was started. Scratch edit helpers are removed; cited verification evidence is retained.
