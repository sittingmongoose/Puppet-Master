# Shard 016: Tool Denial / Runtime Taxonomy Alignment Addendum (2026-03-09)

Source: `Plans/Tools.md`

Source lines: L1569-L1583

Source SHA256: `dc754309b0e950bdc6cfd48c36ca68e77c262d18441d22ebf13af8c260ae955e`

---

## Tool Denial / Runtime Taxonomy Alignment Addendum (2026-03-09)

Tool-layer refusals that affect execution must collapse into the canonical runtime taxonomy before they reach UI or scheduling layers.

### `tool.denied` requirements
When a denial blocks progress, the tool event MUST include or map to:
- `blocked_reason_code`
- `failure_class` when applicable
- effective permission snapshot identifier
- `allowed_action_ids[]`
- `headless_denied` flag when the denial was caused by mode limitations
- side-effect metadata when the denial concerns remote mutation

### No silent fallback rule
Tools MUST NOT return success-shaped fallbacks for denied work. The denial must remain inspectable as a blocked outcome so the scheduler, chat, and GUI can offer the correct recovery path.
