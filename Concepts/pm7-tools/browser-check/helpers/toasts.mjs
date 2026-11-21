// Shared toast clearing (PM7KIT-LOOK-PALETTE-TOAST-20261118, F12E-SB-SHEET-TOAST-COVER): a live notice under the title
// bar — its card or action row — can paint over a control a check is about to judge or press, and Jared ruled toasts may
// cover controls, so the check clears its own way instead: every staged toast whose box meets the guarded element's box
// (what, in the log) is dismissed by its own button (a real click on .pmn-x, the only way a person clears one; the toast
// itself is never moved). An entering card is waited for first, because it takes no clicks until its entrance has shown;
// a leaving or flying one is already out of the way. A card that will not take its dismiss click, or will not leave after
// it (PM7KIT-LOOK-PALETTE-DISMISS-LOG-20261118: the dismissal is logged only once removal is confirmed; a card that
// stayed is logged as still there), is left in place: the check's own cover assertion then reports it, exactly as before
// — the helper never forces a click through or past a toast. Up to 5 rounds, so a card that arrives during the clear is
// caught too. Returns how many cards it confirmed dismissed (a card that stayed or would not take its dismiss click
// counts as none): quickClickClear uses that to know its pointer left the control and the dwell must be repeated.
export async function clearToastsOver(t, f, over, label, what = 'the trigger') {
  let dismissed = 0;
  for (let round = 0; round < 5; round++) {
    const cover = await over.evaluate(el => {
      if (!document.querySelector('#rsStage')) return [];
      const r = el.getBoundingClientRect();
      return [...document.querySelectorAll('#rsStage .pmn-toast')]
        .filter(c => !c.classList.contains('pmn-leaving') && !c.classList.contains('pmn-flying'))
        .map(c => {
          const b = c.getBoundingClientRect();
          return { id: c.getAttribute('data-pmn-id') || '', entering: c.classList.contains('pmn-entering'),
            over: !!b.width && !!b.height && !(b.right < r.left || b.left > r.right || b.bottom < r.top || b.top > r.bottom),
            title: (c.querySelector('.pmn-title')?.textContent || c.textContent || '').trim().slice(0, 48) };
        })
        .filter(x => x.over && x.id);
    }).catch(() => []);
    if (!cover.length) return dismissed;
    for (const c of cover) {
      if (c.entering) await f.waitForFunction(id => { const e = document.querySelector(`#rsStage .pmn-toast[data-pmn-id="${id}"]`); return !e || !e.classList.contains('pmn-entering'); }, c.id, { timeout: 4000 }).catch(() => {});
      const clicked = await f.locator(`#rsStage .pmn-toast[data-pmn-id="${c.id}"] .pmn-x`).click({ timeout: 3000 }).then(() => true).catch(() => false);
      if (!clicked) { t.log(`${label}: a toast over ${what} ("${c.title}") would not take its dismiss click; its cover will be reported`); continue; }
      const gone = await f.waitForFunction(id => { const e = document.querySelector(`#rsStage .pmn-toast[data-pmn-id="${id}"]`); return !e || !e.isConnected; }, c.id, { timeout: 4000 }).then(() => true).catch(() => false);
      if (gone) { t.log(`${label}: dismissed a toast over ${what} ("${c.title}") by its own button`); dismissed++; }
      else t.log(`${label}: the toast over ${what} ("${c.title}") stayed after its dismiss click; its cover will be reported`);
    }
  }
  return dismissed;
}

