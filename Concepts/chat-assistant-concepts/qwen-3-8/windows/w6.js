(() => {
  const ID = "w6";
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
    hostEl.classList.add("pmq-w6");
    hostEl.innerHTML = "";

    const root = document.createElement("div");
    root.className = "pmq-w6-root";
    hostEl.appendChild(root);

    const deck = document.createElement("div");
    deck.className = "pmq-w6-deck";

    function chip(extra, label) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "pmq-chip pmq-w6-chip" + (extra ? " " + extra : "");
      if (label) b.setAttribute("aria-label", label);
      return b;
    }

    const chatsChip = chip("", "Open chats");
    chatsChip.setAttribute("aria-expanded", "false");
    chatsChip.innerHTML = '<i data-ico="chats"></i><span class="pmq-w6-chip-title"></span><i data-ico="chevDown" class="pmq-w6-chev"></i>';
    window.PMIcons.hydrate(chatsChip);
    const chatsTitleEl = chatsChip.querySelector(".pmq-w6-chip-title");
    chatsChip.addEventListener("click", () => kit.chatsPopup(chatsChip, env, root));

    const pinChip = chip("pmq-w6-pin", "Pin history");
    pinChip.setAttribute("aria-pressed", "false");
    pinChip.innerHTML = '<i data-ico="pin"></i>';
    window.PMIcons.hydrate(pinChip);
    pinChip.addEventListener("click", () => env.store.setPin(ID, !env.store.isPinned(ID)));

    const personaChip = chip("");
    personaChip.innerHTML = '<span class="pmq-w6-k">Persona</span><span class="pmq-w6-v"></span><i data-ico="chevDown" class="pmq-w6-chev"></i>';
    window.PMIcons.hydrate(personaChip);
    const personaVal = personaChip.querySelector(".pmq-w6-v");
    personaChip.addEventListener("click", () => kit.personaPopup(personaChip, env));

    const modelChip = chip("pmq-chip-accent", "Model");
    modelChip.innerHTML = '<i data-ico="sparkle"></i><span class="pmq-w6-v"></span><i data-ico="chevDown" class="pmq-w6-chev"></i>';
    window.PMIcons.hydrate(modelChip);
    const modelVal = modelChip.querySelector(".pmq-w6-v");
    modelChip.addEventListener("click", () => kit.modelPopup(modelChip, env, root));

    const effortChip = chip("pmq-w6-effort-chip", "Reasoning effort");
    effortChip.innerHTML = '<i data-ico="timer"></i><span class="pmq-w6-k">Effort</span><span class="pmq-w6-v"></span><i data-ico="chevDown" class="pmq-w6-chev"></i>';
    window.PMIcons.hydrate(effortChip);
    const effortVal = effortChip.querySelector(".pmq-w6-v");
    effortChip.addEventListener("click", () => {
      env.popups.menu(effortChip, (kit.EFFORTS || ["Low", "Medium", "High", "Max"]).map(e => ({
        label: e, icon: "timer", checked: env.store.effectiveSettings(env.store.activeKey()).effort === e,
        onpick: () => env.store.setThreadSettings(env.store.activeKey(), { effort: e })
      })), { title: "Reasoning effort", width: 200 });
    });

    const modeChip = chip("");
    modeChip.innerHTML = '<i data-ico="wand"></i><span class="pmq-w6-v"></span>';
    window.PMIcons.hydrate(modeChip);
    const modeVal = modeChip.querySelector(".pmq-w6-v");
    modeChip.addEventListener("click", () => kit.modePopup(modeChip, env));

    const searchField = document.createElement("div");
    searchField.className = "pmq-w6-search";
    searchField.innerHTML = '<input type="text" placeholder="Search" spellcheck="false" aria-label="Search messages">' +
      '<button class="pmq-w6-search-go" type="button" aria-label="Open search"><i data-ico="search"></i></button>';
    window.PMIcons.hydrate(searchField);
    const searchInput = searchField.querySelector("input");
    function launchSearch() {
      const q = searchInput.value;
      const entry = kit.openSearch(searchField, env, root);
      if (q.trim() && entry && entry.el) {
        const pin = entry.el.querySelector(".pmq-search-bar input");
        if (pin) {
          pin.value = q;
          pin.dispatchEvent(new Event("input"));
        }
        searchInput.value = "";
      }
    }
    searchInput.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); launchSearch(); } });
    searchField.querySelector(".pmq-w6-search-go").addEventListener("click", launchSearch);

    const badge = kit.badge(env, ID);
    badge.classList.add("pmq-w6-end");
    badge.innerHTML = '<span class="pmq-badge-glyph"></span>' + esc(window.PMChatRegistry.windowLabel(ID));

    deck.appendChild(chatsChip);
    deck.appendChild(pinChip);
    deck.appendChild(personaChip);
    deck.appendChild(modelChip);
    deck.appendChild(effortChip);
    deck.appendChild(modeChip);
    deck.appendChild(searchField);
    deck.appendChild(kit.lensButton(env, root));
    deck.appendChild(kit.ringButton(env, root));
    deck.appendChild(kit.kebabButton(ctx, env, root, ID));
    deck.appendChild(badge);

    function renderChips() {
      const s = env.store.effectiveSettings(env.store.activeKey());
      const on = env.store.isPinned(ID);
      pinChip.classList.toggle("pmq-on", on);
      pinChip.setAttribute("aria-pressed", on ? "true" : "false");
      chatsTitleEl.textContent = kit.threadTitle(env, env.store.activeKey());
      personaVal.textContent = s.persona;
      modelVal.textContent = s.model;
      effortVal.textContent = s.effort;
      modeVal.textContent = s.mode;
    }
    renderChips();
    kit.bind(root, env.store.subscribe(renderChips));

    root.appendChild(deck);
    const bodyRow = document.createElement("div");
    bodyRow.className = "pmq-w6-body";
    bodyRow.appendChild(ctx.threadSlotEl);
    root.appendChild(bodyRow);

    const regions = kit.makeSideRegions(env, ID, {
      root,
      pinFullW: 236,
      pinAnchor: () => ctx.threadSlotEl,
      artVariant: "deck",
      artChipSlot: () => deck,
      onPinSync: on => root.classList.toggle("pmq-pinned", on),
      renderPinCompact: (e, body) => {
        body.innerHTML = e.store.allThreads().map(t => {
          const meta = e.store.statusForThread(t, e.store.isRunning(t.id));
          return '<button class="pmq-w6-pinrow' + (t.id === e.store.activeKey() ? " pmq-active" : "") + '" type="button" data-thread="' + t.id + '">' +
            kit.statusGlyph(meta) +
            '<span class="pmq-w6-pinrow-t">' + esc(kit.threadTitle(e, t.id)) + "</span></button>";
        }).join("");
        window.PMIcons.hydrate(body);
      },
      renderPinMicro: (e, body) => {
        body.innerHTML = e.store.allThreads().map(t => {
          const meta = e.store.statusForThread(t, e.store.isRunning(t.id));
          return '<button class="pmq-w6-pinmicro' + (t.id === e.store.activeKey() ? " pmq-active" : "") + '" type="button" data-thread="' + t.id + '" title="' + esc(t.title) + '">' +
            kit.statusGlyph(meta) + "</button>";
        }).join("");
        window.PMIcons.hydrate(body);
      }
    });

    watchSprouts(root, "32%", null);

    return {
      update(patch) { Object.assign(env, patch); regions.sync(); },
      unmount() { kit.dispose(root); hostEl.classList.remove("pmq-w6"); hostEl.innerHTML = ""; },
      getOverlayRoot() { return document.body; }
    };
  }

  window.PMChatWindows[ID] = { id: ID, label: window.PMChatRegistry.windowLabel(ID), mount };
})();
