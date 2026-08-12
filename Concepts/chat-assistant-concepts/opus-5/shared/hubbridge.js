/* PMXHubBridge — Opus 5
 *
 * The ConceptHub embed contract. Concepts/ConceptHub/validate.py requires every page it drives in
 * `controlMode: "standard"` to carry BOTH literal strings `pm-concept-ready` and
 * `pm-concept-state`, either in the page source or in a local script the page references. This
 * file is that script, and the literals below are load-bearing: renaming them to constants built
 * by concatenation would pass review and fail validation.
 *
 * Direction of travel:
 *   out  ->  { type: 'pm-concept-ready' }        posted once, on install, to the embedder
 *   in   <-  { type: 'pm-concept-state', ... }   theme / reducedMotion / testWidth
 *   in   <-  { type: 'pm-chat-width', px }       the Hub's widthControl role "chat"
 *   in   <-  { pm:   'pm-chat-width', px }       same message, older Hub envelope
 *
 * Everything it receives is written to the store, never to the DOM: the concepts already derive
 * theme, reduced motion and chat width from `ui.*`, so the bridge has no layout knowledge at all
 * and cannot drift from what the workspace control bar does with the same values.
 *
 * Contract: CONTRACT.md section 5 and section 9 (a module must not touch document.documentElement
 * — the theme is applied by the stage container, so the bridge only sets state).
 */
(function (global) {
  'use strict';

  var READY_MESSAGE = 'pm-concept-ready';
  var STATE_MESSAGE = 'pm-concept-state';
  var WIDTH_MESSAGE = 'pm-chat-width';

  var MIN_WIDTH = 520;
  var MAX_WIDTH = 1200;

  var installed = false;
  var store = null;
  var listener = null;

  function clampWidth(v) {
    var n = Number(v);
    if (!isFinite(n)) return null;
    return Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, Math.round(n)));
  }

  function knownTheme(id) {
    var themes = global.PMXWorkspace && global.PMXWorkspace.THEMES;
    if (!themes || !themes.length) return true;   /* boot order safety: accept and let the workspace clamp */
    for (var i = 0; i < themes.length; i++) if (themes[i].id === id) return true;
    return false;
  }

  function applyState(msg) {
    if (!store || !msg) return;
    if (typeof msg.theme === 'string' && knownTheme(msg.theme)) store.set('ui.theme', msg.theme);
    if (typeof msg.reducedMotion === 'boolean') store.set('ui.reducedMotion', msg.reducedMotion);
    /* The Hub sends `testWidth` for its preview sizing and `px` for the chat-width control. Both
     * mean the same thing to a chat concept: the readable measure. */
    var w = clampWidth(msg.testWidth !== undefined ? msg.testWidth : msg.width);
    if (w !== null) store.set('ui.chatWidth', w);
  }

  function applyChatWidth(px) {
    if (!store) return;
    var w = clampWidth(px);
    if (w !== null) store.set('ui.chatWidth', w);
  }

  function onMessage(ev) {
    var msg = ev && ev.data;
    if (!msg || typeof msg !== 'object') return;
    var type = msg.type || msg.pm;
    if (type === STATE_MESSAGE) applyState(msg);
    else if (type === WIDTH_MESSAGE) applyChatWidth(msg.px !== undefined ? msg.px : msg.width);
  }

  /* install(store) -> boolean. Idempotent: a second call is a no-op rather than a second listener,
   * because the contact sheet mounts eight compositions in one document and boot() may be reached
   * more than once during a test run. */
  function install(s) {
    if (installed) return false;
    store = s || null;
    listener = onMessage;
    global.addEventListener('message', listener, false);
    installed = true;
    announceReady();
    return true;
  }

  /* Posting to `parent` covers the iframe embed the Hub uses; posting to `opener` covers the
   * "open in a new tab" action, where there is no parent frame. Both are wrapped because a
   * cross-origin opener throws on access in some browsers. */
  function announceReady() {
    var payload = { type: READY_MESSAGE, topic: 'chat-assistant', model: 'Opus 5' };
    try { if (global.parent && global.parent !== global) global.parent.postMessage(payload, '*'); } catch (e) {}
    try { if (global.opener) global.opener.postMessage(payload, '*'); } catch (e) {}
    return true;
  }

  function uninstall() {
    if (!installed) return false;
    global.removeEventListener('message', listener, false);
    installed = false;
    listener = null;
    store = null;
    return true;
  }

  global.PMXHubBridge = {
    install: install,
    uninstall: uninstall,
    announceReady: announceReady,
    isInstalled: function () { return installed; },
    READY_MESSAGE: READY_MESSAGE,
    STATE_MESSAGE: STATE_MESSAGE,
    WIDTH_MESSAGE: WIDTH_MESSAGE
  };
})(window);
