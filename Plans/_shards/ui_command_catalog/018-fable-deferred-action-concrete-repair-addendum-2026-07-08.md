# Shard 018: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/UI_Command_Catalog.md`

Source lines: L8081-L8086

Source SHA256: `39eecb4e39b34e0d07567087fd1f79c5a0d1758d76c96beb5db24edb4c9bc696`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime UI command catalog rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-ddc264cdea296caf349adecd`: every command row from UCC-049 through UCC-106 must expose `command_id`, `payload_required`, `payload_optional`, `result_fields`, `error_codes`, `disabled_reason_codes`, and `owner_doc_ref`. Rows that still preserve prose-only source tokens are not implementation-ready until these fields are filled.
- Repairs `sfk-ed92df2325332306b2463b50`: browser production command IDs are `cmd.browser.share_with_agent`, `cmd.browser.revoke_share_with_agent`, `cmd.browser.run_code`, and `cmd.browser.evaluate`. Legacy `browser_run_code` and `browser_evaluate` are compatibility aliases only.
