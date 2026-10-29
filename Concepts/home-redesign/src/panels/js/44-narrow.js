/* The narrow ladder (D4), keyed on the centre's width C (window minus rail minus chat), never on the window, and never
   saved. Order (Jared: "Rail, then chat"): C < 960 the rail side panel eases to 240 and then folds to its icon bar
   below 760 (it then opens as an overlay), then the chat eases toward its minimum (400); one panel column below 600
   (the tree is untouched: it is a render mode); below 480 the chat folds to an edge strip unless the user keeps it open
   (the layout record's chat column keep_open, ui.chat_column.keep_open, 46-chat.js).
   Each step has 48 px of hysteresis. It measures what is applied now, so theme paddings, resizers and the activity bar
   need no constants. The only file allowed to read the window size (the chat's default width scales with it).
   Pinned History (D3, the layout record's chat column history_pinned, ui.chat_column.pin_history): the column grows by
   the History width instead of squeezing the messages. chatMin and the saved width (the chat column's
   width_px, cmd.workspace_layout.resize_surface { surface: 'chat', width }) are the message area; the History adds its
   own width on top: chatHistoryW, or a width the person dragged its edge to, as the chat draws it beside the message
   area (46-chat.js chatCol.historyW; the chat draws it at chatHistoryWNarrow while its whole column is under
   chatHistoryAt, which only a capped column reaches: the narrow peek or a popped-out chat). The widening is part of the
   chat width the ladder solves, so it counts in the centre budget and eases like the rest of the column; the widening
   itself is never saved.
   A column the person sized themselves is pinned against the ladder (Jared, 2026-10-28: chat and rail wide at the
   same time must be possible): the rail's inline width from its resizer and the chat's saved width_px are never
   eased or folded back — the other column eases first, then the centre gives (one-column, then the chat strip at
   the usability floor). The ladder still owns columns nobody sized, and window narrowing still eases those.
   Double-clicking either resizer clears the saved size and hands the column back to the ladder.
   The centre's floor is the strip step's threshold (chatStrip, 480). The chat has no fixed upper width (DL-254, G3):
   its drag runs until the centre reaches that floor (46-chat.js), and in a window too narrow for a width the person
   saved, the column is held where the centre keeps its floor instead of folding to its strip (the saved width stays
   and comes back with the room); only a column whose minimum leaves the centre under the floor still folds.
   Activity Detail (DL-254, G2): while the hosted chat has it open, the column widens by its width too
   (chatCol.activityW, the width PM56_HOST.reserveActivity reserves), so it docks beside the messages instead of
   squeezing them; its width comes from the centre (the rail eases and folds for it first), never from the messages.
   When the centre would still fall under
   its floor, History gives its width back first, then Activity Detail (actDropped: the chat draws it over the messages
   at the column's full height), with the same hysteresis; the widening is never saved. */

var LADDER = PMW.LADDER = { railEase: 960, railFold: 760, chatEase: 960, oneColumn: 600, chatStrip: 480, hyst: 48, railEased: 240, chatMin: 400, chatStripW: 32,
  chatHistoryW: 240, chatHistoryWNarrow: 200, chatHistoryAt: 540, usageBoardMin: 400 };
var narrow = PMW.narrow = { state: { rail: 'open', chat: null, chatStrip: false, oneColumn: false, C: 0, step: 0, hist: 0, histDropped: false, act: 0, actDropped: false }, frozen: false };

function mainArea() { return qs('.main-area'); }
function slotEl() { return qs('#sidePanelSlot'); }
/* the chat's default width scales with the window: about 480 at 1470, 600 at 1920, at most 640 (D3) */
function chatDefault() { return Math.round(clamp(window.innerWidth * 0.26667 + 88, LADDER.chatMin, 640)); }
narrow.chatDefault = chatDefault;
function chatUser() {
  var w = PMW.chatCol && PMW.chatCol.widthPx ? PMW.chatCol.widthPx() : null;
  return w ? Math.max(w, LADDER.chatMin) : chatDefault();
}
narrow.chatUser = chatUser;
/* the width pinned History adds to the column now, beside the message area the person wants (0 unless it is pinned
   and the chat on screen draws it) */
function historyW() { return PMW.chatCol && PMW.chatCol.historyW ? PMW.chatCol.historyW(chatUser()) : 0; }
narrow.historyW = historyW;
/* the width an open Activity Detail adds to the column now (0 while it is shut) */
function activityW() { return PMW.chatCol && PMW.chatCol.activityW ? PMW.chatCol.activityW() : 0; }
narrow.activityW = activityW;

