# Onboarding resume contract repair

Finding: ONB-CANON-003. The existing `ui.onboarding.start` request admitted
`intent=resume`, but required Welcome and its applied result forced a fresh
Welcome-to-Simple-Path transition. PWIZ-021's September 3 owner prose requires
restoring the draft or unfinished provider phase with the same actual Project;
the catalog explicitly routes the retired Resume token to this same local ID.

The repair distinguishes fresh start from same-stage resume under the unchanged
thirteen IDs. Resume preserves the entire prior continuation except the existing
local revision increment, retains generation fences and owner bindings, and
dispatches no owner operation or production receipt. The causality join requires
both a validated prior continuation and a matching validated saved session.
Only active/interrupted/deferred sessions qualify; completed/skipped/cancelled
sessions cannot become active through Resume. Restoration grants no new owner
authorization or readiness.

## Verification

- Eleven focused resume regressions pass, including draft, paid-provider and
  Free Models continuation, active owner-branch retention, interrupted/deferred
  admission, terminal/missing/mismatched session rejection, exact state
  preservation, fresh-start isolation, disabled outcomes and no dispatch.
- Eleven Settings draft-transfer tests and the 99-document/2,720-shard check pass.
- Full new-contract report: 31 pairs, 1,067 positive and 3,492 negative cases,
  zero findings. The new resume combinations are exercised by the focused tests,
  not claimed as additional cases in that existing fixture census.
- Frozen-base Onboarding suite: 42 tests; repaired suite: 54 tests (includes the
  earlier migration regression). Both have exactly the same pre-existing
  `test_existing_family_and_retention_census_is_unchanged` failure: `294 != 90`.
- Two independent reviews ran. The first found missing terminal-session
  admission; the second verified the correction and passed all eleven tests.

Raw evidence root:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`

| File under evidence root | SHA-256 |
| --- | --- |
| `onboarding-resume-contract-probe.json` | `ee3aac3204ca9082f5f383a4fe025bd914fccece085efbd448f065d9974bc5e4` |
| `browser_scm_performance/onboarding-resume-independent-adjudication.json` | `be9229fb737ffeade88989d6e82abfaf5e55e89227faacebad6b14f31303dd52` |
| `browser_scm_performance/onboarding-resume-repair-review-02.json` | `61ae5917f834598f21d2c4fff863a79a07c4f923e6d5518cd863d049e40d8df1` |
| `onboarding-resume-new-contracts-report.json` | `ba21257025b0b6d35b04d74ddcea5871eb16872fdb2d115abc19f99a1fed36f5` |
| `onboarding-resume-repair-verification.json` | `6fef471869c37743f173d8a64b30fd9d53065f70e2753be8a0ab3d9f82395c9a` |

No owner Markdown, storage shape, command registration or governance binding was
changed. No native resume, durability, owner revalidation, GUI or all-packet
closure is claimed. Main landing and its locked aggregate checks remain separate.
