## Plan Document Status

**This is a PLAN DOCUMENT ONLY** -- No code changes have been made. This document covers:

- Agent-left-behind artifacts (docs, tests, builds) and cleanup policy
- Runner contract implementation (prepare_working_directory, cleanup_after_execution)
- Dedicated agent output directory and evidence retention policy
- Cleanup UX (manual prune, config toggles)

Implement sections in dependency order. The **DRY Method** (AGENTS.md) applies: single implementation in a dedicated module, no duplicated logic, all new reusable items tagged.

