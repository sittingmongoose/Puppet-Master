/* Gallery ↔ host postMessage bridge for Grok 4.5 chat concepts. */
(function () {
  'use strict';

  var AGENT = (window.PMChatLabels && window.PMChatLabels.MODEL) || 'Grok 4.5';
  var handlers = null;
  var listening = false;

  function call(name, payload) {
    if (!handlers || typeof handlers[name] !== 'function') return;
    try {
      handlers[name](payload);
    } catch (err) {
      console.error('PMChatBridge handler error:', name, err);
    }
  }

  function post(msg) {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(msg, '*');
      }
    } catch (_) {
      /* ignore */
    }
  }

  function apply(msg) {
    if (!msg || typeof msg !== 'object') return;
    var type = msg.type;
    switch (type) {
      case 'pm-theme':
        call('onTheme', { theme: msg.theme });
        break;
      case 'pm-rm':
        call('onReducedMotion', { on: !!msg.on });
        break;
      case 'pm-chat-width':
        call('onChatWidth', { px: msg.px });
        break;
      case 'pm-rail':
        call('onRail', { open: !!msg.open });
        break;
      case 'pm-window':
        call('onWindow', { id: msg.id });
        break;
      case 'pm-thread':
        call('onThread', { id: msg.id });
        break;
      case 'pm-mount':
        call('onMount', { mode: msg.mode });
        break;
      case 'pm-pair':
        call('onPair', { windowId: msg.windowId, threadId: msg.threadId });
        post({
          type: 'pm-pair-ack',
          windowId: msg.windowId,
          threadId: msg.threadId,
          agent: AGENT
        });
        break;
      default:
        call('onUnknown', msg);
        break;
    }
  }

  function onMessage(ev) {
    var data = ev && ev.data;
    if (!data || typeof data !== 'object' || !data.type) return;
    if (String(data.type).indexOf('pm-') !== 0) return;
    apply(data);
  }

  function init(nextHandlers) {
    handlers = nextHandlers || {};
    if (!listening) {
      window.addEventListener('message', onMessage);
      listening = true;
    }
    return window.PMChatBridge;
  }

  function notifyReady() {
    post({ type: 'pm-ready', agent: AGENT });
    try {
      window.dispatchEvent(new CustomEvent('pm-concept-ready', { detail: { model: AGENT } }));
      window.dispatchEvent(
        new CustomEvent('pm-concept-state', {
          detail: { model: AGENT, ready: true }
        })
      );
    } catch (_) {}
  }

  /* ConceptHub protocol tokens: pm-concept-ready pm-concept-state */
  window.PMChatBridge = {
    init: init,
    notifyReady: notifyReady,
    apply: apply,
    conceptReadyEvent: 'pm-concept-ready',
    conceptStateEvent: 'pm-concept-state'
  };
})();
