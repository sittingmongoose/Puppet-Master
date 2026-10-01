# Review Desk — provider API and real-implementation discovery report

**Task:** t10-z-azure-mcp-discovery-v2-treatment · **Date of research:** 2026-10-01 · **Status:** standalone, current as of the listed source versions.
**Subject:** "Review Desk", a small read-only desktop companion for Azure DevOps Git pull requests in an explicitly selected organization, project, and repository (from `inputs/brief.md`).
**Method:** sources were selected independently (no external source list supplied). Primary evidence = official Azure DevOps REST API 7.1 documentation pages + inspected implementation sources of discovered products. Every fetch's actual final URL, HTTP status, and sha256 are recorded in `out/acquisition.json`; the full query/read sequence is in `out/scheduling.json`.
**Plan boundary:** this pass is plan-blind. No plan, spec, key, or answer history was admitted, so there is no admitted plan to map implications onto; the "Plan implications" subsections below are research notes for a future planning pass, not mappings onto an existing plan.

---

## 1. Component questions derived from the brief

- **CQ1 Identity/context** — identifying org/project/repo, resolving the signed-in user, keeping the selected review context clear as the PR changes.
- **CQ2 Versions/compare** — enumerating review versions (iterations) and comparing the selected version with earlier work.
- **CQ3 Checks/policies** — reading which checks and policies apply and what their current results mean.
- **CQ4 Honest incomplete data** — how the provider signals absence, permission loss, throttling, truncation, partial failure.
- **CQ5 Auth/connection** — reusing the existing account choice; token kinds, scopes, transport constraints.
- **CQ6 Simpler implementation choices** — request-count and architecture choices a thin plan may miss.

---

## 2. Findings

### F1 — Compatibility: the REST surface is version-pinned and split hosted vs. Server
**Evidence.** Microsoft Learn REST docs, moniker `azure-devops-rest-7.1`, doc `git_commit_id=cb0d0b30ca71a83e03cc7a7bbd9361e1a432b377`, `updated_at=2025-03-18T10:27:00Z`:
- Iterations List requires `api-version=7.1` on every call, and its "Other Supported Versions" list runs `azure-devops-rest-4.1 … 7.2` plus `azure-devops-server-rest-5.0 … 7.1` (acquisition S3, key_locators).
- Iteration Changes Get likewise pins `api-version=7.1` and lists the same hosted/Server split (S4).
- Policy Evaluations List is versioned `7.1-preview.1` — a *preview* string even inside the 7.1 docs (S1).
**Applicability.** Review Desk should pin `api-version=7.1` (matching the reference implementations, S6 `API_VERSION='7.1'`), and must not assume `7.2` exists on Azure DevOps Server installations — the Server series tops out at 7.1 in the doc version lists. The policy-evaluations call carries a preview version string; a thin plan that pins one uniform version string everywhere will break that one call.
**Transfer limits.** Version lists come from doc pages, not from live probes of a Server instance; see U3.

