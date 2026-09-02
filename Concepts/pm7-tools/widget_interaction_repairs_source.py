"""Source-owned T38 PM7 widget interaction and chart-label repairs.

T38 is deliberately narrow: it repairs the already-authorized Usage reorder
transaction, the shared vertical-bar renderer, and Home Dashboard widget
transactions.  It does not edit the protected embedded Settings or Assistant
owners, add command/event identifiers, or change prototype storage keys.
"""

from __future__ import annotations

import hashlib
import re

from pm7_transform_guards import (
    assert_effect_delta,
    assert_protected_sources_equal,
    capture_effect_surfaces,
    capture_protected_sources,
)


TRANSFORM_MARKER = "PM7 T38: stable widget transactions and chart labels"


def _replace_once(doc, old, new, need, label):
    need(doc.count(old) == 1, "T38 %s: expected one anchor, found %d" % (label, doc.count(old)))
    return doc.replace(old, new, 1)


def _sub_once(doc, pattern, replacement, need, label, flags=0):
    matches = list(re.finditer(pattern, doc, flags))
    need(len(matches) == 1, "T38 %s: expected one source band, found %d" % (label, len(matches)))
    return doc[:matches[0].start()] + replacement + doc[matches[0].end():]


T38_CSS = r'''
/* PM7 T38: stable widget transactions and chart labels.
   The protected Settings and Assistant surfaces are intentionally absent. */

/* The reorder marker must have exactly the physical footprint that the held
   Usage card currently paints.  T38 supplies these measured span variables. */
.pm7u-shell .pm7u-reorder-placeholder {
  grid-column: auto / span var(--pm7-placeholder-physical-cols, var(--pm7-placeholder-cols, 3)) !important;
  grid-row: auto / span var(--pm7-placeholder-physical-rows, var(--pm7-placeholder-rows, 3)) !important;
}
body.pm7u-pointer-op .pm7u-boardscroll,
body.pm7u-pointer-op .pm7u-board,
html.pm7-dash-moving #pm6DashScroll,
html.pm7-dash-moving #pm6DashGrid {
  overflow-anchor: none !important;
}
/* `row dense` can back-fill the final card into an earlier geometric hole,
   collapsing distinct before/after identities into one painted rectangle.
   Reorderable boards must paint settled DOM order monotonically so every
   semantic insertion, including the final/below slot, remains reachable. */
.pm7u-shell .pm7u-board {
  grid-auto-flow: row !important;
}
/* At the 860px application width the Usage stage is roughly 790px wide.
   Keeping twelve tracks in that narrow band can pack an end insertion beside
   the preceding wide card even when the painted pointer intent is the lower
   slot.  Enter the existing six-track responsive composition before that
   ambiguous band; this changes only presentation, not the settled order or
   the measured preview footprint. */
@container pm7u-stage (max-width: 820px) {
  .pm7u-shell .pm7u-board {
    min-width: 0 !important;
    grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
  }
  .pm7u-shell .pm7u-card[data-cols="2"],
  .pm7u-shell .pm7u-card[data-cols="3"] {
    grid-column: span 3 !important;
  }
  .pm7u-shell .pm7u-card:is([data-cols="4"],[data-cols="5"],[data-cols="6"],[data-cols="7"],[data-cols="8"],[data-cols="9"],[data-cols="10"],[data-cols="11"],[data-cols="12"]) {
    grid-column: 1 / -1 !important;
  }
}

/* Values use one placement rule: every painted value is immediately above
   its own fill.  The plot reserves a real label lane and remains the final
   clipping boundary. */
.pm7u-shell .pm7u-mini-bars {
  --pm7u-label-reserve: 30px;
  padding-top: var(--pm7u-label-reserve) !important;
}
.pm7u-shell .pm7u-barfill {
  overflow: visible !important;
}
.pm7u-shell .pm7u-barcol.is-labeled .pm7u-barvalue {
  display: flex !important;
  left: 50% !important;
  right: auto !important;
  top: auto !important;
  bottom: calc(max(var(--pm7u-bar-height, 0%), 5px) + 3px) !important;
  width: max-content !important;
  min-width: max-content !important;
  max-width: none !important;
  height: 11px !important;
  padding: 0 !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: visible !important;
  color: var(--text-secondary) !important;
  text-shadow: none !important;
  transform: translateX(-50%) !important;
}
.pm7u-shell .pm7u-barcol.is-labeled.is-short .pm7u-barvalue {
  top: auto !important;
  bottom: calc(max(var(--pm7u-bar-height, 0%), 5px) + 3px) !important;
}
.pm7u-shell .pm7u-barcol.is-label-suppressed .pm7u-barvalue {
  display: none !important;
}
.pm7u-shell .pm7u-barcol.is-label-raised .pm7u-barvalue {
  bottom: calc(max(var(--pm7u-bar-height, 0%), 5px) + 15px) !important;
}
.pm7u-shell .pm7u-barcol.is-labeled:first-child .pm7u-barvalue {
  left: 0 !important;
  transform: none !important;
}
.pm7u-shell .pm7u-barcol.is-labeled:last-child .pm7u-barvalue {
  left: auto !important;
  right: 0 !important;
  transform: none !important;
}

/* The title and latest/peak fact are either a complete single row or a
   complete two-row narrow composition.  Neither required fact is ellipsized. */
.pm7u-shell .pm7u-signal-label {
  grid-template-columns: minmax(0, 1fr) max-content !important;
  width: 100% !important;
  min-width: 0 !important;
  padding: 0 2px !important;
  overflow: visible !important;
}
.pm7u-shell .pm7u-signal-label span,
.pm7u-shell .pm7u-signal-label b {
  min-width: 0 !important;
  max-width: 100% !important;
  overflow: visible !important;
  text-overflow: clip !important;
  white-space: nowrap !important;
}
@container pm7u-card (max-width: 360px) {
  .pm7u-shell .pm7u-signal-label {
    grid-template-columns: minmax(0, 1fr) !important;
    grid-template-rows: auto auto !important;
    align-items: start !important;
    gap: 1px !important;
  }
  .pm7u-shell .pm7u-signal-label span,
  .pm7u-shell .pm7u-signal-label b {
    justify-self: start !important;
    padding-left: 0 !important;
  }
}

/* A canonical 2x3 summary can be only about 142px wide on the twelve-track
   board.  Keep both primary facts, but stack the trend below the value once
   their intrinsic widths cannot coexist. */
@container pm7u-card (max-width: 180px) {
  .pm7u-shell .pm7u-card[data-kind="summary"] .pm7u-summary-main {
    grid-template-columns: minmax(0, 1fr) !important;
    grid-template-rows: auto auto !important;
    align-items: start !important;
    gap: 2px !important;
    padding-right: 0 !important;
  }
  .pm7u-shell .pm7u-card[data-kind="summary"] .pm7u-summary-main > em {
    justify-self: start !important;
    margin-left: 0 !important;
    padding: 0 !important;
  }
}

/* Home keeps its existing visual vocabulary, with a marker that remains
   unmistakable above cards while the held card is represented by a body
   portal ghost. */
.pm7-dash-move-placeholder,
.pm7-dash-resize-placeholder {
  position: relative !important;
  z-index: 18 !important;
  outline: 3px dashed color-mix(in srgb, var(--accent-primary) 88%, white) !important;
  outline-offset: -5px !important;
  background: color-mix(in srgb, var(--accent-primary) 12%, var(--surface-elevated)) !important;
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--accent-primary) 38%, transparent),
              0 0 18px color-mix(in srgb, var(--accent-primary) 28%, transparent) !important;
}
body > .pm7-dash-move-ghost {
  z-index: 2147483000 !important;
  display: flex !important;
  visibility: visible !important;
  animation: none !important;
}
.pm6-dash-drag:not([data-pm6-dash="drag"]) {
  clip-path: none !important;
}
.pm6-dash-drag:not([data-pm6-dash="drag"]) svg {
  pointer-events: none !important;
}
.pm6-dash-card.is-keyboard-picked {
  outline: 2px solid var(--accent-primary) !important;
  outline-offset: 3px !important;
}
'''


MINI_BARS_SOURCE = r'''  function sampledBarLabel(index, count) {
    if (count <= 5) return true;
    var slots = 5, selected = {};
    for (var slot = 0; slot < slots; slot += 1) selected[Math.round(slot * (count - 1) / (slots - 1))] = true;
    return !!selected[index];
  }
  function compactBarValue(value, formatter) {
    if (formatter === 'money-cents') {
      var dollars = Math.max(0, Number(value) || 0) / 100;
      return '$' + (dollars >= 100 ? Math.round(dollars) : dollars >= 10 ? dollars.toFixed(1).replace(/\.0$/, '') : dollars.toFixed(2).replace(/0$/, '').replace(/\.0$/, ''));
    }
    if (formatter === 'money') return '$' + compactBarValue(value, 'number');
    if (value >= 1000000) return (Math.round(value / 100000) / 10) + 'm';
    if (value >= 1000) return (Math.round(value / 100) / 10) + 'k';
    return String(value);
  }
  function miniBars(values, tier, label, formatter) {
    var clean = (values || []).map(function (value) {
      var numeric = Number(value);
      return Math.max(0, Math.round(isFinite(numeric) ? numeric : 0));
    });
    var latest = clean.length ? clean[clean.length - 1] : 0;
    var peak = Math.max.apply(Math, clean.concat([1]));
    var count = clean.length;
    var seriesLabel = label || 'Recent trend';
    var formatKind = formatter || 'number';
    var formatted = clean.map(function (value) { return compactBarValue(value, formatKind); });
    var seriesSummary = 'Latest ' + compactBarValue(latest, formatKind) + (peak !== latest ? ' · peak ' + compactBarValue(peak, formatKind) : '');
    /* Ninety-percent headroom plus the plot's explicit label reserve keeps
       every fill-relative value inside the complete chart boundary. */
    var HEADROOM = 0.90;
    return '<div class="pm7u-mini-signal ' + (tier ? 'pm7u-tier-' + tier : '') + '" data-bars="' + count + '" data-bar-formatter="' + esc(formatKind) + '">' +
      '<div class="pm7u-signal-label"><span title="' + esc(seriesLabel) + '">' + esc(seriesLabel) + '</span><b title="' + esc(seriesSummary) + '">' + esc(seriesSummary) + '</b></div>' +
      '<div class="pm7u-mini-bars" style="--pm7u-bar-count:' + count + '" role="img" aria-label="' + esc(seriesLabel + ', values ' + formatted.join(', ') + '; ' + seriesSummary) + '">' + clean.map(function (value, index) {
        var recent = index >= count - 4;
        var visualHeight = value <= 0 ? 0 : Math.max(8, Math.min(Math.round(100 * HEADROOM), Math.round(value / peak * 100 * HEADROOM)));
        var short = visualHeight < 34;
        var labeled = sampledBarLabel(index, count);
        return '<span class="pm7u-barcol' + (recent ? ' is-recent' : '') + (short ? ' is-short' : '') + (labeled ? ' is-labeled' : '') + '" style="--pm7u-bar-height:' + visualHeight + '%" data-value="' + value + '" data-series-index="' + index + '" title="' + esc(seriesLabel + ': ' + formatted[index]) + '">' +
          '<span class="pm7u-barfill"></span>' + (labeled ? '<b class="pm7u-barvalue">' + esc(formatted[index]) + '</b>' : '') + '</span>';
      }).join('') + '</div></div>';
  }
  function fitUsageBarLabels(root) {
    var scope = root && root.querySelectorAll ? root : board;
    $$('.pm7u-mini-bars', scope).forEach(function (plot) {
      var columns = $$('.pm7u-barcol.is-labeled', plot);
      columns.forEach(function (column) { column.classList.remove('is-label-suppressed','is-label-raised'); });
      var plotRect = plot.getBoundingClientRect();
      if (!plotRect.width || !plotRect.height || columns.length < 2) return;
      var kept = [];
      function rect(column) { var label = $('.pm7u-barvalue', column); return label && label.getClientRects().length ? label.getBoundingClientRect() : null; }
      function overlaps(left, right) { return left && right && Math.min(left.right, right.right) - Math.max(left.left, right.left) > 2 && Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top) > .5; }
      function outside(value) { return value && (value.left < plotRect.left - .5 || value.right > plotRect.right + .5 || value.top < plotRect.top - .5 || value.bottom > plotRect.bottom + .5); }
      columns.forEach(function (column, index) {
        var current = rect(column), isEdge = index === 0 || index === columns.length - 1;
        if (!current) return;
        if (outside(current)) { column.classList.add('is-label-suppressed'); return; }
        var prior = kept.length ? kept[kept.length - 1] : null;
        if (isEdge && prior && overlaps(prior.rect, current) && !prior.edge) {
          prior.column.classList.add('is-label-suppressed');
          kept.pop();
          prior = kept.length ? kept[kept.length - 1] : null;
        }
        if (prior && overlaps(prior.rect, current) && isEdge && prior.edge) {
          column.classList.add('is-label-raised'); current = rect(column);
        }
        if (outside(current) || overlaps(prior && prior.rect, current)) { column.classList.add('is-label-suppressed'); return; }
        kept.push({ column:column, rect:current, edge:isEdge });
      });
    });
  }
  var usageChartLabelFrame = 0;
  function scheduleUsageChartLabels(root) {
    if (usageChartLabelFrame) cancelAnimationFrame(usageChartLabelFrame);
    usageChartLabelFrame = requestAnimationFrame(function () { usageChartLabelFrame = 0; fitUsageBarLabels(root || board); });
  }
'''


