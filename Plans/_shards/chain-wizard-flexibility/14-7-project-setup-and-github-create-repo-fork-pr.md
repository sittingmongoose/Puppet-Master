## 7. Project Setup and GitHub: Create Repo, Fork, PR

### 7.1 Create Repository (New Project)

- **Requirement:** At Project setup, GitHub controls must support **actually creating** a repo, not only linking an existing one.
- **Fields (minimum):**
  - **Repository name** (required when "Create GitHub repo" is checked). Pre-fill from project name when possible; user can edit.
  - **Visibility:** Public / Private (and any org-level options if applicable).
  - **Description:** Optional.
  - **Other fields (optional):** .gitignore template, license, default branch name (when supported by the GitHub API contract used).
- **Action:** On "Create," call GitHub HTTPS API create-repo flow per `Plans/GitHub_API_Auth_and_Flows.md`; then set the remote (e.g. `origin`) and optionally push an initial commit so the project is ready.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, ContractName:Plans/GitHub_API_Auth_and_Flows.md

### 7.2 Fork: Offer to Create or User Does It

- **Requirement:** For intents **Fork & evolve** and **Contribute (PR)**, we **offer** to create the fork for the user, but **allow the user to create the fork themselves**.
- **Offer to create:**
  - User supplies **upstream repo** (URL or `owner/repo`).
  - Button or link: **"Create fork for me."** We call the GitHub HTTPS API fork/create flow. Fork destination defaults to the authenticated user's account; org forks are future scope.
  - After creation, we resolve the fork clone URL via GitHub API, **clone** the fork to the chosen project path, set that as the working project, and optionally set `upstream` remote to the original repo. Set `fork_created_by_app: true` and store `fork_url_or_path` in wizard state.
- **User does it themselves:**
  - Option: **"I'll create the fork myself."** We show brief instructions (e.g. "Fork the repo on GitHub, then paste your fork URL or clone path below") and a field for **fork URL** or **local path** after they clone. We use that as the working project and do **not** call any fork/create API. Set `fork_created_by_app: false`. Validate path/URL is a valid git repo; optionally check for `upstream` or `origin` pointing to the expected repo.
- **Validation:** If user chose "Create fork for me," verify fork exists and we have clone URL before proceeding. If "I'll do it myself," verify the path or URL is a valid git repo and optionally that it has an `upstream` or origin pointing to the expected repo.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, ContractName:Plans/GitHub_API_Auth_and_Flows.md

### 7.3 PR Flow: Start (Fork, Clone, Branch)

- **Goal:** For "Contribute (PR)," we do (or guide) the standard **start** of a PR: fork → clone → create a **feature branch**.
- **Steps we offer:**
  1. **Fork** -- Already covered in §7.2 (offer to create or user does it).
  2. **Clone** -- If we created the fork, we clone it to the chosen path. If user provided fork path/URL, we use it (or clone if URL).
  3. **Branch** -- Create a **feature branch** (e.g. `feature/add-x` or `fix/issue-42`). User can name it or we suggest from intent/requirements (e.g. "feature/" + slug from first line of requirements). All work happens on this branch.
- **Worktree vs feature branch (Contribute PR):** For **Contribute (PR)** we do **not** create tier worktrees (no per-tier worktree branches). All work happens on a **single feature branch** in the **main clone** (the fork clone at `project_path`). Steps: fork → clone to project path → create one feature branch in that clone → run Interview and orchestrator work on that branch. No separate worktrees for subtasks for this intent.
- **UI:** After fork/clone, show "Create feature branch" with optional branch name input; on confirm, run `git checkout -b <branch>` (or equivalent). Then proceed to requirements and Interview.

### 7.4 PR Flow: Finish (Commit, Push, Open PR)

- **Goal:** After the orchestrator (or user) has made changes, we **offer** to commit, push the branch to the fork, and open the Pull Request. User can also do these steps themselves.
- **Steps we offer:**
  1. **Commit** -- Gather changed files (or use a suggested list from last run). User provides **commit message** (or we suggest one from task/phase). Run `git add` and `git commit`.
  2. **Push** -- Push the current branch to the fork (`origin` or user's fork remote). Auth must be sourced from SSH or OS credential store at runtime; do not embed tokens in remotes or logs. Surface push errors (permission/network).
  3. **Open PR** -- Create the Pull Request via GitHub HTTPS API: **from** current branch on the fork **to** the default branch of **upstream**. Do **not** assume upstream default branch is `main` or `master`; fetch `default_branch` via GitHub API before creating the PR. Link to the new PR in the UI.
- **User does it themselves:** Option "I'll commit and open the PR myself" with short instructions (commit, push, open PR on GitHub) and optional link to GitHub "Compare & pull request" for their branch.
- **Help for first-time contributors:** Optional in-app blurb or link: "What's a PR? You work on a branch of your fork; we push it and open a request for the upstream repo to merge your changes."

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, ContractName:Plans/GitHub_API_Auth_and_Flows.md, PolicyRule:no_secrets_in_storage

### 7.5 Integration with WorktreeGitImprovement and MiscPlan

- **Branch naming:** Reuse sanitization and strategy from WorktreeGitImprovement.md (branch naming, no invalid refs).
- **PR creation:** PR creation uses the GitHub HTTPS API per `Plans/GitHub_API_Auth_and_Flows.md`. For "Contribute (PR)" finish flow, we may use a different PR body template (e.g. "Feature: ..." + acceptance summary) but must sanitize secrets.
- **GitHub auth:** Fork creation and PR creation require GitHub OAuth token in OS credential store; do not store tokens in seglog/redb/Tantivy or logs.

**Required GitHub auth scopes (MVP):** **repo** (full) -- required for create repo, fork, push branch, open PR. **read:org** -- optional for MVP; required only if we add "Fork to organization." Document these in Doctor/Setup and in user-facing docs. On permission errors (e.g. 403), show: "Permission denied: ensure your GitHub token has the **repo** scope (and **read:org** if using organization fork)." with a link to token/settings.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.github_operations, ContractName:Plans/GitHub_API_Auth_and_Flows.md, PolicyRule:no_secrets_in_storage

### 7.6 Gaps and Risks

- **Non-GitHub hosts:** Fork/PR flow is specified for **GitHub** only. **Future:** GitLab and Bitbucket can be stubbed with the same UX (create repo, fork, MR/PR); implementation uses the appropriate host HTTPS API per host. No implementation for non-GitHub in MVP.
- **Org vs. user fork:** **MVP = user fork only.** Fork is created in the authenticated user's account via GitHub API. **"Fork to organization"** is a future option; when added, document the GitHub API fields and required scopes.
- **Rate limits:** Creating repo/fork and opening PR use GitHub API; respect rate limits and surface "too many requests" (or equivalent) to the user.

---

