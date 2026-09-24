# Doctor census and bounded Run All source adoption

Repair base: `bb47b50a780d5a9c6349c19be847ac4675401ff2`.

`Plans/newtools.md` N2-152 now explicitly retains all seven September 3 diagnostic groups and their composite dimensions, plus explicitly requested finite Run All composition. Existing owner/read-only boundaries, currentness, coalescing, per-check limits, resource admission, optional-Off health and draft-required-only Onboarding remain mandatory. Future scheduling stop, supported owner cancellation and viewer detachment are distinct. The old unbounded `cmd.doctor.run_all` stays rejected and unregistered.

`Plans/OpenCode_Coverage_Matrix.md` narrowly updates skill-validation and formatter-availability recommendations to the adopted Doctor requirement. Other audit recommendations and historical OCM-010/011 facts remain; no proposed formatter ID is registered.

Source root:
`/mnt/Cursor/PuppetMaster-Evidence/misc/packet-gap-closure-20260910/sources/onboarding-tour-20260903/custody/raw/PKT-01-pm-onboarding-tour-newbie-first-addendum-packet-2026-09-03/PM_Onboarding_Tour_Newbie_First_Addendum_2026-09-03/reference/PM_Onboarding_Doctor_Newbie_First_Complete_Handoff_2026-09-03(1).zip.contents/PM_Onboarding_Doctor_Newbie_First_Complete_Handoff_2026-09-03/`.

- `07_DOCTOR_HEALTH_AND_REMEDIATION.md`, SHA-256 `a17ec624d285dfeaa023cc7ab39aea4374f97b0f00b457ae0e85002be87f8d26`.
- `machine/doctor_check_matrix.json`, SHA-256 `1cffebd503698e9b46de120aa6bdf7f877ea31a5a031913b1cd37a40fdef1cd5`.
- `10_ACCEPTANCE_FAILURE_AND_USABILITY_MATRIX.md`, SHA-256 `c3a05678c005058801ec34b3118014305559cc57bbd460c2a3586919ce38da54`, Doctor scenarios 76–83.

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`.

- `doctor-census-run-all-prose-verification.json`, SHA-256 `f638f4af733826eda4f8c54df42b584b48dd8b121cf9aeaaa311b01bf99026d4`: exact two-owner/derived scope; only N2-152 and OCM-015 semantic metadata changed, six criteria added (26,244 total), all 6,719 PlanUnit IDs retained. Index, shard and whitespace checks pass. Readiness remains blocked for runtime certification.
- `server_forge_backup/doctor-census-prose-independent-review.json`, SHA-256 `4d7cd8e374497dcb615297b307fbc2e2c767f7153e9c59e61af36e985a27d7fc`: independent full raw-source and two-file delta review, no findings; verifies seven groups, 52 occurrences and 51 distinct tokens with `app_update` intentionally repeated.

The source census is not a runtime descriptor count. Exact owner-backed descriptor coverage, finite-set/controller schema and causal fixtures remain separate companion work; generic single-check schema validity cannot prove those obligations. This owner-prose step does not implement probes or UI, change command/local-action identities, admit events/storage, refresh governance, prove complete packet closure or land main.
