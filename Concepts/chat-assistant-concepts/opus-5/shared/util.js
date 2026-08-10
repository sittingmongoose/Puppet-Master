/* PMX util — Opus 5
 * Small DOM + function-composition helpers used by every window and thread
 * concept in this workspace. No framework, no build step, ES5-compatible
 * syntax throughout (var, function expressions, no arrow functions, no
 * optional chaining) so it runs unmodified from file:// in Chromium.
 *
 * el() is the single most-used function in the workspace: it must be fast
 * and total (never throw on a reasonable input, always return a real node).
 * Strings passed as children or as attrs.text become textContent — never
 * innerHTML — so the workspace's no-emoji / no-underscore policy scans stay
 * meaningful. attrs.html is opt-in only, for trusted static markup, never
 * for demo data. Contract: CONTRACT.md section 9 ("read state from the DOM"
 * is the inverse mistake this file exists to avoid); SERVICES.md "PMXUtil".
 */
(function (global) {
  'use strict';

  var doc = global.document;

  /* ---- el() / frag() child normalization -------------------------------- */

  function appendChild(node, child) {
    if (child === null || child === undefined || child === false || child === true) return;
    if (Array.isArray(child)) {
      for (var i = 0; i < child.length; i++) appendChild(node, child[i]);
      return;
    }
    if (typeof child === 'string' || typeof child === 'number') {
      node.appendChild(doc.createTextNode(String(child)));
      return;
    }
    if (child.nodeType) {
      node.appendChild(child);
      return;
    }
    /* Anything else (plain object, function, etc.) is silently ignored so
     * el() stays total rather than throwing on a caller mistake. */
  }

  var SPECIAL_ATTR_KEYS = {
    class: true, id: true, text: true, html: true,
    style: true, data: true, aria: true, on: true
  };

  function applyClass(node, value) {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      var parts = [];
      for (var i = 0; i < value.length; i++) {
        if (value[i]) parts.push(value[i]);
      }
      node.className = parts.join(' ');
    } else {
      node.className = value;
    }
  }

  function applyStyle(node, styles) {
    for (var key in styles) {
      if (Object.prototype.hasOwnProperty.call(styles, key)) {
        var v = styles[key];
        if (v !== null && v !== undefined) node.style[key] = v;
      }
    }
  }

  /* HTML lowercases attribute names, so a camelCase key passed straight through
   * lands as data-pmxrole, not data-pmx-role — and every stylesheet rule written
   * against the hyphenated name then silently matches nothing. That had already
   * killed three colour rules in t1 outright, and two thread modules carry
   * comments describing the quirk and hand-set the attribute to dodge it.
   * Converting here fixes the whole class of bug at its source. */
  function kebab(key) {
    return key.replace(/[A-Z]/g, function (c) { return '-' + c.toLowerCase(); });
  }

  function applyPrefixed(node, prefix, obj) {
    for (var key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      var v = obj[key];
      var name = prefix + kebab(key);
      if (v === null || v === undefined) node.removeAttribute(name);
      else node.setAttribute(name, v);
    }
  }

  function applyOn(node, handlers) {
    for (var ev in handlers) {
      if (Object.prototype.hasOwnProperty.call(handlers, ev) && typeof handlers[ev] === 'function') {
        node.addEventListener(ev, handlers[ev], false);
      }
    }
  }

  function applyPlainAttrs(node, attrs) {
    for (var key in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, key)) continue;
      if (SPECIAL_ATTR_KEYS[key]) continue;
      var v = attrs[key];
      if (v === null || v === undefined || v === false) { node.removeAttribute(key); continue; }
      if (v === true) { node.setAttribute(key, ''); continue; }
      node.setAttribute(key, v);
    }
  }

  /**
   * el(tag, attrs, children) -> HTMLElement
   * attrs: { class, id, text, html?, style:{}, data:{}, aria:{}, on:{}, ...anyAttr }
   * children: node | string | number | array (nested arrays flattened;
   *           null/undefined/boolean entries skipped). Strings become
   *           text nodes, never innerHTML.
   */
  function el(tag, attrs, children) {
    var node = doc.createElement(tag);
    if (attrs) {
      if (attrs.class !== undefined) applyClass(node, attrs.class);
      if (attrs.id !== undefined && attrs.id !== null) node.id = attrs.id;
      if (attrs.style) applyStyle(node, attrs.style);
      if (attrs.data) applyPrefixed(node, 'data-', attrs.data);
      if (attrs.aria) applyPrefixed(node, 'aria-', attrs.aria);
      if (attrs.on) applyOn(node, attrs.on);
      applyPlainAttrs(node, attrs);
      /* html is opt-in, trusted-static-markup only; applied before children
       * so a caller supplying both does not clobber appended nodes. */
      if (attrs.html !== undefined && attrs.html !== null) node.innerHTML = attrs.html;
      if (attrs.text !== undefined && attrs.text !== null) node.textContent = String(attrs.text);
    }
    if (children !== undefined && children !== null) appendChild(node, children);
    return node;
  }

  /** frag(children) -> DocumentFragment, same child-normalization rules as el(). */
  function frag(children) {
    var f = doc.createDocumentFragment();
    if (children !== undefined && children !== null) appendChild(f, children);
    return f;
  }

  /* ---- events ------------------------------------------------------------ */

  /** on(el, event, fn, opts) -> off(). Total teardown is how destroy() stays total. */
  function on(node, event, fn, opts) {
    node.addEventListener(event, fn, opts);
    return function off() {
      node.removeEventListener(event, fn, opts);
    };
  }

  function matchesSelector(node, selector) {
    if (!node || node.nodeType !== 1) return false;
    var m = node.matches || node.msMatchesSelector || node.webkitMatchesSelector;
    return m ? m.call(node, selector) : false;
  }

  /** closest(el, selector) -> Element|null. Falls back to a manual walk if closest() is absent. */
  function closest(node, selector) {
    if (node && typeof node.closest === 'function') return node.closest(selector);
    var cur = node;
    while (cur && cur.nodeType === 1) {
      if (matchesSelector(cur, selector)) return cur;
      cur = cur.parentNode;
    }
    return null;
  }

  /**
   * delegate(root, selector, event, fn) -> off()
   * Listens once on root; fn is invoked as fn.call(matchedEl, event, matchedEl)
   * for the nearest ancestor (or self) of event.target matching selector,
   * stopping the walk at root.
   */
  function delegate(root, selector, event, fn) {
    function handler(e) {
      var target = e.target;
      while (target && target !== root && target.nodeType === 1) {
        if (matchesSelector(target, selector)) {
          fn.call(target, e, target);
          return;
        }
        target = target.parentNode;
      }
      if (target === root && matchesSelector(root, selector)) fn.call(root, e, root);
    }
    root.addEventListener(event, handler, false);
    return function off() {
      root.removeEventListener(event, handler, false);
    };
  }

  /* ---- timing -------------------------------------------------------------
   * debounce/throttle/rafBatch all preserve the final `this` and arguments of
   * the call that actually fires, so they are drop-in replacements for the
   * function they wrap. */

  /** debounce(fn, ms) -> fn'. Fires ms after the last call in a burst. */
  function debounce(fn, ms) {
    var timer = null;
    var delay = ms || 0;
    return function debounced() {
      var args = arguments;
      var ctx = this;
      if (timer) global.clearTimeout(timer);
      timer = global.setTimeout(function () {
        timer = null;
        fn.apply(ctx, args);
      }, delay);
    };
  }

  /** throttle(fn, ms) -> fn'. Leading-edge immediate call, trailing-edge catch-up call. */
  function throttle(fn, ms) {
    var wait = ms || 0;
    var last = 0;
    var timer = null;
    var pendingArgs = null;
    var pendingCtx = null;

    function trailing() {
      last = Date.now();
      timer = null;
      fn.apply(pendingCtx, pendingArgs);
      pendingArgs = null;
      pendingCtx = null;
    }

    return function throttled() {
      var now = Date.now();
      var remaining = wait - (now - last);
      pendingArgs = arguments;
      pendingCtx = this;
      if (remaining <= 0) {
        if (timer) { global.clearTimeout(timer); timer = null; }
        last = now;
        fn.apply(pendingCtx, pendingArgs);
        pendingArgs = null;
        pendingCtx = null;
      } else if (!timer) {
        timer = global.setTimeout(trailing, remaining);
      }
    };
  }

  /** rafBatch(fn) -> fn'. Coalesces any number of calls within a frame into one, on the next frame. */
  function rafBatch(fn) {
    var scheduled = false;
    var pendingArgs = null;
    var pendingCtx = null;

    function run() {
      scheduled = false;
      var args = pendingArgs || [];
      var ctx = pendingCtx;
      pendingArgs = null;
      pendingCtx = null;
      fn.apply(ctx, args);
    }

    return function batched() {
      pendingArgs = arguments;
      pendingCtx = this;
      if (!scheduled) {
        scheduled = true;
        global.requestAnimationFrame(run);
      }
    };
  }

  /** raf2(fn) — double requestAnimationFrame; runs fn after the browser has committed one full layout. */
  function raf2(fn) {
    global.requestAnimationFrame(function () {
      global.requestAnimationFrame(fn);
    });
  }

  /* ---- misc ---------------------------------------------------------------- */

  var ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  var ESC_RE = /[&<>"']/g;

  /** esc(text) -> string. HTML-escape, for the rare trusted-html path (attrs.html). */
  function esc(text) {
    var s = text === null || text === undefined ? '' : String(text);
    return s.replace(ESC_RE, function (ch) { return ESC_MAP[ch]; });
  }

  var uidCounter = 0;

  /** uid(prefix) -> string. Cheap, collision-safe within a page session; not cryptographic. */
  function uid(prefix) {
    uidCounter += 1;
    return (prefix || 'pmx') + '-' + Date.now().toString(36) + '-' + uidCounter.toString(36);
  }

  /** clamp(n, lo, hi) -> number. */
  function clamp(n, lo, hi) {
    if (n < lo) return lo;
    if (n > hi) return hi;
    return n;
  }

  var BYTE_UNITS = ['KB', 'MB', 'GB', 'TB'];

  /** fmtBytes(n) -> "512 B" | "4.2 MB" style string. */
  function fmtBytes(n) {
    var num = Number(n);
    if (!isFinite(num) || num < 0) num = 0;
    if (num < 1024) return Math.round(num) + ' B';
    var val = num;
    var unitIndex = -1;
    do {
      val = val / 1024;
      unitIndex += 1;
    } while (val >= 1024 && unitIndex < BYTE_UNITS.length - 1);
    var rounded = (val >= 10) ? Math.round(val) : Math.round(val * 10) / 10;
    return rounded + ' ' + BYTE_UNITS[unitIndex];
  }

  /** setAttrs(el, obj) -> el. Same key vocabulary as el()'s attrs, applied to an existing node. */
  function setAttrs(node, obj) {
    if (!node || !obj) return node;
    if (obj.class !== undefined) applyClass(node, obj.class);
    if (obj.id !== undefined && obj.id !== null) node.id = obj.id;
    if (obj.style) applyStyle(node, obj.style);
    if (obj.data) applyPrefixed(node, 'data-', obj.data);
    if (obj.aria) applyPrefixed(node, 'aria-', obj.aria);
    if (obj.on) applyOn(node, obj.on);
    applyPlainAttrs(node, obj);
    if (obj.html !== undefined && obj.html !== null) node.innerHTML = obj.html;
    if (obj.text !== undefined && obj.text !== null) node.textContent = String(obj.text);
    return node;
  }

  /** empty(el) -> el. Removes all children; cheaper than innerHTML = ''. */
  function empty(node) {
    if (!node) return node;
    while (node.firstChild) node.removeChild(node.firstChild);
    return node;
  }

  var REDUCED_MOTION_STUB = {
    matches: false,
    media: '(prefers-reduced-motion: reduce)',
    addListener: function () {},
    removeListener: function () {},
    addEventListener: function () {},
    removeEventListener: function () {}
  };

  /** prefersReducedMotionMedia() -> MediaQueryList, or a harmless stub if matchMedia is unsupported. */
  function prefersReducedMotionMedia() {
    if (typeof global.matchMedia === 'function') {
      return global.matchMedia('(prefers-reduced-motion: reduce)');
    }
    return REDUCED_MOTION_STUB;
  }

  global.PMXUtil = {
    el: el,
    frag: frag,
    on: on,
    delegate: delegate,
    debounce: debounce,
    throttle: throttle,
    rafBatch: rafBatch,
    esc: esc,
    uid: uid,
    clamp: clamp,
    fmtBytes: fmtBytes,
    closest: closest,
    setAttrs: setAttrs,
    empty: empty,
    raf2: raf2,
    prefersReducedMotionMedia: prefersReducedMotionMedia
  };
})(window);
