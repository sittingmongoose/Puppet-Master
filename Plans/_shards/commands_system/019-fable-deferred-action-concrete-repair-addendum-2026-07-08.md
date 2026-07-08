# Shard 019: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Commands_System.md`

Source lines: L3682-L3688

Source SHA256: `6bbeb3202202950844a47a48ab5f9984340611e1eca4aae5aaab364d3af34020`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime command-system rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-f5d64ed00d4c22eab6a72e2e`: `arguments[]` entries have fields `name`, `type`, `required`, `default?`, `enum_values[]?`, `description`, and `ui_editor`. `type` values are `string`, `number`, `boolean`, `path`, `enum`, `object`, and `array`.
- Repairs `sfk-9e43a6ff3203f5ce66e0126d`: Section 6 numbering is structurally superseded by named headings. Missing `6.4` and `6.5` are retired aliases; new citations must use heading names, not bare section numbers.
- Repairs `sfk-03404db2c315565320a4b3e9`: reserved command prefixes are `cmd.git.`, `cmd.github.`, `cmd.source_control.`, `cmd.file.`, `cmd.permissions.`, `cmd.runtime.`, `cmd.testing.`, `cmd.browser.`, and `cmd.persona.`. Non-owner docs may consume but not mint commands under those prefixes.
