## 11. Anti-Flickering and Scroll Preservation

### 11.1 Core Principle

The GUI must never visually "jump" or "flicker" when background data updates arrive. Users must not lose their scroll position or see layout shifts during normal operation.

### 11.2 Strategies

**Scroll position preservation:**
- When new items are added to a `VecModel` (e.g., chat messages, terminal lines), preserve the current scroll position unless the user is scrolled to the bottom
- If scrolled to bottom: auto-scroll to show new content
- If scrolled up (reviewing history): hold position; show a "New messages below" indicator
- Implementation: Track `viewport-y` property on `ListView`; only update if at bottom threshold

**Batch UI updates:**
- When multiple properties change simultaneously (e.g., orchestrator status + progress + terminal lines), batch them into a single `invoke_from_event_loop` call to prevent partial renders
- Example: Do NOT call `invoke_from_event_loop` three times for three properties; collect changes, then apply all in one call

**Stable list keys:**
- Each item in a `VecModel` has a stable ID (not just an index) so that Slint can reconcile updates without destroying and recreating all items
- When updating a list item, modify the existing model entry rather than clearing and rebuilding the entire model

**Avoid full-model replacement:**
- Never call `VecModel::clear()` + re-add all items when only one item changed
- Use `VecModel::set_row_data()` for individual item updates
- Use `VecModel::push()` / `VecModel::remove()` for additions/removals

**Layout stability:**
- Fixed-size containers for status badges, progress bars, and other indicators so they do not cause layout shifts when values change
- Reserve space for optional elements (error messages, loading indicators) even when not visible, or use animation to smoothly reveal them

**Debounce layout persistence:**
- When the user resizes panels or rearranges cards, debounce the redb write (300-500ms) to avoid disk thrashing and potential UI stutter

### 11.3 Terminal-Specific Anti-Flickering

- Bounded line buffer (max 500 visible lines; older lines evicted from VecModel)
- When streaming output arrives rapidly, throttle UI updates to max 30fps (batch lines arriving within 33ms into a single VecModel update)
- Ring buffer in Rust; only the visible window is in the VecModel

---

