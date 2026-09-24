# Onboarding dismissal and path-choice causality repair

Findings ONB-CANON-004/005: independently valid records could still substitute
the draft/queued plan during Close or Defer, attach unrequested owner work to
Close, or return a different Simple Path choice from the request. PWIZ-021 and
UIW-015 already require exact continuation preservation and explicit local
choice semantics; this change materializes those existing obligations.

Applied Close/Defer now join the complete prior continuation, exact focus, and
absence of new owner dispatch. Simple Path results bind the actual requested
choice. The existing resume preservation tuple is reused without changing its
fields or admission rules. No schema, fixture, owner prose, action ID, physical
storage, event registration, native handler or governance binding changes.

Verification:

- Nine new tests pass, including all four choices, twelve cross-choice negative
  pairs, draft/committed-Project/active-branch preservation, exact focus and
  non-writing disabled outcomes. Against the old helper these tests produce
  71 expected failed assertions and zero errors.
- Independent review: nine new plus 42 existing tests pass; seven fresh,
  schema/semantic-valid counterexamples pass the old join and fail the repair.
- Full existing phase suite: 54 tests, with exactly the unchanged storage census
  failure `294 != 90`. Eleven Settings draft-transfer tests pass.
- Full contract gate: 32 pairs, 1,163 positive cases, 4,024 negative cases,
  12 self-tests, zero findings. The gate validates individual values; the new
  regression tests, not that aggregate count, prove the three-value joins.
- Shard check: 99 documents / 2,721 shards; whitespace check passes.

Raw evidence root:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`

| Evidence file | SHA-256 |
| --- | --- |
| `onboarding-action-causality-current.json` | `abc559972b0daf7e0cc8f60de5d20ab560f402628b9941d78a49c4a16f8ae054` |
| `onboarding-action-causality-repaired.json` | `f49522a0853a42a74199fc97838bfefb5ab12ea9de11b912a395cb463432c841` |
| `onboarding-causality-repair-verification.json` | `fd06c5309096757880eb78a89cc973208757b6453631900df1e24b9eb9bb0abc` |
| `onboarding-causality-new-contracts-report.json` | `7abb02368cd856844cd1f61bd00011ed4eb7e9b05804d51a381f6bfa0ce6b267` |
| `browser_scm_performance/onboarding-action-causality-independent-review.json` | `07960499c93e995f6445e417dd362a147064cc689d04d1a197af512ce9969c25` |

The Home-menu source-surface mismatch, Ready Back adjudication, broader action
composition, native persistence/owner authority and full packet closure remain
separate. No main landing or expanded governance-drift exception is claimed.
