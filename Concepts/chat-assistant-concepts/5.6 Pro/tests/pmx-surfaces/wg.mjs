/* WG surfaces for tests/pmx-verify.mjs: the DL-218 Crew and Chat Room recordings (wonderer-grill-demos.js), added in
   concept review round 1 (2026-10-21) so the lint covers what the round changed. Each state is reached through the
   recordings' own controls: Start on the sheet, Accept all, Confirm, the guide's step, Open the leads.
   - wg:crew-chat      the Crew's chat at the end: the Wonderer pass cards (the territory compass, the angles layer,
                       each lead's decision kept beside its research) and both What we agreed cards;
   - wg:crew-view      the Crew's run view, its Wonderer section;
   - wg:room-view      the Chat Room's run view after the room ended, its Wonderer section (every lead has a dossier);
   - wg:agreed-map     Deep Plan's What we agreed with the map of how the decisions hang together open.
   Every one also runs at 480 px wide (sizes), a phone-width chat. PM56_CLOCK runs the recordings faster while a
   surface opens and is put back to 1 before the lint looks; the census's change is one quiet re-render. */
import { fast, until, QUIET_CHANGE } from './_wonderer.mjs';
const SIZES_CHAT = [[1440, 900], [900, 800], [700, 800], [480, 860]];
const SIZES_VIEW = [[1440, 900], [1280, 800], [900, 800], [700, 800], [480, 860]];
async function tryClick(h, sel) { try { return await h.clickVisible(sel); } catch (_) { return false; } }
/* play a recording to its end: every round accepted, every agreement confirmed, the guide's step taken */
async function playOut(h, done, ms = 120000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await h.ev(done)) return;
    if (await tryClick(h, '.wg-agreed[data-state="open"] [data-action="wg-confirm"]')) { await h.wait(400); continue; }
    if (await tryClick(h, '.qs-grill [data-action="qs-accept-round"]')) { await h.wait(700); continue; }
    await h.ev(() => { const b = document.createElement('button'); b.dataset.action = 'wg-demo-step'; document.body.appendChild(b); b.click(); b.remove(); });
    await h.wait(900);
  }
  throw new Error('the recording did not finish');
}
async function crewDone(h) {
  await h.closeAll();
  await h.ev(() => window.PM56_WG_DEMOS.start('crew')); await h.wait(1200);
  if (!(await tryClick(h, '#pmOverlayRoot [data-action="collab-modal-commit"]'))) throw new Error('no Start on the Crew sheet');
  await until(h, () => { const s = window.PM56_WG_DEMOS.snapshot(); return !!(s && s.runId); }, null, 20000);
  await fast(h, 4);
  await playOut(h, () => { const s = window.PM56_WG_DEMOS.snapshot(), r = s && s.runId && window.PM56_COLLAB.run(s.runId); return !!r && r.status === 'completed'; });
  await fast(h, 1);
  return h.ev(() => window.PM56_WG_DEMOS.snapshot().runId);
}
async function roomDone(h) {
  await h.closeAll();
  await h.ev(() => window.PM56_WG_DEMOS.start('room')); await h.wait(1200);
  if (!(await tryClick(h, '#pmOverlayRoot [data-action="collab-modal-commit"]'))) throw new Error('no Start on the room sheet');
  await until(h, () => { const s = window.PM56_WG_DEMOS.snapshot(); return !!(s && s.runId); }, null, 20000);
  await fast(h, 4);
  await playOut(h, () => { const s = window.PM56_WG_DEMOS.snapshot(), r = s && s.runId && window.PM56_COLLAB.run(s.runId); return !!r && r.status === 'completed'; }, 150000);
  await fast(h, 1);
  return h.ev(() => window.PM56_WG_DEMOS.snapshot().runId);
}
/* Open the leads lands the section below the view's sticky head; the lint then measures the view from its top, where no
   scrolled text passes under that opaque head (the head occludes it, which crowding's geometry cannot see) */
const viewTop = h => h.ev(() => { const s = document.querySelector('.pmx-view [data-k^="wg-sec:"]'); let sc = s && s.parentElement; while (sc && sc !== document.body && !(sc.scrollHeight > sc.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement; if (sc && sc !== document.body) sc.scrollTop = 0; });
const leave = async h => { await fast(h, 1); await h.ev(() => { const c = window.PM56_EXT.ctx(); for (const t of [...(c.state.editorTabs || [])]) c.closeEditor(t.id || t); c.state.editorRevealed = false; c.renderApp(); }); await h.closeAll(); };
export default () => [
  { id: 'wg:crew-chat', title: 'The Crew’s chat at the end: the Wonderer pass cards and both What we agreed cards (DL-218)', kind: 'chat', tags: ['app', 'wonderer', 'chat'], canon: ['Crew', 'Wonderer', 'Grill Me'],
    roots: '.wg-card, .wg-agreed, .wg-round', sizes: SIZES_CHAT, change: QUIET_CHANGE,
    async open(h) { await crewDone(h); await h.ev(() => { const el = document.querySelector('.transcript .wg-card'); if (el) el.scrollIntoView({ block: 'start' }); }); await h.settle(); },
    async after(h) { await leave(h); } },
  { id: 'wg:crew-view', title: 'The Crew’s run view, its Wonderer section: two passes, the territory, every lead with its decision and research', kind: 'view', tags: ['app', 'wonderer', 'view'], canon: ['Crew', 'Wonderer'],
    sizes: SIZES_VIEW, change: QUIET_CHANGE,
    async open(h) { const run = await crewDone(h); await h.action('wg-open-leads', { run }); await h.wait(600); await viewTop(h); await h.settle(); },
    async after(h) { await leave(h); } },
  { id: 'wg:room-view', title: 'The Chat Room’s run view after the room ended: the Wonderer section, every lead with its dossier', kind: 'view', tags: ['app', 'wonderer', 'view'], canon: ['Chat Room', 'Wonderer'],
    sizes: SIZES_VIEW, change: QUIET_CHANGE,
    async open(h) { const run = await roomDone(h); await h.action('wg-open-leads', { run }); await h.wait(600); await viewTop(h); await h.settle(); },
    async after(h) { await leave(h); } },
  { id: 'wg:agreed-map', title: 'Deep Plan’s What we agreed with the map of how the decisions hang together (APR-072)', kind: 'chat', tags: ['app', 'wonderer', 'chat'], canon: ['Grill Me'],
    roots: '.wg-agreed', sizes: SIZES_CHAT, change: QUIET_CHANGE,
    async open(h) {
      await h.closeAll(); await h.ev(() => window.PM56_WG_DEMOS.start('deepplan')); await h.wait(1400); await fast(h, 4);
      await until(h, () => !!document.querySelector('.qs-grill [data-action="qs-accept-round"]'), null, 20000);
      for (let i = 0; i < 40 && !(await h.ev(() => !!document.querySelector('.wg-agreed[data-state="open"]'))); i++) { await tryClick(h, '.qs-grill [data-action="qs-accept-round"]'); await h.wait(700); }
      await fast(h, 1);
      await h.ev(() => { const a = document.querySelector('.wg-agreed[data-state="open"]'); if (!a) return; const d = a.querySelector('.wg-agreed-map details, details.wg-agreed-map'); if (d) d.open = true; else { const s = a.querySelector('.wg-agreed-map .pmx-disc-sum'); if (s) s.click(); } a.scrollIntoView({ block: 'start' }); });
      await h.page.mouse.move(2, 2); await h.wait(400); await h.settle();
    },
    async after(h) { await leave(h); } }
];
