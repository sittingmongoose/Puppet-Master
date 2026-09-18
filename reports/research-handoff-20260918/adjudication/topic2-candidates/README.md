# Topic 2, Part 1 — currentness check and correction test for the Azure DevOps union

**I am an Opus 5 agent** (`claude-opus-5[1m]`). I ran no arm and I did not build the union. I re-read every
owner and consumer passage the union cites against current `main`, re-verified every provider fact in the arms'
own cached sources, applied continuation 3's correction test to each of the 32 correction-shaped propositions,
merged the ones that are the same defect, and re-hashed all five evidence documents. **No canon was edited and
no Plans branch exists.** A separate reviewer confirms this list before any landing branch.

Owner text scored against: `Plans/Azure_DevOps_Integration.md` on `4f5eda0d18`, sha256
`3ae59c02…`, 219 lines — **byte-identical to the adjudication's snapshot**, so nothing
in the union went stale between adjudication and this check.

## The limit this record inherits, stated first

> The union rests on five compare documents covering five of 115+ discovered leads.
> It supports per-defect claims anchored to passages; it does NOT support a recall estimate for Plans/Azure_DevOps_Integration.md.
> Whole PlanUnits - ADO-004 builds and pipelines, ADO-005 Settings placement and migration, most of ADO-001 container hierarchy - were never compared by either arm.
> 26 corrections is a lower bound with an unknown and probably large remainder.

## Headline

| | |
|---|---:|
| Propositions examined | **32** |
| **Corrections to land** (after merging) | **26** |
| … in the Azure owner or its own fixtures | 12 |
| … in the common forge contracts | 13 |
| … re-owned out of Azure entirely | 1 |
| Already covered by current canon | **0** |
| Reclassified to a decision card | 1 |
| Unverified and set aside | **0** |
| Rejected | 0 |
| Merged pairs | 2 (7 propositions → 2 corrections) |

**Nothing was covered.** I re-read every cited owner passage and every consumer passage — forge acceptance
packet, command catalog, wiring rows, fixtures — and the defect stands in all 32 cases. **Nothing was left
unverified.** Six provider facts were absent from the compare jobs' own source caches on a first pass; all six
are present in earlier jobs of the same runs, which the compare jobs inherit by `sources.md`, and I recorded
the corrected loci. All five evidence documents re-hash to the union's values.

## Verdict table

Ranked in the adjudicator's order, the six top candidates first.

