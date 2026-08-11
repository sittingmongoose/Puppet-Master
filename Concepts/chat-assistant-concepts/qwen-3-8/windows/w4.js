(() => {
  const ID = "w4";
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
    hostEl.classList.add("pmq-w4");
    hostEl.innerHTML = "";

    const root = document.createElement("div");
    root.className = "pmq-w4-root";
    hostEl.appendChild(root);

    const top = document.createElement("div");
    top.className = "pmq-w4-top";

    const plateTL = document.createElement("div");
    plateTL.className = "pmq-w4-plate pmq-w4-plate-tl pmq-anim-enter";

    const chip = document.createElement("button");
    chip.className = "pmq-w4-threadchip";
    chip.type = "button";
    chip.setAttribute("aria-haspopup", "true");
    chip.setAttribute("aria-expanded", "false");
    chip.setAttribute("aria-label", "Switch thread");

    function renderChip() {
      chip.innerHTML = '<i data-ico="chats"></i><span class="pmq-w4-threadchip-t">' +
        esc(kit.threadTitle(env, env.store.activeKey())) + '</span><i data-ico="chevDown"></i>';
      window.PMIcons.hydrate(chip);
    }
    renderChip();
    kit.bind(root, env.store.subscribe(renderChip));
    chip.addEventListener("click", () => kit.chatsPopup(chip, env, root));

    const pinBtn = document.createElement("button");
    pinBtn.className = "pmq-w4-pin";
    pinBtn.type = "button";
    pinBtn.setAttribute("aria-label", "Pin history panel");
    pinBtn.setAttribute("aria-pressed", "false");
    pinBtn.innerHTML = '<i data-ico="pin"></i>';
    window.PMIcons.hydrate(pinBtn);
    pinBtn.addEventListener("click", () => env.store.setPin(ID, !env.store.isPinned(ID)));
    function syncPinBtn() {
      const on = env.store.isPinned(ID);
      pinBtn.classList.toggle("pmq-on", on);
      pinBtn.setAttribute("aria-pressed", on ? "true" : "false");
    }
    syncPinBtn();
    kit.bind(root, env.store.subscribe(syncPinBtn));

    plateTL.appendChild(chip);
    plateTL.appendChild(pinBtn);
    plateTL.appendChild(kit.badge(env, ID));

    const plateTR = document.createElement("div");
    plateTR.className = "pmq-w4-plate pmq-w4-plate-tr pmq-anim-enter";
    plateTR.appendChild(kit.ringButton(env, root));
    plateTR.appendChild(kit.kebabButton(ctx, env, root, ID));

    top.appendChild(plateTL);
    top.appendChild(plateTR);

    const bottom = document.createElement("div");
    bottom.className = "pmq-w4-bottom";

    const plateBL = document.createElement("div");
    plateBL.className = "pmq-w4-plate pmq-w4-plate-bl pmq-anim-enter";
    plateBL.appendChild(kit.selectorRow(env, root));

    const plateBR = document.createElement("div");
    plateBR.className = "pmq-w4-plate pmq-w4-plate-br pmq-anim-enter";
    plateBR.appendChild(kit.lensButton(env, root));
    plateBR.appendChild(kit.searchButton(env, root));

    bottom.appendChild(plateBL);
    bottom.appendChild(plateBR);

    const mid = document.createElement("div");
    mid.className = "pmq-w4-mid";
    mid.appendChild(ctx.threadSlotEl);

    root.appendChild(top);
    root.appendChild(mid);
    root.appendChild(bottom);

    if (typeof env.store.artEntry !== "function") {
      env.store.artEntry = (key, artId) => {
        const st = env.store.state.threads[key];
        if (!st.artState[artId]) st.artState[artId] = { status: "ready", version: 1 };
        return st.artState[artId];
      };
    }

    const regions = kit.makeSideRegions(env, ID, {
      root,
      pinFullW: 236,
      pinAnchor: () => ctx.threadSlotEl,
      artVariant: "plates",
      artChipSlot: () => plateTL,
      onPinSync: on => root.classList.toggle("pmq-pinned", on),
      renderPinCompact: (e, body) => {
        body.innerHTML = e.store.allThreads().map(t => {
          const meta = e.store.statusForThread(t, e.store.isRunning(t.id));
          return '<button class="pmq-w4-pinrow' + (t.id === e.store.activeKey() ? " pmq-active" : "") + '" type="button" data-thread="' + t.id + '">' +
            kit.statusGlyph(meta) +
            '<span class="pmq-w4-pinrow-t">' + esc(kit.threadTitle(e, t.id)) + "</span></button>";
        }).join("");
        window.PMIcons.hydrate(body);
      },
      renderPinMicro: (e, body) => {
        body.innerHTML = e.store.allThreads().map(t => {
          const meta = e.store.statusForThread(t, e.store.isRunning(t.id));
          return '<button class="pmq-w4-pinmicro' + (t.id === e.store.activeKey() ? " pmq-active" : "") + '" type="button" data-thread="' + t.id + '" title="' + esc(t.title) + '">' +
            kit.statusGlyph(meta) + '<span class="pmq-w4-micro-i">' + esc((t.title || "?").charAt(0).toUpperCase()) + "</span></button>";
        }).join("");
        window.PMIcons.hydrate(body);
      }
    });

    watchSprouts(root, "84%", null);

    return {
      update(patch) { Object.assign(env, patch); regions.sync(); },
      unmount() { kit.dispose(root); hostEl.classList.remove("pmq-w4"); hostEl.innerHTML = ""; },
      getOverlayRoot() { return document.body; }
    };
  }

  window.PMChatWindows[ID] = { id: ID, label: window.PMChatRegistry.windowLabel(ID), mount };
})();
