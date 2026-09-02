"""Source-owned T40 Usage preview-paint and directional-resize repairs.

T40 follows T39 and is deliberately limited to two user-reported Usage
interaction regressions:

* previewing a new grid slot must not remount peer cards or replay their
  staggered entrance animation; and
* a one-axis resize must advance to the next supported curated size on that
  axis, even when the companion dimension also has to change.

The generated PMConcept7 artifact is never edited directly.  The transform
protects the embedded Settings and Assistant source owners byte-for-byte and
adds no command, event, or persistence surface.
"""

from __future__ import annotations

import re

from pm7_transform_guards import (
    assert_effect_delta,
    assert_protected_sources_equal,
    capture_effect_surfaces,
    capture_protected_sources,
)


TRANSFORM_MARKER = "PM7 T40: stable Usage preview paint and directional resize"


def _replace_once(doc, old, new, need, label):
    count = doc.count(old)
    need(count == 1, "T40 %s: expected one anchor, found %d" % (label, count))
    return doc.replace(old, new, 1)


def _sub_once(doc, pattern, replacement, need, label, flags=0):
    matches = list(re.finditer(pattern, doc, flags))
    need(len(matches) == 1, "T40 %s: expected one source band, found %d" % (label, len(matches)))
    match = matches[0]
    return doc[:match.start()] + replacement + doc[match.end():]


T40_CSS = r'''
/* PM7 T40: stable Usage preview paint and directional resize.
   The protected Settings and Assistant surfaces are intentionally absent. */

/* Moving an existing card within the same board can restart the inherited
   staggered entrance animation.  A live transaction must keep every peer at
   its already-painted opacity while FLIP supplies the only preview motion. */
body.pm7u-pointer-op .pm7u-shell .pm7u-board .pm7u-card {
  animation: none !important;
}
'''


RESIZE_INTENT_SOURCE = r'''  function resolveResizeIntent(item, before, rawCols, rawRows) {
    rawCols = isFinite(rawCols) ? Math.round(rawCols) : before.cols;
    rawRows = isFinite(rawRows) ? Math.round(rawRows) : before.rows;
    var colDirection = rawCols === before.cols ? 0 : rawCols > before.cols ? 1 : -1;
    var rowDirection = rawRows === before.rows ? 0 : rawRows > before.rows ? 1 : -1;
    if (!colDirection && !rowDirection) return { cols: before.cols, rows: before.rows };
    var sizes = curatedSizes(item);
    if (!sizes.length) return clampLayout(item, rawCols, rawRows);
    var directional = sizes.filter(function (preset) {
      var colProgress = !colDirection || (preset[0] - before.cols) * colDirection > 0;
      var rowProgress = !rowDirection || (preset[1] - before.rows) * rowDirection > 0;
      return colProgress && rowProgress;
    });
    if (!directional.length) return { cols: before.cols, rows: before.rows };
    directional.sort(function (left, right) {
      var leftActive = (colDirection ? Math.abs(left[0] - rawCols) : 0) + (rowDirection ? Math.abs(left[1] - rawRows) : 0);
      var rightActive = (colDirection ? Math.abs(right[0] - rawCols) : 0) + (rowDirection ? Math.abs(right[1] - rawRows) : 0);
      if (leftActive !== rightActive) return leftActive - rightActive;
      var leftInactive = (!colDirection ? Math.abs(left[0] - before.cols) : 0) + (!rowDirection ? Math.abs(left[1] - before.rows) : 0);
      var rightInactive = (!colDirection ? Math.abs(right[0] - before.cols) : 0) + (!rowDirection ? Math.abs(right[1] - before.rows) : 0);
      if (leftInactive !== rightInactive) return leftInactive - rightInactive;
      var leftDistance = Math.abs(left[0] - rawCols) + Math.abs(left[1] - rawRows);
      var rightDistance = Math.abs(right[0] - rawCols) + Math.abs(right[1] - rawRows);
      if (leftDistance !== rightDistance) return leftDistance - rightDistance;
      var leftAreaDelta = Math.abs(left[0] * left[1] - before.cols * before.rows);
      var rightAreaDelta = Math.abs(right[0] * right[1] - before.cols * before.rows);
      return leftAreaDelta - rightAreaDelta || left[1] - right[1] || left[0] - right[0];
    });
    return { cols: directional[0][0], rows: directional[0][1] };
  }
  function quantizeResizeSteps(delta, step, positiveRoom, negativeRoom) {
    var steps = Math.round(delta / Math.max(1, step));
    if (steps || !delta) return steps;
    var room = delta > 0 ? positiveRoom : negativeRoom;
    /* A bottom-right grip can begin less than half a track from the viewport
       edge. Let a deliberate drag through most of that remaining edge band
       express one step; ordinary in-board grips keep the half-track rule. */
    if (!isFinite(room) || room >= step * .5) return 0;
    var edgeThreshold = Math.max(6, Math.min(step * .5, room * .65));
    return Math.abs(delta) >= edgeThreshold ? (delta > 0 ? 1 : -1) : 0;
  }
'''


