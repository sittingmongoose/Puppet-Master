# Shard 016: Provider Failure-Class Alignment Addendum (2026-03-08)

Source: `Plans/Models_System.md`

Source lines: L1273-L1280

Source SHA256: `fb10700922c0e0320613b1bfabc05fc1b63bbf142db41fe88df84c5700522805`

---

## Provider Failure-Class Alignment Addendum (2026-03-08)

Model/provider selection fallback remains separate from runtime retry classification.

Required clarifications:
- unavailable Persona-preferred models continue to fall through the normal selection chain and do not create a blocked state by themselves
- provider execution failures that occur after selection must map into the shared runtime taxonomy, most notably `provider_transient` or terminal provider failure classes
- provider-level retry defaults must not silently override the shared runtime retry/backoff matrix
