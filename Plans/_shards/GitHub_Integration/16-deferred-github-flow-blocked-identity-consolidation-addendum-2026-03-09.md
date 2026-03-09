## Deferred GitHub Flow Blocked Identity Consolidation Addendum (2026-03-09)

Deferred or GitHub-seeded wizard/runtime flows MUST preserve blocked recovery identity.

### Required rules
- if a GitHub-seeded wizard becomes blocked, resume returns to the same wizard instance/context rather than a fresh blank flow
- if the blocked state is tied to a runtime node/attempt, the deferred GitHub context remains linked to that originating node/attempt
- blocked recovery surfaces use canonical runtime action families and preserve local generated artifacts while remote steps remain blocked
