# R007 current-only assessment

Verdict: **quality failure**. Assessment coverage: **complete** (112 claim rows; all six prospective facets assessed). Report SHA-256: `b80a7669fef0485f08d0465a09f58847321552a02ed7f81ef8850029e3659cf2`.

Useful broad discoveries, but central result-state semantics and iteration scope incomplete; additional false scope requirement and unsupported determinate freshness/identity/SDK mandates.

All staged input hashes matched. No history, private method mapping, economics or candidate conversation was opened. Header treatment/control wording is an unavoidable blinding limit. A complete assessment does not imply all claims are supported; unresolved source attributions are explicit decisions, not silently passed. Candidate proposals marked UNEXECUTED remain proposals.

## Facets

| Facet | Coverage | Decision |
|---|---|---|
| AZR-01 | partial | Iteration integer identity retained, but dedicated /iterations/{iterationId}/statuses URI and sourceRefCommit/targetRefCommit/commonRefCommit roles are absent. R008 acknowledges addressing unresolved; R007 implies coverage via PR statuses alone. |
| AZR-02 | partial | Two check families are distinguished, but complete native state enums, pending/error/unknown treatment and the two scopes of notApplicable are omitted. U01 is a valid UNEXECUTED proposal, not completed current semantics. |
| AZR-03 | full | Exact CodeReview template retained; GUID strength independently supported by official CLI use of project.id plus uuid model. A separate Projects call is optional. |
| AZR-04 | full | isBlocking/isEnabled and result separation explicit; type-name versus instance-name presentation needs qualification. |
| AZR-05 | full | Git7.1 versus evaluations7.1-preview.1 preserved. R007 global7.2-stability assertion assessed separately; no reduction of facet. |
| AZR-06 | partial | top/skip/includeNotApplicable and partial-label principle retained; exact collection completeness strategy not completed. |

## Useful novelty

- Distinct vote labels and group roll-up (with vote5 policy caveat)
- Inert single-PR GET parameters
- Thread left/right context and tracking leads (equality condition missing)
- Commit diff default100 and merge-base option
- Items version/LFS capability
- Legacy configurations scope warning
- Exact Server REST matrix
- SDK/CLI read surfaces (preview-gap inference unsupported)
- Consumption throttling and size guidance
- Optional reviewer/compare/UI improvements

## Material claim inventory

