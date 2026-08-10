/* PANEL BAKEOFF - shared MOTION LAYER (JS half; CSS half is _pm-motion.css)
   =====================================================================
   PMM is the thin JS a few of the six primitives need, and nothing more. The
   motion itself lives in CSS; this file only

     - adds and removes classes,
     - sets two custom properties (the lens indicator's x and width),
     - restarts a CSS animation by removing and re-adding a class.

   There is deliberately no rAF loop, no pointer listener and no per-frame
   work of any kind. The app merges its document-level pointermove handlers
   for a reason, and a side panel that drops frames while a container list
   updates is worse than a side panel that does not animate.

   ---------------------------------------------------------------------
   THE VOCABULARY - the same six primitives as the CSS
   ---------------------------------------------------------------------
     PMM.expand(el, open)        1. section open / close   (.pmm-expand)
     PMM.push(host, dir)         2. push / pop navigation  (.pmm-frame)
     PMM.enter(el, opts)         3. list rows arriving     (.pmm-enter)
     PMM.sheet(el, open)         4. sheet / drawer in-out  (.pmm-sheet)
     PMM.lens(track, active)     5. indicator slide        (.pmm-lens-ind)
     PMM.flash(el, tone)         6. value-change flash     (.pmm-flash)

   Support:
     PMM.reduced(el)             true if motion is off for el's subtree
     PMM.settle(el)              force a box to its settled (unclipped) state

   Every helper is total: it accepts null, a text node, or an element that is
   not in the document, and returns its first argument unchanged rather than
   throwing. That matters because versions build markup as STRINGS and the
   harness re-renders whole stages - a helper will regularly be handed a node
   that was replaced a millisecond ago.

   ---------------------------------------------------------------------
   PER-THEME MAPPING
   ---------------------------------------------------------------------
   None of it is here, and that is the point. The four families differ by
   seven custom properties declared once each in _pm-motion.css (retro snappy
   and short, friendly springy, glass fluid, basic - the accessibility theme -
   the most restrained: 2px of travel and no stagger at all). This file never
   reads data-theme and never branches on a family; it sets classes and lets
   the cascade pick the personality. Adding a ninth theme is a nine-line CSS
   block and zero lines here.

   ---------------------------------------------------------------------
   REDUCED-MOTION CONTRACT
   ---------------------------------------------------------------------
   reduced() is true when EITHER the OS reports prefers-reduced-motion:reduce
   OR the nearest [data-motion] ancestor says "reduced" (the harness sets that
   on .pm-stage, _pm-shell.js:135). The CSS kills the animations by itself; the
   helpers check the same condition so they also skip the class churn and the
   geometry reads.

   Skipping is never allowed to skip an OUTCOME:

     expand/sheet   still toggle .is-open, and also .pmm-settled immediately,
                    so an opened section is open and unclipped in the same
                    frame.
     push           still records data-pmm-dir (a version may show a back
                    affordance keyed off it) and simply does not animate.
     enter          returns without adding the class; the rows are already at
                    their natural opacity.
     lens           STILL MEASURES AND POSITIONS. The two custom properties
                    are the indicator's position, not its animation. Reduced
                    motion means it appears at the new lens, not that it
                    disappears. This is the one helper that does real work
                    under reduced motion, and it is the one that would break
                    the UI if it did not.
     flash          returns without painting. The changed number is the
                    signal; the flash was only the garnish.

   ---------------------------------------------------------------------
   SLINT 1.17.1 MAPPING
   ---------------------------------------------------------------------
   Each helper corresponds to a property assignment in a states block, not to
   an imperative animation call - which is the reason the helpers are all
   "set a class / set a property" and never "run a tween".

     expand   states [ open when root.open : { body.height: body.
              preferred-height; } ]  +  animate height { duration: 240ms;
              easing: ease-out; }        (the one size animation in the file)
     push     stack.push(frame) sets a direction property; the frame's
              animate x + animate opacity play off it.
     enter    a for-loop delegate with animate y, opacity and
              delay: min(index, 3) * step.
     sheet    animate height on the wrapper + animate y, opacity on the body;
              the --over variant is animate y alone.
     lens     ind.x / ind.width assignments with animate x, width.
     flash    a Rectangle overlay with animate opacity, driven by a
              changed-callback on the model property.
   ===================================================================== */