SET_LAYOUT_OLD = r'''  function setLayout(item, cols, rows, commandId, source) {
    var before = layoutFor(item);
    var next = clampLayout(item, cols, rows);
    if (before.cols === next.cols && before.rows === next.rows) return next;
    var candidate = clearUsageRoomSlots(liveUsageStateSnapshot(), state.room);
    candidate.layout[state.room + ':' + item.id] = next;
    if (!persistUsageWholeState(candidate)) return before;
    if (commandId) {
      command(commandId, { page: 'usage', instance_id: item.id, col_span: next.cols, row_span: next.rows }, { persisted: true, source: source || 'unknown' });
      usageEvent('view.usage.widget_resized', { widget_id: item.id, source: source || 'unknown', before: before, after: next, content_density: densityFor(next, item) });
    }
    return next;
  }
'''


SET_LAYOUT_SOURCE = r'''  function setLayout(item, cols, rows, commandId, source) {
    var before = layoutFor(item);
    var next = clampLayout(item, cols, rows);
    if (before.cols === next.cols && before.rows === next.rows) return next;
    var candidate = clearUsageRoomSlots(liveUsageStateSnapshot(), state.room);
    candidate.layout[state.room + ':' + item.id] = next;
    var resizeSource = source || 'unknown', receipt = null;
    if (commandId) {
      receipt = command(
        commandId,
        { page:'usage', instance_id:item.id, col_span:next.cols, row_span:next.rows },
        { persisted:false, source:resizeSource },
        { defer_receipt:true }
      );
      if (receipt.dispatch_accepted === false) {
        completeCommandReceipt(receipt, { persisted:false, reason:'owner_rejected', rolled_back:true }, 'rejected');
        return before;
      }
    }
    if (!persistUsageWholeState(candidate)) {
      if (receipt) completeCommandReceipt(receipt, { persisted:false, reason:'usage_workspace_write_failed', rolled_back:true }, 'failed');
      return before;
    }
    if (receipt) {
      completeCommandReceipt(receipt, { persisted:true, source:resizeSource }, 'accepted');
      usageEvent('view.usage.widget_resized', { widget_id:item.id, source:resizeSource, before:before, after:next, content_density:densityFor(next, item) });
    }
    return next;
  }
'''


KEYBOARD_RESIZE_SOURCE = r'''      resize.addEventListener('keydown', function (event) {
        if (board._pm7ActiveReorder || document.body.classList.contains('pm7u-pointer-op')) return;
        var before = layoutFor(item), cols = before.cols, rows = before.rows;
        if (event.key === 'ArrowLeft') cols -= event.shiftKey ? 2 : 1;
        else if (event.key === 'ArrowRight') cols += event.shiftKey ? 2 : 1;
        else if (event.key === 'ArrowUp') rows -= 1;
        else if (event.key === 'ArrowDown') rows += 1;
        else return;
        event.preventDefault();
        var resolved = resolveResizeIntent(item, before, cols, rows);
        var applied = setLayout(item, resolved.cols, resolved.rows, 'cmd.widget.resize', 'keyboard');
        if (before.cols === applied.cols && before.rows === applied.rows) return;
        renderSettledBoard();
        var next = $('.pm7u-card[data-widget="' + item.id + '"] .pm7u-resize', board); if (next) next.focus();
      });
'''