USAGE_START_DRAG_SOURCE = r'''  function startDrag(event, cardElement) {
    if (event.button !== 0) return;
    if (board._pm7ActiveReorder || document.body.classList.contains('pm7u-pointer-op')) return;
    event.preventDefault(); event.stopPropagation(); closePops();
    var handle = event.currentTarget || event.target, pointerId = event.pointerId;
    var originalOrder = currentOrder(), movedId = cardElement.getAttribute('data-widget');
    var originalIndex = originalOrder.indexOf(movedId);
    var originalGridColumn = cardElement.style.getPropertyValue('grid-column');
    var originalBoardMinHeight = board.style.getPropertyValue('min-height');
    var rect = cardElement.getBoundingClientRect(), offsetX = event.clientX - rect.left, offsetY = event.clientY - rect.top;
    var boardStyle = getComputedStyle(board), tracks = String(boardStyle.gridTemplateColumns || '').trim().split(/\s+/).filter(function (track) { return track && track !== 'none'; });
    var trackCount = tracks.length || 12, columnGap = parseFloat(boardStyle.columnGap) || 10, rowGap = parseFloat(boardStyle.rowGap) || columnGap;
    var trackWidth = (board.clientWidth - (parseFloat(boardStyle.paddingLeft) || 0) - (parseFloat(boardStyle.paddingRight) || 0) - columnGap * Math.max(0, trackCount - 1)) / trackCount;
    var rowHeight = parseFloat(boardStyle.gridAutoRows) || 100;
    var physicalCols = Math.max(1, Math.min(trackCount, Math.round((rect.width + columnGap) / Math.max(1, trackWidth + columnGap))));
    var physicalRows = Math.max(1, Math.round((rect.height + rowGap) / Math.max(1, rowHeight + rowGap)));
    var ghost = cardElement.cloneNode(true);
    ghost.classList.add('pm7u-ghost'); ghost.setAttribute('aria-hidden', 'true'); ghost.inert = true;
    ghost.querySelectorAll('[id]').forEach(function (node) { node.removeAttribute('id'); });
    ghost.querySelectorAll('button,[href],input,select,textarea,[tabindex]').forEach(function (node) { node.setAttribute('tabindex', '-1'); });
    ghost.style.width = rect.width + 'px'; ghost.style.height = rect.height + 'px'; ghost.style.left = rect.left + 'px'; ghost.style.top = rect.top + 'px';
    var placeholder = document.createElement('div');
    placeholder.className = 'pm7u-reorder-placeholder'; placeholder.setAttribute('aria-hidden', 'true');
    placeholder.style.setProperty('--pm7-placeholder-cols', cardElement.getAttribute('data-cols') || 3);
    placeholder.style.setProperty('--pm7-placeholder-rows', cardElement.getAttribute('data-rows') || 3);
    placeholder.style.setProperty('--pm7-placeholder-physical-cols', physicalCols);
    placeholder.style.setProperty('--pm7-placeholder-physical-rows', physicalRows);
    board.insertBefore(placeholder, cardElement); cardElement.classList.add('is-reorder-source');
    document.body.appendChild(ghost); opOn(); handle.setAttribute('aria-grabbed', 'true');
    var finished = false, validDrop = true, scrollFrame = 0, pointerFrame = 0;
    var lastPointerX = event.clientX, lastPointerY = event.clientY;
    var candidates = [], currentIntent = null, intentSerial = 0;
    function peerElements() { return $$('.pm7u-card:not(.is-reorder-source)', board); }
    function boardPoint(clientX, clientY) { var boardRect = board.getBoundingClientRect(); return { x:clientX-boardRect.left, y:clientY-boardRect.top }; }
    function candidateRect() { var boardRect = board.getBoundingClientRect(), marker = placeholder.getBoundingClientRect(); return { left:marker.left-boardRect.left, top:marker.top-boardRect.top, right:marker.right-boardRect.left, bottom:marker.bottom-boardRect.top, width:marker.width, height:marker.height }; }
    function insertionReference(index) { var peers = peerElements(); return index < peers.length ? peers[index] : null; }
    function insertAt(index) { var reference = insertionReference(index); if (reference) board.insertBefore(placeholder, reference); else board.appendChild(placeholder); }
    function measureCandidates() {
      var peers = peerElements(), measured = [], seen = {};
      for (var index = 0; index <= peers.length; index += 1) {
        insertAt(index);
        var measuredRect = candidateRect(), signature = [Math.round(measuredRect.left*10),Math.round(measuredRect.top*10),Math.round(measuredRect.width*10),Math.round(measuredRect.height*10)].join(':');
        if (!seen[signature]) {
          seen[signature] = true;
          measured.push({ index:index, before_id:index < peers.length ? peers[index].getAttribute('data-widget') : null, after_id:index ? peers[index-1].getAttribute('data-widget') : null, rect:measuredRect, token:'slot-' + index + '-' + (index < peers.length ? peers[index].getAttribute('data-widget') : 'end') });
        }
      }
      insertAt(Math.max(0, originalIndex));
      candidates = measured;
      var reachableBottom = candidates.reduce(function (bottom, candidate) { return Math.max(bottom,candidate.rect.bottom); },0);
      if (reachableBottom) board.style.setProperty('min-height',Math.ceil(reachableBottom+8)+'px');
      currentIntent = candidates.filter(function (candidate) { return candidate.index === Math.max(0, originalIndex); })[0] || candidates[0];
      board._pm7ActiveReorder = { widget_id:movedId, candidates:candidates.map(function (candidate) { return { index:candidate.index,before_id:candidate.before_id,after_id:candidate.after_id,token:candidate.token,rect:Object.assign({},candidate.rect) }; }), intent:currentIntent ? currentIntent.token : null };
      if (currentIntent) { placeholder.setAttribute('data-drop-intent', currentIntent.token); placeholder.setAttribute('data-drop-index', String(currentIntent.index)); }
    }
    function capturePaintedPeers() {
      var positions = new Map();
      peerElements().forEach(function (peer) { positions.set(peer, peer.getBoundingClientRect()); });
      return positions;
    }
    function cancelPeerAnimation(peer) {
      if (peer._pm7ReorderAnimation) { try { peer._pm7ReorderAnimation.cancel(); } catch (error) {} peer._pm7ReorderAnimation = null; }
      peer.style.removeProperty('transform');
    }
    function animatePeers(before) {
      var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      peerElements().forEach(function (peer) {
        var first = before.get(peer); cancelPeerAnimation(peer);
        if (!first) return;
        var last = peer.getBoundingClientRect(), x = first.left - last.left, y = first.top - last.top;
        if (Math.abs(x) < .5 && Math.abs(y) < .5) return;
        if (reduce || typeof peer.animate !== 'function') return;
        var animation = peer.animate([{ transform:'translate3d(' + x + 'px,' + y + 'px,0)' }, { transform:'translate3d(0,0,0)' }], { duration:190, easing:'cubic-bezier(.2,.8,.2,1)' });
        peer._pm7ReorderAnimation = animation;
        animation.onfinish = animation.oncancel = function () { if (peer._pm7ReorderAnimation === animation) peer._pm7ReorderAnimation = null; };
      });
    }
    function releasePeers() { peerElements().forEach(cancelPeerAnimation); }
    function distanceTo(candidate, point) {
      var dx = point.x < candidate.rect.left ? candidate.rect.left-point.x : point.x > candidate.rect.right ? point.x-candidate.rect.right : 0;
      var dy = point.y < candidate.rect.top ? candidate.rect.top-point.y : point.y > candidate.rect.bottom ? point.y-candidate.rect.bottom : 0;
      var centerX = candidate.rect.left + candidate.rect.width/2, centerY = candidate.rect.top + candidate.rect.height/2;
      return dx*dx + dy*dy + Math.pow(point.x-centerX,2)*.012 + Math.pow(point.y-centerY,2)*.012;
    }
    function chooseIntent(clientX, clientY) {
      var point = boardPoint(clientX, clientY), best = null, bestScore = Infinity;
      candidates.forEach(function (candidate) { var score = distanceTo(candidate, point); if (score < bestScore) { bestScore = score; best = candidate; } });
      if (!best || !currentIntent || best.token === currentIntent.token) return best || currentIntent;
      var currentScore = distanceTo(currentIntent, point), hysteresis = 12;
      return bestScore + hysteresis*hysteresis < currentScore ? best : currentIntent;
    }
    function placeIntent(intent) {
      if (!intent || (currentIntent && intent.token === currentIntent.token)) return;
      var before = capturePaintedPeers();
      peerElements().forEach(cancelPeerAnimation);
      var lockedScrollTop = boardScroll.scrollTop;
      insertAt(intent.index);
      boardScroll.scrollTop = lockedScrollTop;
      currentIntent = intent; intentSerial += 1;
      placeholder.setAttribute('data-drop-intent', intent.token);
      placeholder.setAttribute('data-drop-index', String(intent.index));
      placeholder.setAttribute('data-drop-serial', String(intentSerial));
      if (board._pm7ActiveReorder) board._pm7ActiveReorder.intent = intent.token;
      animatePeers(before);
    }
    function visibleScrollRect() {
      var scrollRect = boardScroll.getBoundingClientRect(), footer = document.querySelector('.pm7-statusbar'), footerRect = footer ? footer.getBoundingClientRect() : null;
      return { left:scrollRect.left, right:scrollRect.right, top:scrollRect.top, bottom:footerRect && footerRect.top > scrollRect.top ? Math.min(scrollRect.bottom,footerRect.top) : scrollRect.bottom };
    }
    function pointInside(clientX, clientY) { var visible = visibleScrollRect(), boardRect = board.getBoundingClientRect(); return clientX >= Math.max(visible.left,boardRect.left) && clientX <= Math.min(visible.right,boardRect.right) && clientY >= visible.top && clientY <= visible.bottom; }
    function paintPointer() {
      pointerFrame = 0;
      if (finished) return;
      ghost.style.left = (lastPointerX-offsetX) + 'px'; ghost.style.top = (lastPointerY-offsetY) + 'px';
      validDrop = pointInside(lastPointerX,lastPointerY);
      if (validDrop) placeIntent(chooseIntent(lastPointerX,lastPointerY));
    }
    function schedulePointer() { if (!pointerFrame) pointerFrame = requestAnimationFrame(paintPointer); }
    function edgeScrollVelocity() {
      var visible = visibleScrollRect(), edge = Math.min(78,Math.max(54,(visible.bottom-visible.top)*.18));
      if (lastPointerX < visible.left || lastPointerX > visible.right) return 0;
      if (lastPointerY < visible.top+edge && boardScroll.scrollTop > 0) return -Math.ceil(3+Math.max(0,Math.min(1,(visible.top+edge-lastPointerY)/edge))*9);
      if (lastPointerY > visible.bottom-edge && boardScroll.scrollTop < boardScroll.scrollHeight-boardScroll.clientHeight) return Math.ceil(3+Math.max(0,Math.min(1,(lastPointerY-(visible.bottom-edge))/edge))*9);
      return 0;
    }
    function autoScrollTick() {
      scrollFrame = 0; if (finished) return;
      var velocity = edgeScrollVelocity(); if (!velocity) return;
      var before = boardScroll.scrollTop; boardScroll.scrollTop += velocity;
      if (boardScroll.scrollTop !== before) { paintPointer(); scrollFrame = requestAnimationFrame(autoScrollTick); }
    }
    function ensureAutoScroll() { if (!scrollFrame && edgeScrollVelocity()) scrollFrame = requestAnimationFrame(autoScrollTick); }
    function move(moveEvent) {
      if (moveEvent.pointerId !== pointerId) return;
      moveEvent.preventDefault(); lastPointerX = moveEvent.clientX; lastPointerY = moveEvent.clientY; schedulePointer(); ensureAutoScroll();
    }
    function cleanup() {
      if (pointerFrame) cancelAnimationFrame(pointerFrame); pointerFrame = 0;
      if (scrollFrame) cancelAnimationFrame(scrollFrame); scrollFrame = 0;
      document.removeEventListener('pointermove',move,true); document.removeEventListener('pointerup',commit,true); document.removeEventListener('pointercancel',cancel,true); document.removeEventListener('keydown',keydown,true);
      window.removeEventListener('blur',blur); handle.removeEventListener('lostpointercapture',lostCapture);
      try { if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId); } catch (error) {}
      if (originalBoardMinHeight) board.style.setProperty('min-height',originalBoardMinHeight); else board.style.removeProperty('min-height');
      if (ghost.parentNode) ghost.remove(); opOff(); handle.setAttribute('aria-grabbed','false');
    }
    function finish(shouldCommit, restoreFocus) {
      if (finished) return; finished = true;
      var previewRect = placeholder.parentNode ? placeholder.getBoundingClientRect() : null;
      if (!shouldCommit) insertAt(Math.max(0,originalIndex));
      else cardElement.style.removeProperty('grid-column');
      if (placeholder.parentNode) placeholder.parentNode.replaceChild(cardElement,placeholder);
      cardElement.classList.remove('is-reorder-source');
      if (!shouldCommit) { restoreOrder(originalOrder); if (originalGridColumn) cardElement.style.setProperty('grid-column',originalGridColumn); else cardElement.style.removeProperty('grid-column'); }
      releasePeers();
      /* The card's page-entry animation uses a translated first keyframe.
         Finish it before measuring the settled slot so the last painted
         placeholder and the first committed frame share exact geometry. */
      settleUsageCardAnimations();
      var landingRect = cardElement.getBoundingClientRect();
      board._pm7ActiveReorder = null;
      cleanup();
      var changed = shouldCommit ? commitOrder(originalOrder,movedId,'pointer',cardElement) : false;
      board._pm7LastReorder = { widget_id:movedId, committed:changed, intent:currentIntent ? { token:currentIntent.token,index:currentIntent.index,before_id:currentIntent.before_id,after_id:currentIntent.after_id } : null, preview_rect:previewRect ? { left:previewRect.left,top:previewRect.top,width:previewRect.width,height:previewRect.height } : null, landing_rect:{ left:landingRect.left,top:landingRect.top,width:landingRect.width,height:landingRect.height } };
      if (restoreFocus !== false) handle.focus({ preventScroll:true });
    }
    function commit(upEvent) { if (upEvent.pointerId !== pointerId) return; upEvent.preventDefault(); finish(validDrop && pointInside(upEvent.clientX,upEvent.clientY),true); }
    function cancel(cancelEvent) { if (cancelEvent && cancelEvent.pointerId != null && cancelEvent.pointerId !== pointerId) return; finish(false,true); }
    function keydown(keyEvent) { if (keyEvent.key !== 'Escape') return; keyEvent.preventDefault(); finish(false,true); }
    function blur() { finish(false,false); }
    function lostCapture(captureEvent) { if (!finished && captureEvent.pointerId === pointerId) finish(false,true); }
    measureCandidates();
    handle.addEventListener('lostpointercapture',lostCapture);
    try { handle.setPointerCapture(pointerId); } catch (error) {}
    document.addEventListener('pointermove',move,{capture:true,passive:false}); document.addEventListener('pointerup',commit,true); document.addEventListener('pointercancel',cancel,true); document.addEventListener('keydown',keydown,true); window.addEventListener('blur',blur);
  }
'''


