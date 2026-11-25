# Shard 016: Tool Denial / Runtime Taxonomy Alignment Addendum (2026-03-09)

Source: `Plans/Tools.md`

Source lines: L1562-L1576

Source SHA256: `451015240709f6db7e97e3b23696f3f8cb2b86890ae474bc245f302a7de4bffc`

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
