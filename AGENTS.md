# AGENTS.md — Puppet Master

## Project context
Puppet Master is being rebuilt from scratch from the canonical `Plans/` specification. The old Rust/Iced app was removed. The intended implementation direction is Rust + Slint.

## Source of truth
- Read `Plans/00-plans-index.md` first.
- Treat `Plans/**` as canonical.
- Treat `Plans/ledgers/**` as source/source-lineage memory only, not canonical product prose.

## Governance artifacts
- `Plans/Spec_Lock.json`, `Plans/auto_decisions.jsonl`, `Plans/_shards/**`, and `Plans/.evidence/**` are build-governance artifacts.
- Do not hand-edit generated shards/evidence. Regenerate them with the repo scripts when a governance task explicitly allows it.

## Verification
Use `python3 scripts/pm-plans-verify.py run-gates` for the standard plan-governance check. Use `python3 scripts/pm-shard-plans.py --check` for shard body/path verification.

## Safety
Do not add secrets or local machine state. Do not recreate the removed legacy Iced app unless explicitly asked.


## PM Bootstrap Planning Ledger and PlanUnit workflow
Use this workflow when Jared asks to start, continue, spec, design, compile, standardize, index, audit, or seal through the PM ledger system.

Trigger phrases:
- "Use the PM Bootstrap Planning Ledger"
- "Start a PM ledger"
- "Continue ledger <ledger_id>"
- "Compile ledger <ledger_id> to Plans"
- "Convert Plans to the standard format"
- "Generate PlanUnit index"
- "Generate node-readiness report"
- "Seal governance"

Ledger locations and authority:
- New structured bootstrap ledgers live under `Plans/ledgers/v2/<ledger_id>/`.
- `Plans/ledgers/v2/ledger_registry.json` is the registry for active, paused, compiled, and sealed ledgers.
- Legacy `working_ledger.md` files and `Plans/ledgers/work_items/**` are preserved source-lineage only. Do not use them as the active v2 ledger format unless explicitly running migration/audit.
- The ledger is planning/source memory, not assistant memory, not Plan Mode, and not canonical product prose. Canonical product/build truth remains live non-pipeline `Plans/**` docs.

Normal conversational feature-spec flow:
1. Create or resume a v2 ledger.
2. Read only `state/handoff.json`, `state/current.json`, `state/open_items.json`, and `state/operating_capsule.json` by default.
3. Do not read full `events.jsonl` or source shards unless the state files point to a specific source_ref that needs inspection.
4. After every substantive turn, append/update ledger records and rewrite current-state projections.
5. Preserve exact tokens, negative constraints, examples, owner hints, compatibility-only notes, stale/retired concepts, and user corrections.
6. Automatically classify every design atom as `gui_related: true|false`. The user does not need to label GUI work.
7. Do not write canonical Plans until Jared explicitly asks to compile the ledger.

Compilation flow:
- Compile accepted design atoms into stable PlanUnits in the appropriate owner docs.
- Every PlanUnit must carry `gui_related: true|false`; infer it from the content.
- Mark `gui_related=true` for GUI/UI/screens/pages/panels/forms/layout/styling/components/icons/SVGs/images/screenshots/user-visible visual presentation.
- Preserve source refs from ledger atoms to PlanUnits.
- Plan docs are not work-node manifests. PlanUnits expose dependency, risk, validation, `gui_related`, and node-readiness metadata.
- The current index phase may produce a PlanUnit index and node-readiness report only. Do not create WorkNodes or executable build tasks until the WorkNode compiler contract exists.
- If owner placement is ambiguous, record candidate owners and adjudication evidence; do not ask row-by-row unless a true product decision is required.

Spec Lock and governance:
- Do not update `Plans/Spec_Lock.json`, generated shards, evidence bundles, plan graph, or governance locks during ordinary ledger writing, plan drafting, plan conversion, or PlanUnit indexing.
- Refresh governance artifacts only in an explicit governance seal phase after canonical docs and generated indexes stop changing.