USAGE_SETTLE_ANIMATIONS_SOURCE = r'''  function settleUsageCardAnimations() {
    $$('.pm7u-card', board).forEach(function (card) {
      /* T34 used a permanent inline animation override to stop a settled
         card replaying its entrance. Finish the current CSS animation at its
         end state instead, so no preview style survives the transaction. */
      card.style.removeProperty('animation');
      if (typeof card.getAnimations !== 'function') return;
      card.getAnimations().forEach(function (animation) {
        try { animation.finish(); }
        catch (error) { try { animation.cancel(); } catch (ignored) {} }
      });
    });
  }
'''


USAGE_PERSIST_ORDER_SOURCE = r'''  function persistOrder(order) {
    var room = state.room;
    var previousStateOrder = (state.order[room] || []).slice();
    var previousWorkspaceOrder = JSON.parse(JSON.stringify(USAGE_WORKSPACE.state.order || {}));
    var previousRevision = USAGE_WORKSPACE.committed_revision;
    state.order[room] = order.slice();
    var persisted = STORE.set(KEY + 'order', state.order);
    if (persisted === true) return true;
    state.order[room] = previousStateOrder;
    USAGE_WORKSPACE.state.order = previousWorkspaceOrder;
    USAGE_WORKSPACE.committed_revision = previousRevision;
    return false;
  }
'''


USAGE_COMMIT_ORDER_SOURCE = r'''  function commitOrder(originalOrder, movedId, source, cardElement) {
    var visibleOrder = currentOrder();
    if (ordersEqual(originalOrder, visibleOrder)) return false;
    var fullOrder = fullRoomOrder(visibleOrder);
    var settledPosition = settledGridPosition(cardElement || $('.pm7u-card[data-widget="' + movedId + '"]', board));
    var receipt = command('cmd.widget.move', { page:'usage', instance_id:movedId, col:settledPosition.col, row:settledPosition.row }, { persisted:false, room:state.room, visual_order:fullOrder, source:source }, { defer_receipt:true });
    if (receipt.dispatch_accepted === false) {
      restoreOrder(originalOrder);
      completeCommandReceipt(receipt, { persisted:false, reason:'owner_rejected', rolled_back:true }, 'rejected');
      return false;
    }
    if (!persistOrder(fullOrder)) {
      restoreOrder(originalOrder);
      completeCommandReceipt(receipt, { persisted:false, reason:'usage_workspace_write_failed', rolled_back:true }, 'failed');
      return false;
    }
    completeCommandReceipt(receipt, { persisted:true, room:state.room, visual_order:fullOrder, source:source }, 'accepted');
    usageEvent('view.usage.widget_moved', { widget_id:movedId, room:state.room, order:fullOrder, settled_position:settledPosition, source:source });
    return true;
  }
'''


HOME_STORAGE_SOURCE = r'''  var DASH_FAULTS = { fail_next_write:false };
  var DASH_LOAD = { source_key:null, copy_forward:false, evicted_keys:[] };
  function readDashState() {
    var keys = [DASH_KEY, LEGACY_DASH_KEY];
    for (var index = 0; index < keys.length; index += 1) {
      var key = keys[index], raw = null;
      try { raw = window.localStorage.getItem(key); } catch (error) { raw = null; }
      if (raw == null) continue;
      try {
        var parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid_dashboard_state');
        DASH_LOAD.source_key = key;
        DASH_LOAD.copy_forward = key !== DASH_KEY;
        return parsed;
      } catch (error) {
        try { if (key === DASH_KEY) window.localStorage.removeItem(DASH_KEY); else window.localStorage.removeItem(LEGACY_DASH_KEY); } catch (ignored) {}
        DASH_LOAD.evicted_keys.push(key);
      }
    }
    return {};
  }
  function writeDashState(value) {
    var encoded = JSON.stringify(value), prior = null, hadPrior = false;
    try {
      prior = window.localStorage.getItem(DASH_KEY); hadPrior = prior !== null;
      if (DASH_FAULTS.fail_next_write) { DASH_FAULTS.fail_next_write = false; throw new Error('injected_dashboard_write_failure'); }
      window.localStorage.setItem(DASH_KEY, encoded);
      if (window.localStorage.getItem(DASH_KEY) !== encoded) throw new Error('dashboard_write_readback_mismatch');
      return { ok:true, encoded:encoded };
    } catch (error) {
      try { if (hadPrior) window.localStorage.setItem(DASH_KEY, prior); else window.localStorage.removeItem(DASH_KEY); } catch (rollbackError) {}
      return { ok:false, reason:'dashboard_storage_write_failed', error:String(error && error.message || error) };
    }
  }
'''


