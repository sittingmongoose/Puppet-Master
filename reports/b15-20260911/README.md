# Batch 15 integration — 2026-09-11

Applied the supplied guarded update: all 35 affected files matched their expected baseline and all installed bytes match the cumulative source ZIP. No unlisted files were replaced or deleted. Product Plans and governance artifacts were not changed.

Validation passed:
- Batch 15: 34 actual-handler cases / 134 assertions, surface checks / 21 assertions, and seven responsive ordinary-control journeys / 133 assertions.
- Batch 13 verification and boundaries; Batch 14 verification.
- Historical B1–B10 regressions, Batch 11 verification and repair, and Batch 12 verification.
- All 62 JavaScript modules pass syntax checks.
- Clean source-ZIP rebuild reproduced both HTML files exactly; both are 3,319,597 bytes with SHA-256 `fbc28efc7b8e1d041d0158e454a05e1eb97e2aba46c32c51937ce5b4420dec1c`.
- Direct file-URL navigation and ordinary Simple Goal setup/Send passed without page errors.
- Shard check passed: 98 documents, 2,236 shards. CRLF-aware diff whitespace check passed.

The system Python initially lacked Playwright, and the historical regression launcher referenced B1–B12 test dependencies absent from the checkout. Initial failed attempts remain in external evidence. A separate Python environment supplied Playwright; an external launcher adapter mapped the hardcoded Chromium path for both sync and async APIs to the installed browser. Missing historical tests ran from the cumulative source archive in an external tree against the same exact HTML bytes. No application or supplied test source was modified to obtain passing results. The original aggregate regression attempt remains failed because its historical entrypoints were absent; its available B13/B14 components and all recovered missing components subsequently passed.

A 700-pixel completed-Goal screenshot was spot-checked. This integration does not claim comprehensive visual or motion acceptance, a new recording audit, native execution, persistent/restart durability, or a governance seal. The standalone installer adversarial suite was not rerun; actual preflight, backed-up apply, exact inventory comparison and clean source rebuild were checked.

Raw evidence remains external; `evidence.json` records paths and SHA-256 identities for the principal receipts. Historical dependency recovery remains necessary for a fresh checkout to reproduce the cumulative launcher.
