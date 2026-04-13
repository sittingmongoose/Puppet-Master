## 10. Validation Pass Report Artifacts

Validation pass reports remain upstream governance artifacts, but they require stronger lineage into execution and artifact history.

Required lineage fields include:
- `project_id`
- `wizard_id?`
- `thread_id?`
- `phase_plan_ref?`
- staged bundle refs
- `requirements_quality_report_ref?`
- promoted artifact refs
- `workflow_run_id`
- requested/effective runtime identity snapshot refs when a provider/model executed the pass
- `effective_account_id?`
- `execution_role`
- launched `run_id?` when execution later starts from the validated output

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Runtime_Artifacts_Panel.md

Rules:
- validation pass reports do not become runtime attempts
- validation reports must be traceable both backward to planning/wizard state and forward to launched execution when that bridge exists
- pass reports remain first-class records in History/Ledger and first-class export members in manifests

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Contracts_V0.md

ContractRef: Plans/Contracts_V0.md#3.3 Requirements quality events, Plans/chain-wizard-flexibility.md#12. Three-Pass Canonical Validation Workflow (Mandatory Invariant Sweep)

Required fields:
- pass_number
- pass_name
- pass_verdict
- verdict_reason
- staged_bundle_ref

Canonical terms and values:
- validation_pass_report
- pass_number
- pass_name
- pass_verdict
- verdict_reason
- staged_bundle_ref
- skipped

Behavioral rules:
- Validation pass reports remain upstream artifacts.
- Pass reports must bridge into launchable execution through explicit lineage fields.

Permission carry-through:
- effective runtime/account identity must survive from pass report into downstream execution handoff
