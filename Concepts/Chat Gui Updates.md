# Chat GUI Updates

PMConcept6 chat polish — docked `#chatPanel` and floating `#floatingChat` share one `CHAT_TEMPLATE`, so every behavior below applies to both mounts and all themes (`friendly-*`, `glass-*`, `retro-*`, `basic-*`).

**Icon policy:** All new or changed chat chrome uses inline SVG only (send, stop, rewind, jump-to-latest, attach, FAB items, close buttons, subagent carets). No emojis in chat markup or visible labels.

---

## Floating stream footer

The footer pill (`.chat-stream-footer`) lives inside `.pm6-chat-streamwrap`, absolutely positioned and centered over the message stream. It sizes to its content (`width: max-content`, `max-width: calc(100% - 2 * var(--sm))`) with no fixed side gutters.

**Layout (final polish):**
- Tighter padding: `2px var(--sm)`; single-row `flex-wrap: nowrap`
- Subagent + file chips shrink with ellipsis on long labels; `·` separator when both are visible
- Subagent chip is a plain text button (no nested grey pill); files chip matches
- Subagent chip hover matches files chip (`color: var(--accent-blue)` transition)
- Footer diff totals use green `+N` (`.ft-add`) and red `-N` (`.ft-del`) under `.chat-footer-files`
- `updateFooterLayout()` measures footer height and sets:
  - `--chat-footer-stack-height` — positions jump arrow above the pill
  - `stream.style.marginBottom` shrinks the scrollport above the floating footer
  - `--chat-footer-inset` = footer height + footer `bottom` offset + 8px clearance (set in JS)
  - Stream children use `flex-shrink: 0` — default flex-shrink crushes `.pm6-chat-wizardrec` cards to ~18px inside the flex column stream
- When pinned to bottom, reserve change re-scrolls so the hover row stays above the pill

When a thread has footer content, `renderFooter()` adds `pm6-footer-active` on the stream wrap.

**Footer contents (collapsed):**
- **Subagent chip** — dot + label. Click opens FAB menu.
- **Files chip** — one-line summary: single file shows `path +N −M`; multiple files show `N file changes` with aggregate totals.
- **Problems row** — links to the problems bottom tab on the terminal-demo thread.

Rewind actions moved to composer rewind FAB (not in footer).

---

## Jump-to-latest (scroll gate)

Hidden by default; `.is-away` when scrolled up (`scrollTop + clientHeight < scrollHeight - 24`).

**Position:** sits above the footer pill, not overlapping it:

```css
bottom: calc(var(--chat-footer-stack-height, 0px) + var(--sm) + 6px);
z-index: 11;  /* footer pill is z-index 9 */
```

Listeners: `scroll` + `ResizeObserver` on each `.messageStream`; footer `ResizeObserver` updates stack height.

---

## Footer FAB expand (files + subagents)

Portal-based upward fan-out menu (`fabOpen`, `fabClose`, `wireFab`). Files open editor diffs; subagents scroll to and highlight matching cards.

---

## Composer layout

**Left:** attach + ELI5 / YOLO / CREW toggles.

**Right:**
- **Rewind FAB** — extra gap before send (`margin-right: 2px` on rewind, `gap: var(--sm)` in actions row)
- **Send / Stop** — icon-only chevron-up / stop SVG

---

## Selector row

Order: **Persona | Model | Mode** — flex row with equal-shrink slots (`.pm6-chat-selrow`, `.pm6-chat-selbtn`). Labels ellipsis when narrow.

**Floating chat width:** minimum/default floor raised to **380px** (`max(380px, min(var(--floating-chat-w), 40vw))`) so selector row is not clipped on first open.

**Mode dropdown:** body-portaled (`.pm6-chat-mode-popout-portal`, `z-index: 1250`) — opens above the mode button via `modePopoutOpen()`, same pattern as thoroughness/model popouts. No longer clipped by stream `overflow`.

**Persona dropdown:** remains inline with `positionChatDropdown()` flip when overflowing.

---

## Model mini-popout + effort popout

**Model button** opens body-portal mini window (`.pm6-chat-mini-popout-portal`) with grouped model list only.

**Reasoning effort** opens automatically when a model is selected (mirrors Plan → thoroughness flow):
- `modelPopoutAnchor` is stored when the model button opens the list (body-portaled popout is outside `.pm6-chat-root`, so anchor cannot be resolved from the clicked item)
- Pick a model → `applyModelSelection()` closes model popout → `.pm6-chat-effort-popout-portal` opens above the model button
- High / Medium / Low; selecting effort closes the popout
- Only one of: thoroughness popout, mode popout, model popout, effort popout, FAB stack — at a time

---

## Removed web suggestions

The `pm6-chat-suggest` strip, `renderSuggestions()`, thread `suggestions` arrays, and related CSS were removed.

---

## Motion FAB animation

CSS spring stagger on `.pm6-fab-item`; `[data-motion="reduced"]` uses instant show/hide.

---

## Rebuild

```bash
cd Concepts/pm6-build && python3 assemble.py --gate g3
```

Output: `Concepts/PMConcept6.html`

**Key part files:**
- `parts/29x-pm6-js-chat.part.html` — footer layout, mode/effort popouts, selector row
- `parts/09-css-bento-themes.part.html` — jump stack, footer pill, scroll reserve, footer chip hover/diff colors
- `parts/10x-pm6-css-chat.part.html` — selrow, composer spacing, popout portals (mode/model/effort)
- `parts/06-css-components-a.part.html`, `parts/23-html-floating-chat.part.html` — floating min width 380px
