# ONB-CANON-001: current-path migration criterion

Status: repaired on the review repair branch; not an all-packet closure or main-landing receipt.
Review base: `b688606877a9b67b0a2f44e9093f087037a94ab1`.

`PWIZ-022` still described migration into a nine-/six-stage draft while its own current
progress criterion, `PWIZ-021`, and the machine contract use an eleven-stage main path.
The explicit Project-deferred path legitimately remains distinct; predecessor nine-stage
main records are migration inputs, not current producers.

The corrected criterion consumes the three existing path definitions. It preserves an
unconfirmed review for unresolved work, retained owner receipts, and no replay of owner
work. No stage, action, schema, command, event, storage family, or product choice is added.
The new static regression checks this owner-to-schema relationship.

## Verification

- Baseline onboarding phase suite: 42 tests, one failure.
- Repair onboarding phase suite: 43 tests, the same one failure, no new failure keys.
- Existing failure: `OnboardingStorageTests.test_existing_family_and_retention_census_is_unchanged`,
  actual family count 294 versus the test's expected 90. The repair does not change the
  registry, the expected count, or governance bindings.
- New migration criterion regression passes independently.
- Shard check: 99 documents and 2,720 shards, no failures.
- Plan index validation passes; only `PWIZ-022` changes substantively. Other changed
  index rows belong to Planning Wizard and reflect its source hash or shifted line locations.
- No unrelated owner shards or document cards change. `git diff --check` passes.

The first index generation lacked an ignored Event Authority audit input. Its result was
not committed. The existing shared-checkout input was copied unchanged to external evidence
and supplied through an ignored local link. Every artifact matches the existing receipt;
receipt SHA-256 is `af0bce7c65932afb2165cf64c0bd06c69f65e9a4b2007dd6ccc0125b56368f0e`.
The final generated readiness report retains existing blockers and adds the expected
`event_authority_currentness_source_drift` for `Plans/Planning_Wizard.md`; its existing
`pnc019_source_hash_stale` row now names the changed source hash. No binding was refreshed,
and no runtime/readiness status was upgraded.

Evidence:

- `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/onboarding_tour_doctor/batch001.json`
  SHA-256 `96c65dfd8b6a18df7871b585478ca2d5a5a8d7ac2173e0eb60bb5ff0802bc318`.
- `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/onboarding-migration-repair-verification.json`
  SHA-256 `dc281d2407f6dcc5734007a6d2d94c93830f6989dceca6a1b79beb6c22d23470`.

- `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/browser_scm_performance/onboarding-migration-independent-review.json`
  SHA-256 `46d6ee5a799b7839591d4db4e31ae6a8b1679862f7ac3a3d17d254112a40dae2`.

Independent bounded review reported no findings and passed four focused tests covering the
new regression, deferred path, committed resume, and no replay/fabricated review.
Before landing, rebase/re-adjudicate against then-current main
under the landing lock and run complete landing checks. The earlier scoped exception for
Commands System/UI Command Catalog/Touch Closure hashes is not authority to waive findings
for this new repair. Request the designated governance owner's later reseal; do not reseal
as part of this repair. Native migration/recovery and GUI proof remain outstanding.
