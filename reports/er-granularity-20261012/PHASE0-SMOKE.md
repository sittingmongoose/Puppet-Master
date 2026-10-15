# Phase 0 smoke results (complete, 2026-10-12 21:47Z)

Source: host-fetched pgvector README slice. Trap: type storage limit (16,000 dims)
versus index limits (vector 2,000 / halfvec 4,000 / bit 64,000).
Grading: host mechanical check against gold + verbatim-quote substring check.

| Atom | Verify labels (of 4) | Extract claims | Quotes verbatim | Wall time* | Native Goal tool |
|---|---|---|---|---|---|
| Luna Max (codex_gmail) | 4/4 | 7, all correct; indexing vs storing kept separate | 11/11 across both files | ~2–3 min | yes (reported) |
| GLM-5.3-Flash Max (zcode) | 4/4; V1 WHY explicitly separates index vs storage limits | 9, all correct; most precise conditions (names the HNSW supported-types context; honestly marks sparsevec scope "not stated") | 13/13 across both files | ~2 min verify, ~4 min extract (slowest) | no (reported) |
| DeepSeek V4.1 Flash High (OMP/OpenCode Go) | 4/4 | 10, widest coverage; correctly flags sparsevec 1,000 as non-zero elements, not dimensions | 13/14; one quote trimmed of its Markdown link syntax (content correct — a normalization case, not an error) | ~2 min | no (reported) |

*Wall time from launch window to file timestamp; includes queue/startup. Not billing.

Reading: at atom scale (one bounded question, one small supplied source
slice, one output file), all three flash routes handled extraction and
entailment labeling correctly, including the exact condition-confusion trap that
failed whole-report arms in ER11/ER12. Verdict: all three models are promoted to
Phase 1. This proves nothing yet about discovery,
integration, or cost — those are Phase 1 questions. The only route defect so
far is Goal-tool availability: only the Codex/Luna harness reported a native
Goal tool; zcode and OMP workers reported none and proceeded on the task prompt
itself, which this pilot records rather than repairs.
