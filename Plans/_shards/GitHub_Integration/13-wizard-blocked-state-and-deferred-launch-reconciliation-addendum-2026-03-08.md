## Wizard blocked-State and Deferred Launch Reconciliation Addendum (2026-03-08)

Deferred or preloaded Chain Wizard entry points in GitHub/project-management flows must preserve the full wizard blocked-state model introduced by the runtime scheduler packet.

Required behavior:
- deferred wizard launch paths must support both `attention_required` and `blocked`
- any stored `resume_url` / preloaded wizard payload must survive blocked-state recovery and deep-link reopening
- if a wizard was opened from a GitHub/deferred project flow and later becomes `blocked`, the recovery path must return to the same wizard instance/context rather than creating a fresh blank wizard
- imported/deferred project setup context must remain intact when the wizard is resumed from blocked state

Acceptance criteria:
- no-wizard/deferred GitHub entry paths do not lose blocked-state recovery
- deep links and preloaded payloads remain stable across blocked/unblocked transitions
