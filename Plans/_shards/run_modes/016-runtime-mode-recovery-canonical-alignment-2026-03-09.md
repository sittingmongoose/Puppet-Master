# Shard 016: Runtime Mode / Recovery Canonical Alignment (2026-03-09)

Source: `Plans/Run_Modes.md`

Source lines: L660-L668

Source SHA256: `5a1167cc903337c1c4dfcff9772374935b540b13f2af8f0e5fafff58fc784e74`

---

## Runtime Mode / Recovery Canonical Alignment (2026-03-09)

Execution mode affects what can be shown immediately, but does not redefine the runtime taxonomy.

Rules:
- headless or non-interactive inability to present a required approval/auth prompt yields `blocked_reason_code = headless_ask_denied`
- a later mode change may satisfy the prerequisite, but it does not rewrite the original blocked classification
- mode change plus prerequisite resolution creates a new attempt snapshot rather than mutating the blocked attempt
- if policy requires restore-before-rerun, mode change alone is insufficient; the safe-point restore requirement still applies
