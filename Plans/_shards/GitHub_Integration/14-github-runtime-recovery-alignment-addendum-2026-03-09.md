## GitHub Runtime Recovery Alignment Addendum (2026-03-09)

GitHub-backed flows that interact with runtime execution must preserve blocked and retry semantics.

### Required rules
- deferred GitHub actions launched from wizard or runtime state remain tied to the originating node/attempt when applicable
- auth-blocked GitHub actions surface canonical recovery actions rather than integration-specific fallback loops
- repo-import or workflow-generation flows that become blocked must preserve local generated artifacts and mark remote steps as blocked explicitly