function railUserWidth() {
  var s = slotEl();
  if (!s || s.classList.contains('hidden')) return 0;
  var inline = parseFloat(s.style.width);
  if (inline > 0) return inline;
  if (s._pmwNatural) return s._pmwNatural;
  var w = s.getBoundingClientRect().width;
  var ma = mainArea();
  if (ma && !ma.hasAttribute('data-pmw-rail')) s._pmwNatural = w;   // measured while nothing caps it
  return w || 240;
}
function on(prev, value, threshold) { return prev ? value < threshold + LADDER.hyst : value < threshold; }

/* pure: base = C + rail panel + chat (what the three share); chatW is the whole column the user wants (the message
   area plus hist, the pinned History's width, plus act, an open Activity Detail's width); an unsized chat eases down to
   chatMin + hist, as it would with Activity Detail shut, whose width comes from the centre. Before the strip step, pinned History gives its width back (histDropped: the column falls back
   to the flyout, --pmw-chat-hist-w 0px) when C would otherwise fall under the centre's floor (the strip threshold),
   then Activity Detail does (actDropped: --pmw-chat-act-w 0px, the chat covers the messages with it), each with the
   same hysteresis on C measured with its width, so they never chase each other. A column the person sized is never
   eased: after the drops it is held so C keeps its floor, never under its own minimum. Only when that is not enough
   does the chat fold to its strip (which keeps both dropped). Nothing here is saved. Returns the applied state */
function easeChat(base, s, c, keep) {
  return base - s - c < LADDER.chatEase ? Math.max(LADDER.chatMin + keep, Math.min(c, c - (LADDER.chatEase - (base - s - c)))) : c;
}
narrow.solve = function (base, railUser, chatW, chatShown, pinned, prev, hist, railPinned, chatPinned, act) {
  prev = prev || {};
  hist = hist || 0;
  act = act || 0;
  var s = railUser, c = chatShown ? chatW : 0, rail = 'open', strip = false, dropped = false, actDropped = false;
  var h = hist, a = act;   // what pinned History and Activity Detail still add
  var eased = !railPinned && s > LADDER.railEased && on(prev.rail === 'ease' || prev.rail === 'fold', base - s - c, LADDER.railEase);
  if (eased) { s = LADDER.railEased; rail = 'ease'; }
  if (!railPinned && railUser > 0 && on(prev.rail === 'fold', base - s - c, LADDER.railFold)) { s = 0; rail = 'fold'; }
  // Activity Detail's width comes from the centre (the rail eases and folds for it first), never from the messages:
  // an unsized chat's messages ease only as they would with it shut
  function fit() { var w = chatW - (hist - h) - (act - a); return chatPinned ? w : easeChat(base, s, w - a, h) + a; }
  if (chatShown) c = fit();
  if (chatShown && hist > 0 && on(prev.histDropped, base - s - c, LADDER.chatStrip)) { dropped = true; h = 0; c = fit(); }
  if (chatShown && act > 0 && on(prev.actDropped, base - s - c, LADDER.chatStrip)) { actDropped = true; a = 0; c = fit(); }
  /* a user-sized column folds only when even its minimum leaves the centre under the floor; held at the floor, its
     centre would sit exactly on the threshold and never clear the hysteresis back out of the strip (A2), so the fold is
     decided on the minimum, then the column is held */
  var cMin = chatShown && chatPinned ? Math.min(c, LADDER.chatMin + h + a) : c;
  if (chatShown && chatPinned) c = Math.max(LADDER.chatMin + h + a, Math.min(c, base - s - LADDER.chatStrip));
  if (chatShown && !pinned && on(prev.chatStrip, base - s - cMin, LADDER.chatStrip)) { c = LADDER.chatStripW; strip = true; dropped = hist > 0; actDropped = act > 0; }
  var C = base - s - c;
  var one = on(prev.oneColumn, C, LADDER.oneColumn);
  var step = strip ? 4 : one ? 3 : rail === 'fold' ? 2 : (rail === 'ease' || (chatShown && c < chatW)) ? 1 : 0;
  return { rail: rail, railWidth: s, chat: chatShown ? c : null, chatStrip: strip, oneColumn: one, C: C, step: step,
    hist: dropped ? 0 : hist, histDropped: dropped, act: actDropped ? 0 : act, actDropped: actDropped };
};

/* does el take room in the row? An overlay (the rail peek, the chat peek, the popped-out chat) is absolute or fixed and
   takes none; counting it as docked width made the ladder undo the overlay it had just opened, frame after frame */
