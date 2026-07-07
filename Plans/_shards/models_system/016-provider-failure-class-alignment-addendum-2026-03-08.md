# Shard 016: Provider Failure-Class Alignment Addendum (2026-03-08)

Source: `Plans/Models_System.md`

Source lines: L1259-L1266

Source SHA256: `1cb6c90beff8f25fe7a4e73492591a6633aa0604bb00de41849855bcbee3887a`

---

## Provider Failure-Class Alignment Addendum (2026-03-08)

Model/provider selection fallback remains separate from runtime retry classification.

Required clarifications:
- unavailable Persona-preferred models continue to fall through the normal selection chain and do not create a blocked state by themselves
- provider execution failures that occur after selection must map into the shared runtime taxonomy, most notably `provider_transient` or terminal provider failure classes
- provider-level retry defaults must not silently override the shared runtime retry/backoff matrix
