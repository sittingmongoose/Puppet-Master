# Review Desk — Independent Azure DevOps Discovery Report

Case: `azure-discovery-dev-v1` · Card: `t09-m-azure-discovery-screen-v1-treatment`
Date (UTC): 2026-09-30 · Visibility: plan-blind (only `inputs/brief.md` admitted; no plan/spec/key/history)
Method: public external search + read-only primary-source inspection. No supplied source list; all sources chosen by the researcher.
Out-of-scope actions (not performed): creating statuses, requeueing builds, editing policy configuration, approving reviews, merging, any external writes.

## 1. How this report was derived

Research questions were derived from the brief's promises and assumptions *before* searching:

- RQ1 Review versions: what is a "version" of an Azure DevOps PR, what creates a new one, how is it ordered and addressed?
- RQ2 Comparison: how is a selected version compared with earlier work (merge-base vs pairwise), including renames, binaries, large diffs?
- RQ3 Checks/policies: which APIs say which policies apply and what current results mean (required vs advisory, blocking vs optional)?
- RQ4 Honest gaps: what does incomplete/unavailable provider data look like over the API (truncation, preview-only, permissions, throttling)?
- RQ5 Moving context: how does a read-only client keep the selected review context clear as the PR changes (polling, new iterations, lifecycle transitions)?
- RQ6 Identity/connection: what does "existing account choice" imply for auth (PAT vs OAuth/Entra, scopes, Services vs Server)?
- RQ7 Failure inputs: missing/malformed/versioned/reordered inputs, renames/deletes, permission errors, recovery?
- RQ8 Size/latency: pagination shapes, rate limits, repository and diff size constraints?
- RQ9 Simpler alternatives and improvements: SDKs/CLI vs raw REST, and positive opportunities beyond defect hunting?

Each question is a hypothesis tested against the sources below. Question-to-query-to-evidence links and dead ends are recorded in `scheduling.json`; selected URLs, versions, queries/reads and finding-to-source links are recorded in `acquisition.json`. A failed search proves only that search result, not absence.

## 2. Findings (independent identities)

### F-01 — PR "versions" are iterations: ID 1 = source head at creation, +1 per push

Azure DevOps models review versions as pull-request *iterations*. Iteration one is the head of the source branch when the PR is created; subsequent iterations are created when there are pushes to the source branch. Iteration IDs are integers from 1 to the current maximum on the PR.

- Evidence: S-02 `GET .../iterations/{iterationId}/changes` URI-parameter description (`view=azure-devops-rest-7.1`, API version 7.1, doc `updated_at` 2025-03-18, git commit `cb0d0b30`).
- Conditions: pushes to the *source* branch create iterations; target-branch movement does not create a new iteration but changes merge-base comparisons. Force-push/amend still yields a new iteration (push-based, not commit-count-based).
- Transfer limit: applies to Azure DevOps Git PRs only; TFVC shelvesets and GitHub-style "diff of latest push" have different semantics.
- Thin-plan risk: treating "version" as a commit SHA list instead of an iteration id breaks range comparison and comment anchoring (see F-03, F-09).

### F-02 — Iteration listing API supports optional per-iteration commits

`GET https://dev.azure.com/{organization}/{project}/_apis/git/repositories/{repositoryId}/pullRequests/{pullRequestId}/iterations?api-version=7.1` lists iterations; `?includeCommits=true` includes each iteration's commits in the same response. A single iteration is retrievable at `.../iterations/{iterationId}?api-version=7.1`.

- Evidence: S-01 (List, 7.1), S-13 (Get, 7.1); same doc version as F-01.
- Conditions: `repositoryId` accepts ID or name; `project` accepts ID or name. OAuth scope `vso.code`.
- Thin-plan risk: N+1 fetching per iteration when `includeCommits` would do; or the reverse — always paying for commits when only the iteration count/anchor is needed.

