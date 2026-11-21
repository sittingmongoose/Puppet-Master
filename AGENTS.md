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
- This repository holds product canon only: `Plans/**` (owner docs, registries, schemas, fixtures, ledgers, `_shards`, `.plan_index`, `.evidence`, and in `.plan_migration` only runs 001, 002, the current run and the snapshot it declares it supersedes), `Concepts/**` (every HTML concept; never prune or dedupe), `scripts/**`, compact result bundles under `reports/**`, and `tests/fixtures/**` plus the named test files.
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
- In T3 Code, the Puppet Master project is a full local clone of this repository on each machine (`~/src/PuppetMaster` on the VM and the Mac, `C:\Users\sitti\src\PuppetMaster` on Windows), and T3 creates each thread's worktree and branch from it on local disk; that replaces the `~/pm-worktrees` recipe above for T3 threads. Fetch `origin/main` before you branch, push your branch after every landing-sized step, and land exactly as "How to land on main" says, from the shared checkout.

### How to commit and push
- Commit only the paths you changed, with a message that says what they are. Never `git add -A` or `git add .`. Never commit another thread's edits.
- Push your branch after every landing-sized step. Unpushed work does not exist.
- If you edited a `Plans/*.md` document, regenerate its derived files and commit them with the edit: `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` then `python3 scripts/pm-plan-index.py generate`. Regeneration is deterministic; if files for documents you did not edit change, stop and report.
- Governance reseals (`Plans/Spec_Lock.json`, `Plans/.evidence/**`, readiness artifacts) are never part of ordinary work. There is no standing Plans agent: a reseal is its own task, done only by an agent Jared assigns to that reseal, following the latest `reports/governance-reseal-*/reseal-record.md`, and a landing that leaves governance staleness reports a reseal request to Jared instead of resealing. A reseal's scope includes the one required row in `Plans/auto_decisions.jsonl`, the `refresh-batch-hashes` and `refresh-final-summary` pair on migration run `pds-20260611-002-atomize-planunits`, the run the aggregate checks validate (`pm-plans-verify.py` `DEFAULT_PLAN_MIGRATION_RUN`), and the currentness edition written in place after a backup; the landing agent refreshes the run named in `current_run.json` with `snapshot-current` in a full local worktree at the new `main` after a landing that changes `Plans/`.

### How to compile a ledger
- Compiling a ledger into owner prose is one task; its schema, fixture and gate companions are a second task. Do the prose first and nothing else, then the companions.
- Between the two, run the compile witness: `python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/<ledger_id> --base origin/main`. It is a static text check with no model in it: every unit a findings record claims to repair must be a compile target and must actually differ from the base revision, every exact token of a compiled atom must appear in an owner unit's prose and in that unit's `preserved_exact_tokens`, and every registered token must occur in its own unit's text. Run it before the compile review, not after.
- A compile is ready to land when the deterministic checks pass and one blind form-driven review has run, with a cycle cap of two. Whatever is still open after the second cycle is written down as an open ledger question rather than argued further.

