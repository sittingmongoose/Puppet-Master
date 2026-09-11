# Batch 15 — Simple Goal and explicit Plan execution

HTML concept delivery; no native Rust/Slint or provider implementation. Batches 1–14 remain cumulative. Batch 16 is not started.

## Open and exercise
Open `PM_Chat_Assistant_5.6_Pro_Standalone.html`. In **Demo Studio**, the **Simple Goal & explicit execution · Batch 15** section has four examples. Selecting one only prepares the source and composer; **Send** starts admission. Dismiss the guide and continue with the normal controls.

**A Goal that produces a real file:** submit `/goal`, open Goal Activity, pause/resume, then open files and download the computed CSV. Three source-bound To-Dos produce normalized JSON, quoted CSV, and an independent parse verification. Five original rows total 22,324 cents; commas, quotes, an embedded newline, Unicode and trailing spaces survive. Source bytes are not changed.

**You own the objective:** edit in Activity; Save authorizes the next revision. Ask for a replacement uses the ordinary targeted composer, then Current/Proposed with Approve Change or Cancel. Approval does not resume paused work. The sample accepts its original order-export wording, that wording with “Keep all five orders.” appended, and “Export all five supplied orders with exact cents and verify the CSV independently.” This is an explicit bounded task adapter, not a general language model. Other objective edits are saved but do not silently run the old task.

**Build a Plan as a Goal:** Send makes a regular Plan only. Primary Build remains normal non-Goal execution. More → Build as Goal calls the same Plan Build owner with `execution_topology: goal_driven`. Goal, PlanRun, exact-version binding and the existing To-Do list commit together. Goal and Plan Details link to each other. A Goal edit never rewrites the approved Plan: a material conflict stops mutation and exposes Revise. Automatic reconciliation or new authorization after that conflict is not claimed.

**A future build is not a Goal yet:** Send makes a Plan, then More → Build At. Select Build as Goal and save the schedule. No Goal exists until admitted dispatch. Details includes an explicitly labelled local-clock control; this is not an actual background server. Recurring windows and quota reset reuse shared owners and cannot override manual stop.

The existing B14 Deep Plan discovery can also be built as a Goal. Its existing scoped bundle and ledger are reused, not copied. Without a real execution adapter it remains Building with a blocker instead of fabricating completed Deep Plan work.

## Installation
Use `pm-b15-guarded-update.zip`, not blanket replacement from the cumulative archive. Follow its `INSTALL.md`. Default invocation only preflights. Explicit apply requires a new backup directory outside both the repository and extracted package. Unknown/newer overlapping bytes, corrupt payloads and symlink escapes refuse. Unlisted paths are never removed. Git HEAD, staging index and staged content are not changed. Deliberately review and stage the repaired working-tree versions afterward under current AGENTS/worktree rules.

The cumulative source archive is a buildable reference, not a repository snapshot or deletion list. Current pin and verified affected-path identities are in `BATCH_15_SOURCE_REVIEW.json`. Historical B14 checkpoint files remain unchanged; its original delivery manifest is preserved under `history/`.

## Reproduce verification
From this directory, with Python, Node, Python Playwright and Chromium available:

```bash
python3 build.py --check
python3 tests/b15/run.py verify --outdir /tmp/pm-b15-verify
python3 tests/b15/run.py regressions --outdir /tmp/pm-b15-cumulative
python3 tests/b15/run.py record --outdir /tmp/pm-b15-recordings
python3 tests/b15/installer.py --zip /path/to/pm-b15-guarded-update.zip --baseline /path/to/extracted-b14 --outdir /tmp/pm-b15-installer
```

Use fresh external output directories. The browser harness defaults to `/usr/bin/chromium`. Recording additionally needs Xvfb, FFmpeg and ffprobe. Automation here is QA tooling, not the product's Browser Program API. `build.py --check` normalizes its comparison; raw clean-rebuild checks delete both outputs and compare every byte. See the final verification report and evidence for ordinary-navigation availability in this environment.

## Boundaries
One shared Goal store and continuation owner; one Plan owner; the existing per-thread To-Do list, scoped Deep Plan bundle, artifact editor and scheduler. The small transaction journal covers synchronous concept writes and commit-delayed effects. It does not implement native crash-safe storage. Partial rollback conflicts explicitly preserve newer edits rather than claiming full rollback.

Branch/restore tests preserve accepted in-memory revisions and create paused, differently identified Goal bindings without borrowing a live controller. They do not prove host restart, account transfer, native persistence or V1 migration. General-purpose model reasoning, native provider execution, permission service registration, Event Authority admission, governance sealing and formal/global audit closure are not claimed. All 43 worklist source identities are accounted for; missing original packet wording and global full-feature/motion acceptance remain open. See coverage and wiring reports rather than treating an inventory as acceptance.