Use the repo skill `$pm-bootstrap-planning-ledger` when available. If skills are unavailable, follow `Plans/bootstrap/Bootstrap_Planning_Workflow.md` and the prompts in `Plans/bootstrap/Codex_Prompts.md`.

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
- Governance reseals (`Plans/Spec_Lock.json`, `Plans/.evidence/**`, readiness artifacts) are done only by the designated Plans agent, never as part of ordinary work. The designated Plans agent's reseal scope includes the one required row in `Plans/auto_decisions.jsonl`, the `refresh-batch-hashes` and `refresh-final-summary` pair on migration run `pds-20260611-002-atomize-planunits`, the run the aggregate checks validate (`pm-plans-verify.py` `DEFAULT_PLAN_MIGRATION_RUN`), and the currentness edition written in place after a backup; the run named in `current_run.json` is refreshed only by the nightly `snapshot-current`.

### How to compile a ledger
- Compiling a ledger into owner prose is one task; its schema, fixture and gate companions are a second task. Do the prose first and nothing else, then the companions.
- Between the two, run the compile witness: `python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/<ledger_id> --base origin/main`. It is a static text check with no model in it: every unit a findings record claims to repair must be a compile target and must actually differ from the base revision, every exact token of a compiled atom must appear in an owner unit's prose and in that unit's `preserved_exact_tokens`, and every registered token must occur in its own unit's text. Run it before the compile review, not after.
- A compile is ready to land when the deterministic checks pass and one blind form-driven review has run, with a cycle cap of two. Whatever is still open after the second cycle is written down as an open ledger question rather than argued further.