function inFlow(el) { var p = getComputedStyle(el).position; return p !== 'absolute' && p !== 'fixed'; }

/* the docked footprint only: base = the centre plus the columns that really share the row with it */
narrow.measure = function () {
  var centre = state.centre;
  // only while Home is the page shown: on another page the centre can still have boxes (it is hidden, not removed), and
  // solving against it there overwrote the chat's width. The page test comes first: getClientRects() forces a layout,
  // and on the Usage page that was 5-32 ms inside every room change's build (M3, motion QA A14, 2026-10-16)
  if (!centre || !homeIsPage() || !centre.getClientRects().length) return null;
  var chat = qs('#chatPanel');
  var ma = mainArea();
  var floating = !!(ma && ma.hasAttribute('data-pmw-chat-float'));
  // a popped-out chat is not in the row at all: the ladder treats it as not shown (no strip for a floating window)
  var chatShown = !!chat && !chat.classList.contains('hidden') && !floating;
  var s = slotEl();
  var railApplied = s && !s.classList.contains('hidden') && s.offsetParent !== null && inFlow(s) ? s.getBoundingClientRect().width : 0;
  // during the chat peek the chat is absolute and the centre already holds the strip's room, so it adds nothing
  var chatApplied = chatShown && inFlow(chat) ? chat.getBoundingClientRect().width : 0;
  var base = centre.clientWidth + railApplied + chatApplied;
  // pinned History and Activity Detail are measured even for a popped-out chat: the floating window grows by them too
  // (20-shell.css)
  var hist = chat && !chat.classList.contains('hidden') ? historyW() : 0;
  var act = chat && !chat.classList.contains('hidden') ? activityW() : 0;
  // user-sized columns: the rail resizer leaves an inline width, the chat drag saves width_px (see the header)
  var railPinned = !!(s && !s.classList.contains('hidden') && parseFloat(s.style.width) > 0);
  var chatPinned = !!(PMW.chatCol && PMW.chatCol.widthPx && PMW.chatCol.widthPx());
  return { base: base, railUser: railUserWidth(), chatW: chatUser() + hist + act, chatShown: chatShown, hist: hist, act: act, railPinned: railPinned, chatPinned: chatPinned };
};

/* The Usage page's board floor (the planner, 2026-10-10): the chat column never squeezes the Usage board (#pmuBoard)
   under 400 px. Home has the ladder above; on the Usage page the column gives way first by dropping a pinned History,
   then down to its 400 px minimum, and grows back toward the user's width as the board gets room. Measured from what
   is applied now, never saved. */
function usageBoard() { var b = qs('#panel-usage #pmuBoard'); return b && b.offsetParent !== null && b.getClientRects().length ? b : null; }
/* the floor follows the board's width only, through one observer on the board's scroll pane, which never changes: the
   Usage board hands #pmuBoard between two board elements on every room change, so observing #pmuBoard added an observer
   per room change, and the board's height changing with each room scheduled this pass two or three times inside every
   room change's build (motion QA A14, 2026-10-16). The pane is as wide as the board. */
var usageWatched = null, usageRO = null, usageW = -1;
narrow.usageFloor = function () {
  var board = usageBoard(), chat = qs('#chatPanel'), ma = mainArea();
  if (!board || !chat || chat.classList.contains('hidden') || (ma && ma.hasAttribute('data-pmw-chat-float')) || !inFlow(chat)) return false;
  var pane = board.parentNode;
  if (pane && usageWatched !== pane && typeof ResizeObserver === 'function') {
    usageWatched = pane; usageW = -1;
    if (!usageRO) usageRO = new ResizeObserver(function (entries) {
      var w = entries && entries[0] && entries[0].contentRect ? entries[0].contentRect.width : -1;
      if (Math.abs(w - usageW) < 0.5) return;
      usageW = w; narrow.schedule();
    });
    usageRO.disconnect(); usageRO.observe(pane);
  }
  var hist = historyW(), act = activityW();
  var room = chat.getBoundingClientRect().width + board.getBoundingClientRect().width - LADDER.usageBoardMin;
  var want = chatUser() + hist + act, h = hist, a = act;
  var c = Math.min(want, room);
  // History gives its width back first, then Activity Detail (which then covers the messages), as on Home
  if (hist && c < LADDER.chatMin + hist + act) { h = 0; c = Math.min(want - hist, room); }
  if (act && c < LADDER.chatMin + h + act) { a = 0; c = Math.min(want - hist + h - act, room); }
  c = Math.max(LADDER.chatMin, Math.round(c));
  writeExtras(chat, c, h, a);
  var dropped = hist > 0 && h === 0, actDropped = act > 0 && a === 0;
  if (narrow.state.histDropped !== dropped || narrow.state.actDropped !== actDropped || narrow.state.chat !== c) {
    narrow.state = Object.assign({}, narrow.state, { chat: c, hist: h, histDropped: dropped, act: a, actDropped: actDropped });
    bus.emit('narrow', narrow.state);
  }
  return true;
};
/* the column's width and what pinned History and Activity Detail add to it, for the widths CSS sets on its own (the
   narrow peek, the popped-out chat) */
