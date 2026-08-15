window.PMChatShell = (() => {
  function mount(root, env) {
    root.innerHTML = "";
    root.className = "pmq-shell";
    root.dataset.rail = env.railOpen ? "open" : "closed";
    root.dataset.mount = env.mountMode;
    root.style.setProperty("--chat-width", env.widthPx + "px");

    const bg = document.createElement("div");
    bg.className = "pmq-shell-bg";
    root.appendChild(bg);

    const titlebar = document.createElement("header");
    titlebar.className = "pmq-titlebar";
    titlebar.innerHTML =
      '<div class="pmq-titlebar-app"><span class="pmq-app-glyph"></span>Puppet Master</div>' +
      '<button class="pmq-titlebar-project" type="button" data-shell-action="project"><i data-ico="folder"></i><span>Tastebook</span><i data-ico="chevDown"></i></button>' +
      '<nav class="pmq-titlebar-tabs" aria-label="Pages">' +
      '<button class="pmq-titlebar-tab pmq-active" type="button">Assistant Chat</button>' +
      '<button class="pmq-titlebar-tab" type="button">Home</button>' +
      '<button class="pmq-titlebar-tab" type="button">Files</button>' +
      '<button class="pmq-titlebar-tab" type="button">Graph</button>' +
      "</nav>" +
      '<div class="pmq-titlebar-right">' +
      '<span class="pmq-indexing"><i data-ico="activity"></i>Indexing</span>' +
      '<span class="pmq-badge-model"><span class="pmq-badge-glyph"></span>' + env.labels.MODEL + "</span>" +
      "</div>";
    root.appendChild(titlebar);

    const rail = document.createElement("nav");
    rail.className = "pmq-rail";
    rail.setAttribute("aria-label", "Application rail");
    const railItems = [
      ["chats", "Chat", true], ["home", "Home"], ["folder", "Files"], ["search", "Search"],
      ["branch", "Source"], ["terminal", "Actions"], ["ship", "Docker"], ["flask", "Tests"],
      ["agents", "Agents"], ["layers", "Artifacts"]
    ];
    railItems.forEach(([ico, label, active]) => {
      const b = document.createElement("button");
      b.className = "pmq-rail-item" + (active ? " pmq-active" : "");
      b.type = "button";
      b.innerHTML = '<i data-ico="' + ico + '"></i><span>' + label + "</span>";
      b.addEventListener("click", () => {
        toast(label + " page is shell dressing in this concept workspace");
        if (window.PMChatCommands) window.PMChatCommands.dispatch("cmd.shell.page", { page: label }, { cataloged: false });
      });
      rail.appendChild(b);
    });
    const spacer = document.createElement("div");
    spacer.className = "pmq-rail-spacer";
    rail.appendChild(spacer);
    const gear = document.createElement("button");
    gear.className = "pmq-rail-item";
    gear.type = "button";
    gear.innerHTML = '<i data-ico="gear"></i><span>More</span>';
    gear.addEventListener("click", () => toast("Settings, Usage and Alerts live in the full application"));
    rail.appendChild(gear);
    root.appendChild(rail);

    const dash = document.createElement("main");
    dash.className = "pmq-dash";
    const editorbar = document.createElement("div");
    editorbar.className = "pmq-dash-editorbar";
    const homeTab = document.createElement("span");
    homeTab.className = "pmq-dash-tab pmq-live";
    homeTab.innerHTML = '<i data-ico="home"></i>Project overview';
    editorbar.appendChild(homeTab);
    dash.appendChild(editorbar);

    const editorContent = document.createElement("div");
    editorContent.className = "pmq-dash-editorcontent";
    editorContent.hidden = true;
    dash.appendChild(editorContent);

    const grid = document.createElement("div");
    grid.className = "pmq-dash-grid";
    function card(key) {
      const c = document.createElement("div");
      c.className = "pmq-dash-card";
      c.innerHTML = '<span class="pmq-dash-k">' + key + '</span><span class="pmq-dash-v"></span><span class="pmq-dash-d"></span>';
      grid.appendChild(c);
      return { v: c.querySelector(".pmq-dash-v"), d: c.querySelector(".pmq-dash-d"), el: c };
    }
    const cRuns = card("Runs today");
    const cQ = card("Open questions");
    const cFiles = card("Changed files");
    const cCtx = card("Context used");
    dash.appendChild(grid);

    const store = env.store;
    function updateDash() {
      if (!store) return;
      const key = store.activeKey();
      const t = store.demoThread(key);
      const st = store.state.threads[key];
      const msgs = store.messages(key);
      let ctx = null;
      for (let i = msgs.length - 1; i >= 0; i--) { if (msgs[i].runtime) { ctx = msgs[i].runtime; break; } }
      cCtx.v.textContent = ctx ? window.PMFmt.tokens(ctx.contextUsed) : "—";
      cCtx.d.textContent = ctx ? "of " + window.PMFmt.tokens(ctx.contextLimit) + " tokens" : "";
      const submitted = (st && st.questSubmitted) || [];
      const cancelled = (st && st.questCancelled) || [];
      const unresolved = (t.questionnaires || []).filter(q => submitted.indexOf(q.id) < 0 && cancelled.indexOf(q.id) < 0);
      cQ.v.textContent = String(unresolved.length);
      const aq = store.activeQuestionnaire(key);
      if (aq) {
        const qi = st.questIndex[aq.id] != null ? st.questIndex[aq.id] : (aq.currentQuestionIndex || 0);
        cQ.d.textContent = "Question " + (qi + 1) + " of " + aq.questions.length;
      } else {
        cQ.d.textContent = unresolved.length ? "Queued" : "None waiting";
      }
      let adds = 0, dels = 0, fcount = 0;
      (t.diffGroups || []).forEach(g => (g.files || []).forEach(f => { adds += f.added || 0; dels += f.removed || 0; fcount++; }));
      cFiles.v.textContent = "+" + adds + " −" + dels;
      cFiles.d.textContent = fcount ? "Across " + fcount + " files" : "No changes";
      const running = store.isRunning(key);
      cRuns.v.textContent = "14";
      cRuns.d.textContent = running ? "1 running now · 2 queued" : "3 active · 2 queued";
      cRuns.el.classList.toggle("pmq-dash-live", running);
    }
    if (store) { store.subscribe(updateDash); updateDash(); }

    const act = document.createElement("div");
    act.className = "pmq-dash-activity";
    act.innerHTML =
      '<div class="pmq-act-head"><span class="pmq-act-title">Recent activity</span>' +
      '<span class="pmq-act-sync"><i data-ico="activity"></i>Live</span></div>' +
      '<div class="pmq-act-rows"></div>' +
      '<div class="pmq-act-chart"><span class="pmq-act-chart-k">Runs · last 24h</span><div class="pmq-act-bars"></div></div>';
    const actRows = act.querySelector(".pmq-act-rows");
    const actBars = act.querySelector(".pmq-act-bars");
    [36, 58, 44, 70, 52, 82, 64, 48, 74, 58, 90, 66, 54, 80].forEach((v, i, arr) => {
      const b = document.createElement("span");
      b.className = "pmq-act-bar" + (i === arr.length - 1 ? " pmq-act-now" : "");
      b.style.height = v + "%";
      actBars.appendChild(b);
    });
    actRows.addEventListener("click", e => {
      const row = e.target.closest("[data-thread]");
      if (row && store) store.switchThread(row.dataset.thread);
    });
    function updateActivity() {
      if (!store) return;
      const over = store.state.session.titleOverrides || {};
      actRows.innerHTML = store.data.threads.slice()
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
        .slice(0, 5)
        .map(t => {
          const state = store.isRunning(t.id) ? "running" : (t.threadState || "idle");
          return '<div class="pmq-act-row' + (t.id === store.activeKey() ? " pmq-act-cur" : "") + '" data-thread="' + t.id + '">' +
            '<span class="pmq-dot" data-state="' + window.PMFmt.esc(state) + '"></span>' +
            '<span class="pmq-act-name">' + window.PMFmt.esc(over[t.id] || t.title) + "</span>" +
            '<span class="pmq-act-ago">' + window.PMFmt.ago(t.updatedAt) + "</span></div>";
        }).join("");
    }
    if (store) { store.subscribe(updateActivity); updateActivity(); }
    dash.appendChild(act);
    root.appendChild(dash);

    const stageWrap = document.createElement("div");
    stageWrap.className = "pmq-stage-wrap";
    const dockedStage = document.createElement("div");
    dockedStage.className = "pmq-chat-stage";
    dockedStage.id = "pmq-stage-docked";
    stageWrap.appendChild(dockedStage);
    root.appendChild(stageWrap);

    const popoutStage = document.createElement("div");
    popoutStage.className = "pmq-popout-stage";
    popoutStage.id = "pmq-stage-popout";
    const popoutContent = document.createElement("div");
    popoutContent.className = "pmq-popout-content";
    const grip = document.createElement("div");
    grip.className = "pmq-popout-grip";
    grip.title = "Drag to move the pop-out";
    const resize = document.createElement("div");
    resize.className = "pmq-popout-resize";
    resize.title = "Drag to resize the pop-out";
    popoutStage.appendChild(popoutContent);
    popoutStage.appendChild(grip);
    popoutStage.appendChild(resize);
    root.appendChild(popoutStage);

    const toastStack = document.createElement("div");
    toastStack.className = "pmq-toast-stack";
    root.appendChild(toastStack);

    // ---- v3: offline/sync strip + notification inbox (title-bar boundary) ----
    const SYNC_LABELS = {
      live: "Live", cached: "Cached", synchronizing: "Syncing…",
      offline: "Offline", reconnecting: "Reconnecting…", replaying: "Replaying…", snapshot: "Snapshot catch-up",
      failed: "Reconnect failed"
    };
    const titleRight = titlebar.querySelector(".pmq-titlebar-right");
    const syncstrip = document.createElement("button");
    syncstrip.className = "pmq-syncstrip";
    syncstrip.type = "button";
    syncstrip.setAttribute("aria-label", "Connection status");
    titleRight.appendChild(syncstrip);
    const inboxBtn = document.createElement("button");
    inboxBtn.className = "pmq-inbox";
    inboxBtn.type = "button";
    inboxBtn.setAttribute("aria-label", "Notifications");
    inboxBtn.innerHTML = '<i data-ico="bell"></i><span class="pmq-inbox-count" hidden>0</span>';
    titleRight.appendChild(inboxBtn);

    function syncLabel() {
      if (!store) return "Live";
      const conn = store.state.connection;
      if (conn.status === "offline") return "Offline · " + conn.outbox.length + " queued";
      if (conn.serverWork && conn.status === "live") return "Server work continuing";
      return SYNC_LABELS[conn.status] || conn.status;
    }
    function renderSync() {
      if (!store) { syncstrip.hidden = true; return; }
      const conn = store.state.connection;
      syncstrip.dataset.status = conn.status;
      syncstrip.innerHTML = '<span class="pmq-syncdot"></span><span class="pmq-synclabel">' + window.PMFmt.esc(syncLabel()) + "</span>";
      syncstrip.hidden = false;
    }
    function renderInbox() {
      if (!store) return;
      const unread = store.state.notifications.unread;
      const countEl = inboxBtn.querySelector(".pmq-inbox-count");
      countEl.hidden = unread === 0;
      countEl.textContent = String(unread);
      inboxBtn.setAttribute("aria-label", "Notifications" + (unread ? " · " + unread + " unread" : ""));
    }
    function ago(ts) {
      const d = Date.now() - new Date(ts).getTime();
      const m = Math.floor(d / 60000);
      if (m < 1) return "just now";
      if (m < 60) return m + "m ago";
      const h = Math.floor(m / 60);
      if (h < 24) return h + "h ago";
      return Math.floor(h / 24) + "d ago";
    }
    function openOutboxPopup() {
      if (!store || !window.PMChatPopups) return;
      const conn = store.state.connection;
      const errRow = conn.status === "failed" ? '<div class="pmq-obx-err">' + window.PMFmt.esc(conn.lastError || "Reconnect failed") + "</div>" : "";
      const rows = conn.outbox.length
        ? conn.outbox.map(e => '<div class="pmq-obx-row"><span class="pmq-obx-text">' + window.PMFmt.esc((e.draft.text || "").slice(0, 60)) + '</span><span class="pmq-obx-meta">queued ' + ago(e.at) + '</span><button class="pmq-btn pmq-btn-sm" type="button" disabled title="Available once back online">Send now</button></div>').join("")
        : '<div class="pmq-obx-empty">Outbox is empty.</div>';
      const wrap = document.createElement("div");
      wrap.className = "pmq-obx-pop";
      wrap.innerHTML = '<div class="pmq-popup-head"><i data-ico="activity"></i>Connection · ' + window.PMFmt.esc(syncLabel()) + '</div>' +
        '<div class="pmq-popup-body pmq-scroll">' + errRow + rows + "</div>" +
        '<div class="pmq-obx-foot">' +
        (conn.status === "live" ? "" : '<button class="pmq-btn pmq-btn-primary" type="button" data-reconnect>Reconnect now</button>') +
        "</div>";
      window.PMIcons.hydrate(wrap);
      const entry = window.PMChatPopups.open(syncstrip, wrap, { width: 300 });
      const rc = wrap.querySelector("[data-reconnect]");
      if (rc) rc.addEventListener("click", () => { store.connReconnect(); window.PMChatPopups.dismiss(entry); });
    }
    function openInboxPopup() {
      if (!store || !window.PMChatPopups) return;
      const ns = store.state.notifications.inbox;
      const KIND_ICON = { approval: "shield", "goal-blocked": "warn", "update-available": "sparkle", collision: "warn", completion: "check" };
      const rows = ns.length
        ? ns.map(n => '<div class="pmq-inbox-row' + (n.read ? "" : " pmq-unread") + '" data-ntf="' + window.PMFmt.esc(n.id) + '">' +
            '<i data-ico="' + (KIND_ICON[n.kind] || "bell") + '"></i>' +
            '<span class="pmq-inbox-main"><span class="pmq-inbox-title">' + window.PMFmt.esc(n.title) + "</span>" +
            '<span class="pmq-inbox-body">' + window.PMFmt.esc(n.body) + "</span>" +
            '<span class="pmq-inbox-meta">' + ago(n.at) + " · " + window.PMFmt.esc(n.kind) + "</span></span>" +
            (n.threadKey ? '<button class="pmq-btn pmq-btn-sm" type="button" data-ntfopen="' + window.PMFmt.esc(n.threadKey) + '">Open thread</button>' : "") +
            (!n.read ? '<button class="pmq-btn pmq-btn-sm" type="button" data-ntfread="' + window.PMFmt.esc(n.id) + '">Mark read</button>' : "") +
            "</div>").join("")
        : '<div class="pmq-obx-empty">No notifications yet.</div>';
      const wrap = document.createElement("div");
      wrap.className = "pmq-inbox-pop";
      wrap.innerHTML = '<div class="pmq-popup-head"><i data-ico="bell"></i>Notifications</div>' +
        '<div class="pmq-popup-body pmq-scroll">' + rows + "</div>" +
        '<div class="pmq-obx-foot">' + (ns.some(n => !n.read) ? '<button class="pmq-btn" type="button" data-readall>Mark all read</button>' : "") + "</div>";
      window.PMIcons.hydrate(wrap);
      const entry = window.PMChatPopups.open(inboxBtn, wrap, { width: 330 });
      wrap.querySelectorAll("[data-ntfopen]").forEach(b => b.addEventListener("click", () => { store.switchThread(b.dataset.ntfopen); window.PMChatPopups.dismiss(entry); }));
      wrap.querySelectorAll("[data-ntfread]").forEach(b => b.addEventListener("click", () => { store.notifyRead(b.dataset.ntfread); window.PMChatPopups.dismiss(entry); }));
      const ra = wrap.querySelector("[data-readall]");
      if (ra) ra.addEventListener("click", () => { store.notifyReadAll(); window.PMChatPopups.dismiss(entry); });
    }
    syncstrip.addEventListener("click", openOutboxPopup);
    inboxBtn.addEventListener("click", openInboxPopup);
    window.addEventListener("pmq-open-inbox", () => openInboxPopup());
    if (store) {
      store.subscribe(() => { renderSync(); renderInbox(); });
      renderSync(); renderInbox();
    }

    window.PMIcons.hydrate(root);

    titlebar.addEventListener("click", e => {
      const btn = e.target.closest("[data-shell-action]");
      if (btn) toast("Project switching is shell dressing in this concept workspace");
    });

    function toast(text) {
      const t = document.createElement("div");
      t.className = "pmq-toast";
      t.textContent = text;
      toastStack.appendChild(t);
      while (toastStack.children.length > 4) toastStack.firstChild.remove();
      setTimeout(() => {
        t.classList.add("pmq-toast-out");
        setTimeout(() => t.remove(), 260);
      }, 3200);
    }

    const openTabs = [];
    let activeTabData = null;
    function renderEditorContent() {
      if (!activeTabData) { editorContent.hidden = true; editorContent.innerHTML = ""; return; }
      const t = activeTabData;
      editorContent.hidden = false;
      const ico = t.kind === "browser capture" ? "globe" : t.kind === "data" ? "graph" : "file";
      const kindLabel = t.kind === "browser capture" ? "Browser Program capture" : ((t.kind || "document").charAt(0).toUpperCase() + (t.kind || "document").slice(1));
      editorContent.innerHTML =
        '<div class="pmq-ec-head"><i data-ico="' + ico + '"></i><span class="pmq-ec-title">' + window.PMFmt.esc(t.title) + "</span>" +
        '<span class="pmq-chip">' + window.PMFmt.esc(kindLabel) + "</span></div>" +
        (t.detail ? '<div class="pmq-ec-path"><i data-ico="branch"></i>' + window.PMFmt.esc(t.detail) + "</div>" : "") +
        '<div class="pmq-ec-note">Editor, browser and file-explorer internals are owned elsewhere; this panel is faithful shell dressing for the handoff.</div>' +
        '<div class="pmq-ec-lines"><span style="width:88%"></span><span style="width:64%"></span><span style="width:78%"></span><span style="width:52%"></span></div>';
      window.PMIcons.hydrate(editorContent);
    }

    function openEditorTab(tab) {
      const existing = openTabs.find(t => t.id === tab.id);
      if (existing) { markLive(existing.el); activeTabData = tab; renderEditorContent(); toast(tab.title + " is already open in an editor tab"); return; }
      const el = document.createElement("span");
      el.className = "pmq-dash-tab pmq-live";
      el.innerHTML = '<i data-ico="' + (tab.kind === "browser capture" ? "globe" : tab.kind === "data" ? "graph" : "file") + '"></i><span>' +
        window.PMFmt.esc(tab.title) + '</span><button type="button" aria-label="Close tab"><i data-ico="close"></i></button>';
      window.PMIcons.hydrate(el);
      el.addEventListener("click", () => { activeTabData = tab; renderEditorContent(); markLive(el); });
      el.querySelector("button").addEventListener("click", ev => {
        ev.stopPropagation();
        const i = openTabs.findIndex(t => t.el === el);
        if (i >= 0) openTabs.splice(i, 1);
        el.remove();
        if (activeTabData && activeTabData.id === tab.id) {
          activeTabData = openTabs.length ? openTabs[openTabs.length - 1].data : null;
          renderEditorContent();
          if (openTabs.length) markLive(openTabs[openTabs.length - 1].el);
        }
      });
      markLive(el);
      editorbar.appendChild(el);
      openTabs.push({ id: tab.id, el, data: tab });
      activeTabData = tab;
      renderEditorContent();
      if (window.PMChatCommands) window.PMChatCommands.dispatch(tab.kind === "browser capture" ? "cmd.browser_program.open" : "cmd.editor.open", { title: tab.title, kind: tab.kind === "browser capture" ? "Browser Program capture" : tab.kind, path: tab.detail || "" }, tab.kind === "browser capture" ? {} : { cataloged: false });
      toast("Opened " + tab.title + " in an editor tab");
    }

    function markLive(el) {
      editorbar.querySelectorAll(".pmq-dash-tab").forEach(t => t.classList.remove("pmq-live"));
      el.classList.add("pmq-live");
    }

    function setRail(open) { root.dataset.rail = open ? "open" : "closed"; }
    function setMount(mode) {
      root.dataset.mount = mode;
      if (mode === "popout") {
        popoutStage.style.left = "";
        popoutStage.style.top = "";
        popoutStage.style.transform = "";
        popoutStage.style.height = "";
      }
    }
    function setWidth(px) { root.style.setProperty("--chat-width", Math.max(520, Math.min(1200, px)) + "px"); }

    /* Layout extras live on the shell root so BOTH the docked stage-wrap and
       the pop-out stage (a sibling subtree) inherit them. */
    function setPinLayout(extraPx, hideDash) {
      const extra = Math.max(0, Math.round(Number(extraPx) || 0));
      root.style.setProperty("--pmq-pin-extra", extra + "px");
      dash.style.display = hideDash ? "none" : "";
    }

    function setArtLayout(extraPx) {
      const extra = Math.max(0, Math.round(Number(extraPx) || 0));
      root.style.setProperty("--pmq-art-extra", extra + "px");
    }

    function clampPopoutLeft(left, w) { return Math.max(4, Math.min(left, window.innerWidth - w - 4)); }
    function clampPopoutTop(top, h) { return Math.max(48, Math.min(top, window.innerHeight - h - 4)); }

    grip.addEventListener("pointerdown", e => {
      e.preventDefault();
      const r = popoutStage.getBoundingClientRect();
      if (getComputedStyle(popoutStage).transform !== "none") {
        popoutStage.style.left = r.left + "px";
        popoutStage.style.top = r.top + "px";
        popoutStage.style.transform = "none";
      }
      const startX = e.clientX, startY = e.clientY;
      const origLeft = parseFloat(popoutStage.style.left) || r.left;
      const origTop = parseFloat(popoutStage.style.top) || r.top;
      popoutStage.classList.add("pmq-dragging");
      grip.setPointerCapture(e.pointerId);
      const move = ev => {
        const w = popoutStage.offsetWidth, h = popoutStage.offsetHeight;
        popoutStage.style.left = clampPopoutLeft(origLeft + ev.clientX - startX, w) + "px";
        popoutStage.style.top = clampPopoutTop(origTop + ev.clientY - startY, h) + "px";
      };
      const up = ev => {
        popoutStage.classList.remove("pmq-dragging");
        grip.releasePointerCapture(ev.pointerId);
        grip.removeEventListener("pointermove", move);
        grip.removeEventListener("pointerup", up);
      };
      grip.addEventListener("pointermove", move);
      grip.addEventListener("pointerup", up);
    });

    function applyPopoutSize(w, h) {
      const cw = Math.max(520, Math.min(1200, Math.round(w)));
      if (env.onWidth) env.onWidth(cw);
      if (h != null) {
        const ch = Math.max(360, Math.min(window.innerHeight - 60, Math.round(h)));
        popoutStage.style.height = ch + "px";
      }
      const r = popoutStage.getBoundingClientRect();
      if (popoutStage.style.transform === "none" || popoutStage.style.left) {
        popoutStage.style.left = clampPopoutLeft(parseFloat(popoutStage.style.left) || r.left, cw) + "px";
      }
      return cw;
    }

    resize.addEventListener("pointerdown", e => {
      e.preventDefault();
      const r = popoutStage.getBoundingClientRect();
      if (getComputedStyle(popoutStage).transform !== "none") {
        popoutStage.style.left = r.left + "px";
        popoutStage.style.top = r.top + "px";
        popoutStage.style.transform = "none";
      }
      const startX = e.clientX, startY = e.clientY;
      const origW = r.width, origH = r.height;
      popoutStage.classList.add("pmq-resizing");
      resize.setPointerCapture(e.pointerId);
      const move = ev => applyPopoutSize(origW + ev.clientX - startX, origH + ev.clientY - startY);
      const up = ev => {
        popoutStage.classList.remove("pmq-resizing");
        resize.releasePointerCapture(ev.pointerId);
        resize.removeEventListener("pointermove", move);
        resize.removeEventListener("pointerup", up);
      };
      resize.addEventListener("pointermove", move);
      resize.addEventListener("pointerup", up);
    });

    return {
      root, toast, openEditorTab, setRail, setMount, setWidth, setPinLayout, setArtLayout,
      dockedStage, popoutStage, popoutContent, stageWrap
    };
  }

  return { mount };
})();
