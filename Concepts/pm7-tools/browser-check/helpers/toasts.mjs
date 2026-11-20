// Shared toast clearing (PM7KIT-LOOK-PALETTE-TOAST-20261118, F12E-SB-SHEET-TOAST-COVER): a live notice under the title
// bar — its card or action row — can paint over a control a check is about to judge or press, and Jared ruled toasts may
// cover controls, so the check clears its own way instead: every staged toast whose box meets the guarded element's box
// (what, in the log) is dismissed by its own button (a real click on .pmn-x, the only way a person clears one; the toast
// itself is never moved). An entering card is waited for first, because it takes no clicks until its entrance has shown;
// a leaving or flying one is already out of the way. A card that will not take its dismiss click, or will not leave after
// it (PM7KIT-LOOK-PALETTE-DISMISS-LOG-20261118: the dismissal is logged only once removal is confirmed; a card that
// stayed is logged as still there), is left in place: the check's own cover assertion then reports it, exactly as before
// — the helper never forces a click through or past a toast. Up to 5 rounds, so a card that arrives during the clear is
// caught too.
export async function clearToastsOver(t, f, over, label, what = 'the trigger') {
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
    if (!cover.length) return;
    for (const c of cover) {
      if (c.entering) await f.waitForFunction(id => { const e = document.querySelector(`#rsStage .pmn-toast[data-pmn-id="${id}"]`); return !e || !e.classList.contains('pmn-entering'); }, c.id, { timeout: 4000 }).catch(() => {});
      const clicked = await f.locator(`#rsStage .pmn-toast[data-pmn-id="${c.id}"] .pmn-x`).click({ timeout: 3000 }).then(() => true).catch(() => false);
      if (!clicked) { t.log(`${label}: a toast over ${what} ("${c.title}") would not take its dismiss click; its cover will be reported`); continue; }
      const gone = await f.waitForFunction(id => { const e = document.querySelector(`#rsStage .pmn-toast[data-pmn-id="${id}"]`); return !e || !e.isConnected; }, c.id, { timeout: 4000 }).then(() => true).catch(() => false);
      if (gone) t.log(`${label}: dismissed a toast over ${what} ("${c.title}") by its own button`);
      else t.log(`${label}: the toast over ${what} ("${c.title}") stayed after its dismiss click; its cover will be reported`);
    }
  }
}
