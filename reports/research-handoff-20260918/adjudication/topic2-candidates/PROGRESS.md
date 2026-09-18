# PROGRESS — topic2 candidates Part 1 (2026-09-17)

Agent: Opus 5. Part 1 only (no canon edit, no Plans branch, run dirs read-only).

## Step log
- [x] Read BRIEF_TOPIC2_CANDIDATES_20260917.md
- [x] Read /mnt/Cursor/PuppetMaster/AGENTS.md
- [ ] Read adjudication union + scoring + README + manifest
- [ ] Re-read owner passages on current main
- [ ] Verify provider facts against arm cached sources
- [ ] Write verdict table + record + hash manifest

## 2026-09-18 step 2
- Read adjudication README + union JSON (73 findings, 32 corrections).
- Owner doc on main 4f5eda0d18 sha256 3ae59c02... MATCHES the adjudication snapshot exactly (219 lines). Plans/ working tree clean.
- Extracted 32 corrections to work/corrections.txt.
- NEXT: Plans-side re-verification of every cited passage; then provider-fact verification in arm caches.

## 2026-09-18 step 3 — Plans-side re-verification (schemas + fixtures) DONE
CONFIRMED on main 4f5eda0d18:
- capability_name enum HAS review_versions + repository_policy; azure fixtures declare NEITHER (0 occurrences). [TA-008, TA-010]
- review_revision additionalProperties:false; evidence_state closed {current,stale_head_changed,revalidation_required,invalid}; version integer min 1 required. [TA-004,TA-005,TA-009]
- review_thread requires exactly one review_revision_ref. [TA-007]
- CORRECTION TO THE UNION: the cmd.forge.review.version.compare conditional (/$defs/command_request/allOf[8]) declares left_/right_review_revision_ref but does NOT put them in `required`. TA-007's phrase "already requires left AND right" is FALSE as written; "already carries both and names both" is true.
- cmd.forge.review.checks conditional allOf[17] DOES require [provider_review_id, review_head_oid] pattern ^[0-9a-f]{40,64}$. [TA-022 CONFIRMED]; it does not require source_revision/target_revision [TA-024 CONFIRMED]
- cmd.forge.repository.policy.preview requires [policy_resource_id, provider_patch_ref, expected_policy_revision]; scalar. [TA-016]
- unsupported_reason_codes = array of non_empty_string (unchecked). disabled_reason_code 54 members, policy_scope_missing NOT in; policy_set_partial NOT in; pipeline_projection_partial IN. [TA-011,TA-012,TA-017]
- CORRECTION TO THE UNION: TA-011 says bitbucket's pipeline_disabled IS an enum member - it is NOT (not in disabled_reason_code nor error_code). Only gitlab's missing_scope is.
- provider_instance_profile.provider enum [forgejo,gitea]; all 10 fixtures forgejo/gitea. [TA-032]
- api_compatibility.endpoints = bare uniqueItems name array, no per-endpoint version. [TA-029]
- repository_locator = {organization_or_workspace, project(nullable), repository_slug}, all required, addlProps false. No provider_project_id anywhere in Plans (0 files). [TA-033]
- record_kind:"Check" used by ZERO fixtures in all of Plans/*.json. [TA-018, TA-038]
- forge_integration_contract_fixtures.json: exactly 1 review_revision fixture (gitlab), 1 review_thread, 1 pipeline_projection (azure_devops). No azure review/policy/check/evaluation/status fixture. [TA-038]
- TFVC: 0 in Azure_DevOps_Integration.md; present only in Forge_Integrations.md + forge_backup_tsnet_acceptance.json. [TA-034]
- merge_strategy/mergeStrategy/isBlocking/mergeable: 0 in forge schema. [TA-019, TA-035]
- normalized_remote_record: canonical_url required format uri; raw_status/normalized_status unconstrained strings; record_kind enum has Check. [TA-020,TA-021,TA-025]
NEXT: markdown consumer passages (FGI-014/015, DL-054, SCS-016, UI_Command_Catalog, Wiring_Matrix, FileSafe:225), then arm cached-source verification.

## 2026-09-18 step 4 — evidence hashes + provider-fact verification DONE
- All FIVE compare notes.md SHA-256 match the union exactly (J0015 02ad7d5f, J0016 77535d68, J0017 4aa56396, J0019 44c33e6f, J0020 d3ca4208).
- Consumer passages CONFIRMED on main: FGI-003:142 acceptance; FGI-004; FGI-014 TFVC clause + preserved token; FGI-015 acceptance #3 + instance-trust sentence; SCS-016 canonical URL + "Do not flatten native policy..."; SCS-017/DL-054 parent_refs_truncated + parent_expansion_cursor_ref + "Do not present a truncated parent list as complete" (at SCS :1114-1123/:1167/:1172, NOT :1085-1094 as cited); FileSafe.md:225 fail-closed scope rule; UI_Command_Catalog.md:12073-12074 names Azure as consumer of both review.version commands; Wiring_Matrix carries rows; Forge_Integrations 43-command set contains both; schema conditionals bind requested_capability const review_versions (allOf[7]) and repository_policy (allOf[18]); forgejo AND gitea profiles both declare repository_policy; capability_dimensions is the 18-tuple with checks and branch_policy separate; forge_backup_tsnet_acceptance.json:743-744/:2450-2459/:4456 E2E-010 TFVC fixture.
- PROVIDER FACTS VERIFIED IN CACHED SOURCES (research-evidence/sources/*/text.txt): IterationReason 7 values incl resolveConflicts; commonRefCommit; newTargetRefName; hasMoreCommits; commitTooManyChanges; commentTruncated; $baseIteration/$iteration at 7.1; 100,000-modified-files legacy PR; vso.code; autoCompleteIgnoreConfigIds verbatim incl isBlocking==true/false; evaluationId; PolicyEvaluationStatus; notSet; "Bypasses policy requirement"; Pull Request Iteration Statuses - List at 7.1 with iterationId route; targetUrl; IdentityRefWithVote; isReapprove; 7.1-preview.1; vstfs:///CodeReview/CodeReviewId/{projectId}/{pullRequestId}; "no-FF merge will be created"; "Requeueing a build policy ... cancelling any existing build"; "The URL where the policy configuration can be retrieved"; REST API versioning page.
- SIX PROVIDER FACTS NOT IN ANY CACHED SOURCE (arm prose only -> UNVERIFIED):
  1 TA-002 azure-devops-node-api Serialization.ts / IterationReason.Push=0 / if(resultPart)
  2 TA-004 build-validation expiry option "After <n> hours if <branch> has been updated"
  3 TA-005 paging leg nextSkip/nextTop (other 3 truncation facts ARE verified)
  4 TA-012 Git Repositories security-namespace policy bits (vso.code leg IS verified)
  5 TA-024 evaluation context lastMergeCommitId/lastMergeSourceCommitId/lastMergeTargetCommitId
  6 TA-033 provider leg: renovate test, PolicyApi.ts:374, issue #21822 (artifact template IS verified)
