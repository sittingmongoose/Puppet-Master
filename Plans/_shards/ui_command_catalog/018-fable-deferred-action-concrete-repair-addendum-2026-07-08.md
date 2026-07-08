# Shard 018: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/UI_Command_Catalog.md`

Source lines: L8081-L8086

Source SHA256: `cd92e6ba41cc46f892b6227f3005e54595e0a724782ceb903b3108ca219c6e41`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime UI command catalog rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Keeps `sfk-ddc264cdea296caf349adecd` explicitly deferred: every command row from UCC-049 through UCC-106 must expose `command_id`, `payload_required`, `payload_optional`, `result_fields`, `error_codes`, `disabled_reason_codes`, and `owner_doc_ref`. Rows that still preserve prose-only source tokens are not implementation-ready until these fields are filled.
- Repairs `sfk-ed92df2325332306b2463b50`: browser production command IDs are `cmd.browser.share_with_agent`, `cmd.browser.revoke_share_with_agent`, `cmd.browser.run_code`, and `cmd.browser.evaluate`. Legacy `browser_run_code` and `browser_evaluate` are compatibility aliases only.
