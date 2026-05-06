{"line_start":2801,"line_end":3000,"invocation":"inv-c2-20260505-W02-i015"}

- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/FinalGUISpec.md`

### Key findings
- Record lifecycle language is still fragmented: `historical`, `stale_historical`, `superseded`, `revoked`, `reopened`, `archived`, and `removed`/`deleted` must not collapse into a generic “old” state; the working recommendation is to separate **time status**, **replacement status**, and **validity status**.
- Cross-object application is uneven: attempts already carry `stale_historical`; promotions, concerns, graph patches, recovery records, and lane/worktree lifecycle need the same vocabulary and explicit rules (successor links, visibility vs validity).
- **Project runs**: multiple Orchestrator runs in one project can be unrelated; “historical run” must mean focus/time only—not predecessor, continuation, supersession, or shared seam/package identity unless **explicit** relationship metadata exists. Default: same project/repo/time order does **not** imply related runs.
- **Concerns**: high-level model (active/acknowledged/resolved/dismissed; canonical creators vs worker nomination) is established in the ledger, but local Plans are still thin on canonical record shape, merge/split/supersession, links to reviews/corroboration/graph patches/recovery, and search/routing. The slice ends by recommending a split between **`concern record`** and **`concern source event/ref`**.

### Highest-risk impacted docs
- `Plans/storage-plan.md` — deletion/archive wording can blur into semantic validity if `removed` vs `revoked` are not kept distinct.
- `Plans/Orchestrator_Page.md` / `Plans/FinalGUISpec.md` — UI must surface semantics explicitly (e.g. “Superseded by Generation 4”, “Promotion Revoked”) rather than inferring from color or disappearance; run history should stay chronological-first, not lineage-first.
- `Plans/Run_Graph_View.md` — old graph paths should stay visible/clickable when superseded; generations must not hide lineage.
- `Plans/Contracts_V0.md` — anchor for runtime/record contracts; needs to stay aligned with shared glossary and explicit successor/predecessor where supersession applies.

### Contradictions / gaps surfaced
- No single shared glossary yet for historical / superseded / revoked / reopened / archived / removed across attempts, promotions, concerns, patches, recovery, and lane/worktree objects.
- Orchestrator/UI docs reference these ideas informally, not as one consistent cross-record system.
- Run-level `historical` is mostly focus/time; object-level `superseded`/`revoked`/`reopened` must not be applied to arbitrary runs without proof of lineage.
- Concern records lack explicit canonical schema and merge/split/supersession semantics relative to attempts and remediation.

### Candidate fixes to carry forward
- Publish a **shared record-semantic vocabulary** and map each object family to time vs replacement vs validity dimensions.
- Add explicit **successor/predecessor** links wherever `superseded` is meaningful; keep **archived** (visibility) separate from **historical** / **revoked** (truth/validity).
- **Run history**: chronological default; add optional explicit run-relationship types (`related`, `derived`, retry/continuation) only when metadata exists—no heuristic lineage in copy like “superseded by newer run”.
- **Exact-record surfaces**: always show *why* a record is non-current, not only muted styling.
- **Concerns**: define canonical concern record vs source ref/event; wire relationships to reviews, corroboration, graph patches, and recovery.

### Do-not-forget details
- `stale_historical` is stronger than plain `historical` (non-resumable / non-live execution state).
- Search, exports, reconciliation, and glossary copy will all depend on this vocabulary—define it once.
- Cross-run search/navigation must preserve run identity and avoid collapsing unrelated runs’ seams/packages/nodes.

## Ledger excerpt alignment (lines 2801–3000)

### Historical vs current record semantics (continued)
- Distinctions documented: e.g. superseded vs revoked; historical vs archived; removed vs revoked; per-family application notes for attempts, promotions, concerns, graph patches, recovery, lane/worktree.
- UI direction: explicit labels for Historical, Superseded-by, Revoked promotion, Reopened, Worktree removed, Archived—especially on Ledger, history, graph generations, seams, lane/worktree cleanup.

### Project-level run relationship clarification
- Unrelated runs in one project are normal; relationship requires explicit metadata.
- UI: history as chronological list; optional explicit phrases (`derived from`, `retry of`, …) only with metadata; search preserves exact run identity.

### Concern record lifecycle (start)
- Targeted docs: `Orchestrator_Page.md`, `storage-plan.md`, `Contracts_V0.md`, `FinalGUISpec.md`, `Run_Graph_View.md`.
- Gaps: schema, merge/split/supersession, cross-artifact relationships, search/routing; recommendation to split concern **record** vs **source event/ref** (continues past line 3000).
