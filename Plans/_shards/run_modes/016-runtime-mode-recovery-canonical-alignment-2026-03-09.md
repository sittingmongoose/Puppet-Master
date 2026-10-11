# Shard 016: Runtime Mode / Recovery Canonical Alignment (2026-03-09)

Source: `Plans/Run_Modes.md`

Source lines: L661-L669

Source SHA256: `1bc6c0e74fcf72c7b37966b5cf86cb89bc67edab36979c04243235a7197ecd0a`

---

## Runtime Mode / Recovery Canonical Alignment (2026-03-09)

Execution mode affects what can be shown immediately, but does not redefine the runtime taxonomy.

Rules:
- headless or non-interactive inability to present a required approval/auth prompt yields `blocked_reason_code = headless_ask_denied`
- a later mode change may satisfy the prerequisite, but it does not rewrite the original blocked classification
- mode change plus prerequisite resolution creates a new attempt snapshot rather than mutating the blocked attempt
- if policy requires restore-before-rerun, mode change alone is insufficient; the safe-point restore requirement still applies
