# Handoff corrections — measured, not simulated

The two port-handoff documents in this directory were drafted from hand-written gate *simulators*. The
real read-only checkers, the real Plans canon, and the real PlanUnit index were then run. This file
supersedes the handoffs wherever they disagree. It also corrects two statements the auditor made earlier
in this engagement.

Method: `Concepts/pm6-build` was copied to a scratch tree, u11-substituted parts were assembled there with
the **scratch** `assemble.py --gate g2 --out <scratch>`, and the nine real `checks/*.py` were run against
the result. The repo was never written. A **control** (unmodified 54-part base) passes all nine, so every
candidate failure below is u11-attributable. Two candidates: `cand-A` = the handoff's proposal
(`usage-chrome.js` dropped, 61 parts); `cand-B` = naive port including chrome (62 parts).
Full evidence: `../audit-evidence/probes/real-gate-runs.{json,md}` (98 KB, every command line included).

## 1. Gate results — one hard failure the handoff missed

| checker | base | cand-A | cand-B |
|---|---|---|---|
| original / js / hooks / settings_data / no_emoji | PASS | PASS | PASS |
| **structure** | PASS | **FAIL** | **FAIL** |
| **css** | PASS | **FAIL** | **FAIL** |
| ids | PASS | PASS | **FAIL** |
| **vocab** | PASS | **FAIL** | **FAIL** |

**NEW BLOCKER — `check_structure` fails on `<body>` count 5 != 1.** `check_structure.py:52` counts raw
`<body\b` across the whole document with **no comment or string stripping** (unlike `tag_deltas` at
`:28-34`, which does strip script bodies). Four ported files write the literal `<body>` inside comments:
`_shared/usage-widgets.css:99`, `:119`, `_shared/usage-widgets.js:325`, `:486`. This is hard at **g0, g1,
g2 and g3** (`assemble.py:34-38`), so **no build can go green until those four comments are reworded.**
The handoff caught the analogous `--tone-` comment artifact and missed this one.

**`check_ids` — confirmed, and the handoff's mitigation genuinely works.** `cand-B` introduces exactly 5
new duplicate ids — `projectMenu`, `projectMenuWrap`, `themeMenu`, `themeMenuLabel`, `themeMenuWrap`.
`cand-A` reports `OK (496 distinct ids; 0 new dups)`: dropping `_shared/usage-chrome.js` clears it entirely.

**`check_css` — confirmed exactly.** 32 FAIL lines = **19 undefined custom properties** + **13 raw-hex
declarations**, all inside `pm6-css-usage-u11`. The undefined set: `--accent-cyan`, `--num-font`,
`--pm-motion-k`, `--tone-`, `--tone-{err,info,mute,ok,purple,warn}-text`,
`--us-fill-{hot,info,mute,ok,purple,warn}`, `--us-mlb`, `--us-mpc`, `--us-wlb`. Base pre-existing
undefined = `[]`. Note 34 of 54 parts define custom properties (268 distinct), not just
`02-css-tokens.part.html` (124) — the diff must be taken against the whole document. **Caveat the handoff
missed:** `--wf` resolves *only because the payload defines it itself* at `u11-prism.html:1416`; refactor
that line and it becomes a 20th failure.

**`check_vocab` — confirmed exactly.** 46 matches: `tiers` 22, `phases` 22, `Gemini CLI` 2. Base = 0, so
all 46 are u11-borne and none come from chrome.

## 2. The font-CDN concern is REFUTED — including the auditor's own earlier statement

Earlier in this engagement the auditor flagged u11's `fonts.googleapis.com` preloads as a probable port
blocker. That was wrong, in three ways:

1. It is **3 × `fonts.googleapis.com` + 1 × `fonts.gstatic.com`** (`u11-prism.html:10`), not four googleapis.
2. **The port does not carry them.** All four live in the `<head>` that the handoff already drops. Grep
   across the four ported slices (`:21-341`, `:348-528`, `:531-546`, `:561-1462`) returns 0 for every CDN
   pattern.
3. **The target already ships the identical four**, at `parts/01-head-prelude.part.html` → assembled lines
   67, 68, 71, 72. Base and candidate both contain exactly 4. **u11 adds no new violation.**

Two real findings survive in this area instead: `scripts/pm-gui-asset-policy.py` as actually wired
(`pm-plans-verify.py:3605`, `validate`, no `--source-root`) reports `status: not_applicable`,
`source_roots: ["tests"]`, `checked_files: 0` — **`Concepts/**` is outside the asset policy's scope**. And
when forced at the bundle it returns 26 findings, of which **22 are `no_emoji_or_unicode_pseudo_icons`**
dominated by `→` ×7 and `×` ×6 — glyphs that are on the `PARTS.md` allowlist which `check_no_emoji`
honours. **The two project policies contradict each other**, and that conflict needs an owner ruling.

## 3. The command-name normalization ruling is REFUTED — also correcting the auditor

Both handoffs, and the auditor's own plan, asserted that `DRY_Rules.md:2109-2130` normalizes
three-segment command ids to two segments, and rejected `cmd.usage.forecast.request` and
`cmd.usage.detail.open` on that basis. **There is no such rule.**

