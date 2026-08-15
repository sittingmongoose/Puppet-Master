window.PMChatWindowKit = (() => {
  const esc = window.PMFmt.esc;

  function bind(root, unsub) {
    root.__pmqDisposers = root.__pmqDisposers || [];
    root.__pmqDisposers.push(unsub);
  }

  function dispose(root) {
    if (!root) return;
    (root.__pmqDisposers || []).forEach(fn => { try { fn(); } catch (e) {} });
    root.__pmqDisposers = [];
  }

  function threadTitle(env, key) {
    const t = env.store.demoThread(key);
    const over = env.store.state.session.titleOverrides || {};
    return over[key] || t.title;
  }

  function badge(env, winId) {
    const el = document.createElement("span");
    el.className = "pmq-badge-model pmq-concept-badge";
    el.setAttribute("data-concept-label", "");
    el.innerHTML = '<span class="pmq-badge-glyph"></span>' + esc(env.labels.MODEL) +
      '<span class="pmq-badge-sep">·</span>' + esc(window.PMChatRegistry.windowLabel(winId)) + "</span>";
    return el;
  }

  function statusDot(state) {
    return '<span class="pmq-dot" data-state="' + esc(state) + '"></span>';
  }

  function statusGlyph(state, running, extra) {
    extra = extra || {};
    let glyph = state;
    if (state && typeof state === "object") { extra = state; glyph = state.glyph; }
    let blocked = !!extra.blocked;
    if (glyph === "running") glyph = "working";
    else if (glyph === "blocked") { glyph = "attention"; blocked = true; }
    else if (glyph === "awaiting question") glyph = "attention";
    else if (glyph === "idle") glyph = "ready";
    const reduced = !!(window.PMAnim && window.PMAnim.reduced && window.PMAnim.reduced());
    if (glyph === "working") {
      return '<span class="pmq-status pmq-status--working" data-glyph="working" role="img" aria-label="Working">' +
        '<span class="pmq-orbit' + (reduced ? " pmq-static" : "") + '"><span class="pair"><i></i><i></i></span><span class="pair"><i></i><i></i></span></span></span>';
    }
    if (glyph === "attention") {
      return '<span class="pmq-status pmq-status--attention' + (blocked ? " pmq-status--blocked" : "") + '" data-glyph="attention" role="img" aria-label="Needs attention">' +
        '<span class="pmq-status-ring"></span><span class="pmq-status-core"></span>' +
        (blocked ? '<span class="pmq-status-alert">!</span>' : "") + "</span>";
    }
    if (glyph === "paused") {
      return '<span class="pmq-status pmq-status--paused" data-glyph="paused" role="img" aria-label="Paused">' +
        '<span class="pmq-status-bar"></span><span class="pmq-status-bar"></span></span>';
    }
    const draw = !!extra.draw && !reduced;
    return '<span class="pmq-status pmq-status--ready' + (draw ? " pmq-draw" : "") + '" data-glyph="ready" role="img" aria-label="Ready">' +
      '<svg viewBox="0 0 14 14" aria-hidden="true"><path class="pmq-status-check" d="M3 7.5 5.7 10.2 11 4.8" pathLength="1" stroke-dasharray="1"/></svg></span>';
  }

  function chatsRows(env, active) {
    const threads = env.store.allThreads();
    const pinned = threads.filter(t => t.pinned);
    const rest = threads.filter(t => !t.pinned);
    const row = t => {
      const isActive = t.id === env.store.activeKey();
      const running = env.store.isRunning(t.id);
      const meta = env.store.statusForThread(t, running);
      return '<button class="pmq-chatrow' + (isActive ? " pmq-active" : "") + '" type="button" data-thread="' + t.id + '">' +
        statusGlyph(meta, running) +
        '<span class="pmq-chatrow-main"><span class="pmq-chatrow-title">' + esc(threadTitle(env, t.id)) + "</span>" +
        '<span class="pmq-chatrow-meta">' + esc(t.project) + " · " + window.PMFmt.ago(t.updatedAt) + "</span></span>" +
        (t.pinned ? '<i data-ico="pin" class="pmq-chatrow-pin"></i>' : "") +
        '<span class="pmq-row-more" role="button" tabindex="0" aria-label="Row actions" data-more="' + t.id + '"><i data-ico="kebab"></i></span>' +
        "</button>";
    };
    let html = "";
    if (pinned.length) {
      html += '<div class="pmq-chats-group">Pinned</div>' + pinned.map(row).join("");
    }
    html += '<div class="pmq-chats-group">Chats</div>' + rest.map(row).join("");
    return html;
  }

  function rowStub(cmdId, env, label) {
    if (window.PMChatCommands) window.PMChatCommands.dispatch(cmdId, {}, { cataloged: false });
    env.hostApi.toast(label + " is a production lifecycle action; stubbed in this concept");
  }

  function startRowRename(row, threadKey, env) {
    const titleEl = row && row.querySelector(".pmq-chatrow-title");
    if (!titleEl) return;
    titleEl.setAttribute("contenteditable", "true");
    titleEl.setAttribute("spellcheck", "false");
    titleEl.classList.add("pmq-renaming");
    const stop = e => e.stopPropagation();
    titleEl.addEventListener("pointerdown", stop);
    titleEl.addEventListener("click", stop);
    const range = document.createRange();
    range.selectNodeContents(titleEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    titleEl.focus();
    const finish = cancel => {
      titleEl.removeEventListener("pointerdown", stop);
      titleEl.removeEventListener("click", stop);
      titleEl.removeAttribute("contenteditable");
      titleEl.classList.remove("pmq-renaming");
      if (cancel) { titleEl.textContent = threadTitle(env, threadKey); return; }
      const v = titleEl.textContent.trim();
      if (!v) { titleEl.textContent = threadTitle(env, threadKey); return; }
      env.store.mutate(() => {
        const s = env.store.state.session;
        s.titleOverrides = s.titleOverrides || {};
        s.titleOverrides[threadKey] = v;
      });
    };
    titleEl.addEventListener("blur", () => finish(false), { once: true });
    titleEl.addEventListener("keydown", e => {
      e.stopPropagation();
      if (e.key === "Enter") { e.preventDefault(); titleEl.blur(); }
      else if (e.key === "Escape") { e.preventDefault(); titleEl.blur(); finish(true); }
    });
  }

  function openRowMenu(anchor, threadKey, env) {
    const t = env.store.demoThread(threadKey);
    const isPinnedRow = !!(t && t.pinned);
    env.popups.menu(anchor, [
      {
        label: isPinnedRow ? "Unpin" : "Pin", icon: "pin",
        onpick: () => env.store.mutate(() => { const dt = env.store.demoThread(threadKey); if (dt) dt.pinned = !dt.pinned; })
      },
      { label: "Rename", icon: "edit", onpick: () => {
          const row = anchor.closest("[data-thread]");
          setTimeout(() => startRowRename(row, threadKey, env), 0);
        } },
      { sep: true },
      { label: "Duplicate", icon: "copy", sub: "Production lifecycle action; not simulated", disabled: true, onpick: () => rowStub("cmd.chat.thread.duplicate", env, "Duplicate") },
      { label: "Archive", icon: "folder", sub: "Production lifecycle action; not simulated", disabled: true, onpick: () => rowStub("cmd.chat.thread.archive", env, "Archive") },
      { label: "Mute", icon: "mute", sub: "Production lifecycle action; not simulated", disabled: true, onpick: () => rowStub("cmd.chat.thread.mute", env, "Mute") },
      { label: "Close", icon: "close", sub: "Production lifecycle action; not simulated", disabled: true, onpick: () => rowStub("cmd.chat.thread.close", env, "Close") }
    ], { title: threadTitle(env, threadKey), width: 220 });
  }

  function wireChats(container, env) {
    container.addEventListener("click", e => {
      const more = e.target.closest("[data-more]");
      if (more) {
        e.stopPropagation();
        e.preventDefault();
        openRowMenu(more, more.dataset.more, env);
        return;
      }
      const row = e.target.closest("[data-thread]");
      if (!row) return;
      env.store.switchThread(row.dataset.thread);
    });
    container.addEventListener("keydown", e => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const more = e.target.closest && e.target.closest("[data-more]");
      if (!more) return;
      e.stopPropagation();
      e.preventDefault();
      openRowMenu(more, more.dataset.more, env);
    });
  }

  function chatsPopup(anchor, env, root) {
    const wrap = document.createElement("div");
    wrap.className = "pmq-chats-pop";
    wrap.innerHTML = '<div class="pmq-popup-head"><i data-ico="chats"></i><span>Chats</span>' +
      '<button class="pmq-pin-toggle" type="button" aria-label="Pin panel" aria-pressed="false"><i data-ico="pin"></i></button></div>' +
      '<div class="pmq-popup-body pmq-scroll pmq-chats-body">' + chatsRows(env) + "</div>";
    window.PMIcons.hydrate(wrap);
    const body = wrap.querySelector(".pmq-chats-body");
    const pinBtn = wrap.querySelector(".pmq-pin-toggle");
    function syncPin() {
      if (!pinBtn) return;
      const on = !!(env.isPinned && env.isPinned());
      pinBtn.classList.toggle("pmq-on", on);
      pinBtn.setAttribute("aria-pressed", on ? "true" : "false");
    }
    syncPin();
    if (pinBtn) pinBtn.addEventListener("click", e => {
      e.stopPropagation();
      if (env.togglePin) env.togglePin();
      syncPin();
    });
    wireChats(body, env);
    const entry = env.popups.open(anchor, wrap, { width: 280, cls: "pmq-chats-popup" });
    const un = env.store.subscribe(() => {
      if (!document.body.contains(wrap)) { un(); return; }
      body.innerHTML = chatsRows(env);
      window.PMIcons.hydrate(body);
      syncPin();
    });
    if (root) bind(root, un);
    return entry;
  }

  function chatsInline(env, root, opts) {
    opts = opts || {};
    const el = document.createElement("div");
    el.className = "pmq-chats-inline pmq-scroll" + (opts.cls ? " " + opts.cls : "");
    el.innerHTML = chatsRows(env);
    window.PMIcons.hydrate(el);
    wireChats(el, env);
    const un = env.store.subscribe(() => {
      el.innerHTML = chatsRows(env);
      window.PMIcons.hydrate(el);
    });
    bind(root, un);
    return el;
  }

  function titleEditor(env, root, onOpenChats) {
    const el = document.createElement("div");
    el.className = "pmq-title-block";
    function render() {
      const key = env.store.activeKey();
      const t = env.store.demoThread(key);
      const running = env.store.isRunning(key);
      el.innerHTML = '<button class="pmq-title-chats" type="button" aria-label="Open chats" aria-expanded="false"><i data-ico="chats"></i></button>' +
        '<span class="pmq-title-text" contenteditable="true" spellcheck="false">' + esc(threadTitle(env, key)) + "</span>" +
        statusGlyph(env.store.statusForThread(t, running), running);
      window.PMIcons.hydrate(el);
      const text = el.querySelector(".pmq-title-text");
      text.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); text.blur(); } });
      text.addEventListener("blur", () => {
        const v = text.textContent.trim();
        if (!v) return;
        env.store.mutate(() => {
          const s = env.store.state.session;
          s.titleOverrides = s.titleOverrides || {};
          s.titleOverrides[key] = v;
        });
      });
      el.querySelector(".pmq-title-chats").addEventListener("click", e => {
        chatsPopup(e.currentTarget, env, root);
      });
    }
    render();
    bind(root, env.store.subscribe(() => {
      const active = document.activeElement;
      if (active && active.classList && active.classList.contains("pmq-title-text")) return;
      render();
    }));
    return el;
  }

  const PERSONAS = ["Product designer", "Systems reviewer", "Interface engineer", "Research analyst"];
  const MODES = ["Ask", "Agent", "Debug", "Plan", "Deep Plan"];
  const EFFORTS = ["Low", "Medium", "High", "Max"];

  function sessionDefaultButton(body, env, key, field) {
    const b = document.createElement("button");
    b.className = "pmq-menu-item pmq-scope-all";
    b.type = "button";
    b.innerHTML = '<i data-ico="gear"></i><span>Make current choice the default for future threads</span>';
    window.PMIcons.hydrate(b);
    b.addEventListener("click", () => {
      const patch = {};
      patch[field] = env.store.effectiveSettings(key)[field];
      env.store.setSession(patch);
    });
    body.appendChild(b);
  }

  function personaPopup(anchor, env) {
    const key = env.store.activeKey();
    const cur = env.store.effectiveSettings(key).persona;
    env.popups.menu(anchor, PERSONAS.map(p => ({
      label: p, icon: "agents", checked: cur === p, keepOpen: true,
      onpick: () => env.store.setThreadSettings(key, { persona: p })
    })), { title: "Persona · this thread", search: true, width: 240, onrender: body => sessionDefaultButton(body, env, key, "persona") });
  }

  function modePopup(anchor, env) {
    const key = env.store.activeKey();
    const cur = env.store.effectiveSettings(key).mode;
    env.popups.menu(anchor, MODES.map(m => ({
      label: m, icon: m === "Plan" || m === "Deep Plan" ? "wand" : "sparkle",
      sub: m === "Plan" || m === "Deep Plan" ? "Effect-limited for persistent edits" : "",
      checked: cur === m, keepOpen: true,
      onpick: () => env.store.setThreadSettings(key, { mode: m })
    })), { title: "Conversation mode · this thread", width: 240, onrender: body => sessionDefaultButton(body, env, key, "mode") });
  }

  function accessPopup(anchor, env) {
    const key = env.store.activeKey();
    const cur = env.store.effectiveSettings(key).access;
    const subs = {
      "Ask for approval": "Every consequential action asks first",
      "Auto accept edits": "File edits run; other actions still ask",
      "Auto": "Safe actions run; risky ones ask",
      "Full Access": "Never bypasses FileSafe, org deny rules, or sandboxes"
    };
    env.popups.menu(anchor, env.store.ACCESS_PROFILES.map(a => ({
      label: a, icon: a === "Full Access" ? "shield" : a === "Ask for approval" ? "question" : "sparkle",
      sub: subs[a], checked: cur === a, keepOpen: true,
      onpick: () => env.store.accessSet(key, a)
    })), { title: "Access · this thread", width: 290, onrender: body => {
      const note = env.store.accessNote(key);
      if (note) {
        const d = document.createElement("div");
        d.className = "pmq-lens-counts";
        d.textContent = note;
        body.appendChild(d);
      }
      sessionDefaultButton(body, env, key, "access");
    } });
  }

  function ensureModelPopupStyles() {
    if (document.getElementById("pmq-mp-extra-style")) return;
    const st = document.createElement("style");
    st.id = "pmq-mp-extra-style";
    st.textContent = ".pmq-mp-kbd{flex:none;font-size:9px;font-weight:800;letter-spacing:.06em;color:var(--text-faint);border:1px solid var(--border);border-radius:4px;padding:1px 5px;line-height:1.4;}" +
      ".pmq-mp-setup-main{display:flex;flex-direction:column;gap:2px;}";
    document.head.appendChild(st);
  }

  function modelPopup(anchor, env, root) {
    const store = env.store;
    const key = store.activeKey();
    const wrap = document.createElement("div");
    wrap.className = "pmq-modelpop";
    ensureModelPopupStyles();
    const entry = env.popups.open(anchor, wrap, { width: 396, cls: "pmq-model-popup", onclose: () => document.removeEventListener("keydown", onKey, true) });
    let panel = null;
    let filter = "";
    let railFilter = "";

    function pending() {
      return (store.state.threads[key].warnings || []).find(w => w.kind === "route" && !w.resolved && w.pending);
    }
    function setupLabel(state, provider) {
      if (state === "install-required") return "Provider Setup Required — install from the official " + provider + " source.";
      if (state === "update-available") return "Update available";
      if (state === "sign-in-required") return "Sign-in required";
      if (state === "update-failed") return "Update failed; rolled back";
      if (state === "discovered") return "Found existing installation — reusing.";
      if (state === "verified") return "Verified publisher, version, architecture.";
      return "";
    }
    function modelRow(p, accLabel, m, accId, kbdN) {
      const c = store.effectiveSettings(key);
      const acct = store.effectiveAccount(key);
      const checked = c.model === m.name && c.provider === p.provider && (acct.accountId || null) === (accId || null);
      const fav = store.state.session.favorites.includes(m.name);
      const disabled = m.disabled || m.disabledReason;
      return '<div class="pmq-mp-row' + (checked ? " pmq-on" : "") + (disabled ? " pmq-off" : "") + '" data-model="' + esc(m.name) + '" data-prov="' + esc(p.provider) + '" data-acc="' + esc(accId || "") + '"' + (kbdN ? ' data-kbd="' + kbdN + '"' : "") + ' role="button" tabindex="0" aria-disabled="' + (disabled ? "true" : "false") + '">' +
        '<span class="pmq-mp-logo" data-logo="' + esc(p.id) + '"></span>' +
        '<span class="pmq-mp-main"><span class="pmq-mp-name">' + esc(m.name) + "</span>" +
        '<span class="pmq-mp-sub">' + esc(p.provider) + " · " + esc(accLabel) + (disabled ? " · " + esc(m.disabledReason || "Unavailable") : "") + "</span></span>" +
        (m.fast ? '<span class="pmq-mp-cap">Fast</span>' : "") +
        (m.caps && m.caps.video ? '<span class="pmq-mp-cap">Video</span>' : "") +
        (kbdN ? '<span class="pmq-mp-kbd">⌘' + kbdN + "</span>" : "") +
        '<button class="pmq-mp-fav' + (fav ? " pmq-on" : "") + '" type="button" data-fav="' + esc(m.name) + '" aria-label="Toggle favorite ' + esc(m.name) + '" aria-pressed="' + fav + '"><i data-ico="star"></i></button>' +
        (checked ? '<i data-ico="check" class="pmq-mp-check"></i>' : "") +
        "</div>";
    }
    function pickModel(p, m, accId) {
      const consequence = store.modelConsequence(key, { provider: p.provider, model: m.name });
      panel = { provider: p, model: m, accountId: accId || null };
      if (!consequence) {
        store.applyModelChange(key, { provider: p.provider, model: m.name, accountId: accId || null });
      } else {
        store.warningInject(key, {
          tier: consequence.tier, kind: "route", text: consequence.text, detail: consequence.detail,
          pending: { provider: p.provider, model: m.name, accountId: accId || null },
          choices: ["Switch here", "Branch with this model", "Start new chat", "Cancel"]
        });
      }
      render();
    }
    function railHtml() {
      const cat = store.catalog();
      return '<div class="pmq-mp-rail" role="tablist" aria-label="Providers">' +
        '<button class="pmq-mp-railbtn' + (railFilter === "" ? " pmq-on" : "") + '" type="button" data-rail="" role="tab" aria-selected="' + (railFilter === "") + '" aria-label="All providers"><i data-ico="layers"></i></button>' +
        cat.map(p => '<button class="pmq-mp-railbtn' + (railFilter === p.id ? " pmq-on" : "") + '" type="button" data-rail="' + esc(p.id) + '" role="tab" aria-selected="' + (railFilter === p.id) + '" aria-label="' + esc(p.provider) + '" title="' + esc(p.provider) + '"><span class="pmq-mp-logo" data-logo="' + esc(p.id) + '"></span></button>').join("") +
        "</div>";
    }
    function render() {
      const c = store.effectiveSettings(key);
      const acct = store.effectiveAccount(key);
      const cat = store.catalog();
      const pd = pending();
      let html = "";
      if (!panel) {
        html += '<div class="pmq-popup-head"><i data-ico="sparkle"></i><span>Model</span></div>' +
          '<div class="pmq-mp-search"><i data-ico="search"></i><input type="text" placeholder="Search models and providers" spellcheck="false" aria-label="Search models" value="' + esc(filter) + '"></div>' +
          '<div class="pmq-mp-listwrap">' + railHtml() +
          '<div class="pmq-popup-body pmq-scroll pmq-mp-body">';
        const favs = store.state.session.favorites;
        if (!filter && !railFilter) {
          html += '<div class="pmq-chats-group">Favorites</div>';
          html += favs.length ? favs.map(fn => {
            const hit = store.catalogModel(fn);
            return hit ? modelRow({ provider: hit.provider, id: hit.provider.toLowerCase() }, "Favorite", hit.model, null) : "";
          }).join("") : '<div class="pmq-mp-empty">Star a model to keep it within reach.</div>';
        }
        const recents = store.state.session.recentModels;
        if (recents.length && !filter && !railFilter) {
          html += '<div class="pmq-chats-group">Recent</div>';
          recents.forEach(rn => {
            const name = typeof rn === "string" ? rn : rn.model;
            const hit = store.catalogModel(name);
            if (hit) html += modelRow({ provider: hit.provider, id: hit.provider.toLowerCase() }, "Recent", hit.model, rn.accountId || null);
          });
        }
        let kbdN = 0;
        cat.forEach(p => {
          if (railFilter && p.id !== railFilter) return;
          p.accounts.forEach(acc => {
            const shown = p.models.filter(m => m.accounts.includes(acc.id))
              .filter(m => !filter || (m.name + " " + p.provider).toLowerCase().includes(filter));
            if (!shown.length) return;
            const activeAcc = acct.accountId === acc.id;
            const conn = store.connectionKindOf(acc);
            html += '<div class="pmq-mp-account' + (activeAcc ? " pmq-on" : "") + '" data-accsel="' + esc(acc.id) + '" role="button" tabindex="0" aria-label="Select account ' + esc(acc.label) + '">' +
              '<span class="pmq-mp-logo" data-logo="' + esc(p.id) + '"></span><span class="pmq-mp-acct-main"><span>' + esc(p.provider) + '</span><span class="pmq-mp-acct-sub">' + esc(acc.label) + " · " + esc(conn) + "</span></span>" +
              (activeAcc ? '<span class="pmq-mp-acct-active">Active</span><i data-ico="check" class="pmq-mp-check"></i>' : "") + "</div>";
            shown.forEach(m => {
              kbdN += 1;
              html += modelRow(p, acc.label, m, acc.id, kbdN <= 5 ? String(kbdN) : null);
            });
          });
          if (p.setupState) {
            const isInstall = p.setupState === "install-required";
            html += '<div class="pmq-mp-setup" data-setup="' + esc(p.setupState) + '"><i data-ico="warn"></i>' +
              '<span class="pmq-mp-setup-main"><span>' + esc(setupLabel(p.setupState, p.provider)) + "</span>" +
              (isInstall ? "<span>Installation and sign-in are separate steps.</span>" : "") +
              (p.sub ? "<span>" + esc(p.sub) + "</span>" : "") +
              (isInstall ? "<span>Host: this machine · Environment: native Windows</span>" : "") +
              "<span>Auto/On maintains approved installs; first acquisition only via your Install.</span></span>" +
              '<button class="pmq-btn pmq-btn-sm" type="button" data-setupopen="' + esc(p.setupopen || "") + '" data-setuprow="' + esc(p.id) + '" data-setupname="' + esc(p.provider) + '">' + (isInstall ? "Install" : "Open Settings") + "</button></div>";
          }
        });
        html += "</div></div>" +
          '<div class="pmq-mp-foot pmq-mp-foot-2">' +
          '<span class="pmq-mp-acctline">Account · ' + esc(acct.accountLabel) + " · " + esc(acct.connection) + "</span>" +
          (pd ? '<span class="pmq-mp-route pmq-warn">Requested ' + esc(pd.pending.provider) + "/" + esc(pd.pending.accountId || "default") + "/" + esc(pd.pending.model) + " · effective " + esc(c.provider) + "/" + esc(c.model) + " · awaiting decision</span>"
            : '<span class="pmq-mp-route">Route · ' + esc(c.provider) + " / " + esc(c.model) + (c.speed === "Fast" ? " · Fast" : "") + "</span>") +
          "</div>";
      } else {
        const m = panel.model;
        const p = panel.provider;
        html += '<div class="pmq-popup-head"><button class="pmq-mp-back" type="button" aria-label="Back to model list"><i data-ico="chevRight"></i></button><span>' + esc(m.name) + "</span></div>" +
          '<div class="pmq-popup-body pmq-mp-body">' +
          '<div class="pmq-chats-group">Reasoning effort</div>' +
          (m.effort || []).map(e2 => '<button class="pmq-menu-item pmq-mp-eff" type="button" data-effort="' + esc(e2) + '" aria-checked="' + (c.effort === e2) + '"><i data-ico="timer"></i><span>' + esc(e2) + "</span>" + (c.effort === e2 ? '<i data-ico="check"></i>' : "") + "</button>").join("") +
          (m.fast
            ? '<div class="pmq-chats-group">Speed</div><div class="pmq-mp-speed" role="group" aria-label="Speed">' +
              ["Normal", "Fast"].map(s => '<button type="button" data-speed="' + s + '" class="pmq-mp-speedbtn' + (c.speed === s ? " pmq-on" : "") + '" aria-pressed="' + (c.speed === s) + '">' + (s === "Fast" ? '<i data-ico="zap"></i>' : "") + s + "</button>").join("") + "</div>"
            : '<div class="pmq-mp-empty">Fast is capability-driven; this route does not offer it.</div>') +
          "</div>" +
          '<div class="pmq-mp-foot"><span class="pmq-mp-route">' + esc(p.provider) + " · " + esc(m.name) + " · " + esc(c.effort) + " · " + esc(c.speed) + '</span><button class="pmq-mp-done" type="button">Done</button></div>';
      }
      wrap.innerHTML = html;
      window.PMIcons.hydrate(wrap);
      wire();
      requestAnimationFrame(() => window.PMChatPopups.place(entry.el, entry.anchor, {}));
    }
    function wire() {
      const input = wrap.querySelector(".pmq-mp-search input");
      if (input) input.addEventListener("input", () => {
        filter = input.value.toLowerCase();
        render();
        const i = wrap.querySelector(".pmq-mp-search input");
        if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
      });
      wrap.querySelectorAll("[data-rail]").forEach(b => b.addEventListener("click", () => {
        railFilter = b.dataset.rail;
        render();
      }));
      wrap.querySelectorAll("[data-accsel]").forEach(r => r.addEventListener("click", () => {
        store.setAccount(r.dataset.accsel || null);
        render();
      }));
      wrap.querySelectorAll("[data-accsel]").forEach(r => r.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); r.click(); }
      }));
      wrap.querySelectorAll("[data-setupopen]").forEach(b => b.addEventListener("click", e => {
        e.stopPropagation();
        const row = b.dataset.setuprow;
        const resume = b.dataset.setupopen || ("setup-" + row);
        env.hostApi.toast("Installing " + b.dataset.setupname + " continues in Settings — provider row opens there");
        if (window.PMChatCommands) window.PMChatCommands.dispatch("cmd.shell.page", { page: "settings:provider", row: row, resume: resume }, { cataloged: false });
      }));
      wrap.querySelectorAll("[data-fav]").forEach(b => b.addEventListener("click", e => {
        e.stopPropagation();
        store.favoriteToggle(b.dataset.fav);
        render();
      }));
      wrap.querySelectorAll(".pmq-mp-row").forEach(r => r.addEventListener("click", () => {
        if (r.getAttribute("aria-disabled") === "true") return;
        const p = store.catalog().find(x => x.provider === r.dataset.prov);
        const m = p && p.models.find(x => x.name === r.dataset.model);
        if (p && m) pickModel(p, m, r.dataset.acc || null);
      }));
      wrap.querySelectorAll(".pmq-mp-row").forEach(r => r.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); r.click(); }
      }));
      const back = wrap.querySelector(".pmq-mp-back");
      if (back) back.addEventListener("click", () => { panel = null; render(); });
      const done = wrap.querySelector(".pmq-mp-done");
      if (done) done.addEventListener("click", () => env.popups.dismiss(entry));
      wrap.querySelectorAll("[data-effort]").forEach(b => b.addEventListener("click", () => { store.setThreadSettings(key, { effort: b.dataset.effort }); render(); }));
      wrap.querySelectorAll("[data-speed]").forEach(b => b.addEventListener("click", () => { store.setThreadSettings(key, { speed: b.dataset.speed }); render(); }));
    }
    function onKey(e) {
      if (!document.body.contains(wrap)) { document.removeEventListener("keydown", onKey, true); return; }
      if (panel || !(e.metaKey || e.ctrlKey)) return;
      if (!/^[1-5]$/.test(e.key)) return;
      const row = wrap.querySelector('.pmq-mp-row[data-kbd="' + e.key + '"]');
      if (!row) return;
      e.preventDefault();
      e.stopPropagation();
      row.click();
    }
    document.addEventListener("keydown", onKey, true);
    render();
    const un = store.subscribe(() => { if (document.body.contains(wrap)) render(); });
    if (root) bind(root, un);
    return entry;
  }

  function bsdChipClass(bsd) {
    if (bsd.mode === "off") return "pmq-bsd-off";
    if (bsd.mode === "on") return "pmq-bsd-on";
    return bsd.state === "evaluating" ? "pmq-bsd-active" : "pmq-bsd-auto";
  }
  function bsdStateDot(state) {
    if (state === "silent" || state === "advice" || state === "timeout" || state === "unavailable" || state === "quota") {
      return '<span class="pmq-bsd-dot" data-bsdst="' + esc(state) + '" title="BSD ' + esc(state) + '"></span>';
    }
    return "";
  }
  function bsdPopup(anchor, env) {
    const store = env.store;
    const key = store.activeKey();
    const bsd = store.bsdEffective(key);
    const modeItem = (mode, label, hint) => ({
      label, icon: mode === "off" ? "mute" : "sparkle", sub: hint,
      checked: bsd.mode === mode,
      onpick: () => store.bsdSet(mode, null)
    });
    const items = [
      modeItem("off", "Off", "No second opinion this thread"),
      modeItem("auto", "Auto — system default", "Evaluates quietly; speaks only when useful"),
      modeItem("on", "On", "Manual check every turn"),
      { sep: true },
      { label: "This turn", icon: "timer", sub: "Arms one turn, then reverts to thread scope", checked: bsd.scope === "turn", onpick: () => store.bsdSet(null, "turn") },
      { label: "This thread", icon: "chats", sub: "Applies to every turn in this thread", checked: bsd.scope === "thread", onpick: () => store.bsdSet(null, "thread") }
    ];
    env.popups.menu(anchor, items, { title: "Back Seat Driver · read-only advisor", width: 290 });
  }
  function setupStripHtml(store, key) {
    const eff = store.effectiveSettings(key);
    const g = store.catalog().find(p => p.provider === eff.provider);
    if (!g || !g.setupState) return "";
    const labels = {
      "update-available": "Provider update available · Settings",
      "waiting": "Waiting for current work",
      "update-failed": "Update failed; rolled back",
      "discovered": "Found existing installation — reusing.",
      "verified": "Verified publisher, version, architecture."
    };
    const label = g.setupState === "install-required"
      ? "Provider Setup Required — install from the official " + g.provider + " source."
      : (labels[g.setupState] || g.setupState);
    return '<div class="pmq-setupstrip" data-setup="' + esc(g.setupState) + '"><i data-ico="warn"></i><span>' + esc(label) + "</span></div>";
  }
  function selectorRow(env, root) {
    const el = document.createElement("div");
    el.className = "pmq-selrow";
    function render() {
      const key = env.store.activeKey();
      const s = env.store.effectiveSettings(key);
      const note = env.store.accessNote(key);
      const bsd = env.store.bsdEffective(key);
      const modeLabel = bsd.mode === "off" ? "Off" : bsd.mode === "on" ? "On" : "Auto";
      el.innerHTML =
        '<button class="pmq-sel" type="button" data-sel="persona" aria-label="Persona"><span class="pmq-sel-k">Persona</span><span class="pmq-sel-v">' + esc(s.persona) + '</span><i data-ico="chevDown"></i></button>' +
        '<button class="pmq-sel" type="button" data-sel="model" aria-label="Model"><span class="pmq-sel-k">Model</span><span class="pmq-sel-v">' + esc(s.model) + (s.speed === "Fast" ? " · Fast" : "") + " · " + esc(s.effort) + '</span><i data-ico="chevDown"></i></button>' +
        '<button class="pmq-sel" type="button" data-sel="mode" aria-label="Mode"><span class="pmq-sel-k">Mode</span><span class="pmq-sel-v">' + esc(s.mode) + '</span><i data-ico="chevDown"></i></button>' +
        '<button class="pmq-sel" type="button" data-sel="access" aria-label="Access"><span class="pmq-sel-k">Access</span><span class="pmq-sel-v">' + esc(s.access) + (note ? " · limited" : "") + '</span><i data-ico="chevDown"></i></button>' +
        '<button class="pmq-sel pmq-sel-bsd ' + bsdChipClass(bsd) + '" type="button" data-sel="bsd" aria-label="Back Seat Driver"><span class="pmq-sel-k">BSD</span><span class="pmq-sel-v">' + esc(modeLabel) + "</span>" + bsdStateDot(bsd.state) + '<i data-ico="chevDown"></i></button>' +
        setupStripHtml(env.store, key);
      window.PMIcons.hydrate(el);
    }
    render();
    el.addEventListener("click", e => {
      const b = e.target.closest("[data-sel]");
      if (!b) return;
      if (b.dataset.sel === "persona") personaPopup(b, env);
      else if (b.dataset.sel === "model") modelPopup(b, env, root);
      else if (b.dataset.sel === "mode") modePopup(b, env);
      else if (b.dataset.sel === "bsd") bsdPopup(b, env);
      else accessPopup(b, env);
    });
    bind(root, env.store.subscribe(render));
    return el;
  }

  function ringButton(env, root) {
    const el = document.createElement("button");
    el.className = "pmq-ring";
    el.type = "button";
    el.setAttribute("aria-label", "Context status");
    el.setAttribute("aria-expanded", "false");
    function render() {
      const key = env.store.activeKey();
      const msgs = env.store.messages(key);
      let used = 0, limit = 128000;
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].runtime) { used = msgs[i].runtime.contextUsed; limit = msgs[i].runtime.contextLimit; break; }
      }
      const frac = Math.min(1, used / limit);
      const C = 2 * Math.PI * 5.6;
      el.innerHTML = '<svg viewBox="0 0 15 15" class="pmq-ring-svg" aria-hidden="true">' +
        '<circle cx="7.5" cy="7.5" r="5.6" class="pmq-ring-track"/>' +
        '<circle cx="7.5" cy="7.5" r="5.6" class="pmq-ring-arc" stroke-dasharray="' + (C * frac).toFixed(1) + " " + C.toFixed(1) + '"/>' +
        "</svg>";
    }
    render();
    bind(root, env.store.subscribe(render));
    el.addEventListener("click", () => {
      const key = env.store.activeKey();
      const msgs = env.store.messages(key);
      let used = 0, limit = 128000;
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].runtime) { used = msgs[i].runtime.contextUsed; limit = msgs[i].runtime.contextLimit; break; }
      }
      const adm = env.store.admissionOf(key);
      const wrap = document.createElement("div");
      wrap.className = "pmq-ctx-pop";
      wrap.innerHTML = '<div class="pmq-popup-head"><i data-ico="lens"></i>Context</div>' +
        '<div class="pmq-popup-body">' +
        '<div class="pmq-ctx-meter"><span class="pmq-ctx-fill" style="width:' + Math.round(100 * used / limit) + '%"></span></div>' +
        '<div class="pmq-ctx-row"><span>Context used</span><b>' + window.PMFmt.context(used, limit) + "</b></div>" +
        '<div class="pmq-ctx-row"><span>Messages stored</span><b>' + msgs.length + "</b></div>" +
        '<div class="pmq-ctx-row"><span>Cache</span><b>' + esc(adm.cache.state) + "</b></div>" +
        '<div class="pmq-ctx-note">' + esc(adm.cache.note || "Detailed usage records are owned by the parallel Usage redesign.") + "</div>" +
        '<button class="pmq-menu-item" type="button" data-compact><i data-ico="compact"></i><span>Compact Now</span></button>' +
        '<button class="pmq-menu-item" type="button" data-usage><i data-ico="editorOpen"></i><span>Open Usage</span></button>' +
        "</div>";
      window.PMIcons.hydrate(wrap);
      wrap.querySelector("[data-compact]").addEventListener("click", () => env.store.compactNow(key));
      wrap.querySelector("[data-usage]").addEventListener("click", () => env.hostApi.toast("Usage page is owned by the parallel Usage redesign"));
      env.popups.open(el, wrap, { width: 250 });
    });
    return el;
  }

  function lensButton(env, root) {
    const el = document.createElement("button");
    el.className = "pmq-btn pmq-btn-icon pmq-lens-btn";
    el.type = "button";
    el.setAttribute("aria-label", "Context Lens");
    el.innerHTML = '<i data-ico="lens"></i>';
    window.PMIcons.hydrate(el);
    function render() {
      const lens = env.store.thread(env.store.activeKey()).lens;
      const active = lens.mode !== "off";
      el.classList.toggle("pmq-lens-active", active);
      const n = lens.applied.mute.length + lens.applied.focus.length + lens.applied.subcompact.length + lens.selected.length;
      el.setAttribute("aria-label", "Context Lens" + (active ? " · " + lens.mode + (n ? " · " + n + " messages" : "") : ""));
    }
    render();
    bind(root, env.store.subscribe(render));
    el.addEventListener("click", () => {
      const st = env.store.thread(env.store.activeKey());
      const lens = st.lens;
      const modeItem = (mode, label, icon, hint) => ({
        label, icon, sub: hint,
        checked: lens.mode === mode,
        onpick: () => env.store.lensSetMode(mode)
      });
      const items = [
        modeItem("mute", "Mute", "mute", "Applies immediately"),
        modeItem("focus", "Focus", "focus", "Applies immediately"),
        modeItem("subcompact", "Subcompact", "compact", "Select up to 25, then Apply"),
        { sep: true },
        { label: "Compact Now", icon: "compact", sub: "Compacts model-facing context; transcript unchanged", onpick: () => env.store.compactNow(env.store.activeKey()) },
        { label: "What PM included and left out", icon: "lens", sub: "Context Lens breakdown", onpick: () => openLensBreakdown(el, env) },
        { sep: true },
        modeItem("off", "Turn Off", "lensOff", "Clears all shaping")
      ];
      const entry = env.popups.menu(el, items, { title: "Context Lens", width: 270, onrender: body => {
        const counts = [];
        if (lens.applied.mute.length) counts.push(lens.applied.mute.length + " muted");
        if (lens.applied.focus.length) counts.push(lens.applied.focus.length + " focused");
        if (lens.applied.subcompact.length) counts.push(lens.applied.subcompact.length + " subcompacted");
        if (lens.selected.length) counts.push(lens.selected.length + " selected");
        if (counts.length) {
          const d = document.createElement("div");
          d.className = "pmq-lens-counts";
          d.textContent = counts.join(" · ");
          body.appendChild(d);
        }
        if (lens.mode === "subcompact" && lens.selected.length) {
          const apply = document.createElement("button");
          apply.className = "pmq-menu-item pmq-lens-apply";
          apply.type = "button";
          apply.innerHTML = '<i data-ico="check"></i><span>Apply to ' + lens.selected.length + " of 25 max</span>";
          window.PMIcons.hydrate(apply);
          apply.addEventListener("click", () => { env.store.lensApplySubcompact(); entry.renderItems(""); });
          body.appendChild(apply);
        }
        if (env.store.lensHasShaping()) {
          const clear = document.createElement("button");
          clear.className = "pmq-menu-item pmq-menu-danger";
          clear.type = "button";
          clear.innerHTML = '<i data-ico="close"></i><span>Clear all shaping</span>';
          window.PMIcons.hydrate(clear);
          clear.addEventListener("click", () => { env.store.lensSetMode("off"); env.popups.dismiss(entry); });
          body.appendChild(clear);
        }
      } });
    });
    return el;
  }

  function searchButton(env, root) {
    const el = document.createElement("button");
    el.className = "pmq-btn pmq-btn-icon pmq-search-btn";
    el.type = "button";
    el.setAttribute("aria-label", "Search messages");
    el.innerHTML = '<i data-ico="search"></i>';
    window.PMIcons.hydrate(el);
    el.addEventListener("click", () => openSearch(el, env, root));
    return el;
  }

  function openSearch(anchor, env, root) {
    let scope = "thread";
    const wrap = document.createElement("div");
    wrap.className = "pmq-search-pop";
    wrap.innerHTML =
      '<div class="pmq-search-bar"><i data-ico="search"></i><input type="text" placeholder="Search messages" spellcheck="false" aria-label="Search messages">' +
      '<button class="pmq-btn pmq-btn-icon" type="button" data-close aria-label="Close search"><i data-ico="close"></i></button></div>' +
      '<div class="pmq-search-scopes" role="tablist">' +
      '<button class="pmq-scope pmq-active" type="button" data-scope="thread" role="tab" aria-selected="true">Current Thread</button>' +
      '<button class="pmq-scope" type="button" data-scope="all" role="tab" aria-selected="false">All Threads</button>' +
      "</div>" +
      '<div class="pmq-search-return" hidden><i data-ico="history"></i><span>Return to prior position</span></div>' +
      '<div class="pmq-search-results pmq-scroll"></div>';
    window.PMIcons.hydrate(wrap);
    const input = wrap.querySelector("input");
    const results = wrap.querySelector(".pmq-search-results");
    const returnRow = wrap.querySelector(".pmq-search-return");

    function renderReturn() {
      const st = env.store.thread(env.store.activeKey());
      returnRow.hidden = !st.searchReturn;
    }

    function render() {
      const q = input.value;
      renderReturn();
      if (!q.trim()) {
        results.innerHTML = '<div class="pmq-empty">Search indexes every stored message, including older history that is not rendered yet.</div>';
        return;
      }
      if (scope === "thread") {
        const rs = env.store.search(q, "thread", env.store.activeKey());
        results.innerHTML = rs.length ? rs.map(r => resultRow(r, false)).join("") :
          '<div class="pmq-empty">No matches in this thread.</div>';
      } else {
        const groups = env.store.groupedSearch(q);
        results.innerHTML = groups.length ? groups.map(g =>
          '<div class="pmq-srgroup">' +
          '<div class="pmq-srgroup-head">' + statusDot(g.thread.threadState) + esc(g.thread.title) +
          '<span class="pmq-srgroup-n">' + g.total + "</span></div>" +
          g.results.map(r => resultRow(r, true)).join("") + "</div>"
        ).join("") : '<div class="pmq-empty">No matches across all threads.</div>';
      }
      window.PMIcons.hydrate(results);
    }

    function resultRow(r, showThread) {
      const start = Math.max(0, r.matchStart - 42);
      const prefix = start > 0 ? 1 : 0;
      const relStart = r.matchStart - start + prefix;
      const relEnd = Math.min(r.matchEnd - start + prefix, r.snippet.length);
      const snip = (relStart < 0 || relEnd <= relStart)
        ? esc(r.snippet)
        : esc(r.snippet.slice(0, relStart)) + '<mark class="pmq-srmark">' + esc(r.snippet.slice(relStart, relEnd)) + "</mark>" + esc(r.snippet.slice(relEnd));
      return '<div class="pmq-srrow" role="button" tabindex="0" data-msg="' + esc(r.msgId) + '" data-thread="' + esc(r.threadKey) + '">' +
        '<span class="pmq-srrow-snip">' + snip + "</span>" +
        '<span class="pmq-srrow-meta">' + (showThread ? "" : "Open conversation") + "</span>" +
        '<span class="pmq-srrow-acts">' +
        '<button class="pmq-btn pmq-btn-sm" type="button" data-sract="add" title="Add passage to context">Add passage</button>' +
        '<button class="pmq-btn pmq-btn-sm" type="button" data-sract="branch" title="Branch from this point">Branch</button>' +
        '<button class="pmq-btn pmq-btn-sm" type="button" data-sract="copy" title="Copy link">Copy link</button>' +
        "</span></div>";
    }

    input.addEventListener("input", render);
    wrap.querySelector("[data-close]").addEventListener("click", () => env.popups.closeActive());
    wrap.querySelectorAll("[data-scope]").forEach(b => {
      b.addEventListener("click", () => {
        scope = b.dataset.scope;
        wrap.querySelectorAll("[data-scope]").forEach(x => {
          x.classList.toggle("pmq-active", x === b);
          x.setAttribute("aria-selected", x === b ? "true" : "false");
        });
        render();
      });
    });
    returnRow.addEventListener("click", () => {
      const st = env.store.thread(env.store.activeKey());
      const ret = st.searchReturn;
      if (ret && window.PMChatNav) {
        window.PMChatNav.jumpToMessage(ret.threadKey, ret.msgId, null, true);
        env.store.mutate(() => { st.searchReturn = null; });
        renderReturn();
      }
    });
    results.addEventListener("click", e => {
      const row = e.target.closest("[data-msg]");
      if (!row) return;
      const act = e.target.closest("[data-sract]");
      if (act) {
        e.stopPropagation();
        const a = act.dataset.sract;
        if (a === "add") {
          env.store.contextSourceAdd(env.store.activeKey(), row.dataset.thread, row.dataset.msg);
          env.hostApi.toast("Passage added to this thread's context");
        } else if (a === "branch") {
          const id = env.store.branchFrom(row.dataset.thread, row.dataset.msg, { switchTo: true });
          if (id) env.hostApi.toast("Branched from that point");
        } else if (a === "copy") {
          const link = location.origin + location.pathname + "?dt=" + encodeURIComponent(row.dataset.thread) + "#" + encodeURIComponent(row.dataset.msg);
          try { navigator.clipboard.writeText(link); } catch (err) {}
          env.hostApi.toast("Link copied to clipboard");
        }
        return;
      }
      if (window.PMChatNav) window.PMChatNav.jumpToMessage(row.dataset.thread, row.dataset.msg, null, false);
    });

    const entry = env.popups.open(anchor, wrap, { width: 330, cls: "pmq-search-popup" });
    render();
    if (window.PMChatCommands) window.PMChatCommands.dispatch("cmd.chat.search.open", { scope: "thread" }, { cataloged: false });
    requestAnimationFrame(() => window.PMChatPopups.place(entry.el, entry.anchor, {}));
    setTimeout(() => input.focus(), 40);
    const un = env.store.subscribe(() => { if (document.body.contains(wrap)) render(); });
    if (root) bind(root, un);
    return entry;
  }

  function kebabButton(ctx, env, root, winId) {
    const el = document.createElement("button");
    el.className = "pmq-btn pmq-btn-icon";
    el.type = "button";
    el.setAttribute("aria-label", "More options");
    el.innerHTML = '<i data-ico="kebab"></i>';
    window.PMIcons.hydrate(el);
    el.addEventListener("click", () => {
      const docked = env.mountMode === "docked";
      env.popups.menu(el, [
        { label: "Duplicate thread", icon: "copy", onpick: () => env.hostApi.toast("Duplicate is a production lifecycle action; stubbed in this concept") },
        { label: "Archive thread", icon: "folder", onpick: () => env.hostApi.toast("Archive is a production lifecycle action; stubbed in this concept") },
        { sep: true },
        docked
          ? { label: "Pop out", icon: "popout", onpick: () => ctx.onRequestPopout() }
          : { label: "Dock", icon: "dock", onpick: () => ctx.onRequestDock() },
        { label: "Close to docked", icon: "close", disabled: docked, onpick: () => ctx.onRequestClose() },
        { sep: true },
        {
          label: env.store.state.session.keepThoughtExpanded ? "Keep current thought stream open: On" : "Keep current thought stream open: Off",
          icon: "sparkle",
          onpick: () => env.store.setSession({ keepThoughtExpanded: !env.store.state.session.keepThoughtExpanded })
        },
        {
          label: env.store.thread(env.store.activeKey()).spellDisabled ? "Spellcheck for this thread: Off" : "Spellcheck for this thread: On",
          icon: "edit",
          sub: "Passive underline only; never autocorrects",
          onpick: () => env.store.spellSetDisabled(env.store.activeKey(), !env.store.thread(env.store.activeKey()).spellDisabled)
        }
      ], { title: window.PMChatRegistry.windowLabel(winId), width: 250 });
    });
    return el;
  }

  function openLensBreakdown(anchor, env) {
    const store = env.store;
    const key = store.activeKey();
    const adm = store.admissionOf(key);
    const includedRows = adm.included.map((x, idx) =>
      '<div class="pmq-ctx-row pmq-ctx-inc' + (x.removed ? " pmq-removed" : "") + '" data-admidx="' + idx + '">' +
      '<span class="pmq-ctx-inc-main">' + esc(x.label) + '<span class="pmq-ctx-inc-meta">' + esc(x.kind) + " · " + esc(x.size) + " · from " + esc(x.provenance) + "</span></span>" +
      (x.removable && !x.removed ? '<button class="pmq-btn pmq-btn-sm" type="button" data-admremove="' + idx + '">Remove</button>' : (x.removed ? '<span class="pmq-ctx-inc-gone">Removed</span>' : "")) +
      "</div>"
    ).join("");
    const omittedRows = adm.omitted.map(x =>
      '<div class="pmq-ctx-row"><span>' + esc(x.label) + '<span class="pmq-ctx-inc-meta">' + esc(x.reason) + "</span></span></div>"
    ).join("");
    const wrap = document.createElement("div");
    wrap.className = "pmq-ctx-pop pmq-ctx-lens";
    wrap.innerHTML = '<div class="pmq-popup-head"><i data-ico="lens"></i>Context Lens · receipt</div>' +
      '<div class="pmq-popup-body pmq-scroll">' +
      '<div class="pmq-ctx-row pmq-ctx-pressure"><span>Context pressure</span><b>' + Math.round((adm.pressure || 0) * 100) + "%</b></div>" +
      '<div class="pmq-chats-group">Included</div>' + includedRows +
      '<div class="pmq-chats-group">Left out</div>' + omittedRows +
      '<div class="pmq-ctx-note">Receipt of what PM included and left out. Raw secrets and the FileSafe rulebook are never shown.</div>' +
      "</div>";
    window.PMIcons.hydrate(wrap);
    const entry = env.popups.open(anchor, wrap, { width: 330 });
    wrap.querySelectorAll("[data-admremove]").forEach(b => b.addEventListener("click", () => {
      store.admissionRemove(key, Number(b.dataset.admremove));
      env.popups.dismiss(entry);
      openLensBreakdown(anchor, env);
    }));
    return entry;
  }

  function artIcon(a) {
    const k = a.kind || a.type || "document";
    if (k === "multi_file_diff" || k === "data") return "diff";
    if (k === "visual_preview" || k === "browser capture") return "globe";
    if (k === "test_report") return "flask";
    return "file";
  }

  function artifactBodyHtml(env, key, art, entry) {
    const store = env.store;
    if (entry.status === "loading") {
      return '<div class="pmq-art-load"><span class="pmq-art-loadbar"></span><span class="pmq-art-loadtxt">Preparing ' + esc(art.title) + "…</span></div>";
    }
    if (entry.status === "error") {
      return '<div class="pmq-art-err"><i data-ico="warn"></i><span>The preview service failed to render this artifact.</span>' +
        '<button class="pmq-btn" type="button" data-artretry="' + esc(art.id) + '">Retry</button></div>';
    }
    const k = art.kind || art.type || "document";
    let inner = "";
    if (k === "multi_file_diff" || k === "data") {
      const files = art.files || (store.diffGroups(key)[0] && store.diffGroups(key)[0].files) || [];
      inner = '<div class="pmq-art-diff">' + files.map(f =>
        '<div class="pmq-art-diffrow"><i data-ico="file"></i><span class="pmq-art-path">' + esc(f.path) + "</span>" +
        '<span class="pmq-art-add">+' + (f.added || 0) + '</span><span class="pmq-art-del">−' + (f.removed || 0) + "</span></div>"
      ).join("") + "</div>";
    } else if (k === "visual_preview" || k === "browser capture") {
      inner = '<div class="pmq-art-prev"><svg viewBox="0 0 200 120" aria-hidden="true">' +
        '<rect x="4" y="4" width="192" height="18" rx="4" class="pmq-art-svg-a"/>' +
        '<rect x="4" y="28" width="58" height="88" rx="4" class="pmq-art-svg-b"/>' +
        '<rect x="68" y="28" width="128" height="40" rx="4" class="pmq-art-svg-c"/>' +
        '<rect x="68" y="74" width="80" height="42" rx="4" class="pmq-art-svg-b"/>' +
        '<rect x="154" y="74" width="42" height="42" rx="4" class="pmq-art-svg-c"/></svg>' +
        '<span class="pmq-art-cap">' + esc(art.caption || "Rendered preview of the current design pass") + "</span></div>";
    } else if (k === "test_report") {
      const rows = art.rows || [
        ["Pinned history geometry", "pass"], ["Question flow semantics", "pass"], ["Reduced motion end states", "pass"],
        ["Artifact workspace coexistence", "pass"], ["Narrow-width readability", "pass"]
      ];
      inner = '<div class="pmq-art-tests">' + rows.map(r =>
        '<div class="pmq-art-testrow" data-res="' + r[1] + '"><i data-ico="' + (r[1] === "pass" ? "check" : "warn") + '"></i><span>' + esc(r[0]) + '</span><b>' + r[1] + "</b></div>"
      ).join("") + "</div>";
    } else {
      const paras = art.paras || [
        "Requested versus effective provider routes are mapped per account, with favorites and recents first.",
        "Access profiles stay separate from conversation mode; limiting modes annotate the effective profile.",
        "Pinned history and the artifact workspace share one geometry governor and never overlay the transcript.",
        "Thread-local settings freeze for running goals; broader changes require explicit scope."
      ];
      inner = '<div class="pmq-art-doc">' + paras.map(p2 => "<p>" + esc(p2) + "</p>").join("") + "</div>";
    }
    return '<div class="pmq-art-content" data-kind="' + esc(k) + '">' + inner +
      '<div class="pmq-art-meta"><i data-ico="history"></i><span>' + esc(art.projectPath || "Tastebook") + '</span><span class="pmq-art-ver">v' + (entry.version || 1) + " · " + esc(entry.status) + "</span></div></div>";
  }

  /* One governor + two sibling regions per window: pinned history (full/compact/micro)
     and the left artifact workspace (full/compact/sliver/chip). Neither may overlay the
     transcript while pinned/open; the governor demotes forms before chat width is touched. */
  function makeSideRegions(env, winId, opts) {
    const store = env.store;
    opts = opts || {};
    const pinFullW = opts.pinFullW || 236;

    const col = document.createElement("div");
    col.className = "pmq-pincol";
    col.innerHTML = '<div class="pmq-pincol-head"><i data-ico="chats"></i><span>Chats</span>' +
      '<button class="pmq-pincol-unpin" type="button" aria-label="Unpin history" title="Unpin"><i data-ico="pin"></i></button></div>' +
      '<div class="pmq-pincol-body pmq-scroll"></div>';
    col.querySelector(".pmq-pincol-unpin").addEventListener("click", () => store.setPin(winId, false));
    wireChats(col.querySelector(".pmq-pincol-body"), env);

    const art = document.createElement("aside");
    art.className = "pmq-artws";
    art.setAttribute("aria-label", "Artifact workspace");
    art.innerHTML = '<div class="pmq-artws-head"><i data-ico="layers"></i><span class="pmq-artws-title">Artifacts</span>' +
      '<span class="pmq-artws-ver"></span>' +
      '<button class="pmq-artws-close" type="button" aria-label="Close artifact workspace"><i data-ico="close"></i></button></div>' +
      '<div class="pmq-artws-tabs"></div>' +
      '<div class="pmq-artws-body pmq-scroll"></div>';
    art.querySelector(".pmq-artws-close").addEventListener("click", () => store.artClose(winId));
    art.querySelector(".pmq-artws-tabs").addEventListener("click", e => {
      const t = e.target.closest("[data-arttab]");
      if (t) store.artSwitch(winId, t.dataset.arttab);
      const r = e.target.closest("[data-artretry]");
      if (r) store.artSetStatus(store.activeKey(), r.dataset.artretry, "loading", false);
    });
    art.querySelector(".pmq-artws-body").addEventListener("click", e => {
      const r = e.target.closest("[data-artretry]");
      if (r) store.artSetStatus(store.activeKey(), r.dataset.artretry, "loading", false);
    });

    let chipEl = null;
    let lastGov = null;

    function budget() {
      const chatW = env.widthPx || 750;
      if (env.mountMode === "popout") return Math.max(0, window.innerWidth - 60 - chatW);
      const shellEl = document.querySelector(".pmq-shell");
      if (!shellEl) return 900;
      const railEl = shellEl.querySelector(".pmq-rail");
      const railW = shellEl.dataset.rail === "closed" ? 0 : (railEl ? railEl.offsetWidth : 56);
      return Math.max(0, shellEl.clientWidth - railW - 30 - chatW);
    }

    function govern() {
      const b = budget();
      const pinned = store.isPinned(winId);
      const a = store.artWs(winId);
      const chatW = env.widthPx || 750;
      let pinExtra = 0, artExtra = 0, pinMode = null, artMode = null;
      if (pinned) {
        const wantArt = a.open ? 190 : 0;
        if (chatW >= 820 && b >= pinFullW + wantArt) { pinExtra = pinFullW; pinMode = "full"; }
        else if (b >= 116 + wantArt) { pinExtra = 100; pinMode = "compact"; }
        else { pinExtra = 44; pinMode = "micro"; }
      }
      if (a.open) {
        const left = b - pinExtra;
        if (left >= 500) { artExtra = 320; artMode = "full"; }
        else if (left >= 230) { artExtra = 190; artMode = "compact"; }
        else if (left >= 48) { artExtra = 44; artMode = "sliver"; }
        else { artExtra = 0; artMode = "chip"; }
      }
      store.setPinMode(winId, pinMode || "full");
      if (env.setPinLayout) env.setPinLayout(pinExtra, pinned && pinExtra > 0 && b < pinExtra + artExtra + 260);
      if (env.setArtLayout) env.setArtLayout(artExtra);
      lastGov = { pinMode, artMode, pinExtra, artExtra };
      return lastGov;
    }

    function defaultPinBody(body, m) {
      const threads = store.allThreads();
      body.innerHTML = threads.map(t => {
        const meta = store.statusForThread(t, store.isRunning(t.id));
        const ini = esc((t.title || "?").charAt(0).toUpperCase());
        if (m === "micro") {
          return '<button class="pmq-pinmicro" type="button" data-thread="' + t.id + '" title="' + esc(t.title) + '">' + statusGlyph(meta) + ini + "</button>";
        }
        return '<button class="pmq-pincompact" type="button" data-thread="' + t.id + '">' +
          statusGlyph(meta) +
          '<span class="pmq-pincompact-main"><span class="pmq-pincompact-t">' + esc(threadTitle(env, t.id)) + "</span>" +
          '<span class="pmq-pincompact-m">' + esc(window.PMFmt.ago(t.updatedAt)) + "</span></span></button>";
      }).join("");
      window.PMIcons.hydrate(body);
    }

    function syncPin() {
      const pinned = store.isPinned(winId);
      const g = lastGov || govern();
      if (!pinned) {
        if (col.isConnected) col.remove();
      } else {
        if (!col.isConnected && opts.pinAnchor) opts.pinAnchor().before(col);
        if (!col.isConnected) return;
        const m = g.pinMode || "full";
        col.dataset.mode = m;
        col.classList.toggle("pmq-pincol--compact", m === "compact");
        col.classList.toggle("pmq-pincol--micro", m === "micro");
        const body = col.querySelector(".pmq-pincol-body");
        if (m === "full") {
          body.innerHTML = chatsRows(env);
          window.PMIcons.hydrate(body);
        } else if (m === "compact" && opts.renderPinCompact) {
          opts.renderPinCompact(env, body);
        } else if (m === "micro" && opts.renderPinMicro) {
          opts.renderPinMicro(env, body);
        } else {
          defaultPinBody(body, m);
        }
      }
      if (opts.onPinSync) opts.onPinSync(pinned, pinned ? (lastGov ? lastGov.pinMode : "full") : null);
    }

    function removeChip() {
      if (chipEl && chipEl.isConnected) { chipEl.remove(); chipEl = null; }
    }

    function syncArt() {
      const a = store.artWs(winId);
      const g = lastGov || govern();
      const key = store.activeKey();
      const arts = store.threadArtifacts(key);
      if (!a.open || !arts.length) {
        if (art.isConnected) art.remove();
        removeChip();
        return;
      }
      if (g.artMode === "chip") {
        if (art.isConnected) art.remove();
        if (opts.artChipSlot) {
          if (!chipEl || !chipEl.isConnected) {
            chipEl = document.createElement("button");
            chipEl.className = "pmq-artchip";
            chipEl.type = "button";
            chipEl.setAttribute("aria-label", "Artifacts");
            chipEl.addEventListener("click", () => {
              env.popups.menu(chipEl, arts.map(x => ({
                label: x.title, icon: artIcon(x), checked: a.activeId === x.id,
                sub: store.artStatusOf(key, x.id),
                onpick: () => store.artSwitch(winId, x.id)
              })), { title: "Artifacts · transient at this width", width: 260 });
            });
            const slot = opts.artChipSlot();
            if (slot) slot.appendChild(chipEl);
          }
          chipEl.innerHTML = '<i data-ico="layers"></i><span>' + arts.length + "</span>";
          window.PMIcons.hydrate(chipEl);
        }
        return;
      }
      removeChip();
      if (!art.isConnected) {
        const anchor = opts.artAnchor ? opts.artAnchor() : (col.isConnected ? col : (opts.pinAnchor ? opts.pinAnchor() : null));
        if (anchor) anchor.before(art);
      }
      if (!art.isConnected) return;
      art.dataset.mode = g.artMode;
      art.dataset.variant = opts.artVariant || "inspector";
      const activeId = a.activeId && arts.some(x => x.id === a.activeId) ? a.activeId : arts[0].id;
      const act = arts.find(x => x.id === activeId);
      const entry = store.artEntry(key, act.id);
      art.querySelector(".pmq-artws-title").textContent = g.artMode === "sliver" ? "Artifacts" : act.title;
      art.querySelector(".pmq-artws-ver").textContent = entry.status === "ready" ? "v" + (entry.version || 1) : entry.status;
      const tabs = art.querySelector(".pmq-artws-tabs");
      tabs.innerHTML = arts.map(x =>
        '<button class="pmq-artws-tab' + (x.id === activeId ? " pmq-on" : "") + '" type="button" data-arttab="' + esc(x.id) + '" aria-label="' + esc(x.title) + '">' +
        '<i data-ico="' + artIcon(x) + '"></i>' + (g.artMode === "sliver" ? "" : "<span>" + esc(x.title) + "</span>") +
        (store.artStatusOf(key, x.id) !== "ready" ? '<span class="pmq-artws-dot" data-st="' + store.artStatusOf(key, x.id) + '"></span>' : "") +
        "</button>"
      ).join("");
      art.querySelector(".pmq-artws-body").innerHTML = g.artMode === "sliver" ? "" : artifactBodyHtml(env, key, act, entry);
      window.PMIcons.hydrate(art);
    }

    function sync() {
      govern();
      syncPin();
      syncArt();
    }

    let ro = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => sync());
      const shellEl = document.querySelector(".pmq-shell");
      if (shellEl) ro.observe(shellEl);
    }
    const un = store.subscribe(() => sync());
    bind(opts.root || document.documentElement, un);
    if (ro) bind(opts.root || document.documentElement, () => ro.disconnect());

    sync();
    return { col, art, sync, govern, get modes() { return lastGov; } };
  }

  function mountChromeLabel(env, winId) {
    const el = document.createElement("span");
    el.className = "pmq-mountlabel";
    el.textContent = env.mountMode === "popout" ? "Pop-out" : "Docked";
    return el;
  }

  function pinState(env, winId) {
    if (env && env.store && typeof env.store.isPinned === "function") return env.store.isPinned(winId);
    return !!(env && env.isPinned && env.isPinned());
  }

  function pinToggle(env, winId) {
    if (env && env.store && typeof env.store.togglePin === "function") env.store.togglePin(winId);
    else if (env && env.togglePin) env.togglePin();
  }

  return {
    bind, dispose, badge, chatsRows, chatsPopup, chatsInline, titleEditor,
    selectorRow, ringButton, lensButton, searchButton, openSearch, kebabButton,
    personaPopup, modelPopup, modePopup, accessPopup, mountChromeLabel, statusDot, statusGlyph, threadTitle,
    isPinned: pinState, togglePin: pinToggle, openRowMenu, startRowRename, wireChats,
    makeSideRegions, artifactBodyHtml, artIcon, openLensBreakdown,
    PERSONAS, MODES, EFFORTS
  };
})();