HOME_STATE_HELPERS_SOURCE = r'''  var dashState = readDashState();
  if (!dashState || typeof dashState !== 'object' || Array.isArray(dashState)) dashState = {};
  if (!dashState.sizes || typeof dashState.sizes !== 'object' || Array.isArray(dashState.sizes)) dashState.sizes = {};
  if (!Array.isArray(dashState.order)) dashState.order = [];
  var dashResize = null;
  var dashMove = null;
  var dashKeyboardMove = null;
  var dashMutationTimer = 0;
  var dashLastSerialized = null;
  var dashCommandSequence = 0;
  var dashCommandLog = [];
  var dashResultLog = [];
  var dashReceiptLog = [];
  var DASH_HOST_IDS = ['dashGridMain','dashGridMetrics','dashGridMonitoring'];

  function dashHosts() {
    return DASH_HOST_IDS.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  }
  function dashHostFor(card) {
    var host = card && card.parentElement;
    return host && DASH_HOST_IDS.indexOf(host.id) >= 0 ? host : null;
  }
  function dashCards(host) {
    if (!host || DASH_HOST_IDS.indexOf(host.id) < 0) return [];
    return Array.prototype.slice.call(host.children).filter(function (card) {
      return card.classList && card.classList.contains('pm6-dash-card') && !card.classList.contains('pm7-dash-resize-placeholder') && !card.classList.contains('pm7-dash-move-placeholder');
    });
  }
  function allDashCards() {
    return dashHosts().reduce(function (cards, host) { return cards.concat(dashCards(host)); }, []);
  }
  function cardKey(card) {
    var host = dashHostFor(card);
    return card.getAttribute('data-widget-id') || card.getAttribute('data-widget-kind') || ('card-' + (host ? dashCards(host).indexOf(card) : 0));
  }
'''


HOME_PERSIST_SOURCE = r'''  function dashOrdersEqual(left, right) {
    return left.length === right.length && left.every(function (value, index) { return value === right[index]; });
  }
  function dashHostOrder(host) { return dashCards(host).map(cardKey); }
  function allDashOrder() { return allDashCards().map(cardKey); }
  function restoreDashHostOrder(host, order) {
    var cards = dashCards(host), byKey = {};
    cards.forEach(function (card) { byKey[cardKey(card)] = card; });
    order.forEach(function (key) { if (byKey[key]) host.appendChild(byKey[key]); });
    cards.forEach(function (card) { if (card.parentElement === host && order.indexOf(cardKey(card)) < 0) host.appendChild(card); });
  }
  function serializedDashState() {
    var nextSizes = {};
    allDashCards().forEach(function (card) { nextSizes[cardKey(card)] = cardSize(card); });
    return { sizes:nextSizes, order:allDashOrder() };
  }
  function persistDashIfChanged() {
    if (dashResize || dashMove || dashKeyboardMove) return { ok:false, changed:false, reason:'preview_active' };
    var next = serializedDashState(), serialized = JSON.stringify(next);
    if (serialized === dashLastSerialized) return { ok:true, changed:false };
    var written = writeDashState(next);
    if (!written.ok) return { ok:false, changed:false, reason:written.reason, error:written.error };
    dashState = next; dashLastSerialized = serialized;
    if (DASH_LOAD.source_key === LEGACY_DASH_KEY) {
      try { window.localStorage.removeItem(LEGACY_DASH_KEY); } catch (error) {}
    }
    DASH_LOAD.source_key = DASH_KEY; DASH_LOAD.copy_forward = false;
    return { ok:true, changed:true };
  }
  function persistDash() { return persistDashIfChanged(); }
  function restoreDash() {
    var suppliedSizes = dashState.sizes && typeof dashState.sizes === 'object' && !Array.isArray(dashState.sizes) ? dashState.sizes : {};
    var suppliedOrder = Array.isArray(dashState.order) ? dashState.order : [];
    var knownCards = allDashCards(), knownKeys = knownCards.map(cardKey), savedOrder = [], seen = {};
    suppliedOrder.forEach(function (key) { if (knownKeys.indexOf(key) >= 0 && !seen[key]) { seen[key] = true; savedOrder.push(key); } });
    knownKeys.forEach(function (key) { if (!seen[key]) { seen[key] = true; savedOrder.push(key); } });
    dashHosts().forEach(function (host) {
      var cards = dashCards(host), keys = cards.map(cardKey), hostSaved = savedOrder.filter(function (key) { return keys.indexOf(key) >= 0; });
      cards.forEach(function (card) {
        var size = suppliedSizes[cardKey(card)];
        if (size && Number.isFinite(Number(size.w)) && Number.isFinite(Number(size.h))) {
          /* Preserve the complete supported semantic width independently of
             the viewport used for restoration.  CSS clamps its painted span
             to the current track count; rewriting a saved four-column choice
             to three merely because the page booted narrow is destructive. */
          card.style.setProperty('--dw', Math.max(1, Math.min(4, Math.round(Number(size.w)))));
          card.style.setProperty('--dh', Math.max(1, Math.min(3, Math.round(Number(size.h)))));
        }
      });
      restoreDashHostOrder(host, hostSaved);
      dashCards(host).forEach(syncDashCard);
    });
    var normalized = serializedDashState(), normalizedBytes = JSON.stringify(normalized);
    var suppliedBytes = JSON.stringify({ sizes:suppliedSizes, order:suppliedOrder });
    var needsCopyForward = DASH_LOAD.copy_forward || (DASH_LOAD.source_key !== null && suppliedBytes !== normalizedBytes);
    dashState = normalized; dashLastSerialized = needsCopyForward ? null : normalizedBytes;
    if (needsCopyForward) persistDashIfChanged();
  }
'''


HOME_DISPATCH_SOURCE = r'''  function cloneDashValue(value) { return JSON.parse(JSON.stringify(value)); }
  function dashLayoutOrigin(node) {
    var left = 0, top = 0, current = node, guard = 0;
    while (current && guard < 100) {
      left += Number(current.offsetLeft) || 0;
      top += Number(current.offsetTop) || 0;
      current = current.offsetParent;
      guard += 1;
    }
    return { left:left, top:top, valid:guard > 0 && guard < 100 };
  }
  function dashSettledPosition(card) {
    var grid = document.getElementById('pm6DashGrid');
    if (!grid || !card) return { col:1, row:1 };
    /* offset coordinates describe the committed grid layout and deliberately
       exclude an in-flight FLIP transform.  getBoundingClientRect() would
       report the old painted row until that transition finishes. */
    var metrics = dashGridMetrics(grid), gridOrigin = dashLayoutOrigin(grid), cardOrigin = dashLayoutOrigin(card);
    var style = getComputedStyle(grid), padLeft = parseFloat(style.paddingLeft) || 0, padTop = parseFloat(style.paddingTop) || 0;
    var layoutLeft = gridOrigin.valid && cardOrigin.valid ? cardOrigin.left-gridOrigin.left : card.offsetLeft;
    var layoutTop = gridOrigin.valid && cardOrigin.valid ? cardOrigin.top-gridOrigin.top : card.offsetTop;
    return {
      col:Math.max(1,Math.min(metrics.cols,Math.round((layoutLeft-padLeft)/Math.max(1,metrics.cellW+metrics.colGap))+1)),
      row:Math.max(1,Math.round((layoutTop-padTop)/Math.max(1,metrics.cellH+metrics.rowGap))+1)
    };
  }
  function dashCommandArgs(commandId, card, toSize) {
    if (commandId === 'cmd.widget.resize') return {
      page:'dashboard', instance_id:cardKey(card), col_span:toSize.w, row_span:toSize.h
    };
    var position = dashSettledPosition(card);
    return { page:'dashboard', instance_id:cardKey(card), col:position.col, row:position.row };
  }
  function dispatchDashCommand(commandId, card, fromSize, toSize, extra, settle) {
    var sequence = ++dashCommandSequence;
    var correlationId = 'pm7-dashboard-correlation-' + sequence;
    var detail = Object.assign({
      command_id: commandId,
      command_instance_id: 'pm7-dashboard-command-' + sequence,
      origin: 'home_dashboard',
      correlation_id: correlationId,
      idempotency_key: 'pm7-dashboard-idempotency-' + sequence,
      receipt_required: true,
      dispatched_at_utc: new Date().toISOString()
    }, dashCommandArgs(commandId,card,toSize));
    dashCommandLog.push(cloneDashValue(detail));
    var ownerAccepted = true, listenerError = null, priorOnError = window.onerror;
    window.onerror = function (message, source, line, column, error) {
      listenerError = error || message || 'dashboard_owner_listener_error';
      return typeof priorOnError === 'function' ? priorOnError.apply(this,arguments) : false;
    };
    try {
      ownerAccepted = window.dispatchEvent(new CustomEvent('pm:command-dispatch', { detail:cloneDashValue(detail), cancelable:true }));
    } catch (error) { listenerError = error; ownerAccepted = false; }
    finally { window.onerror = priorOnError; }
    if (listenerError) ownerAccepted = false;
    var settlement = ownerAccepted ? (typeof settle === 'function' ? settle() : { ok:true, changed:false }) : { ok:false, changed:false, reason:listenerError ? 'owner_listener_failed' : 'owner_rejected' };
    var accepted = !!(settlement && settlement.ok);
    /* This is a demo-owner projection for the standalone concept, not a
       claim that widget commands use a shared-runtime domain-result schema. */
    var result = {
      result_type:'WidgetLayoutPrototypeOwnerResult',
      result_id:'pm7-dashboard-result-' + sequence,
      command_id:commandId,
      command_instance_id:detail.command_instance_id,
      correlation_id:correlationId,
      outcome:accepted ? 'accepted' : 'failed',
      reason:accepted ? null : settlement && settlement.reason || 'dashboard_settlement_failed',
      persisted:accepted && !!settlement.changed,
      interaction:cloneDashValue(extra || {}),
      recorded_at_utc:new Date().toISOString()
    };
    var receipt = {
      receipt_type:commandId + '.dispatch_receipt',
      receipt_id:'pm7-dashboard-receipt-' + sequence,
      command_id:commandId,
      command_instance_id:detail.command_instance_id,
      correlation_id:correlationId,
      origin:'home_dashboard',
      command_result_ref:result.result_id,
      outcome:accepted ? 'applied' : 'failed',
      persisted:accepted && !!settlement.changed,
      details:{ reason:result.reason, interaction:cloneDashValue(extra || {}) },
      recorded_at_utc:new Date().toISOString()
    };
    dashResultLog.push(cloneDashValue(result)); dashReceiptLog.push(cloneDashValue(receipt));
    try { window.dispatchEvent(new CustomEvent('pm:dispatch-receipt', { detail:cloneDashValue(receipt) })); } catch (error) {}
    return { accepted:accepted, command:detail, result:result, receipt:receipt, settlement:settlement };
  }
'''


