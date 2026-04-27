work_id: w-20260312-203855
run_id: r-20260312-203855-run-027
Scribe blocked
triage_class: reconciliation_plan_defect
exact blockers:
- `Plans/Widget_System.md` contains overlapping packet targets: `target-025` replaces owner section `## 4. Orchestrator Progress widget scope and catalog linkage` across lines 41-51 while `target-036` also replaces nested child section `### Catalog source and drill linkage` across lines 47-51.
- `Plans/usage-feature.md` contains overlapping packet targets: `batch-5b-usage-billing-identity-attribution-pricing-metadata` replaces lines 293-317 while nested child target `batch-5b-usage-export-taxonomy` also replaces lines 298-301 inside that same parent section.
- Because the active run-027 packet asks Scribe to perform overlapping same-file `heading:replace_section` mutations, Scribe cannot serialize the writes safely without guessing precedence or altering packet intent.
next required stage: Reconciliation Planner
