# Review Desk — Competitor & Azure DevOps Provider Discovery Report

- **Task:** t10-z-azure-mcp-discovery-v2-control
- **Report date:** 2026-10-01
- **Admitted input:** `inputs/brief.md` (Review Desk product brief). No plan/spec/answer history was admitted (plan-blind boundary); every source below was selected independently during this session.
- **Method:** 16 recorded steps via the bounded MCP tools only. Network evidence from public HTTPS GET fetches (final URL, HTTP status, and sha256 recorded per source in `acquisition.json`). **No Azure DevOps organization API call was made** (would require credentials not admitted by this task), so all live-behavior claims below are documentation-level and every proposed validation is **UNEXECUTED**.

## 1. Scope restated from the brief

Review Desk is a small **read-only desktop companion** for Azure DevOps (ADO) Git pull requests in an explicitly selected organization/project/repository: inspect review versions, compare the selected version with earlier work, see which checks and policies apply and what their results mean, explain incomplete/unavailable provider data honestly, keep the selected review context clear as the PR changes, reuse the existing account choice for auth, never mutate repository/provider data. This report covers (a) whole-product competitors, (b) provider API facts for those surfaces, (c) implementation evidence, with applicability limits, unresolved areas, and unexecuted validation.

## 2. Whole-product competitors

