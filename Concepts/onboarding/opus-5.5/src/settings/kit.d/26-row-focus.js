/* O55 · a row drawn again keeps the focus. refreshSettingRow (the tome's in-place row refresh) swaps the row for a new
   one, so the control a person was on left the page with it and the focus fell to the body: Space on a switch changed
   the value and lost the place (the editor settings audit of 2026-10-14). Now the same control in the new row takes the
   focus back (same action and value, else the same place among the row's controls, else the row's first control), only
   when the focus was in that row and the old control has gone. */
(function o55RowFocusModule() {
  const CONTROLS = 'button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';
  const rowEl = id => root.querySelector(`[id="setting-${cssEscape(id)}"]`);
  const usable = el => !!el && !el.disabled && !el.hidden && el.getClientRects().length > 0;
  const o55RfPrev = refreshSettingRow;
  refreshSettingRow = function (id) {
    const was = document.activeElement, row = rowEl(id);
    const held = !!(row && was && was !== document.body && row.contains(was));
    let mark = null;
    if (held) {
      const all = Array.from(row.querySelectorAll(CONTROLS));
      mark = { action: was.getAttribute('data-action'), value: was.getAttribute('data-value'), tag: was.tagName, at: all.indexOf(was),
        start: typeof was.selectionStart === 'number' ? was.selectionStart : null, end: typeof was.selectionEnd === 'number' ? was.selectionEnd : null };
    }
    const out = o55RfPrev.apply(this, arguments);
    if (!held || was.isConnected) return out;
    const next = rowEl(id);
    if (!next) return out;
    const all = Array.from(next.querySelectorAll(CONTROLS)).filter(usable);
    const same = all.find(el => el.tagName === mark.tag && el.getAttribute('data-action') === mark.action && el.getAttribute('data-value') === mark.value);
    const to = same || (mark.at >= 0 && all[mark.at] && all[mark.at].tagName === mark.tag ? all[mark.at] : null) || all[0];
    if (!to) return out;
    try { to.focus({ preventScroll: true }); } catch (e) { return out; }
    if (mark.start !== null && typeof to.setSelectionRange === 'function') { try { to.setSelectionRange(mark.start, mark.end); } catch (e) { /* not a text field */ } }
    return out;
  };
})();