HOME_APPLY_SIZE_SOURCE = r'''  function applyDashSize(card, w, h, source) {
    var grid = document.getElementById('pm6DashGrid'), host = dashHostFor(card);
    if (!card || !grid || !host) return false;
    var cols = (getComputedStyle(grid).gridTemplateColumns || '').split(' ').filter(Boolean).length || 2;
    var before = cardSize(card);
    w = Math.max(1, Math.min(cols, Math.round(Number(w) || before.w)));
    h = Math.max(1, Math.min(3, Math.round(Number(h) || before.h)));
    if (before.w === w && before.h === h) return false;
    card.style.setProperty('--dw', w); card.style.setProperty('--dh', h);
    syncDashCard(card);
    var transaction = dispatchDashCommand('cmd.widget.resize', card, before, { w:w, h:h }, { source_action:source || 'size_menu' }, persistDashIfChanged);
    if (!transaction.accepted) {
      card.style.setProperty('--dw', before.w); card.style.setProperty('--dh', before.h); syncDashCard(card);
    }
    settleDashCardAnimation(card);
    return transaction.accepted;
  }
'''


HOME_FLIP_SOURCE = r'''  function captureDashRects(host) {
    var map = new Map();
    dashCards(host).forEach(function (card) { if (card.style.display !== 'none') map.set(card, card.getBoundingClientRect()); });
    return map;
  }
  function cancelDashPeerAnimation(card) {
    if (card && card._pm7DashMoveAnimation) {
      try { card._pm7DashMoveAnimation.cancel(); } catch (error) {}
      card._pm7DashMoveAnimation = null;
    }
  }
  function settleDashCardAnimation(card) {
    if (!card) return;
    card.style.removeProperty('animation');
    if (typeof card.getAnimations !== 'function') return;
    card.getAnimations().forEach(function (animation) {
      try { animation.finish(); }
      catch (error) { try { animation.cancel(); } catch (ignored) {} }
    });
  }
  function animateDashFlip(before) {
    if (!before) return;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    before.forEach(function (oldRect, card) {
      var painted = oldRect; cancelDashPeerAnimation(card);
      if (!card.isConnected || card.style.display === 'none') return;
      var next = card.getBoundingClientRect(), dx = painted.left-next.left, dy = painted.top-next.top;
      if (Math.abs(dx) < .5 && Math.abs(dy) < .5 || reduce || typeof card.animate !== 'function') return;
      var animation = card.animate([{ transform:'translate3d(' + dx + 'px,' + dy + 'px,0)' },{ transform:'translate3d(0,0,0)' }], { duration:180, easing:'cubic-bezier(.2,.8,.2,1)' });
      card._pm7DashMoveAnimation = animation;
      animation.onfinish = animation.oncancel = function () { if (card._pm7DashMoveAnimation === animation) card._pm7DashMoveAnimation = null; };
    });
  }
'''


HOME_RESIZE_SOURCE = r'''  function installDashResize() {
    var oldHud = document.querySelector('.pm7-dash-resize-hud'); if (oldHud) oldHud.remove();
    var hud = document.createElement('div'); hud.className = 'pm7-dash-resize-hud'; document.body.appendChild(hud);
    function positionHud(event, size) {
      hud.innerHTML = '<b>' + size.w + ' x ' + size.h + '</b> · ' + dashDensity(size) + ' content · settles on release';
      hud.style.left = Math.min(window.innerWidth-225,Math.max(8,event.clientX+14)) + 'px';
      hud.style.top = Math.min(window.innerHeight-44,Math.max(8,event.clientY+14)) + 'px';
      hud.classList.add('show');
    }
    function validRelease(d, event) {
      if (!event || event.pointerId !== d.pointerId) return false;
      var gridRect = d.grid.getBoundingClientRect();
      var scrollRect = d.scroller.getBoundingClientRect ? d.scroller.getBoundingClientRect() : gridRect;
      var footer = document.querySelector('.pm7-statusbar'), footerRect = footer ? footer.getBoundingClientRect() : null;
      var left = Math.max(gridRect.left,scrollRect.left), right = Math.min(gridRect.right,scrollRect.right);
      var top = Math.max(gridRect.top,scrollRect.top), bottom = Math.min(gridRect.bottom,scrollRect.bottom,window.innerHeight);
      if (footerRect && footerRect.top > top) bottom = Math.min(bottom,footerRect.top);
      return event.clientX >= left && event.clientX <= right && event.clientY >= top && event.clientY <= bottom;
    }
    function preview(event) {
      var d = dashResize; if (!d || event.pointerId !== d.pointerId) return;
      event.preventDefault();
      var w = Math.round((event.clientX-d.rect.left+d.metrics.colGap/2)/(d.metrics.cellW+d.metrics.colGap));
      var h = Math.round((event.clientY-d.rect.top+d.metrics.rowGap/2)/(d.metrics.cellH+d.metrics.rowGap));
      w = Math.max(1,Math.min(d.metrics.cols,w)); h = Math.max(1,Math.min(3,h));
      if (w !== d.current.w || h !== d.current.h) {
        d.current = { w:w,h:h }; d.changed = w !== d.original.w || h !== d.original.h;
        d.card.style.setProperty('--dw',w); d.card.style.setProperty('--dh',h);
        d.card.style.setProperty('width',(d.metrics.cellW*w+d.metrics.colGap*(w-1))+'px','important');
        d.card.style.setProperty('height',(d.metrics.cellH*h+d.metrics.rowGap*(h-1))+'px','important');
        syncDashCard(d.card);
      }
      positionHud(event,d.current);
      if (window.scrollX !== d.windowX || window.scrollY !== d.windowY) window.scrollTo(d.windowX,d.windowY);
      d.scroller.scrollTop = d.scrollTop; d.scroller.scrollLeft = d.scrollLeft;
    }
    function cleanupFixed(card) {
      ['left','top','width','height','margin','transform','transition','position','z-index'].forEach(function (name) { card.style.removeProperty(name); });
      card.classList.remove('pm6-is-resizing','pm7-dash-resize-lift');
    }
    function finish(event, requestedCommit) {
      var d = dashResize; if (!d) return;
      if (event && event.pointerId != null && event.pointerId !== d.pointerId) return;
      dashResize = null;
      window.removeEventListener('pointermove',preview,true); window.removeEventListener('pointerup',onUp,true); window.removeEventListener('pointercancel',onCancel,true); window.removeEventListener('blur',onBlur,true); document.removeEventListener('keydown',onKey,true); d.grip.removeEventListener('lostpointercapture',onLost);
      var shouldCommit = !!requestedCommit && validRelease(d,event) && d.changed;
      var beforeRects = captureDashRects(d.host);
      if (!shouldCommit) { d.card.style.setProperty('--dw',d.original.w); d.card.style.setProperty('--dh',d.original.h); }
      cleanupFixed(d.card); if (d.placeholder.parentNode) d.placeholder.remove();
      d.grip.classList.remove('resizing'); document.documentElement.classList.remove('pm7-dash-resizing'); hud.classList.remove('show'); syncDashCard(d.card);
      if (shouldCommit) {
        var transaction = dispatchDashCommand('cmd.widget.resize',d.card,d.original,d.current,{source_action:'pointer_resize',preview_reflow:false},persistDashIfChanged);
        if (!transaction.accepted) {
          d.card.style.setProperty('--dw',d.original.w); d.card.style.setProperty('--dh',d.original.h); syncDashCard(d.card);
        }
      }
      settleDashCardAnimation(d.card);
      animateDashFlip(beforeRects);
      try { if (d.grip.hasPointerCapture(d.pointerId)) d.grip.releasePointerCapture(d.pointerId); } catch (error) {}
      if (event && event.preventDefault) event.preventDefault();
      d.grip.focus({preventScroll:true});
    }
    function onUp(event) { finish(event,true); }
    function onCancel(event) { finish(event,false); }
    function onBlur() { if (dashResize) finish({pointerId:dashResize.pointerId,clientX:-9999,clientY:-9999,preventDefault:function(){}},false); }
    function onLost(event) { if (dashResize && event.pointerId === dashResize.pointerId) finish(event,false); }
    function onKey(event) { if (event.key === 'Escape') { event.preventDefault(); if (dashResize) finish({pointerId:dashResize.pointerId,clientX:-9999,clientY:-9999,preventDefault:function(){}},false); } }
    document.addEventListener('pointerdown',function (event) {
      var grip = event.target.closest && event.target.closest('.pm6-dash-resize');
      if (!grip || dashResize || dashMove || dashKeyboardMove || event.button !== 0) return;
      var card = grip.closest('.pm6-dash-card'), host = dashHostFor(card), grid = document.getElementById('pm6DashGrid');
      if (!card || !host || !grid || card.classList.contains('pm7-dash-resize-placeholder')) return;
      event.preventDefault(); event.stopImmediatePropagation();
      var rect = card.getBoundingClientRect(), metrics = dashGridMetrics(grid), original = cardSize(card);
      var scroller = document.getElementById('pm6DashScroll') || document.documentElement;
      var placeholder = makeDashPlaceholder(card,'pm7-dash-resize-placeholder'); host.insertBefore(placeholder,card);
      dashResize = {card:card,grip:grip,host:host,grid:grid,placeholder:placeholder,rect:rect,metrics:metrics,original:original,current:{w:original.w,h:original.h},changed:false,pointerId:event.pointerId,windowX:window.scrollX,windowY:window.scrollY,scroller:scroller,scrollTop:scroller.scrollTop,scrollLeft:scroller.scrollLeft};
      card.classList.add('pm6-is-resizing','pm7-dash-resize-lift');
      card.style.setProperty('left',rect.left+'px','important'); card.style.setProperty('top',rect.top+'px','important'); card.style.setProperty('width',rect.width+'px','important'); card.style.setProperty('height',rect.height+'px','important');
      grip.classList.add('resizing'); document.documentElement.classList.add('pm7-dash-resizing');
      grip.addEventListener('lostpointercapture',onLost);
      try { grip.setPointerCapture(event.pointerId); } catch (error) {}
      positionHud(event,original);
      window.addEventListener('pointermove',preview,{capture:true,passive:false}); window.addEventListener('pointerup',onUp,true); window.addEventListener('pointercancel',onCancel,true); window.addEventListener('blur',onBlur,true); document.addEventListener('keydown',onKey,true);
    },true);
    document.addEventListener('keydown',function (event) {
      var grip = event.target.closest && event.target.closest('.pm6-dash-resize');
      if (!grip || !/Arrow(Left|Right|Up|Down)/.test(event.key)) return;
      var card = grip.closest('.pm6-dash-card'), size = cardSize(card); if (!dashHostFor(card)) return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') size.w -= 1; if (event.key === 'ArrowRight') size.w += 1; if (event.key === 'ArrowUp') size.h -= 1; if (event.key === 'ArrowDown') size.h += 1;
      applyDashSize(card,size.w,size.h,'keyboard_resize');
    });
  }
'''


