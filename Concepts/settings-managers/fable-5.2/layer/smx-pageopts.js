/* Settings managers, rethought (Fable 5.2): "Page options" on every page.

   PMConcept7 gives each Settings page two small controls at its top right: "Page options" (Show all explanations, Show
   advanced controls, Reset this section, Copy deep link) and a project button with four shortcuts. The audits looked
   inside the managers and never at this frame around them, so the concept had none of it (found 2026-11-11).

   Two of the four entries do something in PMConcept7, and are here:
   - "Explain everything on this page": every setting of the page in one panel, grouped as the page groups them, each
     with what it does and what it is set to now. Pressing one goes to its row and opens its "About".
   - "Copy a link to this page": a link that opens Settings on this page.
   The other two only show a note in PMConcept7 ("Expert and advanced rows stay available in their owning sections";
   "No settings were changed by this concept simulation"), so they are not copied: here less common rows are under
   "More options" and "For experts" on each page, a chapter's own "Reset … defaults" is on its first page, and one
   setting is put back from its "About". The project button's four shortcuts are pages in the list on the left
   (Every setting, as a list; Where projects are kept; History of this project; Copy settings). */
(function (W) {
  'use strict';
  const SMX = W.SMX; if (!SMX) return;
  const kit = () => W.PM51, eng = () => W.PM12_KIMI;
  let refs = null;
  const ref = (id) => { if (!refs) { refs = new Map(); try { for (const c of Object.values((W.PM12_REFERENCE && W.PM12_REFERENCE.byCat) || {})) for (const s of (c.settings || [])) refs.set(s.id, s); } catch (e) { /* no reference list */ } } return refs.get(id) || {}; };
  const LEVEL = { more: 'More options', expert: 'For experts' };

  /* the settings of the page that shows, in the page's order, grouped as the page groups them */
  function groups() {
    const m = SMX.match(SMX.route); if (!m) return [];
    const out = [];
    for (const [id, rec] of SMX.placement().claimed) {
      if (rec.route !== m.page.id || !SMX.has(id)) continue;
      const title = rec.section || (rec.level === 'drawn' ? 'Shown in this page’s own way' : 'Settings');
      const key = rec.level + '|' + title;
      let g = out.find((x) => x.key === key);
      if (!g) { g = { key, title: LEVEL[rec.level] ? `${title} · ${LEVEL[rec.level]}` : title, ids: [] }; out.push(g); }
      g.ids.push(id);
    }
    return out;
  }
  SMX.pageSettings = () => groups().reduce((n, g) => n + g.ids.length, 0);
  /* what a setting does: the text its "About" shows, else the line its row shows */
  const what = (id) => { let s = null; try { s = kit().setting(id); } catch (e) { s = null; } if (!s) return ''; const d = s.detail || {}; const w = (SMX.words || {})[id] || {}; return String(ref(id).desc || d.what || s.description || w.help || kit().rowHelp(s) || ''); };
  const now = (id) => { try { const t = SMX.valueText(id); return t ? 'Now: ' + t : ''; } catch (e) { return ''; } };

  function show(id) {
    try { eng().dispatchAction('close-overlay'); } catch (e) { /* nothing to close */ }
    W.setTimeout(() => {
      SMX.revealSetting(id);
      const host = SMX.host && SMX.host();
      const b = host ? host.querySelector(`[id="setting-${W.CSS.escape(id)}"] [data-action="setting-details"]`) : null;
      if (b) W.setTimeout(() => { if (b.isConnected) b.click(); }, 380);
    }, 140);
  }
  function explain() {
    const m = SMX.match(SMX.route); const ctx = { st: SMX.st(), local: SMX.local };
    const name = m ? (typeof m.page.title === 'function' ? m.page.title(ctx) : m.page.title) : 'This page';
    const gs = groups(); const n = gs.reduce((k, g) => k + g.ids.length, 0);
    const body = gs.map((g) => kit().panelSection(g.title, kit().list(g.ids.map((id) => ({ title: SMX.labelOf(id), meta: now(id), sub: what(id), callback: () => show(id) })), { cls: 'smx-explain' }))).join('');
    kit().panel({ title: `${name}: everything explained`, eyebrow: 'Settings', icon: 'info', summary: `${n === 1 ? 'The one setting' : `All ${n} settings`} on this page, and what ${n === 1 ? 'it does' : 'each does'}. Press one to go to it and see its choices and its default.`, body });
  }
  function link() {
    const hash = '#smx=' + encodeURIComponent('route=' + SMX.route);
    const said = (ok, url) => SMX.toast(ok ? 'Link copied' : 'Copy this link', ok ? 'It opens Settings on this page.' : url, ok ? 'success' : 'info');
    // inside the review page the address that matters is that page's: it copies the link and says how it went
    if (W.parent !== W) { SMX.report && SMX.report('copy-link', { hash }); return; }
    const url = W.location.href.split('#')[0] + hash;
    SMX.lastLink = url;
    try { W.navigator.clipboard.writeText(url).then(() => said(true, url), () => said(false, url)); } catch (e) { said(false, url); }
  }
  SMX.linkSaid = (ok, url) => { SMX.lastLink = String(url || ''); SMX.toast(ok ? 'Link copied' : 'Copy this link', ok ? 'It opens Settings on this page.' : String(url || ''), ok ? 'success' : 'info'); };

  SMX.act('page-options', (el) => {
    const items = [];
    if (SMX.pageSettings()) items.push({ label: 'Explain everything on this page', icon: 'info', onClick: explain });
    items.push({ label: 'Copy a link to this page', icon: 'link', onClick: link });
    // after the press has run its course: PMConcept7 closes a menu when the press that follows lands on the menu's own button, and this press is still on its way to it
    W.setTimeout(() => { try { kit().menu(el, items, 'Page options'); } catch (e) { W.console.error('Page options', e); } }, 0);
  });
  SMX.pageOptions = { explain, link, groups };
})(window);
