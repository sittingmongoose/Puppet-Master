## Source Control, GitHub Actions, and Docker Manager Cost Attribution Addendum (2026-03-12)

Cross-surface receipts from Source Control, GitHub Actions, Docker Manager, Kubernetes, and Orchestrator must not create feature-local cost views.

Rules:
- when a receipt or artifact carries `usage_event_ref` or equivalent canonical usage identity, `Show in Ledger` and `Show in Usage` open the canonical Usage surfaces with that event in scope
- if a user reruns workflows, tails logs, performs repeated registry refreshes, or executes other cost-bearing remote actions, the resulting cost attribution still resolves through canonical usage records
- any feature-local summary is secondary presentation only and must not replace the canonical Usage/Ledger pipeline

ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md
