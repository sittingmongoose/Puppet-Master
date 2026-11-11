/* Settings managers, rethought (Fable 5.2): the "About" panel of a setting, on these pages.

   Every setting row here is PMConcept7's own row, and each ends in its "About" button: what the setting does, your
   choices, the default and the way back to it, where it applies, its name for experts. PMConcept7 draws that panel
   into its own page: into the first .document-layout under the Settings root. While these pages show, its engine rests
   on its Home view, and Home has no such place, so the button did nothing here. (Found on 2026-11-11 while stream F's
   landing was checked against this concept; two review rounds and the check file had missed it. It is the one way to
   put a single setting back to its default, so a feature had been dropped.)

   These pages now lend the engine that place: a .document-layout of their own over the page area. It is inside
   #smx-root, the first child of the root, so it is the one the engine finds. The panel it draws, opens, updates and
   closes there is its real one, with everything that panel has now or gains later (the model picker of FO-127 came
   with it, unasked).

   Ours are only: the place, when it may show, and the words.
   - When: a panel the person asked for, by pressing "About" on a row here or a neighbour's name inside the panel. A
     panel the engine opens by itself while it is sent somewhere (a link to a setting) stays hidden: these pages answer
     such a link by showing the row itself.
   - Words: the title reads as the row on the page reads (reworded by SMX.reword, or named by the page itself: "Use
     Claude"), the choices as the row's do, the line above the title names the page of THIS Settings that holds the
     row, and "Next to it" lists the rows that are next to it here, not the ones that were next to it in PMConcept7.
     A setting that each provider, account or persona has its own value for says so in this Settings' words, says on
     which page to change it, and its "Show me" shows the row here or goes to that page. */
