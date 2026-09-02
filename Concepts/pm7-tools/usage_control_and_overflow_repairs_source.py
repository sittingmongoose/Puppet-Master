"""Source-owned T41 Usage control-acquisition and page-overflow repairs.

T41 follows T40 and is deliberately limited to two user-authorized defects:

* PM8 magnetism must remain on Usage cards without making the move/resize
  corners oscillate under the pointer; and
* the title-bar page overflow menu must remain hit-testable while its parent
  tab strip carries the shared edge-fade mask.

The generated PMConcept7 artifact is never edited directly.  The transform
protects the embedded Settings and Assistant source owners byte-for-byte and
adds no command, event, or persistence surface.
"""

from __future__ import annotations

from pm7_transform_guards import (
    assert_effect_delta,
    assert_protected_sources_equal,
    capture_effect_surfaces,
    capture_protected_sources,
)


TRANSFORM_MARKER = "PM7 T41: stable Usage control acquisition and page overflow"


def _replace_once(doc, old, new, need, label):
    count = doc.count(old)
    need(count == 1, "T41 %s: expected one anchor, found %d" % (label, count))
    return doc.replace(old, new, 1)


T41_CSS = r'''
/* PM7 T41: stable Usage control acquisition and page overflow.
   The protected Settings and Assistant surfaces are intentionally absent. */

/* The page-overflow menu is an in-tree child of the edge-faded tab strip.
   Disable that ancestor mask only for the menu's visible lifecycle; otherwise
   the mask removes the menu from hit-testing and exposes page controls below. */
.title-bar .page-tabs:has(#pageTabsMoreMenu.is-open),
.title-bar .page-tabs:has(#pageTabsMoreMenu.is-closing) {
  -webkit-mask-image: none !important;
  mask-image: none !important;
}
'''


