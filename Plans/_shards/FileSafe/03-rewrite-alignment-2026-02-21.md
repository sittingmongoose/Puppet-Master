## Rewrite alignment (2026-02-21)

This plan remains authoritative for safety policy and context-compilation behavior. As the rewrite lands (see `Plans/rewrite-tie-in-memo.md` ("The core reliability plan" + "Storage consistency")), FileSafe should be implemented primarily through:

- The **central tool registry + policy engine** (permissions/validation/normalized tool results)
- The **patch/apply/verify/rollback pipeline** (often worktrees/sandboxes) rather than ad-hoc guardrails scattered in UI code
- Emitting guard decisions, violations, and remediation into the **unified event stream** (seglog ledger) for replayability
- **Analytics:** Guard blocks and violations in seglog can be consumed by the **analytics scan** (`Plans/storage-plan.md` §2.5 "Analytics scan jobs"): e.g. tool-block rate, error rate by guard type or pattern, and latency of blocked vs allowed commands. Rollups stored in redb support dashboard widgets (e.g. 'FileSafe blocks this week' or 'top blocked patterns'). Ensure FileSafe event payloads include enough structure (guard type, pattern id, timestamp) for analytics scan jobs to aggregate.

Any UI/storage examples in this plan are illustrative; the guard behavior and contracts are the stable requirements.

**ELI5/Expert copy alignment:** FileSafe-authored tooltip/help copy (including `help_tooltip` keys referenced by this plan) must define both Expert and ELI5 variants and follow `Plans/FinalGUISpec.md` §7.4.0. App-level **Interaction Mode (Expert/ELI5)** selects the shown variant; chat-level **Chat ELI5** does not override FileSafe tooltip copy.

