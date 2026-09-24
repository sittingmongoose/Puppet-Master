# Selected capture provenance identity repair

Base: `9f5157702ac84fdaf251de2b63c35121388bbb8b`.

`Test_Capture_and_Motion_Evidence.md` section 6 (lines 150–165) requires immutable raw identity and exact subject/continuity verification before latest selection. The existing selected provenance branch nevertheless admitted null, empty and malformed selected IDs. The aggregate semantic dispatcher has no capture override, so it did not reject these values either.

The selected-only branch now references the existing `#/$defs/id` contract. The other provenance states, candidate-membership policy, identity algorithm, commands, handlers, events and governance are unchanged. A syntactically valid ID alone does not prove underlying media custody or runtime verification.

Three negative fixtures cover null, empty and malformed selected IDs. The existing capture test file adds selected positive/negative tests at both definition and aggregate-root levels, plus preservation of null for original-missing and no-candidate dispositions. A structural comparison confirms the schema differs only by this selected-branch property and all prior fixture values/order are retained.

Verification:

- Before schema repair, the new focused selected-ID test failed all three invalid-ID subcases.
- `python3 -m unittest discover -s tests -p test_pm_capture_target_policy.py -v`: 6 tests pass.
- `python3 scripts/pm-new-contracts-verify.py`: pass, 31 pairs, 1,068 positives and 3,505 negatives, no findings.
- `git diff --check`: pass.

External proof and detailed verification are under `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/browser_scm_performance/` in `capture-provenance-selection-bounds-probe.json` (SHA-256 `34a9fcc9577e6fe75f08693d7fbb852008ee2b2fb647d08a5be3e67dfa431903`) and `capture-provenance-id-repair-verification.json`.

Static contract repair only: no native capture implementation, GUI completion, runtime/security/media evidence, readiness admission, governance reseal or whole-packet closure.
