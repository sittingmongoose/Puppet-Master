# R008 current-only assessment

Verdict: **quality failure**. Assessment coverage: **complete** (96 claim rows; all six prospective facets assessed). Report SHA-256: `d2b4132166e420b8fb1ea7861d0d0cd41a1dac55a1947cb79e21211ddaf70df1`.

Useful broad discoveries, but central result-state semantics and iteration scope incomplete; universal2N lower bound, context-selection immunity and mandatory second evaluation call overstate support. Unresolved competitor/community claims limit standalone reliability.

All staged input hashes matched. No history, private method mapping, economics or candidate conversation was opened. Header treatment/control wording is an unavoidable blinding limit. A complete assessment does not imply all claims are supported; unresolved source attributions are explicit decisions, not silently passed. Candidate proposals marked UNEXECUTED remain proposals.

## Facets

| Facet | Coverage | Decision |
|---|---|---|
| AZR-01 | partial | Iteration integer identity retained, but dedicated /iterations/{iterationId}/statuses URI and sourceRefCommit/targetRefCommit/commonRefCommit roles are absent. R008 acknowledges addressing unresolved; R007 implies coverage via PR statuses alone. |
| AZR-02 | partial | Two check families are distinguished, but complete native state enums, pending/error/unknown treatment and the two scopes of notApplicable are omitted. U01 is a valid UNEXECUTED proposal, not completed current semantics. |
| AZR-03 | full | Exact CodeReview template preserved and path-name acceptance not transferred into artifact. Project-name acceptance correctly left unverified. No GUID-only overclaim. |
| AZR-04 | partial | Required/Optional result separation supported, but isEnabled context and embedded full configuration are undeveloped. |
| AZR-05 | full | Git7.1 versus evaluations7.1-preview.1 preserved. R007 global7.2-stability assertion assessed separately; no reduction of facet. |
| AZR-06 | partial | Options retained; mandatory second true-call unnecessary because true response includes applicable and non-applicable. Exact paging remains unresolved. |

## Useful novelty

- Metadata-only changed-file response
- Inert single-PR GET parameters and list-description truncation
- Global PAT retirement2026-12-01 and Azure DevOps OAuth registration closure
- Extension exact iteration-range/no-selection/gap behavior
- GitKraken documented Azure features/templates
- Official GitLens cross-org link fix, currently unreleased
- Firsthand MCP isRequired-loss issue, closed/write-path transfer limited
- Optional pinned context and on-demand content comparisons

## Material claim inventory