RESIZE_RELEASE_OLD = r'''    function validRelease(upEvent) {
      var releaseX = Number(upEvent.clientX), releaseY = Number(upEvent.clientY);
      if (!isFinite(releaseX) || !isFinite(releaseY)) return false;
      var horizontalStep = Math.max(1, cellWidth + columnGap);
      var verticalStep = Math.max(1, rowHeight + rowGap);
      var supported = curatedSizes(item);
      var minCols = item.minCols, maxCols = item.maxCols, minRows = item.minRows, maxRows = item.maxRows;
      if (supported.length) {
        minCols = Math.min.apply(null, supported.map(function (size) { return size[0]; }));
        maxCols = Math.max.apply(null, supported.map(function (size) { return size[0]; }));
        minRows = Math.min.apply(null, supported.map(function (size) { return size[1]; }));
        maxRows = Math.max.apply(null, supported.map(function (size) { return size[1]; }));
      }
      var minX = startX + (minCols - original.cols - 1) * horizontalStep;
      var maxX = startX + (maxCols - original.cols + 1) * horizontalStep;
      var minY = startY + (minRows - original.rows - 1) * verticalStep;
      var maxY = startY + (maxRows - original.rows + 1) * verticalStep;
      return releaseX >= minX && releaseX <= maxX && releaseY >= minY && releaseY <= maxY;
    }
'''


RESIZE_RELEASE_SOURCE = r'''    function validRelease(upEvent) {
      var releaseX = Number(upEvent.clientX), releaseY = Number(upEvent.clientY);
      if (!isFinite(releaseX) || !isFinite(releaseY)) return false;
      var horizontalStep = Math.max(1, cellWidth + columnGap);
      var verticalStep = Math.max(1, rowHeight + rowGap);
      var viewportWidth = Math.max(1, document.documentElement.clientWidth || window.innerWidth || 0);
      var viewportHeight = Math.max(1, document.documentElement.clientHeight || window.innerHeight || 0);
      /* The preview is already clamped to a supported curated size.  Releasing
         farther in the same direction must commit that last painted intent,
         even when the pointer traveled more than one track beyond the maximum
         preset.  Explicit Escape/pointercancel/blur/lost-capture paths still
         cancel; only a pointerup genuinely outside the viewport-plus-one-step
         safety corridor is treated as an invalid release. */
      return releaseX >= -horizontalStep && releaseX <= viewportWidth + horizontalStep &&
        releaseY >= -verticalStep && releaseY <= viewportHeight + verticalStep;
    }
'''


