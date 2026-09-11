# CLAUDE.md — Puppet Master (PLANNING PHASE)

## Scope (STRICT)
- Allowed edits: `Plans/**`, `Concepts/**`, `Concepts/chat-assistant-concepts/**`, `Concepts/settings-redesign-concepts/Opus 5/**`
- Allowed when explicitly requested: `AGENTS.md`, `.cursorrules`, `.claude/**`, `.cursor/**`
- Disallowed: application code (e.g. `puppet-master-rs/**`), installers, runtime configs

## Working rules for every agent (from 2026-09-10)

### Where things go
- This repository holds product canon only: `Plans/**` (owner docs, registries, schemas, fixtures, ledgers, `_shards`, `.plan_index`, `.evidence`, and in `.plan_migration` only runs 001, 002 and the current run), `Concepts/**` (every HTML concept; never prune or dedupe), `scripts/**`, compact result bundles under `reports/**`, and `tests/fixtures/**` plus the named test files.
- Raw evidence goes to `/mnt/Cursor/PuppetMaster-Evidence/`: experiment captures under `tests/`, superseded migration runs, scratch. `tests/agent_packet_restrictions` in this repository is an ignored symlink into it. Cite evidence by path plus SHA-256. Never commit raw captures, run workspaces, scratch or nested repositories here.
- Experiment code and campaign runtime go to `/mnt/Cursor/PM-Experiments/`, `/mnt/Cursor/PuppetMaster-AssuranceLab/` or `~/PM-Experiments/`.

### Where to work
- Never work on `main` in the shared checkout `/mnt/Cursor/PuppetMaster`. It is for landing only.
- Make your own worktree and branch from the current `main`, on the VM's local disk under `~/pm-worktrees/`, never on the mount. The mount is a network share: every `git status`, checkout and regeneration in a worktree there walks the tree over NFS and slows every other agent, and the periodic scans that the Codex app-server and the Claude desktop server run against an open checkout do the same. A sparse worktree is under 1 GB and the VM disk has room. The first line is still required even on local disk: the worktree's git directory lives inside the shared checkout's `.git` on the mount, which assigns it to another owner.
  ```
  git config --global --add safe.directory ~/pm-worktrees/<name>-<date>
  git -C /mnt/Cursor/PuppetMaster fetch origin
  git -C /mnt/Cursor/PuppetMaster worktree add --no-checkout -b <kind>/<name>-<date> ~/pm-worktrees/<name>-<date> origin/main
  cd ~/pm-worktrees/<name>-<date> && git sparse-checkout set Plans scripts reports Concepts && git checkout <kind>/<name>-<date>
  ```
  Drop directories you do not need from the sparse set. Branch kinds: `research/`, `audit/`, `concept/`, `plans/`, `fix/`. The object store and your worktree's index stay with the shared checkout on the mount; only your working tree is local. That removes the per-file scan over NFS, which is what made git slow, but it does not make every git operation local.
- Open your thread, IDE or Codex session in your worktree, not in the shared checkout, so the harness scans hit local disk.
- Worktrees that already exist on the mount under `/mnt/Cursor/PuppetMaster-research/` may finish the branch they are on; create no new ones there.

### How to commit and push
- Commit only the paths you changed, with a message that says what they are. Never `git add -A` or `git add .`. Never commit another thread's edits.
- Push your branch after every landing-sized step. Unpushed work does not exist.
- If you edited a `Plans/*.md` document, regenerate its derived files and commit them with the edit: `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` then `python3 scripts/pm-plan-index.py generate`. Regeneration is deterministic; if files for documents you did not edit change, stop and report.
- Governance reseals (`Plans/Spec_Lock.json`, `Plans/.evidence/**`, readiness artifacts) are done only by the designated Plans agent, never as part of ordinary work.

### How to land on main
- `git fetch origin`, then `git rebase origin/main` on your branch. For Plans edits, re-read every passage you cite against the current text before applying; a passage that changed since your snapshot is re-adjudicated, not merged blind. Never hand-merge `_shards` or `.plan_index`; regenerate them.
- In the shared checkout, if `git status` shows uncommitted changes in any file your branch touches, stop and hand the branch over. Otherwise `git merge --ff-only <branch>`, run `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json`, and push `main`.
- The shard check reads the working tree, not `HEAD`, so another thread's uncommitted work in the shared checkout can fail your landing. Run the check in your own worktree before you land, so a failure at landing can only be someone else's. If every failure names files your branch does not touch, confirm `HEAD` is consistent (`git cat-file -e HEAD:<named shard>` succeeds and `git show HEAD:<its manifest>` references it), push `main` anyway, and report the failing files to Jared. Never fix or commit another thread's files to make the check pass. If any failure names a file your branch touches, stop and fix it on your branch first.
- When the branch is on `main`, remove the worktree: `git -C /mnt/Cursor/PuppetMaster worktree remove <path>` and `git branch -d <branch>`.

### Never
- Never run `git gc`, a history rewrite, mass untracking or any repository restructuring. Jared schedules those.
- Never delete or prune anything under `Concepts/`.
- Never commit with `--no-verify`.
- Never leave a worktree behind after its branch has landed.

### After the 2026-09-10 history rewrite
- Every clone and worktree created before 2026-09-10 is stale and must not push. Recreate it from a fresh clone, or run `git fetch origin && git reset --hard origin/main` in the shared checkout and make a new worktree.

## Do not hand-edit derived artifacts
- Do not edit: `Plans/_shards/**`
- Do not edit: `Plans/.evidence/**`

## Do not edit these unless your prompt explicitly tells you to
- `Plans/Spec_Lock.json`
- `Plans/auto_decisions.jsonl`

## Pipeline commands
- After editing a Plans document: `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json`, then `python3 scripts/pm-plan-index.py generate`, then `python3 scripts/pm-shard-plans.py --check`.
- Gates (`python3 scripts/pm-plans-verify.py run-gates`) only when your prompt instructs you to run maintenance or verification.

## Safety
- Never add secrets/tokens.

## Finish marker
End with exactly one:
- `<status>COMPLETE</status>`
- `<status>BLOCKED</status>`
