/* Opus 5 — the Puppet Master popup-menu contract, headless.
 *
 * The packet requires popup menus to behave like the current Model/Mode selector
 * family: anchored to their trigger, flipping rather than running off-screen, layered
 * so a submenu sits above its parent, and closing one layer at a time on Escape.
 *
 * What lives here is the BEHAVIOUR — where a menu goes, which layer it is on, when it
 * closes. What does not live here is a single pixel of the menu itself: each concept
 * renders its own trigger, panel, rows and motion, because a shared visible menu would
 * be exactly the "one application in seven skins" the bakeoff exists to avoid.
 *
 * Portability note (Slint 1.17.1): `place()` is pure geometry in, geometry out. It
 * measures nothing itself — the caller passes the two rectangles — so the same function
 * drives a Slint PopupWindow placement without carrying any DOM assumptions.
 */
(function () {
  "use strict";

  var GAP = 4;
  var EDGE = 8;

  /* The open menus, outermost first. A stack rather than a single reference, because
   * Escape must close the submenu and leave its parent open. */
  var stack = [];

  /* ------------------------------------------------------------------ geometry */

  /* Where a panel of `size` should sit relative to `anchor` inside `view`.
   *
   * Below the trigger by default. When there is not room below but there is above, it
   * FLIPS — the model picker in the bottom bar opens upward for exactly this reason.
   * When neither side fits, it takes the roomier one and reports the height it may use,
   * so the caller can make the panel scroll rather than overflow the screen. */
  function place(anchor, size, view, opts) {
    var o = opts || {};
    var gap = o.gap == null ? GAP : o.gap;
    var edge = o.edge == null ? EDGE : o.edge;
    var align = o.align || "start";

    var roomBelow = view.height - anchor.bottom - gap - edge;
    var roomAbove = anchor.top - gap - edge;

    var side, maxHeight;
    if (size.height <= roomBelow) { side = "below"; maxHeight = roomBelow; }
    else if (size.height <= roomAbove) { side = "above"; maxHeight = roomAbove; }
    else if (roomAbove > roomBelow) { side = "above"; maxHeight = Math.max(120, roomAbove); }
    else { side = "below"; maxHeight = Math.max(120, roomBelow); }

    var height = Math.min(size.height, maxHeight);
    var top = side === "below" ? anchor.bottom + gap : anchor.top - gap - height;

    /* Horizontal: align to the trigger, then SHIFT back inside the viewport rather than
     * flipping — a menu that jumps to the other side of its trigger reads as a different
     * menu. Shifting keeps it visibly attached to the thing that opened it. */
    var left = align === "end" ? anchor.right - size.width : anchor.left;
    if (align === "center") left = anchor.left + (anchor.width - size.width) / 2;
    var maxLeft = view.width - size.width - edge;
    if (left > maxLeft) left = maxLeft;
    if (left < edge) left = edge;

    return {
      left: Math.round(left),
      top: Math.round(top),
      side: side,
      maxHeight: Math.round(maxHeight),
      height: Math.round(height),
      flipped: side === "above",
      shifted: Math.round(left) !== Math.round(align === "end" ? anchor.right - size.width : anchor.left)
    };
  }

  /* ------------------------------------------------------------------ the stack */

  /* `close` is the concept's own teardown. The stack only decides WHEN it runs, so a
   * submenu can close without disturbing the menu that opened it. */
  function open(entry) {
    if (!entry || typeof entry.close !== "function") return null;
    var depth = entry.parent ? indexOf(entry.parent) + 1 : 0;
    /* Opening a menu at depth N closes anything already at N or deeper: two sibling
     * menus are never open at once, which is what stops a page collecting orphans. */
    closeFrom(depth);
    entry.depth = depth;
    stack.push(entry);
    return entry;
  }

  function indexOf(entry) {
    for (var i = 0; i < stack.length; i++) if (stack[i] === entry) return i;
    return -1;
  }

  function closeFrom(depth) {
    while (stack.length > depth) {
      var top = stack.pop();
      try { top.close(); } catch (e) { /* a broken teardown must not strand the stack */ }
    }
  }

  function closeTop() {
    if (!stack.length) return false;
    closeFrom(stack.length - 1);
    return true;
  }

  function closeAll() { closeFrom(0); return true; }

  function depth() { return stack.length; }
  function isOpen() { return stack.length > 0; }

  /* The element a click landed in still belongs to an open menu — used so an outside
   * click closes, and an inside click does not. */
  function contains(node) {
    for (var i = 0; i < stack.length; i++) {
      var el = stack[i].element;
      if (el && node && el.contains && el.contains(node)) return true;
    }
    return false;
  }

  /* --------------------------------------------------------------- keyboard nav */

  /* Roving focus within one menu. Home/End included because a fifty-model list is
   * unusable without them. */
  function move(items, current, key) {
    if (!items.length) return -1;
    var i = current;
    if (key === "ArrowDown") i = current < 0 ? 0 : (current + 1) % items.length;
    else if (key === "ArrowUp") i = current <= 0 ? items.length - 1 : current - 1;
    else if (key === "Home") i = 0;
    else if (key === "End") i = items.length - 1;
    else return current;
    return i;
  }

  /* One document-level listener for the whole page, installed once. Escape closes the
   * top layer only; an outside pointer-down closes everything. */
  var wired = false;
  function wire() {
    if (wired || !document || !document.addEventListener) return;
    wired = true;
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !stack.length) return;
      /* Stop the concept's own Escape handler from also stepping a route back: the
       * reader pressed Escape to dismiss the menu, not to leave the page.
       *
       * Both are needed. Concepts register their Escape handler on `document` in the
       * capture phase, the same node and phase as this one, and `stopPropagation` only
       * stops the event reaching the NEXT node — listeners already attached to this one
       * still run. Without `stopImmediatePropagation` a single Escape closed the menu
       * and stepped the route in the same keypress. */
      e.stopPropagation();
      e.stopImmediatePropagation();
      closeTop();
    }, true);
    document.addEventListener("pointerdown", function (e) {
      if (!stack.length) return;
      if (contains(e.target)) return;
      closeAll();
    }, true);
  }
  wire();

  /* Where a SUBMENU goes. A second level does not hang under its parent row — it opens
   * beside the parent panel, which is what keeps the reader's place in the first level
   * visible while the second is open. To the right by default; to the left when the
   * panel is already near the right edge; clamped vertically so a long second level
   * never runs off the bottom. */
  function placeSide(parentRect, rowRect, size, view, opts) {
    var o = opts || {};
    var gap = o.gap == null ? 2 : o.gap;
    var edge = o.edge == null ? EDGE : o.edge;

    var roomRight = view.width - parentRect.right - gap - edge;
    var roomLeft = parentRect.left - gap - edge;
    var side = size.width <= roomRight ? "right" : (size.width <= roomLeft ? "left" : (roomRight >= roomLeft ? "right" : "left"));
    var left = side === "right" ? parentRect.right + gap : parentRect.left - gap - size.width;
    if (left < edge) left = edge;
    if (left + size.width > view.width - edge) left = Math.max(edge, view.width - edge - size.width);

    var maxHeight = view.height - 2 * edge;
    var height = Math.min(size.height, maxHeight);
    /* Align to the row that opened it, then pull back inside rather than flipping: a
     * submenu that jumps above its own parent row reads as a different menu. */
    var top = rowRect.top;
    if (top + height > view.height - edge) top = view.height - edge - height;
    if (top < edge) top = edge;

    return { left: Math.round(left), top: Math.round(top), side: side, maxHeight: Math.round(maxHeight), height: Math.round(height) };
  }

  /* ------------------------------------------------------------ option grouping */

  /* Which option lists genuinely have two levels. This is a short, explicit table
   * rather than a guess from string shape: a submenu that invents a grouping the
   * reader does not recognise is worse than a flat list. Everything not named here
   * stays flat, which is most of the inventory. */
  var GROUPS = {
    "general.visual.theme": [
      { label: "Friendly", match: /^Friendly / },
      { label: "Glass", match: /^Glass / },
      { label: "Retro", match: /^Retro / },
      { label: "Basic", match: /^Basic / }
    ],
    "ai.models.default-provider": [
      { label: "Direct API", members: ["anthropic", "openai", "gemini-direct", "alibaba", "minimax", "zai"] },
      { label: "Through a CLI", members: ["antigravity-cli", "codex", "opencode"] },
      { label: "Through an editor account", members: ["cursor", "github-copilot"] }
    ]
  };

  /* Returns groups only when every option lands in exactly one of them, so a menu can
   * never silently drop a choice: if the inventory gains a provider this table does not
   * know, the picker falls back to the honest flat list. */
  function groupsFor(recId, options) {
    var spec = GROUPS[recId];
    if (!spec || !options || options.length < 4) return null;
    var used = {};
    var out = [];
    for (var i = 0; i < spec.length; i++) {
      var g = spec[i];
      var members = options.filter(function (o) {
        if (used[o]) return false;
        return g.members ? g.members.indexOf(o) >= 0 : g.match.test(String(o));
      });
      members.forEach(function (o) { used[o] = true; });
      if (members.length) out.push({ label: g.label, options: members });
    }
    for (var k = 0; k < options.length; k++) if (!used[options[k]]) return null;
    return out.length > 1 ? out : null;
  }

  window.PM2Menu = {
    place: place,
    placeSide: placeSide,
    groupsFor: groupsFor,
    open: open,
    closeTop: closeTop,
    closeAll: closeAll,
    closeFrom: closeFrom,
    depth: depth,
    isOpen: isOpen,
    contains: contains,
    move: move,
    GAP: GAP,
    EDGE: EDGE
  };
})();
