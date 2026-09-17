# Shard 015: External Research Landing Boundary Addendum (2026-09-17)

Source: `Plans/Planning_Ledger_System.md`

Source lines: L1410-L1449

Source SHA256: `489240b5746d19d2778fe8f8f2282483710638965e24c760893a0fb28314d8cf`

---

## External Research Landing Boundary Addendum (2026-09-17)

Every external research wave that changes canon lands through a ledger registered here (`Plans/External_Research.md`, `ERS-006`). The ledger is the landing record, not the research result: it carries the corrections as correction records with the finding ids they repair, the design atoms and decisions that compiled them, the questions the wave raised with their answers and answer bases, and the compile queue that names the owner PlanUnits produced. Research artifacts, adjudication bundles and run manifests stay where they were published and are cited by path and SHA-256; they are never copied into the ledger as canon. A ledger is not the authorization: a correction lands under the standing repair authorization after its currentness re-check and independent review, and a capability or product choice lands only after the user's recorded answer.

```yaml
plan_unit_id: PLS-023
unit_type: requirement
status: accepted
owner_doc: Plans/Planning_Ledger_System.md
canonical_text: An external research wave that changes canon is landed through a registered v2 ledger carrying its corrections, design atoms, decisions, questions with their answer bases, and the compile queue naming the owner PlanUnits produced. Research bundles and run manifests remain published where they were produced and are cited by path and SHA-256 rather than copied into the ledger. The ledger records the landing; it does not authorize it, because a correction still requires its currentness re-check and independent review and a capability or product choice still requires the user's recorded answer.
gui_related: false
gui_classification_reason: Ledger landing boundaries are planning-governance behavior, not GUI work.
split_recommended: false
depends_on: [PLS-001, ERS-006]
unblocks: []
acceptance_criteria:
  - A research landing has a registered ledger whose correction records name the finding ids they repair.
  - Every cited research artifact appears by path and SHA-256 and is not copied into the ledger as canon.
  - The ledger records, and never substitutes for, the currentness re-check, the independent review and the user's answer.
  - Open questions the wave raised are ledger question records, not placeholders left in canon text.
validation_surfaces:
  - python3 scripts/pm-bootstrap-ledger-validate.py
  - python3 scripts/pm-plan-index.py validate
risk_class: source_authority_drift
reasoning_tier: high
context_scope: planning_ledger
implementation_surfaces: [Plans/Planning_Ledger_System.md, Plans/External_Research.md, Plans/ledgers/v2/ledger_registry.json]
node_compile_hint: {mode: governance_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/External_Research.md:ERS-006
  - reports/jujutsu-research-2026-09-11/continuation3-landing/README.md
preserved_exact_tokens: ["standing repair authorization", "currentness", "independent review"]
negative_constraints:
  - Do not treat a ledger record as the authorization for a canon change.
  - Do not copy a research bundle into the ledger as canonical prose.
  - Do not leave a research wave's open question as a placeholder in canon instead of a ledger question record.
owner_hints: [Plans/Planning_Ledger_System.md, Plans/External_Research.md]
```

ContractRef: ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/External_Research.md
