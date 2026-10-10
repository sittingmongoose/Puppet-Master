/* The narrow ladder (D4), keyed on the centre's width C (window minus rail minus chat), never on the window, and never
   saved. Order (Jared: "Rail, then chat"): C < 960 the rail side panel eases to 240 and then folds to its icon bar
   below 760 (it then opens as an overlay), then the chat eases toward its minimum (400); one panel column below 600
   (the tree is untouched: it is a render mode); below 480 the chat folds to an edge strip unless the user pinned it.
   Each step has 48 px of hysteresis. It measures what is applied now, so theme paddings, resizers and the activity bar
   need no constants. The only file allowed to read the window size (the chat's default width scales with it). */

var LADDER = PMW.LADDER = { railEase: 960, railFold: 760, chatEase: 960, oneColumn: 600, chatStrip: 480, hyst: 48, railEased: 240, chatMin: 400, chatMax: 760, chatStripW: 32 };
var narrow = PMW.narrow = { state: { rail: 'open', chat: null, chatStrip: false, oneColumn: false, C: 0, step: 0 }, frozen: false };

function mainArea() { return qs('.main-area'); }
function slotEl() { return qs('#sidePanelSlot'); }
/* the chat's default width scales with the window: about 480 at 1470, 600 at 1920, at most 640 (D3) */
function chatDefault() { return Math.round(clamp(window.innerWidth * 0.26667 + 88, LADDER.chatMin, 640)); }
narrow.chatDefault = chatDefault;
function chatUser() { var w = PMW.settings.get('chat.width'); return w ? clamp(w, LADDER.chatMin, LADDER.chatMax) : chatDefault(); }
narrow.chatUser = chatUser;

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

/* pure: base = C + rail panel + chat (what the three share); returns the applied state */
narrow.solve = function (base, railUser, chatW, chatShown, pinned, prev) {
  prev = prev || {};
  var s = railUser, c = chatShown ? chatW : 0, rail = 'open', strip = false;
  var eased = s > LADDER.railEased && on(prev.rail === 'ease' || prev.rail === 'fold', base - s - c, LADDER.railEase);
  if (eased) { s = LADDER.railEased; rail = 'ease'; }
  if (railUser > 0 && on(prev.rail === 'fold', base - s - c, LADDER.railFold)) { s = 0; rail = 'fold'; }
  if (chatShown && base - s - c < LADDER.chatEase) c = Math.max(LADDER.chatMin, Math.min(c, c - (LADDER.chatEase - (base - s - c))));
  if (chatShown && !pinned && on(prev.chatStrip, base - s - c, LADDER.chatStrip)) { c = LADDER.chatStripW; strip = true; }
  var C = base - s - c;
  var one = on(prev.oneColumn, C, LADDER.oneColumn);
  var step = strip ? 4 : one ? 3 : rail === 'fold' ? 2 : (rail === 'ease' || (chatShown && c < chatW)) ? 1 : 0;
  return { rail: rail, railWidth: s, chat: chatShown ? c : null, chatStrip: strip, oneColumn: one, C: C, step: step };
};

/* does el take room in the row? An overlay (the rail peek, the chat peek, the popped-out chat) is absolute or fixed and
   takes none; counting it as docked width made the ladder undo the overlay it had just opened, frame after frame */
function inFlow(el) { var p = getComputedStyle(el).position; return p !== 'absolute' && p !== 'fixed'; }

/* the docked footprint only: base = the centre plus the columns that really share the row with it */
narrow.measure = function () {
  var centre = state.centre;
  if (!centre || !centre.getClientRects().length) return null;
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
  return { base: base, railUser: railUserWidth(), chatW: chatUser(), chatShown: chatShown };
};

narrow.update = function () {
  if (narrow.frozen) return;
  var m = narrow.measure();
  if (!m) return;
  var prev = narrow.state;
  var next = narrow.solve(m.base, m.railUser, m.chatW, m.chatShown, !!PMW.settings.get('chat.pinOpen'), prev);
  narrow.apply(next, prev);
};
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
  if (chat && next.chat != null) {
    var px = Math.round(next.chat) + 'px';
    if (chat.style.getPropertyValue('--pmw-chat-w') !== px) chat.style.setProperty('--pmw-chat-w', px);
  }
  var changed = next.oneColumn !== prev.oneColumn || next.step !== prev.step;
  narrow.state = next;
  if (next.oneColumn !== prev.oneColumn) {
    render.schedule({ animate: true });
    announce(next.oneColumn ? 'The window is narrow: one panel at a time. Use the panel switcher in the tab strip.' : 'Panels side by side again');
  }
  if (changed) bus.emit('narrow', { step: next.step, C: next.C, oneColumn: next.oneColumn, rail: next.rail, chatStrip: next.chatStrip });
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
  PMW.settings.on('chat.width', narrow.schedule);
  PMW.settings.on('chat.pinOpen', narrow.schedule);
  narrow.installRailPeek();
  narrow.update();
};
