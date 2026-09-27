# Project creation recovery: owner composition and remaining contract work

The September 3 handoff requires recovery after remote repository creation succeeds but local setup fails (`01_COMBINED_HANDOFF.md:103-124`; acceptance matrix rows 60–62). PJCT-007 now owns the provider-neutral composition; PWIZ-021 consumes it. PJCT-008 remains the GitHub-specific consumer.

Remote timeouts reconcile through Forge/SCM before another create. Verified remote identity, the original reviewed draft and operation, return context and settled effects survive local failure. Unknown is not failed; it permits neither speculative deletion nor invented repository identity. No half-ready Project or provider-setup commit binding is published.

- **Open Repository:** uses existing `cmd.forge.repository.open_in_browser` with the verified binding.
- **Continue Setup:** remains unavailable until an explicit Project recovery/resume transition joins the original operation, exact reviewed draft, verified Forge result and settled/remaining effects. Replaying the original idempotency key only re-observes its terminal result; it cannot advance a rejected result. Generic runtime retry, auth resume and ObservableWork are not substitutes.
- **Delete Repository:** remains undispatched until Forge admits the destructive action and its exact-target permission/confirmation, command, catalog, wiring and companion contracts. It is never automatic rollback, speculative cleanup, or authorized by source sign-in.

Two Sol review passes corrected the original GitHub-only placement, premature actionable Delete promise and implicit replay-as-resume claim. The final prose passes review; **F-02 remains open for typed integration**. This is required owner work from an existing requirement, not a new binary product choice.

Remaining companions: Project-owned typed recovery context/result and explicit resume admission; currentness and exact-target route availability; Forge delete admission; positive/negative fixture joins; timeout→reconcile and verified-create→local-failure→resume tests; Onboarding/GUI consumer cases. Existing `project_action_result` and `automatic_preparation_owner_projection` fields alone do not prove these joins. No phantom command, new result enum or receipt family was introduced in this prose pass.

The current selected HTML is preserved. Its absence of these complete owner-backed recovery actions is recorded rather than concealed by simulated success. Review evidence is indexed in `evidence.json`.
