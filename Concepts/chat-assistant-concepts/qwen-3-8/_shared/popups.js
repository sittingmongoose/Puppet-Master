window.PMChatPopups = (() => {
  let current = null;
  let flyout = null;

  function cornerOf(anchor) {
    const r = anchor.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const ox = cx < window.innerWidth / 2 ? "0%" : "100%";
    const oy = cy < window.innerHeight / 2 ? "0%" : "100%";
    return { ox, oy, rect: r };
  }

  function place(el, anchor, opts) {
    const { rect } = cornerOf(anchor);
    el.style.visibility = "hidden";
    el.style.left = "0px";
    el.style.top = "0px";
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const M = 8;
    let left;
    if (opts.align === "left") left = rect.left;
    else if (opts.align === "right") left = rect.right - w;
    else {
      left = rect.left + rect.width / 2 - w / 2;
      if (left < M) left = rect.left;
      else if (left + w > vw - M) left = rect.right - w;
    }
    left = Math.max(M, Math.min(left, vw - w - M));
    let top;
    if (rect.bottom + h + 10 <= vh) top = rect.bottom + 6;
    else if (rect.top - h - 10 >= 0) top = rect.top - h - 6;
    else top = Math.max(M, vh - h - M);
    top = Math.min(top, vh - h - M);
    if (top < M) top = M;
    el.style.left = Math.round(left) + "px";
    el.style.top = Math.round(top) + "px";
    const relX = rect.left + rect.width / 2 - left;
    el.style.setProperty("--sprout-ox", Math.max(12, Math.min(w - 12, relX)) + "px");
    el.style.setProperty("--sprout-oy", top >= rect.bottom ? "0%" : "100%");
    el.style.visibility = "";
  }

  function closeActive() {
    if (flyout) dismiss(flyout, true);
    if (current) dismiss(current, true);
  }

  function dismiss(entry, silent) {
    if (!entry) return;
    const { el, anchor, onclose } = entry;
    if (current === entry) current = null;
    if (flyout === entry) flyout = null;
    if (anchor && anchor.setAttribute) anchor.setAttribute("aria-expanded", "false");
    if (entry.onresize) window.removeEventListener("resize", entry.onresize);
    if (entry.outside) document.removeEventListener("pointerdown", entry.outside, true);
    if (entry.esc) document.removeEventListener("keydown", entry.esc, true);
    el.classList.add("pmq-popup-closing");
    const remove = () => el.remove();
    if (document.documentElement.dataset.motion === "reduced" || !el.animate) remove();
    else setTimeout(remove, 230);
    if (entry.restoreFocus && entry.prevFocus && entry.prevFocus.focus && document.contains(entry.prevFocus)) {
      try { entry.prevFocus.focus(); } catch (e) {}
    }
    if (onclose && !silent) onclose();
  }

  function open(anchor, build, opts) {
    opts = opts || {};
    const prevFocus = document.activeElement;
    if (!opts.keepOthers) closeActive();
    const el = document.createElement("div");
    el.className = "pmq-popup" + (opts.cls ? " " + opts.cls : "");
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "false");
    el.setAttribute("aria-label", opts.title || "Popup");
    el.setAttribute("tabindex", "-1");
    if (opts.width) el.style.width = opts.width + "px";
    if (typeof build === "string") el.innerHTML = build;
    else el.appendChild(build);
    document.body.appendChild(el);
    const entry = { el, anchor, onclose: opts.onclose, prevFocus: prevFocus };
    if (opts.flyoutOf) flyout = entry;
    else current = entry;
    if (anchor && anchor.setAttribute) anchor.setAttribute("aria-expanded", "true");
    place(el, anchor, opts);
    const focusables = () => [...el.querySelectorAll('input:not([disabled]), textarea:not([disabled]), [role=menuitem]:not([disabled]), button:not([disabled]), a[href]')];
    window.addEventListener("resize", entry.onresize = () => place(el, anchor, opts), { once: false });
    if (!opts.modal) {
      setTimeout(() => {
        document.addEventListener("pointerdown", entry.outside = e => {
          if (el.contains(e.target)) return;
          if (flyout && flyout !== entry && flyout.el.contains(e.target)) return;
          if (anchor && anchor.contains && anchor.contains(e.target)) return;
          dismiss(entry);
        }, true);
      }, 0);
    }
    document.addEventListener("keydown", entry.esc = e => {
      if (e.key === "Escape") { e.stopPropagation(); entry.restoreFocus = true; dismiss(entry); }
    }, true);
    el.addEventListener("keydown", e => {
      const ae = document.activeElement;
      const tag = ae ? ae.tagName : "";
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) { e.preventDefault(); return; }
        const first = f[0], last = f[f.length - 1];
        if (!el.contains(ae)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && ae === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && ae === last) { e.preventDefault(); first.focus(); }
        return;
      }
      if (typing) return;
      const items = [...el.querySelectorAll('[role=menuitem]:not([disabled])')];
      if (!items.length) return;
      const idx = items.indexOf(ae);
      if (e.key === "ArrowDown") { e.preventDefault(); items[(idx + 1) % items.length].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); items[(idx - 1 + items.length) % items.length].focus(); }
      else if (e.key === "Home") { e.preventDefault(); items[0].focus(); }
      else if (e.key === "End") { e.preventDefault(); items[items.length - 1].focus(); }
    });
    if (!opts.flyoutOf) {
      setTimeout(() => { if (!el.contains(document.activeElement)) { const f = focusables(); if (f.length) f[0].focus(); else el.focus(); } }, 30);
    }
    if (opts.onopen) opts.onopen(el, entry);
    return entry;
  }

  function menu(anchor, items, opts) {
    opts = opts || {};
    const wrap = document.createElement("div");
    if (opts.title) {
      const head = document.createElement("div");
      head.className = "pmq-popup-head";
      head.textContent = opts.title;
      wrap.appendChild(head);
    }
    if (opts.search) {
      const field = document.createElement("div");
      field.className = "pmq-search-field";
      field.innerHTML = '<i data-ico="search"></i><input type="text" placeholder="Filter" spellcheck="false">';
      wrap.appendChild(field);
      window.PMIcons.hydrate(field);
    }
    const body = document.createElement("div");
    body.className = "pmq-popup-body pmq-scroll";
    body.setAttribute("role", "menu");
    wrap.appendChild(body);
    const filtered = items;
    function render(q) {
      body.innerHTML = "";
      filtered.filter(it => it.sep || !q || (it.label + " " + (it.sub || "")).toLowerCase().includes(q)).forEach(it => {
        if (it.sep) { const s = document.createElement("div"); s.className = "pmq-menu-sep"; body.appendChild(s); return; }
        const b = document.createElement("button");
        b.className = "pmq-menu-item" + (it.danger ? " pmq-menu-danger" : "");
        b.type = "button";
        b.setAttribute("role", it.checked != null ? "menuitemcheckbox" : "menuitem");
        b.setAttribute("tabindex", "-1");
        if (it.checked != null) b.setAttribute("aria-checked", it.checked ? "true" : "false");
        if (it.disabled) b.disabled = true;
        b.innerHTML = (it.icon ? '<i data-ico="' + it.icon + '"></i>' : "") +
          "<span>" + window.PMFmt.esc(it.label) + "</span>" +
          (it.sub ? '<span class="pmq-menu-sub">' + window.PMFmt.esc(it.sub) + "</span>" : "");
        b.addEventListener("click", () => { if (it.keepOpen) { it.onpick && it.onpick(b); return; } if (current) current.restoreFocus = true; dismiss(current); it.onpick && it.onpick(b); });
        if (it.onhover) b.addEventListener("mouseenter", () => it.onhover(b));
        body.appendChild(b);
      });
      window.PMIcons.hydrate(body);
      if (opts.onrender) opts.onrender(body);
    }
    render("");
    if (opts.search) {
      const input = wrap.querySelector("input");
      input.addEventListener("input", () => render(input.value.trim().toLowerCase()));
    }
    return open(anchor, wrap, Object.assign({}, opts, { onopen: (el, entry) => {
      const input = el.querySelector(".pmq-search-field input");
      if (input) setTimeout(() => input.focus(), 30);
      entry.renderItems = render;
      entry.bodyEl = body;
      if (opts.onopen) opts.onopen(el, entry);
    } }));
  }

  function resizeInPlace(entry, mutate) {
    if (!entry) return;
    const el = entry.el;
    const before = el.getBoundingClientRect();
    mutate();
    el.style.animation = "none";
    requestAnimationFrame(() => {
      const after = el.getBoundingClientRect();
      const dy = before.height !== after.height;
      if (!dy) return;
      el.style.transition = "none";
      place(el, entry.anchor, {});
    });
  }

  function getActive() { return current; }
  function getFlyout() { return flyout; }

  return { open, menu, dismiss, closeActive, resizeInPlace, getActive, getFlyout, cornerOf, place };
})();