function writeExtras(chat, c, h, a) {
  var px = c == null ? null : Math.round(c) + 'px', hpx = Math.round(h || 0) + 'px', apx = Math.round(a || 0) + 'px';
  if (px && chat.style.getPropertyValue('--pmw-chat-w') !== px) chat.style.setProperty('--pmw-chat-w', px);
  if (chat.style.getPropertyValue('--pmw-chat-hist-w') !== hpx) chat.style.setProperty('--pmw-chat-hist-w', hpx);
  if (chat.style.getPropertyValue('--pmw-chat-act-w') !== apx) chat.style.setProperty('--pmw-chat-act-w', apx);
}

/* any other page: the chat column is the user's width (plus a pinned History and an open Activity Detail), with no
   ladder to ease it; the page beside it (.center-column) keeps the centre's floor: Activity Detail gives its width back
   first (it then covers the messages), then the column is held, never under its own minimum */
narrow.plainChat = function () {
  var chat = qs('#chatPanel'), ma = mainArea();
  if (!chat || chat.classList.contains('hidden') || (ma && ma.hasAttribute('data-pmw-chat-float'))) return;
  var hist = historyW(), act = activityW(), a = act, cc = qs('.center-column');
  var room = cc && inFlow(chat) && cc.getClientRects().length ? cc.getBoundingClientRect().width + chat.getBoundingClientRect().width - LADDER.chatStrip : Infinity;
  var want = chatUser() + hist + act;
  if (act && want > room) { a = 0; want -= act; }
  writeExtras(chat, Math.max(LADDER.chatMin + hist + a, Math.min(want, room)), hist, a);
};

narrow.update = function () {
  if (narrow.frozen) return;
  floatExtras();
  /* A shell resizer drag (the left rail) does not freeze the ladder the way the chat drag does, so solving
     mid-drag capped the rail back to its eased 240px while the person was still widening it: the rendered
     width oscillated between the drag's width and the cap. The drag is one gesture; solve once it ends
     (the shell's PM_ON_DRAGEND hook registered in install, plus the style observer's next schedule). */
  if (doc.body && doc.body.classList.contains('pm-resizing')) return;
  var m = narrow.measure();
  if (!m) { if (!narrow.usageFloor()) narrow.plainChat(); return; }
  var prev = narrow.state;
  var next = narrow.solve(m.base, m.railUser, m.chatW, m.chatShown, !!(PMW.chatCol && PMW.chatCol.keepOpen()), prev, m.hist, m.railPinned, m.chatPinned, m.act);
  narrow.apply(next, prev);
};
/* a popped-out chat grows by pinned History and an open Activity Detail on every page (20-shell.css reads the two
   widths), so they are written before the Home, Usage and other-page paths, which all leave a floating chat alone (A3) */
function floatExtras() {
  var chat = qs('#chatPanel'), ma = mainArea();
  if (!chat || chat.classList.contains('hidden') || !(ma && ma.hasAttribute('data-pmw-chat-float'))) return;
  writeExtras(chat, null, historyW(), activityW());
}
/* the hook agreed with the left rail lead: data-pm-rail-fold on #sidePanelSlot (never on <html>) and the document event
   pm:rail-fold { mode: 'eased'|'overlay'|'docked', width }; the rail's concept D refits and styles its overlay from it */
