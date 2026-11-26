# Shard 021: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Commands_System.md`

Source lines: L4362-L4369

Source SHA256: `cbe54b3bd95aba15a9a5ab164164df6a976aeb9ab218e7dae4128fc2b7c58890`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime command-system rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-f5d64ed00d4c22eab6a72e2e`: `arguments[]` entries have fields `name`, `type`, `required`, `default?`, `enum_values[]?`, `description`, and `ui_editor`. `type` values are `string`, `number`, `boolean`, `path`, `enum`, `object`, and `array`.
  Retired 2026-11-25: the 2026-09-26 §3.2 rewrite is the live item shape: optional `name` (`string`), `hint` (`string`) and `required` (`boolean`), with unknown keys preserved. `type`, `default`, `enum_values`, `description` and `ui_editor` are not command-file keys; a file that carries them keeps them byte-stable as unknown keys and nothing validates or acts on them. The GUI authoring control is `Arguments hint` (§3.2 argument authoring boundary, §6.1.3).
- Repairs `sfk-9e43a6ff3203f5ce66e0126d`: Section 6 numbering is structurally superseded by named headings. Missing `6.4` and `6.5` are retired aliases; new citations must use heading names, not bare section numbers.
- Repairs `sfk-03404db2c315565320a4b3e9`: reserved command prefixes are `cmd.git.`, `cmd.github.`, `cmd.source_control.`, `cmd.file.`, `cmd.permissions.`, `cmd.runtime.`, `cmd.testing.`, `cmd.browser.`, and `cmd.persona.`. Non-owner docs may consume but not mint commands under those prefixes.
