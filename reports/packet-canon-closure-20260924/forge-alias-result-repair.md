# Forge review alias result-reference repair — 2026-09-24

Base: `623e4ec8a604cfa252900b054cd178f3ceafeb28`.

`Commands_System.md:5519,5521` binds review create/merge to the existing
`command_result`, while `Forge_Integrations.md:509–516` distinguishes accepted
work and successful terminal provider results from their separate receipts.
The two Touch profiles instead exposed `command_receipt` as the result.

This repair aligns `TCP-GITHUB-PR` and `TCP-FORGE-PR-COMPAT` result references
to `forge_integration_contracts.schema.json#/$defs/command_result` and aligns
the static guard/tests. JSON comparison proves those two fields are the only
registry changes. Receipt references, normalization, alias identities, handlers,
wiring, effects, statuses and residuals are unchanged. No schema or owner prose
changes, regeneration, governance binding refresh, or native implementation.

Verification:

- Corrected tests against the unchanged base reproduce both stale profile
  pointers and the original GitHub expectation (three assertion failures).
- Nine focused tests pass. Result-shaped create/merge examples validate as
  `command_result`, not `command_receipt`; receipt references remain present,
  and changing either profile back to the receipt fails the guard.
- All 51 Touch source tests pass. Touch registry validation reports zero
  failures, 643 rows/133 profiles and all 643 implementation residuals open.
- Complete contract validation passes: 31 pairs, 1,067 positive cases, 3,492
  negative cases, zero findings. `git diff --check` passes.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/browser_scm_performance/forge-alias-result-repair-verification.json`
SHA-256 `0cd8a2bd303384b0410eaad67fb8fa228a5e800951f7a3e488cb06845ebbfa7b`.

Static alignment only. Generic Forge mutation wiring's route/open-no-persist
alternative remains separately unresolved, and native normalization/provider
execution, GUI acceptance and governance admission are not proved. Independent
review and a later locked landing remain required; this branch does not push main.
