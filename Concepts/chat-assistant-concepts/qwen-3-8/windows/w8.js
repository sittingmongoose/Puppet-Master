(() => {
  const ID = "w8";
  const kit = window.PMChatWindowKit;
  const esc = window.PMFmt.esc;

  function watchSprouts(root, ox, oy) {
    const apply = el => {
      const vy = oy || el.style.getPropertyValue("--sprout-oy") || "0%";
      el.style.transformOrigin = ox + " " + vy;
    };
    const mo = new MutationObserver(muts => {
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (!n || n.nodeType !== 1) continue;
          if (n.classList && n.classList.contains("pmq-popup")) apply(n);
          if (n.querySelectorAll) n.querySelectorAll(".pmq-popup").forEach(apply);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    kit.bind(root, () => mo.disconnect());
  }

  function mount(hostEl, ctx) {
    const env = ctx.env;
    hostEl.classList.add("pmq-w8");
    hostEl.innerHTML = "";

    const root = document.createElement("div");
    root.className = "pmq-w8-root";
    hostEl.appendChild(root);

    const stacks = document.createElement("div");
    stacks.className = "pmq-w8-stacks";

    let openPanel = null;
    const stripBtns = {};
    const shells = {};
    const panels = {};
    const hints = {};

    function makeStrip(key, label) {
      const unit = document.createElement("div");
      unit.className = "pmq-w8-unit pmq-w8-unit-" + key;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pmq-w8-strip";
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", "pmq-w8-panel-" + key);
      btn.innerHTML = '<span class="pmq-w8-strip-label">' + esc(label) + "</span>" +
        '<span class="pmq-w8-strip-prev"></span><span class="pmq-w8-grip"><i></i><i></i></span>' +
        '<span class="pmq-w8-strip-hint"></span>';
      btn.addEventListener("click", () => {
        openPanel = openPanel === key ? null : key;
        syncPanels();
      });

      const panel = document.createElement("div");
      panel.className = "pmq-w8-panel pmq-w8-panel-" + key;
      panel.id = "pmq-w8-panel-" + key;
      const panelIn = document.createElement("div");
      panelIn.className = "pmq-w8-panel-in";
      panel.appendChild(panelIn);

      unit.appendChild(btn);
      unit.appendChild(panel);
      stacks.appendChild(unit);
      stripBtns[key] = btn;
      shells[key] = panel;
      panels[key] = panelIn;
      hints[key] = btn.querySelector(".pmq-w8-strip-hint");
    }

    function syncPanels() {
      Object.keys(shells).forEach(key => {
        const open = openPanel === key;
        stripBtns[key].setAttribute("aria-expanded", open ? "true" : "false");
        stripBtns[key].classList.toggle("pmq-open", open);
        shells[key].classList.toggle("pmq-open", open);
      });
    }

    makeStrip("threads", "Threads");
    makeStrip("context", "Context");
    makeStrip("tools", "Tools");

    panels.threads.appendChild(kit.chatsInline(env, root, { cls: "pmq-w8-chats" }));

    const threadsPin = document.createElement("button");
    threadsPin.type = "button";
    threadsPin.className = "pmq-w8-pinbtn";
    threadsPin.setAttribute("aria-label", "Pin history panel");
    threadsPin.setAttribute("aria-pressed", "false");
    threadsPin.innerHTML = '<i data-ico="pin"></i>';
    window.PMIcons.hydrate(threadsPin);
    threadsPin.addEventListener("click", () => env.store.setPin(ID, !env.store.isPinned(ID)));
    stripBtns.threads.parentNode.appendChild(threadsPin);

    const ctxRow = document.createElement("div");
    ctxRow.className = "pmq-w8-ctxrow";
    ctxRow.appendChild(kit.selectorRow(env, root));
    ctxRow.appendChild(kit.ringButton(env, root));
    ctxRow.appendChild(kit.lensButton(env, root));
    panels.context.appendChild(ctxRow);

    const toolsRow = document.createElement("div");
    toolsRow.className = "pmq-w8-toolsrow";
    toolsRow.appendChild(kit.searchButton(env, root));
    toolsRow.appendChild(kit.kebabButton(ctx, env, root, ID));
    toolsRow.appendChild(kit.badge(env, ID));
    panels.tools.appendChild(toolsRow);

    const toolsPrevText = document.createElement("span");
    toolsPrevText.className = "pmq-w8-prev-text";
    toolsPrevText.textContent = "Search · Thread actions";
    hints.tools.appendChild(toolsPrevText);
    hints.tools.appendChild(kit.mountChromeLabel(env, ID));

    root.appendChild(stacks);

    const titleRow = document.createElement("div");
    titleRow.className = "pmq-w8-titlerow";
    titleRow.appendChild(kit.titleEditor(env, root));
    root.appendChild(titleRow);

    const bodyRow = document.createElement("div");
    bodyRow.className = "pmq-w8-body";
    bodyRow.appendChild(ctx.threadSlotEl);
    root.appendChild(bodyRow);

    const regions = kit.makeSideRegions(env, ID, {
      root,
      pinFullW: 248,
      pinAnchor: () => ctx.threadSlotEl,
      artVariant: "strip",
      artChipSlot: () => stripBtns.threads.parentNode,
      onPinSync: on => {
        root.classList.toggle("pmq-pinned", on);
        threadsPin.classList.toggle("pmq-on", on);
        threadsPin.setAttribute("aria-pressed", on ? "true" : "false");
      },
      renderPinCompact: (e, body) => {
        body.innerHTML = e.store.allThreads().map(t => {
          const meta = e.store.statusForThread(t, e.store.isRunning(t.id));
          return '<button class="pmq-w8-pinrow' + (t.id === e.store.activeKey() ? " pmq-active" : "") + '" type="button" data-thread="' + t.id + '">' +
            kit.statusGlyph(meta) +
            '<span class="pmq-w8-pinrow-t">' + esc(kit.threadTitle(e, t.id)) + "</span></button>";
        }).join("");
        window.PMIcons.hydrate(body);
      },
      renderPinMicro: (e, body) => {
        body.innerHTML = e.store.allThreads().map(t => {
          const meta = e.store.statusForThread(t, e.store.isRunning(t.id));
          return '<button class="pmq-w8-pinmicro' + (t.id === e.store.activeKey() ? " pmq-active" : "") + '" type="button" data-thread="' + t.id + '" title="' + esc(kit.threadTitle(e, t.id)) + '">' +
            kit.statusGlyph(meta) + "</button>";
        }).join("");
        window.PMIcons.hydrate(body);
      }
    });

    function ctxPct() {
      const msgs = env.store.messages(env.store.activeKey());
      let used = 0, limit = 128000;
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].runtime) { used = msgs[i].runtime.contextUsed; limit = msgs[i].runtime.contextLimit; break; }
      }
      return Math.round(100 * Math.min(1, used / limit));
    }

    function renderHints() {
      const s = env.store.state.session;
      const threads = env.store.data.threads;
      const pinned = threads.filter(t => t.pinned).length;
      const activeTitle = kit.threadTitle(env, env.store.activeKey());
      const prevThreads = hints.threads.parentNode.querySelector(".pmq-w8-strip-prev");
      const prevCtx = hints.context.parentNode.querySelector(".pmq-w8-strip-prev");
      if (prevThreads) prevThreads.textContent = activeTitle;
      hints.threads.textContent = threads.length + " chats · " + pinned + " pinned";
      if (prevCtx) prevCtx.textContent = s.persona + " · " + s.model;
      hints.context.textContent = s.effort + " effort · " + ctxPct() + "% ctx";
    }
    renderHints();
    kit.bind(root, env.store.subscribe(renderHints));

    watchSprouts(root, "88%", "0%");

    return {
      update(patch) {
        Object.assign(env, patch);
        regions.sync();
      },
      unmount() { kit.dispose(root); hostEl.classList.remove("pmq-w8"); hostEl.innerHTML = ""; },
      getOverlayRoot() { return document.body; }
    };
  }

  window.PMChatWindows[ID] = { id: ID, label: window.PMChatRegistry.windowLabel(ID), mount };
})();
