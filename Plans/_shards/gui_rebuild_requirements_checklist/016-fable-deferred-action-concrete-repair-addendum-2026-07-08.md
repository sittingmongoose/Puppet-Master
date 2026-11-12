# Shard 016: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L1912-L1917

Source SHA256: `c2fb730c57e1a122bc4f80813e833a45287bd5f77199026663042324d3db5ae0`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime GUI checklist rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-42b8d395baf8155efb2d98bc`: unchecked checklist rows are not PASS evidence. The checklist is an auditable summary only after each row references a validator, screenshot, or owner-doc evidence record and has status `pass`, `fail`, `blocked`, or `not_applicable`.
- Repairs `sfk-8bbca61cb9960d94f08e192a`: automatable checklist rows must carry `test_id`, `validator_command?`, `evidence_ref?`, and `owner_doc_ref`. Prose-only assertions remain source-lineage until converted.