### F-03 — Iteration comparison has two modes: merge-base (default) vs pairwise

`GET .../iterations/{iterationId}/changes` takes `$compareTo` (default 0 = compare against the common/merge-base commit between source and target branches), plus `$top`/`$skip` pagination. Setting `$compareTo` to an earlier iteration id gives a pairwise "what changed since version N" view. Community implementations confirm the UX convention: selecting one iteration compares it with its predecessor; selecting a range compares newest vs (oldest − 1), i.e. range 2–4 compares iteration 4 against iteration 1.

- Evidence: S-02 (7.1, `$compareTo` default-zero semantics); S-24 (vscode-pr-azdo range-selection behavior, secondary, versioned only by fetch date).
- Conditions: default (`$compareTo=0`) answers "what would this version merge"; pairwise answers "what did the author change since I last looked". Both are legitimate; they answer different review questions.
- Transfer limit: S-24 is a third-party client convention, not provider behavior; adopt as UX guidance, not API fact.
- Thin-plan risk: exposing only "latest vs target" hides inter-version changes the brief's "compare the selected version with earlier work" requires.

### F-04 — Get-PR has documented-but-unused parameters; use the documented useful ones

`GET .../pullrequests/{pullRequestId}?api-version=7.1` documents `$skip`, `$top`, `maxCommentLength` as "Not used". Useful options are `includeCommits` and `includeWorkItemRefs`.

- Evidence: S-04 (7.1).
- Thin-plan risk: a thin client may pass `$top`/`maxCommentLength` expecting truncation control and silently get none; comment/thread volume must be managed via the threads API (F-09).

### F-05 — Reviewer votes are a five-value scale with group roll-up, not approve/reject

`vote`: 10 approved, 5 approved with suggestions, 0 no vote, −5 waiting for author, −10 rejected. Groups/teams can be reviewers but cannot vote directly; member votes roll up into the group vote. `isRequired` marks required reviewers. Only 10 counts as a full approval; 5 is qualified, not rounding up.

- Evidence: S-05/S-06 primary docs (7.0/6.0 wording identical); S-07 (ubiquex merge-acceptance analysis confirming current docs); S-03 reviewers-list endpoint (7.1, scope `vso.code`).
- Conditions: vote semantics are stable across 6.0–7.1 docs. Required-reviewer state also interacts with branch policy (F-08); the reviewer list alone does not say whether policy is satisfied.
- Thin-plan risk: binary approve/reject presentation misleads (5 vs 10, −5 vs −10 mean different things); group reviewers need "no direct vote" explanation.

### F-06 — "Checks" come from TWO APIs that a thin client easily confuses

`GET .../pullRequests/{pullRequestId}/statuses?api-version=7.1` (S-08) returns only statuses posted via the Status API (third-party/manual/external integrations). It does **not** return branch-policy evaluations (build validation, required reviewers, comment resolution, status checks required by policy) — the "green checks" users see in the PR UI. Policy evaluations live under `GET .../_apis/policy/evaluations?artifactId=...` (F-07). A read-only review client must query and present both, labeled by source.

- Evidence: S-08 (7.1, scopes `vso.code`, `vso.code_status`); S-09 (policy evaluations list); S-10 (azdo-cli research documenting the statuses-vs-evaluations gap, secondary).
- Thin-plan risk: highest-severity correctness risk in this report — showing only `/statuses` reports a commonly green build-validation policy as "no checks".

### F-07 — Policy evaluations need a project-GUID artifact ID and are preview-versioned

Evaluations are addressed by artifact ID `vstfs:///CodeReview/CodeReviewId/{projectId}/{pullRequestId}` where `projectId` is the project GUID (resolve names via the Projects API first). API version is `7.1-preview.1` — preview-only. `includeNotApplicable=true` also returns policies that evaluated as not-applicable; `$top`/`$skip` paginate.

