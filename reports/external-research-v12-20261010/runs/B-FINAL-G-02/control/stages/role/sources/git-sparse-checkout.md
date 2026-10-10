# Bounded primary-source evidence: Git sparse-checkout

- URL: https://git-scm.com/docs/git-sparse-checkout/2.42.0
- Version/applicability: versioned 2.42.0 manual. Its change list states there were no manual changes in 2.42.1–2.51.1, including Git 2.43. The manual’s version history is therefore used for the 2.43 target.
- Retrieved: 2026-10-10 05:21 UTC, via web.open on the official versioned manual; relevant passages inspected in the returned page.
- Locators and bounded paraphrases:
  - “set”: cone mode is the default; selected directories and files under them are materialized, along with files immediately under selected/ancestor directories.
  - “CONE MODE HANDLING” / “CONE PATTERN SET”: selecting `packages/editor` includes every file under that directory, plus files directly under `packages/` and at repository top level.
  - “reapply”: merges/rebases can materialize paths to show conflicts; local changes or conflicts may prevent sparsification. Reapply after affected paths are resolved or changes are otherwise handled.
  - “disable”: turns off sparse checkout and restores all files in the working directory.
  - “SUBMODULES”: sparse inclusion changes do not automatically initialize or deinitialize submodules.
  - “set” / `--[no-]sparse-index`: sparse-index behavior concerns the index representation/performance and is a distinct optional feature; it is not described as a network-transfer control.
- Conditions/exceptions: selection updates the working directory. The manual warns that ignored files in directories emptied by a cone change may be removed. Modified files/conflicts can remain outside the cone until handled. Submodule population depends on separate submodule commands/state.
- Use: corrections to inclusion, reapply/disable recovery, safe selection changes, and rejection of mandatory sparse index as a network control.
- No Git command or test was executed for this case.
