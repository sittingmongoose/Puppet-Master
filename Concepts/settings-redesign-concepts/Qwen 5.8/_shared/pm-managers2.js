/* PMManagers2 — product grammar atoms for concepts 05–11.
 * Semantics only (row grammar, chips, badges, popups, dialogs, virtual lists).
 * Composition, layout, navigation, and motion remain concept-native. */
(function () {
  "use strict";

  function esc(x) {
    return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function ico(n, s) { return window.PMIcons.get(n, s || 14); }

  function sourceChip(source) {
    var map = {
      "default": ["Default", "muted"], "custom": ["Custom", "info"], "managed": ["Managed", "managed"],
      "unavailable": ["Unavailable", "muted"], "restart": ["Restart required", "warn"],
      "reconnect": ["Reconnect required", "warn"], "changed-elsewhere": ["Changed elsewhere", "diff"]
    };
    var m = map[source] || ["Custom", "info"];
    return '<span class="pm-badge pm-badge-' + m[1] + '">' + m[0] + "</span>";
  }

  function controlFor(inv, st) {
    var dis = st && (st.source === "managed" || st.source === "unavailable");
    var d = dis ? " disabled" : "";
    var v = st ? st.value : (inv.default !== undefined ? inv.default : "");
    if (inv.type === "toggle") {
      return '<button class="pm-toggle" role="switch" aria-checked="' + (v ? "true" : "false") + '" data-ctl="toggle" data-setting="' + esc(inv.id) + '"' + d + '><span class="pm-toggle-knob"></span></button>';
    }
    if (inv.type === "select" || inv.type === "radio") {
      var opts = (inv.options || []).map(function (o) {
        return '<option value="' + esc(o) + '"' + (String(o) === String(v) ? " selected" : "") + ">" + esc(o) + "</option>";
      }).join("");
      return '<select class="pm-select" data-ctl="select" data-setting="' + esc(inv.id) + '"' + d + ">" + opts + "</select>";
    }
    if (inv.type === "number" || inv.type === "slider") {
      return '<input class="pm-input" type="number" style="width:96px" data-ctl="number" data-setting="' + esc(inv.id) + '" value="' + esc(v) + '"' + d + ">";
    }
    if (inv.type === "action") {
      return '<button class="pm-btn pm-btn-sm" data-ctl="action" data-setting="' + esc(inv.id) + '"' + d + ">" + esc(inv.actionLabel || "Run") + "</button>";
    }
    if (inv.type === "multiselect" || inv.type === "list" || inv.type === "keyvalue") {
      return '<button class="pm-btn pm-btn-sm" data-ctl="complex" data-setting="' + esc(inv.id) + '"' + d + ">Manage</button>";
    }
    return '<input class="pm-input" data-ctl="text" data-setting="' + esc(inv.id) + '" value="' + esc(v) + '"' + d + ">";
  }

  /* Product setting row: human title, one explanation, value/control, needed status only.
   * Advanced evidence behind Details. Concepts wrap this atom in their own composition. */
  function row(inv, st, opts) {
    var o = opts || {};
    var chip = st && st.source !== "default" ? sourceChip(st.source) : "";
    var detail =
      '<div class="pm2-row-detail" hidden>' +
      "<dl>" +
      "<div><dt>Setting ID</dt><dd>" + esc(inv.id) + "</dd></div>" +
      "<div><dt>Exposure</dt><dd>" + esc(inv.tier || "standard") + "</dd></div>" +
      "<div><dt>Default</dt><dd>" + esc(inv.default !== undefined ? inv.default : "—") + "</dd></div>" +
      (inv.recommended ? "<div><dt>Recommended</dt><dd>" + esc(inv.recommended) + "</dd></div>" : "") +
      "<div><dt>Why this value?</dt><dd>" + esc(o.why || "Stored for this Project. Advanced evidence (origin, policy, diagnostics) lives here, not on every row.") + "</dd></div>" +
      "</dl>" +
      '<div class="pm2-row-actions">' +
      '<button class="pm-btn pm-btn-sm" data-rowact="reset" data-setting="' + esc(inv.id) + '">Reset to default</button>' +
      '<button class="pm-btn pm-btn-quiet pm-btn-sm" data-rowact="close-detail">Close</button>' +
      "</div></div>";
    return '<div class="pm2-row" data-row="' + esc(inv.id) + '" data-type="' + esc(inv.type) + '">' +
      '<div class="pm2-row-main"><div class="pm2-row-title">' + esc(inv.label) + " " + chip + "</div>" +
      '<div class="pm2-row-desc">' + esc(inv.desc) + "</div></div>" +
      '<div class="pm2-row-ctl">' + controlFor(inv, st) +
      '<button class="pm-btn pm-btn-quiet pm-btn-sm pm-btn-ico" data-rowact="details" aria-label="Details for ' + esc(inv.label) + '" aria-expanded="false">' + ico("info", 13) + "</button></div>" +
      detail + "</div>";
  }

  // bind row controls to PMState2 within a container
  function bindRows(container) {
    var S2 = window.PMState2;
    container.addEventListener("change", function (e) {
      var el = e.target;
      var id = el.getAttribute && el.getAttribute("data-setting");
      if (!id) return;
      var ctl = el.getAttribute("data-ctl");
      if (ctl === "select" || ctl === "text" || ctl === "number") {
        var val = ctl === "number" ? +el.value : el.value;
        S2.setSetting(id, val);
      }
    });
    container.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target : null;
      if (!t) return;
      var tog = e.target.closest("[data-ctl='toggle']");
      if (tog) {
        var id = tog.getAttribute("data-setting");
        var cur = S2.getSetting(id);
        S2.setSetting(id, !(cur && cur.value));
        return;
      }
      var act = e.target.closest("[data-ctl='action'],[data-ctl='complex']");
      if (act) {
        var aid = act.getAttribute("data-setting");
        var inv = S2.inventory(aid);
        var op = S2.beginOp({ title: (inv && inv.label) || aid, phase: "Running", determinate: false });
        setTimeout(function () { S2.finishOp(op, "completed", "Done"); S2.receipt("Action complete", (inv ? inv.label : aid) + " finished for this Project.", "ok"); }, 700);
        return;
      }
      var det = e.target.closest("[data-rowact='details']");
      if (det) {
        var r = det.closest(".pm2-row");
        var d = r.querySelector(".pm2-row-detail");
        var open = d.hasAttribute("hidden");
        if (open) d.removeAttribute("hidden"); else d.setAttribute("hidden", "");
        det.setAttribute("aria-expanded", open ? "true" : "false");
        return;
      }
      var cl = e.target.closest("[data-rowact='close-detail']");
      if (cl) {
        var rr = cl.closest(".pm2-row");
        rr.querySelector(".pm2-row-detail").setAttribute("hidden", "");
        rr.querySelector("[data-rowact='details']").setAttribute("aria-expanded", "false");
        return;
      }
      var rs = e.target.closest("[data-rowact='reset']");
      if (rs) { S2.resetSetting(rs.getAttribute("data-setting")); }
    });
  }

  /* PM popup-menu standard with collision handling (Model/Mode selector family). */
  function popupMenu(anchor, items, onPick) {
    closePopupMenu();
    var m = document.createElement("div");
    m.className = "pm-pop-menu";
    m.style.position = "fixed";
    items.forEach(function (it) {
      if (it.note) {
        var n = document.createElement("div");
        n.className = "pm-pop-menu-note";
        n.textContent = it.note;
        m.appendChild(n);
        return;
      }
      var b = document.createElement("button");
      b.textContent = it.label;
      if (it.active) b.style.fontWeight = "700";
      b.addEventListener("click", function (e) { e.stopPropagation(); closePopupMenu(); if (onPick) onPick(it); });
      m.appendChild(b);
    });
    document.body.appendChild(m);
    var r = anchor.getBoundingClientRect();
    var mw = m.offsetWidth, mh = m.offsetHeight;
    var left = Math.min(window.innerWidth - mw - 8, Math.max(8, r.left));
    var top = r.bottom + 4;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 4); // flip on collision
    m.style.left = left + "px";
    m.style.top = top + "px";
    setTimeout(function () {
      document.addEventListener("click", function h(e) {
        if (!m.contains(e.target) && e.target !== anchor) { closePopupMenu(); document.removeEventListener("click", h); }
      });
    }, 0);
    _pm2pop = m;
    return m;
  }
  var _pm2pop = null;
  function closePopupMenu() { if (_pm2pop && _pm2pop.parentNode) _pm2pop.parentNode.removeChild(_pm2pop); _pm2pop = null; }

  /* Windowed virtual list: renders only visible slice; stable row ids. */
  function virtualList(opts) {
    var host = opts.host; // scrollable element
    var rowH = opts.rowHeight || 56;
    var render = opts.render;
    var data = opts.data || [];
    var padTop = document.createElement("div");
    var padBot = document.createElement("div");
    var win = document.createElement("div");
    host.innerHTML = "";
    host.appendChild(padTop); host.appendChild(win); host.appendChild(padBot);
    var raf = null;
    function layout() {
      var vh = host.clientHeight;
      var start = Math.max(0, Math.floor(host.scrollTop / rowH) - 6);
      var end = Math.min(data.length, Math.ceil((host.scrollTop + vh) / rowH) + 6);
      padTop.style.height = (start * rowH) + "px";
      padBot.style.height = ((data.length - end) * rowH) + "px";
      var html = "";
      for (var i = start; i < end; i++) html += render(data[i], i);
      win.innerHTML = html;
      if (opts.onWindow) opts.onWindow(start, end, data.length);
    }
    host.addEventListener("scroll", function () {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = null; layout(); });
    });
    layout();
    return {
      set: function (d) { data = d; host.scrollTop = 0; layout(); },
      refresh: layout,
      scrollToIndex: function (i) { host.scrollTop = Math.max(0, i * rowH - host.clientHeight / 3); layout(); }
    };
  }

  function skeleton(label) {
    return '<div class="pm2-skeleton" data-skeleton="1" aria-label="' + esc(label || "Loading") + '"><span class="pm2-sk-bar"></span><span class="pm2-sk-bar w60"></span><span class="pm2-sk-bar w40"></span></div>';
  }

  window.PMManagers2 = {
    esc: esc, ico: ico, row: row, bindRows: bindRows, controlFor: controlFor,
    sourceChip: sourceChip, popupMenu: popupMenu, closePopupMenu: closePopupMenu,
    virtualList: virtualList, skeleton: skeleton
  };
})();
