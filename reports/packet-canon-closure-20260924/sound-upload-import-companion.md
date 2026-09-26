# Sound upload/import static companion

Status: static specification integration; native effects and verification remain open.

This materializes the existing `cmd.sound.upload` and `cmd.sound.pack.import`
request/result/error, availability/currentness and original-dispatch contracts.
It retains the existing limits, FileSafe/permission boundaries, per-member
validation, licensed metadata, duplicate handling and central outcome joins.
No new command, rejection priority, event, storage family or policy is introduced.

Independent review rejected the first candidate's mutually exclusive invalidity
checks: an input could exceed both size and duration caps yet have no valid
settlement. The correction admits any existing rejection whose own factual
predicate holds, rejects unsupported reasons, and never permits success while
an invalidating fact remains. The owner specifies no first-error ordering.

## Frozen evidence

Directory:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/`.

- `sound-upload-import-correction-01/companion.patch`: SHA-256 `3146244390ed50f12e023c2c7dcea3722a281911c1fe8befb42c9832f2f5239c`.
- `sound-upload-import-correction-01/CORRECTION-DELTA.patch`: SHA-256 `ed94a61bfa2d1cb6960ccfadd660eaa549d23150200e3baf7e3e87b1d983a9c3`.
- `SOUND-A-CORRECTION-REPORT-SNAPSHOT-20260926.md`: SHA-256 `008adf208614801c8569b3f23236a100dc1410001a0b0310593eff3b87b81908`.
- `SOUND-A-CORRECTION-REPORT-SNAPSHOT-ADDENDUM-20260926.md`: SHA-256 `4ddf74edde1e5e7dab3432b6488559c5a8faae092937e1199a2e509f0c06b706`.
- `SOUND-A-CORRECTION-INDEPENDENT-REVIEW-20260926.md`: SHA-256 `87d711f1deaeb2d144f084829815bb71f2f5a102269932b6b99a68cfef9304ba`.

The new correction used its own native OMP Goal because the original author's
Goal had completed. The correction Goal was active at its artifact freeze;
delivery is not a claim of native Goal completion or application execution.
The live author report continued changing after review. The separate immutable
snapshot and independent narrative-only addendum above supersede this report's
earlier reference to the mutable author's report path; the reviewed complete
patch and correction-delta hashes did not change.

## Root integration delta

The exact complete patch applied cleanly on the updated repair branch. Existing
test-send/preview contracts remain selected. Delete/export remain unmaterialized
pending their separately reviewed companion; their overlapping shared-file edits
must be combined deliberately, not applied over this integration wholesale.

Root corrected misleading residual wording and three corresponding assertions:
the now-materialized upload/import contracts leave native implementation and
verification work, not the old missing-companion specification work. Both rows
remain partial, with specified (not implemented) handlers/wiring. Delete/export
retain their separate specification residuals. Schema and response-helper bytes
are unchanged from the independently reviewed patch.

## Verification and remaining proof

Root's dedicated validator passed: 38 action positives, 92 negatives, 14
dispatch positives, 7 dispatch negatives and 10 response cases; no failures,
`native_proof=false`. Before the metadata correction, the combined upload,
import, metadata, notification and Touch source suite passed all 139 tests.
After the metadata correction, the enrolled
`python3 scripts/pm-plans-verify.py validate-sound-upload-import-contracts`
passed with no failures, and the same combined suite passed all **139 tests**
in 31.095 seconds. A different Sol reviewer accepted the exact four-file
metadata delta read-only. The final Sound A gate SHA-256 is
`d79d9dfc21493038b68b848f251ca91a1cdf9920fff40a976e08e5f650156a71`.

Actual FileSafe admission, decoder behavior, licensing/collision enforcement,
dispatcher registration, per-member persistence, runtime/observable work and
GUI behavior remain unproved. Static fixtures and matching digests do not
authenticate issuers or establish physical effects. No whole-tree aggregate,
main landing, governance reseal or whole-packet completion is claimed.
