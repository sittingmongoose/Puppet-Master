# Shard 003: Purpose

Source: `Plans/GitHub_API_Auth_and_Flows.md`

Source lines: L47-L76

Source SHA256: `32b5e5b19be60784a5bf8d23de9b82d5af02249906cd2b65834b12450d631751`

---

## Purpose
Define the canonical GitHub API authentication contract and GitHub API call flows Puppet Master relies on for repository, fork, and pull request workflows.

This document also defines the hard boundary between:
- **Local Git operations** (performed via the local `git` binary), and
- **GitHub hosting operations** (performed via the GitHub HTTPS API).

`github_api` is the auth realm for GitHub REST `/platform` operations such as repo create, fork, PR, and permission checks; GitHub Copilot auth does not authorize these repository/platform mutations.

Git transport auth and GitHub API auth are separate systems. `github_api` tokens never transfer to SSH remotes, local Git credential helpers, or Source Control SSH operations, and an expired or insufficient GitHub API credential is a canonical blocked/runtime condition with owner routing through GitHub Actions or GitHub API auth recovery rather than a panel-local refresh case.

`Plans/GitHub_Integration.md` remains the consumer cross-reference for `/remote` GitHub surfaces: hosted and SSH remote mutations consume FileSafe.md mutation-safety, write-scope, and durability contracts rather than bypassing the FileSafe owner.

Generic API key, HTTP auth, OAuth 2.0, OpenID Connect, and mTLS mechanisms are transport-layer auth families only when an owning provider/runtime contract explicitly maps them into a GitHub operation. They do not replace the `github_api` OAuth device-code flow or OS credential-store token boundary.

ContractRef: SchemaID:Spec_Lock.json#github_operations, Primitive:PatchPipeline, Primitive:Provider

#### Cross-owner command and routing dependencies

- `Plans/Permissions_System.md` / `/Permissions_System.md` owns scope-keyed approval semantics, de-tiered gating language, and permission snapshots consumed by GitHub API mutation gates.
- `Plans/UI_Command_Catalog.md` / `/UI_Command_Catalog.md` owns governance command families, typed route-payload normalization, and projection-freshness gating for GitHub command surfaces.
- `Plans/WorktreeGitImprovement.md` / `/WorktreeGitImprovement.md` owns lane and `/worktree` lifecycle vocabulary, cleanup semantics, gating checks, and transition rules for repository worktree state.
- `Plans/Progression_Gates.md` / `/Progression_Gates.md` owns the replacement of tier-scoped gate logic with package-completion and seam-transition gates that GitHub orchestration consumes.
- Wizard-blocked and thread-blocked flows may serialize `resume_url`, including wizard-step restoration detail, but `/open` behavior normalizes through canonical object identity and scope identity before using that URL.

GitHub API OAuth callback listeners are loopback-only: they bind only to the configured loopback `bind-address` / `bind-host` for the active local, WSL, container, or remote-dev context, and wildcard/public-interface callback binds are invalid.

### GitHub host policy and enterprise availability

`github_host_policy` distinguishes at least `github.com_only` and `enterprise_allowed`. If the MVP remains `github.com_only`, GHES repositories and GitHub Enterprise Server URLs receive deterministic disabled-state UX rather than hidden fallback or accidental downgraded behavior.
