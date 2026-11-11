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
    flyMenuClose(); closeFlyout();
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
      { label: w('nc.new.other'), items: others.map((p) => ({ label: p.name, icon: p.glyph || 'folder', meta: p.where.label, run: () => openOther(p) })) }
    ], { label: w('nc.new.menu'), align: 'start' });
  }

  /* (ACD-508) another Project: switch to it through PMConcept7's own project switcher, then its own New thread opens an
     empty chat there (the concept has one project tab, the title-bar box, so the switch happens in it) */
  function openOther(p) {
    close();
    PJX.setActive(p.id);
    setTimeout(() => {
      showChat();
      const b = ROOT() && ROOT().querySelector('.chat-header [data-action="new-thread"]');
      if (b) b.click();
      PJX.toast(w('nc.new.otherDone', { project: p.name }), w('nc.new.otherDoneText', { project: p.name }), 'success');
    }, 250);
  }

  /* ------------------------------------------------------------------ (B-press) a press survives a redraw
     The chat below redraws itself whole on every change anywhere in the app, and History's No project group is rebuilt
     when its chats change. A redraw between pointer-down and pointer-up swapped the control under the pointer for a new
     node, so the click never fired. Nothing about what is drawn changes here, only when: while a press that started on
     one of this layer's own controls is in progress, a redraw is held, and it runs once right after the press ends. The
     browser dispatches click in the same task as pointer-up, so the held redraw (a 0 ms timer from pointer-up) always
     comes after the click. A Space press on a button clicks on key-up, so it is held the same way. A press that never
     ends (the pointer captured elsewhere) lets go after 2 s. */
  const ZONE = '.pjx-npc, .pjx-npg, .pjx-flymenu, .pjx-home-new, .pjx-tb-noproj, .pjx-newsplit';
  const P = { on: false, id: 0, held: false, heldGroup: false, cap: 0 };
  function pressStart(e) {
    const t = e.target && e.target.closest ? e.target.closest(ZONE) : null;
    if (!t) return;
    P.on = true; P.id++;
    clearTimeout(P.cap); P.cap = setTimeout(pressEnd, 2000);
  }
  function pressEnd() {
    if (!P.on) return;
    const id = P.id;
    setTimeout(() => {
      if (P.id !== id || !P.on) return;   // a new press started meanwhile: it holds the redraw on
      P.on = false; clearTimeout(P.cap);
      const draw = P.held, group = P.heldGroup; P.held = false; P.heldGroup = false;
      if (draw) paint();
      if (group) soon();
    }, 0);
  }
  W.addEventListener('pointerdown', pressStart, true);
  W.addEventListener('pointerup', pressEnd, true);
  W.addEventListener('pointercancel', pressEnd, true);
  W.addEventListener('keydown', (e) => { if (e.key === ' ' && !e.repeat && e.target && e.target.closest && e.target.closest('button, [role="button"], [role="menuitem"]')) pressStart(e); }, true);
  W.addEventListener('keyup', (e) => { if (e.key === ' ') pressEnd(); }, true);
  W.addEventListener('blur', pressEnd);

  /* ------------------------------------------------------------------ (B-press) where the chat lives
     PMConcept7 reconciles everything under #pmRoot against its own template on each of its renders, and drops any child
     the template doesn't name: the chat used to sit inside its .chat-stage, so every PMConcept7 render removed it, and it
     came back only on the next animation frame. In between the chat had no header at all (a task could find none), and a
     press on it was cancelled (a click never fires when its press's node is removed). The chat now lives beside #pmRoot,
     in a host of its own inside the chat frame (the frame isn't reconciled), drawn over the stage's exact box. The host
     carries pm56-host, so the chat's look is the same, and takes the stage's own background, colour and corners. */
  let placedStage = null, stageRO = null;
  function hostOf(r) {
    let host = r.querySelector(':scope > .pjx-npc-host');
    if (!host) { host = h('div.pm56-host.pjx-npc-host', { 'data-pmh-tag': 'literal' }); r.appendChild(host); }
    return host;
  }
  function placeHost() {
    const r = ROOT(), host = r && r.querySelector(':scope > .pjx-npc-host');
    if (!host) return;
    const stage = r.querySelector('#pmRoot .chat-stage'), npc = host.querySelector(':scope > .pjx-npc');
    if (!stage || !npc) { if (!host.hidden) host.hidden = true; return; }
    if (host.hidden) host.hidden = false;
    if (stage !== placedStage && W.ResizeObserver) {
      if (!stageRO) stageRO = new W.ResizeObserver(() => placeHost());
      if (placedStage) stageRO.unobserve(placedStage);
      stageRO.observe(stage); placedStage = stage;
    }
    const op = host.offsetParent || r, a = op.getBoundingClientRect(), b = stage.getBoundingClientRect(), cs = getComputedStyle(stage);
    const want = { left: Math.round(b.left - a.left - op.clientLeft + op.scrollLeft) + 'px', top: Math.round(b.top - a.top - op.clientTop + op.scrollTop) + 'px', width: Math.round(b.width) + 'px', height: Math.round(b.height) + 'px',
      backgroundColor: cs.backgroundColor, backgroundImage: cs.backgroundImage, color: cs.color, borderRadius: cs.borderRadius };
    Object.keys(want).forEach((k) => { if (host.style[k] !== want[k]) host.style[k] = want[k]; });
  }

  /* ------------------------------------------------------------------ the chat view, drawn over the chat stage */
  let V = null;   // { id, draft, comp, notice, text }
  function openChat(id) { if (!chatOf(id)) return; V = { id, draft: false, notice: null, text: '' }; showChat(); closeFlyout(); paint(); later(() => focusIn('.pjx-npc-title')); }
  /* (ACD-511) a chat that was made a project or moved into one opens in its new place: a message or an edited message
     there ends Undo, as the report says */
  function openMoved(id) { if (!chatOf(id)) return; V = { id, draft: false, moved: true, notice: null, text: '' }; showChat(); closeFlyout(); paint(); later(() => focusIn('.pjx-npc-input')); }
  const movedRec = (id) => { const m = (F().moved || {})[id]; if (m) return { rec: m, project: PJX.get(m.into) }; const pid = (F().converted || {})[id], p = pid && PJX.get(pid); return p && p.fromChatRec ? { rec: p.fromChatRec, project: p } : null; };
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
    // PMConcept7's own chat column owner shows it (a narrow window or a look may have folded it away)
    try { if (W.PMW && W.PMW.chatCol && W.PMW.chatCol.show) W.PMW.chatCol.show(); } catch (e) { /* not there */ }
    setTimeout(() => paint(), 120);
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
      h('div.pjx-notice-text', { text: w('nc.need.text', { chat: c.title, what: which.charAt(0).toLowerCase() + which.slice(1) }) }),
      h('div.pjx-notice-acts', null, ...acts, not)));
  }
  function send() {
    if (!V || V.sending) return;
    const inp = D.querySelector('.pjx-npc .pjx-npc-input');
    const t = String(V.text != null && V.text !== '' ? V.text : (inp && inp.value) || '').trim(); if (!t) return;
    // cleared before anything redraws, so the words can't come back and can't be sent twice
    V.sending = true; V.text = ''; if (inp) inp.value = '';
    if (V.draft) {
      // the first message mints the chat and fixes its Computer (ACD-508); talk-only, so no folder yet
      const n = (F().chats || []).length + 1, title = t.split(/\s+/).slice(0, 5).join(' ').replace(/[.?!,]+$/, '');
      const c = { id: 'chat-new-' + n, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), folder: null, files: 0, sample: '', runsOn: V.comp, when: 'just now', talkOnly: true, mine: true,
        messages: 2, attachments: 0, first: t, last: w('nc.reply', { computer: comp(V.comp).name }), fileList: [], workedIn: null, outside: [], folders: [], prefs: { mode: 'Agent', persona: 'Product Manager', model: 'Claude Sonnet 4.6' }, accounts: ['claude'], grants: [], goals: [], schedules: [], approvals: [],
        transcript: [['user', t], ['assistant', w('nc.reply', { computer: comp(V.comp).name })]] };
      F().chats = (F().chats || []).concat([c]);
      V = { id: c.id, draft: false, notice: null, text: '', focusInput: true };
      PJX.emit('change', { why: 'chat-new' });
    } else {
      const c = chatOf(V.id), editing = V.editIdx != null;
      if (editing) { c.transcript = c.transcript.slice(0, V.editIdx).concat([['user', t], ['assistant', w('nc.replyMore')]]); V.editIdx = null; }
      else { c.transcript = (c.transcript || []).concat([['user', t], ['assistant', w('nc.replyMore')]]); c.messages = (c.messages || 0) + 2; }
      c.last = t; c.when = 'just now';
      // in its project, the first new message (or an edited one) ends Undo, enforced here and shown on the report (ACD-511)
      const mr = V.moved && movedRec(c.id);
      if (mr && !mr.rec.ended) { mr.rec.ended = editing ? w('cv.undo.editMsg', { chat: c.title }) : w('cv.undo.newMsg', { chat: c.title }); PJX.emit('change', { why: 'undo-ended' }); }
      V.sending = false; V.focusInput = true;
    }
    paint(); later(() => focusIn('.pjx-npc-input'));
  }
  function paint() {
    if (P.on) { P.held = true; return; }   // (B-press) the press under way gets its click first
    const r = ROOT(), stage = r && r.querySelector('.chat-stage');
    if (!stage) return;
    let el = D.querySelector('.pjx-npc');
    if (!V || (!V.draft && !chatOf(V.id))) { if (el) el.remove(); r.removeAttribute('data-pjx-npc'); V = null; placeHost(); return; }
    const c = V.draft ? null : chatOf(V.id);
    if (c && gone(c) && !V.moved) { V = null; if (el) el.remove(); r.removeAttribute('data-pjx-npc'); placeHost(); return; }
    if (c && V.moved && !gone(c)) V.moved = false;
    const mr = c && V.moved ? movedRec(c.id) : null;
    // a narrow window folds PMConcept7's chat to a sliver: then the chat opens as a panel over the page's right side;
    // otherwise it sits in its own host over the stage (B-press: never inside PMConcept7's reconciled tree)
    const floating = r.getBoundingClientRect().width < 300, host = floating ? D.body : hostOf(r);
    if (el && el.parentElement !== host) { host.appendChild(el); }
    if (el) el.classList.toggle('is-floating', floating);
    if (!el) {
      // the Projects layer's tokens (Usage's and Home's) reach its buttons and notices here too, as in its dialogs
      el = h('div.pjx-npc.pmw-scope', { role: 'region', 'data-pmu-host': 'no-project-chat' });
      // typing in this chat never reaches PMConcept7's own shortcuts
      el.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !/textarea|input/i.test(e.target.tagName)) { e.stopPropagation(); close(); later(() => { const b = ROOT() && ROOT().querySelector('.chat-header [data-action="toggle-history"]'); if (b) b.focus(); }); return; } e.stopPropagation(); });
      el.classList.toggle('is-floating', floating);
      host.appendChild(el);
    }
    r.setAttribute('data-pjx-npc', V.draft ? 'draft' : 'chat');
    el.setAttribute('aria-label', c ? w('nc.region', { chat: c.title }) : w('nc.draftTitle'));
    const back = h('button.icon-button.pjx-npc-back', { type: 'button', 'data-c-key': 'npc:back', html: icon('chevron-left', 16) });
    tip(back, w('nc.back', { project: projectName() }), 'Esc');
    back.addEventListener('click', () => close());
    const place = h('button.pjx-npc-place', { type: 'button', 'data-c-key': 'npc:place', 'aria-haspopup': mr ? null : 'menu', 'data-cmd': V.draft ? 'cmd.chat.place.select (ACD-508)' : 'Where: the two conversions (ACD-510)' },
      h('span', { html: icon(mr ? 'folder' : 'chat', 13), 'aria-hidden': 'true' }), h('span', { text: mr && mr.project ? w('nc.placeIn', { project: mr.project.name, computer: comp(mr.project.home || 'here').name }) : placeWord(c) }), mr ? null : h('span', { html: icon('chevron-down', 12), 'aria-hidden': 'true' }));
    tip(place, w('nc.whereTip'), mr ? w('nc.whereMoved') : V.draft ? w('nc.whereDraft') : w('nc.whereFixed', { computer: comp(c.runsOn).name }));
    place.addEventListener('click', () => { if (mr && mr.project) { if (W.PM_PAGES) W.PM_PAGES.go('projects'); setTimeout(() => PJX.emit('need-chat', { id: c.id, kind: 'project', project: mr.project.id }), 60); } else placeMenu(place); });
    // History stays one press away while a no-project chat is open (its flyout opens over this view)
    const hist = h('button.icon-button.pjx-npc-history', { type: 'button', 'data-c-key': 'npc:history', html: icon('history', 16) });
    tip(hist, w('nc.history'), w('nc.historyTip'));
    hist.addEventListener('click', () => { const t = ROOT() && ROOT().querySelector('.chat-header [data-action="toggle-history"]'); if (t) t.click(); });
    const kids = [back, hist, h('div.chat-title.pjx-npc-titles', null, h('span.pmx-chat-title.pjx-npc-title', { tabindex: '-1', text: c ? c.title : w('nc.draftTitle') }), place), h('span.chat-head-spacer')];
    if (c && !mr) {
      const make = h('button.pjx-btn.pjx-npc-make', { type: 'button', 'data-c-key': 'npc:make', 'aria-label': w('nc.chooser'), 'data-cmd': 'ACD-510 chooser (neither preselected)' }, h('span.pjx-np-bico', { html: icon('folder-plus', 14), 'aria-hidden': 'true' }), h('span', { text: w('nc.chooser') }));
      tip(make, w('nc.chooser'), w('nc.chooserTip'));
      make.addEventListener('click', () => go('chooser', c.id));
      const more = h('button.icon-button.pjx-npc-more', { type: 'button', 'data-c-key': 'npc:more', 'aria-haspopup': 'menu', html: icon('more', 16) });
      tip(more, w('nc.more.label'), w('nc.more.tip'));
      more.addEventListener('click', () => moreMenu(more, c));
      kids.push(make, more);
    }
    const head = h('div.chat-header.pjx-npc-head', null, ...kids);
    const folder = mr ? h('div.pjx-npc-folder', { 'data-undo': mr.rec.ended ? 'ended' : 'open' }, h('span', { html: icon('history', 13), 'aria-hidden': 'true' }), h('span', { text: mr.rec.ended ? w('cv.undo.ended', { reason: mr.rec.ended }) : w('nc.movedLine', { until: mr.rec.until }) }))
      : c ? (c.folder ? h('div.pjx-npc-folder', null, h('span', { html: icon('folder', 13), 'aria-hidden': 'true' }), h('span.pjx-np-code', { text: c.folder, 'data-pmh-tag': 'literal' }), h('span', { text: ' · ' + w('nc.files', { n: c.files, computer: comp(c.runsOn).name }) }))
      : h('div.pjx-npc-folder', null, h('span', { html: icon('chat', 13), 'aria-hidden': 'true' }), h('span', { text: w('nc.talkOnly', { slug: c.slug, computer: comp(c.runsOn).name }) })))
      : h('div.pjx-npc-folder', null, h('span', { html: icon('info', 13), 'aria-hidden': 'true' }), h('span', { text: w('nc.draftLine', { computer: comp(V.comp).name }) }));
    const inner = h('div.transcript-inner.pjx-npc-inner');
    if (c) {
      const lastUser = (c.transcript || []).map((x) => x[0]).lastIndexOf('user');
      (c.transcript || []).forEach(([role, text], i) => {
        const m = msg(role, text);
        // an edit of your last message, in the moved chat: it ends Undo too
        if (mr && i === lastUser) { const eb = h('button.pjx-link.pjx-npc-edit', { type: 'button', 'data-c-key': 'npc:edit', text: w('nc.edit') }); eb.addEventListener('click', () => { V.editIdx = i; V.text = text; V.focusInput = true; paint(); }); m.appendChild(eb); }
        inner.appendChild(m);
      });
      (c.approvals || []).forEach((a) => inner.appendChild(approvalCard(c, a)));
      (c.goals || []).forEach((g) => inner.appendChild(h('div.pjx-npc-divider', { role: 'note' }, h('span', { text: w('nc.goal', { goal: g.title }) }))));
      (c.schedules || []).forEach((s) => inner.appendChild(h('div.pjx-npc-divider', { role: 'note' }, h('span', { text: w('nc.schedule', { what: s.title, when: s.when }) }))));
      if (mr) inner.appendChild(msg('system', w('cv.rep.divider', { project: mr.project ? mr.project.name : '', when: mr.rec.at || '' }).replace(/^In the chat: |[“”]/g, '')));
      if (c.back) inner.appendChild(msg('system', c.back));
    } else inner.appendChild(h('div.pjx-npc-empty', null, h('b', { text: w('nc.draftEmpty') }), h('span', { text: w('nc.draftEmptySub', { computer: comp(V.comp).name }) })));
    const tx = h('div.transcript.pjx-npc-tx', null, inner);
    // (its own classes: PMConcept7's chat claims its composer classes for its own state)
    const ta = h('textarea.pjx-npc-input', { 'data-c-key': 'npc:input', rows: '2', 'aria-label': w('nc.composer'), placeholder: c ? w('nc.composerPh', { chat: c.title }) : w('nc.composerDraft') });
    ta.value = V.text || '';
    // (B-press) a field that is swapped out or closed reports blur on its way out: by then the chat may be closed (V null)
    ta.addEventListener('input', () => { if (V) V.text = ta.value; });
    ta.addEventListener('focus', () => { if (V) V.focusInput = true; });
    ta.addEventListener('blur', () => { if (V && ta.isConnected) V.focusInput = false; });
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    const sendB = h('button.pjx-btn.is-primary.pjx-npc-send', { type: 'button', 'data-c-key': 'npc:send' }, h('span.pjx-np-bico', { html: icon('send', 14), 'aria-hidden': 'true' }), h('span', { text: w('nc.send') }));
    sendB.addEventListener('click', () => send());
    const composer = h('div.pjx-npc-comp', null, c && !mr ? needsRow(c) : null, h('div.pjx-npc-box', null, h('div.pjx-npc-field', null, ta), h('div.pjx-npc-tools', null, h('span.pjx-npc-hint', { text: c ? w('nc.composerHint', { computer: comp(c.runsOn).name }) : w('nc.composerHintDraft') }), sendB)));
    // (B-press) what has the focus, and the field's caret, are read before the swap: a focused field that is swapped out
    // may report blur on its way out, which would otherwise leave the focus nowhere and lose the next keys and Enter
    const act = D.activeElement, hadFocus = el.contains(act) && act.getAttribute && act.getAttribute('data-c-key');
    const caret = hadFocus === 'npc:input' && act.value === ta.value ? [act.selectionStart, act.selectionEnd] : null;
    el.replaceChildren(h('div.pmu-shell.pjx-npc-shell', null, head, folder, tx, composer));
    // the words and the caret survive a redraw (and a re-mount, when PMConcept7 redraws its chat stage)
    if (!floating) placeHost();
    if (V.focusInput || hadFocus === 'npc:input') { try { ta.focus({ preventScroll: true }); const c0 = caret || [ta.value.length, ta.value.length]; ta.setSelectionRange(c0[0], c0[1]); } catch (e) { /* not focusable yet */ } }
    else if (hadFocus) { const f = el.querySelector('[data-c-key="' + hadFocus + '"]'); if (f) f.focus({ preventScroll: true }); }
    tx.scrollTop = tx.scrollHeight;
  }

  /* ------------------------------------------------------------------ a menu that lives inside the History flyout
     (the shared menu layer sits under the chat's overlay layer, so a menu from a flyout row is drawn in the flyout) */
  let FM = null;
  function flyMenuClose(refocus) {
    if (!FM) return;
    const a = FM.anchor; FM.el.remove(); D.removeEventListener('pointerdown', FM.out, true); a.setAttribute('aria-expanded', 'false'); FM = null;
    if (refocus && a.isConnected) a.focus({ preventScroll: true });
  }
  function flyMenu(anchor, items, label) {
    if (FM && FM.anchor === anchor) { flyMenuClose(true); return; }
    flyMenuClose();
    const fl = anchor.closest('.history-flyout') || D.body;
    const el = h('div.pjx-flymenu.pmw-scope', { role: 'menu', 'aria-label': label });
    const btns = items.map((it, i) => {
      const b = h('button.pjx-flymenu-item', { type: 'button', role: 'menuitem', tabindex: '-1', 'data-c-key': 'npg:mi:' + i }, h('span.pjx-flymenu-ico', { html: icon(it.icon || 'chat', 14), 'aria-hidden': 'true' }), h('span.pjx-flymenu-text', null, h('b', { text: it.label }), it.meta ? h('span', { text: it.meta }) : null));
      b.addEventListener('click', (e) => { e.stopPropagation(); flyMenuClose(); it.run(); });
      return b;
    });
    btns.forEach((b) => el.appendChild(b));
    el.addEventListener('keydown', (e) => {
      const i = btns.indexOf(D.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); btns[(i + (e.key === 'ArrowDown' ? 1 : btns.length - 1)) % btns.length].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); flyMenuClose(true); }
      else if (e.key === 'Tab') flyMenuClose();
    });
    fl.appendChild(el);
    const fixed = fl === D.body || getComputedStyle(fl).position === 'static';
    const fr = fixed ? { left: 0, top: 0, bottom: W.innerHeight } : fl.getBoundingClientRect(), ar = anchor.getBoundingClientRect(), mw = el.offsetWidth, mh = el.offsetHeight;
    let top = ar.bottom - fr.top + 4;
    if (ar.bottom + 4 + mh > fr.bottom - 6) top = ar.top - fr.top - mh - 4;
    el.style.position = fixed ? 'fixed' : 'absolute';
    el.style.left = Math.max(6, ar.right - fr.left - mw) + 'px';
    el.style.top = Math.max(6, top) + 'px';
    anchor.setAttribute('aria-expanded', 'true');
    const out = (e) => { if (!el.contains(e.target) && e.target !== anchor) flyMenuClose(); };
    D.addEventListener('pointerdown', out, true);
    FM = { el, anchor, out };
    btns[0].focus({ preventScroll: true });
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
      more.addEventListener('click', (e) => { e.stopPropagation(); flyMenu(more, [{ label: w('nc.open'), icon: 'chat', run: () => openChat(c.id) }].concat(named(c.id)), w('nc.more.menu', { chat: c.title })); });
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
        if ((!have || have.getAttribute('data-sig') !== sig) && P.on && have) P.heldGroup = true;   // (B-press) rebuilt after the press
        else if (!have || have.getAttribute('data-sig') !== sig) {
          const g = groupNode(); g.setAttribute('data-sig', sig);
          const arch = Array.from(hs.children).find((x) => /^\s*archived/i.test(x.textContent || '') && x !== have);
          if (have) have.replaceWith(g); else if (arch) hs.insertBefore(g, arch); else hs.appendChild(g);
        }
      }
      if (V && r.querySelector('.chat-stage') && !D.querySelector('.pjx-npc')) paint();
      placeHost();
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
  /* ------------------------------------------------------------------ the palette (ACD-510 lists it as an entry point): the
     title bar's search offers the no-project commands when what you type is about a project or a chat */
  let pal = null, palSel = 0;
  function palItems(q) {
    q = String(q || '').toLowerCase().trim(); if (q.length < 3 || !/proj|chat|move|convert/.test(q)) return [];
    const c = (V && !V.draft && chatOf(V.id)) || list()[0];
    const out = [{ label: w('nc.group.new'), sub: w('nc.new.noneMeta', { computer: comp('here').name }), run: () => newDraft() }];
    if (c) out.push({ label: w('nc.makeFrom') + '…', sub: '“' + c.title + '”', run: () => go('new', c.id) }, { label: w('nc.moveInto') + '…', sub: '“' + c.title + '”', run: () => go('move', c.id) });
    return out.filter((x) => (x.label + ' ' + x.sub).toLowerCase().split(/\W+/).some((wd) => wd && q.split(/\s+/).some((t) => wd.indexOf(t) === 0)) || /project|chat/.test(q));
  }
  function palClose() { if (pal) { pal.remove(); pal = null; } const i = D.getElementById('tbSearchInput'); if (i) i.removeAttribute('aria-expanded'); }
  function palPaint(inp) {
    const items = palItems(inp.value);
    if (!items.length) { palClose(); return; }
    if (!pal) { pal = h('div.pjx-pal.pmw-scope', { role: 'listbox', id: 'pjx-pal', 'aria-label': w('nc.pal') }); D.body.appendChild(pal); }
    palSel = Math.min(palSel, items.length - 1);
    const r = inp.getBoundingClientRect();
    pal.style.left = Math.round(r.left) + 'px'; pal.style.top = Math.round(r.bottom + 6) + 'px'; pal.style.minWidth = Math.round(Math.max(r.width, 300)) + 'px';
    pal.replaceChildren(h('div.pjx-pal-cap', { text: w('nc.pal') }), ...items.map((it, i) => {
      const b = h('div.pjx-pal-item', { role: 'option', id: 'pjx-pal-' + i, 'aria-selected': String(i === palSel) }, h('b', { text: it.label }), h('span', { text: it.sub }));
      b.addEventListener('mousedown', (e) => { e.preventDefault(); palClose(); inp.value = ''; it.run(); });
      return b;
    }));
    inp.setAttribute('aria-expanded', 'true'); inp.setAttribute('aria-controls', 'pjx-pal'); inp.setAttribute('aria-activedescendant', 'pjx-pal-' + palSel);
    pal._items = items;
  }
  function palWire() {
    const inp = D.getElementById('tbSearchInput'); if (!inp || inp._pjxPal) return; inp._pjxPal = true;
    inp.addEventListener('input', () => { palSel = 0; palPaint(inp); });
    inp.addEventListener('focus', () => palPaint(inp));
    inp.addEventListener('blur', () => setTimeout(palClose, 120));
    inp.addEventListener('keydown', (e) => {
      if (!pal) return;
      const n = (pal._items || []).length;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); palSel = (palSel + (e.key === 'ArrowDown' ? 1 : n - 1)) % n; palPaint(inp); }
      else if (e.key === 'Enter') { e.preventDefault(); const it = pal._items[palSel]; palClose(); inp.value = ''; if (it) it.run(); }
      else if (e.key === 'Escape') { palClose(); }
    });
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
    // the chat column can fold or open after a chat is shown (a narrow window, a page change): dock or float again
    if (W.ResizeObserver) { let wasNarrow = null; new W.ResizeObserver((ents) => { const nw = ents[0].contentRect.width < 300; if (V && nw !== wasNarrow) paint(); wasNarrow = nw; }).observe(ROOT()); }
    palWire();
    ensure();
  }
  start(0);

  PJX.chat = { list, chatOf, openChat, openMoved, newDraft, close, go, newMenu, ensure, view: () => V };
})(window);
