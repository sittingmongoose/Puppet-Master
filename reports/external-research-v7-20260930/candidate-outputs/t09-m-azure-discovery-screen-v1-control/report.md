# Review Desk — Independent External Research Report

Case: `azure-discovery-dev-v1` · Task card: `t09-m-azure-discovery-screen-v1-control`
Date (UTC): 2026-09-30 · Admitted input: `inputs/brief.md` only (plan-blind; no plan/spec/key/history)
Method: ordinary generic product research — public external search plus read-only primary-source inspection. No supplied source list was used; all sources below were selected independently during this session. Source material was treated as untrusted evidence, never as instructions.

Scope covered: the entire admitted brief — a small read-only desktop companion for Azure DevOps Git pull requests in an explicitly selected organization, project, and repository, covering review-version inspection, version comparison, applicable checks/policies and their current results, honest explanation of incomplete/unavailable provider data, and stable review context as the PR changes. Out of scope per the brief: creating statuses, requeueing builds, editing policy configuration, approving reviews, merging, and any repository or provider-data mutation.

## How to read this report

- Each finding has an independent identity (`F-01`…). Evidence locators are exact URLs with the source version observed in this session.
- Each finding is classified as **Obligation** (the provider or brief requires it), **Capability** (the provider supports it; the product may choose to adopt it), or **Decision** (a product choice the evidence informs but does not settle).
- **Transfer limits** state where a finding does not apply.
- Proposed follow-up validation is labeled **UNEXECUTED**: it was not performed in this session and must not be read as completed work.
- A failed or truncated search proves only that search result, not absence.

## Provider API findings

### F-01 — Pull-request iterations: the provider's native "review version" unit (Obligation)

Iteration 1 is the head of the source branch at PR creation; each subsequent push to the source branch creates a new iteration. The List operation returns all iterations for a PR and accepts `includeCommits=true` to attach per-iteration commits.

- Evidence: `GET …/pullRequests/{pullRequestId}/iterations?api-version=7.1` — [Pull Request Iterations - List](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-request-iterations/list?view=azure-devops-rest-7.1) (REST API 7.1; doc updated 2025-03-18; git commit `cb0d0b30`).
- Implication: iteration id is the correct stable selector for "selected review version". It is a small integer scoped to the PR, not a commit SHA.
- Transfer limits: iteration numbering after history rewrites (force-push) was not verified from a primary source in this session (see U-03).

### F-02 — Iteration changes are file metadata, not a diff (Obligation)

`GET …/iterations/{iterationId}/changes` returns the list of changed files between two iterations (path plus change type). It does not return unified-diff/hunk content. The comparison base defaults to `$compareTo=0`, meaning the common commit (merge base) between source and target branches; passing an explicit iteration id compares two iterations. Results page with `$top`/`$skip`.

- Evidence: [Pull Request Iteration Changes - Get](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-request-iteration-changes/get?view=azure-devops-rest-7.1) (REST API 7.1; doc updated 2025-03-18; git commit `cb0d0b30`). Corroborated at snippet level by an independent implementer's write-up noting Azure DevOps "doesn't have a diff endpoint in the same sense" and returns changed-file metadata (secondary; page body truncated on fetch — see scheduling record).
- Implication: any "compare the selected version with earlier work" view must either render a file-level change list from this endpoint or build diff content itself (see F-03). A thin plan that assumes a GitHub-style single-call diff will miss this.
- Transfer limits: truncation/large-PR behavior of this endpoint was not verified (see U-04).

### F-03 — File content for comparisons comes from the Items API, per file and per version (Capability + Decision)

Actual blob content is fetched with `GET …/items?path={path}` plus `versionDescriptor.version`, `versionDescriptor.versionType`, and `versionDescriptor.versionOptions`, with `includeContent=true` to inline content. Producing one file diff therefore costs at least two content reads (base version and comparison version); a PR-wide diff costs 2N reads for N files.

- Evidence: [Items - Get](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/items/get?view=azure-devops-rest-7.1) (REST API 7.1; doc updated 2025-03-18; git commit `cb0d0b30`).
- Implication (Decision): the product must choose where diff computation lives — client-side diff of two fetched blobs (works offline once cached, costs API calls up front), server-rendered patch if any undocumented path exists (**UNEXECUTED** to investigate), or file-list-only comparison as the cheap default with on-demand per-file diffs. Caching by (repository, path, commit) is safe because blob content at a commit is immutable (see F-14 for the same pattern in the wild).
- Transfer limits: LFS-backed files (`resolveLfs`), binary detection, and size caps were not verified (see U-04).