PM8_NEUTRAL_SOURCE = r'''    function usageBaseControlRect(control, s) {
      if (!control) return null;
      var rect = control.getBoundingClientRect();
      return { left: rect.left - s.x, top: rect.top - s.y, width: rect.width, height: rect.height,
        right: rect.right - s.x, bottom: rect.bottom - s.y };
    }
    function usageControlGain(el, s, clientX, clientY) {
      if (!el || !el.matches || !el.matches('.pm7u-card')) return 1;
      if (document.body.classList.contains('pm7u-pointer-op')) return 0;
      if (!s.base || baseDirty) {
        var rect = el.getBoundingClientRect();
        s.base = { left: rect.left - s.x, top: rect.top - s.y, w: rect.width, h: rect.height };
      }
      var base = s.base;
      if (!base || !base.w || !base.h) return 1;
      var maxShift = Math.min(base.w, base.h) * .055;
      maxShift = (maxShift < 2.5 ? 2.5 : maxShift > 8 ? 8 : maxShift) * F.mag;
      /* Measure the real controls: later Usage CSS deliberately insets both
         handles from the card edge, so idealized 19px/17px corner boxes do
         not describe their painted hit regions.  Convert each live rect back
         to card-base coordinates by subtracting the PM8 translation. */
      var halo = 28 + Math.abs(maxShift);
      function distance(left, top, width, height) {
        var dx = Math.max(left - clientX, 0, clientX - (left + width));
        var dy = Math.max(top - clientY, 0, clientY - (top + height));
        return Math.sqrt(dx * dx + dy * dy);
      }
      var dragRect = usageBaseControlRect(el.querySelector('.pm7u-drag'), s);
      var resizeRect = usageBaseControlRect(el.querySelector('.pm7u-resize'), s);
      var distances = [];
      if (dragRect) distances.push(distance(dragRect.left, dragRect.top, dragRect.width, dragRect.height));
      if (resizeRect) distances.push(distance(resizeRect.left, resizeRect.top, resizeRect.width, resizeRect.height));
      if (!distances.length) return 1;
      var controlDistance = Math.min.apply(Math, distances);
      return Math.max(0, Math.min(1, controlDistance / halo));
    }
    function applyUsageControlGain(el, s, gain) {
      var prior = isFinite(s.controlGain) ? s.controlGain : 1;
      if (gain < prior && prior > 0) {
        /* Position-bound attenuation prevents a fast pointer from outrunning
           the spring: the visible offset reaches exactly zero at either
           handle before the following pointerdown is hit-tested. */
        var ratio = Math.max(0, gain / prior);
        s.x *= ratio; s.y *= ratio; s.vx *= ratio; s.vy *= ratio;
        s.wx = Infinity; s.wy = Infinity;
        if (gain <= .001) {
          s.x = 0; s.y = 0; s.vx = 0; s.vy = 0;
          el.style.translate = '';
        } else {
          el.style.translate = s.x.toFixed(2) + 'px ' + s.y.toFixed(2) + 'px';
        }
      }
      s.controlGain = gain;
      s.neutral = gain < .999;
    }
    function clearUsageControlLease(s) {
      if (!s) return;
      s.controlTarget = null; s.controlX = Infinity; s.controlY = Infinity; s.controlStamp = 0;
      s.controlPointerId = null; s.controlLeft = Infinity; s.controlTop = Infinity;
      s.controlRight = -Infinity; s.controlBottom = -Infinity; s.controlHalo = 0;
    }
    function usageControlLeaseValid(s, clientX, clientY, stamp, pointerId) {
      if (!s || !s.controlTarget || s.controlPointerId !== pointerId) return false;
      var age = Number(stamp) - Number(s.controlStamp || 0), halo = Number(s.controlHalo || 0);
      return age >= 0 && age <= 400 &&
        clientX >= s.controlLeft - halo && clientX <= s.controlRight + halo &&
        clientY >= s.controlTop - halo && clientY <= s.controlBottom + halo;
    }
    function rememberUsageControlAtPoint(el, s, clientX, clientY, stamp, pointerId, preferredControl) {
      if (!el || !el.matches || !el.matches('.pm7u-card')) return false;
      var cardBase = s.base;
      if (!cardBase) {
        var cardRect = el.getBoundingClientRect();
        cardBase = { left:cardRect.left-s.x, top:cardRect.top-s.y, w:cardRect.width, h:cardRect.height };
      }
      var maxShift = Math.min(cardBase.w || 0, cardBase.h || 0) * .055;
      maxShift = (maxShift < 2.5 ? 2.5 : maxShift > 8 ? 8 : maxShift) * F.mag;
      var halo = Math.min(10, Math.abs(maxShift) + 4), controls = [];
      if (preferredControl) controls.push(preferredControl);
      else {
        var drag = el.querySelector('.pm7u-drag'), resize = el.querySelector('.pm7u-resize');
        if (drag) controls.push(drag); if (resize) controls.push(resize);
      }
      var best = null, bestScore = Infinity;
      controls.forEach(function (control) {
        var rect = usageBaseControlRect(control, s);
        if (!rect || clientX < rect.left-halo || clientX > rect.right+halo || clientY < rect.top-halo || clientY > rect.bottom+halo) return;
        var dx = Math.max(rect.left-clientX, 0, clientX-rect.right);
        var dy = Math.max(rect.top-clientY, 0, clientY-rect.bottom), score = dx*dx+dy*dy;
        if (score < bestScore) { bestScore = score; best = { control:control, rect:rect }; }
      });
      if (!best) return false;
      s.controlTarget = best.control.classList.contains('pm7u-drag') ? 'drag' : 'resize';
      s.controlX = clientX; s.controlY = clientY; s.controlStamp = stamp; s.controlPointerId = pointerId;
      s.controlLeft = best.rect.left; s.controlTop = best.rect.top; s.controlRight = best.rect.right; s.controlBottom = best.rect.bottom; s.controlHalo = halo;
      return true;
    }

'''


