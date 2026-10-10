# S09 — pimalaya/ical repository

- URL: https://github.com/pimalaya/ical
- Version/commit: main page inspected; no release tag or immutable commit captured. Treat as unpinned lead only.
- Access observation: 2026-10-10T04:00:20Z.
- Locator: README “Features” and “RFC coverage”.

**Observed approach.** README describes an RFC-versioned model and byte-faithful syntax tree; says it preserves whole nested trees, supports recurrence/time-zone resolution, and separates strict building/validation from liberal parsing.

**Applicability.** The architecture maps to retaining raw unknown lines while applying typed recurrence edits. These are repository claims, not validation performed here, and the page is not a release-pinned dependency identity. Evaluate at a pinned artifact before relying on it.
