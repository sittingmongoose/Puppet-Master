(() => {
  const ID = "w3";
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

  function magnetize(shelf) {
    if (!window.PMAnim || typeof window.PMAnim.reduced !== "function") return;
    if (window.matchMedia && !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    function tick() {
      raf = 0;
      if (window.PMAnim.reduced()) return;
      let active = false;
      shelf.querySelectorAll(".pmq-chatrow").forEach(card => {
        const s = card._pmqMag;
        if (!s) return;
        s.x += (s.tx - s.x) * 0.16;
        s.y += (s.ty - s.y) * 0.16;
        if (Math.abs(s.tx - s.x) < 0.06 && Math.abs(s.ty - s.y) < 0.06) { s.x = s.tx; s.y = s.ty; }
        else active = true;
        card.style.setProperty("--mag-x", s.x.toFixed(2) + "px");
        card.style.setProperty("--mag-y", s.y.toFixed(2) + "px");
      });
      if (active) raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    shelf.addEventListener("pointermove", e => {
      if (window.PMAnim.reduced()) return;
      shelf.querySelectorAll(".pmq-chatrow").forEach(card => {
        const r = card.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        const s = card._pmqMag || (card._pmqMag = { x: 0, y: 0, tx: 0, ty: 0 });
        if (Math.abs(dx) <= 1.5 && Math.abs(dy) <= 2.4) {
          s.tx = Math.max(-3, Math.min(3, dx * 2.6));
          s.ty = Math.max(-2.2, Math.min(2.2, dy * 1.8));
        } else { s.tx = 0; s.ty = 0; }
      });
      kick();
    });
    shelf.addEventListener("pointerleave", () => {
      shelf.querySelectorAll(".pmq-chatrow").forEach(card => {
        if (card._pmqMag) { card._pmqMag.tx = 0; card._pmqMag.ty = 0; }
      });
      kick();
    });
  }

  function mount(hostEl, ctx) {
    const env = ctx.env;
    hostEl.classList.add("pmq-w3");
    hostEl.innerHTML = "";

    const root = document.createElement("div");
    root.className = "pmq-w3-root pmq-anim-enter";
    hostEl.appendChild(root);

    const strip = document.createElement("div");
    strip.className = "pmq-w3-id";
    strip.appendChild(kit.titleEditor(env, root));
    strip.appendChild(kit.ringButton(env, root));
    strip.appendChild(kit.kebabButton(ctx, env, root, ID));
    strip.appendChild(kit.badge(env, ID));
    root.appendChild(strip);

    const shelfRow = document.createElement("div");
    shelfRow.className = "pmq-w3-shelfrow";

    const shelf = kit.chatsInline(env, root, { cls: "pmq-w3-shelf" });
    magnetize(shelf);
    shelfRow.appendChild(shelf);

    const pinBtn = document.createElement("button");
    pinBtn.type = "button";
    pinBtn.className = "pmq-w3-pinbtn";
    pinBtn.setAttribute("aria-label", "Pin history panel");
    pinBtn.setAttribute("aria-pressed", "false");
    pinBtn.innerHTML = '<i data-ico="pin"></i>';
    window.PMIcons.hydrate(pinBtn);
    pinBtn.addEventListener("click", () => env.store.setPin(ID, !env.store.isPinned(ID)));
    shelfRow.appendChild(pinBtn);

    root.appendChild(shelfRow);

    function keepActiveVisible() {
      const active = shelf.querySelector(".pmq-chatrow.pmq-active");
      if (active) active.scrollIntoView({ inline: "nearest", block: "nearest" });
    }
    kit.bind(root, env.store.subscribe(keepActiveVisible));
    requestAnimationFrame(keepActiveVisible);

    const tools = document.createElement("div");
    tools.className = "pmq-w3-tools";
    tools.appendChild(kit.selectorRow(env, root));
    tools.appendChild(kit.lensButton(env, root));
    tools.appendChild(kit.searchButton(env, root));
    root.appendChild(tools);

    const bodyRow = document.createElement("div");
    bodyRow.className = "pmq-w3-body";
    bodyRow.appendChild(ctx.threadSlotEl);
    root.appendChild(bodyRow);

    const regions = kit.makeSideRegions(env, ID, {
      root,
      pinFullW: 236,
      pinAnchor: () => ctx.threadSlotEl,
      artVariant: "lane",
      artChipSlot: () => shelfRow,
      onPinSync: (on, mode) => {
        root.classList.toggle("pmq-pinned", on);
        pinBtn.classList.toggle("pmq-on", on);
        pinBtn.setAttribute("aria-pressed", on ? "true" : "false");
      },
      renderPinCompact: (e, body) => {
        body.innerHTML = e.store.allThreads().map(t => {
          const meta = e.store.statusForThread(t, e.store.isRunning(t.id));
          return '<button class="pmq-w3-pinrow' + (t.id === e.store.activeKey() ? " pmq-active" : "") + '" type="button" data-thread="' + t.id + '">' +
            kit.statusGlyph(meta) +
            '<span class="pmq-w3-pinrow-t">' + esc(kit.threadTitle(e, t.id)) + "</span></button>";
        }).join("");
        window.PMIcons.hydrate(body);
      },
      renderPinMicro: (e, body) => {
        body.innerHTML = e.store.allThreads().map(t => {
          const meta = e.store.statusForThread(t, e.store.isRunning(t.id));
          return '<button class="pmq-w3-pinmicro' + (t.id === e.store.activeKey() ? " pmq-active" : "") + '" type="button" data-thread="' + t.id + '" title="' + esc(t.title) + '">' +
            kit.statusGlyph(meta) + '<span class="pmq-w3-micro-i">' + esc((t.title || "?").charAt(0).toUpperCase()) + "</span></button>";
        }).join("");
        window.PMIcons.hydrate(body);
      }
    });

    watchSprouts(root, "50%", "-12%");

    return {
      update(patch) {
        Object.assign(env, patch);
        regions.sync();
      },
      unmount() { kit.dispose(root); hostEl.classList.remove("pmq-w3"); hostEl.innerHTML = ""; },
      getOverlayRoot() { return document.body; }
    };
  }

  window.PMChatWindows[ID] = { id: ID, label: window.PMChatRegistry.windowLabel(ID), mount };
})();