PM8_POINTER_STATE_SOURCE = r'''      var controlGain = 1;
      var controlState = t ? stateFor(t) : null;
      if (controlState) {
        controlGain = usageControlGain(t, controlState, px, py);
        var directControl = e.target && e.target.closest ? e.target.closest('.pm7u-drag,.pm7u-resize') : null;
        if (directControl && directControl.closest('.pm7u-card') !== t) directControl = null;
        var otherInteractive = e.target && e.target.closest ? e.target.closest('button,a,input,select,textarea,[role="button"]') : null;
        if ((!otherInteractive || otherInteractive === directControl) &&
            rememberUsageControlAtPoint(t, controlState, px, py, e.timeStamp, e.pointerId, directControl)) {
          /* The measured corner corridor owns this short acquisition lease. */
        } else if (controlState.controlTarget && (otherInteractive || !usageControlLeaseValid(controlState, px, py, e.timeStamp, e.pointerId))) clearUsageControlLease(controlState);
      }
      if (t !== hoverEl) {
        if (hoverEl) {
          var previous = stateFor(hoverEl);
          previous.hover = false;
          previous.neutral = false;
          previous.controlGain = 1;
          var previousInteractive = e.target && e.target.closest ? e.target.closest('button,a,input,select,textarea,[role="button"]') : null;
          var previousDirect = previousInteractive && previousInteractive.matches('.pm7u-drag,.pm7u-resize') && previousInteractive.closest('.pm7u-card') === hoverEl ? previousInteractive : null;
          var previousRemembered = (!previousInteractive || previousDirect) &&
            rememberUsageControlAtPoint(hoverEl, previous, px, py, e.timeStamp, e.pointerId, previousDirect);
          if (!previousRemembered && ((previousInteractive && !previousDirect) ||
              !usageControlLeaseValid(previous, px, py, e.timeStamp, e.pointerId))) clearUsageControlLease(previous);
          hoverEl.classList.remove('pm7u-control-neutral');
        }
        hoverEl = t;
        if (t) {
          var s = stateFor(t);
          s.hover = true;
          applyUsageControlGain(t, s, controlGain);
          t.classList.toggle('pm7u-control-neutral', s.neutral);
          t.classList.add('pm8-live');
          liveSet.add(s);
        }
      } else if (t) {
        var active = stateFor(t);
        var wasNeutral = active.neutral;
        applyUsageControlGain(t, active, controlGain);
        if (wasNeutral !== active.neutral || active.neutral) {
          active.hover = true;
          t.classList.toggle('pm7u-control-neutral', active.neutral);
          t.classList.add('pm8-live');
          liveSet.add(active);
        }
      }
'''


USAGE_MAGNET_RESET_SOURCE = r'''  function resetUsageMagnetState() {
    Array.prototype.forEach.call(document.querySelectorAll('.pm7u-card'), function (card) {
      var magnet = card.__pm8;
      if (magnet) {
        magnet.hover = false; magnet.neutral = false; magnet.controlGain = 1;
        magnet.controlTarget = null; magnet.controlX = Infinity; magnet.controlY = Infinity; magnet.controlStamp = 0;
        magnet.controlPointerId = null; magnet.controlLeft = Infinity; magnet.controlTop = Infinity;
        magnet.controlRight = -Infinity; magnet.controlBottom = -Infinity; magnet.controlHalo = 0;
        magnet.x = 0; magnet.y = 0; magnet.vx = 0; magnet.vy = 0;
        magnet.wx = Infinity; magnet.wy = Infinity; magnet.base = null;
      }
      card.style.translate = '';
      card.classList.remove('pm8-live', 'pm7u-control-neutral');
    });
  }
  function opOn() { document.body.classList.add('pm7u-pointer-op'); }
  function opOff() { resetUsageMagnetState(); document.body.classList.remove('pm7u-pointer-op'); }
'''


