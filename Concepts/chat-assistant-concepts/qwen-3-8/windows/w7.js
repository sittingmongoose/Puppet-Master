(() => {
  const ID = "w7";
  const kit = window.PMChatWindowKit;
  const esc = window.PMFmt.esc;

  function springTile(tile) {
    if (!window.PMAnim || typeof window.PMAnim.springTo !== "function") return;
    if (window.PMAnim.reduced && window.PMAnim.reduced()) return;
    window.PMAnim.springTo(v => {
      if (Math.abs(v - 1) < 0.004) tile.style.removeProperty("transform");
      else tile.style.transform = "scale(" + v.toFixed(3) + ")";
    }, 0.82, 1, { stiffness: 210, damping: 12 });
  }

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
    hostEl.classList.add("pmq-w7");
    hostEl.innerHTML = "";

    const root = document.createElement("div");
    root.className = "pmq-w7-root";
    hostEl.appendChild(root);

    const rail = document.createElement("nav");
    rail.className = "pmq-w7-rail";
    rail.setAttribute("aria-label", "Threads");
    const railList = document.createElement("div");
    railList.className = "pmq-w7-rail-list pmq-scroll";
    rail.appendChild(railList);

    function renderRail() {
      const active = env.store.activeKey();
      railList.innerHTML = env.store.data.threads.map(t => {
        const running = env.store.isRunning(t.id);
        const meta = env.store.statusForThread(t, running);
        const title = kit.threadTitle(env, t.id);
        const isActive = t.id === active;
        const word = title.trim().split(/\s+/)[0] || title.trim();
        const label = word.length > 6 ? word.slice(0, 6) : word;
        return '<button class="pmq-w7-tile' + (isActive ? " pmq-active" : "") + '" type="button" data-thread="' + esc(t.id) + '"' +
          ' title="' + esc(title) + '" aria-label="' + esc(title) + '"' +
          (isActive ? ' aria-current="true"' : "") + ">" +
          '<span class="pmq-w7-tile-letter">' + esc(title.trim().charAt(0).toUpperCase()) + "</span>" +
          '<span class="pmq-w7-tile-label">' + esc(label) + "</span>" +
          kit.statusGlyph(meta, running) + "</button>";
      }).join("");
    }
    renderRail();
    railList.addEventListener("click", e => {
      const tile = e.target.closest("[data-thread]");
      if (!tile) return;
      springTile(tile);
      env.store.switchThread(tile.dataset.thread);
    });
    kit.bind(root, env.store.subscribe(renderRail));

    let lastKey = env.store.activeKey();
    kit.bind(root, env.store.subscribe(() => {
      const k = env.store.activeKey();
      if (k !== lastKey) {
        lastKey = k;
        const tile = railList.querySelector('.pmq-w7-tile[data-thread="' + k + '"]');
        if (tile) springTile(tile);
      }
    }));

    const pinBtn = document.createElement("button");
    pinBtn.type = "button";
    pinBtn.className = "pmq-w7-tile pmq-w7-pin";
    pinBtn.setAttribute("aria-label", "Pin history panel");
    pinBtn.setAttribute("aria-pressed", "false");
    pinBtn.innerHTML = '<i data-ico="pin"></i>';
    window.PMIcons.hydrate(pinBtn);
    pinBtn.addEventListener("click", () => {
      springTile(pinBtn);
      env.store.setPin(ID, !env.store.isPinned(ID));
    });
    rail.appendChild(pinBtn);

    const main = document.createElement("div");
    main.className = "pmq-w7-main";

    const topbar = document.createElement("div");
    topbar.className = "pmq-w7-topbar";
    topbar.appendChild(kit.titleEditor(env, root));
    topbar.appendChild(kit.selectorRow(env, root));
    topbar.appendChild(kit.lensButton(env, root));
    topbar.appendChild(kit.searchButton(env, root));
    topbar.appendChild(kit.ringButton(env, root));
    topbar.appendChild(kit.kebabButton(ctx, env, root, ID));
    topbar.appendChild(kit.badge(env, ID));

    main.appendChild(topbar);

    const bodyRow = document.createElement("div");
    bodyRow.className = "pmq-w7-body";
    bodyRow.appendChild(ctx.threadSlotEl);
    main.appendChild(bodyRow);

    root.appendChild(rail);
    root.appendChild(main);

    const regions = kit.makeSideRegions(env, ID, {
      root,
      pinFullW: 224,
      pinAnchor: () => ctx.threadSlotEl,
      artVariant: "railinspector",
      artChipSlot: () => topbar,
      onPinSync: (on, mode) => {
        root.classList.toggle("pmq-pinned", on);
        root.classList.toggle("pmq-w7-colmode", on && mode === "full");
        pinBtn.classList.toggle("pmq-on", on);
        pinBtn.setAttribute("aria-pressed", on ? "true" : "false");
      },
      renderPinCompact: (e, body) => {
        body.innerHTML = e.store.allThreads().map(t => {
          const running = e.store.isRunning(t.id);
          const meta = e.store.statusForThread(t, running);
          const title = kit.threadTitle(e, t.id);
          return '<button class="pmq-w7-pinrow' + (t.id === e.store.activeKey() ? " pmq-active" : "") + '" type="button" data-thread="' + esc(t.id) + '" title="' + esc(title) + '">' +
            '<span class="pmq-w7-pinrow-tile"><span class="pmq-w7-pinrow-i">' + esc((title || "?").trim().charAt(0).toUpperCase()) + "</span>" +
            kit.statusGlyph(meta, running) + "</span>" +
            '<span class="pmq-w7-pinrow-l">' + esc(title) + "</span></button>";
        }).join("");
        window.PMIcons.hydrate(body);
      },
      renderPinMicro: (e, body) => {
        body.innerHTML = e.store.allThreads().map(t => {
          const title = kit.threadTitle(e, t.id);
          return '<button class="pmq-w7-pinmicro' + (t.id === e.store.activeKey() ? " pmq-active" : "") + '" type="button" data-thread="' + esc(t.id) + '" title="' + esc(title) + '">' +
            '<span class="pmq-w7-pinmicro-i">' + esc((title || "?").trim().charAt(0).toUpperCase()) + "</span></button>";
        }).join("");
        window.PMIcons.hydrate(body);
      }
    });

    watchSprouts(root, "0%", "62%");

    return {
      update(patch) {
        Object.assign(env, patch);
        regions.sync();
      },
      unmount() { kit.dispose(root); hostEl.classList.remove("pmq-w7"); hostEl.innerHTML = ""; },
      getOverlayRoot() { return document.body; }
    };
  }

  window.PMChatWindows[ID] = { id: ID, label: window.PMChatRegistry.windowLabel(ID), mount };
})();