### How to land on main
- Before the fetch for a landing, run `mkdir /mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held`; success means you hold the landing lock, so write your agent name, branch and UTC time to `held/holder.txt`, hold it through the fast-forward, the checks, the push of `main` and the worktree removal, and release it with `rm -r` of that directory; if `mkdir` fails, read `holder.txt` and clear the directory only if it is older than 90 minutes, otherwise wait five minutes and retry; branch pushes need no lock, and `main` is never pushed without holding it.
- `git fetch origin`, then `git rebase origin/main` on your branch. For Plans edits, re-read every passage you cite against the current text before applying; a passage that changed since your snapshot is re-adjudicated, not merged blind. Never hand-merge `_shards` or `.plan_index`; regenerate them.
- In the shared checkout, if `git status` shows uncommitted changes in any file your branch touches, stop and hand the branch over. Otherwise `git merge --ff-only <branch>`, run `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json`, and push `main`. A fast-forward of the shared checkout's `main` is pushed in the same step or reset back immediately with `git reset --keep origin/main`, never left ahead of `origin` while checks or repairs run elsewhere; never use `--hard` in the shared checkout, because it would discard other threads' uncommitted work.
- The shard check reads the working tree, not `HEAD`, so another thread's uncommitted work in the shared checkout can fail your landing. Run the check in your own worktree before you land, so a failure at landing can only be someone else's. If every failure names files your branch does not touch, confirm `HEAD` is consistent (`git cat-file -e HEAD:<named shard>` succeeds and `git show HEAD:<its manifest>` references it), push `main` anyway, and report the failing files to Jared. Never fix or commit another thread's files to make the check pass. If any failure names a file your branch touches, stop and fix it on your branch first.
- After the fast-forward and the shard check, and before you push `main`, run the landing check in the shared checkout: `python3 scripts/pm-landing-check.py --base origin/main`. It has to run before the push: it measures your branch by what `git diff --name-only origin/main..HEAD` names, and once `main` is pushed that list is empty. It runs the same three read-only repository-wide checks (`pm-plans-verify.py run-gates`, `pm-plans-verify.py audit-governance`, and `pm-plan-migration.py validate` against the run named in `Plans/.plan_migration/current_run.json`) and reports only two things: failures that are new since the recorded baseline `reports/landing-checks/baseline.json`, and failures that name a path from `git diff --name-only origin/main..HEAD`, less `Plans/_shards` and `Plans/.plan_index`, whose failures are matched on the units of the documents your branch changed rather than on their own regenerated paths. A per-plan seal no longer runs these checks, so landing is where they run, and they still cost about ten minutes; what changed is that you no longer read several thousand pre-existing failures to find the few that are yours. It exits 0 when it has nothing to report and every subcheck finished, 1 when nothing it reports stops the landing (governance staleness on files your branch edited, pre-existing failures whose baseline count has not risen, failures that are new but name none of your files, or a subcheck that timed out), and 2 when it reports something that does stop it: a failure on your branch's files that is neither staleness nor pre-existing, a bucket that grew whose error kind is not staleness, or a rise in a truncated subcheck other than the readiness growth counter and a run-gates copy judged by its complete audit-governance copy. A failure counts as pre-existing only while the baseline is current, its commit an ancestor of `origin/main` and no more than 7 days older than it; otherwise the report's first lines say the baseline is stale and must be re-recorded before the next landing, never to pass the one at hand, and such a failure on your files stops the landing. A subcheck that timed out is an infrastructure result, never a failure of yours: the run was not fully verified, so it lifts exit 0 to 1 and changes no other exit code.
- The two aggregate checks print only the first 50 (run-gates) or 100 (audit-governance) failures of each subcheck, so 8,800 of the 9,807 they report are never keyed and the match against your branch's paths runs over the printed sample, not over every failure. Such a subcheck is compared by its total only, because which rows it prints can change with nothing added or removed; a rise in that total stops the landing, since nothing can say whether what was added names a file of yours. There are two exceptions. The readiness validator's total is the readiness growth counter, and its rise is staleness, which does not stop the landing, when at least one stale row it printed is new or grew and names a file your branch touches, and no printed row that is not staleness is new or grew. The run-gates copy of a validator is judged by its audit-governance copy instead of by its own total when that copy, run at the same version in the same landing check, reports the same total, printed every failure now and when the baseline was recorded, and lists every row the run-gates copy printed. The check prints which subchecks are truncated, how many failures that leaves unkeyed, and which run-gates copies it judged by their audit-governance copy, and why.
- `Plans/_shards/**` and `Plans/.plan_index/**` do not count as files your branch touched. Regeneration rewrites them whole, so they name every unit in the repository rather than the ones you edited. A failure recorded against them is matched instead on the `plan_unit_id` in its own record, against the units owned by the documents you actually changed.
- What to do with what it reports. A failure that names a file your branch touches and is neither governance staleness nor pre-existing stops the landing: fix it on your branch. A pre-existing failure was on `main` before your branch and does not stop the landing; where its content changed on your files, compare it with the baseline's rows, since the same count can hide one failure fixed and another added. Governance staleness for documents your branch edited (Spec Lock `stale_hash`, stale owner or artifact evidence hashes, a stale readiness report, the stale plan-migration snapshot) is the expected consequence of editing canon before the designated Plans agent's next reseal; it does not stop the landing and is reported with a reseal request. A failure that is new but names no file your branch touches does not stop the landing either: push `main` and report it to Jared, exactly as the shard-check rule above reads. A subcheck that timed out does not stop it by itself, but rerun that subcheck on its own and judge what it reports by these rules before you push `main`. Never fix or commit another thread's files to make a check pass.
- Run it on a whole tree. The check refuses a sparse worktree with exit 3, because the three checks read the whole repository and every file outside a sparse cone reads as missing: a dry run on a worktree without `Concepts` and `tests` produced three blocking items and 76 new failures that were all the absent cone and none of them about the branch. Use the shared checkout at landing, or `git sparse-checkout disable` first; `--allow-sparse` overrides it for a deliberate partial run.
- The baseline is refreshed from a full run against `main` in a full checkout: `python3 scripts/pm-landing-check.py --record-baseline`, committed with the commit it was taken at. That refresh belongs beside the nightly migration snapshot (`pm-plan-migration.py snapshot-current`), which creates a new tracked run directory and so is never run in the shared checkout at landing; it runs in a worktree by the designated Plans agent, whether or not anything landed. There is no cron entry, timer or workflow on this machine, so the nightly run is a Claude scheduled task that does the snapshot and the baseline refresh in one worktree and commits both; `reports/landing-checks/README.md` carries its runbook. Never refresh the baseline to make a landing pass: that excuses exactly the failure it was meant to show. `reports/landing-checks/README.md` says what the baseline holds and what a full checkout has to contain.
- When the branch is on `main`, remove the worktree: `git -C /mnt/Cursor/PuppetMaster worktree remove <path>` and `git branch -d <branch>`.

### Never
- Never run `git gc`, a history rewrite, mass untracking or any repository restructuring. Jared schedules those.
- Never delete or prune anything under `Concepts/`.
- Never commit with `--no-verify`.
- Never leave a worktree behind after its branch has landed.

### After the 2026-09-10 history rewrite
- Every clone and worktree created before 2026-09-10 is stale and must not push. Recreate it from a fresh clone, or run `git fetch origin && git reset --hard origin/main` in the shared checkout and make a new worktree.
