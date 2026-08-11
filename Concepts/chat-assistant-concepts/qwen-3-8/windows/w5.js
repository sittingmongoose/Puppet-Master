(() => {
  const ID = "w5";
  const kit = window.PMChatWindowKit;
  const esc = window.PMFmt.esc;

  function spineBtn(icon, label) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pmq-w5-sbtn";
    b.setAttribute("aria-label", label);
    b.innerHTML = '<i data-ico="' + icon + '"></i>';
    window.PMIcons.hydrate(b);
    return b;
  }

  function springIco(btn) {
    if (!window.PMAnim || typeof window.PMAnim.springTo !== "function") return;
    if (window.PMAnim.reduced && window.PMAnim.reduced()) return;
    const ico = btn.querySelector(".pmq-ico") || btn;
    window.PMAnim.springTo(v => {
      if (Math.abs(v - 1) < 0.004) ico.style.removeProperty("transform");
      else ico.style.transform = "scale(" + v.toFixed(3) + ")";
    }, 1.34, 1, { stiffness: 230, damping: 11 });
  }

  function trackOpen(btn, entry, root) {
    btn.setAttribute("aria-expanded", "true");
    const mo = new MutationObserver(() => {
      if (entry && entry.el && document.body.contains(entry.el)) return;
      btn.setAttribute("aria-expanded", "false");
      mo.disconnect();
    });
    mo.observe(document.body, { childList: true, subtree: true });
    kit.bind(root, () => mo.disconnect());
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

  function openConfig(anchor, env, root) {
    const wrap = document.createElement("div");
    wrap.className = "pmq-w5-config";
    wrap.innerHTML = '<div class="pmq-popup-head"><i data-ico="gear"></i>Configure</div>';
    window.PMIcons.hydrate(wrap);

    const summary = document.createElement("div");
    summary.className = "pmq-w5-cfg-summary";
    const vals = {};
    [["persona", "Persona", "agents"], ["model", "Model", "sparkle"], ["mode", "Mode", "wand"]].forEach(cfg => {
      const r = document.createElement("div");
      r.className = "pmq-w5-cfg-row";
      r.innerHTML = '<i data-ico="' + cfg[2] + '"></i><span class="pmq-w5-cfg-k">' + cfg[1] + '</span><span class="pmq-w5-cfg-v"></span>';
      window.PMIcons.hydrate(r);
      vals[cfg[0]] = r.querySelector(".pmq-w5-cfg-v");
      summary.appendChild(r);
    });
    function renderSummary() {
      const s = env.store.state.session;
      vals.persona.textContent = s.persona;
      vals.model.textContent = s.model + " · " + s.effort + " effort";
      vals.mode.textContent = s.mode;
    }
    renderSummary();
    kit.bind(root, env.store.subscribe(() => {
      if (!document.body.contains(wrap)) return;
      renderSummary();
    }));
    wrap.appendChild(summary);

    const sel = kit.selectorRow(env, root);
    sel.classList.add("pmq-w5-cfg-sel");
    wrap.appendChild(sel);

    return env.popups.open(anchor, wrap, { width: 296, cls: "pmq-w5-config-pop" });
  }

  function mount(hostEl, ctx) {
    const env = ctx.env;
    hostEl.classList.add("pmq-w5");
    hostEl.innerHTML = "";

    const root = document.createElement("div");
    root.className = "pmq-w5-root";
    hostEl.appendChild(root);

    const spine = document.createElement("div");
    spine.className = "pmq-w5-spine";

    const chatsBtn = spineBtn("chats", "Open chats");
    chatsBtn.setAttribute("aria-expanded", "false");
    chatsBtn.addEventListener("click", () => trackOpen(chatsBtn, kit.chatsPopup(chatsBtn, env, root), root));
    spine.appendChild(chatsBtn);

    const pinBtn = spineBtn("pin", "Pin history panel");
    pinBtn.classList.add("pmq-w5-pin");
    pinBtn.setAttribute("aria-pressed", "false");
    pinBtn.addEventListener("click", () => env.store.setPin(ID, !env.store.isPinned(ID)));
    spine.appendChild(pinBtn);

    spine.appendChild(kit.searchButton(env, root));
    spine.appendChild(kit.lensButton(env, root));

    const cfgBtn = spineBtn("gear", "Configure persona, model, and mode");
    cfgBtn.setAttribute("aria-expanded", "false");
    cfgBtn.addEventListener("click", () => trackOpen(cfgBtn, openConfig(cfgBtn, env, root), root));
    spine.appendChild(cfgBtn);

    const spacer = document.createElement("div");
    spacer.className = "pmq-w5-spacer";
    spine.appendChild(spacer);
    spine.appendChild(kit.ringButton(env, root));
    spine.appendChild(kit.kebabButton(ctx, env, root, ID));

    spine.addEventListener("click", e => {
      const b = e.target.closest("button");
      if (b && spine.contains(b)) springIco(b);
    });

    let lastKey = env.store.activeKey();
    kit.bind(root, env.store.subscribe(() => {
      const k = env.store.activeKey();
      if (k !== lastKey) {
        lastKey = k;
        springIco(chatsBtn);
      }
    }));

    const main = document.createElement("div");
    main.className = "pmq-w5-main";

    const titleRow = document.createElement("div");
    titleRow.className = "pmq-w5-titlerow";
    titleRow.appendChild(kit.titleEditor(env, root));
    titleRow.appendChild(kit.badge(env, ID));
    main.appendChild(titleRow);

    const bodyRow = document.createElement("div");
    bodyRow.className = "pmq-w5-body";
    bodyRow.appendChild(ctx.threadSlotEl);
    main.appendChild(bodyRow);

    root.appendChild(spine);
    root.appendChild(main);

    const regions = kit.makeSideRegions(env, ID, {
      root,
      pinFullW: 224,
      pinAnchor: () => ctx.threadSlotEl,
      artVariant: "drawer",
      artChipSlot: () => spine,
      onPinSync: on => {
        root.classList.toggle("pmq-pinned", on);
        pinBtn.classList.toggle("pmq-on", on);
        pinBtn.setAttribute("aria-pressed", on ? "true" : "false");
      },
      renderPinCompact: (e, body) => {
        body.innerHTML = e.store.allThreads().map(t => {
          const meta = e.store.statusForThread(t, e.store.isRunning(t.id));
          const title = kit.threadTitle(e, t.id);
          return '<button class="pmq-w5-pinrow' + (t.id === e.store.activeKey() ? " pmq-active" : "") + '" type="button" data-thread="' + esc(t.id) + '" title="' + esc(title) + '">' +
            '<span class="pmq-w5-pinrow-g">' + kit.statusGlyph(meta) + "</span>" +
            '<span class="pmq-w5-pinrow-t">' + esc(title) + "</span></button>";
        }).join("");
        window.PMIcons.hydrate(body);
      },
      renderPinMicro: (e, body) => {
        body.innerHTML = e.store.allThreads().map(t => {
          const meta = e.store.statusForThread(t, e.store.isRunning(t.id));
          const title = kit.threadTitle(e, t.id);
          return '<button class="pmq-w5-pinmicro' + (t.id === e.store.activeKey() ? " pmq-active" : "") + '" type="button" data-thread="' + esc(t.id) + '" title="' + esc(title) + '">' +
            kit.statusGlyph(meta) + "</button>";
        }).join("");
        window.PMIcons.hydrate(body);
      }
    });

    watchSprouts(root, "0%", "38%");

    return {
      update(patch) {
        Object.assign(env, patch);
        regions.sync();
      },
      unmount() { kit.dispose(root); hostEl.classList.remove("pmq-w5"); hostEl.innerHTML = ""; },
      getOverlayRoot() { return document.body; }
    };
  }

  window.PMChatWindows[ID] = { id: ID, label: window.PMChatRegistry.windowLabel(ID), mount };
})();
