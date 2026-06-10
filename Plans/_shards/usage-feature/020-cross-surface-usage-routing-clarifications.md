# Shard 020: Cross-Surface Usage Routing Clarifications

Source: `Plans/usage-feature.md`

Source lines: L901-L918

Source SHA256: `0aa9f55786575dbd9e7fbc5e155e14e603ca5a56959c5fbdae4f8801628b259d`

---

## Cross-Surface Usage Routing Clarifications

- `manual_preferred_account_id` is a run-request field, not a project policy default. Usage must keep policy defaults separate from the per-run requested concrete account so the two meanings do not collapse.
- Account pressure and switching use an append-only event `/record` family. Usage, Ledger, History, and routing projections read account-pressure and account-switch records instead of inferring them from mutable view state.
- Gate-side usage contract changes must land with verifiable `/schema` evidence before prose expands; matrix/schema drift and gate-side drift are the same contract-risk pattern when prose runs ahead of enforceable fields.
- JSON export labels distinguish exact record payload, filtered table dump, and convenience summary. A JSON export that lacks the record envelope is a view export even when the file extension is the same.
- Runtime artifacts and receipts preserve canonical usage identity plus run `/thread/attempt/worktree` linkage; Usage must not invent feature-local routing semantics when a receipt or runtime artifact already carries the shared subject.
- Historical-only projects do not become degraded solely because they have completed unrelated historical runs. `no-active-run` is an absence of current execution, not a problem state by itself.
- A2A duplicate attempt-continuity addenda and the tier-boundary schema signal a version-governed consolidation requirement; Usage waits for that consolidated contract instead of scattering more annotations.
- `inspector_target = history` is used for chronological or `/detail-history` focus inside an already-selected object; Usage, details, evidence, and history targets change focus, not the selected subject identity.
- Quiet-window behavior applies to advisory pressure or `/threshold` warnings only. Blocked states and canonical `action-needed` episodes must not quietly disappear behind the same suppression rule.
- Usage exports include filtered ledger CSV, filtered concern `/table` CSV, and analytics chart/table export as view exports unless they carry the exact record envelope required for canonical record export.
- Source Control usage views stay compact around current `/live` worktree rows with `/toggles` for retained, cleanup-eligible, and archived `/removed` history instead of dumping all backing history into the narrow surface.
- The `effective-resolution` record carries blocked and `/degraded` reason fields plus confidence and `/source` hooks so Usage can display why resolution changed without owning provider or runtime truth.
- Usage history preserves graph generation history, safe-point and recovery history, promotion `/revocation` audit, and cleanup `/archive/remove` traceability as distinct history dimensions rather than flattening them into one cleanup note.
- Project run history remains chronological-first. If cross-run derivation or `/continuation` concepts are added later, they require explicit run-relationship metadata instead of reordering history around inferred relationships.
- Account switching and quota pressure share an append-only account-switch / pressure-episode family with shared projection consumers, so Usage, Ledger, History, and account-pressure views read one durable record family.
- OpenCode bridge limits, DAE enforcement, promoted-feature shell ownership, and runtime identity provenance remain explicit architectural edges before Usage presents those events as fully resolved provider/account facts.
