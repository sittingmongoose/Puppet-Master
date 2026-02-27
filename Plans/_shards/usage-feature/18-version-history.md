## Version History

| Date | Change |
|------|--------|
| 2026-02-21 | Initial plan: Usage as first-class app/GUI feature; quota visibility, ledger, optional analytics; alignment with AGENTS.md and newfeatures; external references (OpenSync, yume, openclaudecto, OpenCode Monitor). GUI-based usage (not CLI like OpenCode Monitor). |
| 2026-02-21 | Fleshed out: Gaps (5h/7d not in GUI, no live APIs in GUI path, Ledger vs usage_tracker split, quota only from errors, alert threshold, analytics, interview/orchestrator policy); Potential problems (API secrets, rate limits, two tracker types, platform semantics, file size, stale data, multi-project); Enhancements (time-window selector, reset countdown, per-tier usage, export, header compact, Doctor integration, cost column, alerts history). |
| 2026-02-21 | Data sources: added "Data Sources: State Files (JSON/JSONL)" -- usage.jsonl is primary source for Ledger and 5h/7d aggregation; summary.json (STATE_FILES §5.3) and active-subagents.json can enrich. State-file-first approach so we get most Usage info from existing JSON/JSONL without platform APIs. |
| 2026-02-21 | Fleshed out Gaps, Potential Problems, Enhancements: each gap has Current state / Desired / Acceptance; each problem has Risk / Impact / Mitigation; each enhancement has Benefit / Notes / Phase. |
| 2026-02-21 | Per-platform usage data: added section on Cursor API (augment with usage/limits; CURSOR_API_KEY); Codex CLI stream/provider data; Copilot CLI + metrics API; Claude Admin API + stream-json (existing); Gemini (direct-provider: local counters + estimated cost; optional AI Studio link; no CLI usage assumptions). Summary table and implementation order. |
| 2026-02-21 | Clarified Cursor API: usage/account/limits only -- we do not use it for model invocation; model engagement stays OAuth + CLI. AGENTS.md "No API available" refers to model invocation; Cursor has a separate API for augmenting the Usage view. |
| 2026-02-22 | Added "Storage dependency (implementation)": Usage depends on seglog + redb + projectors + analytics scan; embedded implementation checklist from storage-plan.md; clarified state-file-first fallback until stack exists; cross-referenced storage-plan.md and deterministic verifier/evidence contracts in Relationship to Existing Docs. |
| 2026-02-23 | Added widget-composed page layout addendum (sections below): Usage page is fully widget-composed with grid-based resizing, per-widget config, Multi-Account widget as first-class catalog entry, and Dashboard reuse via add-widget flow. |

---

<a id="widget-composition"></a>
