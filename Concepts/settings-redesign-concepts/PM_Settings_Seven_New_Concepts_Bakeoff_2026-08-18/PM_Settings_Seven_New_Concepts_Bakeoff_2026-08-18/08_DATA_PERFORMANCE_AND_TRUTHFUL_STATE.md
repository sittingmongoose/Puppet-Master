# Data, Performance, Loading, and Truthful State

The August 13 Performance decision register and provider CLI adjudication are mandatory.

## Startup and hydration

Settings Home loads compact destination summaries and the search index, not every manager. The selected domain/manager hydrates lazily. Inactive/off-screen managers stop expensive subscriptions and layout work.

Required behavior:

- no provider/tool/server probe storm at startup;
- no eager decoding of every resource detail;
- virtualized large lists;
- latest-request-wins search and previews;
- cached values remain visible while refreshing;
- selected detail subscriptions unsubscribe when inactive;
- bounded caches and result sets;
- no second ResourceGovernor or progress owner.

## ObservableWork

Use truthful operation states for discovery, refresh, install, update, test, import, backup, rollback, and repair. Determinate progress appears only with a real denominator. Show precise phase and queue/wait reason. Every operation reaches a truthful terminal, degraded, retryable, cancelable, or recovery-required state.

## Required state fixtures

Each concept must provide deterministic triggers for:

```text
loading with cached content
empty
no search results
typo/fuzzy search
validation error
offline/poor network
managed/read-only
unavailable
restart required
reconnect required
setting changed elsewhere
import conflict
rollback complete
provider ready but Usage unavailable
multiple installations with selected/shadowed candidates
unknown installation owner/manual-only
provider update available / ask first
verification failure / rollback success
```

## Provider CLI acquisition

No provider CLI is bundled, pre-seeded, or silently installed. Initial acquisition is explicit user-triggered Install/Set Up, from the official provider/package source, for the exact selected Host/Environment. Authentication is separate. Auto/On may maintain an already approved installation but is not consent for first acquisition.

When runtime demand detects a missing provider CLI, preserve the originating operation and deep-link to the exact setup row; resume only after explicit setup and current continuation validation.

Normal UI uses human installation identity. Advanced detail may show resolved launcher, executable, package identity, host/environment, evidence, and confidence. Ambiguous/unknown ownership is manual-only.