- Evidence: S-09 (7.1-preview.1); S-11 (project-GUID + Policy-read requirement, secondary).
- Conditions: preview APIs may change or behave differently on Server (F-13). Not-applicable evaluations are hidden by default — "which checks apply" requires deciding how to present not-applicable vs unevaluated.
- Thin-plan risk: hard-coding a project *name* into the artifact ID fails; pinning only stable versions misses this endpoint; ignoring `includeNotApplicable` hides "does not apply" explanations the brief wants presented honestly.

### F-08 — Policy configuration types: minimum reviewers, build validation, comment resolution, merge strategy, work-item linking, auto reviewers

Branch policies commonly include: minimum reviewer count (with reset-votes-on-push option), build validation (pipeline, automatic/manual, blocking vs advisory, build expiry), comment resolution (all threads resolved), merge-strategy limits (squash/rebase/no-fast-forward), linked-work-item checks, and automatically-included reviewers. Configuration listing: `GET .../_apis/policy/configurations?api-version=7.1` (S-12); its `scope` parameter is legacy — scope filtering belongs to `/_apis/git/policy/configurations`.

- Evidence: S-12 (7.1, continuationToken pagination); S-13b/secondary policy tables (psmfd, pkuppens, smotherer007 skill docs — mutually consistent).
- Conditions: `isBlocking`/`isEnabled` per configuration determine "required" vs advisory; evaluation `status` says current result. Read-only case: never mutate configuration (brief excludes it).
- Thin-plan risk: presenting every evaluation as equally blocking; or omitting configuration display names so results are unexplained GUIDs.

### F-09 — Threads are iteration-anchored; positions need ($iteration, $baseIteration)

`GET .../pullRequests/{pullRequestId}/threads?$iteration={n}&$baseIteration={m}&api-version=7.1` returns threads with positions tracked using the given iterations as right/left diff sides. Comment context carries `firstComparingIteration` (older) / `secondComparingIteration` (newer). Thread `status` (active/fixed/resolved/closed variants) feeds the comment-resolution policy.

- Evidence: S-14 (7.1 threads list); S-15 (CommentIterationContext field semantics, secondary citing MS docs).
- Thin-plan risk: showing comments without their iteration context misplaces them after new pushes; "keep the selected review context clear as the PR changes" needs the anchored triple (thread, firstComparing, secondComparing).

### F-10 — Generic commit-diff API covers arbitrary compares with merge-base handling

`GET .../diffs/commits?baseVersion=...&targetVersion=...&diffCommonCommit={bool}&$top&$skip&api-version=7.1` finds the closest common commit (merge base) and diffs base↔target or common↔target. `$top` defaults to 100.

- Evidence: S-16 (7.1).
- Conditions: version descriptors take branch/tag/commit with type + options (e.g. Previous). Pagination via `$top`/`$skip` with `isComplete`-style completion signaling reported by consumers (S-17, secondary).
- Use: fallback for compares outside iteration pairs (e.g. PR head vs arbitrary base) and for target-moved explanations.

### F-11 — File content comes from the Items API with version descriptors and LFS handling

`GET .../items?path=...&versionDescriptor.version=...&versionDescriptor.versionType=...&resolveLfs=...&api-version=7.1` fetches metadata/content at a version; supports download/zip formats, recursion, content metadata, LFS resolution.

- Evidence: S-18 (7.1).
- Conditions: large/binary files need `resolveLfs`, size guards, and "cannot render" honesty (F-16). Path renames across iterations complicate per-file history.
- Thin-plan risk: assuming every changed path is fetchable/renderable text.

### F-12 — Auth: Entra/OAuth preferred on Services; PAT/NTLM on Server; least-privilege scopes

Microsoft recommends Entra ID / OAuth for new Services integrations and PATs only sparingly; OAuth 2.0 and Entra are Services-only, not Server. All REST APIs accept OAuth tokens; some account-level APIs accept only OAuth. Relevant read scopes: `vso.code` (code read), `vso.code_status` (status read/write — read-only client needs the read subset), plus Policy (read) for evaluations and Build (read) for backing pipeline runs. PATs use HTTP Basic (blank username, PAT as password).

