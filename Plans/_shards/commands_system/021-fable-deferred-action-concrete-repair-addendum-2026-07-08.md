# Shard 021: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Commands_System.md`

Source lines: L4355-L4361

Source SHA256: `847c8db424e86f17acade65fd11b6a6e3fadf25bea6a50a89da5c54dcf8e2dd2`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime command-system rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-f5d64ed00d4c22eab6a72e2e`: `arguments[]` entries have fields `name`, `type`, `required`, `default?`, `enum_values[]?`, `description`, and `ui_editor`. `type` values are `string`, `number`, `boolean`, `path`, `enum`, `object`, and `array`. This shape was retired 2026-11-25. The 2026-09-26 §3.2 rewrite owns the live shape with optional `name` (`string`), `hint` (`string`) and `required` (`boolean`). Readers preserve `type`, `default`, `enum_values`, `description` and `ui_editor` byte-stable as unknown keys and never validate or act on them. The GUI authors `Arguments hint` through the §3.2 mapping (§6.1.3).
- Repairs `sfk-9e43a6ff3203f5ce66e0126d`: Section 6 numbering is structurally superseded by named headings. Missing `6.4` and `6.5` are retired aliases; new citations must use heading names, not bare section numbers.
- Repairs `sfk-03404db2c315565320a4b3e9`: reserved command prefixes are `cmd.git.`, `cmd.github.`, `cmd.source_control.`, `cmd.file.`, `cmd.permissions.`, `cmd.runtime.`, `cmd.testing.`, `cmd.browser.`, and `cmd.persona.`. Non-owner docs may consume but not mint commands under those prefixes.
