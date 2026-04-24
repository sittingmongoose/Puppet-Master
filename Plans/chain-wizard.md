# Chain Wizard -- Plan

## Wizard and launched-run lineage reconciliation

### Required data shape
- The wizard → execution handoff MUST include `project_id`, `thread_id`, `wizard_id`, and `run_id` for the child run.
- Lineage tracing MUST preserve the wizard → run bridge so review and resume surfaces can navigate back to the planning phase.
- The handoff packet MUST carry requested/effective runtime identity and `execution_role` so child-run policy is aligned with wizard context.