(function (global) {
  'use strict';

  var M = {};
  var doc = global.document;

  /* Live query, no listener: matchMedia().matches is read at call time, so a
     user toggling the OS setting mid-session is honoured with no bookkeeping
     and no chance of a stale cached answer. */
  var MQ = (global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null);

  var TONES = { up: 1, down: 1, warn: 1 };

  /* Long enough to outlast --motion-slow (420ms) plus three stagger steps.
     Only used as the fallback for a transitionend that can never arrive,
     which happens whenever the element is detached: a detached element runs
     no transitions, so it fires no events. */
  var SETTLE_MS = 600;

  function isEl(el) { return !!(el && el.nodeType === 1 && el.classList); }

  /** True when motion is off for this element: the OS setting, or the nearest
   *  [data-motion] ancestor set to "reduced". closest() walks a detached tree
   *  just fine, so this answers correctly for a node built off-document. */
  function reduced(el) {
    if (MQ && MQ.matches) return true;
    if (!isEl(el) || !el.closest) return false;
    var host = el.closest('[data-motion]');
    return !!(host && host.getAttribute('data-motion') === 'reduced');
  }
  M.reduced = reduced;

  /* Re-trigger a CSS animation on an element that already carries the class.
     The offsetWidth read is a forced style flush - ONE per navigation or per
     value change, never per frame. There is no cheaper reliable way to
     restart a CSS animation, and Element.getAnimations() is not available
     everywhere this page is opened. */
  function restart(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  /* -------------------------------------------------------------- settle
     .pmm-settled releases the clip that the 0fr/1fr accordion needs while it
     is moving. It has to be released once open, because friendly's hover ring
     is a 2px ring plus a 22px glow and needs about 12px of clearance that an
     overflow: hidden box would eat (versions/README, "Consequences you must
     design around"). */
  function settle(el) {
    if (!isEl(el)) return el;
    if (el.classList.contains('is-open')) el.classList.add('pmm-settled');
    return el;
  }
  M.settle = settle;

  function unsettle(el) { el.classList.remove('pmm-settled'); }

  /* Shared implementation of the two size primitives. cls is 'pmm-expand' or
     'pmm-sheet'; they differ only in which duration knob the CSS reads.

     THE ONE-CHILD RULE. grid-template-rows: 0fr sizes the FIRST row only, so
     a box holding six rows directly does not collapse at all - measured at
     90px of leaked body where 0 was wanted. Rather than let that ship as a
     section that will not close, a box without exactly one element child gets
     .pmm-expand--static: correct open/closed state, no animation. The overlay
     sheet is exempt because it animates a transform, not a size, and so has
     no opinion about how many children it holds. */
  function box(el, open, cls) {
    if (!isEl(el)) return el;
    var want = open !== false;
    el.classList.add(cls);

    if (el.children.length !== 1 && !el.classList.contains('pmm-sheet--over')) {
      el.classList.add('pmm-expand--static');
      el.classList.toggle('is-open', want);
      return el;
    }
    el.classList.remove('pmm-expand--static');

    if (reduced(el)) {
      el.classList.toggle('is-open', want);
      /* settle in the same frame: with no transition there is nothing to
         wait for, and leaving it clipped would crop friendly's hover ring */
      if (want) el.classList.add('pmm-settled');
      else unsettle(el);
      return el;
    }

    unsettle(el);
    el.classList.toggle('is-open', want);
    if (!want) return el;

    /* Settle on the real transition end, with a timer as the fallback for the
       detached case. Both re-check is-open at fire time, so a fast
       open-close-open sequence can never settle a closed box. */
    var onEnd = function (e) {
      if (e.target !== el || e.propertyName !== 'grid-template-rows') return;
      el.removeEventListener('transitionend', onEnd);
      settle(el);
    };
    el.addEventListener('transitionend', onEnd);
    global.setTimeout(function () {
      el.removeEventListener('transitionend', onEnd);
      settle(el);
    }, SETTLE_MS);
    return el;
  }

  /* =================================================== 1. expand / collapse
     PMM.expand(sectionBody, true|false)

     Pass the section BODY, never the header. .pmk-sec is position: sticky
     inside the .pmk-body scroller and a clipping wrapper around it kills the
     stick - vA, vB and vF all depend on those headers staying put. The body
     must be a single element (see the one-child rule above).

     The caller still owns aria-expanded on the .pmk-sec button (GI-004
     requires the header be an accessible button, and the accessible state is
     not this layer's to fake). */
  M.expand = function (el, open) { return box(el, open, 'pmm-expand'); };

  /* ======================================================== 2. push / pop
     PMM.push(host, dir)  dir: 'fwd' | 'back' (also accepts push/pop, 1/-1)

     The harness re-renders the whole stage on a state change, so the usual
     call is: render, then push the NEW frame in. Forward enters from the
     right, back from the left. */
  M.push = function (host, dir) {
    if (!isEl(host)) return host;
    var back = (dir === 'back' || dir === 'pop' || dir === 'backward' ||
                dir === -1 || dir === false);
    host.setAttribute('data-pmm-dir', back ? 'back' : 'fwd');
    if (reduced(host)) return host;
    host.classList.add('pmm-frame');
    restart(host, 'pmm-run');
    return host;
  };

  /* Optional companion for the versions that keep the outgoing frame alive
     for a beat (a portal, or the bucket-3 two-column split). Not required:
     with a full re-render there is nothing left to animate out. */
  M.pop = function (host, dir) {
    if (!isEl(host) || reduced(host)) return host;
    var back = (dir === 'back' || dir === 'pop' || dir === -1 || dir === false);
    host.setAttribute('data-pmm-dir', back ? 'back' : 'fwd');
    host.classList.add('pmm-frame');
    restart(host, 'is-leaving');
    return host;
  };

  /* ========================================================= 3. list enter
     PMM.enter(listEl, opts)   opts.step overrides the family stagger

     Stagger is capped at four steps by the CSS; rows five and beyond arrive
     with the fourth. A 23-row cascade is a list visibly assembling itself,
     which is the thing this primitive exists to avoid. */
  M.enter = function (el, opts) {
    if (!isEl(el) || reduced(el)) return el;
    if (opts && opts.step != null) {
      el.style.setProperty('--pmm-step',
        typeof opts.step === 'number' ? opts.step + 'ms' : String(opts.step));
    }
    /* restart on the container: the child animations are keyed to it, so one
       class churn re-runs the whole (max four step) cascade */
    restart(el, 'pmm-enter');
    return el;
  };

  /* ============================================================= 4. sheet
     PMM.sheet(el, open)

     Same mechanism as expand, different duration knob (--pmm-dur-sheet, which
     is the only place glass spends --motion-slow). For the overlay variant
     add .pmm-sheet--over in the markup; this call still drives it, because
     .is-open is what both variants key off. */
  M.sheet = function (el, open) { return box(el, open, 'pmm-sheet'); };

  /* ============================================================== 5. lens
     PMM.lens(track, activeEl)

     ONE geometry read per selection change - two getBoundingClientRect calls,
     no loop, no observer. Call it after the strip is in the document and laid
     out; on a detached or display:none strip every rect is zero, and the
     helper leaves the indicator exactly where it was rather than snapping it
     to 0 (which would animate the indicator to the left edge and back the
     moment the panel became visible).

     Coordinates are content coordinates, hence + scrollLeft: the indicator is
     absolutely positioned inside .pmk-lenses, which is itself the horizontal
     scroller (F3-445 allows the strip to scroll), so it travels WITH the
     lenses when the strip is scrolled. */
  M.lens = function (track, active) {
    if (!isEl(track)) return track;
    track.classList.add('pmm-lens-track');

    var ind = track.querySelector('.pmm-lens-ind');
    if (!ind && doc) {
      ind = doc.createElement('span');
      ind.className = 'pmm-lens-ind';
      ind.setAttribute('aria-hidden', 'true');
      track.appendChild(ind);
    }
    if (!ind) return track;

    if (!isEl(active)) {
      active = track.querySelector('[aria-selected="true"]') ||
               track.querySelector('.is-selected');
    }
    if (!isEl(active)) {
      track.style.setProperty('--pmm-lens-w', '0px');
      return track;
    }

    var a = active.getBoundingClientRect();
    var t = track.getBoundingClientRect();
    if (!a.width || !t.width) return track;   /* detached / hidden: leave as is */

    var x = (a.left - t.left) + (track.scrollLeft || 0);
    track.style.setProperty('--pmm-lens-x', Math.round(x) + 'px');
    track.style.setProperty('--pmm-lens-w', Math.round(a.width) + 'px');
    return track;
  };

  /* ============================================================= 6. flash
     PMM.flash(el, tone)   tone: 'up' | 'down' | 'warn' (default: accent)

     For a value that changed under the user rather than because of them.
     Removing .is-flash on animationend keeps the pseudo-element from lingering
     and lets the next change re-fire cleanly; restart() covers the case where
     two changes land inside one animation. */
  M.flash = function (el, tone) {
    if (!isEl(el) || reduced(el)) return el;
    el.classList.add('pmm-flash');
    if (tone && TONES[tone]) el.classList.add('pmm-flash--' + tone);
    restart(el, 'is-flash');
    el.addEventListener('animationend', function done(e) {
      if (e.animationName !== 'pmm-flash') return;
      el.removeEventListener('animationend', done);
      el.classList.remove('is-flash');
    });
    return el;
  };

  M.version = '1';
  global.PMM = M;
})(window);
