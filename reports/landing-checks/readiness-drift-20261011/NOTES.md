# Readiness input drift — 2026-10-11

At `618fd35e0e52eac0d6df5d1e3ff55d5c0a2bbf4b`, the full clean worktree's readiness
validator returned 29 failures; the shared checkout at the same commit returned 74. Both exited 1.
The ignored `Plans/.audits/event-authority-2026-08-13-currentness/` directory accounts for every
normalized difference: the unavailable-audit row becomes 45 source-drift rows and one live-registry
drift, and the missing PNC-019 receipt hash becomes a stale hash. The baseline records only ignored
`tests/` paths, so it could not establish which audit bytes produced its readiness counts.

The exact dependency closure has 15 files: the five direct inputs listed in the README, plus
`EVENT_OCCURRENCES.jsonl`, `README.md`, `adjudication/EXPECTED_252_EVENT_TYPES.tsv` and the seven
`adjudication/source_groups/group_[a-g].jsonl` files named by the receipt. The inventory describes
251 live sources. Their bytes and the validator script remain live validation inputs rather than
being frozen by the baseline's audit identity.

The fix adds `--readiness-audit-root DIR` to both modes, defaulting to the shared currentness directory
when available. A missing local directory is exposed through a temporary symlink for the checks and
exports, then removed. Existing local data is never replaced. This mechanical source selection
avoids manual copies and requires no validator changes. The source is read only.

The new `readiness_audit_inputs` baseline field binds actual file hashes and missing-file states,
including receipt-linked artifacts. Unknown metadata, changed input identities, unreadable inputs
and changes detected after any aggregate or the exports stop with exit 3 before classification or
baseline writing. Canonical source edits still produce readiness findings. The existing failure
rules remain in force after input equivalence is established. This guard addresses audit custody;
the README still documents the older matching and sampling limits.

With the selected source, the clean validator reports all 74 shared failures exactly after normal
checkout-path/timestamp/hash normalization, still exits 1, and leaves no audit symlink. All 15 input
hashes match the original capture. The 20 new input regressions and all 154 existing landing tests
pass. The current repository baseline is unchanged; the new checker correctly refuses its absent
binding with exit 3. Shared checkout access throughout this task was read only.

Raw evidence is retained outside Git at `/mnt/Cursor/PuppetMaster-Evidence/tests/landing-readiness-drift-20261011/`:

- `clean-before.json`, SHA-256 `c26ed6f8707c1e5775b935efa867ab0b90153cb29db6fd9f7cbb9276eca160a3`.
- `shared-before.json`, SHA-256 `75cca503250a9ed0a535f637e48ba3523afdd157c37a194bc993e49abb45db03`.
- `audit-inputs-before.json`, SHA-256 `ec6ee714f4017ba73bbe27556731bd22620f4a2cae83ac6ba95e1aa935ec02f4` (every input's path, bytes and hash).
- `clean-with-selected-source.json`, SHA-256 `f37c0bef4ff85a2f11aa4ab807000aeb640616ed2d5d35d6c3fdf336410408e0`.
- `verification-summary.json`, SHA-256 `4e85d3d72038e41bc58dba55a731f623bbfbae5b0bf89b794a1b9c77455105b8`.
- `input-tests.log`, SHA-256 `e285739def6ea47f0fb7fc7c3388806fce94ed4c0f34d0c29c7f7c4a3128ace4`.
- `landing-tests.log`, SHA-256 `d99f9749e2bb5c7d912ab954221e6a81cdaea147af17cc1ee84c5debccde353d`.

## Adoption between landings

The planner agreed to this order in mailbox reply `1011055719-b7c0`. These are instructions for the
scheduled landing agent; this task only pushes its fix branch. Never record the pending fix as its
own baseline, or bypass its landing check.

1. Complete a preceding **Plans** landing with the old checker and push `main`. Retain its landing
   lock through the normal snapshot/baseline follow-up; coordinate custody with
   `home-redesign-planner`. Landings before adoption continue using the old checker.
2. Prepare the full local snapshot worktree on the freshly pushed `origin/main` using the repository
   recipe. Verify its `HEAD` equals that `origin/main`. Disable sparse checkout and recreate the
   `tests/agent_packet_restrictions` evidence symlink as the README runbook requires.
3. Run `python3 scripts/pm-plan-migration.py snapshot-current` with the run ID, document count and
   superseded run arguments from the README. Before committing, use **this fix branch's recorder**
   against that worktree, so the validators and recorded commit are still those of the pushed main:

       PYTHONDONTWRITEBYTECODE=1 python3 <fix-worktree>/scripts/pm-landing-check.py \
         --root <snapshot-worktree> --record-baseline \
         --readiness-audit-root /mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness

   Exit 0 is required. Confirm `readiness_audit_inputs` is populated; the temporary audit link should
   be gone. If an input changes or a subcheck times out, resolve that result and retry this scheduled
   refresh before committing. Do not overwrite an unrelated pending landing's baseline.
4. Commit only the snapshot's `Plans/.plan_migration` changes and
   `reports/landing-checks/baseline.json` together. Push and land that follow-up by the ordinary
   fast-forward, shard check, pre-push landing check and main-push procedure, still using the **old**
   checker. It accepts the additive identity field. Remove the snapshot worktree.
5. Fetch/rebase/push `fix/landing-readiness-drift-20261011`, then land it through the full ordinary
   procedure. The new checker now compares with an already-bound baseline taken before the fix.
   A mismatch requires restoring the recorded inputs, never a baseline refresh to pass this landing.
   This scripts/reports landing needs no further snapshot or baseline refresh. Remove its worktree
   and branch after landing, and release the lock when the planner's chain procedure permits.

Tests can be rerun with `python3 -m unittest discover -s scripts -p test_pm_landing_readiness_inputs.py`
and `python3 -m unittest tests.test_pm_landing_check`.
