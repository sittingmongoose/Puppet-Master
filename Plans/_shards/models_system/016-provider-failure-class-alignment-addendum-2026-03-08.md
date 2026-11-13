# Shard 016: Provider Failure-Class Alignment Addendum (2026-03-08)

Source: `Plans/Models_System.md`

Source lines: L1248-L1255

Source SHA256: `a8901a6843745dc49f40c03da85f00aa1306700643610fcdce92d9611afeef13`

---

## Provider Failure-Class Alignment Addendum (2026-03-08)

Model/provider selection fallback remains separate from runtime retry classification.

Required clarifications:
- retired Persona model fields are inert compatibility reads and never choose or block a model
- provider execution failures that occur after selection must map into the shared runtime taxonomy, most notably `provider_transient` or terminal provider failure classes
- provider-level retry defaults must not silently override the shared runtime retry/backoff matrix
