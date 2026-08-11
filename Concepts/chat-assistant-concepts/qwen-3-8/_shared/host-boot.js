window.PMChatHost = (() => {
  function params() {
    const q = new URLSearchParams(location.search);
    return {
      w: q.get("w") || "w1",
      t: q.get("t") || "t1",
      mount: q.get("mount") === "popout" ? "popout" : "docked",
      theme: q.get("theme") || localStorage.getItem("pm.theme") || "friendly-dark",
      width: Math.max(520, Math.min(1200, parseInt(q.get("width") || "750", 10) || 750)),
      rail: (q.get("rail") || "open") === "open",
      rm: q.get("rm") === "1",
      dt: q.get("dt") || ""
    };
  }

  async function boot() {
    const p = params();
    document.documentElement.dataset.theme = p.theme;
    document.documentElement.dataset.motion = p.rm ? "reduced" : "full";
    if (p.rm) document.documentElement.setAttribute("data-motion", "reduced");

    const data = await window.PMChatDemoLoader.load();
    if (window.PMChatDemoExtend) window.PMChatDemoExtend.apply(data);
    const store = window.PMChatStore.create(data);

    const rootEl = document.getElementById("app");
    const shell = window.PMChatShell.mount(rootEl, {
      labels: window.PMChatLabels,
      railOpen: p.rail,
      mountMode: p.mount,
      widthPx: p.width,
      onWidth: setWidth,
      store: store
    });

    const env = {
      store,
      demo: data,
      popups: window.PMChatPopups,
      icons: window.PMIcons,
      fmt: window.PMFmt,
      labels: window.PMChatLabels,
      mountMode: p.mount,
      themeId: p.theme,
      widthPx: p.width,
      railOpen: p.rail,
      reducedMotion: p.rm,
      hostApi: {
        openEditorTab: tab => shell.openEditorTab(tab),
        toast: text => shell.toast(text),
        requestMountMode: mode => setMountMode(mode),
        requestPair: (w, t) => setPair(w, t),
        switchThread: key => store.switchThread(key)
      },
      isPinned: () => store.isPinned(currentWin),
      togglePin: () => store.togglePin(currentWin),
      setPinLayout: (px, hideDash) => shell.setPinLayout(px, hideDash),
      setArtLayout: px => shell.setArtLayout(px),
      winId: () => currentWin
    };

    let winHandle = null;
    let threadHandle = null;
    let currentWin = p.w;
    let currentThread = p.t;

    function stageFor(mode) {
      return mode === "popout" ? shell.popoutContent : shell.dockedStage;
    }

    let mountedWinEl = null;
    function mountPair() {
      if (threadHandle) { try { threadHandle.unmount(); } catch (e) {} threadHandle = null; }
      if (winHandle) { try { winHandle.unmount(); } catch (e) {} winHandle = null; }
      window.PMChatPopups.closeActive();
      if (mountedWinEl && mountedWinEl.parentNode) mountedWinEl.parentNode.removeChild(mountedWinEl);

      const stage = stageFor(env.mountMode);
      shell.setPinLayout(0, false);
      const Win = window.PMChatWindows[currentWin] || window.PMChatWindows.w1;
      const Thr = window.PMChatThreads[currentThread] || window.PMChatThreads.t1;

      const threadSlotEl = document.createElement("div");
      threadSlotEl.className = "pmq-thread-slot";

      winHandle = Win.mount(stage, {
        env,
        threadSlotEl,
        onRequestPopout: () => setMountMode("popout"),
        onRequestDock: () => setMountMode("docked"),
        onRequestClose: () => setMountMode("docked")
      });
      mountedWinEl = stage.lastElementChild;

      threadHandle = Thr.mount(threadSlotEl, { env, contentWidthPx: env.widthPx });
      const st = store.thread(store.activeKey());
      if (st && st.scrollAnchorId) threadHandle.restoreScrollAnchor(st.scrollAnchorId);
      else threadHandle.restoreScrollAnchor(null);
    }

    function setMountMode(mode) {
      if (mode === env.mountMode) return;
      const anchor = store.thread(store.activeKey());
      env.mountMode = mode;
      shell.setMount(mode);
      mountPair();
      if (threadHandle && anchor) threadHandle.restoreScrollAnchor(anchor.scrollAnchorId);
    }

    function setPair(w, t) {
      const changed = w !== currentWin || t !== currentThread;
      if (!changed) return;
      currentWin = window.PMChatWindows[w] ? w : currentWin;
      currentThread = window.PMChatThreads[t] ? t : currentThread;
      mountPair();
    }

    function setTheme(theme) {
      env.themeId = theme;
      document.documentElement.dataset.theme = theme;
      try { localStorage.setItem("pm.theme", theme); } catch (e) {}
    }

    function setWidth(px) {
      px = Math.max(520, Math.min(1200, Math.round(px)));
      env.widthPx = px;
      shell.setWidth(px);
      if (threadHandle) threadHandle.update({ contentWidthPx: px, widthPx: px });
      if (winHandle) winHandle.update({ widthPx: px });
    }

    function setRail(open) {
      env.railOpen = open;
      shell.setRail(open);
    }

    function setReduced(on) {
      env.reducedMotion = on;
      document.documentElement.dataset.motion = on ? "reduced" : "full";
    }

    window.PMChatBridge.listenHost({
      "pm-theme": m => setTheme(m.theme),
      "pm-rm": m => setReduced(!!m.on),
      "pm-chat-width": m => setWidth(m.px),
      "pm-rail": m => setRail(m.open !== false && m.open !== "closed" ? true : false),
      "pm-window": m => setPair(m.id, currentThread),
      "pm-thread": m => setPair(currentWin, m.id),
      "pm-mount": m => setMountMode(m.mode),
      "pm-pin": m => {
        if (m && typeof m.on === "boolean") {
          if (store.isPinned(currentWin) !== m.on) store.togglePin(currentWin);
        } else {
          store.togglePin(currentWin);
        }
      },
      "pm-data-thread": m => { if (store.state.threads[m.id] || store.state.extraThreads.some(t => t.id === m.id)) store.switchThread(m.id); },
      "pm-trigger": m => { if (window.__pmDemoTrigger && m && m.name) window.__pmDemoTrigger(m.name, m.payload || {}); },
      "pm-pair": (m, src) => {
        setPair(m.windowId, m.threadId);
        (src || window.parent).postMessage({
          pm: "pm-pair-ack",
          agent: window.PMChatLabels.AGENT_SLUG,
          windowId: currentWin,
          threadId: currentThread
        }, "*");
      }
    });

    mountPair();
    if (p.dt && store.state.threads[p.dt]) store.switchThread(p.dt);

    let lastPinned = store.isPinned(currentWin);
    store.subscribe(() => {
      const now = store.isPinned(currentWin);
      if (now === lastPinned) return;
      lastPinned = now;
      if (winHandle && typeof winHandle.update === "function") {
        try { winHandle.update({ pinned: now, widthPx: env.widthPx }); } catch (e) {}
      }
    });

    window.PMChatHost.api = {
      env, shell, store,
      setPair, setMountMode, setTheme, setWidth, setRail, setReduced,
      get pair() { return { windowId: currentWin, threadId: currentThread }; },
      remount: mountPair
    };

    window.__pmChatState = () => ({
      agent: window.PMChatLabels.AGENT_SLUG,
      pair: { windowId: currentWin, threadId: currentThread },
      mountMode: env.mountMode,
      theme: env.themeId,
      widthPx: env.widthPx,
      railOpen: env.railOpen,
      reducedMotion: env.reducedMotion,
      activeThread: store.activeKey(),
      running: !!store.state.running,
      runningThread: store.state.running ? store.state.running.threadKey : null,
      drafts: Object.fromEntries(Object.entries(store.state.threads).map(([k, v]) => [k, v.draft])),
      recentCommands: window.PMChatCommands ? window.PMChatCommands.recent(8) : [],
      serialized: store.serializeState()
    });

    window.__pmChatRestart = () => {
      const snap = store.serializeState();
      const fresh = window.PMChatStore.create(data);
      fresh.restoreState(snap);
      return fresh;
    };

    window.PMChatBridge.sendReady(window.parent);
    return window.PMChatHost.api;
  }

  return { boot, params };
})();