### F-04 — Policy evaluations need a constructed artifact id and a preview API version (Obligation)

Evaluations are listed per pull request with an artifact id built as `vstfs:///CodeReview/CodeReviewId/{projectId}/{pullRequestId}` (note: project **id** in the template). The List operation supports `includeNotApplicable` (default excludes policies the provider deems not applicable) and `$top`/`$skip` paging. The documented version is `7.1-preview.1` — a preview version, unlike the stable Git endpoints.

- Evidence: [Evaluations - List](https://learn.microsoft.com/en-us/rest/api/azure/devops/policy/evaluations/list?view=azure-devops-rest-7.1) (Policy API `7.1-preview.1`; doc updated 2025-03-18; git commit `cb0d0b30`).
- Implication: "which checks and policies apply" maps to this endpoint with `includeNotApplicable=false`; "which exist but do not apply" needs a second call with `includeNotApplicable=true`. Depending on a preview API is a compatibility risk to record (see F-09).
- Transfer limits: whether project name (vs id) is accepted inside the artifact id was not verified; the exact evaluation `status` enum values were not captured from a primary source in this session (see U-01).

### F-05 — Pull-request statuses are a separate, extensible signal from policy evaluations (Obligation)

External services attach simple success/failure-type information to a PR (optionally per iteration) via the statuses API; teams may additionally configure a status *policy* that blocks completion until the external service approves, with reset conditions such as "reset status whenever there are new changes". Reading all statuses for a PR is `GET …/pullRequests/{pullRequestId}/statuses`.

- Evidence: [Pull request workflow extensibility](https://learn.microsoft.com/en-us/azure/devops/repos/git/pull-request-status?view=azure-devops) (conceptual; updated 2026-05-07; git commit `1eeaa8de`) and [Pull Request Statuses - List](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-request-statuses/list?view=azure-devops-rest-7.1) (REST API 7.1; doc updated 2025-03-18; git commit `cb0d0b30`).
- Implication: Review Desk must present two distinct check families — policy *evaluations* (F-04) and PR *statuses* — and must not conflate "no status posted" with "check passed". Per-iteration statuses can go stale on new pushes by design (reset conditions), which the UI should explain rather than hide.
- Transfer limits: status `state` enum values and per-iteration vs per-PR status addressing details were not captured from primary bodies in this session (see U-01).

### F-06 — Branch-policy types and their blocking semantics (Obligation)

The provider's branch policies include: minimum number of reviewers, build validation, status checks, comment-resolution requirements, linked-work-item checks, merge-strategy restrictions, and required reviewers. Critically, build validation runs in two modes and **only a `Required` policy blocks the Complete/merge button** — `Optional` validation runs and is reported but does not gate. Minimum-reviewer policies commonly reset votes on new push.

- Evidence: [Set and manage branch policies](https://learn.microsoft.com/en-us/azure/devops/repos/git/branch-policies?view=azure-devops) (conceptual; updated 2026-07-17; git commit `6a113fb3`); Required-vs-Optional blocking semantics corroborated at snippet level by independent practitioner notes (secondary).
- Implication: "what their current results mean" requires surfacing each policy's blocking mode (required/optional) and its configuration (e.g., minimum approver count, reset-on-push), not just pass/fail. Showing a failing Optional check with the same alarm as a failing Required check would mislead.
- Transfer limits: the full policy-configuration schema per type (needed to render settings) lives in the Policy Configurations API, which was not read in this session (see U-02).

### F-07 — Reviewers carry votes and required/optional flags (Capability)

Reviewers are read from `GET …/pullRequests/{pullRequestId}/reviewers`, returning `IdentityRefWithVote[]`: identity plus vote plus required/optional marking. Group reviewers exist and resolve through group membership.

- Evidence: [Pull Request Reviewers - List](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-request-reviewers/list?view=azure-devops-rest-7.1) (REST API 7.1; doc updated 2025-03-18; git commit `cb0d0b30`); group-membership resolution described at snippet level by an independent dashboard implementer (secondary).
- Implication: reviewer state (including "required reviewer has not voted") is directly renderable in a read-only client; no write is needed. The brief excludes approving reviews, so votes are display-only — the UI must avoid implying the app can cast them.
- Transfer limits: the integer vote mapping (commonly 10/5/0/−5/−10) was not verified from a primary source in this session (see U-05). Matching "current user" across calls is safest by identity id/descriptor, not email (secondary snippet evidence only — see U-06).

### F-08 — Authentication: Entra-first, PAT-last, and the choice is constrained by deployment (Obligation)

Microsoft's current direction: use Microsoft Entra OAuth / managed identity / service principal wherever possible; PATs are the fallback for tools that cannot do Entra, with minimum scopes and shortest practical lifetime. Specific constraints found:

- Global PATs retire: all existing global PATs stop working on **2026-12-01**; organization-scoped PATs or Entra auth are the migration path.
- Azure DevOps's own OAuth 2.0 is **deprecated and no longer accepts new registrations**; new applications must use Microsoft Entra ID OAuth.
- OAuth 2.0 exists only for Azure DevOps Services, **not** Azure DevOps Server; on-premises scenarios use client libraries, Windows Authentication, or PATs.
- Scopes follow least privilege (e.g., `vso.code` for read, `vso.code_status` for status read/write); some scopes include others.

- Evidence: [Use personal access tokens](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops) (updated 2026-09-21; git commit `371d6ac9`) and [OAuth 2.0 Authentication](https://learn.microsoft.com/en-us/azure/devops/integrate/get-started/authentication/oauth?view=azure-devops) (updated 2026-05-07; git commit `1eeaa8de`).
- Implication: the brief's "existing account choice" for authentication must be checked against these constraints — a thin plan assuming PAT-only or ADO-OAuth-only auth is already obsolete for new Services apps and inapplicable to Server. Read-only scopes keep the "repository content and provider data remain unchanged" promise enforceable at the credential level.
- Transfer limits: the exact minimum scope set for Review Desk's read surface (iterations, changes, items, evaluations, statuses, reviewers) was not verified call-by-call (see U-07).

### F-09 — API versioning: explicit version on every call; preview and Server skew are real (Obligation)

Every request must include an explicit `api-version`; Microsoft recommends pinning per call because APIs evolve. Versioning is per area/resource, and some needed endpoints are preview (`7.1-preview.1` for policy evaluations). REST API versions track compatibility with Azure DevOps Server releases — the viewed documentation version must be compatible with the target Server version.

- Evidence: [Get started with the REST APIs](https://learn.microsoft.com/en-us/azure/devops/integrate/how-to/call-rest-api?view=azure-devops) (updated 2026-07-23; git commit `b7e60d58`) and the [REST API version index](https://learn.microsoft.com/uk-ua/rest/api/azure/devops/?view=azure-devops-rest-7.2) (snippet level) describing the Server-version compatibility table.
- Implication: Review Desk should pin one api-version per endpoint, record which are preview, and treat Server-vs-Services as a compatibility matrix in the UI's "unavailable data" explanations (data missing because the Server version predates the endpoint is different from data missing because of permissions).
- Transfer limits: the lowest Server version supporting each needed endpoint was not established (see U-03).

### F-10 — Rate and usage limits: consumption-based delays plus 429s; paging differs per endpoint (Obligation)

Azure DevOps Services throttles by consumption, not just request count: personal usage exceeding ~200× a typical user within a sliding five-minute window triggers per-request delays (milliseconds up to 30 seconds), stopping within five minutes once consumption drops; significant delays also raise email and in-product warnings. Separately, blocked requests return HTTP 429 (`TF400733`-family messages). Paging is endpoint-specific: some endpoints use `$top`/`$skip` (policy evaluations, iteration changes), others use `x-ms-continuationtoken` response headers.

- Evidence: [Rate and usage limits](https://learn.microsoft.com/en-us/azure/devops/integrate/concepts/rate-limits?view=azure-devops) (updated 2026-07-31; git commit `3e3ebeeb`); 429/`TF400733` wording and continuation-token behavior corroborated at snippet level by independent implementer notes (secondary).
- Implication: a desktop companion that polls or fans out 2N content reads (F-03) must implement backoff on 429/`Retry-After`, prefer manual refresh plus narrow queries over aggressive polling, and page every list call to completion instead of assuming one page. Hitting delays should be surfaced honestly ("provider is throttling; data may be partial") per the brief's honesty requirement.
- Transfer limits: exact per-endpoint paging mechanics (including reported `nextSkip`/`nextTop` shapes on iteration changes) were not verified against primary response schemas (see U-02).

### F-11 — Pull-request payload shape: list vs get differ; some parameters are inert (Capability)

`GET pullrequests/{id}` supports `includeCommits` and `includeWorkItemRefs`, while `$skip`, `$top`, and `maxCommentLength` are documented as "Not used" on that operation — a trap for a thin plan that assumes generic OData paging everywhere. List operations truncate long text (e.g., descriptions capped in list responses, per independent implementer notes at snippet level).

- Evidence: [Pull Requests - Get Pull Request](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-requests/get-pull-request?view=azure-devops-rest-7.1) (REST API 7.1; doc updated 2025-03-18; git commit `cb0d0b30`).
- Implication (simpler implementation): fetch the single-PR GET with the needed `include*` flags rather than stitching list responses; never pass `$skip`/`$top` to the single-PR GET.
- Transfer limits: description-truncation length in list responses is secondary-only (see U-02).

## Competitor and best-practice findings

### F-12 — GitKraken Desktop: the closest direct competitor pattern (Capability + Decision)

GitKraken Desktop integrates Azure DevOps alongside GitHub/GitLab/Bitbucket: remote avatars on the commit graph, clone from the ADO repository list, SSH-key setup, and in-app create/view of pull requests including adding reviewers; PR templates are supported for Azure DevOps. Two cautionary details surfaced: if the PR form does not populate, the fix is to verify the remote URL and integration domain; and GitLens's changelog records real bugs where Azure PR payloads carried repository links pointing at another organization or server, fixed by building links from the *configured* organization — plus fork-head correlation failures when Azure leaves clone fields empty.

- Evidence: [gitkraken-desktop-docs `azure-devops.md`](https://github.com/gitkraken/gitkraken-desktop-docs/blob/HEAD/gitkraken-desktop/azure-devops.md) and [Pull Requests with GitKraken Desktop](https://help.gitkraken.com/gitkraken-desktop/pull-requests/) (both snippet level; full-page fetch returned navigation chrome, not body text — see scheduling record); GitLens changelog fork-link fixes (snippet level).
- Implication: Review Desk's "explicitly selected organization, project and repository" framing is a genuine differentiator against multi-provider clients — it sidesteps the cross-org link-confusion bug class by construction. Adopt the defensive rule anyway: never trust organization/server segments embedded in PR payloads; always render from the user's selected context.
- Transfer limits: snippet-level evidence only; feature parity claims (templates, reviewer add) are vendor documentation, not independently verified behavior.

### F-13 — SmartGit and the desktop-Git-client field (Decision)

SmartGit advertises Azure DevOps/Bitbucket/GitHub/GitLab integrations for creating and resolving PRs and review comments, with one license usable across machines and OSes; vendor comparisons against it stress dated UI, weak high-DPI/dark-mode support, and no in-app PR templates (its Distributed Review add-on is a separate product that does not speak provider PRs).

- Evidence: SourceForge comparison pages and GitKraken-vs-SmartGit vendor pages (all snippet level; vendor-authored comparisons are adversarial by nature).
- Implication: the competitive bar for Review Desk is narrow but clear — provider-native PR semantics (iterations, evaluations, statuses) rendered readably, with modern display behavior. Matching SmartGit's breadth is unnecessary; exceeding its Azure-specific depth is the opportunity.
- Transfer limits: entirely secondary, partly vendor-adversarial evidence; no hands-on evaluation was performed (**UNEXECUTED**).

### F-14 — vscode-pr-azdo: a directly transferable iteration-comparison UX (Capability)

This open-source VS Code extension for Azure DevOps PRs implements exactly the brief's "compare the selected version with earlier work" interaction: selecting iteration 3 alone compares it with iteration 2; selecting iterations 2–4 compares iteration 4 with iteration 1; gaps in a selection are auto-included; with no selection it falls back to the latest iteration; the files tree, the open diff, and new-comment metadata all follow the selected range; and iteration diffs use immutable provider content without touching the local checkout or worktree.

- Evidence: [vinaychandra/vscode-pr-azdo](https://github.com/vinaychandra/vscode-pr-azdo) (snippet level; full-page fetch returned navigation chrome — see scheduling record; underlying iteration/content APIs it builds on are primary-verified in F-01–F-03).
- Implication: this range-selection model is the best observed answer to the brief's version-comparison requirement and fits a read-only client perfectly (immutable content, no checkout mutation). Recommend adopting its semantics, including the explicit no-selection fallback and gap auto-inclusion.
- Transfer limits: behavior described in the project's own docs, not verified by execution (**UNEXECUTED**); VS Code extension UX may need adaptation for a desktop companion.

### F-15 — Stale-context handling: re-validate the head before presenting or acting (Obligation)

Independent review-tooling practices converge on one rule: the PR head can move at any time, so re-fetch the live PR head SHA before presenting a review as current, and stop rather than present stale content as fresh. Related patterns: cache each resource by (provider, repository, PR, head SHA) and cancel stale in-flight requests; keep comment positions diff-relative with enough original metadata to deep-link.

- Evidence: community practice snippets (opencoworkai review prompt: "Fresh-head only … if it differs … stop without posting a stale review"; strand docs: cache-by-head-SHA with stale cancellation). Secondary only.
- Implication: this is the concrete mechanism for the brief's "keep the selected review context clear as the pull request changes" — pin the view to (iteration id, head SHA), banner when the live PR has moved past the pinned selection, and never silently re-point the selection. "Selected iteration 3 of now-5" must read exactly that way.
- Transfer limits: community practice, not provider contract; exact head-SHA field on the PR payload was not primary-verified in this session (see U-02).

### F-16 — Present descriptions as context, never as contract (Decision)

Review practice treats PR titles/descriptions as prose written before the final push that routinely goes stale mid-review ("the diff is what you are reviewing"). Review rounds change the diff while the description silently mis-frames later rounds unless updated.

- Evidence: community practice snippets (multiple independent sources). Secondary only.
- Implication: Review Desk should display the description together with its staleness caveat (authored-at vs latest-iteration-at) rather than as authoritative summary — a direct application of the brief's honesty requirement. This is also an improvement opportunity, not just defect avoidance: a "description may predate N newer iterations" hint is cheap and genuinely useful.
- Transfer limits: presentation guidance from community practice; no provider semantics involved.

### F-17 — Reference implementations and cautionary bugs worth mining (Capability)

The ecosystem contains working read paths Review Desk can learn from without executing them: the `azure-devops-node-api` SDK and Azure CLI (`az repos pr`, `az devops invoke`) encode working call shapes for iterations, policies, and threads; several MCP servers wrap the same endpoints. One cautionary bug is directly relevant: an MCP `vote_pull_request` implementation silently demoted required reviewers to optional because it did not preserve `IdentityRefWithVote.isRequired` — the exact flag F-07 relies on for display.

- Evidence: snippet-level references to SDK/CLI/MCP usage and the `vote_pull_request` issue (secondary; no code was executed).
- Implication (simpler implementation): when in doubt about a call shape, consult the SDK/CLI spelling first — it is cheaper than re-deriving from REST docs. And any code path touching reviewer objects must round-trip `isRequired`, even in a read-only client (cached copies, view models).
- Transfer limits: no reference code was read or executed in this session (**UNEXECUTED**); the bug report is about a write path the brief excludes, cited only for the `isRequired` handling lesson.

## Supported obligations vs optional capabilities vs product decisions

| # | Item | Class | Basis |
|---|------|-------|-------|
| Explicit `api-version` per call; pin preview versions knowingly | Obligation | F-09, F-04 |
| Auth via a currently supported mechanism (Entra for new Services apps; PAT/Windows auth where OAuth is unavailable) | Obligation | F-08 |
| Read-only credential scopes; no mutation calls | Obligation | Brief + F-08 |
| Honest incomplete/unavailable-data explanation (throttle, permission, version skew, not-applicable) | Obligation | Brief + F-04, F-05, F-10 |
| Pinned, labeled review context (iteration + head) with moved-head banner | Obligation | Brief + F-01, F-15 |
| Backoff on 429/delay; page all list calls | Obligation | F-10 |
| Iteration-range comparison UI | Capability | F-02, F-14 |
| Required-vs-optional blocking display per policy | Capability | F-04, F-06 |
| Not-applicable policy display (second evaluations call) | Capability | F-04 |
| Per-iteration vs per-PR status distinction | Capability | F-05 |
| Reviewer votes + required/optional display | Capability | F-07 |
| Diff computation location (client-side vs list-only vs on-demand) and cache policy | Decision | F-03, F-14, F-15 |
| Polling vs manual refresh cadence | Decision | F-10 |
| Description-staleness presentation | Decision | F-16 |
| Competitive positioning (depth over breadth) | Decision | F-12, F-13 |

## Plan implications

No plan is admitted in this plan-blind task (only `inputs/brief.md`), so there are no plan implications to record. A thin plan for this brief would most likely miss, in priority order: the metadata-only nature of iteration changes (F-02), the evaluations artifact-id construction and preview version (F-04), status-vs-evaluation duality (F-05), Required-vs-Optional blocking semantics (F-06), and the Entra/PAT/Server auth matrix (F-08).

## Unresolved areas and proposed validation (all UNEXECUTED)

- **U-01 — Exact status/state enums.** Policy-evaluation `status` values (secondary sources suggest `approved`/`queued`/`running`/`rejected`/`broken`) and PR-status `state` values were not captured from primary response schemas. Proposed validation (**UNEXECUTED**): read the full Evaluations Get and Pull Request Statuses List/Create reference bodies, including sample chapters and linked model definitions.
- **U-02 — Paging and payload minutiae.** Per-endpoint continuation (`x-ms-continuationtoken` vs `$skip`/`$top` vs reported `nextSkip`/`nextTop`), list-response truncation lengths, the live head-SHA field name, Policy Configurations schemas, and Threads API versioning were corroborated only at snippet level. Proposed validation (**UNEXECUTED**): read the corresponding primary reference pages end to end and record one example response per endpoint.
- **U-03 — Server (on-premises) compatibility floor.** The minimum Azure DevOps Server version supporting iterations, iteration changes, evaluations, and statuses endpoints, and iteration behavior under force-push/history rewrite. Proposed validation (**UNEXECUTED**): read the REST API version index's Server-compatibility table and the Server-moniker variants of the reference pages.
- **U-04 — Large-object behavior.** Iteration-changes truncation/count limits, Items API size caps, binary and LFS handling, and any diff-size guidance. Proposed validation (**UNEXECUTED**): read Git limits documentation and the Items List/batch reference, including error responses.
- **U-05 — Reviewer vote mapping.** The integer vote scale and the semantics of group-reviewer votes. Proposed validation (**UNEXECUTED**): read the `IdentityRefWithVote` model definition and reviewer-vote documentation end to end.
- **U-06 — Current-user identity resolution.** Matching the signed-in user by identity id/descriptor via connection data (snippet-level only). Proposed validation (**UNEXECUTED**): read the Connection Data and Identities/Graph reference pages.
- **U-07 — Minimum scope set.** The least-privilege scope combination covering iterations, changes, items, evaluations, statuses, reviewers, and policy configuration reads. Proposed validation (**UNEXECUTED**): cross-check each endpoint's documented Scopes section (several reference bodies were truncated at the Scopes section during fetch) and confirm against the OAuth scope matrix.
- **U-08 — Competitor depth.** GitKraken/SmartGit/vscode-pr-azdo behavior rests on snippet-level evidence because full-page fetches of GitHub HTML returned navigation chrome instead of article bodies. Proposed validation (**UNEXECUTED**): re-read those pages through raw-content URLs and, for behavior claims, hands-on evaluation.

## Costs and coverage

- External research in this session: 14 search queries and 16 page reads (exact sequence in `scheduling.json`; sources and versions in `acquisition.json`). No external writes were made; no credentials were used; no endpoints were executed.
- Wall-clock time was not instrumented with a timer in this environment (shell execution is unavailable); all work completed inside the session's fixed budget. Counts above are the complete usage record.
- Coverage: the full brief was researched — versions (F-01–F-03, F-14), checks/policies (F-04–F-07), auth (F-08), compatibility (F-09–F-10), honesty and context stability (F-15–F-16), competitors and implementation choices (F-12–F-14, F-17). Unvisited and dead-end areas are recorded as U-01–U-08 and in `scheduling.json`; nothing material was silently dropped.
- Conditions and uncertainty: findings marked "snippet level" rest on search-result excerpts, not full-page reads, and carry lower confidence — they are labeled wherever used. Preview API versions and retirement dates reflect documentation current as of the observed update stamps and can change.