### How to land on main
- Before the landing fetch, take the landing lock with `mkdir /mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held` and write your name, branch, UTC time and a unique token in `held/holder.txt`. Use `pm-land-reap.guard` for acquisition, takeover, holder updates, shared Git mutations and release. Confirm the same token under the guard. Renew every 25 minutes while waiting, including during Plans follow-up. Take over only after 90 minutes without renewal and reconcile any interrupted landing before proceeding. Hold the lock through checks, publication, follow-up and worktree removal. Remove only your own holder.
- Anyone who writes a checker input in the shared checkout, including readiness receipts, currentness editions and other ignored inputs the check reads, must hold the landing lock.
- In the topic worktree, fetch, rebase on `origin/main` and push the branch. For Plans edits, re-read passages you cite against current text, and re-adjudicate any that changed. Never hand-merge `_shards` or `.plan_index`. Regenerate them.
- Run `python3 -B scripts/pm-land.py check <branch> --on nas1` under `long-job`. Nas1 is the default. Add `--on 1070ti` for the slower fallback. The command prints the receipt and the checker's original exit. Its own exit 0 means the result was recorded. Judge the checker exit and the shard report by the rules below. Stop on checker exit 2 or 3.
- In the shared checkout, fetch and run `python3 -B "$PM_LAND_SCRIPT" verify --receipt "$PM_LAND_RECEIPT" --commit "$PM_LAND_COMMIT" --base "$PM_LAND_BASE"` under the guard. Use the full checked commit and base, and keep the guard through `git merge --ff-only --no-overwrite-ignore "$PM_LAND_COMMIT"`. If the base moved, repeat the rebase, push and check. Confirm shared HEAD and tree match the receipt. Inspect a failed or incomplete merge under the lock before repairing anything.
- Run `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` in the shared checkout. Fetch and verify again under the guard immediately before the push. Push the exact checked commit to primary main using a lease on the checked base. After any failure following a completed fast-forward, fetch primary and immediately run `git reset --keep origin/main` under the owned guard when the candidate was not published. Check primary if the push result is uncertain. If ownership or safe rollback cannot be established, hand off to the current owner. Never use `--hard` in the shared checkout.
- The shard check reads the working tree, not `HEAD`, so another thread's uncommitted work in the shared checkout can fail your landing. Run the check on the full remote worktree before you land, so a failure at landing can only be someone else's. If every failure names files your branch does not touch, confirm `HEAD` is consistent (`git cat-file -e HEAD:<named shard>` succeeds and `git show HEAD:<its manifest>` references it), push `main` anyway, and report the failing files to Jared. Never fix or commit another thread's files to make the check pass. If any failure names a file your branch touches, stop and fix it on your branch first.
- Run the landing check on the idle machine before pushing `main`. Pass `--base` the full SHA of fetched `origin/main`, along with `--subcheck-timeout-seconds 1800 --json`, and keep the report and its record on the evidence share. It runs the same three read-only repository-wide checks (`pm-plans-verify.py run-gates`, `pm-plans-verify.py audit-governance`, and `pm-plan-migration.py validate` against the run named in `Plans/.plan_migration/current_run.json`) and reports only two things: failures that are new since the recorded baseline `reports/landing-checks/baseline.json`, and failures that name a path from `git diff --name-only <fetched origin/main SHA>..HEAD`, less `Plans/_shards` and `Plans/.plan_index`, whose failures are matched on the units of the documents your branch changed rather than on their own regenerated paths. It exits 0 when it has nothing to report and every subcheck finished, 1 when nothing it reports stops the landing (governance staleness on files your branch edited, pre-existing failures whose baseline count has not risen, failures that are new but name none of your files, or a subcheck that timed out), and 2 when it reports something that does stop it: a failure on your branch's files that is neither staleness nor pre-existing, a bucket that grew whose error kind is not staleness, or a rise in a truncated subcheck other than the readiness growth counter and a run-gates copy judged by its complete audit-governance copy. A failure counts as pre-existing only while the baseline is current, its commit an ancestor of `origin/main` and no more than 7 days older than it; otherwise the report's first lines say the baseline is stale and must be re-recorded before the next landing, never to pass the one at hand, and such a failure on your files stops the landing. A subcheck that timed out is an infrastructure result that lifts exit 0 to 1 and changes no other exit code. Exit 3 means the check could not run or its inputs could not be verified.
- The two aggregate checks print only the first 50 (run-gates) or 100 (audit-governance) failures of each subcheck, so the failures past that cap are never keyed and the match against your branch's paths runs over the printed sample, not over every failure. Such a subcheck is compared by its total only, because which rows it prints can change with nothing added or removed; a rise in that total stops the landing, since nothing can say whether what was added names a file of yours. There are two exceptions. The readiness validator's total is the readiness growth counter, and its rise is staleness, which does not stop the landing, when at least one stale row it printed is new or grew and names a file your branch touches, and no printed row that is not staleness is new or grew. The run-gates copy of a validator is judged by its audit-governance copy instead of by its own total when that copy, run at the same version in the same landing check, reports the same total, printed every failure now and when the baseline was recorded, and lists every row the run-gates copy printed. The check prints which subchecks are truncated, how many failures that leaves unkeyed, and which run-gates copies it judged by their audit-governance copy, and why. A subcheck whose validator writes a complete export is keyed from that export when the export's total matches the printed total, and is then not truncated; the check prints which subchecks were keyed this way.
- `Plans/_shards/**` and `Plans/.plan_index/**` do not count as files your branch touched. Regeneration rewrites them whole, so they name every unit in the repository rather than the ones you edited. A failure recorded against them is matched instead on the `plan_unit_id` in its own record, against the units owned by the documents you actually changed.
- What to do with what it reports. A failure that names a file your branch touches and is neither governance staleness nor pre-existing stops the landing: fix it on your branch. A pre-existing failure was on `main` before your branch and does not stop the landing; where its content changed on your files, compare it with the baseline's rows, since the same count can hide one failure fixed and another added. Governance staleness for documents your branch edited (Spec Lock `stale_hash`, stale owner or artifact evidence hashes, a stale readiness report, the stale plan-migration snapshot) is the expected consequence of editing canon before the next reseal; it does not stop the landing and is reported to Jared as a reseal request. A failure that is new but names no file your branch touches does not stop the landing either: push `main` and report it to Jared, exactly as the shard-check rule above reads. A subcheck that timed out does not stop it by itself, but rerun that subcheck on its own and judge what it reports by these rules before you push `main`. Never fix or commit another thread's files to make a check pass.
- Run it on a full, clean remote worktree at the exact commit. The check refuses a sparse worktree with exit 3 because it reads the whole tree. Discover the ignored inputs from the validators’ read paths and file types. Copy them from the shared checkout and match both path membership and SHA-256 before running the check. Repeat both comparisons at verification. A changed or missing input, a different commit or tree, a dirty or sparse checkout, or a different or abbreviated base stops the landing.
- After publishing a landing that changes `Plans/`, keep the lock and refresh the migration snapshot and baseline by hand in a new full worktree at the new primary main. Run `snapshot-current`, then `--record-baseline`. Commit them together in a separate follow-up and use its own check, verification, fast-forward, shard check, second verification and leased push. Bind its receipt to the inputs used to generate its baseline. For `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl` or a currentness edition, the assigned reseal agent follows the latest `reports/governance-reseal-*/reseal-record.md`. Never record a baseline to make a pending landing pass.
- Verify the original topic and exact tip against freshly fetched primary main before removing its worktree. Inspect tracked, hidden and ignored state and hand back a changed or uncertain checkout. Remove the clean worktree and delete only the verified branch tip. Confirm ownership again under the guard and release only your holder. See `reports/landing-checks/README.md` for the hand commands.