(function (W) {
  'use strict';
  const SMX = W.SMX, D = W.document; if (!SMX) return;
  const eng = () => W.PM12_KIMI;
  const h = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let lay = null, scrim = null, insp = null, busy = false;

  const shown = () => !!(insp && insp.classList.contains('is-open'));
  const current = () => { const b = insp && insp.querySelector(':scope > .o55-insp-page:not(.o55-leaving) [data-action="o55-copy-id"][data-setting], :scope > .detail-body [data-action="o55-copy-id"][data-setting]'); return b ? b.getAttribute('data-setting') : ''; };

  /* the engine left without closing its panel (it was sent somewhere, or went Home): put the lent place away */
  function hide() {
    if (!lay) return;
    for (const n of [scrim, insp]) { n.classList.remove('is-open', 'is-settled', 'is-closing'); n.style.display = 'none'; }
    insp.setAttribute('aria-hidden', 'true'); insp.innerHTML = '';
    lay.classList.remove('inspector-open', 'is-armed');
    const host = SMX.host && SMX.host();
    if (host) host.querySelectorAll('.details-btn[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  }
  function close() {
    if (!lay) return;
    let open = false; try { open = !!SMX.fresh().detailSetting; } catch (e) { open = false; }
    if (open) { try { eng().dispatchAction('close-details'); } catch (e) { /* put away below */ } }
    if (shown()) hide();
  }

  /* ---------------------------------------------------------------- the words */
  const firstText = (n) => (n ? [...n.childNodes].find((c) => c.nodeType === 3 && c.nodeValue.trim()) : null);
  /* PMConcept7's "each … has its own" line and its "where to change it" line, in this Settings' words and places.
     Keyed by PMConcept7's own line; the second table holds the lines once they are reworded, so a redraw is a no-op. */
  const PER = {
    'Each account has its own': ['Each account has its own', 'Change it on the account’s own page, under its AI provider.'],
    'Each AI service has its own': ['Each AI provider has its own', 'Change it on the AI provider’s own page.'],
    'Each code service has its own': ['Each code service has its own', 'Change it on the code service’s own page, under Source control.'],
    'Each server has its own': ['Each computer has its own', 'Change it on the computer’s own page, under Computers & remote access.'],
    'Each persona has its own': ['Each persona has its own', 'Change it on the persona’s own page, under Memory & helpers.'],
    'Each Goal template has its own': ['Each Goal template has its own', 'Change it in the template itself, under Planning & goals.']
  };
  const PER_BY_WORDS = Object.fromEntries(Object.values(PER).map((v) => [v[0], v]));
  /* "Show me" in such a panel: PMConcept7 sends its engine to its own manager, which these pages hide (review R2 by
     GLM, F4). Here it shows the row on this page, or goes to the page that lists the things that each have one. */
  function showMe(id) {
    const here = onPage(id);
    close();
    W.setTimeout(() => {
      if (here) { SMX.revealSetting(id); return; }
      const at = SMX.where(id); if (!at) return;
      if (!at.route.includes(':')) { SMX.go(at.route, { reveal: id }); return; }
      const pg = SMX.pages.find((x) => x.id === at.route);
      SMX.go((pg && (pg.parent || pg.chapter)) || 'home');
    }, 120);
  }
  /* the rows that sit in the same card as this one, on its page here */
  function neighbours(id) {
    const at = SMX.where(id); if (!at) return [];
    const out = [];
    for (const [other, rec] of SMX.placement().claimed) {
      if (other === id || rec.route !== at.route || rec.section !== at.section || rec.level !== at.level || rec.level === 'drawn') continue;
      if (!SMX.has(other)) continue;
      out.push(other); if (out.length === 5) break;
    }
    return out;
  }
  /* Where a setting's row is in this Settings: {name, go}. A page with a parameter (one provider, one persona) is named
     only while it is the page that shows; from elsewhere there is no telling which provider was meant, so the chapter
     is named and nothing is offered to press. */
  // the row of a setting on the page that shows: a plain row carries the id, a row that belongs to one provider, account or persona carries data-setting-id
  const rowOf = (id) => { const host = SMX.host && SMX.host(); const page = host && host.querySelector('.smx-page'); return page ? page.querySelector(`[id="setting-${W.CSS.escape(id)}"], .setting-row[data-setting-id="${W.CSS.escape(id)}"], .o55-field[data-setting-id="${W.CSS.escape(id)}"]`) : null; };
  const onPage = (id) => { const host = SMX.host && SMX.host(); const page = host && host.querySelector('.smx-page'); return !!(page && page.querySelector(`[id="setting-${W.CSS.escape(id)}"], [data-setting-id="${W.CSS.escape(id)}"], [data-smx-covers~="${W.CSS.escape(id)}"]`)); };
  function placeOf(id) {
    const at = SMX.where(id); if (!at) return null;
    const here = SMX.match(SMX.route);
    // drawn on the page that shows (a provider's own switch on that provider's page): it is here, whatever page the plan names as its home
    if (onPage(id) || (here && here.page.id === at.route)) {
      // named by the title the page shows: a provider's own page is "Claude", where the plan only says "AI provider"
      const host = SMX.host && SMX.host(); const t = host && host.querySelector('.smx-page .smx-title'); const title = t ? t.textContent.trim() : '';
      const ch = here ? SMX.chapters.find((c) => c.id === here.page.chapter) : null;
      const name = title && ch && title !== ch.title ? `${ch.title} › ${title}` : (title || SMX.pageName(SMX.route));
      return { name, go: '' };
    }
    if (!at.route.includes(':')) return { name: SMX.pageName(at.route), go: at.route };
    const pg = SMX.pages.find((x) => x.id === at.route), ch = pg && SMX.chapters.find((c) => c.id === pg.chapter);
    return ch ? { name: ch.title, go: '' } : null;
  }
  /* PMConcept7 cross-fades from one setting's panel to the next and keeps both in the panel for a moment: each is
     dressed by itself, from its own setting. */
  function dressOne(box) {
    const b = box.querySelector('[data-action="o55-copy-id"][data-setting]'); const id = b ? b.getAttribute('data-setting') : ''; if (!id) return;
    const words = (SMX.words || {})[id] || {};
    // the title reads as the row does: the label the row on this page shows (a page may set it itself, "Use Claude"), else the setting's own
    const shownRow = rowOf(id); const shownLabel = shownRow ? ((firstText(shownRow.querySelector('.setting-label, .o55-field-label')) || {}).nodeValue || '').trim() : '';
    const title = box.querySelector('.o55-insp-title'); const label = shownLabel || SMX.labelOf(id);
    if (title && label && title.textContent !== label) title.textContent = label;
    // a setting that each provider, account, persona … has its own value for: PMConcept7 says whose, and where to change it, in its own place names
    const per = box.querySelector('.o55-insp-now.is-per');
    if (per) {
      const lab = per.querySelector('.o55-insp-now-label'); const kind = lab ? PER[lab.textContent.trim()] || PER_BY_WORDS[lab.textContent.trim()] : null;
      if (lab && kind && lab.textContent !== kind[0]) lab.textContent = kind[0];
      const foot = per.querySelector('.o55-insp-now-foot > span');
      if (foot && kind && foot.textContent !== kind[1]) foot.textContent = kind[1];
      const showMe = per.querySelector('[data-action="o55-reveal"] span');
      if (showMe) { const to = onPage(id) ? 'Show me' : 'Take me there'; if (showMe.textContent !== to) showMe.textContent = to; }
    }
    // where the row is in this Settings; a press goes there when that is another page
    const crumbs = box.querySelector('.o55-insp-crumbs'); const place = placeOf(id);
    if (crumbs && place) {
      const key = (place.go ? 'go:' : 'at:') + place.name;
      if (crumbs.getAttribute('data-smx-place') !== key) {
        const parts = place.name.split(' › ').map(h).join('<span aria-hidden="true">›</span>');
        crumbs.innerHTML = place.go ? `<button type="button" class="o55-textbtn smx-details-go" data-smx-details-go="${h(id)}" aria-label="${h('Show this setting on ' + place.name)}">${parts}</button>` : parts;
        crumbs.setAttribute('data-smx-place', key);
      }
    }
    // choices, the value now and the default read as the row's dropdown does
    if (words.options) {
      const to = (text) => words.options[String(text).trim()] || '';
      box.querySelectorAll('.o55-insp-choice-label').forEach((n) => { const t = firstText(n); const w = t ? to(t.nodeValue) : ''; if (w && t.nodeValue !== w) t.nodeValue = w; });
      for (const sel of ['.o55-insp-now-value', '.o55-insp-now-foot strong']) { const n = box.querySelector(sel); const w = n ? to(n.textContent) : ''; if (w && n.textContent !== w) n.textContent = w; }
    }
    // "Next to it": the rows beside this one here
    const near = box.querySelector('.o55-insp-near');
    if (near) {
      const ids = neighbours(id), key = ids.join(' ');
      if (near.getAttribute('data-smx-near') !== key) {
        near.innerHTML = ids.map((n) => `<button type="button" data-action="setting-details" data-setting="${h(n)}" data-workspace="" data-section="">${h(SMX.labelOf(n))}</button>`).join('');
        near.setAttribute('data-smx-near', key);
        const block = near.closest('.o55-insp-block'); if (block) block.hidden = !ids.length;
      }
    }
    // a control inside the panel is named by the reworded label too
    if (words.label) box.querySelectorAll('.o55-insp-choices[aria-label]').forEach((n) => { if (n.getAttribute('aria-label') !== words.label) n.setAttribute('aria-label', words.label); });
  }
  function dress() {
    if (busy || !insp || !insp.firstElementChild) return;
    busy = true;
    try {
      const pages = [...insp.querySelectorAll(':scope > .o55-insp-page')];
      for (const box of (pages.length ? pages : [insp])) dressOne(box);
    } catch (e) { /* the panel stays in PMConcept7's own words */ }
    busy = false;
  }

  /* ---------------------------------------------------------------- the lent place */
  function mount() {
    if (lay) return;
    const host = SMX.host && SMX.host(); const main = host && host.querySelector('.smx-main');
    if (!main) return;   // the framework calls this again as it mounts
    lay = D.createElement('div'); lay.className = 'smx-details';
    lay.innerHTML = '<div class="detail-scrim" data-action="close-details" style="display:none"></div><aside class="detail-inspector" aria-label="About this setting" aria-hidden="true" style="display:none"></aside>';
    main.appendChild(lay);
    scrim = lay.querySelector('.detail-scrim'); insp = lay.querySelector('.detail-inspector');
    view();
    // asked for by a person: "About" on a row of these pages, or a neighbour's name inside the panel
    host.addEventListener('click', (e) => { const b = e.target.closest && e.target.closest('[data-action="setting-details"]'); if (b && host.contains(b) && SMX.view === 'new') lay.classList.add('is-armed'); }, true);
    // the line above the title, when the row is on another page: go there and show it
    lay.addEventListener('click', (e) => {
      const r = e.target.closest && e.target.closest('[data-action="o55-reveal"][data-setting]');
      if (r) { e.preventDefault(); e.stopPropagation(); showMe(r.getAttribute('data-setting')); }
    }, true);
    lay.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('[data-smx-details-go]'); if (!b) return;
      e.preventDefault(); e.stopPropagation();
      const id = b.getAttribute('data-smx-details-go'), place = placeOf(id);
      close(); if (place && place.go) SMX.go(place.go, { reveal: id });
    });
    new W.MutationObserver(() => { if (!busy) dress(); }).observe(insp, { childList: true, subtree: true, characterData: true });
    /* Escape closes the panel wherever the focus is. PMConcept7's own handler needs the focus inside Settings, and a
       press of "Go back to the default" can leave it on the page body. A menu, a dialog or the panel's unfolded list of
       PMConcept7's closes first, by its own handler; so do this concept's search results. */
    D.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented || SMX.view !== 'new' || !shown() || !lay.classList.contains('is-armed')) return;
      if (SMX.layerOpen || D.querySelector('.pm51-popout.is-open, #pm-settings-portals .drawer-wrap.is-open, #pm-settings-portals [role="dialog"], .o55-pick-inline')) return;
      e.stopPropagation(); close();
    }, true);
  }
  /* "Today" shows PMConcept7's own Settings, and its panel belongs in its own page there */
  function view() {
    if (!lay) return;
    const on = SMX.view === 'new';
    if (!on) { close(); hide(); }
    lay.classList.toggle('document-layout', on);
  }
  /* Looked at on every tick, with the engine's state read fresh. The engine forgets its panel without closing it when
     it is sent somewhere or goes Home, and a redraw in the middle of a close cuts the close short (it clears the timer
     that would have put the panel away): both leave the lent place half open, so it is put away here. */
  let limbo = 0;
  function tidy(st) {
    if (!lay) return;
    const want = !!(st && st.detailSetting);
    if (shown() && !want) { hide(); limbo = 0; return; }
    if (!shown() && !want && insp.style.display !== 'none') { const now = W.performance.now(); if (!limbo) limbo = now; else if (now - limbo > 600) { hide(); limbo = 0; } return; }
    limbo = 0;
    if (!want && lay.classList.contains('is-armed')) lay.classList.remove('is-armed');
  }

  SMX.details = { mount, close, hide, view, tidy, shown, current, node: () => lay };
  // going to another page puts the panel away, as going to another page of PMConcept7's Settings does
  const go = SMX.go;
  SMX.go = (route, opts) => { const to = String(route || 'home').replace(/^\/+|\/+$/g, '') || 'home'; if (lay && to !== SMX.route && (shown() || insp.style.display !== 'none')) close(); return go(route, opts); };
  mount();
})(window);