// quickClick's own hover semantics with the clear where it can actually catch the race (F follow-up to
// PM7KIT-LOOK-PALETTE-TOAST-20261118, batch 12 ITEMS follow-up line: a notice that arrives during t.quickClick's own
// ~480 ms hover dwell is not caught by clearToastsOver-before-quickClick, because that clear runs before the hover
// starts). t.quickClick is browser-check's own and must not change, so the kit holds the sequence instead: the same
// pointer path (one mouse.move to the control's centre in window pixels, 4 steps, quickClick's own aim) and the same
// dwell (480 ms by default — the hover engine needs the pointer to dwell on the control first), then the shared clear
// AFTER the dwell and immediately before the press, then the press itself (mouse.down + mouse.up, nothing between).
// A dismissal is a real click on a card's own button, so it moves the pointer off the control: after any dismissal the
// dwell is repeated — the same move, the same wait — and the press only ever follows a dwell at whose end the clear
// found nothing over the control (at most 5 dwell→clear rounds). A card that will not leave is never pressed through
// or past: it is reported exactly as quickClick reports a cover, and the check's own assertions take it from there.
// quickClick's private press-verification listeners are its own; what the press did is judged by the check's own
// assertions, as before.
export async function quickClickClear(t, f, el, label, opts = {}) {
  const { hover = 480, name = 'quick click element', timeout = 2000, tolerance = 2 } = opts;
  // The control's centre in window pixels, quickClick's own aim: its box in its own document, moved by its frame's
  // origin (0 for the main frame; the frame element's box under the sandbox), clamped into the viewport.
  const centre = async () => {
    const r = await el.evaluate(e => { const b = e.getBoundingClientRect(); return b.width && b.height ? [b.left, b.top, b.width, b.height] : null; }).catch(() => null);
    if (!r) return null;
    const fe = f === t.page.mainFrame() ? null : await f.frameElement().catch(() => null);
    const off = fe ? await fe.boundingBox().catch(() => null) : { x: 0, y: 0 };
    if (!off) return null;
    const [vw, vh] = await t.page.evaluate(() => [innerWidth, innerHeight]);
    return { x: Math.min(Math.max(off.x + r[0] + r[2] / 2, 0), vw - 1), y: Math.min(Math.max(off.y + r[1] + r[3] / 2, 0), vh - 1) };
  };
  // What a press at the control's centre would land on, quickClick's own question (t.hitAt), waiting out a view
  // transition the way its settled() does, up to timeout.
  const onTop = async () => {
    const end = Date.now() + timeout;
    for (;;) {
      const hits = await t.hitAt(el).catch(() => null);
      if (!hits || !hits.length) return { gone: true };
      if (!hits.some(h => h.viewTransition)) return { hit: hits[0] };
      if (Date.now() >= end) return { vt: true, hit: hits[0] };
      await t.page.waitForTimeout(50);
    }
  };
  for (let round = 0; round < 5; round++) {
    const at = await centre();
    if (!at) return t.quickClick(el, opts); // no box to aim at: let quickClick report it in its own words
    await t.page.mouse.move(at.x, at.y, { steps: 4 });
    t.mark(`${name} hover`);
    await t.page.waitForTimeout(hover);
    if (await clearToastsOver(t, f, el, label)) continue; // the dismissal moved the pointer: dwell again before pressing
    const now = await centre();
    if (!now) return t.quickClick(el, opts);
    const moved = Math.hypot(now.x - at.x, now.y - at.y);
    if (moved > tolerance) return t.record(name, false, `moving: it went ${Math.round(moved)} px during the ${hover} ms dwell (${Math.round(at.x)},${Math.round(at.y)} to ${Math.round(now.x)},${Math.round(now.y)}); not pressed`, { target: el });
    const top = await onTop();
    if (top.gone) return t.quickClick(el, opts);
    if (top.vt) return t.record(name, false, `a view transition kept running for ${timeout} ms: while one runs, presses go to the page's root, not the control; not pressed`, { target: el });
    if (!top.hit.on) return t.record(name, false, `covered by ${top.hit.top} at ${top.hit.x},${top.hit.y} after the ${hover} ms dwell and clear; not pressed`, { target: el });
    await t.page.mouse.down();
    await t.page.mouse.up();
    t.mark(`${name} click`);
    return t.record(name, true, '', { target: el });
  }
  const last = await onTop();
  if (last.hit && !last.hit.on) return t.record(name, false, `covered by ${last.hit.top} at ${last.hit.x},${last.hit.y}; toasts kept arriving over it through 5 dwell-and-clear rounds; not pressed`, { target: el });
  return t.record(name, false, 'toasts kept arriving over it through 5 dwell-and-clear rounds; not pressed', { target: el });
}
