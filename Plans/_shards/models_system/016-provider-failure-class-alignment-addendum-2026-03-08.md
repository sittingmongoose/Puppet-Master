# Shard 016: Provider Failure-Class Alignment Addendum (2026-03-08)

Source: `Plans/Models_System.md`

Source lines: L1248-L1255

Source SHA256: `4685696c058fe6c44090aafea6432e1e13f104e1b7b6dc0b0552cddae1b1a110`

---

## Provider Failure-Class Alignment Addendum (2026-03-08)

Model/provider selection fallback remains separate from runtime retry classification.

Required clarifications:
- retired Persona model fields are inert compatibility reads and never choose or block a model
- provider execution failures that occur after selection must map into the shared runtime taxonomy, most notably `provider_transient` or terminal provider failure classes
- provider-level retry defaults must not silently override the shared runtime retry/backoff matrix
