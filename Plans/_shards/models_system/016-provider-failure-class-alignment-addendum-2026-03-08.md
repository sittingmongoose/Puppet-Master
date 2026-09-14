# Shard 016: Provider Failure-Class Alignment Addendum (2026-03-08)

Source: `Plans/Models_System.md`

Source lines: L1273-L1280

Source SHA256: `018c37767997cac4e20f76cebc19a39c42985f28d5a738fc12e397b0ce0abf66`

---

## Provider Failure-Class Alignment Addendum (2026-03-08)

Model/provider selection fallback remains separate from runtime retry classification.

Required clarifications:
- unavailable Persona-preferred models continue to fall through the normal selection chain and do not create a blocked state by themselves
- provider execution failures that occur after selection must map into the shared runtime taxonomy, most notably `provider_transient` or terminal provider failure classes
- provider-level retry defaults must not silently override the shared runtime retry/backoff matrix
