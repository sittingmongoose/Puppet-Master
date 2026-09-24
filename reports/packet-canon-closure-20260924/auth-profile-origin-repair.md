# Auth-profile reconciler origin repair

Status: static contract repair on the packet repair branch, not a main landing,
runtime authentication proof, governance seal, or all-packet closure.

`Plans/Multi-Account_Connection_Spec.md` sections 5 and 6 permit a non-interactive
owner reconciler only for bounded `verify`. The existing request schema enforced
human origins for the original human actions but admitted `owner_reconciler` for
`rename`, `revoke`, `transfer.preview`, and `transfer.apply`.

The shared request now constrains that origin to `cmd.auth_profile.verify` and
operation `verify`. Existing verification permission/provider-egress requirements
are unchanged. No command, event, storage family, handler, or authority is added.

Four negative fixtures change only the origin of otherwise-valid maintenance
requests. Regression tests check every current request command, preserve both
human origins for the four maintenance actions, and preserve reconciler verify.

## Verification

- Baseline existing suite: four tests passed.
- Before schema repair, the new tests reproduced acceptance of all four prohibited
  command/origin combinations.
- Repaired suite: six tests passed, including the complete owner fixture pair.
- Complete `pm-new-contracts-verify.py` run: all 31 pairs valid; 1,067 positive
  cases accepted; 3,483 negative cases rejected; zero findings.
- `git diff --check` passed. No owner Markdown was changed in this repair, so no
  shards or PlanUnit index were regenerated. No governance binding was refreshed.
- Independent bounded review found no issues and independently passed all six
  tests, including human-origin preservation and reconciler verification.

Raw evidence (outside the repository):

- `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/settings_dependencies/touch_closure/auth-origin-probe.json`
  SHA-256 `e47b1cc34bf5aa459deebbecb9f690f700b4e18487fcb97b82ca347ba32930f3`.
- `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/auth-origin-new-contracts-report.json`
  SHA-256 `1c65e57d1838cf5dd2200ee22551d3826a4aaf01c66dd74556e781387f52f6b2`.
- `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/auth-origin-repair-verification.json`
  SHA-256 `8a1a82c0ec1b69bc68d635ea999adc1f1ca7faac70e64846c7ebafb88182bf8d`.
- `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/settings_dependencies/auth-origin-repair-independent-review.json`
  SHA-256 `de341d258918a00daef253753f909d1d5a96c74e1268abfb3d8070ae665d2932`.

The complete landing checks remain required after rebasing on then-current main
under the landing lock. Earlier exceptions for other named files do not waive
findings for this repair. The designated governance owner retains any reseal.