| # | ID | Verdict | Lands in | The promise | The contradiction (one line) |
|---|---|---|---|---|---|
| 1 | **TA-038** | **correction to land** | Azure owner | ADO-003 validation_surfaces :110 and ADO-005 :174 name 'Azure PR revision/thread/policy fixtures' and 'Plans/azure_devops_integration_fixtures.json' | Verified on main: azure_devops_integration_fixtures.json is 73 lines holding exactly two provider_adapter_profile values and one repository_binding negative |
| 2 | **TA-008** | **correction to land** | Azure owner | FGI-003 acceptance :142 'Every provider operation resolves one capability entry before dispatch.' | Verified on main: capability_name contains review_versions; schema conditional /$defs/command_request/allOf[7] pins requested_capability to the const 'review_versions' for cmd.forge.review.version.open AND .compare; both are in th… |
| 3 | **TA-010** | **correction to land** | Azure owner | FGI-003 acceptance :142 (as above) and the brief's policies/checks sentence. | Verified on main: repository_policy is a capability_name token distinct from checks; /$defs/command_request/allOf[18] pins requested_capability const 'repository_policy' for cmd.forge.repository.policy.preview AND .apply; command_… |
| 4 | **TA-022** | **correction to land**<br>merged → `C-CHECKS-BINDING` | common forge contracts | ADO-003 acceptance :107 'PR evidence binds exact immutable revision and policy/check identities.' | Verified on main: /$defs/command_request/allOf[17] requires target.provider_review_id AND target.review_head_oid matching ^[0-9a-f]{40,64}$ and pins currentness.state to 'current' |
| 5 | **TA-023** | **correction to land**<br>merged → `C-CHECKS-BINDING` | common forge contracts | FGI-004 acceptance 'Review evidence cannot silently transfer to a new head revision' | Two check families sit behind one visually uniform list with no field saying which is which: Azure Git statuses and the per-iteration statuses route are revision-bound (released at api-version 7.1 on .../iterations/{iterationId}/s… |
| 6 | **TA-024** | **correction to land**<br>merged → `C-CHECKS-BINDING` | common forge contracts | ADO-003 acceptance :107 (as above) and the brief's P1. | For Azure the head OID does not identify what the check ran against: the policy-evaluation Context interface carries lastMergeCommitId, lastMergeSourceCommitId and lastMergeTargetCommitId (plus buildIsNotCurrent and isExpired), be… |
| 7 | **TA-019** | **correction to land**<br>merged → `C-CHECKS-CARRIER` | common forge contracts | The frozen product brief's policies/checks sentence: see the branch policies and status checks Azure enforces on the target branch, 'and whether each … | Required-versus-advisory has no carrier anywhere in the corpus: 'isBlocking', 'mergeable' and 'blocking check' return zero matches in the forge schema, and neither closed reason-code enum carries a blocking/advisory notion |
| 8 | **TA-020** | **correction to land**<br>merged → `C-CHECKS-CARRIER` | common forge contracts | ADO-003 negative constraint :118 'Do not flatten policy failure into generic unavailable.' | normalized_status is an unconstrained string with minLength 1 and no pinned mapping anywhere in the corpus, and the only adjacent enum - pipeline_projection.state - is an 8-value pipeline-run vocabulary (queued|running|waiting|suc… |
| 9 | **TA-021** | **correction to land**<br>merged → `C-CHECKS-CARRIER` | common forge contracts | SCS-016 negative constraint 'Do not flatten native policy, child-pipeline, environment, gate, stage/job, trace, artifact, or vocabulary extensions.' | One wire word carries two provider meanings: in GitStatusState, notApplicable BYPASSES the policy requirement (the merge-gating table marks it with a tick and 'When a required policy is set to Apply by default, you can post notApp… |
| 10 | **TA-018** | **correction to land**<br>merged → `C-CHECKS-CARRIER` | common forge contracts | ADO-003 acceptance :107 'PR evidence binds exact immutable revision and policy/check identities' | pipeline_projection.checks is an array of opaque non_secret_ref strings and normalized_remote_record carries only free-string raw/normalized status, so 'policy identity' has no carrier |
| 11 | **TA-034** | **correction to land** | Azure owner | FGI-014 canonical_text: 'Azure Services and Server separate Repos, Pipelines, organization/project/account, auth/version, branch policies, deployment … | Verified on main: 'TFVC' occurs ZERO times in Plans/Azure_DevOps_Integration.md - the sole canonical owner for Azure repository identity and Azure-specific degradation |
| 12 | **TA-001** | **correction to land** | Azure owner | ADO-003 canonical_text :100 'A new head creates a new immutable review revision and stales approvals/check evidence' | Internally inconsistent inside the frozen Plans: review_revision makes identity a TRIPLE - base_revision, head_revision and merge_base_revision are all required on an additionalProperties:false object - and the staling trigger nam… |
| 13 | **TA-005** | **correction to land** | common forge contracts | FGI-003 preserved exact token 'partial data is never complete'. | Truncation is a distinct axis from staleness and review_revision has no room for it: the object is additionalProperties:false with no completeness field, while pipeline_projection.currentness and command_currentness.state both car… |
| 14 | **TA-035** | **correction to land**<br>narrowed | Azure owner | ADO-004 acceptance :140 'Async mutations expose ObservableWork and terminal provider receipts' | The obvious reading is that the product cannot have the reported bug, because cmd.forge.review.merge carries no merge-strategy field and 'merge_strategy' returns zero matches in the forge schema |
| 15 | **TA-003** | **correction to land** | Azure owner | Section 0 :11 'Branch policies/status checks ... map into common checks/pipeline projections without losing provider IDs, policy identity, review revi… | Branch policies are configured per target ref and git/policy/configurations resolves them server-side by refName, so a retarget changes WHICH policies apply at all: previously-satisfied required reviewers may cease to be required … |
| 16 | **TA-004** | **correction to land** | common forge contracts | ADO-003 negative constraint :118 'Do not flatten policy failure into generic unavailable' | review_revision.evidence_state is a closed four-value enum {current, stale_head_changed, revalidation_required, invalid} in which only stale_head_changed names a cause, so at least five distinct and independently verified Azure st… |
| 17 | **TA-007** | **correction to land**<br>restated | common forge contracts | FGI-004 acceptance 'Thread resolution is scoped to one immutable review revision and actor.' | review_thread requires exactly one review_revision_ref, but an Azure thread position is a projection onto the (left, right) iteration window the caller asked for, not a stored fact: Threads - List takes $baseIteration as the left … |
| 18 | **TA-009** | **correction to land**<br>repair shape open | common forge contracts | FGI-003 acceptance :142 'Every provider operation resolves one capability entry before dispatch' | capability_envelope is keyed on repository_binding_ref and every FGI-003 input is at or above repository scope, but Azure decides revision support PER PULL REQUEST: a PR with more than 100,000 modified files does not support itera… |
| 19 | **TA-011** | **correction to land**<br>restated | common forge contracts | FGI-003 acceptance 'Missing scope, tier, version, rate, offline, managed policy and unsupported states remain distinguishable' | provider_adapter_profile.unsupported_reason_codes is typed as an array of non_empty_string, so the code every profile declares is not drawn from - and not checked against - the closed disabled_reason_code (54 members) or error_cod… |
| 20 | **TA-012** | **correction to land** | Azure owner | ADO-002 acceptance :76 'Organization/collection, project, repository, policy and build access failures remain distinguishable.' | The Services fixture declares policy_scope_missing, but Azure DevOps has no read-side policy permission: the Git Repositories security namespace's policy bits - EditPolicies, PolicyExempt, PullRequestBypassPolicy - are all write/e… |
| 21 | **TA-013** | **correction to land** | Azure owner | Section 0 :11 policy identity survives the mapping | The Plans constrain the OUTPUT of the policy mapping and say nothing about the DERIVATION |
| 22 | **TA-016** | **correction to land** | common forge contracts | ADO-003 :99 'branch-policy/check identities' | cmd.forge.repository.policy.preview requires policy_resource_id, provider_patch_ref and expected_policy_revision, and identifies its subject with ONE opaque string whose only worked example in the corpus is 'branch-policy:main' - … |
| 23 | **TA-017** | **correction to land** | common forge contracts | FGI-003 preserved exact token 'partial data is never complete' | Both Azure listing endpoints page ($top + continuationToken on git/policy/configurations, $top/$skip on policy/evaluations), and there is no policy-set equivalent of the flag-plus-cursor the corpus already requires elsewhere: disa… |
| 24 | **TA-025** | **correction to land** | common forge contracts | SCS-016 canonical_text names canonical URL among the mandatory fields for a materialized Check record. | normalized_remote_record.canonical_url is required with format uri, and PolicyEvaluationRecord has no URL field at all - only _links and configuration.url, documented as 'The URL where the policy configuration can be retrieved', w… |
| 25 | **TA-026** | **correction to land**<br>repair shape open | common forge contracts | ADO-003 acceptance :108 'Votes/approvals cannot transfer silently after head change' | forge_integration_contracts.schema.json has 46 $defs and NOT ONE of them matches vote, approval, reviewer, check or policy |
| 26 | **TA-029** | **correction to land** | common forge contracts | ADO-004 canonical_text :132-133 'API compatibility pins Services or Server variant, host/version, adapter/catalog, endpoints/scopes/features and rate.… | api_compatibility.endpoints is {type: array, items: non_empty_string, uniqueItems: true} - a bare name list - carried alongside ONE adapter_version, ONE catalog_generation and ONE openapi_or_contract_sha256 |
| 27 | **TA-030** | **correction to land**<br>depends on TA-010 | Azure owner | ADO-002 canonical_text :68 'Azure DevOps Server capabilities require a current signed host/version support entry' | Which policies apply is branch-keyed (repositoryId, refName) at GA 7.1; whether each passes is review-keyed (projectId, pullRequestId) at 7.1-preview.1 |
| 28 | **TA-032** | **correction to land** | common forge contracts | ADO-002 canonical_text :68 (signed host/version support entry) | provider_instance_profile - the one typed record in the corpus carrying normalized_host, api_root, api_base_path, ssh_host, private_ca_ref, detected_product, product_version, api_schema_version, separate api_state and git_transpor… |
| 29 | **TA-033** | **correction to land** | Azure owner | ADO-001 canonical_text :36-37 'Project is mandatory and no path, remote URL, display name or focus may replace the hierarchy' | The repository gets two identifiers - a human repository_slug AND a required provider_repository_id - and the project gets one |
| 30 | **TA-036** | **correction to land**<br>narrowed | Azure owner | ADO-004 canonical_text :131 'ObservableWork for run/retry/cancel' | The frozen contract has no per-PR policy-evaluation identity, no retry target kind for one, and no way to state that a retry has a destructive side effect on a third object |
| 31 | **TA-042** | **correction to land** | Forge_Integrations (re-owned) | FGI-015 acceptance criterion 3 verbatim: 'Every provider profile identifies issuer, allowed host, setup method, non-secret token owner, requested scop… | Both profile schemas are additionalProperties:false and neither has an issuer, allowed-host, token-owner, scopes, refresh/revoke or role field |
| 32 | **TA-002** | reclassified | decision card | ADO-003 negative constraint :118 against flattening | The provider publishes seven revision causes with an EMPTY description for every one, and the reference client collapses anything unrecognised to the most reassuring one: IterationReason is bit-valued with Push = 0, and the accumu… |

### The two merges

**`C-CHECKS-BINDING` — The checks contract keys evidence to a head OID the provider neither accepts nor evaluates**  
Members: `TA-022`, `TA-023`, `TA-024`.  
All three are one defect seen from three sides: the contract demands a commit key (TA-022), the corpus cannot say which of the two check families a row came from (TA-023), and the head OID is the wrong key even when it is available because Azure evaluates the merge (TA-024). One repair fixes all three: a declared binding kind per check row, plus the merge triple rather than a head fence for the review-bound family.

**`C-CHECKS-CARRIER` — There is no typed gate record, so "whether each one currently passes" cannot be answered**  
Members: `TA-018`, `TA-019`, `TA-020`, `TA-021`.  
All four land on the same missing object. TA-018 is the absent carrier, TA-019 the absent required-versus-advisory field on it, TA-020 the absent status vocabulary and forbidden-mapping rule, TA-021 the absent source-enum field that keeps the two notApplicables apart. Four separate edits to one record; one correction.

## What I found that the union did not

**NEW-01 (attaches to TA-033).** repository_locator.project is typed {type: [string, null]} while sitting in the required list, so a repository_binding can carry an explicit null project today and still validate - a direct contradiction of ADO-001 "Project is mandatory". The Azure negative fixture OMITS the key rather than nulling it, so nothing catches this.  
Passage: `Plans/forge_integration_contracts.schema.json $defs.repository_binding.properties.repository_locator`. Repair: Drop null from the type. Two characters.

## Union claims that did not survive the re-read

None of these kills a proposition; each requires a sentence to be rewritten before landing.

**FALSE-01 — TA-007.** The union says: "command_target already requires left_review_revision_ref AND right_review_revision_ref for cmd.forge.review.version.compare".  

On `main`: The conditional at /$defs/command_request/allOf[8] declares both properties and does NOT place them in `required`. The claim is false as written; the true weaker form is that the corpus carries both fields and the compare conditional names both.  
Effect: The defect stands on the FGI-004 promise alone. The contradiction sentence must be rewritten before landing.

**FALSE-02 — TA-011.** The union says: "the same field holds missing_scope (GitLab) and pipeline_disabled (Bitbucket), which ARE enum members".  

On `main`: missing_scope IS a disabled_reason_code member. pipeline_disabled is in NEITHER disabled_reason_code (54 members) NOR error_code (58 members).  
Effect: The corrected finding is stronger and is not Azure-specific: the field is unchecked for every provider and at least two of three non-Azure declarations are also off-enum. The repair moves out of the Azure owner into the common schema.

**CITE-01 — TA-017.** The union says: DL-054 flag-and-cursor rule at Source_Control_System.md:1085-1094.  

On `main`: The tokens parent_refs_truncated and parent_expansion_cursor_ref and the negative constraint "Do not present a truncated parent list as complete" are at :1114-1123, :1167 and :1172. Decision_Log.md carries them at :3760-3761 and :3844.  
Effect: Citation corrected; the substance holds.

## Provider facts I verified myself

Every fact below was re-found in the arms' own cached sources under the run directories (read-only), not taken
from the adjudicator's list. Loci are relative to `~/PM-Experiments/topic2-20260917/`.

| ID | Fact | Locus |
|---|---|---|
| PV-01 | IterationReason publishes exactly seven values, bit-valued, with Push = 0: {Push=0, ForcePush=1, Create=2, Rebase=4, Unknown=8, Retarget=16, ResolveConflicts=32} | `arm-s/runs/topic2-s-full-20260917-051531/jobs/J0014-reconcile/workspace/research-evidence/sources/S00009/text.txt:3107-3115` |
| PV-02 | The node client accumulator is `if (resultPart) { result \|= resultPart; }`, so an unrecognised enum name contributes nothing and the result stays 0 = Push | `arm-s/.../jobs/J0014-reconcile/workspace/research-evidence/sources/S00010/text.txt:273,289-291` |
| PV-03 | GitPullRequestIteration carries sourceRefCommit, targetRefCommit and commonRefCommit; commonRefCommit is the first common commit of BOTH refs | `arm-s/.../jobs/J0015-compare/workspace/research-evidence/sources/S00035/text.txt:259-261` |
| PV-04 | Retarget carries newTargetRefName / oldTargetRefName and moves no head | `arm-s/.../jobs/J0015-compare/workspace/research-evidence/sources/S00035/text.txt:276` |
| PV-05 | Build-validation policy expiry: "After <n> hours if <branch name> has been updated: This option expires the current policy status when the protected branch updates ..." - a staleness with no… | `arm-s/.../jobs/J0007-implementation/workspace/research-evidence/sources/S00034/text.txt:524-526` |
| PV-06 | Truncation conventions: hasMoreCommits, commitTooManyChanges, commentTruncated, and nextSkip/nextTop on the changes route | `arm-s/.../jobs/J0015-compare/.../S00035/text.txt:269,181,175 and jobs/J0014-reconcile/.../S00009/text.txt:2018` |
| PV-07 | Threads - List takes $iteration (right side) and $baseIteration (left side) at api-version 7.1; CommentIterationContext and changeTrackingId are separate objects | `arm-s/.../jobs/J0015-compare/.../S00052/text.txt:32 ; S00039/text.txt:215 ; jobs/J0008-history/.../S00055/text.txt:704` |
| PV-08 | "If the PR being created contains more than 100,000 modified files ... that PR won't support iterations" | `arm-s/.../jobs/J0015-compare/.../S00041/text.txt:100` |
| PV-09 | Git Repositories security namespace 8adf73b7-389a-4276-b638-fe1653f7efc7 publishes PolicyExempt, EditPolicies and PullRequestBypassPolicy - all write/exempt/bypass, no read bit; policy/evalu… | `arm-s/.../jobs/J0012-reconcile/.../S00041/text.txt:118,127,131,135 ; jobs/J0015-compare/.../S00035/text.txt:88` |
| PV-10 | git/policy/configurations is api-version 7.1 with repositoryId, refName, policyType, $top, continuationToken; policy/evaluations is 7.1-preview.1 with artifactId, includeNotApplicable, $top,… | `arm-s/.../jobs/J0016-compare/.../S00073/text.txt:33 ; arm-h2/.../jobs/J0020-compare/.../S00074/text.txt:33-35` |
| PV-11 | autoCompleteIgnoreConfigIds verbatim: "List of any policy configuration Id's which auto-complete should not wait for. Only applies to optional policies (isBlocking == false). Auto-complete a… | `arm-s/.../jobs/J0016-compare/.../S00094/text.txt:500-503` |
| PV-12 | PolicyEvaluationRecord = {_links, artifactId, completedDate, configuration, context, evaluationId, startedDate, status} - no commit, iteration or revision field; PolicyEvaluationStatus = que… | `arm-h2/.../jobs/J0020-compare/.../S00031/text.txt:214-263` |
| PV-13 | GitStatusState.notApplicable is "Bypasses policy requirement" in the merge-gating table, against PolicyEvaluationStatus.notApplicable = "The policy does not apply to this pull request" - one… | `arm-h2/.../jobs/J0020-compare/.../S00041/text.txt:48 and S00042/text.txt:48 against S00031/text.txt:260-261` |
| PV-14 | Pull Request Iteration Statuses - List is released at api-version 7.1 on .../iterations/{iterationId}/statuses | `arm-h2/.../jobs/J0020-compare/.../S00075/text.txt:30 ; arm-s/.../jobs/J0014-reconcile/.../S00023/text.txt:30` |
| PV-15 | The policy-evaluation Context interface carries lastMergeCommitId, lastMergeSourceCommitId, lastMergeTargetCommitId, plus buildIsNotCurrent, isExpired and wasAutoRequeued | `arm-s/.../jobs/J0008-history/workspace/research-evidence/sources/S00074/text.txt:81-95` |
| PV-16 | configuration.url = "The URL where the policy configuration can be retrieved"; the evaluation record has no human-facing URL | `arm-s/.../jobs/J0016-compare/.../S00072/text.txt:213` |
| PV-17 | IdentityRefWithVote[] on the PR; isReapprove = "Indicates if this approve vote should still be handled even though vote didn't change" | `arm-s/.../jobs/J0015-compare/.../S00040/text.txt:67,152` |
| PV-18 | The policy artifact template is vstfs:///CodeReview/CodeReviewId/{projectId}/{pullRequestId}; renovate's own test asserts the literal "vstfs:///CodeReview/CodeReviewId/undefined/${pullReques… | `arm-s/.../jobs/J0016-compare/.../S00072/text.txt:32 ; jobs/J0007-implementation/.../S00023/text.txt:1` |
| PV-19 | "Specify the strategy used to merge the pull request during completion. If MergeStrategy is not set to any value, a no-FF merge will be created if SquashMerge == false ..." | `arm-s/.../jobs/J0016-compare/.../S00094/text.txt:225` |
| PV-20 | "Although any policy evaluation can be requeued, at present only build policies perform any action in response. Requeueing a build policy will queue a new build to run (cancelling any existi… | `arm-h2/.../jobs/J0020-compare/.../S00044/text.txt:33-34` |
| PV-21 | PolicyConfiguration carries isBlocking, isEnabled, isDeleted, revision (number), id (number) and type | `arm-s/.../jobs/J0008-history/.../S00074/text.txt:70-80` |
| PV-22 | REST API versioning page banner covers Azure DevOps Services \| Azure DevOps Server \| Azure DevOps Server 2022 | `arm-s/.../jobs/J0015-compare/.../S00041/text.txt:27 ; arm-h2/.../jobs/J0020-compare/.../S00039/text.txt:1` |

## Evidence re-hash

| Document | sha256 | matches union |
|---|---|---|
| arm_s_J0015 `notes.md` | `02ad7d5fdddb4476…` | yes |
| arm_s_J0016 `notes.md` | `77535d68f6d6728c…` | yes |
| arm_s_J0017 `notes.md` | `4aa56396205aaf7f…` | yes |
| h2_J0019 `notes.md` | `44c33e6f17006e37…` | yes |
| h2_J0020 `notes.md` | `d3ca42089d70d535…` | yes |

## Files

| File | Contents |
|---|---|
| `topic2-part1-verdicts.json` | The 32 verdicts in full: promise, contradiction, passages, provider-source verifications, my additional findings, repair, evidence hashes, merges |
| `README.md` | This document |
| `manifest.json` | SHA-256 manifest of this directory plus the canon files I read on `main` |
| `verdicts.py`, `emit_record.py`, `emit_readme.py`, `build_record.py` | The generators, so the record is reproducible |
| `work/` | Intermediate extracts (corrections dump, provider-fact search output, hash base) |
| `PROGRESS.md` | Stage-by-stage progress note |


## Questions for Jared, one line each

1. Do the 13 corrections that land in the common forge contracts go on this Azure branch, or does the Azure branch land only the 12 that are the Azure owner's own and hand the rest to whoever owns `forge_integration_contracts.schema.json`?
2. TA-038: do we take the two-line honest amendment now (say the Azure fixtures are not yet written) or hold the whole list until the fixtures exist?
3. TA-026: add a vote/approval/reviewer carrier to the forge contracts, or amend ADO-003's two vote acceptance criteria to stop promising what no shape can bind?
4. TA-009: resolve `review_versions` at review scope with the binding entry as a ceiling, or let a review carry no revision model behind a typed capability limit?
5. TA-035 and TA-036: I narrowed both to prose corrections and pushed the merge-strategy field and the requeue command out to decision cards — is that the split you want, or do you want the fields specified now?
6. TA-042 is not an Azure defect at all (FGI-015 states an acceptance criterion its own two closed schemas cannot satisfy) — do you want it re-filed against `Plans/Forge_Integrations.md` or dropped from this lane?
7. TA-011 turned out not to be Azure-specific either (the reason-code field is unchecked for every provider, and Bitbucket's `pipeline_disabled` is also off-enum) — same question: re-file or drop?
8. NEW-01 is a two-character fix I found that the union missed (`repository_locator.project` is nullable while ADO-001 says project is mandatory) — take it with TA-033 or as its own one-line change?
9. The union rests on five compared leads out of 115+ discovered; 26 corrections is a lower bound with a large unknown remainder — do you want a second pass over the never-compared PlanUnits (ADO-004 builds/pipelines, ADO-005 Settings/migration, most of ADO-001) before any of this lands?

## The four product choices, one line each, for decision cards

- **TA-014 — nothing in the closed 43-command set READS the branch policies guarding a branch.** The two policy commands are a two-phase mutation and `cmd.forge.review.checks` is PR-scoped, so the owner must either narrow the promise to "on a pull request", which is what the Plans already say, or add a read command; the two arms disagreed on the disposition.
- **TA-027 — under section 7.1 read literally, every Azure approval is stale on first observation.** No Azure vote carries a revision identity, so the Plans must choose between observation-time binding (record the revision current when PM observed the vote, labelled PM-observed rather than provider-asserted) and never attributable (render Azure votes un-versioned, which makes ADO-003's own acceptance criteria unmeetable).
- **TA-040 — decide what the Policies/Checks list contains when one check appears on two provider surfaces.** A status check is both a separate API surface and a branch-policy type, so statuses-only loses the requirement level, evaluations-only misses statuses no policy watches, and both-naively shows one check twice in two different states; the fork is undecided rather than decided wrongly, and it may not be implementable until a reliable join key is established.
- **TA-041 — give branch policies their own presentation, or one merged gate list with an enforcement column.** ADO-005 promises Azure appears with Policies/Checks but SCS-005 and FinalGUISpec both name only "current checks", so either keep one region and give its rows a source in {policy_evaluation, status_check} plus an enforcement column (cheapest, no new section vocabulary), or add a provider-neutral policies region and amend two consumer owners, risking the section proliferation SCS-005 forbids.

## Three things worth knowing before the reviewer reads the list

- **TA-010's repair is worth more than its one line suggests.** Declaring `repository_policy` on the Azure profiles gives the corpus the applicability-versus-status capability split that TA-030 needs, for free, because `repository_policy` and `checks` are already two separate tokens with two separate dimensions in `capability_dimensions`.
- **Six provider facts were missing from the compare jobs' own caches and are not missing from the run.** They live in earlier jobs of the same run (`J0007-implementation`, `J0008-history`, `J0012`/`J0014-reconcile`), which the compare jobs inherit explicitly through `sources.md`. Anyone re-checking this list should search the whole run, not the compare job.
- **The accounting files under the run directories change while you read them.** `arm-s/accounting/global_allowance.json` and `arm-h2/accounting/global_allowance.json` are a shared cost ledger that another thread's campaign runtime still rewrites. Every frozen output under `runs/` and `adjudication/` is untouched.
