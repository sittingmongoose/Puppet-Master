/* ============================================================================
   pm-v2-menu.js — Puppet Master popup-menu standard for concepts 05–11
   ----------------------------------------------------------------------------
   The packet requires the PM popup-menu family everywhere: collision handling,
   layering, submenus, and open/close behavior identical across concepts. This
   is a *standard* (like the shell), not a concept renderer — concepts own all
   other visible UI. Uses .pm-menu classes from pm-components.css.

     var menu = PMV2Menu.open(anchorOrPoint, items, opts)
   items: {label, hint?, icon?, disabled?, danger?, checked?, action?,
           submenu?: [items]} | {sep:true}
   opts:  {placement: "bottom-start"|"bottom-end"|"right-start",
           onClose, ariaLabel}
   Behavior: Escape closes one layer; Arrow keys move; ArrowRight opens a
   submenu; ArrowLeft closes it; Home/End jump; type-ahead jumps by label;
   pointer-outside closes the whole stack; viewport collision flips/shifts.
   ========================================================================== */
(function () {
  "use strict";

  var stack = [];

  function closeFrom(depth) {
    while (stack.length > depth) {
      var m = stack.pop();
      if (m.el.parentNode) m.el.parentNode.removeChild(m.el);
    }
    if (!stack.length) {
      document.removeEventListener("pointerdown", onDocDown, true);
      document.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", closeAll);
    }
  }
  function closeAll() { closeFrom(0); }

  function onDocDown(e) {
    for (var i = stack.length - 1; i >= 0; i--) {
      if (stack[i].el.contains(e.target)) return;
    }
    closeAll();
  }

  function focusItem(m, idx) {
    var items = m.items;
    if (!items.length) return;
    var i = ((idx % items.length) + items.length) % items.length;
    items[i].focus();
    m.activeIndex = i;
  }

  function onKey(e) {
    if (!stack.length) return;
    var m = stack[stack.length - 1];
    var k = e.key;
    if (k === "Escape") { e.stopPropagation(); e.preventDefault(); closeFrom(stack.length - 1); return; }
    if (k === "ArrowDown") { e.preventDefault(); focusItem(m, m.activeIndex + 1); return; }
    if (k === "ArrowUp") { e.preventDefault(); focusItem(m, m.activeIndex - 1); return; }
    if (k === "Home") { e.preventDefault(); focusItem(m, 0); return; }
    if (k === "End") { e.preventDefault(); focusItem(m, m.items.length - 1); return; }
    if (k === "ArrowLeft") { if (stack.length > 1) { e.preventDefault(); closeFrom(stack.length - 1); } return; }
    if (k === "ArrowRight") {
      var el = m.el.querySelectorAll(".pm-menu-item")[m.activeIndex];
      if (el && el.__submenu) { e.preventDefault(); openSub(m, el); }
      return;
    }
    if (k && k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      var ch = k.toLowerCase();
      var items = m.items;
      for (var i = 1; i <= items.length; i++) {
        var cand = items[(m.activeIndex + i) % items.length];
        if (cand && cand.textContent && cand.textContent.trim().toLowerCase().indexOf(ch) === 0) {
          focusItem(m, (m.activeIndex + i) % items.length);
          break;
        }
      }
    }
  }

  function place(el, rect, placement) {
    // collision handling: flip vertical/horizontal when overflowing
    var vw = window.innerWidth, vh = window.innerHeight;
    el.style.visibility = "hidden";
    el.style.position = "fixed";
    el.style.zIndex = String(90 + stack.length);
    document.body.appendChild(el);
    var w = el.offsetWidth, h = el.offsetHeight;
    var x = rect.left, y = rect.bottom + 4;
    if (placement === "bottom-end") x = rect.right - w;
    if (placement === "right-start") { x = rect.right + 2; y = rect.top; }
    if (x + w > vw - 8) x = Math.max(8, vw - w - 8);
    if (y + h > vh - 8) {
      var flipped = rect.top - h - 4;
      y = flipped >= 8 ? flipped : Math.max(8, vh - h - 8);
    }
    el.style.insetInlineStart = Math.max(8, x) + "px";
    el.style.top = Math.max(8, y) + "px";
    el.style.visibility = "";
  }

  function buildLayer(items, opts, depth) {
    var el = document.createElement("div");
    el.className = "pm-menu";
    el.setAttribute("role", "menu");
    el.setAttribute("data-pop", "1");
    if (opts.ariaLabel) el.setAttribute("aria-label", opts.ariaLabel);
    var m = { el: el, items: [], activeIndex: -1 };
    items.forEach(function (it) {
      if (it.sep) {
        var sep = document.createElement("div");
        sep.className = "pm-menu-sep";
        el.appendChild(sep);
        return;
      }
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pm-menu-item";
      b.setAttribute("role", "menuitem");
      b.textContent = it.label;
      if (it.hint) {
        var hint = document.createElement("span");
        hint.className = "pm-menu-keys";
        hint.textContent = it.hint;
        b.appendChild(hint);
      }
      if (it.disabled) b.setAttribute("aria-disabled", "true");
      if (it.checked) b.setAttribute("aria-checked", "true");
      if (it.danger) b.setAttribute("data-danger", "true");
      if (it.submenu) {
        b.setAttribute("aria-haspopup", "menu");
        b.__submenu = it.submenu;
      }
      b.addEventListener("click", function () {
        if (it.disabled) return;
        if (it.submenu) { openSub(m, b); return; }
        closeAll();
        if (it.action) it.action();
      });
      el.appendChild(b);
      m.items.push(b);
    });
    return m;
  }

  function openSub(parent, itemEl) {
    var rect = itemEl.getBoundingClientRect();
    var m = buildLayer(itemEl.__submenu, {}, stack.length);
    stack.push(m);
    place(m.el, rect, "right-start");
    focusItem(m, 0);
  }

  /**
   * open(anchor, items, opts)
   * anchor: DOM element (its bounding rect is used) or {left,right,top,bottom}.
   */
  function open(anchor, items, opts) {
    opts = opts || {};
    closeAll();
    var rect = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : anchor;
    var m = buildLayer(items, opts, 0);
    stack.push(m);
    place(m.el, rect, opts.placement || "bottom-start");
    document.addEventListener("pointerdown", onDocDown, true);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", closeAll);
    focusItem(m, 0);
    return {
      close: closeAll,
      el: m.el
    };
  }

  window.PMV2Menu = { open: open, closeAll: closeAll, depth: function () { return stack.length; } };
})();
