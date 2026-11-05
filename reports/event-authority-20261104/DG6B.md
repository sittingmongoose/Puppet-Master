# DG6B — sweep part 1, prepared without admission

Branch: `plans/ea-w2-plugins-personas-github-20261104`. Input: `5cc7c461d08d993c0aa4c0bdeb6ccd4e98131468`. Rebased main: `e42ce235b4711325ced818c777f070c3ee0d7952`. Fix commit: **`9c10e2c4b17cb1263b88825a81b0a305ecfcb8f0`**. Native execution: **NOT_RUN**.

**B1, B2 and B3 are fixed in part 1. All nineteen family checkers pass. No family is READY: the shared number rule, guard-table tool and subsequent Sol/Astra reviews remain required.** Membership stays ABSENT, retention PARTIAL / PENDING_RETENTION_DECISION, disposition UNDISPOSITIONED.

## Sweep part 1: findings and responses

| Item | Response / exact location | How to verify |
|---|---|---|
| **Deck 2 — none assigned** | No product answer is extended. Landed DL-045 (`Plans/Decision_Log.md:560`) limits technical definitions to “already specified behavior”; landed DL-400 (`:4390`) requires three batch landings with review. These remain boundaries, not new decisions. | `owner-premises.json`; no Decision Log or registry diff from rebased main. |
| **B1 — fixed (`9c10e2c4b17cb1263b88825a81b0a305ecfcb8f0`)** | `scripts/pm_dg6b_full_oracles.py:259` and `:369` add separate requested/effective account negatives for every family. Only one EventRecord account changes; retained Storage bytes authenticate that exact envelope. Existing product comparisons remain intact. | Nineteen full CLIs; 38 single-comparison removals flip only their own append/history pair, keep every other corpus negative at its original refusal and make the formerly surviving full suite fail. `account-regressions.json`. |
| **B2 — fixed (`9c10e2c4b17cb1263b88825a81b0a305ecfcb8f0`)** | `Plans/dg6b_event_contracts.schema.json:1854` / `:7546`; payload/operation enums and selected logical/inline frozen-resolution enums bind 18 existing hook spellings and seven selection sources. The three stored-operation registry copies match. Invalid `tool.before`/`manual` inputs and every dependent byte/digest/size copy are repaired. | Full CLIs for hook.error, hook.invoked and selected; two coherent unknown/retired values plus five wrong types per family. All 18 hook spellings and seven sources have append and exact-byte retained positives. The three original bad-positive CLIs exit 1. |
| **B3 — fixed (`9c10e2c4b17cb1263b88825a81b0a305ecfcb8f0`)** | `scripts/pm-dg6b-event-contracts.py:15` / `:383` verifies the original target against section 6’s nine protected core IDs independently of `protected_id=false`. Update’s source identity changes coherently with its target. | Four mutation families × nine complete protected-ID negatives; removing only that guard accepts each target while protected=true still refuses. Four original coherent assistant bad-positive CLIs exit 1. Protected selection/export and their retained originals remain positive controls. |

No item is disputed or stopped for a new Jared choice. No new hook, selection source, reserved-ID policy, command, retention assignment or PlanUnit ID is introduced.

## Family grades before and after

Before is Astra 4, which supersedes the round-8 author/Sol 9 claims. P=PASS, p=PARTIAL, A=ABSENT. C4/C9 recover nine cells. C12 remains PARTIAL in all nineteen pending complete shared isolation, even though the concrete B1 missing negatives now exist.

| Family | Before | After | Complete negative cases | Prepared state |
|---|---|---|---:|---|
| `auth.github.authenticated` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 168 | NOT_READY — part 2 |
| `auth.github.device_code.issued` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 165 | NOT_READY — part 2 |
| `auth.github.disconnected` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 165 | NOT_READY — part 2 |
| `auth.github.failed` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 165 | NOT_READY — part 2 |
| `auth.github.token.polling` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `plugin.hook.blocked` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 168 | NOT_READY — part 2 |
| `plugin.hook.error` | 7 P / 4 p / 1 A | 9 P / 2 p / 1 A | 173 | NOT_READY — part 2 |
| `plugin.hook.invoked` | 7 P / 4 p / 1 A | 9 P / 2 p / 1 A | 173 | NOT_READY — part 2 |
| `plugin.load_failed` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `plugin.loaded` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `plugin.permission.override` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `plugin.tool.collision` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `plugin.tool.registered` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 166 | NOT_READY — part 2 |
| `persona.created` | 8 P / 3 p / 1 A | 9 P / 2 p / 1 A | 224 | NOT_READY — part 2 |
| `persona.deleted` | 8 P / 3 p / 1 A | 9 P / 2 p / 1 A | 228 | NOT_READY — part 2 |
| `persona.exported` | 9 P / 2 p / 1 A | 9 P / 2 p / 1 A | 211 | NOT_READY — part 2 |
| `persona.imported` | 8 P / 3 p / 1 A | 9 P / 2 p / 1 A | 229 | NOT_READY — part 2 |
| `persona.selected` | 8 P / 3 p / 1 A | 9 P / 2 p / 1 A | 239 | NOT_READY — part 2 |
| `persona.updated` | 8 P / 3 p / 1 A | 9 P / 2 p / 1 A | 227 | NOT_READY — part 2 |