| Claim | Report line | Outcome | Assertion | Judgment and source checks |
|---|---:|---|---|---|
| R008-C001 | 3 | qualified | Case/card/date/input are plan-blind; sources independently selected; generic research method | Identity/input pins match; header unavoidably reveals control cue. Independence/acquisition sequence cannot be authenticated from report alone. Sources: brief |
| R008-C002 | 7 | qualified | Full brief covered and mutations outside scope | Scope statement matches brief; actual completeness assessed below and does not follow from topic headings. Sources: brief |
| R008-C003 | 11 | qualified | Findings have independent IDs and exact URL/version locators; tests are UNEXECUTED; failed search not absence | IDs and clear unexecuted labels verified; F13/F15-F17 have vague source attributions without exact URLs, so locator promise is incomplete. Sources: current carrier / no exact source; failure=R008-standalone-citations |
| R008-C004 | 21 | qualified | Iterations1=source head at creation and new pushes create iterations | Normal iteration-enabled behavior supported; >100000 modified-file/no-iterations exception and supportsIterations omitted. Sources: changes, A001, statusconcept, pr; failure=C028-iteration-support-omitted |
| R008-C005 | 21 | supported | List returns iterations and includeCommits attaches commits | Supported API7.1 operation; hasMoreCommits condition not carried to output. Sources: A001; failure=R008-commit-completeness-omitted |
| R008-C006 | 24 | supported | Iteration ID is PR-scoped integer selector, not SHA | Correct identity distinction. Sources: A001, changes |
| R008-C007 | 25 | qualified | Force-push numbering not verified; U03 proposed | Honest limit, not false fact; primary force-push update preservation is an undeveloped available lead. Sources: review, A001 |
| R008-C008 | 29 | supported | Changes returns path/change-type metadata, no unified diff hunks | Response/schema support metadata-only comparison; does not assert corpus-wide lack of every diff API. Sources: changes |
| R008-C009 | 29 | supported | compareTo0=common commit; explicit iteration pair; top/skip pagination | Exact documented options verified. Sources: changes |
| R008-C010 | 32 | qualified | Compare can use file-list or build diff content; GitHub single-call assumption risky | Useful options; no exhaustive assertion that all provider alternatives were excluded. Sources: changes, items, brief |
| R008-C011 | 33 | qualified | Large PR behavior not verified | Honest limitation; page limits and iteration-disabled condition remain relevant omissions. Sources: changes, statusconcept |
| R008-C012 | 37 | supported | Items gets versioned content with includeContent and descriptors | Documented operation and options verified. Sources: items |
| R008-C013 | 37 | contradicted | Every file diff needs at least two content reads; PR-wide diff always2N reads | True for uncached two-existing-blob naive GET strategy, not lower bound: additions/deletions have one content side, identical/cached content need fewer reads. Sources: items, changes, review; failure=R008-universal-2N |
| R008-C014 | 40 | supported | Client-side diff/cache offline, file-list default/on-demand, investigate server patch UNEXECUTED | Valid optional implementation decisions; no executed patch path is claimed. Sources: items, changes, brief |
| R008-C015 | 40 | qualified | Cache(repository,path,commit) is safe immutable blob identity | Commit-based content identity supported; organization/server context, fork repository and access-loss handling qualify universal safety. Sources: items, range, brief; failure=R008-cache-identity-narrowed |
| R008-C016 | 41 | qualified | LFS/binary/size caps remain unverified | Honest unexecuted scope; resolveLfs is documented but not semantically developed. Sources: items |
| R008-C017 | 45 | supported | CodeReview artifact template, top/skip, includeNotApplicable exclusion and7.1-preview.1 | Exact artifact/version/parameters preserved. Sources: A003 |
| R008-C018 | 48 | qualified | false means applicable view; true must be a second call for non-applicable view | A second call is optional: true includes both families and client can partition. It is not required to enumerate non-applicable policies. Sources: A003; failure=R008-second-evaluations-call |
| R008-C019 | 48 | supported | Preview dependency is compatibility risk | Correct per-endpoint qualification. Sources: versionrules, version |
| R008-C020 | 49 | qualified | Project-name artifact acceptance and exact eval enum unverified | Honest uncertainty; template uses id and primary CLI/uuid can resolve it. Enum is already documented and remains current omission. Sources: A003, cli, projects |
| R008-C021 | 53 | supported | External statuses separate from policy evaluations; optional iteration status; policy/reset can gate completion | Supported distinct resources and configured status policy. Sources: A002, A003, statusconcept |
| R008-C022 | 53 | supported | GET pullRequests/{id}/statuses lists PR statuses | Pinned X021 also gives exact URI; dedicated iteration URI not carried in current report. Sources: A002, statusconcept |
| R008-C023 | 56 | supported | Two check families; no-status cannot mean passed; resets make old iteration status irrelevant to latest code | Correct central distinction; exact state semantics still missing. Sources: statusconcept, A002, A003, brief |
| R008-C024 | 57 | qualified | Status enums and per-iteration/per-PR addressing not captured | Explicit current incompleteness; source availability is not completed acquisition. Sources: A002 |
| R008-C025 | 61 | supported | Policy types include reviewers/build/status/comments/work items/merge strategies | Listed policy families supported. Sources: policy |
| R008-C026 | 61 | supported | Required build validation gates completion; Optional reports without gating | Correct conditional enforcement semantics; bypass permissions mean no universal unoverrideable Complete-button guarantee. Sources: policy, A003 |
| R008-C027 | 61 | qualified | Minimum-reviewer policies commonly reset votes on push | Reset is configurable, not universal/default or frequency established. Required final-iteration approvals and reset variants differ. Sources: policy |
| R008-C028 | 64 | supported | Explain blocking mode/configuration; failing Optional differs from Required | Good brief-fit interpretation; exact visual alarm/grouping optional. Sources: A003, policy, brief |
| R008-C029 | 65 | qualified | Full configuration schema was not read; lives in separate Configurations API | Historical read claim gated; evaluations already embeds full PolicyConfiguration including isEnabled/isBlocking/settings/type. Extra configuration call need not be required. Sources: A003, config; failure=R008-embedded-config-unused |
| R008-C030 | 69 | supported | Reviewers GET returns IdentityRefWithVote, vote and required flags | Exact model and read surface supported. Sources: reviewers |
| R008-C031 | 69 | qualified | Group reviewers resolve via group membership | Member roll-up/votedFor documented; separate group-membership queries not established as necessary. Sources: reviewers |
| R008-C032 | 72 | supported | Display required unvoted reviewer; no vote mutation UI | Supported display-only capability and brief scope. Sources: reviewers, brief |
| R008-C033 | 73 | qualified | Vote mapping unverified; identity ID/descriptor safer than email | Mapping and descriptor uniqueness are primary documented; matches-by-ID is sensible; cross-resource identifier caveats still need care. Sources: reviewers |
| R008-C034 | 77 | supported | Entra OAuth/MI/SP preferred; PAT fallback with least privilege/short lifetime | Current recommendations verified; desktop delegated Entra is scenario-specific, not managed identity on arbitrary desktop. Sources: auth, pat |
| R008-C035 | 79 | supported | All existing global PATs stop working2026-12-01 | Current primary page explicitly confirms exact date. Sources: pat |
| R008-C036 | 80 | supported | Azure DevOps OAuth deprecated/no new registrations; new apps use Entra | Important note matches. Sources: oauth |
| R008-C037 | 81 | supported | OAuth Services only; Server client libraries/Windows auth/PAT | Correct deployment split. Sources: auth, oauth |
| R008-C038 | 82 | supported | Least privilege vso.code read/vso.code_status read-write; scopes inherit | Documented scope examples supported. Sources: A002, oauth |
| R008-C039 | 85 | qualified | Existing account choice must be checked; PAT-only is already obsolete for new Services apps | Entra preferred and ADO-OAuth unavailable to new registrations; org-scoped PATs remain supported fallback, so PAT-only is not automatically API-inapplicable. Sources: auth, pat, brief; failure=R008-pat-obsolete-strength |
| R008-C040 | 85 | qualified | Read-only scopes make no-provider-mutation promise credential-enforceable | Read scope can constrain calls; vso.code_status grants writes and auth choice alone does not prove no mutation. Existing account permissions may remain broader. Sources: A002, oauth, brief; failure=R008-readonly-credential-strength |
| R008-C041 | 86 | qualified | Minimum call-by-call scopes not verified | Honest follow-up; central Git/policy reads list vso.code in primary docs. Sources: A001, A002, A003, items, reviewers |
| R008-C042 | 90 | supported | Explicit api-version every request; resource-specific preview; Server compatibility matrix | Correct version/scope fit without global stable version claim. Sources: rest, version, A003 |
| R008-C043 | 93 | supported | Pin per endpoint and explain version-vs-permission unavailable reasons | Reasonable recommendation; definitive diagnosis requires evidence. Sources: version, rest, brief |
| R008-C044 | 94 | qualified | Lowest Server supporting each endpoint not established | Honest limitation; general matrix is not an endpoint-specific floor. Sources: version |
| R008-C045 | 98 | supported | Consumption >200x typical sliding5min, delay ms-30s, stops after drop, warnings/email | Core numerical conditions verified; shared-resource pressure also triggers delay. Sources: rate |
| R008-C046 | 98 | supported | Blocked calls429/TF400733; top/skip vs continuation headers per endpoint | Supported signals and multiple pager dialects. Sources: rate, changes, A003, config |
| R008-C047 | 101 | qualified | 2N fanout client must back off429/Retry-After, manual/narrow refresh preferred, page every list | Responsible proposals;2N premise overgeneralized, and some lists are unpaged; Retry-After on200 should delay next request, not retry completed request. Sources: rate, changes, A003, brief; failure=C028-rate-success-delay-omitted |
| R008-C048 | 101 | qualified | Provider throttling can make data partial | Failed/incomplete retrieval can be partial; delayed successful response is not inherently incomplete. Sources: rate, brief |
| R008-C049 | 102 | qualified | Exact nextSkip/nextTop not primary-verified | Honest unresolved contract; available primary fields remain undeveloped. Sources: changes |
| R008-C050 | 106 | supported | Single PR GET includeCommits/includeWorkItemRefs;skip/top/maxCommentLength unused | Exact useful/inert parameter distinctions verified. Sources: pr |
| R008-C051 | 106 | supported | List responses truncate descriptions | Primary List introduction documents400-symbol truncation; useful finding beyond reference. Sources: prlist |
| R008-C052 | 109 | supported | Single PR GET simpler than stitching lists; omit inert arguments | Valid optional implementation simplification; not tested performance result. Sources: pr, prlist |
| R008-C053 | 110 | qualified | Truncation length secondary-only/unverified | Conservative label, but primary source directly supplies length. Not a provider falsehood. Sources: prlist |
| R008-C054 | 116 | supported | GitKraken Azure integrations: avatars, clone repo list, SSH setup, create/view PR/add reviewers | Vendor primary docs verified; no execution or feature-depth benchmark. Sources: gk |
| R008-C055 | 116 | supported | ADO PR templates supported; missing form fix via remote URL/domain | Vendor primary docs verify exact capabilities/troubleshooting. Sources: gkpr, gk |
| R008-C056 | 116 | supported | GitLens fixed cross-org/server payload links with configured org | Official changelog confirms but currently in Unreleased; not proof of shipped release. Sources: gitlens |
| R008-C057 | 116 | unresolved | Fork-head correlation fix when Azure clone fields empty | Exact issue/release absent in carrier; inspected changelog corroborates related link fixes only, not this precise failure. Sources: gitlens |
| R008-C058 | 119 | unsupported | Selected organization/project/repo differentiates and prevents link confusion by construction | Context selection alone does not stop code trusting an embedded cross-org payload link; vendor client also configures organization. Sources: brief, gk, gitlens; failure=R008-context-selection-immunity |
| R008-C059 | 119 | qualified | Render links from selected context, validate organization/server segments | Supported defensive lesson; must also respect legitimate fork/source repository identity and URI encoding. Sources: gitlens, brief |
| R008-C060 | 120 | supported | Snippet/vendor-doc feature parity is not executed behavior | Correct transfer limit; source owner documentation is primary for documented feature claim. Sources: gk, gkpr |
| R008-C061 | 124 | qualified | SmartGit integrates four hosts for PR/comments; license usable across machines/OS | Vendor indexed text supports; live redirect lacks full historical prose, report pins no version. Sources: smartgit, smartgitolder |
| R008-C062 | 124 | unresolved | Dated UI/weakHiDPI-darkmode/no PR templates asserted by competitors | Exact adversarial pages not cited; no hands-on test. Vendor documents light/dark themes, but no measured weakness or template absence established. Sources: smartgit, smartgitolder; failure=R008-competitor-unsupported-comparison |
| R008-C063 | 124 | qualified | Distributed Reviews separate product and no provider PRs | Add-on has its own Git-stored metadata and license option; vendor says part of download. Absolute incompatibility is not proven by silence. Sources: distributed |
| R008-C064 | 127 | qualified | Depth over breadth and modern display exceeds SmartGit opportunity | Product positioning choice; superiority/depth baseline not measured. Sources: brief, smartgit; failure=R008-competitor-superiority |
| R008-C065 | 128 | qualified | Secondary/adversarial evidence; no hands-on evaluation executed | Clear label prevents execution claim; exact sourcing remains deficient and acquisition deferred. Sources: current carrier / no exact source |
| R008-C066 | 132 | supported | Extension iteration3vs2,2-4vs1,gaps included,no selection latest | All exact selection conventions independently verified in owner's README. Sources: range |
| R008-C067 | 132 | supported | Files tree/open diff/new-comment context follow range; immutable content without checkout mutation | Documented implementation behavior; no executed validation. Sources: range |
| R008-C068 | 135 | qualified | Range model best observed and recommended including gap/fallback | Useful optional UX; best is editorial limited to observed field, not comparative proof. Sources: range, brief |
| R008-C069 | 136 | supported | Behavior docs, UNEXECUTED, desktop adaptation needed | Correct transfer limit. Sources: range |
| R008-C070 | 140 | unresolved | Independent practices converge on fresh-head refetch/cancellation/cache/deep-link rule | Exact OpenCoworkAI quotation/Strand source unidentified; inspected workflow does not authenticate attribution. Sensible proposal is not independently verified convergence. Sources: openreview, pr, range; failure=R008-community-convergence |
| R008-C071 | 143 | supported | Pin iteration/head; moved-head banner; never silently repoint; selected3of5 | Strong brief-fit proposal; refetch frequency/stop behavior product choices. Sources: brief, A001, changes |
| R008-C072 | 144 | qualified | Live head field unverified | Honest uncertainty; lastMergeSourceCommit is merge snapshot and sourceRefCommit is iteration-specific, not interchangeable live head. Sources: pr, A001 |
| R008-C073 | 148 | unresolved | PR descriptions routinely become stale; multiple sources agree diff is review object | Description and changes can differ, but frequency and unnamed consensus unsupported by exact primary attributions. Sources: pr, review; failure=R008-description-consensus |
| R008-C074 | 151 | qualified | Show description authored-at vs latest iteration and N-newer hint cheaply | Optional useful presentation idea, but generic PR payload does not give description-authored/updated timestamp or history count, so exact cheap computability not established. Sources: pr, A001, brief; failure=R008-description-age-data |
| R008-C075 | 152 | supported | Community guidance, not provider semantics | Correct classification prevents mandate, but attribution still unresolved. Sources: current carrier / no exact source |
| R008-C076 | 156 | supported | Node SDK/CLI and MCPs expose working read paths for iterations/policies/threads | Official SDK/CLI read methods and issue tool usage verified; no execution proof claimed. Sources: gitapi, policyapi, cli, mcpissue |
| R008-C077 | 156 | supported | MCP vote path demoted required reviewers by omitting isRequired | Firsthand official-repository issue confirms report; issue is closed and write path outside brief. Sources: mcpissue |
| R008-C078 | 159 | qualified | Consult SDK/CLI call spelling simpler than derivation | Useful optional recommendation, no measured cost advantage. Sources: gitapi, policyapi, cli |
| R008-C079 | 159 | qualified | Every cached/view-model reviewer path must roundtrip isRequired in read-only client | Preserve flag for honest display; read-only cache transforms are not REST write roundtrips and exact architecture is product choice. Sources: reviewers, mcpissue, brief |
| R008-C080 | 160 | unresolved | No reference code read/executed in candidate session; bug lesson limited to flag handling | Appropriate current caveat; acquisition assertion reserved for history. Sources: mcpissue |
| R008-C081 | 166 | qualified | Table obligations explicit versions/auth/read-only/honesty/pinnedcontext/backoff/paging | Core brief/version/auth constraints supported; mandatory moved-head banner, credential restriction and page-all mechanics stronger than provider/brief. Sources: brief, versionrules, auth, rate; failure=R008-obligation-inflation |
| R008-C082 | 173 | qualified | Optional range/grouping/non-applicable/iteration-status/reviewers capabilities | Valid capabilities; parenthetical second call is unnecessary and exact iteration-status semantics unresolved. Sources: changes, A003, A002, reviewers |
| R008-C083 | 177 | supported | Diff/cache/polling/description/positioning remain decisions | Correct product-choice categories; empirical support assessed separately. Sources: brief |
| R008-C084 | 184 | supported | No plan supplied; priority list of hypothetical thin-plan misses | No claim of actual plan defect; priority is editorial. Sources: brief |
| R008-C085 | 188 | qualified | U01 exact eval/status enums not captured; proposed schemas reads UNEXECUTED | Valid proposal; central enums including both notApplicable meanings remain uncompleted. Sources: A002, A003 |
| R008-C086 | 189 | qualified | U02 paging/head field/config/thread details unresolved; proposed endpoint reads UNEXECUTED | Valid proposals; several facts primary-documented but not incorporated. Sources: changes, pr, A003, threads |
| R008-C087 | 190 | qualified | U03 endpoint Server floors/force-push unresolved; proposed compatibility check UNEXECUTED | Valid proposal; no executed floor/history test asserted. Sources: version, review |
| R008-C088 | 191 | qualified | U04 large-object/count/binary/LFS guidance unresolved; proposed docs reads UNEXECUTED | Valid follow-up, not false assertion of absence. Sources: limits, items, review |
| R008-C089 | 192 | qualified | U05 vote scale/group votes unresolved; proposed model read UNEXECUTED | Valid proposal; exact scale/group roll-up directly documented and current report lacks them. Sources: reviewers |
| R008-C090 | 193 | qualified | U06 current-user connection/graph identity unresolved; proposed read UNEXECUTED | Valid follow-up; descriptor unique field alone does not verify all matching routes. Sources: reviewers |
| R008-C091 | 194 | qualified | U07 least-privilege endpoint matrix unresolved; proposed crosscheck UNEXECUTED | Valid proposal; no claim that an exact matrix is already complete. Sources: A001, A002, A003, items |
| R008-C092 | 195 | qualified | U08 competitor depth snippet-level; proposed raw/hands-on review UNEXECUTED | Valid scope limit; evaluator independently verified identifiable primary sources, not candidate hands-on. Sources: range, gk, smartgit |
| R008-C093 | 199 | unresolved | 14searches16reads exact scheduling/acquisition record; no writes/credentials/API executions | Runtime/acquisition assertions history-gated; report self-counts are not economic measurement. Sources: current carrier / no exact source |
| R008-C094 | 200 | unresolved | Wall-clock uninstrumented/shell unavailable/fixed budget complete | Cannot authenticate current-only; cost/latency remain unassessed. Sources: current carrier / no exact source |
| R008-C095 | 201 | unsupported | Full brief researched and nothing material silently dropped | Topic breadth exists, but central native state meanings, commit identities and dedicated iteration-status addressing are incomplete; U-list honesty does not constitute completed coverage. Sources: brief, A001, A002, A003; failure=C028-full-brief-overclaim |
| R008-C096 | 202 | supported | Snippet claims lower-confidence labeled; retirement/version may change | Correct epistemic/temporal caveat; labels do not replace source support. Sources: pat, versionrules |

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

