/* Settings that apply everywhere (Opus 5.5): the compare board (BUILD-SPEC section 12).

   A sheet in #pm-settings-portals, opened from the strip's Compare (or C), that sets the options side by side in the
   real row markup and classes (div.setting-row.o55-row, .setting-copy, .setting-label, .setting-description,
   .setting-control; the controls copied from a live row when one is on screen), so all ten looks draw it.
     First grid    the end-of-row options A, B, C, D across four specimen rows
     Second grid   the Changed options A, B, C across the same rows
   Specimen rows: plain (Speed or power: nothing differs anywhere); changed (Explain technical terms, changed
   everywhere); varies (Everyday model as harbor sees it); changed and its own here (Helpers at once in tastebook, with
   its limit line). Each column says the option and its one weakness (SETTINGS-PROPOSAL 2.2, 2.3). The specimens are
   pictures (inert), so the keyboard goes from column to column through the "Use this" buttons and never gets trapped. */
(function (W) {
  'use strict';
  const PSX = W.PSX; if (!PSX || PSX.board) return;
  const { D, esc, mark, icon, label, vt } = PSX;
  const S = PSX.S;
  const CHEV = '<svg class="psx-chev" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false"><path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const END_OPTS = [
    ['origin', 'A · Origin word', 'Decided (S5 A). One labelled spot answers “where is this set?” and opens the panel.', 'Weak: the word changes from row to row.'],
    ['mark', 'B · Second mark', 'Matches the Changed mark.', 'Weak: two marks crowd a short title at narrow widths.'],
    ['line', 'C · Sentence line', 'Says where without opening anything.', 'Weak: one more line on every row that differs.'],
    ['more', 'D · More menu', 'Jared’s “…”, with its word: fast for experts.', 'Weak: it hides the state until opened.']
  ];
  const CHG_OPTS = [
    ['outline', 'A · Word and outline', 'Decided (S6 A). The word, and the control’s own border in the accent.', 'Weak: two signals per changed row.'],
    ['word', 'B · Word only', 'Already built, made readable at 11.5px.', 'Weak: nothing to scan for on a long page.'],
    ['frame', 'C · Framed row', 'Easy to spot while scrolling.', 'Weak: a page of changed rows reads like a page of cards.']
  ];

  /* the controls, copied from a live row when there is one (the engine's own markup), else drawn the same way */
  function liveControl(kind) {
    const sel = kind === 'select' ? '.setting-row .setting-control > .pm51-dd' : kind === 'toggle' ? '.setting-row .setting-control > .toggle' : '.setting-row .setting-control > .o55-num';
    const el = D.querySelector('#pm-settings-root ' + sel);
    return el ? el.outerHTML : null;
  }
  function control(kind, text, on) {
    if (kind === 'select') {
      const live = liveControl('select');
      if (live) { const t = D.createElement('template'); t.innerHTML = live; const v = t.content.querySelector('.pm51-dd-value'); if (v) v.textContent = text; t.content.querySelectorAll('select').forEach((s) => s.remove()); return t.innerHTML; }
      return `<span class="pm51-dd"><button type="button" class="pm51-dd-trigger"><span class="pm51-dd-value">${esc(text)}</span>${icon('down')}</button></span>`;
    }
    if (kind === 'toggle') return `<button type="button" class="toggle${on ? ' on' : ''}" role="switch" aria-checked="${on ? 'true' : 'false'}"></button>`;
    return `<label class="o55-num"><input class="text-control" type="number" value="${esc(text)}" readonly><span class="o55-unit">helpers</span></label>`;
  }
  function specimens() {
    const ev = PSX.resolve('general.interaction.eli5-default', { project: 'harbor', device: 'here' });
    const em = PSX.resolve('ai.models.default-model', { project: 'harbor', device: 'here' });
    const hp = PSX.resolve('branching.subagents.max-parallel', { project: 'tastebook', device: 'here' });
    const sp = PSX.engineSetting('ai.models.default-variant');
    return [
      { name: 'Plain', label: sp ? label('ai.models.default-variant') : 'Speed or power', help: 'Faster and cheaper, or slower and smarter.', ctl: control('select', sp ? vt('ai.models.default-variant', sp.value) : 'The model’s usual setting'), changed: false, word: 'Details', here: false, mark2: '', sentence: '' },
      { name: 'Changed', label: label('general.interaction.eli5-default'), help: 'Plain words for technical terms in chats.', ctl: control('toggle', '', !!ev.value), changed: ev.changed, word: 'Details', here: false, mark2: '', sentence: '' },
      { name: 'Varies', label: label('ai.models.default-model'), help: 'As harbor sees it: from everywhere, and docs-site has its own.', ctl: control('select', vt('ai.models.default-model', em.value)), changed: em.changed, word: 'Varies', here: false, mark2: 'Varies', sentence: 'Different in docs-site' },
      { name: 'Its own here', label: label('branching.subagents.max-parallel'), help: 'In tastebook, which asks for 6.', ctl: control('number', hp.asked !== undefined ? hp.asked : hp.value), changed: hp.changed, word: 'This project', here: true, mark2: 'Set for this project', sentence: `Set for tastebook · everywhere else ${vt('branching.subagents.max-parallel', 4)}`, line: `Limited to ${vt('branching.subagents.max-parallel', hp.ceiling ? hp.ceiling.value : 3)} on This computer` }
    ];
  }
  function rowHtml(sp, end, chg) {
    const word = end === 'origin' ? sp.word : end === 'more' ? 'More' : 'Details';
    const endBtn = end === 'more'
      ? `<button type="button" class="icon-btn details-btn o55-about psx-end psx-more"><span class="psx-end-more" aria-hidden="true">⋯</span><span class="psx-end-word">More</span></button>`
      : `<button type="button" class="icon-btn details-btn o55-about psx-end${end === 'origin' && sp.here ? ' is-here' : ''}${word === 'Details' ? ' is-quiet' : ''}"><span class="psx-end-word">${esc(word)}</span>${CHEV}</button>`;
    const changed = sp.changed ? `<span class="o55-changed">${mark('change-modified')}<span>Changed</span></span>` : '';
    const m2 = end === 'mark' && sp.mark2 ? `<span class="psx-mark2">${mark('info')}<span>${esc(sp.mark2)}</span></span>` : '';
    const s = end === 'line' && sp.sentence ? `<div class="psx-line psx-src">${mark('info')}<span>${esc(sp.sentence)}</span></div>` : '';
    const ln = sp.line ? `<div class="psx-line">${mark('info')}<span>${esc(sp.line)}</span></div>` : '';
    return `<div class="setting-row o55-row${sp.changed ? ' is-changed' : ''}" data-o55-kind="specimen"><div class="setting-copy"><div class="setting-label">${esc(sp.label)}${changed}${m2}</div><div class="setting-description">${esc(sp.help)}</div>${s}${ln}</div><div class="setting-control">${sp.ctl}</div>${endBtn}</div>`;
  }
  function grid(opts, kind) {
    const sps = specimens();
    return `<div class="psx-board-grid" data-kind="${kind}">${opts.map(([v, name, good, weak]) => {
      const end = kind === 'end' ? v : 'origin', chg = kind === 'chg' ? v : 'outline';
      const cur = kind === 'end' ? S.opt.end === v : S.opt.changed === v;
      // the specimens are pictures (inert); what each shows is said in words for a screen reader
      const said = sps.map((sp) => { const word = end === 'origin' ? sp.word : end === 'more' ? 'More' : 'Details'; return `${sp.label}${sp.changed ? ', Changed' + (chg === 'outline' ? ' with an outline on its control' : chg === 'frame' ? ' with a frame round the row' : '') : ''}${end === 'mark' && sp.mark2 ? ', then ' + sp.mark2 : ''}${end === 'line' && sp.sentence ? ', with the line ' + sp.sentence : ''}, ending in ${word}`; }).join('. ');
      const did = `psx-said-${kind}-${v}`;
      return `<section class="psx-board-col" aria-label="${esc(name)}" aria-describedby="${did}"><p id="${did}" hidden>${esc(said)}.</p><header class="psx-board-head"><div class="psx-board-name">${esc(name)}${cur ? ` <span class="psx-st" data-st="complete">${mark('complete')}<span>Showing now</span></span>` : ''}</div><p class="psx-board-good">${esc(good)}</p><p class="psx-board-weak">${esc(weak)}</p><button type="button" class="psx-tb" data-use="${kind}:${v}"${cur ? ' aria-disabled="true"' : ''}>${cur ? 'In use on the page' : 'Use this on the page'}</button></header><div class="psx-board-rows" data-cell-end="${end}" data-cell-chg="${chg}" inert><div class="setting-list">${sps.map((sp) => rowHtml(sp, end, chg)).join('')}</div></div></section>`;
    }).join('')}</div>`;
  }
  function open() {
    if (PSX.board.sheet && PSX.board.sheet.back.isConnected) { PSX.board.draw(); return PSX.board.sheet; }
    const s = PSX.sheet({ id: 'board', size: 'board', cls: 'psx-board-sheet', kicker: 'Compare options', title: 'How a row says where its value comes from', sub: 'Decided: A and A (Jared, 2026-11-03). The others stay here to compare, on the same four rows; specimens use example values.', body: '<div class="psx-board"></div>', actions: [{ spacer: true }, { label: 'Close', primary: true, run: (x) => x.close() }] });
    PSX.board.sheet = s;
    PSX.board.draw();
    return s;
  }
  function draw() {
    const s = PSX.board.sheet; if (!s || !s.back.isConnected) return;
    const host = s.body.querySelector('.psx-board');
    host.innerHTML = `<h3 class="psx-h">The end of the row · S5</h3>${grid(END_OPTS, 'end')}<h3 class="psx-h">The Changed mark · S6</h3>${grid(CHG_OPTS, 'chg')}`;
    host.querySelectorAll('[data-use]').forEach((b) => b.addEventListener('click', () => {
      if (b.getAttribute('aria-disabled') === 'true') return;
      const [k, v] = b.dataset.use.split(':');
      PSX.command({ cmd: 'opt', [k === 'end' ? 'end' : 'changed']: v }).then(() => { draw(); const f = PSX.board.sheet.body.querySelector(`[data-use="${k}:${v}"]`); if (f) f.focus({ preventScroll: true }); });
    }));
  }
  PSX.board = { open, draw, sheet: null, specimens };
})(window);