HOME_MOVE_SOURCE = r'''  function installDashMove() {
    function visibleDashRect(d) {
      var gridRect = d.grid.getBoundingClientRect(), scrollRect = d.scroller.getBoundingClientRect ? d.scroller.getBoundingClientRect() : gridRect;
      var footer = document.querySelector('.pm7-statusbar'), footerRect = footer ? footer.getBoundingClientRect() : null;
      return {left:Math.max(gridRect.left,scrollRect.left),right:Math.min(gridRect.right,scrollRect.right),top:Math.max(gridRect.top,scrollRect.top),bottom:footerRect && footerRect.top > scrollRect.top ? Math.min(scrollRect.bottom,footerRect.top) : scrollRect.bottom};
    }
    function dashPoint(d,x,y) { var rect=d.grid.getBoundingClientRect(); return {x:x-rect.left,y:y-rect.top}; }
    function dashCandidateRect(d) { var gridRect=d.grid.getBoundingClientRect(), rect=d.placeholder.getBoundingClientRect(); return {left:rect.left-gridRect.left,top:rect.top-gridRect.top,right:rect.right-gridRect.left,bottom:rect.bottom-gridRect.top,width:rect.width,height:rect.height}; }
    function dashInsertAt(d,index) { var cards=dashCards(d.host), ref=index<cards.length?cards[index]:null; if(ref)d.host.insertBefore(d.placeholder,ref);else d.host.appendChild(d.placeholder); }
    function measureDashCandidates(d) {
      var cards=dashCards(d.host), seen={}, measured=[];
      for(var index=0;index<=cards.length;index+=1){
        dashInsertAt(d,index); var rect=dashCandidateRect(d), signature=[Math.round(rect.left*10),Math.round(rect.top*10),Math.round(rect.width*10),Math.round(rect.height*10)].join(':');
        if(!seen[signature]){seen[signature]=true;measured.push({index:index,before_id:index<cards.length?cardKey(cards[index]):null,after_id:index?cardKey(cards[index-1]):null,rect:rect,token:'home-slot-'+index+'-'+(index<cards.length?cardKey(cards[index]):'end')});}
      }
      dashInsertAt(d,d.originalIndex); d.candidates=measured;var reachableBottom=measured.reduce(function(bottom,row){return Math.max(bottom,row.rect.bottom);},0);if(reachableBottom)d.grid.style.setProperty('min-height',Math.ceil(reachableBottom+8)+'px');d.intent=measured.filter(function(row){return row.index===d.originalIndex;})[0]||measured[0];
      if(d.intent){d.placeholder.dataset.dropIntent=d.intent.token;d.placeholder.dataset.dropIndex=String(d.intent.index);}
    }
    function candidateDistance(candidate,point){var dx=point.x<candidate.rect.left?candidate.rect.left-point.x:point.x>candidate.rect.right?point.x-candidate.rect.right:0,dy=point.y<candidate.rect.top?candidate.rect.top-point.y:point.y>candidate.rect.bottom?point.y-candidate.rect.bottom:0,cx=candidate.rect.left+candidate.rect.width/2,cy=candidate.rect.top+candidate.rect.height/2;return dx*dx+dy*dy+Math.pow(point.x-cx,2)*.012+Math.pow(point.y-cy,2)*.012;}
    function chooseDashIntent(d,x,y){var point=dashPoint(d,x,y),best=null,bestScore=Infinity;d.candidates.forEach(function(row){var score=candidateDistance(row,point);if(score<bestScore){best=row;bestScore=score;}});if(!best||!d.intent||best.token===d.intent.token)return best||d.intent;var current=candidateDistance(d.intent,point);return bestScore+144<current?best:d.intent;}
    function placeDashIntent(d,intent){if(!intent||(d.intent&&intent.token===d.intent.token))return;var before=captureDashRects(d.host),lockedScrollTop=d.scroller.scrollTop;dashCards(d.host).forEach(cancelDashPeerAnimation);dashInsertAt(d,intent.index);d.scroller.scrollTop=lockedScrollTop;d.intent=intent;d.intentSerial+=1;d.placeholder.dataset.dropIntent=intent.token;d.placeholder.dataset.dropIndex=String(intent.index);d.placeholder.dataset.dropSerial=String(d.intentSerial);animateDashFlip(before);}
    function pointInsideDash(d,x,y){var rect=visibleDashRect(d);return x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom;}
    function paintDashPointer(){var d=dashMove;if(!d)return;d.pointerFrame=0;d.ghost.style.left=(d.x-d.offsetX)+'px';d.ghost.style.top=(d.y-d.offsetY)+'px';d.validDrop=pointInsideDash(d,d.x,d.y);if(d.validDrop)placeDashIntent(d,chooseDashIntent(d,d.x,d.y));}
    function edgeVelocity(d){var rect=visibleDashRect(d),edge=Math.min(78,Math.max(54,(rect.bottom-rect.top)*.18));if(d.x<rect.left||d.x>rect.right)return 0;if(d.y<rect.top+edge&&d.scroller.scrollTop>0)return -Math.ceil(3+Math.max(0,Math.min(1,(rect.top+edge-d.y)/edge))*9);if(d.y>rect.bottom-edge&&d.scroller.scrollTop<d.scroller.scrollHeight-d.scroller.clientHeight)return Math.ceil(3+Math.max(0,Math.min(1,(d.y-(rect.bottom-edge))/edge))*9);return 0;}
    function autoScrollDash(){var d=dashMove;if(!d)return;d.scrollFrame=0;var velocity=edgeVelocity(d);if(!velocity)return;var before=d.scroller.scrollTop;d.scroller.scrollTop+=velocity;if(d.scroller.scrollTop!==before){paintDashPointer();d.scrollFrame=requestAnimationFrame(autoScrollDash);}}
    function moveGhost(event){var d=dashMove;if(!d||event.pointerId!==d.pointerId)return;event.preventDefault();d.x=event.clientX;d.y=event.clientY;if(!d.pointerFrame)d.pointerFrame=requestAnimationFrame(paintDashPointer);if(!d.scrollFrame&&edgeVelocity(d))d.scrollFrame=requestAnimationFrame(autoScrollDash);}
    function removeGhost(ghost){if(ghost&&ghost.parentNode)ghost.remove();}
    function settleDashGhost(d,landing,committed){
      if(!committed||matchMedia('(prefers-reduced-motion: reduce)').matches||typeof d.ghost.animate!=='function'){removeGhost(d.ghost);return;}
      var start=d.ghost.getBoundingClientRect();
      var animation=d.ghost.animate([
        {left:start.left+'px',top:start.top+'px',width:start.width+'px',height:start.height+'px'},
        {left:landing.left+'px',top:landing.top+'px',width:landing.width+'px',height:landing.height+'px'}
      ],{duration:180,easing:'cubic-bezier(.2,.8,.2,1)'});
      d.ghost._pm7DashSettleAnimation=animation;
      animation.onfinish=animation.oncancel=function(){if(d.ghost._pm7DashSettleAnimation===animation)d.ghost._pm7DashSettleAnimation=null;removeGhost(d.ghost);};
    }
    function cleanupDashMove(d){if(d.pointerFrame)cancelAnimationFrame(d.pointerFrame);if(d.scrollFrame)cancelAnimationFrame(d.scrollFrame);window.removeEventListener('pointermove',moveGhost,true);window.removeEventListener('pointerup',onUp,true);window.removeEventListener('pointercancel',onCancel,true);window.removeEventListener('blur',onBlur,true);document.removeEventListener('keydown',onKey,true);d.grip.removeEventListener('lostpointercapture',onLost);try{if(d.grip.hasPointerCapture(d.pointerId))d.grip.releasePointerCapture(d.pointerId);}catch(error){}if(d.originalGridMinHeight)d.grid.style.setProperty('min-height',d.originalGridMinHeight);else d.grid.style.removeProperty('min-height');document.documentElement.classList.remove('pm7-dash-moving');d.grip.setAttribute('aria-grabbed','false');}
    function finish(event,requestedCommit){
      var d=dashMove;if(!d)return;if(event&&event.pointerId!=null&&event.pointerId!==d.pointerId)return;dashMove=null;
      var shouldCommit=!!requestedCommit&&pointInsideDash(d,event.clientX,event.clientY),preview=d.placeholder.parentNode?d.placeholder.getBoundingClientRect():null;
      if(!shouldCommit)dashInsertAt(d,d.originalIndex);
      if(d.placeholder.parentNode)d.placeholder.parentNode.replaceChild(d.card,d.placeholder);
      if(d.originalDisplay)d.card.style.setProperty('display',d.originalDisplay);else d.card.style.removeProperty('display');
      if(!shouldCommit)restoreDashHostOrder(d.host,d.originalKeys);
      var finalKeys=dashHostOrder(d.host),changed=shouldCommit&&!dashOrdersEqual(d.originalKeys,finalKeys),transaction=null;
      if(changed){
        transaction=dispatchDashCommand('cmd.widget.move',d.card,null,null,{source_action:'pointer_move',order:allDashOrder()},persistDashIfChanged);
        if(!transaction.accepted){restoreDashHostOrder(d.host,d.originalKeys);changed=false;}
      }
      dashCards(d.host).forEach(cancelDashPeerAnimation);syncDashCard(d.card);settleDashCardAnimation(d.card);
      var landing=d.card.getBoundingClientRect();
      d.grid._pm7LastHomeReorder={widget_id:cardKey(d.card),committed:changed,intent:d.intent?{token:d.intent.token,index:d.intent.index,before_id:d.intent.before_id,after_id:d.intent.after_id}:null,preview_rect:preview?{left:preview.left,top:preview.top,width:preview.width,height:preview.height}:null,landing_rect:{left:landing.left,top:landing.top,width:landing.width,height:landing.height},host_id:d.host.id,receipt_id:transaction&&transaction.receipt.receipt_id||null};
      cleanupDashMove(d);settleDashGhost(d,landing,changed);d.grip.focus({preventScroll:true});if(event&&event.preventDefault)event.preventDefault();
    }
    function onUp(event){finish(event,true);}function onCancel(event){finish(event,false);}function onBlur(){if(dashMove)finish({pointerId:dashMove.pointerId,clientX:-9999,clientY:-9999,preventDefault:function(){}},false);}function onLost(event){if(dashMove&&event.pointerId===dashMove.pointerId)finish(event,false);}function onKey(event){if(event.key==='Escape'){event.preventDefault();if(dashMove)finish({pointerId:dashMove.pointerId,clientX:-9999,clientY:-9999,preventDefault:function(){}},false);}}
    document.addEventListener('pointerdown',function(event){var grip=event.target.closest&&event.target.closest('.pm6-dash-drag');if(!grip||dashMove||dashResize||dashKeyboardMove||event.button!==0)return;var card=grip.closest('.pm6-dash-card'),host=dashHostFor(card),grid=document.getElementById('pm6DashGrid');if(!card||!host||!grid)return;event.preventDefault();event.stopImmediatePropagation();var rect=card.getBoundingClientRect(),ghost=card.cloneNode(true),placeholder=makeDashPlaceholder(card,'pm7-dash-move-placeholder'),scroller=document.getElementById('pm6DashScroll')||document.documentElement;ghost.removeAttribute('id');ghost.querySelectorAll('[id]').forEach(function(node){node.removeAttribute('id');});ghost.querySelectorAll('button,[href],input,select,textarea,[tabindex]').forEach(function(node){node.setAttribute('tabindex','-1');});ghost.classList.add('pm7-dash-move-ghost');ghost.setAttribute('aria-hidden','true');ghost.inert=true;ghost.style.left=rect.left+'px';ghost.style.top=rect.top+'px';ghost.style.width=rect.width+'px';ghost.style.height=rect.height+'px';document.body.appendChild(ghost);var originalKeys=dashHostOrder(host),originalIndex=originalKeys.indexOf(cardKey(card)),originalDisplay=card.style.getPropertyValue('display'),originalGridMinHeight=grid.style.getPropertyValue('min-height');host.insertBefore(placeholder,card);card.style.setProperty('display','none','important');dashMove={card:card,grip:grip,host:host,grid:grid,scroller:scroller,ghost:ghost,placeholder:placeholder,pointerId:event.pointerId,offsetX:event.clientX-rect.left,offsetY:event.clientY-rect.top,originalKeys:originalKeys,originalIndex:originalIndex,originalDisplay:originalDisplay,originalGridMinHeight:originalGridMinHeight,x:event.clientX,y:event.clientY,validDrop:true,candidates:[],intent:null,intentSerial:0,pointerFrame:0,scrollFrame:0};measureDashCandidates(dashMove);grip.setAttribute('aria-grabbed','true');document.documentElement.classList.add('pm7-dash-moving');grip.addEventListener('lostpointercapture',onLost);try{grip.setPointerCapture(event.pointerId);}catch(error){}window.addEventListener('pointermove',moveGhost,{capture:true,passive:false});window.addEventListener('pointerup',onUp,true);window.addEventListener('pointercancel',onCancel,true);window.addEventListener('blur',onBlur,true);document.addEventListener('keydown',onKey,true);},true);

    function finishKeyboard(handle,card,commit,restoreFocus){var move=handle._pm7DashKeyboardMove;if(!move)return;handle._pm7DashKeyboardMove=null;if(handle._pm7DashKeyboardBlur)handle.removeEventListener('blur',handle._pm7DashKeyboardBlur);if(handle._pm7DashKeyboardDocument)document.removeEventListener('keydown',handle._pm7DashKeyboardDocument,true);if(handle._pm7DashKeyboardTimer)clearTimeout(handle._pm7DashKeyboardTimer);handle._pm7DashKeyboardBlur=null;handle._pm7DashKeyboardDocument=null;handle._pm7DashKeyboardTimer=null;if(!commit)restoreDashHostOrder(move.host,move.originalKeys);handle.setAttribute('aria-grabbed','false');card.classList.remove('is-keyboard-picked');var after=dashHostOrder(move.host),changed=commit&&!dashOrdersEqual(move.originalKeys,after);dashKeyboardMove=null;if(changed){var transaction=dispatchDashCommand('cmd.widget.move',card,null,null,{source_action:'keyboard_move',order:allDashOrder()},persistDashIfChanged);if(!transaction.accepted){restoreDashHostOrder(move.host,move.originalKeys);changed=false;}}settleDashCardAnimation(card);if(restoreFocus)handle.focus({preventScroll:true});}
    function keyboardMove(event,card,handle){var key=event.key;if(!handle._pm7DashKeyboardMove){if(key!=='Enter'&&key!==' ')return;if(dashKeyboardMove)return;event.preventDefault();var host=dashHostFor(card);if(!host)return;handle._pm7DashKeyboardMove={host:host,originalKeys:dashHostOrder(host)};dashKeyboardMove=handle;handle._pm7DashKeyboardDocument=function(sessionEvent){if(!handle._pm7DashKeyboardMove)return;sessionEvent.stopImmediatePropagation();keyboardMove(sessionEvent,card,handle);};handle._pm7DashKeyboardBlur=function(){if(handle._pm7DashKeyboardTimer)clearTimeout(handle._pm7DashKeyboardTimer);handle._pm7DashKeyboardTimer=setTimeout(function(){if(handle._pm7DashKeyboardMove&&document.activeElement!==handle)finishKeyboard(handle,card,false,false);},0);};handle.addEventListener('blur',handle._pm7DashKeyboardBlur);document.addEventListener('keydown',handle._pm7DashKeyboardDocument,true);handle.setAttribute('aria-grabbed','true');card.classList.add('is-keyboard-picked');return;}if(key==='Escape'){event.preventDefault();finishKeyboard(handle,card,false,true);return;}if(key==='Enter'||key===' '){event.preventDefault();finishKeyboard(handle,card,true,true);return;}if(!/Arrow(Left|Right|Up|Down)/.test(key))return;event.preventDefault();var host=handle._pm7DashKeyboardMove.host,origin=card.getBoundingClientRect(),ox=origin.left+origin.width/2,oy=origin.top+origin.height/2,target=null,best=Infinity;dashCards(host).forEach(function(candidate){if(candidate===card)return;var rect=candidate.getBoundingClientRect(),x=rect.left+rect.width/2,y=rect.top+rect.height/2,primary=key==='ArrowLeft'?ox-x:key==='ArrowRight'?x-ox:key==='ArrowUp'?oy-y:y-oy;if(primary<=4)return;var cross=key==='ArrowLeft'||key==='ArrowRight'?Math.abs(y-oy):Math.abs(x-ox),score=primary+cross*1.75;if(score<best){best=score;target=candidate;}});if(target){var before=captureDashRects(host);if(key==='ArrowLeft'||key==='ArrowUp')host.insertBefore(card,target);else host.insertBefore(card,target.nextSibling);animateDashFlip(before);}queueMicrotask(function(){if(handle._pm7DashKeyboardMove)handle.focus({preventScroll:true});});}
    document.addEventListener('keydown',function(event){var grip=event.target.closest&&event.target.closest('.pm6-dash-drag');if(!grip||dashMove||dashResize)return;var card=grip.closest('.pm6-dash-card');if(!card||!dashHostFor(card))return;keyboardMove(event,card,grip);});
  }
'''


