# Shard 017: Acceptance Criteria (Testable)

Source: `Plans/agent-rules-context.md`

Source lines: L281-L294

Source SHA256: `4c85ec54db656bd379cd8af6870d0fd2ac16853b2ff88199cd14e528a78635db`

---

## Acceptance Criteria (Testable)
1) With scoped AGENTS enabled, an attempt run includes top-level + applicable scope chain, and excludes unrelated scopes.
2) With scoped AGENTS disabled, only top-level AGENTS is included.
3) With attempt journal enabled, attempt N+1 includes the most recent attempt_journal from attempt N in the same node lineage, and never includes older journals by default.
4) Parent summary injection can be toggled off; when on it is capped at 10 lines and included in attempt context.
5) Promotion never grows AGENTS.md beyond budget; if budget would be exceeded, promotion requires replacement/condense.
6) GUI exposes the three toggles with correct defaults and displays injected context breakdown including truncation.
7) AGENTS.md lint flags wiki-content patterns and budget violations; strict mode can block runs.

---

*Document created for planning only; no code changes.*

---