- Evidence: S-19 (auth guidance, updated 2026-08-05), S-20 (PAT docs), S-08/S-03 (per-endpoint scopes), S-21 (service-principal/managed-identity scope shape, secondary).
- "Existing account choice" implication: the desktop companion inherits whatever identity the account picker yields — it must degrade honestly when that identity lacks Policy/Build scopes (show "evaluation unavailable: missing scope" rather than "no policies").
- Transfer limit: Server deployments vary (NTLM/Kerberos/PAT); Entra guidance does not transfer to Server.

### F-13 — Versioning: pin per-endpoint api-version; 7.1 stable, 7.2 preview; Server lags Services

Always send explicit `api-version`. 7.1 is the latest stable; 7.2 requires `-preview` (S-22). Policy evaluations are `7.1-preview.1` (preview-only, F-07). Server↔REST mapping: Server 2022.1→7.1, 2022→7.0, 2020→6.0, 2019→5.0 (S-23). Older Servers reject newer api-versions with HTTP 400 (S-26, secondary field report). Preview contracts may change.

- Evidence: S-22 (7.1-vs-7.2-preview), S-23 (mapping table), S-26 (400-on-newer-version field report), S-09 (preview-only evaluations).
- Thin-plan risk: one global api-version constant breaks either evaluations (needs `-preview.1` suffix) or older Servers (reject 7.1). Design: per-area version table + 400-fallback (retry with older stable) + honest "server too old for X" messaging.

### F-14 — Two pagination dialects coexist; handle per endpoint

`$top`/`$skip` (iteration changes, diffs, evaluations) vs `continuationToken` (policy configurations) vs `x-ms-continuationtoken` header on other areas. Consumers report `isComplete`/`nextSkip`-style completion on change/diff payloads.

- Evidence: S-02, S-09, S-12 (primary params); S-17, S-27 (secondary pagination behavior).
- Thin-plan risk: one pager implementation silently truncates the other dialect's collections. Always loop to completion or label results partial.

### F-15 — Throttling is consumption-based (TSTU) with 429 + Retry-After; poll politely

Services applies global consumption limits (a user exceeding ~200× typical consumption in a sliding 5-minute window gets delayed ms–30s) plus per-resource throttling surfaced as HTTP 429 with `Retry-After`. Git participates in rate limiting.

- Evidence: S-28 (rate-limits doc, updated 2026-07-31); S-29/S-30 (429 + Retry-After handling, secondary, mutually consistent). A "~200 requests/user/minute" figure appears only in a secondary connector doc (S-31) — UNVERIFIED, do not design to it.
- Implication: read-only desktop client should poll with backoff, honor `Retry-After`, batch (includeCommits, $top), and cache; service-hook webhooks (F-17) are the push alternative but need a reachable endpoint, which a desktop app typically lacks.

### F-16 — Size constraints: repo/push/path limits, LFS, truncation honesty

Repos: 250 GB hard guidance, <10 GB recommended; oversized repos hit pack limits and write errors. Push/file guidance: LFS for large binaries (unlimited free LFS storage on Services per announcement S-33); a ~100 MB file / TF401022 auto-merge failure and 5 GB push-limit figures appear only in secondary/issue sources (S-32) — treat as UNVERIFIED hints, not guarantees. Diffs default to 100 entries (`$top`) and large PRs will page.

- Evidence: S-32 (Git limits doc, updated 2026-05-07); S-33 (LFS announcement); S-16 ($top default 100).
- Implication for "explain incomplete data honestly": truncation (paged diffs), unrenderable binaries, LFS-pointer files, and oversized content must surface as explicit states ("showing 100 of N changes"), never silent cuts.

