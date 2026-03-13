## Deferred GitHub Recovery Binding (2026-03-09)

Deferred or GitHub-seeded wizard/runtime flows must preserve blocked-state identity, recovery context, and local generated artifacts.

Deferred GitHub launch and resume flows MUST persist a binding record containing:
- `wizard_id?`
- `thread_id?`
- `run_id?`
- `node_id?`
- `attempt_id?`
- deferred payload ref
- `blocked_sequence?`
- `replan_generation?`
- clearing status

Rules:
- deferred wizard launch paths must support both `attention_required` and `blocked`
- any stored `resume_url` or preloaded wizard payload must survive blocked-state recovery and deep-link reopening
- if a GitHub-seeded wizard becomes blocked, resume MUST return to the same wizard instance/context rather than creating a fresh blank flow
- if the blocked state is tied to a runtime node/attempt, the deferred GitHub context remains linked to that originating node/attempt
- auth-blocked GitHub actions surface canonical recovery actions rather than integration-specific fallback loops
- repo-import or workflow-generation flows that become blocked preserve local generated artifacts and mark remote steps as blocked explicitly
- the binding is created before handing control to deferred GitHub auth/import/launch flows
- if the deferred flow blocks, the runtime blocked episode references this binding
- the binding is cleared only when the deferred flow completes successfully, the owning blocked episode is abandoned, or the wizard/run context is cancelled or superseded
- approval or auth resolution wakes the scheduler/event consumer immediately; it is not a polling loop

Acceptance criteria:
- no-wizard/deferred GitHub entry paths do not lose blocked-state recovery
- deep links and preloaded payloads remain stable across blocked/unblocked transitions