| Claim | Report line | Outcome | Assertion | Judgment and source checks |
|---|---:|---|---|---|
| R007-C001 | 3 | qualified | Case/card/date/plan-blind input and read-only method description | Case/input pins and current carrier agree; card contains unavoidable treatment cue. Session behavior and sequence are deferred to stage 2. Sources: brief |
| R007-C002 | 6 | unresolved | No mutation, credentials, live calls or execution occurred | Scope matches brief; current-only sources cannot prove acquisition execution history. No completed live test is asserted. Sources: brief |
| R007-C003 | 10 | supported | RQ1-RQ9 cover versions, comparison, policies, gaps, context, auth, failure inputs, scale and simpler alternatives | These are research questions and relevant hypotheses, not completed provider findings. Sources: brief |
| R007-C004 | 22 | unresolved | Question/query links, dead ends and all source URLs exist in scheduling/acquisition files | Those files are history-gated and unavailable to this standalone report; labels alone do not prove records. Sources: current carrier / no exact source |
| R007-C005 | 22 | supported | Failed search is not proof of absence | Correct epistemic limitation; no corpus-wide negative finding follows from search failure. Sources: current carrier / no exact source |
| R007-C006 | 28 | supported | PR versions use iterations; iteration 1 is source head at creation; numeric 1..maximum IDs | Supported in iterationId parameter and iteration model. Sources: changes, A001 |
| R007-C007 | 26 | qualified | Every source push creates exactly +1 iteration for all PRs | Normal iteration-enabled behavior is supported, but supportsIterations and the >100000 modified-file exception qualify universality. Sources: changes, statusconcept, pr; failure=C028-iteration-support-omitted |
| R007-C008 | 31 | qualified | Target-branch movement never creates an iteration and changes merge-base comparisons | Target-dependent comparisons and build invalidation are real; frozen commonRefCommit/targetRefCommit and retarget/rebase reasons do not justify a blanket live recomputation rule. Sources: A001, changes, policy; failure=R007-target-movement-overstatement |
| R007-C009 | 31 | supported | Force-push/amend yields new review changeset rather than commit-count versioning | Force-pushed changesets preserve update history; IterationReason includes forcePush. Sources: review, A001 |
| R007-C010 | 32 | qualified | TFVC/GitHub semantics do not automatically transfer; using SHA list loses iteration anchoring | Scope caveat and design-risk inference are sensible; no comparative TFVC/GitHub contract was cited. Sources: brief, changes, threads |
| R007-C011 | 37 | supported | Iterations List URI, api-version=7.1 and includeCommits=true | Exact operation and optional parameter match. Sources: A001 |
| R007-C012 | 37 | supported | Single iteration GET is available at iterations/{iterationId} with 7.1 | Also pinned source X012 operation/URI, independently compatible with List model. Sources: A001 |
| R007-C013 | 40 | supported | Repository/project accept ID or name and vso.code reads iterations | URI parameter and Security scope match. Sources: A001 |
| R007-C014 | 41 | qualified | includeCommits can avoid N+1 fetches; always fetching commits can cost more | Reasonable implementation option; hasMoreCommits means same response is not guaranteed to include every commit. Sources: A001; failure=R007-commit-completeness-omitted |
| R007-C015 | 45 | supported | Changes URI supports $compareTo=0 common commit, explicit iteration, $top/$skip | Comparison and paging parameters match. Sources: changes |
| R007-C016 | 45 | supported | Single iteration vs predecessor and range 2-4 vs iteration 1 are client conventions | Owner README confirms exact examples; properly distinguished from provider contract. Sources: range |
| R007-C017 | 48 | qualified | Default compare means what would merge; pairwise means changes since last look | Helpful shorthand; mergeability itself requires more than change metadata and selected commits must stay pinned. Sources: changes, A001 |
| R007-C018 | 49 | supported | Client convention is optional UX and latest-only hides inter-version comparison | Correct scope and fit with earlier-work comparison requirement. Sources: brief, range, changes |
| R007-C019 | 54 | supported | Get PR documents skip/top/maxCommentLength as Not used; includeCommits/includeWorkItemRefs useful | All five parameter decisions match. Sources: pr |
| R007-C020 | 57 | qualified | Comment volume must be managed via Threads API | Threads are a relevant read path, but their List does not document a universal pager or automatic truncation control. Sources: threads, pr |
| R007-C021 | 61 | supported | Vote values 10/5/0/-5/-10 have five distinct documented labels | Exact scale is supported by current API 7.1. Sources: reviewers |
| R007-C022 | 61 | supported | Groups cannot vote directly; member votes roll up; isRequired marks required reviewers | IdentityRefWithVote.votedFor/isRequired match. Sources: reviewers |
| R007-C023 | 61 | qualified | Only 10 counts as full approval; 5 must never be rounded up | Preserving distinct labels is supported; provider docs also describe 5 as approving with optional suggestions. The third-party acceptance filter is not proof of Azure policy eligibility. Sources: reviewers, review; failure=R007-vote5-provider-filter |
| R007-C024 | 63 | unresolved | Identical vote semantics in 6.0/7.0/7.1 and secondary acceptance corroboration | 7.1 verified; report supplies no exact older-page or implementation URL in current carrier, so full cross-version identity is not independently established. Sources: reviewers |
| R007-C025 | 64 | supported | Reviewer list alone does not establish branch-policy satisfaction | Votes and policy evaluations are distinct. Sources: reviewers, A003, policy |
| R007-C026 | 69 | supported | PR statuses endpoint is 7.1, separate from policy evaluations, with vso.code/vso.code_status listed | Schema/API distinction and listed scopes are supported. Sources: A002, A003, statusconcept |
| R007-C027 | 69 | supported | Statuses do not return build/min-reviewer/comment-resolution policy evaluations | Separate resources and semantics; no-status cannot be read as absence of policies. Sources: A003, statusconcept |
| R007-C028 | 69 | qualified | Read-only client must query both families and label sources | Strong brief-fit recommendation for checks coverage, not a universal provider mandate or mandatory visual layout. Sources: brief, A003, statusconcept |
| R007-C029 | 72 | qualified | Highest-severity risk is no-checks UI from reading statuses alone | Plausible risk; severity ranking is editorial and no actual thin plan was supplied. Sources: A003, statusconcept |
| R007-C030 | 76 | supported | Policy artifact template is vstfs:///CodeReview/CodeReviewId/{projectId}/{pullRequestId} | Exact template preserved; distinct from PR resource artifactId. Sources: A003 |
| R007-C031 | 76 | supported | projectId inside artifact is GUID; project names cannot be substituted | Additional primary evidence: official CLI uses pr.repository.project.id; Projects model types ID uuid. Not inferred from A003 path parameter. Sources: cli, projects |
| R007-C032 | 76 | qualified | Names must first be resolved with a Projects API call | Resolving ID is valid; PR payload already carries project ID, so an extra Projects call is not required. Sources: cli, projects, pr; failure=R007-unnecessary-projects-call |
| R007-C033 | 76 | supported | Evaluations uses 7.1-preview.1; includeNotApplicable=true includes non-applicable; top/skip pages | Endpoint/version/options match. Sources: A003 |
| R007-C034 | 79 | supported | Non-applicable excluded by default; preview/Server compatibility needs attention | Correct version qualification and scope. Sources: A003, versionrules, version |
| R007-C035 | 80 | qualified | Name in artifact and stable-only client can fail; hiding non-applicable loses explanations | Artifact/version risk is supported; showing non-applicable is a product scope choice. Sources: A003, cli, projects |
| R007-C036 | 84 | supported | Policy types include min reviewers/reset, build trigger/expiry, comments, merge strategy, work items and auto reviewers | All listed families and configurable behaviors are documented; settings remain per policy. Sources: policy |
| R007-C037 | 84 | supported | Configurations 7.1 lists project policies; scope is legacy; git/policy/configurations supports scope filtering | Introduction and parameters match. Sources: config |
| R007-C038 | 87 | supported | isBlocking/isEnabled are separate from evaluation result; no configuration mutation | Core enforcement/result distinction and read-only constraint supported. Sources: A003, brief |
| R007-C039 | 88 | qualified | Per-policy names avoid unexplained GUIDs | Useful presentation proposal; configuration.type.displayName is a type name, not always a unique instance name. Sources: A003, policy |
| R007-C040 | 92 | supported | Threads 7.1 $iteration right/$baseIteration left tracked positions | Exact parameter roles supported. Sources: threads |
| R007-C041 | 92 | qualified | firstComparingIteration is older and secondComparingIteration newer | Left/right semantics supported, but equal IDs denote common commit. Omitting equality condition can misanchor default diffs. Sources: threads; failure=R007-thread-equal-id-condition |
| R007-C042 | 92 | qualified | Thread active/fixed/resolved/closed variants feed resolution policy | Conceptual resolved label exists; native enum uses fixed/wontFix/closed/byDesign/pending/unknown. Reporting generic variants is not a native enum contract. Sources: threads, policy |
| R007-C043 | 95 | qualified | Thread+first/second comparison triple suffices for reliable anchoring after pushes | Useful context but filePath, changeTrackingId and trackingCriteria matter too; created context and tracked context differ. Sources: threads; failure=R007-thread-tracking-narrowed |
| R007-C044 | 99 | supported | Commit-diffs API finds common commit and supports base-target/common-target; default top 100 | Operation/parameters match. Sources: diffs |
| R007-C045 | 102 | supported | Diff version descriptors support branch/tag/commit and Previous; skip/top pagination | Parameter semantics match. Sources: diffs |
| R007-C046 | 102 | qualified | Diff response has isComplete-style completion signaling | Generic signal exists but exact API field is allChangesIncluded, not isComplete. Loose wording and secondary source do not deliver exact paging contract. Sources: diffs; failure=R007-diff-completion-narrowed |
| R007-C047 | 103 | supported | Arbitrary compares may use commit-diffs API | Valid optional capability, not mandatory. Sources: diffs |
| R007-C048 | 107 | supported | Items supports path/version descriptors, content/metadata, zip/download, recursion, resolveLfs | Documented parameters and media types. Sources: items |
| R007-C049 | 110 | qualified | All large/binary files need resolveLfs | resolveLfs is specifically for LFS pointer files; binary/large files without LFS do not need it. Sources: items, limits; failure=R007-lfs-conflation |
| R007-C050 | 110 | supported | Renames complicate content lookup; do not assume every changed path renders as text | Original path/tracking and content metadata support warning. Sources: items, threads, changes |
| R007-C051 | 115 | supported | Entra for new Services, PAT sparingly; OAuth/Entra not available on Server | Deployment-specific recommendations match. Sources: auth, oauth |
| R007-C052 | 115 | qualified | All REST APIs accept OAuth; some account APIs accept only OAuth | Broad REST coverage supported; exact account-level exceptions and token family are unpinned, so not a complete auth matrix. Sources: oauth, pat |
| R007-C053 | 115 | qualified | vso.code read; vso.code_status read/write has a read subset for this client | vso.code_status is read/write; docs do not define an independent read subset token. vso.code is listed for status reads. Sources: A002, oauth; failure=R007-status-read-subset |
| R007-C054 | 115 | contradicted | Policy(read) scope is required for evaluations | Evaluations List Security documents vso.code, not a separate Policy(read) scope. Sources: A003; failure=R007-policy-scope |
| R007-C055 | 115 | qualified | Build(read) needed for backing build-run reads | Read scope for optional build calls is plausible; backing build reads are not necessary to obtain evaluation records. Sources: policy, oauth |
| R007-C056 | 115 | supported | PAT Basic with blank username and PAT password; Server may use Windows auth | Basic encoding and Server guidance match. Sources: pat, auth |
| R007-C057 | 118 | unsupported | Missing Policy/Build scopes means evaluation unavailable and should be labeled missing scope | Evaluation read does not need stated Policy scope; unavailable data does not prove which permission/scope is missing. Sources: A003, auth, rest; failure=R007-missing-scope-diagnosis |
| R007-C058 | 119 | supported | Services-only Entra guidance must not be transferred to Server | Correct transfer limit. Sources: auth |
| R007-C059 | 123 | supported | Every call sends explicit endpoint-specific version; eval requires preview suffix | Supported at the pinned 7.1 endpoint versions. Sources: A001, A002, A003, versionrules |
| R007-C060 | 123 | unresolved | 7.1 is globally latest stable and all 7.2 requests require preview | No single release-global premise established; official current guidance uses 7.2 examples, while endpoint-specific resources vary. Candidate source URL for S-22 absent. Sources: version, rest, versionrules; failure=R007-global-stability-claim |
| R007-C061 | 123 | supported | Server mappings 2022.1=7.1, 2022=7.0, 2020=6.0, 2019=5.0 | Exact mapping verified. Sources: version |
| R007-C062 | 123 | qualified | Older Servers reject newer versions with HTTP 400 | Compatibility rejection is plausible; exact status for all versions not established by cited report-only field report. Sources: version, rest |
| R007-C063 | 126 | qualified | Use per-area version table and 400 fallback to older stable | Table is sensible; blind fallback on any 400 could conceal invalid parameters/unsupported semantics. Must remain tested proposal. Sources: versionrules, version, rest; failure=R007-blanket-400-fallback |
| R007-C064 | 130 | supported | Changes/diffs/evaluations use top/skip; configurations continuationToken; other areas header token | Endpoint-specific paging dialect distinction supported. Sources: changes, diffs, A003, config, version |
| R007-C065 | 130 | qualified | Change/diff completion is isComplete/nextSkip-style | Changes has nextSkip/nextTop; diffs has allChangesIncluded. They cannot share an assumed completion field. Sources: changes, diffs |
| R007-C066 | 133 | supported | Loop to documented completion or label partial; one pager can truncate | Honesty requirement supports behavior, not a prescribed implementation. Sources: brief, changes, A003, config |
| R007-C067 | 137 | supported | Services limits consumption ~200x typical over 5 minutes; delays ms to 30s; Git participates | Supported with shared-resource trigger also possible. Sources: rate, limits |
| R007-C068 | 137 | qualified | 429 and Retry-After govern throttling handling | 429 blockage is real; Retry-After also appears on successful 200 responses, where retrying is unnecessary. Report narrows this important condition. Sources: rate; failure=C028-rate-success-delay-omitted |
| R007-C069 | 139 | supported | ~200 requests/user/min is unverified and must not drive design | Correct rejection of fixed-request interpretation; exact secondary connector attribution unresolved. Sources: rate |
| R007-C070 | 140 | qualified | Backoff/cache/batch and includeCommits/top are implementation options | Reasonable recommendations; no obligation to a specific polling or batching scheme. Sources: rate, A001, changes |
| R007-C071 | 140 | qualified | Service-hook webhook needs reachable endpoint; desktop usually lacks it | Architectural assumption, not measured deployment fact; selecting manual refresh remains valid. Sources: hooks, brief |
| R007-C072 | 144 | supported | 250GB repo guidance, under10GB recommended, pack/write errors near limit | Guidance and pack condition verified; not a universal hard block. Sources: limits |
| R007-C073 | 144 | qualified | Unlimited free LFS storage on Services per announcement | Historical 2015 announcement verified; current transfer guarantee and limits need current fit, not declaration alone. Sources: lfs, limits |
| R007-C074 | 144 | qualified | 100MB file and 5GB push limits are only secondary hints, unverified | Cautious epistemic label is not a false provider claim, but current primary Git limits directly documents these. Useful source lead is left undeveloped. Sources: limits; failure=R007-primary-size-guidance-unused |
| R007-C075 | 144 | unresolved | TF401022 auto-merge failure hint not guaranteed | Exact original issue/source not identified in standalone carrier; correctly not promoted to contract. Sources: current carrier / no exact source |
| R007-C076 | 144 | supported | Diff default100 and large PR paging | Default page size verified. Sources: diffs, changes |
| R007-C077 | 147 | qualified | Show explicit truncation/binary/LFS states and 100 of N | Honesty is required; total N cannot be manufactured when provider only supplies continuation. Missing exact count contract remains U-02. Sources: brief, items, changes, diffs |
| R007-C078 | 151 | qualified | PR active/completed/abandoned, isDraft, merge status and merge ID | States/fields supported; mergeId is an internal job ID, not a conflict result. Sources: pr |
| R007-C079 | 151 | supported | Hook IDs git.pullrequest.created/updated and ms.vss-code.git-pullrequest-comment-event | Exact current event identifiers verified. Sources: hooks |
| R007-C080 | 151 | qualified | No callback desktop must poll PR+iterations+evaluations | Polling is one valid approach; manual refresh is simpler and allowed. No provider mandates this fanout. Sources: brief, hooks; failure=R007-polling-mandate |
| R007-C081 | 151 | supported | Keep explicit PR/iteration/base selection and announce new iteration instead of silently repointing | Fits changing-context promise; banner wording is a product decision. Sources: brief, changes, A001 |
| R007-C082 | 158 | supported | Node SDK and CLI wrap Git reads, policy and thread call shapes | Official implementation exposes the named read surfaces. Sources: gitapi, policyapi, cli, sdkreadme |
| R007-C083 | 158 | qualified | SDKs simplify auth/models and provide paging helpers | Auth/model helpers verified; inspected iteration/evaluation calls are one request with explicit paging parameters, not automatic completeness. Sources: sdkreadme, gitapi, policyapi, cli |
| R007-C084 | 158 | unsupported | SDK lags preview evaluations, which may need raw fetch | Official SDK already exposes getPolicyEvaluations including includeNotApplicable/top/skip at a preview version. No SDK/version identified that lacks it. Sources: policyapi; failure=R007-sdk-preview-gap |
| R007-C085 | 158 | unresolved | SDK may return null vs throw on unexpected shapes | Inspected methods format result and catch/reject; exact original issue and failure condition unpinned. No general null contract inferred. Sources: gitapi, policyapi |
| R007-C086 | 161 | qualified | SDK stable + raw evaluations + shared retry/pager is simpler and safer | Possible stack choice, but claimed raw-evaluation necessity is unsupported and no complexity benchmark executed. Sources: policyapi, gitapi, rate; failure=R007-hybrid-superiority |
| R007-C087 | 165 | qualified | Unknown identifiers can yield404 and access can be masked; malformed int32 PR input can yield400 | Generic status interpretation supported; exact endpoint-specific error bodies/ambiguous masking not executed. Sources: rest, changes |
| R007-C088 | 165 | qualified | Distinguish not-found from no-access in UI | Truthful explanation should preserve ambiguity where provider masks it; definitive diagnosis is not always possible. Sources: rest, brief |
| R007-C089 | 165 | supported | Out-of-range iteration invalid | Documented accepted range supports defensive validation; exact response body remains unexecuted. Sources: changes |
| R007-C090 | 165 | contradicted | Renaming project/repo breaks saved IDs/names | Blanket claim includes stable IDs and all old names; Microsoft documents continued old/new project URLs with cached-client exceptions. Sources: rename, projects, pr; failure=R007-rename-identity |
| R007-C091 | 165 | qualified | Prefer IDs/name-drift confirmation; stale selection anchors; permission loss reauth; network backoff | Defensive proposals fit brief, but authorization loss is not necessarily fixed by reauthentication and Retry-After is conditional. Sources: brief, rename, rest, rate |
| R007-C092 | 172 | supported | Blocking/advisory grouping with names/why-required links | Useful optional presentation choice. Sources: A003, policy |
| R007-C093 | 173 | supported | Since-last-look pairwise default | Optional product decision; supported comparison capability. Sources: changes, range |
| R007-C094 | 174 | unsupported | Evaluation timestamp older than latest iteration proves ran against older code | startedDate is first evaluation time and no generic evaluation iteration identifier is documented. Timestamp ordering alone does not prove checked-code identity. Sources: A003, A001; failure=R007-evaluation-age-proof |
| R007-C095 | 175 | qualified | Reviewer coverage display differentiates flags/group votes/5vs10 | Distinct display labels supported; cannot reuse a third-party vote5 acceptance restriction as provider policy. Sources: reviewers, review |
| R007-C096 | 176 | supported | Dedicated partial/unauthorized/version/preview UI states | Honest presentation fits brief; exact design system remains optional. Sources: brief, version, rest |
| R007-C097 | 177 | qualified | Cheap ETag polling PR/latest-iteration/evaluations and demand diff | Deferred performance proposal; source does not establish ETag availability for these operations. Sources: rate, brief; failure=R007-etag-unverified |
| R007-C098 | 181 | qualified | Seven provider-backed obligations include iteration listing, both checks, votes, per-endpoint versions, paging, backoff, read-only scope | Honesty/read-only/version conditions supported; requiring particular endpoints, reviewer feature, group explanation and layout overstates provider mandate. Sources: brief, A001, A003, reviewers, rate; failure=R007-obligation-inflation |
| R007-C099 | 182 | supported | Optional compare/threads/diffs/content/lifecycle/SDK and product cadence/default/grouping/Server breadth | Correctly product-controlled capabilities, apart from conditional correctness obligations when shown. Sources: brief, changes, threads, diffs, items, pr |
| R007-C100 | 187 | supported | No supplied plan supports specific plan implications; thin-plan risks are generic | Scope is plan-blind; generic risks are explicitly hypothetical. Sources: brief |
| R007-C101 | 191 | qualified | Evaluation enums not captured; proposed read remains UNEXECUTED | Valid proposal, but exact enum including notApplicable is already in primary record; central results coverage omitted. Sources: A003 |
| R007-C102 | 192 | qualified | Exact changes completion/count not captured; proposed read remains UNEXECUTED | Valid proposal; nextSkip/nextTop with zero terminal are documented, and total count cannot be assumed. Sources: changes |
| R007-C103 | 193 | qualified | Fixed minute quota unresolved; proposed rate check UNEXECUTED | Correct uncertainty; consumption not requests is documented. Sources: rate |
| R007-C104 | 194 | qualified | Endpoint-specific error bodies/masking unresolved; probing not performed | Valid follow-up; generic status semantics do not prove exact bodies. Sources: rest |
| R007-C105 | 195 | qualified | Server preview floor unresolved | Valid follow-up; no per-endpoint floor claimed established. Sources: version, versionrules |
| R007-C106 | 196 | qualified | Labels/properties/work items/auto-complete depth unresolved | Valid optional expansion; current PR payload already exposes several leads. Sources: pr |
| R007-C107 | 197 | qualified | Binary/LFS/web diff thresholds unresolved | Valid follow-up; primary web thresholds available but not incorporated. Sources: review, items |
| R007-C108 | 198 | qualified | mergeStatus/conflict detail depth unresolved | Valid optional follow-up; does not convert earlier broad mergeability statement into exact enums. Sources: pr |
| R007-C109 | 202 | unresolved | 14 searches/14 primary fetches within900s/96 responses; read-only/no private local text externally | Counts, budget compliance and external transmission need acquisition/runtime history. Stage 1 does not authenticate self-reported economics. Sources: current carrier / no exact source |
| R007-C110 | 203 | supported | Fetches truncated; response schemas not always visible | All staged X capture windows show truncation; this proves source exposure limits only, not acquisition or retention. Sources: current carrier / no exact source |
| R007-C111 | 204 | contradicted | Secondary sources only used for conventions/pitfalls, never API facts | F-07 GUID/Policy-read, F-12 scope requirements and F-13 version/error facts are expressly partly secondary. Provenance promise exceeds report. Sources: A003, policyapi, projects; failure=R007-secondary-api-promotion |
| R007-C112 | 208 | unsupported | Full source key S01-S39 is standalone enough; URLs/versions live in acquisition.json | Current carrier supplies labels without those source URLs, including many material secondary attributions. It is not independently citation-complete. Sources: current carrier / no exact source; failure=R007-standalone-citations |

