# Bounded primary-source evidence: Git clone

- URL: https://git-scm.com/docs/git-clone/2.43.0
- Version/applicability: official versioned Git 2.43.0 clone manual, directly matching the target.
- Retrieved: 2026-10-10 05:20 UTC, via web.open on the official versioned manual; relevant options inspected in the returned page.
- Locators and bounded paraphrases:
  - “--sparse”: starts with top-level files in the working tree; `git sparse-checkout` can expand the working directory.
  - “--filter”: requests a partial clone object subset; `blob:none` defers file contents until Git needs them.
  - “--depth”: creates a shallow clone whose history is truncated to the given commit count.
- Conditions/exceptions: these are separate clone controls. Sparse working-tree selection alone does not claim a bound on bytes transferred. A filter may defer blob transfer until later; shallow history omits commits and conflicts with `history_policy=full`.
- Use: distinguish worktree sparsity, partial-clone blob filtering, and shallow history; omit history truncation and make no unmeasured network claim.
- No Git command or test was executed for this case.
