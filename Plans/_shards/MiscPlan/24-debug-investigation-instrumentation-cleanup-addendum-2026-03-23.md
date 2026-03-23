## Debug investigation instrumentation cleanup addendum (2026-03-23)

Temporary Debug instrumentation must preserve cleanup lineage and safe recovery behavior.

Required rules:
- every temporary debug mutation lane carries an `instrumentation_id`, declared scope, and explicit cleanup obligation
- cleanup must account for code instrumentation, temporary env flags, dev dependencies, remote host installs, browser mocks, and other reversible debug-only changes
- resolved, cancelled, and superseded investigations attempt cleanup automatically; failed cleanup transitions the investigation to `failed_cleanup` instead of pretending success
- unresolved instrumentation remnants must remain user-visible until cleaned up or explicitly accepted as follow-up work

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md