### F-17 — PR lifecycle and context-keeping: states, draft, merge status, change signals

PR search/lifecycle states include active (open), completed (merged/closed), abandoned; `isDraft` marks drafts; `mergeStatus`/`mergeId` describe mergeability/conflicts (S-04 shape; S-34 secondary mapping). Change signals: service-hook events `git.pullrequest.created/updated` and `ms.vss-code.git-pullrequest-comment-event` (S-35, secondary citing event names) for server-side push; a desktop companion without a callback URL must poll PR + iterations + evaluations and anchor the UI to explicit (PR id, iteration id, compare-base) triples, announcing "iteration N arrived; you are viewing N−1".

- Evidence: S-04 (PR resource), S-34/S-35 (secondary lifecycle/event mappings).
- Thin-plan risk: re-querying "latest" without anchoring silently moves the user's review context — exactly what the brief forbids.

### F-18 — Simpler implementation alternatives to hand-rolled REST

`azure-devops-node-api` (`IGitApi`: getPullRequest(s), iterations, iteration changes, reviewers, threads) and the Python/CLI equivalents (`az repos pr ...`, `az devops invoke`) wrap the same endpoints with auth/paging helpers. Trade-off: SDKs simplify auth surface and model types but lag preview endpoints (e.g. evaluations `7.1-preview.1` may need raw fetch) and can return null-vs-throw on unexpected shapes (S-38 field report).

- Evidence: S-36 (node-api README), S-37 (MS Node status-server sample), S-38 (null-return pitfall), S-39 (SDK-vs-fetch hybrid architecture).
- Recommendation: SDK for stable Git reads + raw REST for evaluations/preview + one shared retry/pager — simpler than full hand-roll, safer than SDK-only.

### F-19 — Malformed/missing/reordered input handling (defensive matrix)

Observed or directly implied behaviors: unknown org/project/repo/PR → 404 (possibly 401/403-masked when the identity lacks access — distinguish "not found" from "no access" in UX); non-numeric PR id → 400; iteration out of 1..max → error (S-02 bounds); renamed project/repo breaks saved IDs/names (re-resolve by ID, confirm name drift); reordered/stale inputs (viewing iteration N after N+1 exists) require anchoring (F-17); permission loss mid-session → re-auth prompt, not blank screens; network failure → exponential backoff honoring `Retry-After` (F-15).

- Evidence: S-02 (iteration bounds), S-04/S-01 (ID-or-name parameters), S-28 (backoff context); 404/400/401 shapes are standard REST behavior — exact bodies UNVERIFIED (see U-04).
- Thin-plan risk: a happy-path client turns every provider hiccup into an empty view with no explanation.

### F-20 — Improvement opportunities (beyond defect hunting)

1. Blocking-vs-advisory check grouping with per-policy display names and "why required" links (F-07/F-08).
2. "Since my last look" pairwise iteration compare as the default review increment (F-03).
3. Stale-evaluation badges: evaluation predates latest iteration → "ran against older code" (F-07 + F-01).
4. Reviewer-coverage view: required vs optional, group roll-ups, 5-vs-10 qualification (F-05).
5. Honest-state design system: partial/truncated/unauthorized/too-old-server/preview as first-class UI states (F-13–F-16).
6. Cheap refresh: ETag/poll only (PR, latest iteration id, evaluations) on a cadence, full diff on demand (F-15).

## 3. Supported obligations vs optional capabilities vs product decisions

- Supported obligations (provider-backed, must implement): iteration listing/anchoring (F-01/F-02), both checks sources with source labels (F-06/F-07), five-value votes with group explanation (F-05), explicit api-version per endpoint incl. preview evaluations (F-13), both pagination dialects to completion-or-labeled-partial (F-14), 429/Retry-After backoff (F-15), read-only scope discipline (F-12).
- Optional capabilities (provider-supported, product chooses): pairwise vs merge-base default compare (F-03), thread display with iteration anchoring (F-09), arbitrary commit diffs (F-10), file content rendering with LFS/binary guards (F-11), draft/merge-status surfacing (F-17), SDK-vs-REST stack (F-18).
- Product decisions (not provider-dictated): poll cadence, default compare mode, grouping/labeling of checks, which honest-states get dedicated UI, how much Server-back-compat to carry (7.1 vs 6.0/5.0 fallbacks).

