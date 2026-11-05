# Tool batch 1: ledger witness and standalone use

**T9 and the witness part of T8 are fixed in `f2a7eb0c99c9959130606b34df0d5353426c6e31`.** Branch: `plans/tools-batch1-20261105`, from `origin/main` at `451738fc0b869f5958d205e96b513af5290f7e5f`. Local verification passes; independent review is not claimed. The guard-tool portion was finished and pushed first at `dec0a57dce93238ab33452f6b7ca1c759435b587` on `plans/ea-guardtool-20261105`, then its prescribed worktree was removed.

## T9 — vacuous witness and held/retired tokens

**Location:** `scripts/pm-ledger-compile-witness.py`. **Cause:** absent `target_plan_unit_ids` skipped all owner/token/registry checks, yet the absence of findings became `pass`; every source token was otherwise mandatory, with no scoped disposition protocol.

**Fix:** zero checked owner registries now reports `vacuous` and exits 2. Only explicit `--allow-empty` permits a clean empty scope, with status `vacuous_allowed_by_--allow-empty`; findings remain blocking. Missing or ambiguous targeted units cannot silently disappear. Summary fields report declared targets and actual registries checked.

Reviewed exemptions live in the ledger's optional `records/compile_witness_exemptions.jsonl`. Each names the queue item, source atom, exact token, existing mapped owner units, `held` or `ledger_retired`, reason, reviewer and accepted ledger-record reference. The cited record must link that atom and list that token. Canonical path checks keep it inside `records/` and refuse self-certification through path aliases. Unknown, stale, duplicate/overlapping, unreviewed or malformed exemptions are input errors. Reviewers still verify the disposition's meaning and authority; structural validation is not a signature or semantic review.

The optional `atom_target_plan_unit_ids` map keeps each atom's evidence in its assigned owners. Exact-token evidence must be in one owner's body and that same owner's registry. Registry-only strings are excluded, including block lists. Exemptions leave active tokens, other owners, registry hygiene and changed-repair checks intact. Numeric PlanUnit prefixes are recognized in repairs. Invalid/unreadable Git bases fail as input errors rather than disappearing as missing base text.

The original GRS-027 ledger was checked read-only: **`vacuous`, exit 2, 0 targets / 0 repair records / 0 item tokens / 0 registries checked**. Its explicit empty override exits 0 with the flag named in its status. No actual ledger targets, atoms, review dispositions, owner prose or canon were changed in this tool task. A non-vacuous compile witness still requires the ledger owner to record the intended targets and reviewed dispositions.

## T8 — standalone README, command line and self-test

The witness is a flat two-file distribution: `pm-ledger-compile-witness.py` and `pm_ledger_compile_witness_traps.py`. `scripts/ledger-compile-witness/README.md` documents the format, files, Python/platform contract, standard-library dependency, Git requirements, stable commands, exits, reset-free scratch cleanup and reviewed exemption protocol. `--root` defaults to the caller's current directory. `--self-test` uses OS temporary storage; optional `--scratch` selects another generic parent.

```sh
python3 tools/pm-ledger-compile-witness.py ledgers/change-001 --root . --json
python3 tools/pm-ledger-compile-witness.py --self-test --json
```

The guard tool's corresponding README, `--scratch`, flat distribution and dependency setup are on its pushed branch. That separate result has **130/130 observations**, normal/optimized DG6B extracted proofs and **1,603 assertions**; see `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/GUARDTOOL/B-fix2/B-fix2.md` and its fingerprint manifest.

## Verification and scope

**42/42 witness regressions pass**, with identical normal/optimized JSON. Negative cases cover both empty queue forms, missing target units, non-exempt held/retired strings, invalid/stale/overlapping exemptions, canonical self-review and record-cone escape, still-required active tokens, registry-only strings, cross-owner borrowing, unchanged repairs, numeric prefixes, invalid bases and unknown atoms. Positive controls include nonempty coverage, explicit vacuity, reviewed held/retired tokens, per-atom targets and changed/new-unit repairs.

**63 evidence assertions pass.** An exact two-file copy runs the full self-test from another project directory with the program share denied by an audit hook. The generic scratch override passes and removes every synthetic project and local Git fixture. Temporary distributions and project directories are removed. Reproduction drivers and raw JSON remain outside the repository under the evidence path below.

Checks ran serially on Python 3.14.4/Linux with a 1 GiB address-space cap and fresh 6 GiB available-memory preflights. Git pack windows were limited per command for the large repository; no Git configuration was changed. Setup had 112 GB disk and 11 GiB available RAM. The supported interpreter/platform boundary and exercised versions are stated in the README. Python parsing and `git diff --check` pass.

Only the witness, its corpus helper, standalone README and these compact report companions change. No owner Markdown, live ledger, registry, Decision Log, Spec Lock, generated shards/index/evidence, `.gitignore`, main push, pm-mail or subagent work. No event-family or semantic compilation grade is claimed.

Evidence directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/TOOLS-BATCH1/`. `verify-batch1.py` reproduces the serial commands and checks the results; `commands.json` records exact commands, exits and resource readings.

| Evidence under that directory | SHA-256 |
|---|---|
| `self-test.json` | `c87e625b079835db2368759990f5e1ec3d04c27f30aefdd86cdc7e592b8a590b` |
| `self-test-optimized.json` | `c87e625b079835db2368759990f5e1ec3d04c27f30aefdd86cdc7e592b8a590b` |
| `grs027-current.json` | `1570f0ed294a48e4e9bb59ba08f0e23cd46aec2ad802d9ad827151aac7c719be` |
| `standalone-mount-denied.json` | `c87e625b079835db2368759990f5e1ec3d04c27f30aefdd86cdc7e592b8a590b` |
| `audit-results.json` | `d6c661cb679515a38a4a0fdc716450fe04bb7ca0d9711a610b877b5a2ac41f33` |
| `input-manifest.json` | `558a30681d5bb856e9515044f91512d020df57096d66e79f51129daa2756c863` |