HOME_INSTALL_SOURCE = r'''  function installDashboardWidgets() {
    restoreDash();
    installDashSizePopover();
    installDashResize();
    installDashMove();
    var grid = document.getElementById('pm6DashGrid');
    if (!grid) return;
    allDashCards().forEach(syncDashCard);
    window.PM7_DASH_WIDGETS = {
      storage_key:DASH_KEY,
      legacy_storage_key:LEGACY_DASH_KEY,
      get state() { return cloneDashValue(serializedDashState()); },
      get command_log() { return cloneDashValue(dashCommandLog); },
      get result_log() { return cloneDashValue(dashResultLog); },
      get receipt_log() { return cloneDashValue(dashReceiptLog); },
      inject_next_write_failure:function () { DASH_FAULTS.fail_next_write = true; },
      persist:function () { return cloneDashValue(persistDashIfChanged()); }
    };
    dashHosts().forEach(function (host) {
      new MutationObserver(function () {
        clearTimeout(dashMutationTimer);
        dashMutationTimer = setTimeout(function () {
          allDashCards().forEach(syncDashCard);
          if (!dashResize && !dashMove && !dashKeyboardMove) persistDashIfChanged();
        },50);
      }).observe(host,{childList:true,subtree:false});
    });
  }
'''


def apply(doc, notes, need):
    """Apply T38 after T37 and emit fail-closed source/effect receipts."""
    need(TRANSFORM_MARKER not in doc, "T38: transform already applied")
    need("PM7 T37: component-scoped contrast repair" in doc, "T38: T37 marker missing")
    protected_before = capture_protected_sources(doc, need, "T38 input")
    effects_before = capture_effect_surfaces(doc)

    usage_style_anchor = "\n</style>\n<script>\n(function () {\n  'use strict';\n\n  var app = document.getElementById('pm7UsageApp');"
    doc = _replace_once(doc, usage_style_anchor, "\n" + T38_CSS + usage_style_anchor, need, "final component CSS")

    doc = _sub_once(
        doc,
        r"  function sampledBarLabel\(index, count\) \{.*?\n\}\n(?=  function seriesFromValue)",
        MINI_BARS_SOURCE,
        need,
        "shared mini-bar renderer",
        re.S,
    )
    doc = _sub_once(
        doc,
        r"  function settleUsageCardAnimations\(\) \{.*?\n  \}\n(?=  function renderSettledBoard)",
        USAGE_SETTLE_ANIMATIONS_SOURCE,
        need,
        "Usage settled animation cleanup",
        re.S,
    )
    doc = _replace_once(
        doc,
        "    try { window.dispatchEvent(new CustomEvent('pm:command-dispatch', { detail: record })); } catch (error) {}",
        "    var dispatchAccepted = true;\n    try { dispatchAccepted = window.dispatchEvent(new CustomEvent('pm:command-dispatch', { detail: record, cancelable:true })); } catch (error) { dispatchAccepted = false; }\n    receipt.dispatch_accepted = dispatchAccepted;",
        need,
        "Usage owner admission result",
    )
    doc = _sub_once(
        doc,
        r"  function persistOrder\(order\) \{.*?\n  \}\n(?=  function settledGridPosition)",
        USAGE_PERSIST_ORDER_SOURCE,
        need,
        "Usage verified order persistence",
        re.S,
    )
    doc = _sub_once(
        doc,
        r"  function commitOrder\(originalOrder, movedId, source, cardElement\) \{.*?\n  \}\n(?=  function finishKeyboardDrag)",
        USAGE_COMMIT_ORDER_SOURCE,
        need,
        "Usage dispatch reconcile persist order",
        re.S,
    )
    doc = _replace_once(
        doc,
        "    move.title = 'Drag to move, or use Shift plus arrow keys';",
        "    move.title = 'Drag to move, or press Enter then use the arrow keys';",
        need,
        "Home move instructions",
    )
    doc = _sub_once(
        doc,
        r"  function startDrag\(event, cardElement\) \{.*?\n  \}\n\n(?=  function inspectorEvent)",
        USAGE_START_DRAG_SOURCE + "\n",
        need,
        "Usage pointer reorder",
        re.S,
    )

    # Schedule label containment after each rendered/physically-tiered board.
    doc = _replace_once(
        doc,
        "    $$('.pm7u-card', board).forEach(applyPhysicalContentTier);\n  }\n  function schedulePhysicalContentTiers()",
        "    $$('.pm7u-card', board).forEach(applyPhysicalContentTier);\n    scheduleUsageChartLabels(board);\n  }\n  function schedulePhysicalContentTiers()",
        need,
        "chart fit after physical tiers",
    )
    doc = _replace_once(
        doc,
        "    applyPhysicalContentTier(cardElement);\n    return density;",
        "    applyPhysicalContentTier(cardElement);\n    scheduleUsageChartLabels(cardElement);\n    return density;",
        need,
        "chart fit after live resize",
    )
    doc = _replace_once(
        doc,
        "      '<div class=\"pm7u-summary-signal pm7u-tier-standard\">' + miniBars(bars, '', options.signalLabel || 'Window trend') + '</div>' +",
        "      '<div class=\"pm7u-summary-signal pm7u-tier-standard\">' + miniBars(bars, '', options.signalLabel || 'Window trend', options.barFormatter || 'number') + '</div>' +",
        need,
        "summary chart formatter plumbing",
    )

    # Cost attempt values are integer cents; make that unit explicit.
    doc = _replace_once(
        doc,
        "return '<div class=\"pm7u-splitview\"><div class=\"pm7u-chartplot\">' + miniBars(values, '', label || 'Recent trend') +",
        "return '<div class=\"pm7u-splitview\"><div class=\"pm7u-chartplot\">' + miniBars(values, '', label || 'Recent trend', arguments.length > 4 ? arguments[4] : 'number') +",
        need,
        "chart formatter plumbing",
    )
    doc = _replace_once(
        doc,
        "'Attempt value sequence', 'Projection uses explicit attempt charges and labeled plan-allocation estimates.');",
        "'Attempt value sequence', 'Projection uses explicit attempt charges and labeled plan-allocation estimates.', 'money-cents');",
        need,
        "projection attempt-value currency",
    )
    doc = _replace_once(
        doc,
        "'Attempt value sequence', 'Settled charges and labeled allocation estimates remain separate fields.');",
        "'Attempt value sequence', 'Settled charges and labeled allocation estimates remain separate fields.', 'money-cents');",
        need,
        "settled attempt-value currency",
    )
    doc = _replace_once(
        doc,
        "bars:orderedAttemptSeries(records,'charge'),signalLabel:'selected settled charges'",
        "bars:orderedAttemptSeries(records,'charge').map(function (charge) { return Math.round(charge * 100); }),barFormatter:'money-cents',signalLabel:'selected settled charges'",
        need,
        "Burn basis settled-charge currency",
    )

    # Home cards are owned by three tab wrappers whose children participate in
    # the outer display grid through display:contents.  Replace the single
    # controller's exact functional seams; never register an additive second
    # controller over the existing delegated listeners.
    doc = _replace_once(
        doc,
        "  function readDashState() {\n    try {\n      var current = JSON.parse(localStorage.getItem(DASH_KEY) || 'null');\n      if (current) return current;\n      var legacy = JSON.parse(localStorage.getItem(LEGACY_DASH_KEY) || '{}') || {};\n      return legacy;\n    } catch (error) { return {}; }\n  }\n  function writeDashState(value) { try { localStorage.setItem(DASH_KEY, JSON.stringify(value)); } catch (error) {} }\n",
        HOME_STORAGE_SOURCE,
        need,
        "Home dashboard validated storage",
    )
    doc = _sub_once(
        doc,
        r"  var dashState = readDashState\(\);.*?\n  \}\n(?=  function cardSize\(card\))",
        HOME_STATE_HELPERS_SOURCE,
        need,
        "Home state/host helpers",
        re.S,
    )
    doc = _sub_once(
        doc,
        r"  function persistDash\(\) \{.*?\n  \}\n(?=  function dispatchDashCommand)",
        HOME_PERSIST_SOURCE,
        need,
        "Home persistence and wrapper-safe restore",
        re.S,
    )
    doc = _sub_once(
        doc,
        r"  function dispatchDashCommand\(commandId, card, fromSize, toSize, extra\) \{.*?\n  \}\n(?=  function applyDashSize)",
        HOME_DISPATCH_SOURCE,
        need,
        "Home dashboard command result and receipt",
        re.S,
    )
    doc = _sub_once(
        doc,
        r"  function applyDashSize\(card, w, h, source\) \{.*?\n  \}\n(?=\n  function installDashSizePopover)",
        HOME_APPLY_SIZE_SOURCE,
        need,
        "Home changed-only size commit",
        re.S,
    )
    doc = _sub_once(
        doc,
        r"  function captureDashRects\(grid\) \{.*?\n  \}\n(?=\n  function installDashResize)",
        HOME_FLIP_SOURCE,
        need,
        "Home interruptible peer motion",
        re.S,
    )
    doc = _sub_once(
        doc,
        r"  function installDashResize\(\) \{.*?\n  \}\n(?=\n  function installDashMove)",
        HOME_RESIZE_SOURCE,
        need,
        "Home resize transaction",
        re.S,
    )
    doc = _sub_once(
        doc,
        r"  function installDashMove\(\) \{.*?\n  \}\n(?=\n  function installDashboardWidgets)",
        HOME_MOVE_SOURCE,
        need,
        "Home move transaction",
        re.S,
    )
    doc = _sub_once(
        doc,
        r"  function installDashboardWidgets\(\) \{.*?\n  \}\n(?=\n  /\* ----------------------- Global status bar)",
        HOME_INSTALL_SOURCE,
        need,
        "Home wrapper observers",
        re.S,
    )

    protected_receipt = assert_protected_sources_equal(
        protected_before,
        capture_protected_sources(doc, need, "T38 output"),
        need,
        "T38",
    )
    effect_receipt = assert_effect_delta(
        effects_before,
        capture_effect_surfaces(doc),
        {"persistence_targets": {"added": ["localStorage.removeItem:DASH_KEY", "localStorage.removeItem:LEGACY_DASH_KEY"]}},
        need,
        "T38",
    )
    need(doc.count(TRANSFORM_MARKER) == 1, "T38: marker census mismatch")
    need(".pm7u-shell .pm7u-board {\n  grid-auto-flow: row !important;\n}" in T38_CSS, "T38: dense grid can collapse distinct reorder identities")
    need("@container pm7u-stage (max-width: 820px)" in T38_CSS and "min-width: 0 !important;\n    grid-template-columns: repeat(6, minmax(0, 1fr))" in T38_CSS, "T38: narrow reorder placement band is ambiguous or horizontally clipped")
    need("elementFromPoint(sampleX, sampleY)" not in USAGE_START_DRAG_SOURCE and "move(upEvent)" not in USAGE_START_DRAG_SOURCE, "T38: Usage reorder retained live hit retargeting")
    need(USAGE_START_DRAG_SOURCE.index("settleUsageCardAnimations();") < USAGE_START_DRAG_SOURCE.index("var landingRect = cardElement.getBoundingClientRect();"), "T38: Usage landing geometry is measured before entry animation settlement")
    need("data-drop-intent" in doc and "--pm7-placeholder-physical-cols" in doc and "_pm7LastReorder" in doc, "T38: preview identity or physical marker parity missing")
    need("fitUsageBarLabels" in doc and "money-cents" in doc and "is-label-suppressed" in doc and "; formatted " not in MINI_BARS_SOURCE, "T38: chart label containment/unit repair missing")
    need("@container pm7u-card (max-width: 180px)" in T38_CSS and "grid-template-rows: auto auto !important" in T38_CSS, "T38: compact summary facts can collide")
    need("target.parentNode !== dashMove.grid" not in doc and "d.grid.insertBefore(d.card, d.placeholder)" not in doc, "T38: broken outer-grid Home ownership survived")
    need("DASH_HOST_IDS = ['dashGridMain','dashGridMetrics','dashGridMonitoring']" in doc and "replaceChild(d.card,d.placeholder)" in doc and "persistDashIfChanged" in doc, "T38: wrapper-safe Home transaction missing")
    need("_pm7DashKeyboardMove" in doc and "aria-grabbed','true'" in doc and "lostpointercapture" in doc, "T38: Home keyboard/pointer transaction incomplete")
    need("DASH_FAULTS" in doc and "dashboard_storage_write_failed" in doc and "pm7-dashboard-result-" in doc and "pm:dispatch-receipt" in doc, "T38: Home persistence/result/receipt contract incomplete")
    receipt_guard = HOME_DISPATCH_SOURCE.partition("    var receipt = {")[2].partition("\n    };")[0]
    need(receipt_guard, "T38: Home prototype receipt block is missing")
    need(hashlib.sha256(HOME_PERSIST_SOURCE.encode("utf-8")).hexdigest() == "e2d3ea0f0ae10097a47bce65c435c11509b2931dd4615a477bda0c175af19dd1", "T38: Home persistence/restore source changed without an exact guard review")
    need(hashlib.sha256(HOME_DISPATCH_SOURCE.encode("utf-8")).hexdigest() == "2a350e3aeff216901c21f477350b9c31910756eca8bfcb2cd145e4e8021c9d53", "T38: Home dispatch/result/receipt source changed without an exact guard review")
    need("function dashLayoutOrigin(node)" in HOME_DISPATCH_SOURCE and "cardOrigin.left-gridOrigin.left" in HOME_DISPATCH_SOURCE and "cardOrigin.top-gridOrigin.top" in HOME_DISPATCH_SOURCE and "getBoundingClientRect() would" in HOME_DISPATCH_SOURCE, "T38: Home move payload position is no longer transform-independent")
    need("page:'dashboard', instance_id:cardKey(card), col_span:toSize.w, row_span:toSize.h" in HOME_DISPATCH_SOURCE and "page:'dashboard', instance_id:cardKey(card), col:position.col, row:position.row" in HOME_DISPATCH_SOURCE, "T38: Home widget command payload drifted from the existing catalog")
    need("ownerAccepted = window.dispatchEvent(new CustomEvent('pm:command-dispatch', { detail:cloneDashValue(detail), cancelable:true }));" in HOME_DISPATCH_SOURCE and "listenerError = error || message || 'dashboard_owner_listener_error';" in HOME_DISPATCH_SOURCE and "if (listenerError) ownerAccepted = false;" in HOME_DISPATCH_SOURCE and "reason:listenerError ? 'owner_listener_failed' : 'owner_rejected'" in HOME_DISPATCH_SOURCE, "T38: Home prototype owner admission no longer rejects cancellation or synchronous listener failure")
    need("pm.shared_runtime.command_result.v1" not in HOME_DISPATCH_SOURCE and "WidgetLayoutPrototypeOwnerResult" in HOME_DISPATCH_SOURCE, "T38: Home prototype falsely claims a shared-runtime owner result")
    need(all(token in receipt_guard for token in ("receipt_type:commandId + '.dispatch_receipt'", "command_id:commandId", "correlation_id:correlationId", "origin:'home_dashboard'", "command_result_ref:result.result_id", "outcome:accepted ? 'applied' : 'failed'", "details:{ reason:result.reason, interaction:cloneDashValue(extra || {}) }", "recorded_at_utc")), "T38: Home prototype receipt drifted from the existing Home receipt shape")
    need("Math.min(4, Math.round(Number(size.w)))" in HOME_PERSIST_SOURCE, "T38: Home restore no longer preserves the supported four-column semantic width")

    notes.update({
        "decision": "authorized T38 Usage/Home widget transaction and vertical-chart follow-up",
        "usage_reorder_targeting": "premeasured immutable insertion rectangles plus hysteresis; commit last painted intent",
        "usage_marker_geometry": "measured physical spans at pickup",
        "usage_narrow_reorder_band": "six-track composition at or below 820 physical stage pixels",
        "chart_labels": "consistent above-fill placement, full-series accessibility, collision suppression, explicit cost units",
        "home_dashboard": "wrapper-owned pointer/keyboard move and frozen-grid resize with changed-only persistence",
        "protected_embedded_source_guard": protected_receipt,
        "effect_surface_set_diff": effect_receipt,
    })
    return doc