**Totals: 162 PASS / 47 PARTIAL / 19 ABSENT → 171 PASS / 38 PARTIAL / 19 ABSENT. Prepared READY: 0/19 → 0/19.** All self-grade source quotes, line ranges and hashes are refreshed against the rebased source tree.

## B1 guard-removal table

Each row represents two independent predicates, never one duplicate set. For requested_account_ref and effective_account_ref separately, `account_custody/FIELD` and `history_account_custody/FIELD` flip. The other account’s two negatives and every other `family_probes` negative keep their exact stock refusal. The original full CLI corpus also detects either removal. This is a focused replay of Astra’s B1 experiment, not a complete assertion inventory.

| Family | Requested-account targets flip | Effective-account targets flip | Other negatives staying rejected per cut |
|---|---:|---:|---:|
| `auth.github.authenticated` | 2 | 2 | 166 |
| `auth.github.device_code.issued` | 2 | 2 | 163 |
| `auth.github.disconnected` | 2 | 2 | 163 |
| `auth.github.failed` | 2 | 2 | 163 |
| `auth.github.token.polling` | 2 | 2 | 164 |
| `plugin.hook.blocked` | 2 | 2 | 166 |
| `plugin.hook.error` | 2 | 2 | 171 |
| `plugin.hook.invoked` | 2 | 2 | 171 |
| `plugin.load_failed` | 2 | 2 | 164 |
| `plugin.loaded` | 2 | 2 | 164 |
| `plugin.permission.override` | 2 | 2 | 164 |
| `plugin.tool.collision` | 2 | 2 | 164 |
| `plugin.tool.registered` | 2 | 2 | 164 |
| `persona.created` | 2 | 2 | 222 |
| `persona.deleted` | 2 | 2 | 226 |
| `persona.exported` | 2 | 2 | 209 |
| `persona.imported` | 2 | 2 | 227 |
| `persona.selected` | 2 | 2 | 237 |
| `persona.updated` | 2 | 2 | 225 |

The pre-sweep `DG6B.guard-removal-summary.json` and earlier tables are historical evidence of their pinned corpus only. The local proof script is byte-identical to the reviewed head; its completeness claims are not carried forward. Whole-lane inventory and per-site duplicate proof remain S1.

## Part 2 items

1. **S1 — proof machinery / shared tool:** `scripts/pm-dg6b-guard-proof.py:36` (`guard_inventory`, still unused), `:395` (`run_family`), `:419–426` (cut grouping), `:479–508` (reported inventory). Adopt the accepted shared `pm_guard_isolation.py`, expose named guard predicates/tables and reconcile every production/schema assertion with its witness. DG6B is the port’s worked example; no checker restructuring or local proof-engine repair was attempted here.

2. **S2 — number domains and historical recipes:** `scripts/pm-dg6b-event-contracts.py:298`, `:786`, `:260`; `scripts/pm_dg6b_full_oracles.py:50–55`; each SP-670/671/672 identity paragraph. Adopt NUMRULE CV-1100/1101, SP-1100/1101 and the shared helper after acceptance. Cover 2**53 semantic-digest mismatch, JSON number spellings, Storage uint64 boundaries and unforgeable at-write recipe choice. Add no local number cap/serializer; do not cap Storage at 2**53, normalize physical floats or erase signed zero.

3. **S3 — formats and retained spellings:** `scripts/pm-dg6b-event-contracts.py:337` / `:260`, EventRecord date_time_string and every family ts. Bind allowed UTC spellings and authenticated at-write format recipe; preserve exact retained `+00:00` and lowercase-z bytes when their original recipe permits them. Keep malformed/forged alternatives refused. Existing narrowing remains explicitly open; historical bytes are not normalized.

## Verification and integration

19 complete family CLIs pass, exercising **3531** complete negatives. The focused B1 replay checks 38 comparison removals and 76 flipping targets, with unchanged complements and 38 detected weakened full suites. B3 covers 36 protected targets. All seven original Astra coherent bad-positive CLIs now exit 1. These counts overlap and are not added as independent coverage.

