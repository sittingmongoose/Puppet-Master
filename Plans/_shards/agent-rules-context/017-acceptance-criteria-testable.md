# Shard 017: Acceptance Criteria (Testable)

Source: `Plans/agent-rules-context.md`

Source lines: L282-L295

Source SHA256: `abc7dcb9b880d42034005d801131e1eb874cebd74eed7af23de2a74cb86375e6`

---

## Acceptance Criteria (Testable)
1) With scoped AGENTS enabled, an attempt run includes top-level + applicable scope chain, and excludes unrelated scopes.
2) With scoped AGENTS disabled, only top-level AGENTS is included.
3) With attempt journal enabled, attempt N+1 includes the most recent attempt_journal from attempt N in the same node lineage, and never includes older journals by default.
4) Parent summary injection can be toggled off; when on it is capped at 10 lines and included in attempt context.
5) Promotion never grows AGENTS.md beyond budget; if budget would be exceeded, promotion requires replacement/condense.
6) The existing Settings resolver preserves admitted injection defaults and restrictions; the GUI keeps basic capacity/cost/model and useful compaction/truncation status. Source identities, inclusion/byte counts and truncation detail remain internal; no source view or per-run inclusion receipt appears.
7) AGENTS.md lint flags wiki-content patterns and budget violations; strict mode can block runs.

---

*Document created for planning only; no code changes.*

---
