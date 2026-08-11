(() => {
  const ID = "w2";
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
    hostEl.classList.add("pmq-w2");
    hostEl.innerHTML = "";

    const root = document.createElement("div");
    root.className = "pmq-w2-root";
    hostEl.appendChild(root);

    const bar = document.createElement("div");
    bar.className = "pmq-w2-bar pmq-anim-enter";

    const chip = document.createElement("button");
    chip.className = "pmq-w2-threadchip";
    chip.type = "button";
    chip.setAttribute("aria-haspopup", "true");
    chip.setAttribute("aria-expanded", "false");
    chip.setAttribute("aria-label", "Switch thread");

    const pinBtn = document.createElement("button");
    pinBtn.className = "pmq-w2-pin";
    pinBtn.type = "button";
    pinBtn.setAttribute("aria-label", "Pin history panel");
    pinBtn.setAttribute("aria-pressed", "false");
    pinBtn.innerHTML = '<i data-ico="pin"></i>';
    window.PMIcons.hydrate(pinBtn);
    pinBtn.addEventListener("click", () => env.store.setPin(ID, !env.store.isPinned(ID)));

    const cfg = document.createElement("button");
    cfg.className = "pmq-w2-cfg";
    cfg.type = "button";
    cfg.setAttribute("aria-haspopup", "true");
    cfg.setAttribute("aria-expanded", "false");
    cfg.setAttribute("aria-label", "Persona, model, and mode");

    let cfgBody = null;

    function renderBar() {
      const key = env.store.activeKey();
      const t = env.store.demoThread(key);
      const running = env.store.isRunning(key);
      chip.innerHTML = '<i data-ico="chats"></i>' + kit.statusDot(running ? "running" : t.threadState) +
        '<span class="pmq-w2-threadchip-t">' + esc(kit.threadTitle(env, key)) + '</span><i data-ico="chevDown"></i>';
      window.PMIcons.hydrate(chip);
      const s = env.store.effectiveSettings(key);
      cfg.innerHTML = '<span class="pmq-w2-cfg-v"><span class="pmq-w2-cfg-k">Persona</span>' +
        '<span class="pmq-w2-cfg-p">' + esc(s.persona) + '</span>' +
        '<span class="pmq-w2-cfg-sep">·</span><span class="pmq-w2-cfg-m">' + esc(s.model) + "</span>" +
        '<span class="pmq-w2-cfg-seg"><span class="pmq-w2-cfg-sep">·</span><span class="pmq-w2-cfg-mode">' + esc(s.mode) + " · " + esc(s.effort) + " effort" +
        "</span></span></span>" + '<i data-ico="chevDown"></i>';
      window.PMIcons.hydrate(cfg);
      const pinned = env.store.isPinned(ID);
      pinBtn.classList.toggle("pmq-on", pinned);
      pinBtn.setAttribute("aria-pressed", pinned ? "true" : "false");
    }
    renderBar();
    kit.bind(root, env.store.subscribe(renderBar));

    chip.addEventListener("click", () => kit.chatsPopup(chip, env, root));

    cfg.addEventListener("click", () => {
      if (!cfgBody) {
        cfgBody = document.createElement("div");
        cfgBody.className = "pmq-w2-cfg-pop";
        const head = document.createElement("div");
        head.className = "pmq-popup-head";
        head.textContent = "Persona · Model · Mode";
        const hint = document.createElement("div");
        hint.className = "pmq-w2-cfg-hint";
        hint.textContent = "Choices are thread-local by default; use the popup footer to set a session default.";
        cfgBody.appendChild(head);
        cfgBody.appendChild(kit.selectorRow(env, root));
        const extraRow = document.createElement("div");
        extraRow.className = "pmq-w2-cfg-extra";
        extraRow.appendChild(kit.lensButton(env, root));
        extraRow.appendChild(kit.searchButton(env, root));
        cfgBody.appendChild(extraRow);
        cfgBody.appendChild(hint);
      }
      env.popups.open(cfg, cfgBody, { width: 272, cls: "pmq-w2-cfg-popup" });
    });

    bar.appendChild(chip);
    bar.appendChild(pinBtn);
    bar.appendChild(cfg);
    bar.appendChild(kit.ringButton(env, root));
    bar.appendChild(kit.lensButton(env, root));
    bar.appendChild(kit.searchButton(env, root));
    bar.appendChild(kit.kebabButton(ctx, env, root, ID));
    bar.appendChild(kit.badge(env, ID));

    root.appendChild(bar);
    root.appendChild(ctx.threadSlotEl);

    if (typeof env.store.artEntry !== "function") {
      env.store.artEntry = (key, artId) => {
        const st = env.store.state.threads[key];
        if (!st.artState[artId]) st.artState[artId] = { status: "ready", version: 1 };
        return st.artState[artId];
      };
    }

    const regions = kit.makeSideRegions(env, ID, {
      root,
      pinFullW: 224,
      pinAnchor: () => ctx.threadSlotEl,
      artVariant: "stack",
      artChipSlot: () => bar,
      onPinSync: on => root.classList.toggle("pmq-pinned", on),
      renderPinCompact: (e, body) => {
        body.innerHTML = e.store.allThreads().map(t => {
          const meta = e.store.statusForThread(t, e.store.isRunning(t.id));
          return '<button class="pmq-w2-pinrow' + (t.id === e.store.activeKey() ? " pmq-active" : "") + '" type="button" data-thread="' + t.id + '">' +
            kit.statusGlyph(meta) +
            '<span class="pmq-w2-pinrow-t">' + esc(kit.threadTitle(e, t.id)) + "</span></button>";
        }).join("");
        window.PMIcons.hydrate(body);
      },
      renderPinMicro: (e, body) => {
        body.innerHTML = e.store.allThreads().map(t => {
          const meta = e.store.statusForThread(t, e.store.isRunning(t.id));
          return '<button class="pmq-w2-pinmicro' + (t.id === e.store.activeKey() ? " pmq-active" : "") + '" type="button" data-thread="' + t.id + '" title="' + esc(t.title) + '">' +
            kit.statusGlyph(meta) + '<span class="pmq-w2-micro-i">' + esc((t.title || "?").charAt(0).toUpperCase()) + "</span></button>";
        }).join("");
        window.PMIcons.hydrate(body);
      }
    });

    watchSprouts(root, "16%", null);

    return {
      update(patch) { Object.assign(env, patch); regions.sync(); },
      unmount() { kit.dispose(root); hostEl.classList.remove("pmq-w2"); hostEl.innerHTML = ""; },
      getOverlayRoot() { return document.body; }
    };
  }

  window.PMChatWindows[ID] = { id: ID, label: window.PMChatRegistry.windowLabel(ID), mount };
})();
