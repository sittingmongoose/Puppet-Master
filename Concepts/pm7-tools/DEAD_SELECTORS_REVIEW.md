# Dead-Selectors Human-Review Packet (PM7 T01)

Status: APPROVED by Jared on 2026-07-29. The in-file human-review annotation
in `dead_selectors.py` (2026-07-28 block, lines 28-377) is marked approved:
the 11 retired PM6 panel families (+ appended `.pm6-sp-btn-primary`) stay
frozen, and the EXCLUDED candidates stay kept-in-corpus. This digest is
evidence only; the frozen list itself was never edited.

## Provenance

- Frozen list: `Concepts/pm7-tools/dead_selectors.py`, 400 selectors.
- Re-derived 2026-07-28 (Cozy Shelves integration wave) against the
  cozy-shelves-integrated base; `BASE_SHA` recorded in-file as
  `bbfbee10485ddc0dad27777106e6bcaa12a4233189e9d4ec1309e22e6ed64965`.
- Re-derivation diff per the in-file annotation: +137 selectors across the
  retired PM6 panel families listed below, 0 removals; the EXCLUDED candidates
  (kept in the corpus) are enumerated with reasons in the annotation block.
- Consumed by transform T01 in `build_pm7.py`; T01 strips the frozen rules at
  PM7 build time (the source parts intentionally keep the full CSS).

## Evidence method

Counts are against the built `Concepts/PMConcept7.html`
(sha256 `7bf922d5104c62ade2a8072da6643d5c31deb9b9f26a9aee522e03f1ac765298`,
the pre-cleanup build current at review time). "non-CSS refs" counts token
occurrences in the document with all `<style>` contents stripped (markup + JS).
"class-attr refs" counts occurrences inside `class="..."` values only (the live
markup signal). "non-CSS refs (-inert JS)" additionally excludes the
`<script id="pm6-js-panels">` block (57,697 bytes of null-guarded render JS for
the removed legacy panels; that inert block is excised in this wave's cleanup,
after which only the (-inert JS) column applies to the shipped artifact).

A family is proven dead when its class-attr refs are 0: CSS class strings inside
inert render JS are not DOM usage.

## Retired PM6 panel families (the +137 approval set)

| Family | Frozen selectors | Distinct tokens | non-CSS refs (raw) | non-CSS refs (-inert JS) | class-attr refs | Verdict |
|---|---|---|---|---|---|---|
| `pm6-sp-` (side-panel chrome) | 20 | 8 | 0 | 0 | 0 | DEAD - proven |
| `pm6-fm-` (legacy file manager) | 14 | 11 | 0 | 0 | 0 | DEAD - proven |
| `pm6-search-` (legacy search) | 11 | 10 | 0 | 0 | 0 | DEAD - proven |
| `pm6-dm-` (legacy docker panel) | 7 | 5 | 0 | 0 | 0 | DEAD - proven |
| `sc-accordion-` (legacy SC accordion) | 7 | 4 | 2 | 2 | 0 | DEAD - proven (see flag F1) |
| `pm6-gh-` (legacy GitHub panel) | 6 | 6 | 1 | 0 | 1 raw / 0 clean | DEAD - proven (raw ref is an inert render string) |
| `pm6-sc-` (legacy source control) | 5 | 4 | 0 | 0 | 0 | DEAD - proven |
| `pm6-wt-` (legacy worktrees) | 7 | 4 | 0 | 0 | 0 | DEAD - proven |
| `pm6-agent-` (legacy agents) | 3 | 2 | 0 | 0 | 0 | DEAD - proven |
| `pm6-art-` (legacy artifacts) | 2 | 2 | 0 | 0 | 0 | DEAD - proven |
| `sc-wt-` (legacy SC worktrees) | 10 | 7 | 0 | 0 | 0 | DEAD - proven |
| Appended `.pm6-sp-btn-primary` | 1 | 1 | 0 | 0 | 0 | DEAD - proven (last markup usage removed 2026-07-28) |

Totals: 92 selectors keyed strictly under these 11 prefixes (the re-derivation
diff of +137 also counts scoped helper rows sharing the retired panel markup,
e.g. `pm6-kv` / `sc-history-*` / `sc-graph-*` scoped selectors; all are frozen).

Cozy Shelves selector families (`sh-*`, `fm-*`, `rd-*`, `pm-segtab`, `pill-fit`,
`pm-panel-enter`, `--cat-*`) are verified ABSENT from the frozen list per the
in-file annotation - none appear in `DEAD_SELECTORS`.

## Flags

F1 (sc-accordion): the only remaining non-CSS references in the built file are
a single line, `25-js-terminal-demo.part.html:352`
(`btn.closest('.sc-accordion-body').querySelectorAll('.sc-wt-row')`), counted
twice by substring overlap (`sc-accordion` inside `sc-accordion-body`). No
markup defines these classes (class-attr refs = 0), so the query is inert and
the selectors remain proven dead. The fragment itself lives outside this wave's
excision scope (the wave excises the panels-part render JS only); it is recorded
here as a future-hygiene candidate, not approved for removal.

No family failed the deadness proof. Nothing is flagged as un-provable.

## Rest of the frozen list (context, not part of this review's approval set)

The remaining 308 frozen selectors are prior-wave freezes over retired PM5/PM6
page widgets, led by prefix: `orch-` 114, `pm6-` scoped helpers 81,
`terminal-` 16, `interview-` 14, `input-` 11, `widget-` 11, `sc-` misc 9,
`artifact-` 8, `msg-` 8, `bento-` 7, `plan-` 5, remainder 22. Their EXCLUDED
candidates and reasons are in the in-file annotation block.

## Reviewer checklist (for Jared)

1. Confirm the 11 retired panel families above may stay frozen (no resurrection
   planned for the PM6 panel markup replaced by Cozy Shelves).
2. Confirm the EXCLUDED candidates in the annotation block stay kept-in-corpus.
3. APPROVED 2026-07-29 (Jared): the in-file annotation is marked approved;
   the frozen list was not edited. Re-derive via the README recipe if the
   base ever changes.
