# Slint portability notes — Grok 4.5 chat concepts

Concept HTML ≠ product Slint. These are the main port risks from this workspace’s choices, written for Grok’s current chrome (not copied peer prose).

## Rotated / vertical rail text

Windows such as **w4 Pocket**, **w7 Latch**, and **w8** use `writing-mode: vertical-rl` plus `transform: rotate(180deg)` for spine/tab labels. Slint text layout does not mirror CSS writing-mode 1:1. Expect either:

- dedicated vertical `Text` / glyph paths, or
- horizontal labels in a narrower chrome, or
- a custom item that paints rotated glyphs.

Do not assume CSS rotate on a label ports without a visual QA pass at each chat width tier.

## Native inputs → custom questionnaire controls

Questionnaires no longer rely on OS checkbox/radio. Concept Q uses custom `.pm-q-option` marks. In Slint that maps cleanly to focusable items + checked state, but:

- keyboard roving / `aria-checked` semantics must be reimplemented,
- freeform fields stay real text inputs (`TextInput`), not styled divs.

## Fixed popups (sprout menus)

`menu.js` portals rail/title menus to `document.body` with `position: fixed` so overflow/accordion clipping cannot eat them. Product mapping is **PopupWindow** (always unclipped). Port risk: any HTML prototype that still positions menus inside a scrolled/clipped ancestor will diverge from Slint. Keep the portal / PopupWindow contract when adding new sprouts.

## Markdown renderer

Bodies use a **minimal** `renderBodyHtml` (fences, bold, lists, paragraphs)—not a full product markdown engine. Slint will need a real renderer / TextEdit pipeline. Risks:

- code fence scrolling and theme tokens (`--pm-md-*` / pre backgrounds),
- long-message collapse masks vs Slint clip,
- search-hit / lens classes applied on the message host, not inside markdown spans.

## Motion layer

Enter/reveal, work-surface grid accordion, and live pulse are CSS/IO driven and respect `data-reduced-motion` / `prefers-reduced-motion`. Slint equivalents should prefer opacity/transform timelines and skip decorative loops when reduced motion is on. Avoid porting HTML IntersectionObserver literally—use mount/list insert hooks instead.

## Chat theme tokens

Chat-facing colors live in `_shared/chat-tokens.css` (`--pm-msg-user-bg`, `--pm-dock-bg`, `--pm-q-bg`, `--pm-rail-bg`, `--pm-lens-chip-bg`, …) layered on the shared eight themes. Product themes should carry the same **chat layer** names so dock/user/Q/lens do not silently fall back to generic surface tokens and look like an unmodified rail copy.
