# Capture target-update policy repair

Status: repaired specification companion on the packet repair branch; not a main
landing, native capture proof, governance seal, or all-packet closure.

Packet `04_COMMAND_EVENT_WIRING_REGISTER.md:112` explicitly requires both
`cmd.testing.capture.start` and `cmd.testing.capture.target.update` to carry an
explicit requested target policy. The current Test Capture owner (lines 45–57,
TCME-001) retains six policies, separates policy from target identity, and requires
explicit, timed, generation-aware, receipted switching. The request schema already
declared `target_policy`, but required it only for start; the positive target-update
fixture omitted it.

The repair requires that existing field for target-update, adds the matching
`application_window` policy to the desktop-window fixture, and adds missing-policy
negative fixtures for both commands. It introduces no new enum, command, handler,
event, storage binding, or capture behavior. Existing currentness, session,
permission, idempotency, and return-route constraints are unchanged.

## Verification

- Before schema repair, the two target-update omission checks failed because the
  otherwise-valid request was accepted without policy.
- All three focused regression tests pass after repair. They preserve the six-value
  policy vocabulary, reject missing/null/empty/unknown policy, and derive negative
  examples from valid fixtures. Schema validity is not proof of executable
  target/policy combinations.
- All nine adjacent evidence-command tests pass.
- Full `pm-new-contracts-verify.py`: 31 contract pairs, 1,067 positive cases,
  3,485 rejected negative cases, zero findings.
- Independent bounded review found no actionable issues and separately passed the
  three focused tests. `git diff --check` passes.
- No owner Markdown, generated shards/index, or governance bindings were changed.

Raw evidence (outside the repository):

- `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/browser_scm_performance/capture-target-policy-proof.json`
  SHA-256 `339acf9b2541aeef7a93d061091c2d140a6dfee295010a6ba90195b6c91a9f2b`.
- `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/capture-target-policy-new-contracts-report.json`
  SHA-256 `536088803e14352c1572337c43bf747e9024fe644682c1adf1556738cd187613`.
- `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/capture-target-policy-repair-verification.json`
  SHA-256 `a9a47105cc4fa3647422e47430bf520f9b07347bc64f10752423116498f60a00`.
- `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/browser_scm_performance/capture-target-policy-independent-review.json`
  SHA-256 `1fd495c7655c7cf4cfcf9daca03332db020f8b2a00844df8419ead25597e462a`.

Landing still requires the lock, current-main rebase/re-adjudication, and full
landing checks. Prior exceptions for other named files do not waive this repair's
findings. Governance resealing remains with its designated owner.
