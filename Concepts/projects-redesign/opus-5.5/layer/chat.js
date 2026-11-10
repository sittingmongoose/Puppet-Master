/* Projects concepts (Opus 5.5), fix pass 2026-11-10: chats with no project, reachable inside the app, window.PJX.chat.

   Jared 2026-11-09 (#13): "Where did we land on starting a chat with no project? I see there is an option to start a new
   project from a chat thread, but that is it." Until now "Make this a project…" was reachable only from the review strip.
   This file puts No project where canon puts it (ACD-508, ACD-510; the settled N2, N20 and N27 decisions are not reopened):

   - New is a split: Home's board bar and the chat header's New thread offer this Project, No project or another Project.
   - The title-bar project switcher has its fixed No project row.
   - The chat's History sidebar has a No project group: its chats, a New chat with no project button, and each row's More
     with Make a project from this chat and Move this chat into a project.
   - A no-project chat says its place (No project · This computer). Its Where chip and its More menu offer the two named
     conversions, and its header offers Make this a project… (the chooser, neither preselected). The three workflows that
     still need a project (Planning Wizard, PRD Builder, Orchestrator) say Needs a project and offer the same two choices.

   Both conversions run in concept C (Projects page): New Project from a chat, and Move this chat into a project. PMConcept7's
   own chat is not edited: the no-project chat is drawn over its chat stage, in its own message, header and composer
   material, and goes away when you go back to the project's chats. */
