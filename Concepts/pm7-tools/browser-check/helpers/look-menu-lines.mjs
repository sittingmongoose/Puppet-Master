// Read painted line boxes and hit tests after actual wheel input. Never reveal
// content with DOM scroll setters or scrollIntoView (including screenshot helpers).
export async function reachableMenuLines(t, f, id) {
  const menu = f.locator('.o55-lookslot .o55-lookmenu');
  await f.waitForFunction(() => !document.querySelector('.o55-lookslot .o55-writing'));
  const sample = () => f.evaluate(id => {
    const menu = document.querySelector('.o55-lookslot .o55-lookmenu');
    const inline = menu.querySelector(`[data-tip="${id}"] .o55-explainer-w`);
    const note = inline || document.querySelector('.o55-stage .pst-tip-t');
    const scroller = inline ? menu : note;
    const win = document.querySelector('.o55-win'), head = document.querySelector('.o55-head');
    const m = menu.getBoundingClientRect(), w = win.getBoundingClientRect(), h = head.getBoundingClientRect();
    let top = w.top + win.clientTop, bottom = top + win.clientHeight, left = w.left + win.clientLeft, right = left + win.clientWidth;
    for (let el = note; el && el !== win; el = el.parentElement) {
      const style = getComputedStyle(el), r = el.getBoundingClientRect();
      if (/hidden|clip|auto|scroll/.test(style.overflowY)) { top = Math.max(top,r.top+el.clientTop); bottom = Math.min(bottom,r.top+el.clientTop+el.clientHeight); }
      if (/hidden|clip|auto|scroll/.test(style.overflowX)) { left = Math.max(left,r.left+el.clientLeft); right = Math.min(right,r.left+el.clientLeft+el.clientWidth); }
    }
    const lines = [];
    if (note) {
      const walker = document.createTreeWalker(note, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) for (let i = 0; i < node.length; i++) {
        if (!node.textContent[i].trim()) continue;
        const range = document.createRange(); range.setStart(node, i); range.setEnd(node, i + 1);
        const r = range.getBoundingClientRect();
        let line = lines.find(l => Math.abs(l.y - r.top) < 1);
        if (!line) { line = {y:r.top, bottom:r.bottom, left:r.left, right:r.right}; lines.push(line); }
        line.left = Math.min(line.left,r.left); line.right = Math.max(line.right,r.right);
      }
    }
    return {scroll:scroller.scrollTop, presentation:inline ? 'inline' : 'stage', bounded:m.top >= h.bottom - 1 && m.bottom <= w.bottom - win.clientTop + 1,
      win:[w.x,w.y,w.width,w.height], head:[h.x,h.y,h.width,h.height],
      lines:lines.map((r,i) => ({i, visible:r.y >= top && r.bottom <= bottom && r.left >= left && r.right <= right && note.contains(document.elementFromPoint((r.left+r.right)/2,(r.y+r.bottom)/2))}))};
  }, id);
  const inline = await menu.locator('.o55-explainer-w').count();
  const at = await (inline ? menu : f.locator('.o55-stage .pst-tip-t').last()).boundingBox();
  // boundingBox includes sandbox frame offsets; mouse input is on the top page.
  await t.page.mouse.move(at.x + at.width / 2, Math.min(at.y + at.height - 12, (await t.page.viewportSize()).height - 30));
  await t.page.mouse.wheel(0, -2400);
  await f.waitForTimeout(100);
  const first = await sample(), seen = new Set();
  let last = first, moved = false;
  for (let turn = 0; turn < 24; turn++) {
    for (const line of last.lines) if (line.visible) seen.add(line.i);
    if (seen.size === last.lines.length && last.lines.length) break;
    await t.page.mouse.wheel(0, 100);
    await f.waitForTimeout(100);
    const next = await sample();
    moved ||= next.scroll !== last.scroll;
    if (next.scroll === last.scroll && turn > 1) { last = next; break; }
    last = next;
  }
  const stationary = JSON.stringify(first.win) === JSON.stringify(last.win) && JSON.stringify(first.head) === JSON.stringify(last.head);
  return {id, lines:last.lines.length, seen:seen.size, moved, bounded:last.bounded, stationary,
    ok:last.bounded && stationary && last.lines.length > 0 && seen.size === last.lines.length};
}
