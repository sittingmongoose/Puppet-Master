/* Lane E (2026-10-09): Runtime artifacts (#panel-artifacts) in the Polish design.

   The shell's panel stays as it is: the All / Web / Browser / Evidence tabs filter the receipt cards, the sort menu
   reorders them, each card opens to its evidence, the Investigation shelf groups one fix's trail. On top of the shared
   passes this file adds:
   - the card's family word in sentence case and always shown (the shell hides it below 250 px; FinalGUISpec lets the
     width tier gate chrome, never label text);
   - states the shared vocabulary reads wrongly: "expired" is its own word, Expired, on the stopped ring (an ended
     state, like skipped; F3-619), neither pending nor stale (owner, 2026-10-10); provenance words ("agent judgment")
     and the Investigation facts are plain facts, not states;
   - full words for "15 rec", "EVIDENCE", "x2", "Ok", "Prov", "6d" / "7d", "12k" and the UPPERCASE stat labels;
   - a card whose family and state word do not fit on one line puts the state under the family (measured, never cut);
   - motion the shared code cannot see: this panel has no [data-pane], so the cards deal in on open, on a tab change
     (from the side of the tab you came from) and after a sort.
   Every change is recorded and undone on a concept switch. Uses LANE_E from 53-git.js. */

(() => {
  const PANEL = 'panel-artifacts';
  const WORDS_ART = {
    '15 rec': '15 records',
    'EVIDENCE': 'Evidence',
    'x2': '2 runs',
    'Ok': 'OK',
    'Prov': 'Provenance',
    'expires in 6d · pin to keep': 'expires in 6 days · pin to keep',
    'retention window (7d) starts at completion': 'retention window (7 days) starts at completion',
    'retry 2/2 · lane-b': 'Retry 2/2 · lane-b',
    'lane-c verifier · capture cap 12k lines · auto-redact on': 'lane-c verifier · capture cap 12,000 lines · auto-redact on',
  };
  /* fact lines whose parts never break inside (refs keep their hyphens, counts their words) */
  const KEEP_ART = '.sh-rmeta, .sh-liveline > span, .sh-time, .sh-retn, .sh-row.flat > .sh-meta, .sh-kv > .sh-v:not(.sh-mono)';
  /* provenance and grouping words that are facts, not states */
  const FACT_CHIPS = '.sh-chiprow > .pm-chip, .sh-prov > .pm-chip:not(.pm-chip-ok):not(.pm-chip-err):not(.pm-chip-warn)';

  function states(panel) {
    panel.querySelectorAll('.sh-card > .sh-r1 > .pm-chip').forEach(ch => {
      if (/^\s*expired\b/i.test(ch.textContent)) { LANE_E.chipAs(ch, 'idle'); LANE_E.capOwn(ch); }
    });
    panel.querySelectorAll(FACT_CHIPS).forEach(ch => LANE_E.chipAs(ch, 'token'));
    panel.querySelectorAll('.sh-sortrow > .pm-chip').forEach(ch => LANE_E.chipAs(ch, 'token'));
    /* "Research run in progress": the artifact is on its way */
    panel.querySelectorAll('.sh-scroll > .pm-empty').forEach(el => { if (/\bin progress\b/i.test(el.textContent)) LANE_E.mark(el, 'pending'); });
  }
  function labels(panel) {
    panel.querySelectorAll('.sh-fam, .sh-liveline > span:not(.dot):not(.d-gl)').forEach(LANE_E.capOwn);
    panel.querySelectorAll('.sh-retn, .sh-row.flat > .sh-meta').forEach(LANE_E.capOwn);
    panel.querySelectorAll('.sh-sortlab').forEach(el => { const t = ownText(el); if (t && !/[a-z]/.test(t)) setOwnText(el, sentence(t)); });
  }

  /* a card whose family and state word do not share line 2 puts the state under the family (fit by layout); the
     attribute is the shared data-d-stack, which clearFit() removes on a concept switch */
  function stackCards(panel, force) {
    const rows = Array.from(panel.querySelectorAll('.sh-card > .sh-r1'));
    const widths = rows.map(r => (r.offsetParent ? r.offsetWidth : 0));
    rows.forEach((r, i) => {
      const fam = r.querySelector(':scope > .sh-fam');
      if (!fam || !widths[i] || (!force && r._dStackW === widths[i])) return;
      r._dStackW = widths[i];
      r.removeAttribute('data-d-stack');
      if (LANE_E.inkOver(fam)) r.setAttribute('data-d-stack', '');
    });
  }

  /* motion: the scroller's children are the list (no [data-pane] in this panel) */
  function scroller(panel) { return panel.querySelector(':scope > .sh-scroll'); }
  function dealCards(panel, o) {
    if (!D.on || reduced()) return;
    const sc = scroller(panel);
    if (!sc || !sc.offsetWidth) return;
    deal(dealList(sc), o || {});
  }
  let tabIdx = -1;
  function onClick(ev) {
    if (!D.on) return;
    const panel = document.getElementById(PANEL);
    if (!panel || !panel.contains(ev.target)) return;
    const tab = ev.target.closest('.pm-segtab-item[data-tab]');
    if (tab) {
      const tabs = Array.from(panel.querySelectorAll('.pm-segtab-item[data-tab]'));
      const now = tabs.indexOf(tab), was = tabIdx < 0 ? now : tabIdx;
      tabIdx = now;
      if (now === was) return;
      const f = spec();
      requestAnimationFrame(() => {
        const sc = scroller(panel);
        if (sc) sc.scrollTop = 0;
        stackCards(panel, false);
        dealCards(panel, { dx: f.wipe ? (now > was ? 1 : -1) : (now > was ? 1 : -1) * f.dx, dy: 0, max: 12, step: Math.round(f.step * .8) });
      });
      return;
    }
    if (ev.target.closest('#shArtSort .pm6-tb-menu-item')) {
      requestAnimationFrame(() => dealCards(panel, { max: 12, step: Math.round(spec().step * .8) }));
    }
  }

  panelHook(PANEL, {
    apply(panel) {
      LANE_E.words(panel, WORDS_ART, KEEP_ART);
      labels(panel);
      states(panel);
      LANE_E.cursor(panel, '.sh-card > .sh-r1, .sh-row.flat[data-demo-action]');
      stackCards(panel, false);
      LANE_E.watch(panel, force => stackCards(panel, force));
      if (!panel._dEClick) {
        panel._dEClick = true;
        const tabs = Array.from(panel.querySelectorAll('.pm-segtab-item[data-tab]'));
        tabIdx = Math.max(0, tabs.findIndex(t => t.classList.contains('active')));
        listen(panel, 'click', onClick);
        remember(() => { delete panel._dEClick; tabIdx = -1; });
      }
    },
    show(panel) { stackCards(panel, false); },
  });
})();
