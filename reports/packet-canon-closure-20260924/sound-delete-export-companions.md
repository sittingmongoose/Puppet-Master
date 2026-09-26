# Sound asset delete/export integration

Status: static companions integrated; native effects and verification remain open.

This adds the existing delete/export action contracts, original-dispatch joins,
fixtures and enrolled validators. Built-in deletion still refuses without
mutation; proven user soft-delete retains content/reference safety/restoration.
Unknown, failed and unavailable deletion effects are not fabricated as verified
no-mutation. `effect_unknown` retains central recovery-required settlement.
Export's source-asset nonmutation invariant does not claim that an unresolved
output-file write had no effect.

The complete integration preserves the already-integrated notification
test/preview and upload/import contracts. All six actions now have their own
action-qualified references on the existing shared profile. The Sound rows stay
partial and handlers/wiring specified. No new command, event, store, permission
policy, native handler or physical proof is introduced.

## Immutable evidence

External directory:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/`.

- `sound-delete-export-integration-01/ROOT-INTEGRATION.patch`: SHA-256 `aa83be8bec45f3b0fd59bd2d07cd45773a5f320bb923acfdfbc1fb8a1c4168d1`.
- `sound-delete-export-integration-01/INTEGRATION-MANIFEST.json`: SHA-256 `1879e2683577ef078f6c8d66a672b73456d61dd6836eb97665ce0f3fde110a06`.
- `sound-delete-export-integration-01/REPORT.md`: SHA-256 `8c1cd560232158f3b2326a9798bfa39f92dabfb6b3f6cf8a9f37e6afb7dc3fec`.
- `sound-delete-export-integration-01/REVIEW-DIFFERENT-SOL.md`: SHA-256 `ec9a4df727d7db8bb3139fe379e61c565a24e8eb5b6ba66adfbe8f9303ea089c`.
- `SOUND-B-CORRECTION-REPORT-SNAPSHOT-20260926.md`: SHA-256 `6f4af7074e1fc1c030f92f292b71b325461b8883af79e9e90cdb24e11f8237e1`.

The original and correction native Zcode jobs are separate; the correction
Goal was active at report time. Author delivery is not native Goal completion.
The coordinator's root-relative package is separately attributed: it merges
shared files over the accepted upload/import work, corrects the description to
"only owner-confirmed mutating outcome", and replaces obsolete remaining-spec
assertions with truthful implementation/verification residuals. This is not the
old author patch blindly replayed after another companion landed.

## Root checks

The package's pinned base is `8bb2d6401`. Root confirmed its 18 paths had no
intervening changes at `59550481c`, applied the reviewed patch, and verified all
18 installed files against the exact manifest hashes before testing.

All four enrolled validators passed with no failures:

- `validate-notification-sound-contracts`
- `validate-sound-upload-import-contracts`
- `validate-sound-asset-delete-contracts`
- `validate-sound-asset-export-contracts`

The combined notification, metadata, upload/import, delete/export, Touch source,
app-binding and checkpoint-permission unittest suite passed **197 tests** in
34.691 seconds. `git diff --check` passed. No whole-tree aggregate pass is
claimed for this step.

Native dispatch, permission/FileSafe enforcement, storage effects, recovery,
output-file behavior and GUI proof remain outstanding implementation and
verification obligations. This is neither main landing, governance reseal nor
whole-packet closure.
