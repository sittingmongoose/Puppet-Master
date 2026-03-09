## Deferred GitHub Flow Recovery Reconciliation Addendum (2026-03-09)

Deferred or GitHub-seeded wizard/runtime flows must preserve blocked recovery identity.

Rules:
- if a GitHub-seeded wizard becomes blocked, resume MUST return to the same wizard instance/context rather than creating a fresh blank flow
- if the blocked state is tied to a runtime node/attempt, the deferred GitHub context remains linked to that originating node/attempt
- blocked recovery surfaces must use canonical runtime action families and preserve local generated artifacts while remote steps remain blocked
