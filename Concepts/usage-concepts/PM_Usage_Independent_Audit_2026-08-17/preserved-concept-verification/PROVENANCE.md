# Preserved from the concept's `verification/` directory

These 15 files (13 PNGs + `cdp-shots.mjs` + `std-shots.mjs`) were the entire real contents of
`Concepts/usage-concepts/QwenUsageConcept/verification/` — the only artifacts of the u11 redesign phase
that ever existed. They were added in commit `aa122d7c85`.

They were moved here on 2026-08-18 because `Concepts/CONCEPT_RULES.md` rule 10 requires temporary test and
verification material to be deleted from a concept folder before finishing, and
`Concepts/ConceptHub/validate.py` fails the folder while `verification/` holds any file. Deleting them
outright would have destroyed the only evidence of that phase, so they are preserved here instead.

Two caveats a reader should know:

- The two drivers are dead as written. Both hardcode a macOS Chrome path
  (`/Applications/Google Chrome.app/...`) and expect a server on `127.0.0.1:8741` that nothing starts.
  `cdp-shots.mjs` declares 13 captures but only 7 of its outputs are present; `std-shots.mjs` declares 2
  and 1 is present. Six of the PNGs here were produced by a driver that was not retained.
- These are NOT the audit's own evidence. The audit's 86 screenshots, 34 probe files and 18 harness
  scripts are in `../audit-evidence/`, and the remediation's per-wave verification is in
  `../remediation-evidence/`.
