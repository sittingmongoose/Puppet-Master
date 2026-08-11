# Writing a version

A version is **one design system applied to all seven panels**. One file:

```js
PM_BAKEOFF.register('vA', {
  name: 'Ledger',
  blurb: 'Two-line receipts under sticky section headers.',
  panels: {
    search: '...', source: '...', git: '...', docker: '...',
    tests: '...', agents: '...', artifacts: '...'
  }
});
```

`panels.<id>` is an HTML string, or a function `(D, state) => html` where `D` is
`PM_DATA`. Add one `<script src>` line to `index.html`. That is the whole
contract.

Panels not listed fall back to a "not built" placeholder, so you can ship a
version incrementally and still measure what exists.

---

## Hard rules

These are enforced — the first three by tooling at port time, the rest by the
fit checker.

1. **No `id=` attributes.** Six versions would collide on `searchQueryInput`,
   `pm6RunConfig`, `fileContextMenu` and friends, and `pm6-build/checks/check_ids.py`
   would fail the port. Use `data-pm-*` hooks. Slint has no global ids either,
   so this is also the right shape for the destination.
2. **No emoji.** Inline SVG only. Verify with
   `find panel-bakeoff -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' -o -name '*.md' \) -print0 | xargs -0 python3 pm6-build/checks/check_no_emoji.py`
3. **No backtick and no `${`** inside markup strings.
4. **No new `color-mix()`** beyond the `:root`-declared `--accent-soft` /
   `--accent-glow`, which resolve to one value per theme (i.e. Slint colour
   constants). `F3-431` forbids runtime colour math.
5. **No new `backdrop-filter`.** The budget is closed at 7 surfaces app-wide.
6. **Every interactive row at least 24px** (`FinalGUISpec.md:2144` §13.5).
7. **Every `<select>` is a `pm-select`.** Every overflow is a `pm-menu`. Every
   row that has actions gets `data-pm-ctx`. Every icon-only control carries
   `data-pm-tip`. No native `title` as the sole affordance, and no
   `alert`/`confirm`/`prompt`.
8. **All content from `_pm-data.js`.** If you invent your own strings you are
   comparing content, not design. If a design only survives after you shorten a
   fixture, the design does not survive.

---

## The kit — `PMK.*`

Defined in `_pm-kit.js`, styled by `_pm-kit.css`. A version owns its **layout**;
it does not own the status vocabulary, the elision policy, or the
metadata-degradation rule, because those must be identical across all six or the
bakeoff compares noise instead of design.

| Call | What it gives you |
|---|---|
| `PMK.row({status, id, idKind, idMax, meta, tail, chip, actions, twoLine, sub, bucket, ctx})` | the row that cannot recreate the bug: exactly one slot grows and it is the identity, with a 96px floor; every other slot is dropped whole, right to left |
| `PMK.statusMark(token)` | 3px rail + 14px glyph in a 21px gutter **outside** the text band. Four non-colour channels: glyph shape, rail dash, accessible label, status word |
| `PMK.kv(key, value, kind, bucket)` | typed key/value. `token`/`badge` go inline above 280px; `measure`/`prose` always stack. Hard floor: under 88px it stacks regardless |
| `PMK.metaRun(segments, bucket)` | segments drop whole and surface a `+N` popup — never mid-clip |
| `PMK.elide(text, kind, max)` | per-kind: `path` keeps first segment + basename, `image` always keeps the tag, `ref` keeps the tail, `digest` keeps 14 head + 4 tail |
| `PMK.lenses(items, active, bucket, label)` | `F3-445` strip; **collapses to a portaled picker at bucket 0** |
| `PMK.overflow(items, tip)` | the reserved 24px slot, wired to `pm-menu` |
| `PMK.select(value, options, opts)` | the combobox. **Never emit a native `<select>`** |
| `PMK.blocked({code, sentence, actions})` | reason code verbatim + one sentence + real buttons |
| `PMK.empty(kind, title, body, cta)` | the five-way taxonomy, not one component with variable copy |
| `PMK.section(label, count, open)` | `<button aria-expanded>` — `GI-004` requires accordion headers be accessible buttons |
| `PMK.head` `PMK.strip` `PMK.body` `PMK.card` `PMK.btn` `PMK.chip` `PMK.filter` `PMK.icon` `PMK.esc` | structure and atoms |
| `PMK.idChars(width, theme, reserved)` | rough characters that fit the identity slot, for picking `idMax` |

Two rules the kit cannot enforce for you:

