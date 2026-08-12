/* ============================================================================
   Kimi K3 — postMessage bridge between the comparison workspace (index.html)
   and hosted pairing pages (host.html iframes / pop-out windows).

   Protocol (both directions, {k3: true} tagged):
   - child -> parent: {type:'k3-ready'}                    (host booted)
   - child -> parent: {type:'k3-state-change', key, value} (observability)
   - parent -> child: {type:'k3-env', env}                 (theme/width/rail/rm/mode/labels)
   - parent -> child: {type:'k3-pairing', windowId, threadId}
   - parent -> child: {type:'k3-snapshot', snapshot}       (state handoff to pop-out)
   - parent -> child: {type:'k3-demo-trigger', key}        (deterministic demo triggers)

   ConceptHub standard-page contract (untagged, hub <-> page):
   - hub  -> page: {source:'pm-concept-hub', type:'pm-concept-state', state}
   - page -> hub:  {source:'pm-concept', type:'pm-concept-ready', version, capabilities}
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
        } else if (m.type === 'k3-demo-trigger' && window.K3States) {
          window.K3States.apply(m.key, window.K3.makeCtx());
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
    },
    // Parent side: broadcast a deterministic demo trigger to hosted frames.
    sendDemoTrigger(frames, key) {
      const msg = { k3: true, type: 'k3-demo-trigger', key };
      frames.forEach((f) => {
        if (f && f.contentWindow) f.contentWindow.postMessage(msg, '*');
      });
    },
    // ConceptHub standard-page contract --------------------------------------
    // Page side: apply inbound {source:'pm-concept-hub', type:'pm-concept-state'}
    // messages (theme / reducedMotion / testWidth). When `rebroadcast` is a
    // function it receives the raw message (index.html fans it out to every
    // hosted frame, whose own listenHub applies it).
    listenHub(rebroadcast) {
      window.addEventListener('message', (e) => {
        const m = e.data;
        if (!m || m.source !== 'pm-concept-hub' || m.type !== 'pm-concept-state') return;
        const state = m.state || {};
        const patch = {};
        if (state.theme) patch.theme = state.theme;
        if (typeof state.reducedMotion === 'boolean') patch.reducedMotion = state.reducedMotion;
        if (typeof state.testWidth === 'number' && isFinite(state.testWidth)) {
          const w = Math.max(520, Math.min(1200, Math.round(state.testWidth)));
          patch.width = w;
          document.documentElement.style.setProperty('--hub-test-width', w + 'px');
          if (state.widthRole === 'chat') {
            document.documentElement.style.setProperty('--hub-chat-width', w + 'px');
          }
        }
        if (Object.keys(patch).length && window.K3) window.K3.setEnv(patch);
        if (typeof rebroadcast === 'function') rebroadcast(m);
      });
    },
    // Page side: announce readiness/capabilities to the ConceptHub parent.
    announceHub() {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          source: 'pm-concept',
          type: 'pm-concept-ready',
          version: 1,
          capabilities: { theme: true, reducedMotion: true, testWidth: true }
        }, '*');
      }
    }
  };

  window.K3Bridge = K3Bridge;
})();
