# Shard 016: Runtime Mode / Recovery Canonical Alignment (2026-03-09)

Source: `Plans/Run_Modes.md`

Source lines: L662-L670

Source SHA256: `a059cd1cf6878906b27e08f12dd901592f72a00ef3b8cbcd2e71d710be6f217a`

---

## Runtime Mode / Recovery Canonical Alignment (2026-03-09)

Execution mode affects what can be shown immediately, but does not redefine the runtime taxonomy.

Rules:
- headless or non-interactive inability to present a required approval/auth prompt yields `blocked_reason_code = headless_ask_denied`
- a later mode change may satisfy the prerequisite, but it does not rewrite the original blocked classification
- mode change plus prerequisite resolution creates a new attempt snapshot rather than mutating the blocked attempt
- if policy requires restore-before-rerun, mode change alone is insufficient; the safe-point restore requirement still applies