### F2 — Identity: current-user GUID and role split come cheap
**Evidence.** `GET {org}/_apis/connectionData` (called with `api-version=7.1-preview` in QVL's adapter, S6 `resolveMyId`) returns `authenticatedUser.id`, used to filter PRs. PR listing uses `searchCriteria.status=active` with `searchCriteria.creatorId` or `searchCriteria.reviewerId` (S6 `fetchProjectRole`; S7 step 3). azure-pr-viewer splits its reviewer list by the `isRequired` flag on the reviewer entry and computes the approvals tally from reviewer votes carried in the *same* list response (S7 step 3; S8 "Required from me / Optional for me").
**Applicability.** Review Desk's "explicitly selected" context plus per-user views (your PRs / PRs requiring you) maps directly onto creatorId/reviewerId queries; the required-vs-optional reviewer distinction is available per PR without extra calls.
**Transfer limits.** The exact `GitPullRequest.Reviewers[].isRequired` field name is evidenced via the azure-pr-viewer architecture doc, not an official doc page fetched in this pass (see U6).

### F3 — Identity nuance: name-vs-ID is inconsistent across the read paths
**Evidence.**
- Iterations Get/List: `repositoryId` = "ID or name of the repository"; `project` = optional "Project ID or project name" (S2, S3).
- Statuses List: `repositoryId` = "**The repository ID** of the pull request's target branch" — ID-phrased, not name-phrased (S5).
- Policy Evaluations: the path requires `{project}`, and the artifactId must be built as `vstfs:///CodeReview/CodeReviewId/{projectId}/{pullRequestId}` — the **project GUID**, not its name (S1).
- QVL's adapter reads `pr.repository.project?.name` and `pr.repository.id` off the PR payload (S6 `buildWebUrl`), i.e. the PR response already carries both repo name and repo/project references.
**Applicability.** A thin plan may store org+project+repo as user-typed names and pass them everywhere. That works for iteration reads but is fragile for statuses (ID-phrased doc) and plainly wrong for policy evaluations, which require resolving project name → GUID once per selected context. Resolution data is already in the PR payload.
**Transfer limits.** The docs' wording ("ID or name" vs "the repository ID") is phrasing, not a proven behavioral difference; see U2 for a probe proposal.

### F4 — Versions/compare: iteration semantics are precise and truncation is explicit
**Evidence.** Iteration Changes Get (S4): "Iteration one is the head of the source branch at the time the pull request is created and subsequent iterations are created when there are pushes to the source branch"; `$compareTo` defaults to **0 = the common commit between source and target branches**; `$top` default 100, **maximum 2000**; response carries `nextSkip`/`nextTop` which are **zero when there are no more changes**. Iterations List (S3): `includeCommits=true` embeds commits per iteration; `IterationReason` enum = `push, forcePush, create, rebase, unknown, retarget, resolveConflicts`; a retarget iteration carries `oldTargetRefName`/`newTargetRefName` (S2, S3). `GitPullRequestIteration.hasMoreCommits` flags a truncated commit list (S2, S3); commits carry `commentTruncated` and `commitTooManyChanges` (S2).
**Applicability.**
- "Inspect review versions" = iterations list; "compare the selected version with earlier work" = iteration-changes with `$compareTo={earlier iteration}`; the doc's own example (`iterations/2/changes?$compareTo=1`) shows edits carrying `originalObjectId`.
- Correctness: pagination must follow `nextSkip/nextTop` until zero — the default page is only 100 changes and hard-caps at 2000, so large PRs silently under-report if a thin plan does one call.
- Context clarity: a new iteration can be a **retarget** or **rebase/forcePush**, not new code; labeling an iteration by its `reason` (and old/new target on retarget) keeps "the PR changed" honest instead of claiming "new commits".
**Transfer limits.** Diff rendering of a change entry needs a second item fetch (the API returns paths/objectIds, not hunks); the exact item-content call was not in the fetched docs (see U6).

### F5 — Checks/policies: two separate sources must be composed
**Evidence.**
- **Statuses** (S5): `GET .../pullRequests/{pullRequestId}/statuses`; each `GitPullRequestStatus` has `state` ∈ `notSet|pending|succeeded|failed|error|notApplicable`, `context {genre, name}` that "uniquely identifies the status", `createdBy`, `targetUrl` (details link), and an optional `iterationId` (min 1) — "Status can be associated with a pull request or an iteration."
- **Policy evaluations** (S1): `GET {org}/{project}/_apis/policy/evaluations?artifactId=vstfs:///CodeReview/CodeReviewId/{projectId}/{pullRequestId}`; `PolicyEvaluationStatus` ∈ `queued|running|approved|rejected|notApplicable|broken` ("broken = the policy has encountered an unexpected error"); the embedded `PolicyConfiguration` has `isBlocking`, `isEnabled`, `isDeleted`, `settings` (free-form JObject); `includeNotApplicable=true` is needed to also list policies that decided they don't apply; paging via `$top`/`$skip`.
**Applicability.** "Which checks and policies apply and what their current results mean" requires composing both endpoints: external-CI checks live as statuses (with genre/name and targetUrl), branch policies live as evaluations (with blocking flag and configuration). The `broken` and `notApplicable` states are exactly the cases where an honest UI must explain "unavailable/meaningless here" rather than red/green.
**Transfer limits.** Policy `settings` is a JObject whose shape varies per policy type; meaning extraction per policy type was not studied in this pass (see U5).

### F6 — Presentation: state mapping decisions are product decisions, evidenced in real products
**Evidence.**
- azure-pr-viewer deliberately reads **only blocking Build and Status policies** as "checks" and tracks reviewer/comment governance separately; when the evaluations read fails it "degrades to 'active', never overclaiming readiness" (S7 step 5). Vote semantics used: negative vote values = rejected/waiting (`CodeReviewVoteResult`, S6).
- GitHub CLI `gh pr view` (analogous component): "dismissed" reviews are displayed as "Commented" with an in-code rationale ("'dismissed' only makes sense ... in an events timeline but not in the final tally"), pending reviews are excluded from the reviewer tally, deleted accounts render as "ghost", and lists longer than the returned nodes render with ", …" truncation markers (S12 `formattedReviewerState`, `parseReviewers`, `prLabelList`).
**Applicability.** For Review Desk, which policies count as "checks" vs "governance" is a presentation decision with a proven precedent (blocking Build/Status = checks). Vote-number→label mapping (e.g. −10 rejected, −5 waiting) must be rendered as human states, and mapped states need honest fallbacks (unknown vote value → "voted").
**Transfer limits.** gh's `statusCheckRollup` is a server-computed aggregate with **no Azure DevOps equivalent** — the rollup must be composed client-side from statuses + evaluations (see §2-analogies). GitHub review states do not transfer one-to-one; only the mapping discipline transfers.

### F7 — Honest incomplete data: the provider degrades auth, throttles, truncates, and partially fails
**Evidence.**
- QVL's `classifyResponse` (S6): ADO can answer with **HTTP 203 / a 2xx HTML login page** when auth is degraded (token refresh window), so "ok" requires 2xx **and** JSON content-type; 429 throttling is retried honoring `Retry-After` (capped at 5 s); 502/503/504 are transient. A failed per-PR thread read falls back to "new" **with an explicit warning, not a silent claim of no activity** (S6 `analyzeActivity` catch).
- Per-project failures are aggregated into `warnings` while the rest renders (S6 `fetchRole`, S10 "Échecs partiels non bloquants").
- azure-pr-viewer: policy-read failure degrades to "active" for its own PRs, never claiming merge-readiness (S7); the README's Troubleshooting documents a "?" placeholder when a threads request fails transiently (S8).
- Provider-side truncation flags to surface: `hasMoreCommits` (S2/S3), `nextSkip/nextTop` pagination (S4), `includeNotApplicable=false` hiding non-applying policies by default (S1), and statuses whose `iterationId` refers to an older iteration than the selected one (S5).
**Applicability.** Review Desk's honesty obligation has concrete mechanics: (1) treat non-JSON 2xx as auth-degraded, not as data; (2) render "unknown/?" states for failed sub-reads; (3) show warnings for unreachable projects/repos while keeping the rest; (4) display truncation flags rather than silently capped lists; (5) label policy `broken`/`queued` states distinctly from failure/success.
**Transfer limits.** The 203/HTML behavior is evidenced from one third-party adapter's retry logic; exact status codes under Entra-vs-PAT auth were not probed live (see U2).

### F8 — Auth/connection: the "existing account choice" has two proven zero-OAuth paths
**Evidence.**
- **Azure CLI / Entra token:** azure-pr-viewer calls `az account get-access-token --resource 499b84ac-1321-427f-aa17-267ca6975798` ("a Microsoft Entra token scoped to Azure DevOps"), caches it, and re-acquires ~5 minutes before expiry (S7 step 1); its README markets this as "no PAT to manage" (S8). QVL's web variant leaves the PAT empty and injects the Azure AD token **server-side** in a proxy, because browsers are blocked by CORS (S10; S6 proxies through `/ado/{org}/...`).
- **PAT:** QVL uses `Authorization: Basic base64(":" + pat)` with scope guidance "Code (Read)" (S6 `authHeader`, S10 config help). Official scopes per doc Security sections: `vso.code` for iterations/changes/evaluations; `vso.code` or `vso.code_status` for statuses (S1, S2–S5).
- **Keychain storage:** DevCenter keeps provider tokens in the OS keychain with multiple provider accounts (S11).
**Applicability.** A desktop app can reuse the existing `az login` account exactly as azure-pr-viewer does — no OAuth dance, no stored secret — which matches the brief's "authentication and connection set-up use the existing account choice". PAT-Basic is the fallback for accounts without az CLI. A desktop (non-browser) app does **not** need the CORS proxy that the web-based PrViewer requires.
**Transfer limits.** Token-expiry handling (~5 min early refresh) is one product's policy, not a provider contract; the Entra resource GUID `499b84ac-1321-427f-aa17-267ca6975798` is evidenced from that same product's doc and is the well-known Azure DevOps resource ID, but a thin plan should treat it as configuration, not hard-code folklore (validation U2).

### F9 — Simpler implementation choices a thin plan may miss
**Evidence and substance.**
1. **Compute, don't re-fetch:** approvals/required-reviewer state comes from the PR list response itself — azure-pr-viewer computes the tally "from it directly — no extra request" (S7 step 3).
2. **Scoped N+1 with bounded concurrency:** comment threads require one call per PR (the list endpoint doesn't include them, S7 step 4); both products bound the fan-out at 8 concurrent requests (S6 `ANALYZE_CONCURRENCY=8`, S7 step 4), and azure-pr-viewer **cancels** in-flight fan-out when a refresh supersedes it.
3. **Demand-driven policy reads:** policy evaluations are fetched only where the UI shows them (own PRs), not for every listed PR (S7 step 5).
4. **Thread-granularity counting:** ADO resolves *threads*, not comments; counting per thread once regardless of replies is both cheaper and semantically right (S7 step 4).
5. **Ports-and-adapters seam:** QVL isolates all ADO specifics (auth, retry, thread analysis, URL normalization) in one provider file behind a neutral `PrView`/`PrProvider` contract (S10; S6) — a cheap seam if provider breadth ever grows.
6. **URL normalization:** users paste full URLs; `dev.azure.com/{org}` and legacy `{org}.visualstudio.com` forms are normalized in the adapter (S6 `normalizeOrg`/`normalizeProject`).
7. **Raw REST, no SDK:** both inspected desktop clients speak raw REST 7.1 in Go/TS — no client SDK dependency is needed for this surface (S6, S7).
**Applicability.** These are concrete simplifications: fewer requests (1), bounded work (2), lazy scopes (3), correct counting (4), testable seams (5). azure-pr-viewer additionally structure-tests its client against an `httptest` server (S7) — a pattern for Review Desk's read-only client tests.
**Transfer limits.** The org-wide PR query used by azure-pr-viewer (`/{org}/_apis/git/pullrequests`, S7) vs QVL's per-project query (`{project}/_apis/git/pullrequests`, S6) shows two working shapes; the org-wide form's exact contract was not doc-verified in this pass (U6).

### F10 — Competitor landscape: who exists, and what transfers
**Whole-product competitors (Azure DevOps PR companions), all inspected at primary level:**
| Product | Form | Read-scope overlap with Review Desk | Key divergence |
|---|---|---|---|
| zunhdev/azure-pr-viewer (S7, S8) | Go TUI dashboard, MIT | PR lists by role, votes, thread health, policy checks | Dashboard of *your* PRs; not a repo-scoped version/compare inspector |
| Meral-IT/PullRequest-Manager (S9) | Electron+React+Fluent UI desktop | PR list/filter across projects, notifications | Self-described integration "Work in Progress"; non-commercial license |
| QVL-ToolBox/PrViewer (S6, S10) | React web app via dev-server proxy | PR lists, activity-since-last-visit, honest warnings | Web/CORS-bound; "what changed since your last visit" heuristics |
| BipulRaman/DevCenter (S11) | Tauri desktop, multi-provider | Cross-provider PR lists + in-app diff reading | Includes write paths (reply/approve) outside Review Desk's read-only case |

**Analogous components:** `gh pr view` in cli/cli (S12) — a read-only PR aggregator/renderer in a CLI; transfers at the level of *presentation mapping* (reviewer-state mapping, truncation ellipses, empty-body placeholder), not API shape (GraphQL vs REST).
**Rejected as irrelevant analogy:** isaacOjeda/AdoMcpServer (AI-assistant MCP bridge, not a human review UI); dylsmith8/PRex (notifier only); TimothyK/PdfDiff (single file-format diff viewer); Dev4mir/devops-gate-releases (closed-source releases-only repo — no inspectable implementation). Rejection reasons recorded in `out/acquisition.json`.

**Supported obligations vs optional capabilities vs product decisions** (brief instruction: distinguish these):
- *Provider-supported obligations (read paths that exist as contracts):* enumerate PRs by creator/reviewer/status; list/get iterations; get iteration changes with explicit compare base; list PR statuses (incl. per-iteration); list policy evaluations by PR artifact ID; resolve current identity via connectionData (S1–S6, S7).
- *Optional capabilities (work without them, or are opt-in flags):* `includeCommits`, `includeNotApplicable`, `$compareTo` choices, `$top` page sizes, `targetUrl` detail links, per-iteration status association, `isRequired`-based splitting.
- *Product decisions (neither obligation nor capability):* which policies count as "checks" (blocking Build/Status per azure-pr-viewer), vote-number→label mapping, required/optional reviewer split, degradation wording ("?" / "active"), last-visit tracking heuristics (PrViewer), and license constraints on reusing competitor code (PullRequest-Manager non-commercial; PrViewer has no license → idea-level transfer only).

---

## 3. False-dismissal checks

1. **404 ≠ absence:** three Microsoft Learn URLs 404ed on first attempt because of wrong operation slugs; corrected slugs (`pull-request-iterations/get|list`, `pull-request-iteration-changes/get`, `pull-request-statuses/list`) all returned 200 with full content. Recorded step-by-step in `scheduling.json`.
2. **Blocked search ≠ empty landscape:** the DuckDuckGo HTML search returned a 202 bot-challenge; the competitor survey was completed via GitHub's public search API instead. Absence of *further* whole-product competitors is **not** established (see U7).
3. **Staleness ≠ nonexistence:** dylsmith8/PRex (2021) was treated as a stale-but-real data point, not evidence that ADO notifier tools don't exist.
4. **Degraded mock data ≠ typo:** the "?" counts in azure-pr-viewer's README mockup were cross-checked against its Troubleshooting and architecture docs and confirmed to be an intentional honest-degradation affordance.

## 4. Unresolved areas and proposed validation (all **UNEXECUTED**)

- **U1 Threads API doc.** The comment-thread endpoint and the thread-status enum (`active|pending|fixed|wontFix|closed|byDesign`) are evidenced only from azure-pr-viewer's architecture doc, not from an official page. *Proposed (UNEXECUTED):* fetch the `git/pull-request-threads` Learn doc and diff the enum.
- **U2 Live behavior probes.** Degraded-auth status codes (203/HTML), statuses' name-vs-ID repositoryId tolerance, and the Entra resource GUID were taken from one adapter + docs, not probed. *Proposed (UNEXECUTED):* read-only GET probes against a disposable test org (PAT scope Code-Read) recording status/content-type per case.
- **U3 Server compatibility.** Hosted-vs-Server version split rests on doc "Other Supported Versions" lists. *Proposed (UNEXECUTED):* probe an Azure DevOps Server 2022 instance with `api-version=7.2` to confirm rejection, and 7.1 acceptance.
- **U4 Policy settings per type.** `PolicyConfiguration.settings` shapes per policy type (build, comment requirements, etc.) unexamined. *Proposed (UNEXECUTED):* enumerate policy types via the policy types endpoint on a test project and record settings schemas.
- **U5 Rate-limit ceilings.** Throttling behavior (429 + Retry-After) evidenced from adapter code; actual safe concurrency for the threads N+1 on large PR sets unknown. *Proposed (UNEXECUTED):* bounded-concurrency load test (8 vs 16) on a test org, logging 429 rates.
- **U6 Official GitPullRequest field set.** `isRequired`, `mergeStatus`, and the item/content fetch for rendering hunks were not doc-verified in this pass. *Proposed (UNEXECUTED):* fetch `git/pull-requests/get-pull-request` and the items/batches doc, then map fields.
- **U7 Broader competitor sweep.** Coverage is bounded by two GitHub API queries plus one blocked web search. *Proposed (UNEXECUTED):* repeat the web search via an alternate engine and the Visual Studio Marketplace search API; a failed search would prove only that search's result.
- **U8 Closed-source competitor.** "DevOps Gate" (desktop cockpit for ADO PR review) could not be inspected. *Proposed (UNEXECUTED):* none beyond public materials; do not treat its existence as evidence of any implementation detail.

## 5. Source register (versions and exact locators)

All hashes are sha256 of the fetched bytes as returned by the retrieval tool; complete per-source detail, including finding-to-source links and rejected candidates, is in `out/acquisition.json`.

- Microsoft Learn REST 7.1 docs (Policy Evaluations List; PR Iterations Get/List; PR Iteration Changes Get; PR Statuses List) — API versions 7.1 / 7.1-preview.1, doc commit `cb0d0b30ca71a83e03cc7a7bbd9361e1a432b377`, doc `updated_at` 2025-03-18, retrieved 2026-10-01 (S1–S5).
- QVL-ToolBox/PrViewer `main`: `README.md` (d0f16ae6…), `src/providers/ado.ts` (6b57b42b…), repo pushed 2026-07-08, code pins `api-version=7.1` (S6, S10).
- zunhdev/azure-pr-viewer `main`: `README.md` (5f7b31c0…), `docs/architecture.md` (7ad9af78…), repo pushed 2026-07-24, MIT (S7, S8).
- Meral-IT/PullRequest-Manager `develop`: `README.md` (490718bb…), repo pushed 2026-07-24, non-commercial license (S9).
- BipulRaman/DevCenter `main`: `README.md` (90e1aef7…), repo pushed 2026-09-28 (S11).
- cli/cli `trunk`: `pkg/cmd/pr/view/view.go` (2a442223…) (S12).

*Every proposed validation above is UNEXECUTED; this report contains no invented access, execution, or probe evidence.*