NEXT: write verdict table + record + hash manifest.

## 2026-09-18 step 5 — PART 1 COMPLETE
Record written to ~/PM-Experiments/topic2-candidates-20260917/:
  README.md (verdict table + merges + my new findings + union claims that failed + provider-fact table + evidence re-hash)
  topic2-part1-verdicts.json (32 verdicts in full)
  manifest.json (11 files, internal digest fa5b2c5e0d4d997f, + 13 canon files hashed on main 4f5eda0d18, + 5 arm evidence re-hashes)
  verdicts.py / build_record.py / emit_record.py / emit_readme.py / emit_manifest.py (reproducible generators)
RESULT: 26 corrections to land (12 Azure owner, 13 common forge contracts, 1 re-owned to Forge_Integrations),
        0 covered, 1 reclassified (TA-002 -> optional capability), 0 unverified, 0 rejected, 2 merges (7 props -> 2).
NOTE: ~/PM-Experiments/topic2-20260917/arm-*/accounting/global_allowance.json are being rewritten by ANOTHER
      thread's campaign runtime (shared cost ledger), not by me. All frozen run outputs under runs/ and
      adjudication/ are untouched. /mnt/Cursor/PuppetMaster Plans/ is clean; no branch was created.
STOPPED after Part 1 as instructed. A separate reviewer confirms the list before any landing branch.