## 4. Plan implications

No plan is admitted in this plan-blind task (only `inputs/brief.md`); therefore no plan-specific implications can be stated. Section 2's "thin-plan risk" notes mark what any minimal implementation is likely to miss.

## 5. Unresolved areas and proposed validation (all UNEXECUTED)

- U-01 Exact evaluation `status` enum values and their UI meanings (queued/running/approved/rejected/broken variants). Proposed: read the Policy Evaluations Get-single + configuration-type docs and one SDK model file. UNEXECUTED.
- U-02 Iteration-changes completion signaling (`changeCounts`? truncated flag? nextSkip/nextTop?) for exact "N of M" UI. Proposed: read the full S-02 response schema beyond the truncated fetch. UNEXECUTED.
- U-03 Fixed per-minute request numbers (the "~200/min" figure is single-secondary-source). Proposed: check current rate-limits/best-practices docs; design to 429-handling regardless. UNEXECUTED.
- U-04 Exact error bodies for 400/401/403/404 on Git/Policy endpoints (masking behavior). Proposed: read MS error-handling guidance; live probing NOT performed (would be external execution). UNEXECUTED.
- U-05 Preview-endpoint availability on Server 2020/2022 (does `7.1-preview.1` evaluations exist there?). Proposed: read Server-versioned REST docs (`view=azure-devops-server-*`). UNEXECUTED.
- U-06 PR labels, properties, work-item refs depth, and auto-complete state machine. Proposed: read labels/properties endpoints. UNEXECUTED.
- U-07 Binary/LFS/diff-size rendering thresholds in the web UI (what the provider itself refuses to render). Proposed: read Repos web documentation. UNEXECUTED.
- U-08 `mergeStatus` enum and conflict-detail depth available read-only. Proposed: read PR status/merge guidance. UNEXECUTED.

## 6. Costs and limits of this research

- External usage: 14 search queries, 14 primary-source page fetches (all read-only; no live API calls, no auth, no execution). Within the 900 s / 96-response budget.
- Fetches were truncated by the fetch tool; key parameters were captured from the visible windows (URIs, versions, parameter tables) while full response schemas were not always visible — hence U-01/U-02.
- Secondary sources (client implementations, skill docs, issue reports) are labeled as such and used only for conventions/pitfalls, never as API facts.
- No Azure DevOps organization, project, or credential was accessed; no request containing private local text was sent externally.

## 7. Source key

S-01 iterations-list · S-02 iteration-changes-get · S-03 reviewers-list · S-04 pr-get · S-05/S-06 vote-scale docs · S-07 vote confirmation · S-08 statuses-list · S-09 evaluations-list · S-10 statuses-vs-evaluations analysis · S-11 project-GUID note · S-12 policy-configurations-list · S-13 iteration-get · S-14 threads-list · S-15 comment-iteration-context · S-16 diffs-get · S-17 diff pagination · S-18 items-get · S-19 auth guidance · S-20 PAT docs · S-21 SP/MI scope · S-22 api-version stability · S-23 server mapping · S-24 iteration-range UX · S-25 api-version format · S-26 400-on-newer-version · S-27 pagination patterns · S-28 rate limits · S-29/S-30 429 handling · S-31 unverified 200/min · S-32 git limits · S-33 LFS announcement · S-34 lifecycle mapping · S-35 hook events · S-36 node-api README · S-37 node sample · S-38 null pitfall · S-39 hybrid architecture. Full URLs/versions in `acquisition.json`.
