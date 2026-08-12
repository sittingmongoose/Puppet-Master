/* ============================================================================
   pm-scrollspy.js — scrollspy + controlled jump (IIFE, no dependencies)
   ----------------------------------------------------------------------------
     PMSpy.attach({ root, sections, onActive, offsetPx = 96 })
       root     : scroll container element (or null for the viewport)
       sections : array of elements or element ids, in document order
       onActive : (id, el) called when the section under the reading line
                  changes (activation band: rootMargin "-<offset>px 0px -65%")
       returns  : { detach(), refresh() }
       Consumers MUST give sections a CSS `scroll-margin-top` (typically the
       same offset) so jumps land clear of sticky headers.

     PMSpy.jumpTo(el, { root, behavior, onDone })
       Controlled programmatic jump: suppresses spy callbacks while the
       scroll settles (no oscillation), uses smooth scrolling unless reduced
       motion is active (checks <html data-motion> and the OS media query),
       then applies the .pm-focus-settle one-shot treatment, leaves a
       persistent [data-spy-current] marker, moves keyboard focus into the
       section (or a temporary tabindex="-1" anchor), activates the spy for
       the target exactly once, and fires onDone.

     PMSpy.setActive(id)
       Manual override for concept-specific indicators; delegates to the most
       recently attached spy.
   ========================================================================== */
(function () {
  "use strict";

  var current = null;

  function isReduced() {
    if (document.documentElement.dataset.motion === "reduced") return true;
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function attach(opts) {
    opts = opts || {};
    var root = opts.root || null;
    var onActive = typeof opts.onActive === "function" ? opts.onActive : function () {};
    var offset = typeof opts.offsetPx === "number" ? opts.offsetPx : 96;
    var items = (opts.sections || []).map(function (s) {
      return typeof s === "string" ? document.getElementById(s) : s;
    }).filter(Boolean);

    var visible = [];
    var lastActive = null;
    var suppressUntil = 0;
    var observer = null;

    function pick() {
      for (var i = 0; i < items.length; i++) {
        if (visible.indexOf(items[i]) !== -1) return items[i];
      }
      return null;
    }

    function fire(el) {
      if (!el || el.id === lastActive) return;
      lastActive = el.id;
      onActive(el.id, el);
    }

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var at = visible.indexOf(entries[i].target);
          if (entries[i].isIntersecting && at === -1) visible.push(entries[i].target);
          if (!entries[i].isIntersecting && at !== -1) visible.splice(at, 1);
        }
        if (Date.now() < suppressUntil) return;
        fire(pick());
      }, {
        root: root,
        rootMargin: "-" + offset + "px 0px -65% 0px",
        threshold: 0
      });
      items.forEach(function (el) { observer.observe(el); });
    }

    var api = {
      detach: function () {
        if (observer) observer.disconnect();
        if (current === api) current = null;
      },
      refresh: function () {
        visible = [];
        lastActive = null;
        if (observer) {
          observer.disconnect();
          items.forEach(function (el) { observer.observe(el); });
        }
      },
      suppress: function (ms) {
        suppressUntil = Date.now() + ms;
      },
      activate: function (id) {
        for (var i = 0; i < items.length; i++) {
          if (items[i].id === id) {
            lastActive = id;
            onActive(id, items[i]);
            return;
          }
        }
      }
    };

    current = api;
    return api;
  }

  function jumpTo(el, opts) {
    if (!el) return;
    opts = opts || {};
    var root = opts.root || null;
    var behavior = opts.behavior || "smooth";
    if (isReduced()) behavior = "auto";
    if (current) current.suppress(1500);

    /* deep links may target rows inside collapsed disclosures — open every
       <details> ancestor first so the target is measurable and visible */
    var ancestor = el.parentElement;
    while (ancestor) {
      if (ancestor.tagName === "DETAILS" && !ancestor.open) ancestor.open = true;
      ancestor = ancestor.parentElement;
    }

    /* Mark immediately: the target is known now, so the persistent marker
       must not wait on scroll settle or the 600ms settle animation (that
       chain made it lag up to ~2s). "current" is singular — retire markers
       left by earlier jumps in this view. */
    document.querySelectorAll("[data-spy-current]").forEach(function (prev) {
      if (prev !== el) prev.removeAttribute("data-spy-current");
    });
    el.setAttribute("data-spy-current", "");

    if (root) {
      var margin = parseFloat(window.getComputedStyle(el).scrollMarginTop) || 0;
      var top = el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - margin;
      root.scrollTo({ top: top, behavior: behavior });
    } else {
      el.scrollIntoView({ behavior: behavior, block: "start" });
    }

    var finished = false;

    function finish() {
      if (finished) return;
      finished = true;

      el.classList.remove("pm-focus-settle");
      void el.offsetWidth; /* restart the animation on repeat jumps */
      el.classList.add("pm-focus-settle");

      var settled = false;
      function clearSettle(evt) {
        if (settled) return;
        if (evt && evt.type === "animationend" && evt.animationName !== "pm-focus-settle") return;
        settled = true;
        el.classList.remove("pm-focus-settle");
        el.setAttribute("data-spy-current", "");
      }
      el.addEventListener("animationend", clearSettle);
      window.setTimeout(function () { clearSettle(null); }, 900);

      var focusable = el.querySelector("a[href], button, input, select, textarea, [tabindex]");
      var focusTarget = focusable || el;
      var temporary = false;
      if (!focusable && !el.hasAttribute("tabindex")) {
        el.setAttribute("tabindex", "-1");
        temporary = true;
      }
      try {
        focusTarget.focus({ preventScroll: true });
      } catch (err) {
        focusTarget.focus();
      }
      if (temporary) {
        el.addEventListener("blur", function cleanup() {
          el.removeAttribute("tabindex");
          el.removeEventListener("blur", cleanup);
        });
      }

      if (current) current.activate(el.id);
      if (typeof opts.onDone === "function") opts.onDone(el);
    }

    if (behavior === "auto") {
      window.setTimeout(finish, 40);
      return;
    }

    /* wait until the scroll position stops changing, then settle */
    var last = -1;
    var stable = 0;
    var checks = 0;
    var timer = window.setInterval(function () {
      var pos = root ? root.scrollTop : (window.pageYOffset || document.documentElement.scrollTop);
      checks++;
      if (Math.abs(pos - last) < 1) stable++; else stable = 0;
      last = pos;
      if (stable >= 2 || checks > 14) {
        window.clearInterval(timer);
        finish();
      }
    }, 90);
  }

  window.PMSpy = {
    attach: attach,
    jumpTo: jumpTo,
    setActive: function (id) {
      if (current) current.activate(id);
    }
  };
})();