| Check | Exit | Result |
|---|---:|---|
| `astra4-regressions` | 0 | see output |
| `shard-generate` | 0 | pass |
| `index-generate` | 0 | pass |
| `shard-check` | 0 | pass |
| `index-validate` | 0 | pass |
| `projects-refresh` | 0 | pass |
| `github-integration` | 0 | pass |
| `primary-command-catalog` | 0 | see output |
| `storage-profile` | 1 | fail; 41 reported errors |
| `diff-check` | 0 | see output |

Shard regeneration changes only the lane’s eight canonical owners: automated_testing_system, contracts_v0, github_api_auth_and_flows, personas, plugins_system, storage-plan, storage_value_registry, ui_command_catalog. Conflicted generated snapshots were discarded during the rebase and regenerated once from final canon; no shard/index was hand-merged. The copied ignored currentness edition has 15 byte/hash-verified files. Index validation’s actual status is recorded above; no global governance PASS or seal is claimed. Storage-profile errors are compared with the same checker reading only the pinned-main registry; the ordered error lists match exactly.

Main advanced during checking to `d5ec2f70c0d69c469796eea9b9cfdae30f281f42`; its only delta from the actual rebase pin is the upstream plan-migration snapshot and landing baseline. No owner, schema, fixture, registry or checker changed. Those governance paths are not edited or refreshed by this lane.

Existing source/frame/token native authentication, native CAS/crash/restart execution, admission and pending retention remain separate obligations. No governance baseline, Spec Lock, evidence bundle, frozen validator, registry admission, Decision Log or test-file edit was made.

Only `persona_semantic` changes among the production checker’s 51 functions. Identity, physical encoding, history and timestamp functions are unchanged. Recurring classes 1–9/11/12 remain covered by the full stock suites; B1 adds custody coverage, B2 closes owner-domain contradictions, and B3 closes protected-ID classification. Numeric/format recipe issues and complete independence proof remain S2/S3/S1 rather than being labelled closed.

## Authority, IDs, resources and evidence

No newly authored binding in this sweep. The nineteen existing exact DL-045 preparations, their own semantic/Storage units, consumer names, per-family searches and original premise evidence remain in branch history and DG6B.authority-audit.json at its recorded historical input. Rebase preserves current main, including Persona P-060/UCC wording. Current hook catalog/alias, Persona source enum, protected-ID and DL-045/DL-400 premises are rechecked in owner-premises.json.

**New IDs: zero.** Whole-lane IDs remain GAAAF-077..081, PLUG-131..138, P-120..125, SP-670..672, CV-690..691 and ATS-335..336 (26). The two briefing memory files were absent at their named Nas1 paths; no allocation was needed, and currentness copying/hash verification was performed directly.

Initial Nas1 resources: 11 GB available RAM, 495 GB free disk. All checker starts preserve the 6 GB RAM floor. Checks run serially within this worker; heavy index/proof jobs wait for other heavy checkers. Small peer checks may run concurrently. The initial conservative wait was narrowed after observing 30 MB peer checks; the memory floor was never lowered. No mail, subagent, main push, landing lock, browser or server. The worktree and temporary environment are removed after the lane push.

Retained evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/sweep-p1/`. Reproduction scripts and dependency versions are retained there; recreate the literal worktree at this branch to replay. Raw outputs remain outside the repository; only this report, refreshed self-grade and compact checks summary are committed.

| Evidence path (under sweep-p1) | SHA-256 |
|---|---|
| `input-pins.json` | `981b1d5c44d898fb1f53903b43ca3634379ed7da927b08313e76b3e574357b63` |
| `family-checks.json` | `2dd8731bf9d4dc307ff642c888d74e6d24b2bad403ae14addff5aa76fa9a7b6a` |
| `account-regressions.json` | `393fef51b0d084e6e026982e67e69407de34a9baab412385039dcdd1c437632b` |
| `protected-regressions.json` | `2289b260d5172429569c2c8fff70e8a344e32723c8b73e16de856591b65ede94` |
| `counterexample-cli.json` | `7fb8eb3be79a450be26d5793a5e24e182195cec81bed85024ec8a1d6ef2ee67d` |
| `owner-premises.json` | `4059454d0db663145f4abde139523c4cbcaa5e3b9cab33e40cf5f1a71cbdb705` |
| `preservation.json` | `67e85ab20b865c476aa5d32f7ed0b7c2e52e4f72761bacc5ca9395849dc3c03a` |
| `derived-scope.json` | `f20746fca7cf330b12c985867d066261b14fa0c52e88b3d440ed23a644f03c51` |
| `verification.json` | `d28ed981f4036e173f497e1789770a49fe2bb583d1e059412f932bdc650596b8` |
| `storage-profile-baseline.json` | `bd2670420bad9104c197c4bd30395cfd2335c43150c277f7bad52b6e600d0582` |
| `grade-transition.json` | `eb5ebeafc6064ad7a697d0b618285588c4a0d1e8af67f9cc59ea84407fd2ad80` |
