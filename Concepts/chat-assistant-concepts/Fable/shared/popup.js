// Fable — popup family engine implementing the locked Model/Mode selector contract:
// click activation, shared chrome, corner-origin animation, nested submenus,
// in-place resize, collision handling, ONE transient overlay, reduced-motion final state.
// Plates are opaque; positioning uses viewport collision flips, not measurement-as-state.

let current = null;          // the single transient overlay
let escHandler = null;

export function closePopup() {
  if (current) {
    current.root.remove();
    if (current.restoreFocus && document.contains(current.restoreFocus)) current.restoreFocus.focus();
    current = null;
  }
  if (escHandler) { document.removeEventListener("keydown", escHandler, true); escHandler = null; }
  document.removeEventListener("pointerdown", onOutside, true);
}

function onOutside(e) {
  if (current && !current.root.contains(e.target) && !current.anchor.contains(e.target)) closePopup();
}

export function isPopupOpen() { return !!current; }

// openPopup(anchorEl, build) — build(popupApi) returns content element.
// popupApi: { close, replace(contentEl), reposition() } for nested/in-place resize.
export function openPopup(anchor, build, opts = {}) {
  const wasOpenFor = current && current.anchor === anchor;
  closePopup();
  if (wasOpenFor && !opts.forceReopen) return null;   // toggle behavior

  const root = document.createElement("div");
  root.className = "pm-popup pm-popup-enter pm-plate";
  root.setAttribute("role", opts.role || "menu");
  if (opts.width) root.style.minWidth = opts.width + "px";

  const body = document.createElement("div");
  body.className = "pm-popup-body pm-scroll";
  root.appendChild(body);

  const api = {
    close: closePopup,
    root,
    replace(el) {
      body.replaceChildren(el);
      api.reposition();
    },
    append(el) { body.appendChild(el); },
    reposition() { position(root, anchor, opts); },
  };

  const content = build(api);
  if (content) body.appendChild(content);

  document.body.appendChild(root);
  position(root, anchor, opts);

  current = { root, anchor, restoreFocus: opts.restoreFocus === false ? null : (document.activeElement || anchor) };
  escHandler = (e) => {
    if (e.key === "Escape") { e.stopPropagation(); closePopup(); }
  };
  document.addEventListener("keydown", escHandler, true);
  setTimeout(() => document.addEventListener("pointerdown", onOutside, true), 0);

  const focusable = root.querySelector("button, [tabindex], input");
  if (focusable && opts.autofocus !== false) focusable.focus();
  return api;
}

function position(root, anchor, opts = {}) {
  const pad = 8;
  const r = anchor.getBoundingClientRect();
  // Presentation-only geometry (allowed): collision flips around the anchor.
  const w = root.offsetWidth, h = root.offsetHeight;
  const vw = window.innerWidth, vh = window.innerHeight;
  let left = opts.align === "end" ? r.right - w : r.left;
  let top = r.bottom + 6;
  let originX = opts.align === "end" ? "right" : "left";
  let originY = "top";
  if (left + w > vw - pad) left = Math.max(pad, vw - pad - w);
  if (left < pad) left = pad;
  if (top + h > vh - pad) {
    const above = r.top - 6 - h;
    if (above > pad) { top = above; originY = "bottom"; }
    else { top = Math.max(pad, vh - pad - h); }
  }
  root.style.left = left + "px";
  root.style.top = top + "px";
  root.style.transformOrigin = `${originY} ${originX}`;
}

// ---------- row builders (shared chrome) ----------
export function popupRow({ icon = "", label, sub = "", side = "", selected = false, disabled = false, onClick }) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "pm-popup-row";
  b.setAttribute("role", "menuitem");
  if (selected) b.dataset.selected = "true";
  if (disabled) { b.setAttribute("aria-disabled", "true"); }
  b.innerHTML = `${icon}<span class="pm-row-main"><span>${escapeHtml(label)}</span>${sub ? `<span class="pm-row-sub">${escapeHtml(sub)}</span>` : ""}</span>${side ? `<span class="pm-row-side">${escapeHtml(side)}</span>` : ""}`;
  if (!disabled && onClick) b.addEventListener("click", onClick);
  return b;
}

export function popupTitle(text) {
  const d = document.createElement("div");
  d.className = "pm-popup-title";
  d.textContent = text;
  return d;
}

export function popupSep() {
  const d = document.createElement("div");
  d.className = "pm-popup-sep";
  return d;
}

export function popupNote(text) {
  const d = document.createElement("div");
  d.className = "pm-popup-note";
  d.textContent = text;
  return d;
}

export function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