- **Never emit a leading kind chip below bucket 2.** The Artifacts envelope has
  no title field and the kind token reaches 21 characters
  (`before_after_snapshot`) — about 143px, **65% of the 224px band before the
  label gets a pixel**. Use a glyph or a line-2 segment.
- **Never use `var(--display-font)` below 12px.** Retro renders Orbitron and it
  is unreadable. `PMK` uses `--display-font-sm` throughout; match it.

## Sizing vocabulary

Use the token scale. It is theme-invariant — `--xs/--sm/--md/--lg/--xl` and all
`--fs-*` are declared once in `:root` and **no theme overrides them**. What
*does* change per theme:

| Token | glass | basic | friendly | retro |
|---|---|---|---|---|
| `--border-width` | **0px** | 1px | 1px | **2px** |
| `--radius-md` | 10px | 6px | **14px** | **0px** |
| `--radius-lg` | 16px | 8px | **20px** | **0px** |
| `--line-height` | 1.5 | **1.6** | 1.55 | 1.55 |
| `--letter-spacing` | 0.01em | **0.02em** | normal | normal |
| body font | Inter | Inter | Quicksand | Rajdhani |

Consequences you must design around:

- A bordered box costs **0–4px** more width *and* height in retro than in glass.
  Prefer few bordered containers; nesting three of them is what makes Source
  Control look like overlapping boxes today.
- `basic-*` is the **widest** text (Inter 15px + 0.02em tracking) and the
  **tallest** line box (1.6). It is the worst case for horizontal fit.
- Never hard-code a radius. Never use `var(--display-font)` below 12px — retro
  renders Orbitron and it is unreadable. Use
  `var(--display-font-sm, var(--body-font))`.
- Friendly needs ~12px of clearance for a 2px hover ring plus a 22px glow;
  `overflow:hidden` on a hoverable container clips it. Retro casts a
  `3px 3px 0` hard shadow.

## Width buckets

`PM_DATA.bucket(px)` → `0` essential (<280) · `1` compact (280–359) ·
`2` standard (360–479) · `3` full (≥480), matching `FinalGUISpec.md:2081` §12.2.

**Key every width decision off the bucket, never a continuum.** That is what
makes a design portable to Slint, which cannot measure text mid-layout: the
bucket is computed once in Rust and the `.slint` markup just reads it.

Usable band = panel width − 16px of panel padding. At 240px that is **224px**,
which is roughly **30–36 characters** at 11px depending on theme. Budget
accordingly; `_pm-data.js` carries a `chars` count on every adversarial string.

---

## What the research says

`research/*.md` — one brief per panel, every claim cited to a `Plans/<Doc>.md`
line range. Read yours before designing. Findings that constrain every version:

- **Docker**: 11 canonical subviews (`CRAU-007`), and unsupported ones must stay
  **visible with a disabled reason** rather than hide. 11 × 24px = 264px > the
  224px band, so a chip strip is *mathematically impossible* at 240px — the
  subview switcher must collapse to a portaled picker. 78 wired commands.
- **Source Control**: 65 commands. `GI-004` requires accordion headers be
  accessible buttons. `GI-020`'s compact worktree row does not fit at 240px, so
  the owner label has to move to a second line or into expanded detail.
- **Artifacts**: the envelope guarantees only `artifact_id` and `artifact_type`
  — there is **no title field**. The kind token runs up to 21 chars
  (`before_after_snapshot`) ≈ 143px, **65% of the band** before the label gets a
  pixel. Below 360px the kind must become a glyph. Lead bundle members with
  `evidence_role`, not kind.
- **Tests**: five regions are literal spec text — `run_list`,
  `active_run_detail`, `failure_list`, `artifact_preview`, `redaction_notice`.
  Enablement is **per adapter**, not global, so the panel can be half-enabled.
- **Agents**: genuinely under-specified. Zero wiring rows, no `cmd.agents.*`
  family at all. Propose commands and say so.
- **Actions**: `Current Branch` / `Workflows` / `Settings` are stable subviews,
  not three stacked cards. The two blocked-state vocabularies in Plans share
  exactly **one** code; 13 of 20 have no user-facing string.
- **Search**: the 130px index card duplicates what the spec assigns to the
  **status bar**. The panel owes only a subtle `(unindexed)` annotation.

---

## Checking your work

1. Contact mode, your panel, 240px — read every label in all 8 themes.
2. Run fit check. Zero R-tier for your version. Each W1 needs a line in the
   root `README.md` accepted-ellipsis log.
3. Drive every menu by keyboard only: Up/Down/Home/End/type-ahead/Enter/Escape.
4. `node --check versions/<yourfile>.js`.