USAGE_CONTROL_HANDOFF_SOURCE = r'''  function rememberedUsageControl(event) {
    if (document.body.classList.contains('pm7u-pointer-op')) return null;
    var matches = [];
    $$('.pm7u-card', board).forEach(function (cardElement) {
      var magnet = cardElement.__pm8;
      if (!magnet || !magnet.controlTarget || magnet.controlPointerId !== event.pointerId) return;
      var age = Number(event.timeStamp) - Number(magnet.controlStamp || 0), halo = Number(magnet.controlHalo || 0);
      if (!(age >= 0 && age <= 400) ||
          event.clientX < magnet.controlLeft - halo || event.clientX > magnet.controlRight + halo ||
          event.clientY < magnet.controlTop - halo || event.clientY > magnet.controlBottom + halo) return;
      var control = $('.pm7u-' + magnet.controlTarget, cardElement);
      if (!control) return;
      var centerX = (magnet.controlLeft + magnet.controlRight) / 2;
      var centerY = (magnet.controlTop + magnet.controlBottom) / 2;
      matches.push({ card:cardElement, control:control, kind:magnet.controlTarget, magnet:magnet, score:Math.hypot(event.clientX-centerX,event.clientY-centerY) });
    });
    matches.sort(function (left, right) { return left.score - right.score; });
    return matches[0] || null;
  }
  function clearUsageCardControlLease(cardElement) {
    var magnet = cardElement && cardElement.__pm8;
    if (!magnet) return;
    magnet.controlTarget = null; magnet.controlX = Infinity; magnet.controlY = Infinity; magnet.controlStamp = 0;
    magnet.controlPointerId = null; magnet.controlLeft = Infinity; magnet.controlTop = Infinity;
    magnet.controlRight = -Infinity; magnet.controlBottom = -Infinity; magnet.controlHalo = 0;
  }
  document.addEventListener('pointerdown', function (event) {
    if (event.button !== 0 || event.pointerType === 'touch' ||
        (event.target.closest && event.target.closest('button,a,input,select,textarea,[role="button"]'))) return;
    var remembered = rememberedUsageControl(event);
    if (!remembered) return;
    var topHit = document.elementFromPoint(event.clientX, event.clientY);
    if (!topHit || !remembered.card.contains(topHit)) {
      clearUsageCardControlLease(remembered.card);
      return;
    }
    var item = widgetById(remembered.card.getAttribute('data-widget'));
    if (!item) return;
    clearUsageCardControlLease(remembered.card);
    try { remembered.control.focus({ preventScroll:true }); } catch (error) { remembered.control.focus(); }
    if (remembered.kind === 'drag') startDrag(event, remembered.card, remembered.control);
    else startResize(event, remembered.card, item, remembered.control);
  }, true);

'''