(function (W) {
  'use strict';
  const PJX = W.PJX;
  if (!PJX || PJX.chat) return;
  const D = W.document, { h, icon, tip, ENV } = PJX;
  const w = (k, v) => PJX.w(k, v);
  const F = () => PJX.S.world.facts;
  const ROOT = () => D.getElementById('pmw-chat56');
  const comp = (id) => ENV.computers.find((c) => c.id === id) || ENV.computers[0];
  const projectName = () => { const l = D.getElementById('projectMenuLabel'); return (l && l.textContent.trim()) || 'this project'; };

  const allChats = () => (ENV.chats || []).concat((F() && F().chats) || []);
  const chatOf = (id) => allChats().find((c) => c.id === id) || null;
  const gone = (c) => !!((F().converted || {})[c.id] || (F().moved || {})[c.id]);
  const list = () => allChats().filter((c) => !gone(c));

  /* ------------------------------------------------------------------ going to a conversion (concept C draws both paths) */
  function go(kind, id) {
    if (!id) return;
    // the chooser and both paths live on the Projects page, in Split v2
    if (W.PM_PAGES && W.PM_PAGES.current !== 'projects') W.PM_PAGES.go('projects');
    const send = () => PJX.emit('need-chat', { id, kind });
    if (PJX.S.mounted !== 'c') { PJX.config({ opt: 'c' }); setTimeout(send, 120); } else setTimeout(send, 30);
  }
  const named = (id) => [
    { label: w('nc.makeFrom'), icon: 'folder-plus', meta: w('nc.makeFromMeta'), run: () => go('new', id) },
    { label: w('nc.moveInto'), icon: 'move', meta: w('nc.moveIntoMeta'), run: () => go('move', id) }
  ];

  /* ------------------------------------------------------------------ New: this Project, No project or another Project */
  function newThreadHere() {
    close();
    const b = ROOT() && ROOT().querySelector('.chat-header [data-action="new-thread"]');
    if (b) b.click();
  }
  function newMenu(anchor) {
    const here = projectName(), others = PJX.listed().filter((p) => p.name !== here && p.lifecycle === 'listed').slice(0, 4);
    PJX.menu(anchor, [
      { label: w('nc.new.cap'), items: [
        { label: w('nc.new.here', { project: here }), icon: 'folder', meta: w('nc.new.hereMeta'), run: () => newThreadHere() },
        { label: w('nc.new.none'), icon: 'chat', meta: w('nc.new.noneMeta', { computer: comp('here').name }), run: () => newDraft() }] },
      { label: w('nc.new.other'), items: others.map((p) => ({ label: p.name, icon: p.glyph || 'folder', meta: p.where.label, run: () => PJX.toast(w('nc.new.otherToast', { project: p.name }), w('nc.new.otherToastText', { project: p.name }), 'info') })) }
    ], { label: w('nc.new.menu'), align: 'start' });
  }

  /* ------------------------------------------------------------------ the chat view, drawn over the chat stage */
  let V = null;   // { id, draft, comp, notice, text }
  function openChat(id) { if (!chatOf(id)) return; V = { id, draft: false, notice: null, text: '' }; showChat(); closeFlyout(); paint(); later(() => focusIn('.pjx-npc-title')); }
  function newDraft() { V = { id: null, draft: true, comp: 'here', notice: null, text: '' }; showChat(); closeFlyout(); paint(); later(() => focusIn('.pjx-npc-input')); }
  /* History is a flyout in the chat's overlay layer: it closes when a chat is chosen from it, unless it is pinned */
  const flyout = () => D.querySelector('#pmOverlayRoot .history-flyout, .history-flyout');
  function closeFlyout() {
    const fl = flyout(); if (!fl || fl.getBoundingClientRect().width < 10) return;
    const grid = ROOT() && ROOT().querySelector('.assistant-grid');
    if (grid && /history-pinned/.test(grid.className)) return;
    const x = Array.from(fl.querySelectorAll('button')).find((b) => /close/i.test((b.getAttribute('aria-label') || '') + (b.getAttribute('data-pm-hover-label') || '') + (b.title || '')));
    if (x) x.click(); else { const t = ROOT() && ROOT().querySelector('.chat-header [data-action="toggle-history"]'); if (t) t.click(); }
  }
  function close() { V = null; paint(); }
  const later = (fn) => setTimeout(fn, 40);
  function focusIn(sel) { const r = ROOT(), el = r && r.querySelector('.pjx-npc ' + sel); if (el) { try { el.focus({ preventScroll: true }); } catch (e) { /* gone */ } } }
  /* the chat panel shows (it can be closed or popped out): PMConcept7's own toggle, when it is hidden */
  function showChat() {
    const r = ROOT(); if (r && r.getBoundingClientRect().width > 40) return;
    const t = D.querySelector('[data-action="toggle-chat"], #toggleChatBtn, [data-binding-id="shell.chat.toggle"]');
    if (t) t.click();
  }
  function placeWord(c) { return w('nc.place', { computer: comp(c ? c.runsOn : V.comp).name }); }
  function placeMenu(anchor) {
    const c = V.draft ? null : chatOf(V.id);
    if (V.draft) {
      PJX.menu(anchor, [
        { label: w('nc.where.goes'), items: [
          { label: w('nc.new.here', { project: projectName() }), icon: 'folder', meta: w('nc.new.hereMeta'), run: () => newThreadHere() },
          { label: w('nc.new.none'), icon: 'chat', meta: w('nc.where.chosen'), run: () => {} }] },
        { label: w('nc.where.computer'), items: ENV.computers.map((x) => ({ label: x.name, icon: x.glyph, meta: (x.id === V.comp ? w('nc.where.chosen') + ' · ' : '') + x.detail, run: () => { V.comp = x.id; paint(); } })) }
      ], { label: w('nc.where.menu'), align: 'start' });
      return;
    }
    PJX.menu(anchor, [
      { label: w('nc.where.cap', { computer: comp(c.runsOn).name }), items: named(c.id) },
      { items: [{ label: w('nc.where.continue'), icon: 'swap', meta: w('nc.where.continueMeta'), disabled: true, run: () => {} }] }
    ], { label: w('nc.where.menu'), align: 'start' });
  }
  function moreMenu(anchor, c) {
    PJX.menu(anchor, [
      { items: named(c.id) },
      { items: [{ label: w('nc.chooser'), icon: 'help', meta: w('nc.chooserMeta'), run: () => go('chooser', c.id) }] },
      { items: [{ label: w('nc.more.rename'), icon: 'edit', disabled: true, meta: w('nc.more.demo'), run: () => {} }, { label: w('nc.more.archive'), icon: 'archive', disabled: true, meta: w('nc.more.demo'), run: () => {} }] }
    ], { label: w('nc.more.menu', { chat: c.title }) });
  }
  function msg(role, text) {
    if (role === 'system') return h('div.pjx-npc-divider', { role: 'note' }, h('span', { text }));
    return h('article', { class: ['message', role === 'user' ? 'message-user' : 'message-assistant', 'pjx-npc-msg'], 'data-role': role },
      h('div.message-surface', null, role === 'assistant' ? h('div.message-role', { text: 'Assistant' }) : null, h('div.message-body', null, h('p', { text }))));
  }
  /* a waiting approval in the chat: it must settle before a conversion can run (ACD-510 "Existing approvals settle first") */
  function approvalCard(c, a) {
    const st = (F().approvals || {})[a.id] || a.state;
    if (st !== 'waiting') return h('div.pjx-npc-divider', { role: 'note' }, h('span', { text: st === 'allowed' ? w('nc.ap.allowed', { what: a.what }) : w('nc.ap.denied', { what: a.what }) }));
    const set = (v) => { F().approvals[a.id] = v; PJX.emit('change', { why: 'approval' }); paint(); };
    const b1 = h('button.pjx-btn.is-primary', { type: 'button', 'data-c-key': 'npc:ap:once', text: w('nc.ap.once') }), b2 = h('button.pjx-btn', { type: 'button', 'data-c-key': 'npc:ap:no', text: w('nc.ap.no') });
    b1.addEventListener('click', () => set('allowed')); b2.addEventListener('click', () => set('denied'));
    return h('div.pjx-npc-approval', { role: 'group', 'aria-label': w('nc.ap.title') }, h('span.pjx-st-mark', { html: PJX.calm('waiting', 14), 'aria-hidden': 'true' }),
      h('div.pjx-npc-aptext', null, h('b', { text: w('nc.ap.title') }), h('span', { text: a.what })), h('div.pjx-npc-apacts', null, b1, b2));
  }
  /* Needs a project: the three workflows that keep it (Planning Wizard, PRD Builder, Orchestrator), each with both choices */
  const NEEDS = [['plan', 'plan', 'nc.need.plan'], ['prd', 'notebook', 'nc.need.prd'], ['orch', 'workflow', 'nc.need.orch']];
  function needsRow(c) {
    const row = h('div.pjx-npc-needs', { role: 'group', 'aria-label': w('nc.need.cap') }, h('span.pjx-npc-needcap', { text: w('nc.need.cap') }));
    NEEDS.forEach(([id, glyph, key]) => {
      const b = h('button.pjx-npc-chip', { type: 'button', 'data-c-key': 'npc:need:' + id, 'aria-pressed': String(V.notice === id) }, h('span', { html: icon(glyph, 13), 'aria-hidden': 'true' }), h('span', { text: w(key) }), h('span.pjx-npc-needtag', { text: w('nc.need.tag') }));
      b.addEventListener('click', () => { V.notice = V.notice === id ? null : id; paint(); later(() => focusIn('.pjx-npc-notice .pjx-btn')); });
      row.appendChild(b);
    });
    if (!V.notice || !c) return row;
    const which = w(NEEDS.find((x) => x[0] === V.notice)[2]);
    const acts = named(c.id).map((it, i) => { const b = h('button', { type: 'button', class: ['pjx-btn'], 'data-c-key': 'npc:need:go:' + i }, h('span.pjx-np-bico', { html: icon(it.icon, 15), 'aria-hidden': 'true' }), h('span', { text: it.label })); b.addEventListener('click', it.run); return b; });
    const not = h('button.pjx-btn.is-quiet', { type: 'button', 'data-c-key': 'npc:need:not', text: w('nc.need.not') }); not.addEventListener('click', () => { V.notice = null; paint(); });
    return h('div', null, row, h('div.pjx-notice.pjx-npc-notice', { 'data-tone': 'attention', role: 'status' },
      h('span.pjx-notice-mark', { html: PJX.calm('waiting', 16), 'aria-hidden': 'true' }),
      h('div.pjx-notice-title', { text: w('nc.need.title', { what: which }) }),
      h('div.pjx-notice-text', { text: w('nc.need.text', { chat: c.title, what: which }) }),
      h('div.pjx-notice-acts', null, ...acts, not)));
  }
  function send() {
    const inp = ROOT() && ROOT().querySelector('.pjx-npc-input'); const t = String((inp && inp.value) || '').trim(); if (!t) return;
    if (V.draft) {
      // the first message mints the chat and fixes its Computer (ACD-508); talk-only, so no folder yet
      const n = (F().chats || []).length + 1, title = t.split(/\s+/).slice(0, 5).join(' ').replace(/[.?!,]+$/, '');
      const c = { id: 'chat-new-' + n, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), folder: null, files: 0, sample: '', runsOn: V.comp, when: 'just now', talkOnly: true, mine: true,
        messages: 2, attachments: 0, first: t, last: w('nc.reply', { computer: comp(V.comp).name }), fileList: [], workedIn: null, outside: [], folders: [], prefs: { mode: 'Agent', persona: 'Product Manager', model: 'Claude Sonnet 4.6' }, accounts: ['claude'], grants: [], goals: [], schedules: [], approvals: [],
        transcript: [['user', t], ['assistant', w('nc.reply', { computer: comp(V.comp).name })]] };
      F().chats = (F().chats || []).concat([c]);
      V = { id: c.id, draft: false, notice: null };
      PJX.emit('change', { why: 'chat-new' });
    } else {
      const c = chatOf(V.id); c.transcript = (c.transcript || []).concat([['user', t], ['assistant', w('nc.replyMore')]]); c.messages = (c.messages || 0) + 2; c.last = t; c.when = 'just now';
      // a new message ends Undo for a chat moved back out of a project (ACD-511); here it only counts the turn
    }
    if (inp) inp.value = '';
    paint(); later(() => focusIn('.pjx-npc-input'));
  }
  function paint() {
    const r = ROOT(), stage = r && r.querySelector('.chat-stage');
    if (!stage) return;
    let el = stage.querySelector(':scope > .pjx-npc');
    if (!V || (!V.draft && !chatOf(V.id))) { if (el) el.remove(); r.removeAttribute('data-pjx-npc'); V = null; return; }
    const c = V.draft ? null : chatOf(V.id);
    if (c && gone(c)) { V = null; if (el) el.remove(); r.removeAttribute('data-pjx-npc'); return; }
    if (!el) {
      // the Projects layer's tokens (Usage's and Home's) reach its buttons and notices here too, as in its dialogs
      el = h('div.pjx-npc.pmw-scope', { role: 'region', 'data-pmu-host': 'no-project-chat' });
      // typing in this chat never reaches PMConcept7's own shortcuts
      el.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !/textarea|input/i.test(e.target.tagName)) { e.stopPropagation(); close(); later(() => { const b = ROOT() && ROOT().querySelector('.chat-header [data-action="toggle-history"]'); if (b) b.focus(); }); return; } e.stopPropagation(); });
      stage.appendChild(el);
    }
    r.setAttribute('data-pjx-npc', V.draft ? 'draft' : 'chat');
    el.setAttribute('aria-label', c ? w('nc.region', { chat: c.title }) : w('nc.draftTitle'));
    const back = h('button.icon-button.pjx-npc-back', { type: 'button', 'data-c-key': 'npc:back', html: icon('chevron-left', 16) });
    tip(back, w('nc.back', { project: projectName() }), 'Esc');
    back.addEventListener('click', () => close());
    const place = h('button.pjx-npc-place', { type: 'button', 'data-c-key': 'npc:place', 'aria-haspopup': 'menu', 'data-cmd': V.draft ? 'cmd.chat.place.select (ACD-508)' : 'Where: the two conversions (ACD-510)' },
      h('span', { html: icon('chat', 13), 'aria-hidden': 'true' }), h('span', { text: placeWord(c) }), h('span', { html: icon('chevron-down', 12), 'aria-hidden': 'true' }));
    tip(place, w('nc.whereTip'), V.draft ? w('nc.whereDraft') : w('nc.whereFixed', { computer: comp(c.runsOn).name }));
    place.addEventListener('click', () => placeMenu(place));
    // History stays one press away while a no-project chat is open (its flyout opens over this view)
    const hist = h('button.icon-button.pjx-npc-history', { type: 'button', 'data-c-key': 'npc:history', html: icon('history', 16) });
    tip(hist, w('nc.history'), w('nc.historyTip'));
    hist.addEventListener('click', () => { const t = ROOT() && ROOT().querySelector('.chat-header [data-action="toggle-history"]'); if (t) t.click(); });
    const kids = [back, hist, h('div.chat-title.pjx-npc-titles', null, h('span.pmx-chat-title.pjx-npc-title', { tabindex: '-1', text: c ? c.title : w('nc.draftTitle') }), place), h('span.chat-head-spacer')];
    if (c) {
      const make = h('button.pjx-btn.pjx-npc-make', { type: 'button', 'data-c-key': 'npc:make', 'data-cmd': 'ACD-510 chooser (neither preselected)' }, h('span.pjx-np-bico', { html: icon('folder-plus', 14), 'aria-hidden': 'true' }), h('span', { text: w('nc.chooser') }));
      tip(make, w('nc.chooser'), w('nc.chooserTip'));
      make.addEventListener('click', () => go('chooser', c.id));
      const more = h('button.icon-button.pjx-npc-more', { type: 'button', 'data-c-key': 'npc:more', 'aria-haspopup': 'menu', html: icon('more', 16) });
      tip(more, w('nc.more.label'), w('nc.more.tip'));
      more.addEventListener('click', () => moreMenu(more, c));
      kids.push(make, more);
    }
    const head = h('div.chat-header.pjx-npc-head', null, ...kids);
    const folder = c ? (c.folder ? h('div.pjx-npc-folder', null, h('span', { html: icon('folder', 13), 'aria-hidden': 'true' }), h('span.pjx-np-code', { text: c.folder, 'data-pmh-tag': 'literal' }), h('span', { text: ' · ' + w('nc.files', { n: c.files, computer: comp(c.runsOn).name }) }))
      : h('div.pjx-npc-folder', null, h('span', { html: icon('chat', 13), 'aria-hidden': 'true' }), h('span', { text: w('nc.talkOnly', { slug: c.slug, computer: comp(c.runsOn).name }) })))
      : h('div.pjx-npc-folder', null, h('span', { html: icon('info', 13), 'aria-hidden': 'true' }), h('span', { text: w('nc.draftLine', { computer: comp(V.comp).name }) }));
    const inner = h('div.transcript-inner.pjx-npc-inner');
    if (c) {
      (c.transcript || []).forEach(([role, text]) => inner.appendChild(msg(role, text)));
      (c.approvals || []).forEach((a) => inner.appendChild(approvalCard(c, a)));
      (c.goals || []).forEach((g) => inner.appendChild(h('div.pjx-npc-divider', { role: 'note' }, h('span', { text: w('nc.goal', { goal: g.title }) }))));
      (c.schedules || []).forEach((s) => inner.appendChild(h('div.pjx-npc-divider', { role: 'note' }, h('span', { text: w('nc.schedule', { what: s.title, when: s.when }) }))));
      if (c.back) inner.appendChild(msg('system', c.back));
    } else inner.appendChild(h('div.pjx-npc-empty', null, h('b', { text: w('nc.draftEmpty') }), h('span', { text: w('nc.draftEmptySub', { computer: comp(V.comp).name }) })));
    const tx = h('div.transcript.pjx-npc-tx', null, inner);
    // (its own classes: PMConcept7's chat claims its composer classes for its own state)
    const ta = h('textarea.pjx-npc-input', { rows: '2', 'aria-label': w('nc.composer'), placeholder: c ? w('nc.composerPh', { chat: c.title }) : w('nc.composerDraft') });
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    const sendB = h('button.pjx-btn.is-primary.pjx-npc-send', { type: 'button', 'data-c-key': 'npc:send' }, h('span.pjx-np-bico', { html: icon('send', 14), 'aria-hidden': 'true' }), h('span', { text: w('nc.send') }));
    sendB.addEventListener('click', () => send());
    const composer = h('div.pjx-npc-comp', null, c ? needsRow(c) : null, h('div.pjx-npc-box', null, h('div.pjx-npc-field', null, ta), h('div.pjx-npc-tools', null, h('span.pjx-npc-hint', { text: c ? w('nc.composerHint', { computer: comp(c.runsOn).name }) : w('nc.composerHintDraft') }), sendB)));
    const prevText = (el.querySelector('.pjx-npc-input') || {}).value;
    const hadFocus = el.contains(D.activeElement) && D.activeElement.getAttribute && D.activeElement.getAttribute('data-c-key');
    el.replaceChildren(h('div.pmu-shell.pjx-npc-shell', null, head, folder, tx, composer));
    if (prevText) ta.value = prevText;
    if (hadFocus) { const f = el.querySelector('[data-c-key="' + hadFocus + '"]'); if (f) f.focus({ preventScroll: true }); }
    tx.scrollTop = tx.scrollHeight;
  }

  /* ------------------------------------------------------------------ History: the No project group */
  function groupNode() {
    const L = list();
    // PMConcept7's own section material (History's section head and label), so the group reads as one of its sections
    const sec = h('section.history-section.pjx-npg', { 'aria-label': w('nc.group') });
    const nb = h('button.icon-button.pjx-npg-new', { type: 'button', 'data-c-key': 'npg:new', html: icon('plus', 14) });
    tip(nb, w('nc.group.new'), w('nc.group.newTip'));
    nb.addEventListener('click', () => newDraft());
    sec.appendChild(h('div.section-head.pjx-npg-head', null, h('span.section-label.pjx-npg-cap', { text: w('nc.group') }), h('span.pjx-npg-count', { text: String(L.length) }), h('span.pjx-grow'), nb));
    if (!L.length) sec.appendChild(h('div.pjx-npg-empty', { text: w('nc.group.empty') }));
    L.forEach((c) => {
      const row = h('button.pjx-npg-row', { type: 'button', 'data-chat': c.id, 'data-c-key': 'npg:row:' + c.id, 'aria-current': V && V.id === c.id ? 'true' : null },
        h('span.pjx-npg-ico', { html: icon(c.talkOnly ? 'chat' : 'folder', 14), 'aria-hidden': 'true' }),
        h('span.pjx-npg-text', null, h('span.pjx-npg-title', null, h('span.pjx-npg-when', { text: c.when + ' ' }), h('b', { text: c.title })), h('span.pjx-npg-sub', { text: c.last })));
      row.addEventListener('click', () => openChat(c.id));
      const more = h('button.icon-button.pjx-npg-more', { type: 'button', 'data-c-key': 'npg:more:' + c.id, 'aria-haspopup': 'menu', html: icon('more', 14) });
      tip(more, w('nc.more.label'), c.title);
      more.addEventListener('click', (e) => { e.stopPropagation(); PJX.menu(more, [{ items: [{ label: w('nc.open'), icon: 'chat', run: () => openChat(c.id) }] }, { items: named(c.id) }], { label: w('nc.more.menu', { chat: c.title }) }); });
      sec.appendChild(h('div.pjx-npg-item', null, row, more));
    });
    return sec;
  }

  /* ------------------------------------------------------------------ keeping the entry points in place */
  function ensure() {
    const r = ROOT();
    if (r) {
      // the chat header's New thread becomes a split: a chevron beside it offers No project and another Project
      const nt = r.querySelector('.chat-header [data-action="new-thread"]');
      if (nt && !(nt.nextElementSibling && nt.nextElementSibling.classList.contains('pjx-newsplit'))) {
        const ch = h('button.icon-button.pjx-newsplit', { type: 'button', 'data-c-key': 'chat:newsplit', 'aria-haspopup': 'menu', html: icon('chevron-down', 12) });
        tip(ch, w('nc.new.menu'), w('nc.new.menuTip'));
        ch.addEventListener('click', () => newMenu(ch));
        nt.insertAdjacentElement('afterend', ch);
      }
      const fl = flyout(), hs = (fl && fl.querySelector('.history-scroll')) || r.querySelector('.history-scroll');
      if (hs) {
        const have = hs.querySelector(':scope > .pjx-npg');
        const sig = list().map((c) => c.id + ':' + c.when).join('|') + '#' + (V && V.id);
        if (!have || have.getAttribute('data-sig') !== sig) {
          const g = groupNode(); g.setAttribute('data-sig', sig);
          const arch = Array.from(hs.children).find((x) => /^\s*archived/i.test(x.textContent || '') && x !== have);
          if (have) have.replaceWith(g); else if (arch) hs.insertBefore(g, arch); else hs.appendChild(g);
        }
      }
      if (V && r.querySelector('.chat-stage') && !r.querySelector('.chat-stage > .pjx-npc')) paint();
    }
    // Home's board bar: New chat, a split (Home is where you start something)
    const hb = D.querySelector('#panel-dashboard .pmw-hrow-actions');
    if (hb && !hb.querySelector('.pjx-home-new')) {
      // one compact split control, so Home's own facts keep their room: it opens this project, No project or another one
      const main = h('button.pmw-act.pjx-home-newmain', { type: 'button', 'data-c-key': 'home:newchat', 'aria-haspopup': 'menu', 'data-cmd': 'cmd.chat.new (split: ACD-508)' }, h('span', { html: icon('plus', 13), 'aria-hidden': 'true' }), h('span', { text: w('nc.home.new') }), h('span.pjx-home-chev', { html: icon('chevron-down', 12), 'aria-hidden': 'true' }));
      tip(main, w('nc.home.new'), w('nc.home.newTip', { project: projectName() }));
      main.addEventListener('click', () => newMenu(main));
      hb.insertBefore(h('span.pjx-home-new', { role: 'group', 'aria-label': w('nc.home.group') }, main), hb.firstChild);
    }
    // the title-bar switcher's fixed No project row (ACD-508; F3-668)
    const pm = D.getElementById('projectMenu');
    if (pm && !pm.querySelector('.pjx-tb-noproj')) {
      const sep = pm.querySelector('.pm6-tb-project-sep');
      const row = h('button.pm6-tb-menu-item.pjx-tb-noproj', { type: 'button', role: 'menuitem', 'data-c-key': 'tb:noproj' }, h('span.pjx-tb-noproj-t', { text: w('nc.group') }), h('span.pjx-tb-noproj-s', { text: w('nc.tb.sub', { n: list().length }) }));
      row.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const btn = D.getElementById('projectMenuBtn'); if (btn && btn.getAttribute('aria-expanded') === 'true') btn.click();
        const L = list(); if (L.length) openChat(L[0].id); else newDraft();
      }, true);
      if (sep) pm.insertBefore(row, sep); else pm.appendChild(row);
    } else if (pm) { const s = pm.querySelector('.pjx-tb-noproj-s'); const t = w('nc.tb.sub', { n: list().length }); if (s && s.textContent !== t) s.textContent = t; }
  }
  let raf = 0;
  const soon = () => { if (raf) return; raf = W.requestAnimationFrame(() => { raf = 0; try { ensure(); } catch (e) { console.error('[pjx chat]', e); } }); };
  function start(n) {
    if (!ROOT() || !D.getElementById('panel-dashboard')) { if (n < 120) setTimeout(() => start(n + 1), 150); return; }
    const mo = new W.MutationObserver(soon);
    mo.observe(ROOT(), { childList: true, subtree: true });
    mo.observe(D.getElementById('panel-dashboard'), { childList: true, subtree: true });
    const pm = D.getElementById('projectMenu'); if (pm) mo.observe(pm, { childList: true });
    // History opens in the chat's overlay layer, outside the chat panel
    const layers = D.getElementById('pm56-layers') || D.getElementById('pmOverlayRoot'); if (layers) mo.observe(layers, { childList: true, subtree: true });
    PJX.on('change', () => { soon(); if (V) paint(); });
    ensure();
  }
  start(0);

  PJX.chat = { list, chatOf, openChat, newDraft, close, go, newMenu, ensure, view: () => V };
})(window);