### F1 — Microsoft TeamMate: first-party Windows desktop ADO PR/work-item client (closest whole-product competitor)
**Identity:** TeamMate is a free, open-source (MIT, C#/WPF) Microsoft desktop application for managing ADO work items *and* pull requests; PRs are "first class citizens" with notifications, filtering, search, and "quick digests and status of a set of reviews." Installed via `winget install --id Microsoft.TeamMate` or MSI on Windows 10 1709+/11. Actively maintained (repo pushed 2026-09-08; 39 stars). Explicitly no telemetry.
**Evidence:** `raw.githubusercontent.com/microsoft/TeamMate/main/README.md` (HTTP 200, sha256 9b85c2b7…, fetched 2026-10-01): paragraphs "TeamMate is an application for managing Azure Dev Ops (ADO) work items and pull requests", "Pull Requests (PRs) are also first class citizens…", "winget install --id Microsoft.TeamMate", "does NOT send any telemetry". Repo metadata via GitHub search API result (HTTP 200, sha256 0309674a…): pushed_at 2026-09-08T22:36:43Z, stars 39, license MIT, language C#, archived=false.
**Applicability/transfer limits:** Windows-only, work-item-centric with PR support — not a single-repo read-only review viewer. Its existence shows Microsoft ships a desktop PR client, but Review Desk's narrow, read-only, repository-scoped review surface is not what TeamMate optimizes. Feature parity claims require installing and exercising TeamMate (UNEXECUTED).

### F2 — AxaFrance Skizzle: cross-platform Electron PR manager for GitHub + Azure DevOps
**Identity:** Skizzle is described in repo metadata as "A pull request manager app. Works with Github and Azure DevOps accounts" — Electron (Svelte, TypeScript), MIT, 39 stars, topics include `azure-devops`, `electron`, `pull-requests`; last push 2026-01-22 (not archived). Its advertised homepage (https://axaguildev.github.io/Skizzle/) returns **404** (GitHub Pages "Site not found"), so current distribution status is unknown.
**Evidence:** GitHub search API item `AxaFrance/Skizzle` (HTTP 200, sha256 0309674a…): description, language Svelte, topics, created 2019-10-31, pushed_at 2026-01-22T00:18:04Z; homepage field = axaguildev.github.io/Skizzle/. Homepage fetch: HTTP 404, sha256 70d613e3….
**Applicability/transfer limits:** Multi-provider (GitHub + ADO) desktop precedent; ADO depth unverified. The dead homepage means "product is alive and downloadable" must not be assumed — releases page not inspected (U2).

### F3 — adopure.nvim: editor-embedded ADO PR workflow (Neovim)
**Identity:** "Neovim plugin providing an opinionated workflow to interact with Azure DevOps Pull Requests" (Lua, GPL-3.0, 44 stars, distributed on luarocks; last push 2025-03-13, metadata updated 2026-08-21).
**Evidence:** GitHub search API item `Willem-J-an/adopure.nvim` (HTTP 200, sha256 0309674a…).
**Applicability/transfer limits:** Whole product for a different interaction surface (terminal editor). Demonstrates demand for non-web ADO PR review; no presentation lessons transfer directly to a GUI desktop app without inspection (source not read this session).

### F4 — azure-devops-pull-request-hub: archived whole product (maintenance-risk evidence)
**Identity:** "Azure DevOps Pull Request Manager Hub" (TypeScript, 61 stars) — an ADO PR management hub; **archived=true**, last push 2024-09-17, 57 open issues.
**Evidence:** GitHub search API item `cribeiro84/azure-devops-pull-request-hub` (HTTP 200, sha256 0309674a…), archived flag and dates as captured.
**Applicability/transfer limits:** Shows a prior community whole-product in this space is abandoned. Transfer: cautionary evidence for Review Desk's build-vs-adopt tradeoff — adopting or forking an archived product carries risk; also a soft signal that standalone ADO PR hubs struggle to stay maintained.

### F5 — Adjacent tools bound the competitive slice (not whole products)
**Identity:** The same search surface surfaced only adjacent/point tools around ADO PRs: Mimeo `VSTSExtension-ActivePullRequests` (ADO web extension for viewing active PRs, 33 stars), `ckob/ado-syntax-highlighter` (browser extension adding syntax highlighting to ADO PR diffs, 28 stars — a presentation-layer rival), `a1dancole/OpenAI-Code-Review` (automated AI review extension/service, 32 stars), `infracost/infracost-azure-devops` (cost estimates posted into PRs, 63 stars), `jeffpriz/devops-pr-stats` (PR statistics).
**Evidence:** GitHub search API, query `azure devops pull request`, total_count 311, `incomplete_results=false`, top 15 by stars (HTTP 200, sha256 0309674a…).
**Applicability/transfer limits:** In this searched slice, the ecosystem around ADO PR review is web extensions, browser add-ins, and bots — **no dominant desktop read-only PR reviewer was found**. "No dominant product" is bounded by: one query, GitHub-only discovery, top-15-by-stars ordering, and a blocked general-web channel (see §5); a failed search proves only that search result, not absence.

### F6 — The incumbent "whole product" is the provider's own web UI
**Identity:** Azure DevOps' built-in web PR experience is the default way the brief's users review PRs today; every third-party tool found (F1–F5) exists in its shadow. The searched desktop competitors survive by adding notifications/aggregation/cross-repo workflows, not by replacing the diff/policy UI.
**Evidence:** Inference from the captured competitor set (F1–F5 sources above) and the Bing SERP fetch (HTTP 200, sha256 86e2d4c…, organic results truncated in capture; used only to confirm the search channel functioned).
**Applicability/transfer limits:** Positioning inference, not a measured market claim.

## 3. Provider (Azure DevOps) API findings

All API evidence is **Azure DevOps REST API 7.1** documentation (Microsoft Learn), each page `updated_at 2025-03-18T10:27:00Z`, source git commit `cb0d0b30ca71a83e03cc7a7bbd9361e1a432b377`. The Get Pull Request page additionally enumerates supported versions: cloud 4.1, 5.0, 5.1, 6.0, 6.1, 7.0, 7.1, 7.2 and **Server 5.0/6.0/7.0/7.1**.

### F7 — PR core object: routing, merge-state, and honest-error fields
**Identity:** `GET https://dev.azure.com/{organization}/{project}/_apis/git/repositories/{repositoryId}/pullrequests/{pullRequestId}?api-version=7.1` — where **`repositoryId` must be the repository ID of the PR's *target* branch** (a routing detail that breaks lookups if the source/fork repo is used). The returned `GitPullRequest` carries exactly the fields a read-only reviewer needs for honest presentation:
- `mergeStatus` (`PullRequestAsyncStatus`): notSet | queued | conflicts | succeeded | rejectedByPolicy | failure; `lastMergeCommit` is documented as **"If empty, the most recent merge is in progress or was unsuccessful"** — an explicit incompleteness signal.
- `mergeFailureType`: none | unknown | **caseSensitive | objectTooLarge**; plus `mergeFailureMessage` — specific, user-explainable failure causes.
- `hasMultipleMergeBases` ("Multiple mergebases warning") — a correctness warning the UI should surface.
- `isDraft`, `status` (notSet | active | abandoned | completed), `forkSource` (fork PRs), `reviewers` with votes (see F11).
- Quirk: `$skip`, `$top`, `maxCommentLength` on this operation are documented **"Not used"** — pagination logic written against this endpoint would be dead code.
**Evidence:** S7 — `learn.microsoft.com/.../git/pull-requests/get-pull-request?view=azure-devops-rest-7.1&accept=text/markdown` (HTTP 200, sha256 410c2fca…): URI parameter table row `repositoryId` = "The repository ID of the pull request's target branch"; parameter table `$skip/$top/maxCommentLength` = "Not used"; definitions tables for `GitPullRequest`, `PullRequestAsyncStatus`, `PullRequestMergeFailureType` as quoted above.
**Applicability/transfer limits:** 7.1 cloud docs; Server 7.1 docs exist but were not read (U3). Field presence ≠ nullability guarantees; live probing needed (V1).

### F8 — Version/iteration model: pushes create iterations; files are tracked across them
**Identity:** Review "versions" are **iterations**: "Iterations are created as a result of creating and pushing updates to a pull request." `GET …/pullRequests/{pullRequestId}/iterations?api-version=7.1` (optional `includeCommits=true`) returns `GitPullRequestIteration[]` with `id`, `author`, `createdDate`, `changeList`, `commits` (may be truncated — `hasMoreCommits` "Indicates if the Commits property contains a truncated list"), `commonRefCommit` (first common commit of source and target), and retarget evidence fields (`oldTargetRefName`/`newTargetRefName`, `IterationReason`). Crucially, `GitPullRequestChange.changeTrackingId` is the **"ID used to track files through multiple changes"** — the stable key for following one file across versions. The PR-level `supportsIterations` flag gates the whole model: "If true, this pull request supports multiple iterations … comments left in one iteration will be tracked across future iterations."
**Evidence:** S3 — `learn.microsoft.com/.../git/pull-request-iterations/list?view=azure-devops-rest-7.1` (HTTP 200, sha256 7b0ed8ec…): operation description, `GitPullRequestIteration`/`GitPullRequestChange` definitions as quoted. S7 — `GitPullRequest.supportsIterations` definition text as quoted.
**Applicability/transfer limits:** `hasMoreCommits`/`commitTooManyChanges` mean server-side truncation is real — a UI must render "list truncated" honestly rather than treat the array as complete. `supportsIterations=false` behavior for older/legacy PRs was not observed live (V1).

### F9 — Version-comparison primitive exists server-side: `$compareTo`
**Identity:** "Retrieve the changes made in a pull request between two iterations": `GET …/pullRequests/{pullRequestId}/iterations/{iterationId}/changes?api-version=7.1` with `$compareTo={otherIterationId}`. **Default `$compareTo=0` compares against the common commit between source and target branches.** `$top` default 100, **maximum 2000**; paging is cursor-style via returned `nextSkip`/`nextTop` ("zero if there are no more changes"). Entries carry `changeTrackingId`, `changeType` (add/edit/rename/delete/…), and item `objectId` + `originalObjectId` — so "compare the selected version with earlier work" is one API call, **no local git clone or merge-base computation needed**.
**Evidence:** S8 — `learn.microsoft.com/.../git/pull-request-iteration-changes/get?view=azure-devops-rest-7.1&accept=text/markdown` (HTTP 200, sha256 7bd3fcd0…): parameter table (`$compareTo`, `$top` "default … 100 and the maximum value is 2000"), `GitPullRequestIterationChanges` definition (changeEntries/nextSkip/nextTop), worked sample `GET …/pullRequests/22/iterations/2/changes?$compareTo=1` showing an edit with `objectId e21e56d1…`, `originalObjectId ff93e64a…`.
**Applicability/transfer limits:** 2000-change page ceiling and cursor paging shape the file-list UI; iteration-level change *counts* vs. full diffs differ (content diff requires the items/content APIs, not fetched — see U7). Live behavior for renamed+edited files (changeTrackingId continuity) unverified (V1).

### F10 — External check statuses: state enum, context identity, iteration binding
**Identity:** `GET …/pullRequests/{pullRequestId}/statuses?api-version=7.1` returns `GitPullRequestStatus[]`: `state` ∈ **notSet | pending | succeeded | failed | error | notApplicable**; identity via `context {genre, name}` (genre "can be empty", name "cannot be null or empty"); `description`, `targetUrl` ("URL with status details"), `createdBy`, timestamps, custom `properties`, and **`iterationId` ("Minimum value is 1")** — a status can be bound to a specific iteration, which matters when the selected version changes. The docs' IdentityRef marks several fields (`uniqueName`, `imageUrl`, `directoryAlias`, …) **deprecated** — display code should not depend on them.
**Evidence:** S4 — `learn.microsoft.com/.../git/pull-request-statuses/list?view=azure-devops-rest-7.1` (HTTP 200, sha256 52bc716f…): sample response (two `succeeded` statuses, context genre "vsts-samples", targetUrl present), definitions `GitPullRequestStatus`, `GitStatusContext`, `GitStatusState`, deprecated-field notes in `IdentityRef`.
**Applicability/transfer limits:** Statuses are *posted by external services*; absence of a status means only that no service posted one — an honest "no data for this check" state, not a pass/fail. Which statuses are *required* (vs. informational) is policy territory (F11), not status territory.

### F11 — Checks & policies: policy evaluations API (preview-versioned, distinct artifact ID) + reviewer votes
**Identity:** Applicable branch policies and their live results come from `GET https://dev.azure.com/{organization}/{project}/_apis/policy/evaluations?artifactId={artifactId}&api-version=7.1-preview.1` where the artifact ID must be assembled from the template **`vstfs:///CodeReview/CodeReviewId/{projectId}/{pullRequestId}`** — *different* from the PR's own `artifactId` template `vstfs:///Git/PullRequestId/{projectId}/{repositoryId}/{pullRequestId}`. `includeNotApplicable=true` additionally returns policies that determined they do **not** apply — directly implementing the brief's distinction "which checks and policies apply." Each `PolicyEvaluationRecord` has `status` ∈ **queued | running | approved | rejected | notApplicable | broken** ("encountered an unexpected error"), `startedDate`/`completedDate`, and a `configuration` with `isBlocking`, `isEnabled`, `isDeleted`, `isEnterpriseManaged`, `revision`, free-form `settings` (JObject). Reviewer approval is a **separate** surface: `reviewers[].vote` integers **10 approved / 5 approved-with-suggestions / 0 no-vote / -5 waiting-for-author / -10 rejected**, with `isRequired`, `hasDeclined`, `isFlagged`, and `votedFor` (group/team votes roll up into the group).
**Evidence:** S5 — `learn.microsoft.com/.../policy/evaluations/list?view=azure-devops-rest-7.1` (HTTP 200, sha256 afea6109…): artifact-ID template block, `PolicyEvaluationRecord`/`PolicyConfiguration`/`PolicyEvaluationStatus` definitions, scope `vso.code`, "API Version: 7.1-preview.1". S7 — `GitPullRequest.artifactId` template and `IdentityRefWithVote.vote` definition as quoted.
**Applicability/transfer limits:** Compatibility risk: the policy-evaluations operation is still **`-preview.1` within 7.1**, i.e., its contract can change without a full API-version bump — a thin plan that treats it as stable GA is wrong. `settings` being a JObject means policy-type-specific rendering needs a registry of known policy types (not fetched: `policy/types` list, U7). The two similarly-named `vstfs:///` artifact templates are a concrete mis-implementation trap.

### F12 — Implementation evidence: official client library and version matrix
**Identity:** The maintained official client for TypeScript/Node desktop apps is `azure-devops-node-api` — "Node client for Azure DevOps and TFS REST APIs", Microsoft, MIT, current **17.0.1** on npm's `latest` tag, Node ≥16, dependencies only `tunnel@0.0.6` + `typed-rest-client@3.1.2`. The docs' per-page version lists confirm a wide compatibility matrix (cloud 4.1→7.2; Server 5.0→7.1) that a client choice must accommodate.
**Evidence:** S9 — `registry.npmjs.org/azure-devops-node-api/latest` (HTTP 200, sha256 a5582558…): version 17.0.1, engines, dependencies, description, license; registry timestamp 1789374417155 (2026 publication). S7 — "Other Supported Versions" list.
**Applicability/transfer limits:** Choice inference is for an Electron/TypeScript implementation; C#/WPF alternatives (e.g., what TeamMate uses) were not inspected. "Supports TFS" in the client description suggests Server compatibility but per-version behavior was not verified (U3).

### F13 — Authentication: documented OAuth2 endpoints and minimal scopes
**Identity:** All four fetched REST operations document the same oauth2 flow: authorization URL `https://app.vssps.visualstudio.com/oauth2/authorize&response_type=Assertion`, token URL `https://app.vssps.visualstudio.com/oauth2/token?client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer`. Read scopes evidenced: **`vso.code`** (read code/commit/branch metadata; listed on Get PR, Iterations List, Iteration Changes, Policy Evaluations) and **`vso.code_status`** ("read and write commit and pull request status", listed on Statuses List — i.e., reading statuses may be granted by either, per that page's scope table). TeamMate demonstrates a shipped desktop client reusing the org account without extra telemetry.
**Evidence:** S3, S4, S5 Security sections (sha256 as in §4); S6 README.
**Applicability/transfer limits:** The card's "existing account choice" likely means the org's identity provider (Entra ID), and modern desktop auth may differ from these legacy endpoints; this session fetched no Entra-auth source (U5), so the scope list is the only evidenced auth fact. Scope minimality was not tested against a live org (V3).

## 4. Source register (versions + exact locators)

| ID | Source | Version / freshness | HTTP | sha256 (first 8) | Key locators |
|---|---|---|---|---|---|
| S1 | workspace `TASK.md` | bytes 2728 | — | 21a5d121 | line 7 deliverables; line 9 budget |
| S2 | workspace `inputs/brief.md` | bytes 1009 | — | b6190d58 | whole brief |
| S3 | learn.microsoft.com → git/pull-request-iterations/list (7.1) | updated 2025-03-18; commit cb0d0b3 | 200 | 7b0ed8ec | route+`includeCommits`; `changeTrackingId`; `hasMoreCommits`; scope vso.code |
| S4 | learn.microsoft.com → git/pull-request-statuses/list (7.1) | updated 2025-03-18; commit cb0d0b3 | 200 | 52bc716f | `GitStatusState` enum; `context.genre/name`; `iterationId`; vso.code_status |
| S5 | learn.microsoft.com → policy/evaluations/list (7.1**-preview.1**) | updated 2025-03-18; commit cb0d0b3 | 200 | afea6109 | `vstfs:///CodeReview/CodeReviewId/{projectId}/{pullRequestId}`; `includeNotApplicable`; status enum incl. `broken` |
| S6 | raw.githubusercontent.com/microsoft/TeamMate main README.md | branch main, fetched 2026-10-01 | 200 | 9b85c2b7 | PR "first class citizens"; winget id; no-telemetry |
| S7 | learn.microsoft.com → git/pull-requests/get-pull-request (7.1, `accept=text/markdown`) | updated 2025-03-18; commit cb0d0b3 | 200 | 410c2fca | `supportsIterations`; `lastMerge*`; `mergeStatus`/`mergeFailureType`; votes 10/5/0/-5/-10; `artifactId` template; "Not used" params; other-version list |
| S8 | learn.microsoft.com → git/pull-request-iteration-changes/get (7.1, markdown) | updated 2025-03-18; commit cb0d0b3 | 200 | 7bd3fcd0 | `$compareTo` (0 = common commit); `$top` max 2000; `nextSkip`/`nextTop`; sample PR 22 it 2 vs 1 |
| S9 | registry.npmjs.org/azure-devops-node-api/latest | v17.0.1, snapshot 2026-10-01 | 200 | a5582558 | engines ≥16; deps tunnel/typed-rest-client; MIT |
| Q3 | bing.com search SERP | snapshot 2026-10-01 | 200 | 86e2d4ce | channel check only (truncated) |
| Q4 | api.github.com search/repositories `azure devops pull request` | total_count 311, snapshot 2026-10-01 | 200 | 0309674a | competitor items F1–F5 with stars/dates/archived flags |

Failed/dead-end fetches (explicitly recorded, no absence claims derived): Q1/Q2 DuckDuckGo HTML CAPTCHA (HTTP 202, sha256 f5d2be4e / 541e0daa); Q5/Q6 `api.github.com/repos/microsoft/vscode-azurerepos` and `…/vscode-azure-repos` (404); Q7 `axaguildev.github.io/Skizzle/` (404). Full URLs, statuses, and hashes: `acquisition.json`.

## 5. Applicability & transfer limits (summary)

1. **Documentation-level evidence only.** No ADO organization was queried; every API behavior claim above is from Microsoft Learn 7.1 pages dated 2025-03-18 (commit cb0d0b3). Live contracts, nullability, and error shapes are UNEXECUTED validation (§7).
2. **Cloud vs Server.** All fetched pages are the cloud (`azure-devops-rest-7.1`) view; Server 5.0–7.1 doc sets exist (evidenced by S7's version list) but were not read — an on-premises org may differ (U3).
3. **Competitor claims are metadata-level.** F1–F5 rest on GitHub repo metadata and (for TeamMate) its README; no competitor binary/site was exercised, and Skizzle's own site is dead (U2).
4. **Search slice is bounded.** Discovery used one GitHub query (top 15 by stars of 311 matches) plus one Bing SERP whose organic list was truncated in capture; DDG was blocked. Competitors outside GitHub or below the star cutoff were not seen — the competitor gap in F5 must not be read as proven absence.
5. **Preview-version dependency.** Policy evaluations (F11) is `7.1-preview.1`; its shape is the least stable fact in this report.

## 6. Plan implications

**No plan was admitted for this task** (plan-blind boundary), so there are no plan-specific implications. For any *thin* plan later admitted, the findings above imply, conditionally and without expanding scope beyond the brief: (a) iteration/`$compareTo` already provides server-side version comparison (F9), so no local git machinery is implied by the brief's compare feature; (b) the two distinct `vstfs:///` artifact-ID templates (F11) and the "Not used" parameters (F7) are traps a thin plan would likely miss; (c) honest-data obligations have concrete API hooks (`lastMergeCommit` empty, `mergeFailureType`, `hasMoreCommits`, `broken`/`notApplicable` policy states, missing external statuses) (F7, F8, F10, F11); (d) the read-only boundary maps to documented scopes `vso.code` (+ status read) rather than write-bearing scopes (F13); (e) build vs. adopt: the only actively maintained first-party desktop alternative is TeamMate (F1), while the closest community hub is archived (F4).

## 7. Unresolved areas

- **U1** VS Code "Azure Repos" extension source repo: two name guesses returned 404 (Q5/Q6). Unresolved; no existence claim either way.
- **U2** Skizzle distribution status: homepage 404; releases page unexamined.
- **U3** Azure DevOps **Server** API deltas vs cloud; client behavior on Server versions.
- **U4** PR Threads/Comments API: needed for "keep the selected review context clear as the PR changes" (iteration-tracked comments are mentioned in `supportsIterations` doc text but the thread endpoints were not fetched).
- **U5** Modern desktop authentication (Microsoft Entra ID broker / PAT) beyond the documented legacy OAuth2 endpoints.
- **U6** General-web search coverage: DDG blocked; Bing organic results truncated in capture; Visual Studio Marketplace (desktop/extension listings) not searched — competitor completeness gap.
- **U7** Policy **types** catalog (`_apis/policy/types`) and status→Pipelines-build linkage (Timeline/Builds APIs) not fetched; needed to render "what their current results mean" beyond the status fields themselves.
- **U8** Minimal-scope verification (is `vso.code` alone sufficient to read statuses?) — docs list both scopes on the statuses page; unresolved without a live token test.

## 8. False-dismissal checks

- DuckDuckGo CAPTCHA → re-ran discovery via Bing **and** the GitHub search API; no finding rests on the blocked channel.
- Two consecutive 404s on repo-name guesses → recorded as failed lookups only; nowhere does this report claim the repo does not exist.
- Skizzle homepage 404 → competitor retained with uncertainty flagged, not dropped.
- Get Pull Request HTML page would truncate before the definitions section → re-fetched with `?accept=text/markdown`, which returned the complete definitions (S7).
- Bing SERP truncated → competitor identification cross-checked against structured GitHub API results (Q4) instead.
- Per the task card: a failed search proves only that search result, not absence — applied to U1, U2, and F5's bounding.

## 9. Proposed validation — **UNEXECUTED**

All items below are proposals; **none has been executed** in this session (no credentials, no live org, no downloads).

1. **V1 (iterations live check, UNEXECUTED):** In a disposable test org, push twice to a PR's source branch, then call Iterations List (`includeCommits=true`) and Iteration Changes with `$compareTo`; verify `changeTrackingId` stability across iterations, `hasMoreCommits` truncation behavior, and `supportsIterations` values on legacy PRs.
2. **V2 (policy evaluations live check, UNEXECUTED):** Construct `vstfs:///CodeReview/CodeReviewId/{projectId}/{pullRequestId}` for a test PR with a blocking build policy plus a non-matching path-filtered policy; call policy/evaluations with and without `includeNotApplicable=true`; confirm `queued`/`running`→`approved` transitions and render text for `broken`.
3. **V3 (scope minimality, UNEXECUTED):** Issue a PAT with only `vso.code` (Code: Read) and confirm Statuses List, Iteration Changes, and policy/evaluations reads succeed while any status-write call fails 401/403.
4. **V4 (competitor exercise, UNEXECUTED):** Install TeamMate via winget in a sandbox and inventory its PR views against F1's claims; fetch `AxaFrance/Skizzle` releases to resolve U2.
5. **V5 (competitor completeness, UNEXECUTED):** Search the Visual Studio Marketplace and a second general-web engine for ADO PR review desktop tools, closing the U6 gap.
6. **V6 (threads, UNEXECUTED):** Fetch the Pull Request Threads API docs and verify how comment threads bind to iterations (U4), then reflect the binding in the version selector design.
7. **V7 (Server delta, UNEXECUTED):** Diff the 7.1 cloud vs `azure-devops-server-rest-7.1` pages for the four fetched operations (U3).

*End of report. Every proposed validation above is UNEXECUTED; no execution or access evidence is claimed beyond the fetches recorded in `acquisition.json`.*
