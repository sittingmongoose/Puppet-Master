/* Film (concept C): open the Lens on the 2nd row during setup, then film ArrowDown (the Lens follows). --param ms=700 */
export default (p) => ({
  ms: Number(p.ms || 700), extra: 380,
  async setup(pm) {
    const box = await pm.ev(() => { const rows = [...document.querySelectorAll('.pmr-view [data-pmr-nav="select"]')].filter(e => { const r = e.getBoundingClientRect(); return r.height > 2 && r.top > 120; }); const r = rows[1].getBoundingClientRect(); return { x: r.left + 40, y: r.top + r.height / 2 }; });
    await pm.page.mouse.click(box.x, box.y); await pm.wait(900);
  },
  async trigger(pm) { await pm.page.keyboard.press('ArrowDown'); },
});
