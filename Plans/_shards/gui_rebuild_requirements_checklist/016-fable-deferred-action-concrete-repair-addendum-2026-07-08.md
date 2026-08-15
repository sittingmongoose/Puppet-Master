# Shard 016: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/GUI_Rebuild_Requirements_Checklist.md`

Source lines: L1907-L1912

Source SHA256: `fcc18e1b56d09fb73d8a582cc332eeb8a36c7423ad59f62fa160390b9e5d1f91`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime GUI checklist rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-42b8d395baf8155efb2d98bc`: unchecked checklist rows are not PASS evidence. The checklist is an auditable summary only after each row references a validator, screenshot, or owner-doc evidence record and has status `pass`, `fail`, `blocked`, or `not_applicable`.
- Repairs `sfk-8bbca61cb9960d94f08e192a`: automatable checklist rows must carry `test_id`, `validator_command?`, `evidence_ref?`, and `owner_doc_ref`. Prose-only assertions remain source-lineage until converted.
