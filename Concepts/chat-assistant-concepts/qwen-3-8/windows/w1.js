(() => {
  const ID = "w1";
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
    hostEl.classList.add("pmq-w1");
    hostEl.innerHTML = "";

    const root = document.createElement("div");
    root.className = "pmq-w1-root";
    hostEl.appendChild(root);

    const masthead = document.createElement("div");
    masthead.className = "pmq-w1-masthead";

    const identity = document.createElement("div");
    identity.className = "pmq-w1-identity";
    identity.appendChild(kit.titleEditor(env, root));
    identity.appendChild(kit.ringButton(env, root));
    identity.appendChild(kit.kebabButton(ctx, env, root, ID));
    identity.appendChild(kit.badge(env, ID));
    masthead.appendChild(identity);

    const tools = document.createElement("div");
    tools.className = "pmq-w1-tools";
    tools.appendChild(kit.selectorRow(env, root));
    tools.appendChild(kit.lensButton(env, root));
    tools.appendChild(kit.searchButton(env, root));
    masthead.appendChild(tools);

    const bodyRow = document.createElement("div");
    bodyRow.className = "pmq-w1-body";
    bodyRow.appendChild(ctx.threadSlotEl);
    root.appendChild(masthead);
    root.appendChild(bodyRow);

    const regions = kit.makeSideRegions(env, ID, {
      root,
      pinFullW: 236,
      pinAnchor: () => ctx.threadSlotEl,
      artVariant: "inspector",
      artChipSlot: () => tools,
      onPinSync: on => root.classList.toggle("pmq-pinned", on),
      renderPinCompact: (e, body) => {
        body.innerHTML = e.store.allThreads().map(t => {
          const meta = e.store.statusForThread(t, e.store.isRunning(t.id));
          return '<button class="pmq-w1-pinrow' + (t.id === e.store.activeKey() ? " pmq-active" : "") + '" type="button" data-thread="' + t.id + '">' +
            kit.statusGlyph(meta) +
            '<span class="pmq-w1-pinrow-main"><span class="pmq-w1-pinrow-t">' + esc(kit.threadTitle(e, t.id)) + "</span>" +
            '<span class="pmq-w1-pinrow-m">' + esc(window.PMFmt.ago(t.updatedAt)) + "</span></span></button>";
        }).join("");
        window.PMIcons.hydrate(body);
      },
      renderPinMicro: (e, body) => {
        body.innerHTML = e.store.allThreads().map(t => {
          const meta = e.store.statusForThread(t, e.store.isRunning(t.id));
          return '<button class="pmq-w1-pinmicro' + (t.id === e.store.activeKey() ? " pmq-active" : "") + '" type="button" data-thread="' + t.id + '" title="' + esc(t.title) + '">' +
            kit.statusGlyph(meta) + '<span class="pmq-w1-micro-i">' + esc((t.title || "?").charAt(0).toUpperCase()) + "</span></button>";
        }).join("");
        window.PMIcons.hydrate(body);
      }
    });

    watchSprouts(root, "14%", null);

    return {
      update(patch) {
        Object.assign(env, patch);
        regions.sync();
      },
      unmount() { kit.dispose(root); hostEl.classList.remove("pmq-w1"); hostEl.innerHTML = ""; },
      getOverlayRoot() { return document.body }
    };
  }

  window.PMChatWindows[ID] = { id: ID, label: window.PMChatRegistry.windowLabel(ID), mount };
})();
