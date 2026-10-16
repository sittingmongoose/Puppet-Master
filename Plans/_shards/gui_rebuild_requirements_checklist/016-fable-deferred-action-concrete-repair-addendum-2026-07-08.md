# Shard 016: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L1907-L1912

Source SHA256: `bbf4a75bd32a89f48ee7a3b470e1d28f3c46b1ca0bece82621dcdb7d78879f43`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime GUI checklist rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-42b8d395baf8155efb2d98bc`: unchecked checklist rows are not PASS evidence. The checklist is an auditable summary only after each row references a validator, screenshot, or owner-doc evidence record and has status `pass`, `fail`, `blocked`, or `not_applicable`.
- Repairs `sfk-8bbca61cb9960d94f08e192a`: automatable checklist rows must carry `test_id`, `validator_command?`, `evidence_ref?`, and `owner_doc_ref`. Prose-only assertions remain source-lineage until converted.
