# S03 — OCFL issue #538, historic inventory manifest wording

- URL: https://github.com/OCFL/spec/issues/538
- Version/history: Issue opened 2021-04-02; closed via #547; milestone 1.1. It is linked to the v1.1.0 change log in S04.
- Accessed: 2026-10-10T04:14:43Z; issue title/status/milestone and description read-only.
- Locator: issue #538 description and metadata, especially lines 134–178.
- Observed operation: Read public issue and its linked status; no implementation issue or file-loss incident was claimed.

## Evidence and applicability

The issue described ambiguity over whether the manifest in a historical inventory was a snapshot of files known at that time, and how the requirement that files in version content directories be listed should be interpreted. The 1.1 change log records the resulting clarification: each historical inventory's manifest must reference every file in its own version directory. This was a specification wording clarification, not evidence that a particular copy failed or data was lost. For local/offsite copying, it makes the version directory and its matching inventory part of the unit to preserve and validate; a root/head inventory alone should not be treated as the whole version history. Applicability is conditional on using OCFL; for BagIt or plain folders, apply their own enumerated-manifest checks.