var lastFold = null;
function signalRail(next) {
  var s = slotEl();
  if (!s) return;
  var mode = next.rail === 'fold' ? 'overlay' : next.rail === 'ease' ? 'eased' : 'docked';
  setAttr(s, 'data-pm-rail-fold', mode === 'docked' ? null : mode);
  var width = mode === 'overlay' ? 280 : mode === 'eased' ? LADDER.railEased : Math.round(next.railWidth || 0);
  var key = mode + ':' + width;
  if (key === lastFold) return;
  lastFold = key;
  try { doc.dispatchEvent(new CustomEvent('pm:rail-fold', { detail: { mode: mode, width: width } })); } catch (_) {}
}
narrow.apply = function (next, prev) {
  signalRail(next);
  var ma = mainArea();
  if (ma) {
    setAttr(ma, 'data-pmw-rail', next.rail === 'open' ? null : next.rail);
    if (next.rail !== 'fold') ma.removeAttribute('data-pmw-rail-peek');
    setAttr(ma, 'data-pmw-chat', next.chatStrip ? 'strip' : null);
    if (!next.chatStrip) ma.removeAttribute('data-pmw-chat-peek');   // no strip, no peek: it would come back with the next strip
  }
  var chat = qs('#chatPanel');
  if (chat) writeExtras(chat, next.chat, next.hist, next.act);
  var changed = next.oneColumn !== prev.oneColumn || next.step !== prev.step || (next.hist || 0) !== (prev.hist || 0) || !!next.histDropped !== !!prev.histDropped ||
    (next.act || 0) !== (prev.act || 0) || !!next.actDropped !== !!prev.actDropped;
  narrow.state = next;
  if (next.oneColumn !== prev.oneColumn) {
    render.schedule({ animate: true });
    announce(next.oneColumn ? 'The window is narrow: one panel at a time. Use the panel switcher in the tab strip.' : 'Panels side by side again');
  }
  if (changed) bus.emit('narrow', { step: next.step, C: next.C, oneColumn: next.oneColumn, rail: next.rail, chatStrip: next.chatStrip, histDropped: !!next.histDropped, actDropped: !!next.actDropped });
};
narrow.singleColumn = function () { return !!narrow.state.oneColumn; };
narrow.afterPaint = function () {};

var narrowQueued = false;
narrow.schedule = function () {
  if (narrowQueued) return;
  narrowQueued = true;
  nextFrame(function () { narrowQueued = false; narrow.update(); });
};

/* the rail's overlay while folded: an activity icon opens the side panel over the centre; Escape or outside closes */
narrow.installRailPeek = function () {
  doc.addEventListener('click', function (e) {
    var ma = mainArea();
    if (!ma || ma.getAttribute('data-pmw-rail') !== 'fold') return;
    var icon = e.target.closest && e.target.closest('.activity-bar .icon[data-target]');
    if (!icon) return;
    var peeking = ma.hasAttribute('data-pmw-rail-peek');
    if (icon.classList.contains('active') && peeking) { e.stopPropagation(); e.preventDefault(); ma.removeAttribute('data-pmw-rail-peek'); return; }
    if (icon.classList.contains('active') && !peeking) { e.stopPropagation(); e.preventDefault(); ma.setAttribute('data-pmw-rail-peek', ''); return; }
    ma.setAttribute('data-pmw-rail-peek', '');
  }, true);
  doc.addEventListener('pointerdown', function (e) {
    var ma = mainArea();
    if (!ma || !ma.hasAttribute('data-pmw-rail-peek')) return;
    if (e.target.closest && e.target.closest('.left-panel, #fileContextMenu')) return;
    ma.removeAttribute('data-pmw-rail-peek');
  }, true);
  doc.addEventListener('keydown', function (e) {
    var ma = mainArea();
    if (e.key === 'Escape' && ma && ma.hasAttribute('data-pmw-rail-peek')) { ma.removeAttribute('data-pmw-rail-peek'); }
  });
  bus.on('open', function () { var ma = mainArea(); if (ma) ma.removeAttribute('data-pmw-rail-peek'); });
};

narrow.install = function () {
  window.addEventListener('resize', narrow.schedule);
  var s = slotEl();
  if (s && typeof MutationObserver === 'function') {
    new MutationObserver(function () { s._pmwNatural = null; narrow.schedule(); }).observe(s, { attributes: true, attributeFilter: ['class', 'style'] });
  }
  var chat = qs('#chatPanel');
  if (chat) new MutationObserver(narrow.schedule).observe(chat, { attributes: true, attributeFilter: ['class'] });
  var ab = qs('#activityBar');
  if (ab) new MutationObserver(narrow.schedule).observe(ab, { attributes: true, attributeFilter: ['class'] });
  // the chat column (width_px, history_pinned, keep_open) lives in the layout record: a project switch or a restored
  // layout can change it (the width's commit emits layout too; the two pins' actions schedule the ladder themselves)
  bus.on('layout', narrow.schedule);
  if (typeof window.PM_ON_DRAGEND === 'function') window.PM_ON_DRAGEND(narrow.schedule);
  narrow.installRailPeek();
  narrow.update();
};
