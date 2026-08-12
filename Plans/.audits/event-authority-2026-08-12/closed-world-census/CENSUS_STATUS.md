# Admission-filtered census status

Updated: 2026-08-12T04:13:19Z

## Advisor-2 blocker accepted (residual pollution)
The former 18-row “clean residual” set was **heuristic false-positive pollution**. It is **not** merged into the fresh denominator and was **removed** from IndividualDisposition.

Examples (Plan-cited):
- `branching.assistant_auto_worktree`, `...pre_merge_cmd`, `source_control.worktree_filter` — redb/panel config keys at `Plans/storage-plan.md:920-932`
- `error.concurrent_edit_conflict` — structured rewrite error outside seglog at `Plans/FileSafe.md:1455-1464`
- `self.log_blocked_command` — method call at `Plans/FileSafe.md:770-783`

## Corrected admission rule
`admission/CENSUS_ADMISSION_RULE_V2.md` — **DIRECT_EVENT_TYPE_BINDING_REQUIRED**  
Nearby persistence cues alone are insufficient. Rejects go to `rejected-lexical/` as `REJECTED_LEXICAL_CANDIDATE`, **not** IndividualDisposition denominator rows.

## Re-adjudication of residual universe
- clean18 + focus80 + eventish5 unique tokens: 83
- rejected lexical: 83
- needs direct-binding review: 0 (weak false hits force-rejected)
- clean residuals for adjudication: **0** (`residuals/CLEAN_RESIDUALS_FOR_ADJUDICATION.json`)

## Completed (prior, still valid)
1. Refroze 180 sources; extract 11165 exact tokens.
2. Multi-stage filters remain historical artifacts; their “clean residual” promotion path is superseded by rule v2.
3. EA-27 union presence / live registry presence unchanged.
4. Immutable cohort pins unchanged.
5. IndividualDisposition purged of `fresh_census_residual` rows (now 0).
6. Validator anti-pollution checks: no fresh residual / rejected lexical in disposition; no clean-residual progress claim.

## Not done / blocked
- Denominator remains `UNKNOWN_OPEN`
- Owner sheet finalization **blocked**
- Validator input finalization **blocked** until EA-27 coverage dispositions + sealed exact denom set
- No ADMIT / no registry append / no scripts edits
- No lexical rejects in denominator


## 2026-08-12T04:23:54Z — Advisor-2 false lexical restore

Blanket 83/83 lexical rejection corrected.

- Systematic scan: `admission/MACHINE_CONTRACT_EVENT_BINDING_SCAN.json` over `Wiring_Matrix.production.json` `expected_event_types` + `receipt_or_event_refs` (644 tokens).
- Restored as unresolved/emit (persistence open, no ADMIT): `testing.capability_policy.updated`, `testing.visibility_policy.updated`.
- Rejected lexical now **81**; unresolved **42**; IndividualDisposition **297**; census-adjudication still **504** (`partition_ok=true`).
- Artifacts: `rejected-lexical/FALSE_LEXICAL_RESTORE.json`; amended `admission/CENSUS_ADMISSION_RULE_V2`.
