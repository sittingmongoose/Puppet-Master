# IRB repaired-row draft verification

**Generated:** 2026-08-12T11:22:00Z  
**Scout `IRBDraftVerify` failed (usage limit); completed locally.**  
**Do not append.** Drafts remain `draft_status=PENDING_PRECONDITIONS`.

## Live reopened rows (untouched)

| Line | `closure_id` | status | `finding_key` | maps to |
|---:|---|---|---|---|
| 736 | `reopen-fable-20260706-remaining-registry-pnc019-20260810` | reopened | `sfk-5e3e2e181221c2aeea675f79` | IRB-005 / runtime_lifecycle |
| 737 | `reopen-fable-20260706-pnc019-currentness-20260810` | reopened | `sfk-8d83d4bcc29328c680b11986` | IRB-011 / clean_room_harness |

Registry has **737** lines. Historical `repaired` predecessors remain at 471 (IRB-005 family) and 735 (IRB-011 family).

## Drafts (`IRB_REPAIRED_ROWS_DRAFT.jsonl`)

| Draft `closure_id` | `irb_blocker` | `finding_key` | `supersedes_closure_id` | already in registry |
|---|---|---|---|---|
| `repair-ea-20260812-fable-20260706-remaining-registry-pnc019-20260810` | IRB-005 | `sfk-5e3e…` match | line 736 reopen id | **no** |
| `repair-ea-20260812-fable-20260706-pnc019-currentness-20260810` | IRB-011 | `sfk-8d83…` match | line 737 reopen id | **no** |

Schema notes vs live registry (not `blocker_id` / `semantic_finding_key`): drafts use `irb_blocker`, `finding_key`, `finding_family` — same as live rows. Required plan fields present: `closure_id`, `closure_status=repaired`, `audit_ids`, `closed_by_audit_id`, `closure_evidence`, `reopen_conditions` (same five hash/status conditions).

## Non-claims
- Not appended to `_semantic_closure_registry.jsonl`
- Historical reopened rows not rewritten
- Not written to `readiness_blockers.jsonl` (duplicate `blocker_id` rejected)
- Append remains blocked on EA `pass=true` + PNC-019 harness `pass=true` + owner sheet