def apply(doc, notes, need):
    """Apply T40 after T39 and emit fail-closed source/effect receipts."""
    need(TRANSFORM_MARKER not in doc, "T40: transform already applied")
    need("PM7 T39: exact chart labels and two-dimensional Usage slots" in doc, "T40: T39 marker missing")
    protected_before = capture_protected_sources(doc, need, "T40 input")
    effects_before = capture_effect_surfaces(doc)

    usage_style_anchor = "\n</style>\n<script>\n(function () {\n  'use strict';\n\n  var app = document.getElementById('pm7UsageApp');"
    doc = _replace_once(doc, usage_style_anchor, "\n" + T40_CSS + usage_style_anchor, need, "final Usage CSS")

    doc = _replace_once(
        doc,
        "  function layoutFor(item) {",
        RESIZE_INTENT_SOURCE + "  function layoutFor(item) {",
        need,
        "directional resize resolver",
    )
    doc = _replace_once(
        doc,
        SET_LAYOUT_OLD,
        SET_LAYOUT_SOURCE,
        need,
        "deferred owner-admitted resize settlement",
    )
    doc = _sub_once(
        doc,
        r"      resize\.addEventListener\('keydown', function \(event\) \{.*?\n      \}\);\n(?=      drag\.addEventListener\('pointerdown')",
        KEYBOARD_RESIZE_SOURCE,
        need,
        "keyboard directional resize",
        re.S,
    )
    doc = _replace_once(
        doc,
        "      var next = clampLayout(item, original.cols + Math.round((moveEvent.clientX - startX) / (cellWidth + columnGap)), original.rows + Math.round((moveEvent.clientY - startY) / (rowHeight + rowGap)));",
        "      var colSteps = quantizeResizeSteps(moveEvent.clientX - startX, cellWidth + columnGap, Math.max(0, window.innerWidth - startX), Math.max(0, startX));\n"
        "      var rowSteps = Math.round((moveEvent.clientY - startY) / (rowHeight + rowGap));\n"
        "      var rawCols = original.cols + colSteps;\n"
        "      var rawRows = original.rows + rowSteps;\n"
        "      var next = resolveResizeIntent(item, original, rawCols, rawRows);",
        need,
        "edge-aware pointer directional resize",
    )
    doc = _replace_once(
        doc,
        RESIZE_RELEASE_OLD,
        RESIZE_RELEASE_SOURCE,
        need,
        "last-painted resize release corridor",
    )

    doc = _replace_once(
        doc,
        "      intent.resulting_order.forEach(function (id) { var element=id===movedId?movingElement:cardsById[id]; if(element)board.appendChild(element); });\n",
        "      /* Preview positions are explicit grid slots. Keep peer DOM nodes mounted\n"
        "         so their entrance animation and painted opacity cannot restart. */\n",
        need,
        "preview DOM remount removal",
    )
    doc = _replace_once(
        doc,
        "      originalOrder.forEach(function (id) { var card=cardsById[id]; if(card)board.appendChild(card); });\n"
        "      originalOrder.forEach(function (id) { restoreUsageGridStyle(cardsById[id],originalStyles[id]); });",
        "      originalOrder.forEach(function (id) { restoreUsageGridStyle(cardsById[id],originalStyles[id]); });",
        need,
        "cancel DOM remount removal",
    )
    doc = _replace_once(
        doc,
        "    function restore() {\n"
        "      cards.forEach(cancelUsagePeerAnimation);\n"
        "      originalOrder.forEach(function (id) { restoreUsageGridStyle(cardsById[id],originalStyles[id]); });\n"
        "      if (originalBoardMinHeight) board.style.setProperty('min-height',originalBoardMinHeight,originalBoardMinHeightPriority); else board.style.removeProperty('min-height');\n"
        "    }\n"
        "    return { metrics:metrics,cards:cards,cardsById:cardsById,movedId:movedId,originalOrder:originalOrder,originalPlacements:originalPlacements,originalStyles:originalStyles,candidates:candidates,originalIntent:originalIntent,apply:apply,restore:restore };",
        "    function restoreBoardMinHeight() {\n"
        "      if (originalBoardMinHeight) board.style.setProperty('min-height',originalBoardMinHeight,originalBoardMinHeightPriority); else board.style.removeProperty('min-height');\n"
        "    }\n"
        "    function restore() {\n"
        "      cards.forEach(cancelUsagePeerAnimation);\n"
        "      originalOrder.forEach(function (id) { restoreUsageGridStyle(cardsById[id],originalStyles[id]); });\n"
        "      restoreBoardMinHeight();\n"
        "    }\n"
        "    return { metrics:metrics,cards:cards,cardsById:cardsById,movedId:movedId,originalOrder:originalOrder,originalPlacements:originalPlacements,originalStyles:originalStyles,candidates:candidates,originalIntent:originalIntent,apply:apply,restore:restore,restoreBoardMinHeight:restoreBoardMinHeight };",
        need,
        "preview board extent restoration helper",
    )
    doc = _replace_once(
        doc,
        "    completeCommandReceipt(receipt,{persisted:true,room:state.room,visual_order:fullOrder,source:source,slot_id:intent.slot_id},'accepted');\n"
        "    usageEvent('view.usage.widget_moved',{widget_id:session.movedId,room:state.room,order:fullOrder,settled_position:settledPosition,source:source});\n"
        "    return true;",
        "    completeCommandReceipt(receipt,{persisted:true,room:state.room,visual_order:fullOrder,source:source,slot_id:intent.slot_id},'accepted');\n"
        "    usageEvent('view.usage.widget_moved',{widget_id:session.movedId,room:state.room,order:fullOrder,settled_position:settledPosition,source:source});\n"
        "    session.restoreBoardMinHeight();\n"
        "    intent.resulting_order.forEach(function(id){var element=session.cardsById[id];if(element)board.appendChild(element);});\n"
        "    return true;",
        need,
        "single settled DOM-order reconciliation",
    )
    doc = _replace_once(
        doc,
        "        intent.resulting_order.forEach(function(id){var element=session.cardsById[id];if(element)board.appendChild(element);});setUsageGridStyle(cardElement,intent.placements[movedId],intent.slot_id);",
        "        setUsageGridStyle(cardElement,intent.placements[movedId],intent.slot_id);",
        need,
        "pointer duplicate DOM reconciliation removal",
    )
    doc = _replace_once(
        doc,
        "    handle.setAttribute('aria-grabbed','false');cardElement.classList.remove('is-keyboard-picked');opOff();schedulePhysicalContentTiers();",
        "    handle.setAttribute('aria-grabbed','false');cardElement.classList.remove('is-keyboard-picked');opOff();settleUsageCardAnimations();schedulePhysicalContentTiers();",
        need,
        "keyboard settled-animation finish",
    )

    marker_anchor = "/* PM7 T40: stable Usage preview paint and directional resize."
    need(doc.count(marker_anchor) == 1, "T40: CSS marker census mismatch")

    protected_receipt = assert_protected_sources_equal(
        protected_before,
        capture_protected_sources(doc, need, "T40 output"),
        need,
        "T40",
    )
    effect_receipt = assert_effect_delta(
        effects_before,
        capture_effect_surfaces(doc),
        {},
        need,
        "T40",
    )

    need(doc.count(TRANSFORM_MARKER) == 1, "T40: transform marker census mismatch")
    need("function resolveResizeIntent(item, before, rawCols, rawRows)" in doc, "T40: directional resize resolver missing")
    need("reason:'owner_rejected'" in doc and "reason:'usage_workspace_write_failed'" in doc and "{ defer_receipt:true }" in doc and "if (!persistUsageWholeState(candidate))" in doc and "completeCommandReceipt(receipt, { persisted:true, source:resizeSource }, 'accepted')" in doc, "T40: resize owner rejection or adapter failure can settle success")
    need("function quantizeResizeSteps(delta, step, positiveRoom, negativeRoom)" in doc and "room * .65" in doc, "T40: edge-constrained pointer quantizer missing")
    need("viewportWidth + horizontalStep" in doc and "viewportHeight + verticalStep" in doc and "pointerup genuinely outside the viewport-plus-one-step" in doc, "T40: last-painted resize release corridor missing")
    need("var resolved = resolveResizeIntent(item, before, cols, rows);" in doc, "T40: keyboard resize bypasses directional resolver")
    need("var next = resolveResizeIntent(item, original, rawCols, rawRows);" in doc, "T40: pointer resize bypasses directional resolver")
    need("Keep peer DOM nodes mounted" in doc and "single settled DOM-order reconciliation" not in doc, "T40: stable preview source missing")
    need("body.pm7u-pointer-op .pm7u-shell .pm7u-board .pm7u-card" in doc and "animation: none !important" in T40_CSS, "T40: transaction animation guard missing")
    need("opOff();settleUsageCardAnimations();schedulePhysicalContentTiers();" in doc, "T40: keyboard animation settlement missing")
    need("restoreBoardMinHeight:restoreBoardMinHeight" in doc and "session.restoreBoardMinHeight();" in doc, "T40: successful reorder can leak preview board extent")
    authored_t40 = "\n".join([T40_CSS, RESIZE_INTENT_SOURCE, SET_LAYOUT_SOURCE, KEYBOARD_RESIZE_SOURCE, RESIZE_RELEASE_SOURCE])
    need(all(token not in authored_t40 for token in ["cmd.workspace_layout", "context.compaction", "workspace.layout_changed", "pm:workspace-layout-changed"]), "T40: unauthorized command/event surface")
    need(all(token not in authored_t40 for token in ["PM7_CONTEXT", "Tome Tabs", "Kimi", "PM_Chat_Assistant_5.6_Pro_Standalone"]), "T40: protected Chat or Settings source referenced")

    notes.update({
        "decision": "authorized T40 repair for stable Usage preview paint and horizontal curated resizing",
        "usage_preview": "peer DOM nodes remain mounted during preview; only the final accepted order reconciles DOM order, entrance animations cannot replay during the transaction, and temporary preview board extent is restored on both rollback and commit",
        "usage_resize": "pointer and keyboard one-axis input advances strictly along that supported curated axis while minimizing companion-axis drift; an in-viewport release commits the last painted supported intent even after deliberate same-direction overshoot; owner rejection or adapter failure rolls back with one truthful rejected/failed receipt and no settled event or successful write",
        "protected_embedded_source_guard": protected_receipt,
        "effect_surface_set_diff": effect_receipt,
    })
    return doc
