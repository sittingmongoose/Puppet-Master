window.PMChatBridge = (() => {
  function listenHost(handlers) {
    window.addEventListener("message", e => {
      const m = e.data;
      if (!m || typeof m !== "object" || !m.pm) return;
      const fn = handlers[m.pm];
      if (fn) fn(m, e.source);
    });
  }

  function sendReady(target) {
    (target || window.parent).postMessage({ pm: "pm-ready", agent: window.PMChatLabels.AGENT_SLUG }, "*");
  }

  function drive(frame, type, payload) {
    if (!frame || !frame.contentWindow) return;
    frame.contentWindow.postMessage(Object.assign({ pm: type }, payload), "*");
  }

  return { listenHost, sendReady, drive };
})();
