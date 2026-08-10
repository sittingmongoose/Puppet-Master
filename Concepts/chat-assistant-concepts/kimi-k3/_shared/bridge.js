/* ============================================================================
   Kimi K3 — postMessage bridge between the comparison workspace (index.html)
   and hosted pairing pages (host.html iframes / pop-out windows).

   Protocol (both directions, {k3: true} tagged):
   - child -> parent: {type:'k3-ready'}                    (host booted)
   - child -> parent: {type:'k3-state-change', key, value} (observability)
   - parent -> child: {type:'k3-env', env}                 (theme/width/rail/rm/mode/labels)
   - parent -> child: {type:'k3-pairing', windowId, threadId}
   - parent -> child: {type:'k3-snapshot', snapshot}       (state handoff to pop-out)
   ========================================================================== */
(function () {
  'use strict';

  const K3Bridge = {
    // Child side: announce readiness and apply inbound env/pairing messages.
    listenInHost(applyPairing) {
      window.addEventListener('message', (e) => {
        const m = e.data;
        if (!m || m.k3 !== true) return;
        if (m.type === 'k3-env' && m.env) {
          window.K3.setEnv(m.env);
        } else if (m.type === 'k3-pairing') {
          if (typeof applyPairing === 'function') applyPairing(m.windowId, m.threadId);
        } else if (m.type === 'k3-snapshot' && m.snapshot) {
          window.K3Store.restore(m.snapshot);
        }
      });
    },
    announceReady(target) {
      (target || window.parent).postMessage({ k3: true, type: 'k3-ready' }, '*');
    },
    // Parent side: broadcast env to every hosted frame.
    broadcastEnv(frames, env) {
      const msg = { k3: true, type: 'k3-env', env };
      frames.forEach((f) => {
        if (f && f.contentWindow) f.contentWindow.postMessage(msg, '*');
      });
    },
    sendPairing(frame, windowId, threadId) {
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage({ k3: true, type: 'k3-pairing', windowId, threadId }, '*');
      }
    },
    sendSnapshot(win, snapshot) {
      if (win) win.postMessage({ k3: true, type: 'k3-snapshot', snapshot }, '*');
    }
  };

  window.K3Bridge = K3Bridge;
})();