def apply(doc, notes, need):
    """Apply T41 after T40 and emit fail-closed source/effect receipts."""
    need(TRANSFORM_MARKER not in doc, "T41: transform already applied")
    need("PM7 T40: stable Usage preview paint and directional resize" in doc, "T41: T40 marker missing")
    protected_before = capture_protected_sources(doc, need, "T41 input")
    effects_before = capture_effect_surfaces(doc)

    usage_style_anchor = "\n</style>\n<script>\n(function () {\n  'use strict';\n\n  var app = document.getElementById('pm7UsageApp');"
    doc = _replace_once(doc, usage_style_anchor, "\n" + T41_CSS + usage_style_anchor, need, "final Usage CSS")

    doc = _replace_once(
        doc,
        "              .pm7u-card:has(.pm7u-drag:hover),.pm7u-card:has(.pm7u-resize:hover){translate:none!important}\n",
        "",
        need,
        "oscillating handle-hover translation override",
    )
    doc = _replace_once(
        doc,
        "      if (!s) s = el.__pm8 = { el: el, x: 0, y: 0, vx: 0, vy: 0, hover: false, base: null, wx: Infinity, wy: Infinity };",
        "      if (!s) s = el.__pm8 = { el: el, x: 0, y: 0, vx: 0, vy: 0, hover: false, neutral: false, controlGain: 1, controlTarget: null, controlX: Infinity, controlY: Infinity, controlStamp: 0, controlPointerId: null, controlLeft: Infinity, controlTop: Infinity, controlRight: -Infinity, controlBottom: -Infinity, controlHalo: 0, base: null, wx: Infinity, wy: Infinity };",
        need,
        "PM8 neutral-state field",
    )
    doc = _replace_once(
        doc,
        "        if (s.hover && havePointer) {",
        "        if (s.hover && !s.neutral && havePointer && !document.body.classList.contains('pm7u-pointer-op')) {",
        need,
        "PM8 neutral magnet target",
    )
    doc = _replace_once(
        doc,
        "        if (!s.hover && Math.abs(s.x) < .04 && Math.abs(s.y) < .04 && Math.abs(s.vx) < .5 && Math.abs(s.vy) < .5) {",
        "        if ((!s.hover || s.neutral || document.body.classList.contains('pm7u-pointer-op')) && Math.abs(s.x) < .04 && Math.abs(s.y) < .04 && Math.abs(s.vx) < .5 && Math.abs(s.vy) < .5) {",
        need,
        "PM8 neutral settled-state eviction",
    )
    doc = _replace_once(
        doc,
        "    /* PM7 T07: single document-level pointermove listener for the whole\n",
        PM8_NEUTRAL_SOURCE + "    /* PM7 T07: single document-level pointermove listener for the whole\n",
        need,
        "base-relative Usage control neutralizer",
    )
    doc = _replace_once(
        doc,
        "      var blocked = document.body.classList.contains('pm-ab-dragging') || reduced();",
        "      var blocked = document.body.classList.contains('pm-ab-dragging') || document.body.classList.contains('pm7u-pointer-op') || reduced();",
        need,
        "PM8 Usage-operation idle guard",
    )
    old_pointer_state = r'''      if (t !== hoverEl) {
        if (hoverEl) stateFor(hoverEl).hover = false;
        hoverEl = t;
        if (t) {
          var s = stateFor(t);
          s.hover = true;
          t.classList.add('pm8-live');
          liveSet.add(s);
        }
      }
'''
    doc = _replace_once(doc, old_pointer_state, PM8_POINTER_STATE_SOURCE, need, "PM8 pointer neutral transitions")
    doc = _replace_once(
        doc,
        "      if (hoverEl) { stateFor(hoverEl).hover = false; hoverEl = null; }",
        "      Array.prototype.forEach.call(document.querySelectorAll('.pm7u-card'), function (card) { if (card.__pm8) clearUsageControlLease(card.__pm8); });\n"
        "      if (hoverEl) { var prior = stateFor(hoverEl); prior.hover = false; prior.neutral = false; prior.controlGain = 1; hoverEl.classList.remove('pm7u-control-neutral'); hoverEl = null; }",
        need,
        "PM8 pointerout neutral cleanup",
    )
    doc = _replace_once(
        doc,
        "  function opOn() { document.body.classList.add('pm7u-pointer-op'); }\n  function opOff() { document.body.classList.remove('pm7u-pointer-op'); }\n",
        USAGE_MAGNET_RESET_SOURCE,
        need,
        "Usage transaction magnet reset",
    )
    doc = _replace_once(
        doc,
        "  function wireCards() {",
        USAGE_CONTROL_HANDOFF_SOURCE + "  function wireCards() {",
        need,
        "remembered control handoff helper",
    )
    doc = _replace_once(
        doc,
        "  function startResize(event, cardElement, item) {",
        "  function startResize(event, cardElement, item, controlHandle) {\n"
        "    clearUsageCardControlLease(cardElement);\n"
        "    if (board._pm7ActiveReorder || document.body.classList.contains('pm7u-pointer-op')) return;",
        need,
        "resize control handoff signature",
    )
    doc = _replace_once(
        doc,
        "    var handle = event.currentTarget || event.target, pointerId = event.pointerId;",
        "    var handle = controlHandle || event.currentTarget || event.target, pointerId = event.pointerId;",
        need,
        "resize control handoff target",
    )
    doc = _replace_once(
        doc,
        "  function startDrag(event,cardElement) {",
        "  function startDrag(event,cardElement,controlHandle) {\n    clearUsageCardControlLease(cardElement);",
        need,
        "drag control handoff signature",
    )
    doc = _replace_once(
        doc,
        "    var handle=event.currentTarget||event.target,pointerId=event.pointerId,session=createUsageGridSession(cardElement);",
        "    var handle=controlHandle||event.currentTarget||event.target,pointerId=event.pointerId,session=createUsageGridSession(cardElement);",
        need,
        "drag control handoff target",
    )
    doc = _replace_once(
        doc,
        "    if(!handle._pm7KeyboardMove){\n      if(key!=='Enter'&&key!==' ')return;",
        "    if(!handle._pm7KeyboardMove){\n"
        "      if(board._pm7ActiveReorder||document.body.classList.contains('pm7u-pointer-op'))return;\n"
        "      if(key!=='Enter'&&key!==' ')return;",
        need,
        "keyboard reorder reentrancy guard",
    )

    protected_receipt = assert_protected_sources_equal(
        protected_before,
        capture_protected_sources(doc, need, "T41 output"),
        need,
        "T41",
    )
    effect_receipt = assert_effect_delta(
        effects_before,
        capture_effect_surfaces(doc),
        {},
        need,
        "T41",
    )

    need(doc.count(TRANSFORM_MARKER) == 1, "T41: transform marker census mismatch")
    need(".pm7u-card:has(.pm7u-drag:hover),.pm7u-card:has(.pm7u-resize:hover){translate:none!important}" not in doc, "T41: oscillating handle-hover override survived")
    need("function usageControlGain(el, s, clientX, clientY)" in doc and "function usageBaseControlRect(control, s)" in doc and "function applyUsageControlGain(el, s, gain)" in doc and "s.hover && !s.neutral" in doc and "controlDistance / halo" in doc, "T41: base-relative PM8 control attenuation incomplete")
    need("function rememberedUsageControl(event)" in doc and "function clearUsageCardControlLease(cardElement)" in doc and "document.addEventListener('pointerdown', function (event)" in doc and "document.elementFromPoint(event.clientX, event.clientY)" in doc and "remembered.card.contains(topHit)" in doc and "clearUsageCardControlLease(remembered.card);\n      return;" in doc and "startDrag(event, remembered.card, remembered.control)" in doc and "startResize(event, remembered.card, item, remembered.control)" in doc and "function startDrag(event,cardElement,controlHandle) {\n    clearUsageCardControlLease(cardElement);" in doc and "function startResize(event, cardElement, item, controlHandle) {\n    clearUsageCardControlLease(cardElement);\n    if (board._pm7ActiveReorder || document.body.classList.contains('pm7u-pointer-op')) return;" in doc and "if(board._pm7ActiveReorder||document.body.classList.contains('pm7u-pointer-op'))return;" in doc and "controlState.controlTarget" in doc and "usageControlLeaseValid" in doc and "rememberUsageControlAtPoint" in doc, "T41: neutralized control handoff or transaction exclusion incomplete")
    need("function resetUsageMagnetState()" in doc and "magnet.controlGain = 1" in doc and "magnet.controlTarget = null" in doc and "magnet.controlPointerId = null" in doc and "magnet.wx = Infinity" in doc and "resetUsageMagnetState(); document.body.classList.remove('pm7u-pointer-op')" in doc, "T41: Usage transaction magnet reset incomplete")
    need(".page-tabs:has(#pageTabsMoreMenu.is-open)" in doc and ".page-tabs:has(#pageTabsMoreMenu.is-closing)" in doc and T41_CSS.count("mask-image: none !important") == 2, "T41: overflow-menu mask lifecycle repair incomplete")
    authored_t41 = "\n".join([T41_CSS, PM8_NEUTRAL_SOURCE, PM8_POINTER_STATE_SOURCE, USAGE_MAGNET_RESET_SOURCE, USAGE_CONTROL_HANDOFF_SOURCE])
    need(all(token not in authored_t41 for token in ["cmd.workspace_layout", "context.compaction", "workspace.layout_changed", "pm:workspace-layout-changed"]), "T41: unauthorized command/event surface")
    need(all(token not in authored_t41 for token in ["PM7_CONTEXT", "Tome Tabs", "Kimi", "PM_Chat_Assistant_5.6_Pro_Standalone"]), "T41: protected Chat or Settings source referenced")

    notes.update({
        "decision": "authorized T41 repair for stable Usage control acquisition and hit-testable narrow page overflow",
        "usage_control_acquisition": "PM8 remains magnetic outside base-relative move/resize corner zones; neutral corners spring to zero without moving-target hover oscillation, rescue requires top-hit ownership by the remembered card, every transaction clears its acquisition lease before pointer capture, and operation entry points reject reentrancy",
        "page_overflow": "the page-tab edge mask is disabled only while the in-tree overflow menu is opening, open, or closing",
        "protected_embedded_source_guard": protected_receipt,
        "effect_surface_set_diff": effect_receipt,
    })
    return doc