### Never
- Never run `git gc`, a history rewrite, mass untracking or any repository restructuring. Jared schedules those.
- Never delete or prune anything under `Concepts/`.
- Never commit with `--no-verify`.
- Never leave a worktree behind after its branch has landed.

### After the 2026-09-10 history rewrite
- Every clone and worktree created before 2026-09-10 is stale and must not push. Recreate it from a fresh clone, or run `git fetch origin && git reset --hard origin/main` in the shared checkout and make a new worktree.

<!-- agent-rules: start (managed by `agent-rules install` in the Cursor share Inbox folder; edits inside are overwritten) -->
## Browser testing and recording

Use `browser-check` for browser tests and test videos, in a GPU Chrome. `browser-check audit <url> --login user:pass` needs no code. `browser-check slots` shows what is free on all four machines. Run `browser-check guide` once before your first check file (`Agent-Guides/browser-check.md` on the Cursor share). Never use Playwright `recordVideo`, CPU screen recorders, `--disable-gpu` or SwiftShader.

## Extra worker agents

For easy, spec-driven work you may start OMP or Muse workers on the VM: recipe in `Agent-Guides/extra-workers.md` on the Cursor share.

## Thread mailbox

Coordinate with other agents through `pm-mail`, as your global CLAUDE.md or AGENTS.md describes (`pm-mail guide` prints the recipe).
<!-- agent-rules: end -->

<!-- browser-check: start -->
## Browser checks

Kit and project rules: `Concepts/pm7-tools/browser-check/README.md`. Tool rules: `browser-check guide`. Free browser and recording slots on all four machines: `browser-check slots`.

- **Run:** `browser-check run Concepts/pm7-tools/browser-check/checks --set page=<build>.html`. Build with `python3 Concepts/onboarding/opus-5.5/tools/build.py --out <scratch>.html`. Without `--set page` it tests the committed page, which moves only at milestones.
- **Provider logins:** run `Concepts/pm7-tools/browser-check/providers` separately.
- **Per lane:** at most 2 browsers and 1 recording unless the lead gives you more. One kit run is one browser.
- **Other machines:** the page loads as `file://`, so `--host` can't open it. Use ssh and a checkout of the branch there. The Mac and Nas1 clones sit on `main`, so check out the integration branch first.
<!-- browser-check: end -->
