# Shard 016: Provider Failure-Class Alignment Addendum (2026-03-08)

Source: `Plans/Models_System.md`

Source lines: L1233-L1240

Source SHA256: `86cbd6cdd89e710c84e7197225f41cefbb756fda8fc81e6e2f0ba5ab8e19f1cd`

---

## Provider Failure-Class Alignment Addendum (2026-03-08)

Model/provider selection fallback remains separate from runtime retry classification.

Required clarifications:
- unavailable Persona-preferred models continue to fall through the normal selection chain and do not create a blocked state by themselves
- provider execution failures that occur after selection must map into the shared runtime taxonomy, most notably `provider_transient` or terminal provider failure classes
- provider-level retry defaults must not silently override the shared runtime retry/backoff matrix