- `DRY_Rules.md:2109-2130` is a **nine-row dedup / owner-routing disposition table for named candidates**,
  not a naming-pattern rule. It contains its own refutation: `:2121-2122` normalize *toward* three-segment
  ids — `cmd.worktree.provision` → **`cmd.git.worktree.create`**, `cmd.worktree.release` →
  **`cmd.git.worktree.release`**.
- `grep -E 'sub-namespac|three-segment|segment count'` across `Plans/*.md` and `Plans/*.json`: **0 hits**.
- The real rule is **UCC-006**, `UI_Command_Catalog.md:33-36`: lowercase, dot-separated, `cmd.` prefix,
  `negative_constraints: []`, **no segment cap**. Machine-enforced by
  `Wiring_Matrix.schema.json:73-77` → `^cmd\.[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$`, unbounded.
  Sub-namespacing is affirmatively blessed at `UI_Command_Catalog.md:516-523`.
- Census of 854 distinct command ids: **556 two-segment, 278 three-segment, 20 four-segment**; in the
  authoritative catalog **254 of 703 (36%) carry 3+ segments across 22 domains**. The live counter-example
  is real: `catalog.github_actions_settings_open` → `cmd.github.actions.settings.open`
  (`Wiring_Matrix.production.json:15415-15418`), a fully certified production row.
- The DRY entries that *were* rejected (`cmd.lsp.server.*`, `cmd.debug.session.*`) were rejected for
  **duplicating an existing canonical command**, not for shape.

**Corrected dispositions.** `cmd.usage.forecast.request` — legal shape, `forecast` has 0 hits in the
catalog or production wiring, **admissible as a new id** subject to owner registration
(`UI_Command_Catalog.md` + `Commands_System.md` per `DRY_Rules.md:2126-2128`) plus a wiring row.
`cmd.provider.usage.open_management` — legal shape but **blocked on genuine DRY grounds**:
`cmd.nav.open_usage_subject` already exists and `DRY_Rules.md:2123` routes usage-subject opens there.

## 4. The Settings deep-link destinations do not exist — and the canonical one does

Confirmed: `Plans/settings_inventory.json` has exactly **12 categories** (`general, ai, safety, code,
memory, planning, branching, media, web, personas, extensions, system`), 828 settings. There is **no
`providers` category and no `usage` category**. Both exist only as subgroups of *different* parents:
`providers` under **`web`** (`:230`, i.e. web-search providers) and `usage` under **`ai`** (`:79`). The
concept's `manager: 'providers'` means AI provider accounts, which canon puts at `ai.accounts` — a
semantic trap, not just a missing key.

Zero canon occurrences for `focus_reason`, `usage_and_extra_usage`, `usage_quick_controls`, `see_all`
(and `view_all`/`show_all`/`quick_controls`/`extra_usage`). `"manager"` never appears as a field key
anywhere in `Plans/`. Every repo hit for these tokens is inside `Concepts/usage-concepts/`. Alternate
canonical spellings do exist for two concepts: `provider_setup_required` (18 hits, owner
`CLI_Bridged_Providers.md:1467`) as a typed lifecycle class, not a nav reason; and `provider_reconnected`
(`usage-feature.md:354`) as a recovery reason code.

Two additions to the record: there are **five** deep-link payloads, not four — the fifth is
`u11-rundetail.js:451` (`focus_reason: 'inspect_run'`, `surface: 'orchestrator'`). And the concept's own
harness **green-lights the invented vocabulary**: `u11-verify.mjs:333` asserts
`focus_reason === 'setup_required'`, a token canon does not define. The transport's pseudo-command
`semantic.deep_link` has 0 hits in `Plans/`.

**The correct canonical identity exists and must be used instead.** Owner **F3-434**,
`Plans/FinalGUISpec.md:30614-30645`. Envelope is **`open(category, focusSettingId)`** — two positional
arguments, not a four-field object — bound to **`cmd.settings.bloom.open`**
(`UI_Command_Catalog.md:8356`) and certified at `Wiring_Matrix.production.json:30116-30123` (row
`catalog.settings_bloom_open`). Cross-surface navigation uses `route_target` + `open_subject`
(`Contracts_V0.md` §7), and `Contracts_V0.md:652` states directly that *"Usage deep links are object
routes… normalize through `object_kind = usage_event`"*. A correct port is shaped
`open('ai', 'ai.usage.usage-windows')`, not `{surface, manager, section, focus_reason}`.

## 5. PlanUnit ids — all ten correct, but the index is stale

All ten handoff allocations verified **CORRECT** against the owner docs: UF-092, WS-016, UCC-146, WM-044,
DR-038, SP-248, CS-067, MA-071, CBP-030, MS-138. **Zero gaps** in all ten sequences (dense `001..max`, no
duplicates, 3-digit padded), so `max+1` is the only valid allocation and no gap-backfill applies. No
prefix collisions across 74 prefixes reviewed.

`Plans/.plan_index/plan_units.jsonl` is **>27 hours stale** (not the 5h the handoff stated) and is missing
**CBP-029** (`CLI_Bridged_Providers.md:294`) and **MS-137** (`Models_System.md:9522`); F3, GRS, SIR also
lag and PSB is absent entirely. There is no id-allocator tool (`grep 'next_free|allocate' scripts/` → 0).
**Run `python3 scripts/pm-plan-index.py generate` before any port edit**, or index-only next-free checks
will be wrong for six prefixes.
