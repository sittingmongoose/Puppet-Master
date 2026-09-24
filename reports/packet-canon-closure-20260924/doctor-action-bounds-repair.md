# Doctor action bounds and result references

Status: repaired static companion, not native Doctor execution, a main landing,
governance reseal, or complete packet closure.

The Doctor owner requires exact bounded checks with identity, descriptor/owner
currentness and permission (`newtools.md:8732–8734`), and permits a projection update
only from a fresh semantic-owner result, not merely navigation (`:8747`). The
closed action schema nevertheless accepted null check/target/currentness/permission
fields for `ui.doctor.run_check` and accepted `owner_result_applied` with no owner
result reference. The old TCP-DOCTOR profile pointed its result to a finding
projection and its error to an `allOf` array rather than the existing action result.

The repair:

- Rejects null check ID, target kind/ID, descriptor revision, owner generation and
  permission snapshot only for `run_check`. Cached entry, visible refresh and copy
  retain their existing nullable scope fields.
- Requires a non-null safe owner-result reference when currentness says
  `owner_result_applied`, across all eight local actions. Other states are unchanged.
- Binds TCP-DOCTOR result/error to the existing `doctor_action_result`, consistent
  with the later N2-155 local-action contract and copy-diagnostics profile.

No action, handler, event, storage family or error envelope is added. Presence of a
reference does not prove its authenticity or freshness; runtime enforcement remains
unproved. Other Doctor specification details are not closed by this repair.

## Verification

- Frozen-base probes accepted all seven individually invalid mutations of valid
  request/result fixtures. The new regression also reproduced stale Touch pointers.
- Five focused tests pass, including all existing local positive fixtures, seven
  new negatives, six null-field checks, cached-entry preservation and all eight
  actions across all four currentness states.
- All 50 Touch Closure source tests pass. Structural registry verification passes
  for 643 rows/133 profiles; all 643 still retain open implementation residuals.
- Full contract validator: 31 pairs, 1,067 positive cases, 3,492 negative cases,
  zero findings. `git diff --check` passes.
- Independent bounded review found no issues and independently passed five tests.
- No owner Markdown or generated shard/index changed; governance bindings remain
  untouched. Full locked landing checks are still required.

Raw evidence:

- `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/doctor-action-bounds-probe.json`
  SHA-256 `d92f78cd5cdf8f3c35f20d57f0902117ab31e0dfbc15b37677d8365f1ee39c6d`.
- `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/doctor-action-new-contracts-report.json`
  SHA-256 `ba21257025b0b6d35b04d74ddcea5871eb16872fdb2d115abc19f99a1fed36f5`.
- `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/doctor-action-touch-check.json`
  SHA-256 `0fcde79e9ac16feda1133d2ea3151ef6d70794b58c9d924c10e83c26ce0bb50c`.
- `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/doctor-action-repair-verification.json`
  SHA-256 `9519027397a432f6e5e6d805a63ebe84257f0e294c77c29e52799b4becfc4d90`.
- `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/browser_scm_performance/doctor-action-bounds-independent-review.json`
  SHA-256 `5b912cb30dc27e885b77eb796260bfb9a2be6c78c8f198363493794e3b656c0c`.
