(function () {
  "use strict";

  var PROFILES = {
    c05: {
      stage: ".d1-home,.d1-workspace,.d1-list,.d1-copy,.d1-deferred",
      items: ".d1-card,.d1-dest,.d1-row,.d1-step,.d1-check",
      search: ".d1-drop",
      axis: "scale"
    },
    c06: {
      stage: ".d2-home,.d2-sheet,.d2-form,.d2-list,.d2-copy",
      items: ".d2-ed,.d2-row,.d2-roster button,.d2-fact",
      search: ".d2-drop",
      axis: "x"
    },
    c07: {
      stage: ".cw-page,.cw-index,.cw-detail,.cw-form,.cw-sheet",
      items: ".cw-area,.cw-indexcard,.cw-vrow,.cw-row,.cw-roster button",
      search: ".cw-drop",
      axis: "x-soft"
    },
    c08: {
      stage: ".d3-home,.d3-main,.d3-sheet,.d3-form,.d3-detail",
      items: ".d3-big,.d3-leaf,.d3-row,.d3-roster button",
      search: ".d3-drop",
      axis: "scale-y"
    },
    c09: {
      stage: ".tm-canvas,.tm-form,.tm-detail",
      items: ".tm-chapter-list>*,.tm-row,.tm-roster button,.tm-mgrs button",
      search: ".tm-drop",
      axis: "depth"
    },
    c10: {
      stage: ".cs-workspace",
      items: ".cs-pane,.cs-cmd,.cs-row",
      search: ".cs-drop",
      axis: "cascade"
    },
    c11: {
      stage: ".to-sheet,.to-form,.to-pane",
      items: ".to-map button,.to-row,.to-roster button,.to-pane",
      search: ".to-drop",
      axis: "y"
    }
  };

  function reduced() {
    return document.documentElement.getAttribute("data-motion") === "reduced" ||
      (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function keyframes(axis, direction) {
    var sign = direction === "back" ? -1 : 1;
    if (axis === "scale") return [
      { opacity: 0, transform: "translate3d(0," + (9 * sign) + "px,0) scale(.982)" },
      { opacity: 1, transform: "none" }
    ];
    if (axis === "x") return [
      { opacity: 0, transform: "translate3d(" + (24 * sign) + "px,0,0)" },
      { opacity: 1, transform: "none" }
    ];
    if (axis === "x-soft") return [
      { opacity: 0, transform: "translate3d(" + (14 * sign) + "px,4px,0) scale(.994)" },
      { opacity: 1, transform: "none" }
    ];
    if (axis === "scale-y") return [
      { opacity: 0, transform: "translate3d(0," + (18 * sign) + "px,0) scale(.972)" },
      { opacity: 1, transform: "none" }
    ];
    if (axis === "depth") return [
      { opacity: 0, transform: "translate3d(" + (22 * sign) + "px,0,0) scale(.988)" },
      { opacity: 1, transform: "none" }
    ];
    if (axis === "y") return [
      { opacity: 0, transform: "translate3d(0," + (22 * sign) + "px,0) scale(.992)" },
      { opacity: 1, transform: "none" }
    ];
    return [
      { opacity: 0, transform: "translate3d(" + (18 * sign) + "px,0,0)" },
      { opacity: 1, transform: "none" }
    ];
  }

  function play(el, frames, options) {
    if (!el || !el.animate) return null;
    var animation = el.animate(frames, options);
    /* Web Animations with forwards/both fill remain discoverable after they
       finish and accumulate during long Settings sessions. The rendered DOM
       already represents the final frame, so release each effect immediately
       after completion. This keeps route motion bounded and prevents audit or
       screenshot slowdowns after hundreds of navigations. */
    animation.finished.then(function () { animation.cancel(); }, function () {});
    return animation;
  }

  function animateElements(nodes, frames, baseDelay, step, duration) {
    var list = Array.prototype.slice.call(nodes || []).slice(0, 12);
    list.forEach(function (el, i) {
      if (!el || !el.animate) return;
      play(el, frames, {
        duration: duration,
        delay: baseDelay + Math.min(i, 9) * step,
        easing: "cubic-bezier(.16,1,.3,1)",
        fill: "both"
      });
    });
  }

  function afterPaint(root, ctx) {
    if (!root || reduced()) return;
    ctx = ctx || {};
    var profile = PROFILES[ctx.namespace];
    if (!profile) return;
    var cause = ctx.cause || "refresh";
    var direction = ctx.direction || "forward";
    root.dataset.motionCause = cause;
    root.dataset.motionDirection = direction;

    /* Search and direct value edits keep their spatial parent stable. */
    if (cause === "search-open" || cause === "search-update") {
      var search = root.querySelector(profile.search);
      if (search && search.animate) {
        play(search, cause === "search-open" ? [
          { opacity: 0, transform: "translateY(-8px) scale(.985)" },
          { opacity: 1, transform: "none" }
        ] : [
          { opacity: .72, transform: "translateY(-2px)" },
          { opacity: 1, transform: "none" }
        ], { duration: cause === "search-open" ? 280 : 150, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" });
      }
      return;
    }

    if (cause === "update" || cause === "state") {
      var targetId = ctx.targetId;
      var target = targetId ? root.querySelector('[data-row-id="' + CSS.escape(String(targetId)) + '"]') : null;
      if (target && target.animate) {
        target.dataset.motionEmphasis = "true";
        target.animate([
          { backgroundColor: "color-mix(in srgb, var(--pm-accent) 22%, transparent)", transform: "scale(.995)" },
          { backgroundColor: "transparent", transform: "none" }
        ], { duration: 620, easing: "cubic-bezier(.16,1,.3,1)" }).finished.finally(function () {
          delete target.dataset.motionEmphasis;
        });
      }
      return;
    }

    /* Copy is a transaction inside a stable workspace. Animate the new local
       material state rather than cross-fading two full-page text snapshots. */
    if (cause === "apply" || cause === "receipt" || cause === "rollback") {
      var transaction = root.querySelector(profile.stage);
      if (transaction && transaction.animate) {
        var txFrames;
        var txDuration;
        if (cause === "apply") {
          txFrames = [
            { opacity: .86, transform: "translate3d(0,7px,0) scale(.996)", filter: "brightness(.94)" },
            { opacity: 1, transform: "none", filter: "none" }
          ];
          txDuration = 330;
        } else if (cause === "receipt") {
          txFrames = [
            { opacity: .82, transform: "translate3d(0,10px,0) scale(.994)", filter: "brightness(1.06)" },
            { opacity: 1, transform: "none", filter: "none" }
          ];
          txDuration = 430;
        } else {
          txFrames = [
            { opacity: .84, transform: "translate3d(0,-8px,0) scale(.996)" },
            { opacity: 1, transform: "none" }
          ];
          txDuration = 360;
        }
        play(transaction, txFrames, {
          duration: txDuration,
          easing: "cubic-bezier(.16,1,.3,1)",
          fill: "both"
        });
      }
      return;
    }

    if (cause === "initial" || ctx.stage === false) return;

    var stage = root.querySelector(profile.stage);
    if (stage && stage.animate && !ctx.viewTransition) {
      play(stage, keyframes(profile.axis, direction), {
        duration: direction === "back" ? 400 : 470,
        easing: "cubic-bezier(.16,1,.3,1)",
        fill: "both"
      });
    }

    var nodes = root.querySelectorAll(profile.items);
    var baseDelay = ctx.viewTransition ? 170 : 70;
    if (profile.axis === "cascade") {
      animateElements(nodes, keyframes("x-soft", direction), baseDelay, 28, 390);
    } else {
      animateElements(nodes, [
        { opacity: 0, transform: direction === "back" ? "translate3d(-8px,5px,0)" : "translate3d(8px,7px,0)" },
        { opacity: 1, transform: "none" }
      ], baseDelay, 24, 340);
    }
  }

  window.PMMotionDirector = { afterPaint: afterPaint, profiles: PROFILES };
}());
