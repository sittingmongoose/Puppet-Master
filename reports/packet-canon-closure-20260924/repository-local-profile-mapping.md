# Repository-local profile mapping

Status: static integration; native controllers and partial Touch residuals remain open.

The three existing F3-529 local actions now select their existing specialized
request/result definitions rather than permissive common shapes. Profile
preview also appears in trigger, receipt and return-route metadata. The
permission statement covers all three actions without broadening authority.
No schema, owner Markdown, domain command, event, policy or storage is added.

## Provenance

External evidence directory:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/repository-local-profile-01/`.

- Final `INTEGRATION-PACKAGE-SOL-V4.patch`: SHA-256 `00889a862efe2fc58c429448707bf0bca80abe13fe76e44ffd87570b2b94d690`.
- Installed test: SHA-256 `ffc054688ac4878e10b99b7a830b8072cda0e90df4e7c006e8e2b8a3ccd49330`.
- Original coordinator handoff: SHA-256 `a28085b279bb21f3b75568d30f31801e0d3908cbcd967bd65dbd136a67e0d498`.
- Final independent static acceptance, `REVIEW-DIFFERENT-SOL-V4.md`: SHA-256 `879063a3dc27a8c795bebcfae131d30061d7d8ea1d30e94d0edeca70f4755d68`.

Zcode authored the profile under the retained native Goal. Wrapper timeouts
are not native Goal completion. Sol separately tightened duplicate/wrong-target
test assertions and corrected installed-repository portability. The previous
V2 acceptance missed the external-only test paths and is superseded. V3's
no-baseline output overstated unchanged-row verification; V4 reports honestly
whether that optional comparison ran. Frozen earlier packages remain evidence,
not the delivered version.

## Root verification and limits

`python3 -B tests/test_pm_repository_local_profile_mapping.py` passed in the
actual worktree. A second invocation supplied `PM_REPOSITORY_LOCAL_BASE_TOUCH`
from `git show HEAD:Plans/touch_closure.json` at `b7d5ae5b7` and passed the full
unchanged-row/unrelated-profile comparison, including the app-update profile.
The specialized pairs reject empty required action/result details while the
old common types accept them. This script performs its assertions directly;
it is not reported as a discovered unittest suite.

`python3 -m unittest tests.test_pm_application_update_local_binding tests.test_pm_touch_closure_source`
passed all 62 tests. `git diff --check` passed.

No whole companion gate rerun is claimed for this profile/test-only step.
All three Touch rows remain partial. The separate F3-529 owner-note wording
still says two profiles while its authoritative text and acceptance criteria
name three; this bounded profile task does not edit that Markdown residual.
No native execution, main landing, governance reseal, readiness admission or
whole-packet closure is claimed.