## Source locators

- **brief**: inputs/brief.md; Complete brief. frozen product brief.
- **A001**: inputs/sources/A001.txt; GitPullRequestIteration; GitStatusState; IterationReason. frozen Microsoft API 7.1.
- **A002**: inputs/sources/A002.txt; URI; iterationId; GitStatusState. frozen Microsoft API 7.1.
- **A003**: inputs/sources/A003.txt; URI parameters; Security; PolicyConfiguration; PolicyEvaluationStatus. frozen Microsoft Policy API 7.1-preview.1.
- **changes**: [primary source](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-request-iteration-changes/get?view=azure-devops-rest-7.1); URI Parameters; examples; GitPullRequestIterationChanges. Microsoft API 7.1.
- **reviewers**: [primary source](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-request-reviewers/list?view=azure-devops-rest-7.1); IdentityRefWithVote, vote/isRequired/votedFor/descriptor. Microsoft API 7.1.
- **items**: [primary source](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/items/get?view=azure-devops-rest-7.1); URI Parameters; response media types; FileContentMetadata. Microsoft API 7.1.
- **diffs**: [primary source](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/diffs/get?view=azure-devops-rest-7.1); URI Parameters; GitCommitDiffs.allChangesIncluded. Microsoft API 7.1.
- **pr**: [primary source](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-requests/get-pull-request?view=azure-devops-rest-7.1); URI Parameters; GitPullRequest fields; PullRequestStatus; PullRequestAsyncStatus. Microsoft API 7.1.
- **prlist**: [primary source](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-requests/get-pull-requests?view=azure-devops-rest-7.1); Operation introduction: description truncated to 400 symbols. Microsoft API 7.1.
- **threads**: [primary source](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-request-threads/list?view=azure-devops-rest-7.1); URI Parameters; CommentIterationContext; CommentThreadStatus; CommentTrackingCriteria. Microsoft API 7.1.
- **auth**: [primary source](https://learn.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/authentication-guidance?view=azure-devops); Services/Server availability; methods by scenario; web/desktop row; FAQ. Microsoft current guidance.
- **pat**: [primary source](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops); Important global PAT retirement; Use a PAT; least privilege. Microsoft current guidance.
- **oauth**: [primary source](https://learn.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/oauth?view=azure-devops); Important; Server note; scope considerations; FAQ API coverage. Microsoft current guidance.
- **rest**: [primary source](https://learn.microsoft.com/en-us/azure/devops/integrate/how-to/call-rest-api?view=azure-devops); URL structure; Response codes; API versioning. Microsoft current guidance.
- **version**: [primary source](https://learn.microsoft.com/en-us/rest/api/azure/devops/?view=azure-devops-rest-7.2); Server-to-REST compatibility table; API-version format. Microsoft REST reference.
- **versionrules**: [primary source](https://learn.microsoft.com/en-us/azure/devops/integrate/concepts/rest-api-versioning?view=azure-devops); Guidelines; preview deactivation after release; header/query version. Microsoft guidance.
- **config**: [primary source](https://learn.microsoft.com/en-us/rest/api/azure/devops/policy/configurations/list?view=azure-devops-rest-7.1); Introduction legacy scope warning; URI Parameters; PolicyConfiguration. Microsoft API 7.1.
- **policy**: [primary source](https://learn.microsoft.com/en-us/azure/devops/repos/git/branch-policies?view=azure-devops); minimum reviewers; Require comment resolution; Build validation policy requirement/expiration; Status checks; Automatically include reviewers. Microsoft product documentation.
- **statusconcept**: [primary source](https://learn.microsoft.com/en-us/azure/devops/repos/git/pull-request-status?view=azure-devops); Iteration status; >100000 modified-file exception; Status policy; applicability options. Microsoft product documentation.
- **limits**: [primary source](https://learn.microsoft.com/en-us/azure/devops/repos/git/limits?view=azure-devops); Repository size; Push size; LFS objects; Path length. Microsoft product documentation.
- **rate**: [primary source](https://learn.microsoft.com/en-us/azure/devops/integrate/concepts/rate-limits?view=azure-devops); Global consumption limit; TSTUs; Best practices; API client experience. Microsoft Services documentation.
- **review**: [primary source](https://learn.microsoft.com/en-us/azure/devops/repos/git/review-pull-requests?view=azure-devops); Review changes (added/deleted pane, size thresholds, force-push); Vote on PR changes. Microsoft product documentation.
- **hooks**: [primary source](https://learn.microsoft.com/en-us/azure/devops/service-hooks/events?view=azure-devops); Pull request created/updated/commented-on. Microsoft event documentation.
- **projects**: [primary source](https://learn.microsoft.com/en-us/rest/api/azure/devops/core/projects/get?view=azure-devops-rest-7.1); TeamProject.id string(uuid). Microsoft API 7.1.
- **cli**: [primary source](https://raw.githubusercontent.com/Azure/azure-devops-cli-extension/master/azure-devops/azext_devops/dev/repos/pull_request.py); list_pr_policies, lines 570-589: project_id=pr.repository.project.id. Microsoft/Azure official implementation.
- **gitapi**: [primary source](https://raw.githubusercontent.com/microsoft/azure-devops-node-api/master/api/GitApi.ts); IGitApi; getPullRequestIterationChanges; getPullRequestIterationStatuses. Microsoft SDK implementation; live master.
- **policyapi**: [primary source](https://raw.githubusercontent.com/microsoft/azure-devops-node-api/master/api/PolicyApi.ts); getPolicyEvaluations, lines 359-400; explicit top/skip; 7.2-preview.1. Microsoft SDK implementation; live master.
- **sdkreadme**: [primary source](https://raw.githubusercontent.com/microsoft/azure-devops-node-api/master/README.md); Authentication/getPersonalAccessTokenHandler; APIs; Server matrix. Microsoft SDK project documentation.
- **range**: [primary source](https://raw.githubusercontent.com/vinaychandra/vscode-pr-azdo/master/README.md); Show Iterations, lines 31-32. Implementation owner's current documentation; no execution.
- **gk**: [primary source](https://raw.githubusercontent.com/gitkraken/gitkraken-desktop-docs/master/gitkraken-desktop/azure-devops.md); Integration capabilities; troubleshooting missing PR form, lines 165-175. Vendor primary documentation.
- **gkpr**: [primary source](https://help.gitkraken.com/gitkraken-desktop/pull-requests/); How pull request templates work, lines 175-189. Vendor primary documentation.
- **gitlens**: [primary source](https://raw.githubusercontent.com/gitkraken/vscode-gitlens/main/CHANGELOG.md); Unreleased fixes #5839/#5840/#5842/#5836; live changing file. Implementation owner's changelog; unreleased.
- **smartgit**: [primary source](https://www.smartgit.dev/); Platform integration; supported OS; no comparative display-quality measurement. Vendor primary documentation.
- **smartgitolder**: [primary source](https://www.syntevo.com/smartgit/); Search-indexed vendor text: integrations, license across machines, light/dark themes; live redirects. Vendor historical indexed text; version not pinned.
- **distributed**: [primary source](https://www.smartgit.dev/features/distributed-reviews/); Part of SmartGit Download; Local/offline reviewing; metadata in Git. Vendor primary documentation.
- **mcpissue**: [primary source](https://github.com/microsoft/azure-devops-mcp/issues/1287); Summary/Repro/Root cause; opened 2026-05-26, closed via #1289. Firsthand issue in official repository; not normative API contract.
- **lfs**: [primary source](https://devblogs.microsoft.com/devops/announcing-git-lfs-on-all-vso-git-repos/); 2015-10-01 announcement. Microsoft historical announcement; current guarantee not established.
- **rename**: [primary source](https://learn.microsoft.com/en-us/azure/devops/organizations/projects/rename-project?view=azure-devops); Results of rename; old/new URLs continue; cached client failure; Git remotes. Microsoft product documentation.
- **openreview**: [primary source](https://raw.githubusercontent.com/OpenCoworkAI/open-cowork/main/.github/workflows/codex-pr-review.yml); Reviewed workflow; exact quoted Fresh-head source not identified. Named project repository; exact claim unresolved.

## Limits

Exact opaque secondary attributions and acquisition/runtime self-reports receive unresolved decisions rather than assumed support or fabricated source attribution. Current report is fully inventoried; source checking did not authenticate history or every source-version claim lacking locators. No sampled pass.

Cannot distinguish never acquired, undeveloped, lost or retained without frozen history. Current explicit U-items record incomplete semantics only. Economics and preservation remain unassessed. Staged truncated X captures are not evidence of semantic acquisition; evaluator's independent primary verification does not rescue candidate research.

