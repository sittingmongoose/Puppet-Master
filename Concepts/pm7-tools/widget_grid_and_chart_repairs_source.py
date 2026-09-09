"""Source-owned T39 Usage grid-slot and all-bar-label repairs.

T39 follows T38 and is limited to the two user-confirmed Usage defects:

* every visible vertical bar owns one exact-unit, collision-free label; and
* pointer and keyboard movement share stable two-dimensional grid-slot
  candidates, including empty multi-span cavities; and
* a clamped keyboard-resize no-op does not remount or settle the board.

The transform protects the embedded Settings and Assistant owners exactly,
adds no command or event identifiers, and versions only the demo Usage
workspace envelope so settled logical slots can restore deterministically.
"""

from __future__ import annotations

import re

from pm7_transform_guards import (
    assert_effect_delta,
    assert_protected_sources_equal,
    capture_effect_surfaces,
    capture_protected_sources,
)


TRANSFORM_MARKER = "PM7 T39: exact chart labels and two-dimensional Usage slots"


def _replace_once(doc, old, new, need, label):
    count = doc.count(old)
    need(count == 1, "T39 %s: expected one anchor, found %d" % (label, count))
    return doc.replace(old, new, 1)


def _sub_once(doc, pattern, replacement, need, label, flags=0):
    matches = list(re.finditer(pattern, doc, flags))
    need(len(matches) == 1, "T39 %s: expected one source band, found %d" % (label, len(matches)))
    match = matches[0]
    return doc[:match.start()] + replacement + doc[match.end():]


T39_CSS = r'''
/* PM7 T39: exact chart labels and two-dimensional Usage slots.
   Protected Settings and Assistant selectors are intentionally absent. */

/* Every painted bar has a value node. JavaScript places the node immediately
   above its fill, then raises it only as far as required to avoid a peer. */
.pm7u-shell .pm7u-mini-bars {
  --pm7u-label-reserve: 30px;
}
.pm7u-shell .pm7u-barcol,
.pm7u-shell .pm7u-barcol.is-labeled,
.pm7u-shell .pm7u-barcol.is-label-suppressed {
  overflow: visible !important;
}
.pm7u-shell .pm7u-barcol .pm7u-barvalue,
.pm7u-shell .pm7u-barcol.is-labeled .pm7u-barvalue,
.pm7u-shell .pm7u-barcol.is-label-suppressed .pm7u-barvalue,
.pm7u-shell .pm7u-barcol.is-label-raised .pm7u-barvalue,
.pm7u-shell .pm7u-barcol.is-labeled.is-short .pm7u-barvalue,
.pm7u-shell .pm7u-barcol.is-labeled:first-child .pm7u-barvalue,
.pm7u-shell .pm7u-barcol.is-labeled:last-child .pm7u-barvalue {
  display: flex !important;
  left: 50% !important;
  right: auto !important;
  top: var(--pm7u-label-top, auto) !important;
  bottom: auto !important;
  width: max-content !important;
  min-width: max-content !important;
  max-width: none !important;
  height: var(--pm7u-label-height, 10px) !important;
  padding: 0 !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: visible !important;
  color: var(--text-secondary) !important;
  font-size: var(--pm7u-label-font-size, 7.1px) !important;
  line-height: 1 !important;
  text-shadow: none !important;
  transform: translateX(calc(-50% + var(--pm7u-label-shift, 0px))) !important;
}
.pm7u-shell .pm7u-mini-bars[data-label-fit^="tight"] {
  --pm7u-label-font-size: 6.4px;
  --pm7u-label-height: 9px;
}
.pm7u-shell .pm7u-mini-bars[data-label-fit^="ultra"] {
  --pm7u-label-font-size: 5.9px;
  --pm7u-label-height: 8px;
}
@container pm7u-card (max-width: 190px) {
  .pm7u-shell .pm7u-mini-bars {
    --pm7u-label-font-size: 6.4px;
    --pm7u-label-height: 9px;
  }
}

/* A grid-slot placeholder is explicit. It cannot be redirected by DOM order
   or painted under the card whose occupied slot caused the displacement. */
.pm7u-shell .pm7u-reorder-placeholder[data-grid-slot="true"] {
  --pm7-placeholder-cols: 3;
  --pm7-placeholder-rows: 3;
  --pm7-placeholder-physical-cols: 3;
  --pm7-placeholder-physical-rows: 3;
  grid-column: var(--pm7u-target-column) !important;
  grid-row: var(--pm7u-target-row) !important;
  z-index: 28 !important;
}
.pm7u-shell .pm7u-card[data-pm7-slot-id] {
  grid-column: var(--pm7u-settled-column) !important;
  grid-row: var(--pm7u-settled-row) !important;
}
'''


MINI_BARS_SOURCE = r'''  function compactBarValue(value, formatter) {
    if (formatter === 'money-cents') return '$' + (Math.max(0, Number(value) || 0) / 100).toFixed(2);
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
    var HEADROOM = 0.90;
    return '<div class="pm7u-mini-signal ' + (tier ? 'pm7u-tier-' + tier : '') + '" data-bars="' + count + '" data-bar-formatter="' + esc(formatKind) + '">' +
      '<div class="pm7u-signal-label"><span title="' + esc(seriesLabel) + '">' + esc(seriesLabel) + '</span><b title="' + esc(seriesSummary) + '">' + esc(seriesSummary) + '</b></div>' +
      '<div class="pm7u-mini-bars" style="--pm7u-bar-count:' + count + '" role="img" aria-label="' + esc(seriesLabel + ', values ' + formatted.join(', ') + '; ' + seriesSummary) + '">' + clean.map(function (value, index) {
        var recent = index >= count - 4;
        var visualHeight = value <= 0 ? 0 : Math.max(8, Math.min(Math.round(100 * HEADROOM), Math.round(value / peak * 100 * HEADROOM)));
        var short = visualHeight < 34;
        return '<span class="pm7u-barcol is-labeled' + (recent ? ' is-recent' : '') + (short ? ' is-short' : '') + '" style="--pm7u-bar-height:' + visualHeight + '%" data-value="' + value + '" data-display-value="' + esc(formatted[index]) + '" data-series-index="' + index + '" title="' + esc(seriesLabel + ': ' + formatted[index]) + '">' +
          '<span class="pm7u-barfill"></span><b class="pm7u-barvalue">' + esc(formatted[index]) + '</b></span>';
      }).join('') + '</div></div>';
  }
  function fitUsageBarLabels(root) {
    var scope = root && root.querySelectorAll ? root : board;
    var allFitted = true;
    $$('.pm7u-mini-bars', scope).forEach(function (plot) {
      var columns = $$('.pm7u-barcol', plot);
      plot.setAttribute('data-label-layout-valid', 'false');
      if (!columns.length) return;
      var plotRect = plot.getBoundingClientRect();
      if (!plotRect.width || !plotRect.height) { allFitted = false; return; }
      var MIN_LABEL_CLEARANCE = 4;
      function intersects(left, right) {
        var horizontalGap = Math.max(left.left, right.left) - Math.min(left.right, right.right);
        return horizontalGap < MIN_LABEL_CLEARANCE &&
          Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top) > .5;
      }
      function reset(mode) {
        plot.setAttribute('data-label-fit', mode);
        columns.forEach(function (column) {
          column.classList.add('is-labeled');
          column.classList.remove('is-label-suppressed','is-label-raised');
          var label = $('.pm7u-barvalue', column);
          if (label) {
            label.style.removeProperty('--pm7u-label-top');
            label.style.removeProperty('--pm7u-label-shift');
          }
        });
      }
      function entries() {
        return columns.map(function (column) {
          var labels = $$('.pm7u-barvalue', column), label = labels[0], fill = $('.pm7u-barfill', column);
          return { column:column, label:label, labelCount:labels.length, fill:fill, columnRect:column.getBoundingClientRect(), fillRect:fill ? fill.getBoundingClientRect() : null };
        });
      }
      function clampHorizontal(entry) {
        var labelRect = entry.label.getBoundingClientRect();
        if (labelRect.width > plotRect.width - 1) return false;
        var desiredLeft = Math.max(plotRect.left + .5, Math.min(plotRect.right - labelRect.width - .5, entry.columnRect.left + entry.columnRect.width / 2 - labelRect.width / 2));
        entry.label.style.setProperty('--pm7u-label-shift', (desiredLeft - labelRect.left) + 'px');
        return true;
      }
      function validPaint(all) {
        if (all.length !== columns.length || all.some(function (entry) {
          if (entry.labelCount !== 1 || !entry.label || !entry.fill || !entry.fillRect) return true;
          var style = getComputedStyle(entry.label);
          return !entry.label.getClientRects().length || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0 ||
            entry.label.textContent.trim() !== String(entry.column.getAttribute('data-display-value') || '').trim();
        })) return false;
        var painted = all.map(function (entry) { return { entry:entry, rect:entry.label.getBoundingClientRect() }; });
        return painted.every(function (item) {
          return item.rect.left >= plotRect.left - .5 && item.rect.right <= plotRect.right + .5 &&
            item.rect.top >= plotRect.top - .5 && item.rect.bottom <= item.entry.fillRect.top - 2;
        }) && painted.every(function (item, index) {
          return !painted.slice(index + 1).some(function (other) { return intersects(item.rect, other.rect); });
        });
      }
      function directAttempt(mode) {
        reset(mode);
        var all = entries(), placed = [];
        if (all.some(function (entry) { return entry.labelCount !== 1 || !entry.label || !entry.fill || !entry.fillRect || !clampHorizontal(entry); })) return false;
        all.sort(function (left, right) {
          var heightDelta = left.fillRect.top - right.fillRect.top;
          return Math.abs(heightDelta) > .25 ? heightDelta : Number(left.column.getAttribute('data-series-index')) - Number(right.column.getAttribute('data-series-index'));
        });
        for (var index = 0; index < all.length; index += 1) {
          var entry = all[index], columnRect = entry.columnRect;
          var labelRect = entry.label.getBoundingClientRect();
          var step = labelRect.height + 2;
          var desiredTop = entry.fillRect.top - plotRect.top - labelRect.height - 3;
          var candidateTop = desiredTop;
          var fitted = false;
          while (candidateTop >= .5) {
            entry.label.style.setProperty('--pm7u-label-top', (candidateTop - (columnRect.top - plotRect.top)) + 'px');
            var painted = entry.label.getBoundingClientRect();
            var contained = painted.left >= plotRect.left - .5 && painted.right <= plotRect.right + .5 && painted.top >= plotRect.top - .5 && painted.bottom <= entry.fillRect.top - 2;
            if (contained && !placed.some(function (prior) { return intersects(prior, painted); })) {
              placed.push(painted); fitted = true; break;
            }
            candidateTop -= step;
          }
          if (!fitted) return false;
        }
        return validPaint(all);
      }
      function laneAttempt(mode) {
        reset(mode);
        var all = entries(), lanes = [];
        if (all.some(function (entry) { return entry.labelCount !== 1 || !entry.label || !entry.fill || !entry.fillRect || !clampHorizontal(entry); })) return false;
        all.sort(function (left, right) { return Number(left.column.getAttribute('data-series-index')) - Number(right.column.getAttribute('data-series-index')); });
        all.forEach(function (entry) {
          var rect = entry.label.getBoundingClientRect(), lane = 0;
          while (lane < lanes.length && rect.left < lanes[lane] + MIN_LABEL_CLEARANCE) lane += 1;
          if (lane === lanes.length) lanes.push(rect.right); else lanes[lane] = rect.right;
          entry.lane = lane;
        });
        var labelHeight = Math.max.apply(Math, all.map(function (entry) { return entry.label.getBoundingClientRect().height; }));
        var step = labelHeight + 1;
        var available = Math.min.apply(Math, all.map(function (entry) { return entry.fillRect.top - plotRect.top - 2; }));
        var used = labelHeight + Math.max(0, lanes.length - 1) * step;
        if (used > available || lanes.length > 3) return false;
        var firstTop = Math.max(.5, available - used);
        all.forEach(function (entry) {
          entry.label.style.setProperty('--pm7u-label-top', (firstTop + entry.lane * step - (entry.columnRect.top - plotRect.top)) + 'px');
        });
        return validPaint(all);
      }
      var fitted = directAttempt('normal') || directAttempt('tight') || directAttempt('ultra') ||
        laneAttempt('normal-lanes') || laneAttempt('tight-lanes') || laneAttempt('ultra-lanes');
      plot.setAttribute('data-label-layout-valid', String(!!fitted));
      if (!fitted) allFitted = false;
    });
    return allFitted;
  }
  var usageChartLabelFrame = 0;
  function scheduleUsageChartLabels(root) {
    if (usageChartLabelFrame) cancelAnimationFrame(usageChartLabelFrame);
    var scope = root || board, retries = 2;
    function settleLabels() {
      usageChartLabelFrame = 0;
      if (!fitUsageBarLabels(scope) && retries > 0) {
        retries -= 1;
        usageChartLabelFrame = requestAnimationFrame(settleLabels);
      }
    }
    usageChartLabelFrame = requestAnimationFrame(settleLabels);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { scheduleUsageChartLabels(board); });
'''


SANITIZE_LAYOUT_SOURCE = r'''    if (candidate.layout && typeof candidate.layout === 'object' && !Array.isArray(candidate.layout)) {
      Object.keys(candidate.layout).forEach(function (key) {
        var parts = splitWidgetKey(key), value = candidate.layout[key];
        if (!parts || !value || typeof value !== 'object' || Array.isArray(value)) return;
        var cols = Number(value.cols), rows = Number(value.rows);
        if (!Number.isInteger(cols) || !Number.isInteger(rows)) return;
        if (USAGE_RUNTIME_INVENTORY) {
          if (USAGE_RUNTIME_INVENTORY[parts[0]][parts[1]].sizes.indexOf(cols + 'x' + rows) < 0) return;
        } else if (cols < 1 || cols > 12 || rows < 1 || rows > 8) return;
        var record = { cols:cols, rows:rows };
        if (typeof value.slot_id === 'string') {
          var slot = /^usage-grid-v1:b(4|6|12):r([1-9][0-9]{0,2}):c([1-9][0-9]?)$/.exec(value.slot_id);
          var basisCols = Number(value.basis_cols), col = Number(value.col), row = Number(value.row);
          var colSpan = Number(value.col_span), rowSpan = Number(value.row_span);
          if (slot && Number(slot[1]) === basisCols && Number(slot[2]) === row && Number(slot[3]) === col &&
              Number.isInteger(colSpan) && Number.isInteger(rowSpan) && basisCols >= 4 && col >= 1 && row >= 1 &&
              colSpan >= 1 && colSpan <= basisCols && rowSpan >= 1 && rowSpan <= 8 && col + colSpan - 1 <= basisCols) {
            record.slot_id = value.slot_id;
            record.basis_cols = basisCols;
            record.col = col;
            record.row = row;
            record.col_span = colSpan;
            record.row_span = rowSpan;
          }
        }
        clean.layout[key] = record;
      });
    }
'''


WORKSPACE_BOOT_SOURCE = r'''  var workspaceKeyPresent = false;
  try { workspaceKeyPresent = localStorage.getItem(WORKSPACE_KEY) != null; } catch (error) {}
  var storedWorkspace = rawStoreGet(WORKSPACE_KEY, null);
  var currentWorkspace = !!(storedWorkspace && storedWorkspace.schema_version === WORKSPACE_SCHEMA_VERSION && storedWorkspace.default_set_version === WORKSPACE_DEFAULT_SET_VERSION && storedWorkspace.prototype_only === true && storedWorkspace.state);
  var priorWorkspaceKeyPresent = false;
  try { priorWorkspaceKeyPresent = localStorage.getItem(PRIOR_WORKSPACE_KEY) != null; } catch (error) {}
  var priorStoredWorkspace = rawStoreGet(PRIOR_WORKSPACE_KEY, null);
  var priorWorkspace = !!(priorStoredWorkspace && priorStoredWorkspace.schema_version === 11 && priorStoredWorkspace.default_set_version === 'pm7-usage-defaults-2026-08-27' && priorStoredWorkspace.prototype_only === true && priorStoredWorkspace.state);
  var priorWorkspaceRejected = priorWorkspaceKeyPresent && !priorWorkspace;
  var legacyCandidate = readLegacyUsageCandidate();
  var shouldImportPriorWorkspace = !workspaceKeyPresent && priorWorkspace;
  var shouldImportLegacy = !workspaceKeyPresent && !shouldImportPriorWorkspace && legacyCandidate.present > 0;
  var sourceEnvelope = currentWorkspace ? storedWorkspace : shouldImportPriorWorkspace ? priorStoredWorkspace : null;
  var sourceState = sourceEnvelope ? sourceEnvelope.state : shouldImportLegacy ? legacyCandidate.state : usageDefaults();
  var workspaceState = sanitizeUsageState(sourceState);
  if (canonicalUsageJson(sourceState) !== canonicalUsageJson(workspaceState)) USAGE_STALE_VALUE_COUNT += 1;
  if (workspaceKeyPresent && !currentWorkspace) USAGE_STALE_VALUE_COUNT += 1;
  if (priorWorkspaceRejected) USAGE_STALE_VALUE_COUNT += 1;
  if (legacyCandidate.parse_failures) USAGE_STALE_VALUE_COUNT += legacyCandidate.parse_failures;
  if (legacyCandidate.present && !shouldImportLegacy) USAGE_STALE_VALUE_COUNT += legacyCandidate.present;
  var USAGE_WORKSPACE = {
    schema_version: WORKSPACE_SCHEMA_VERSION,
    default_set_version: WORKSPACE_DEFAULT_SET_VERSION,
    prototype_only: true,
    committed_revision: sourceEnvelope && Number.isInteger(sourceEnvelope.committed_revision) && sourceEnvelope.committed_revision >= 0 ? sourceEnvelope.committed_revision : 0,
    legacy_import: sourceEnvelope && sourceEnvelope.legacy_import ? sourceEnvelope.legacy_import : { source:'pm7:usage:v10:*', completed:true, imported:false, accepted_values:0, rejected_values:legacyCandidate.parsed, partial_values:0, imported_at:null },
    prior_workspace_import: { source:PRIOR_WORKSPACE_KEY, completed:true, imported:shouldImportPriorWorkspace, imported_at:shouldImportPriorWorkspace ? new Date().toISOString() : null },
    state: workspaceState
  };
'''


STORE_SET_SOURCE = r'''  STORE.set = function (key, value) {
    if (String(key).indexOf(LEGACY_KEY) === 0) {
      var field = String(key).slice(LEGACY_KEY.length);
      if (WORKSPACE_FIELDS.indexOf(field) < 0) return false;
      var candidate = liveUsageStateSnapshot();
      candidate[field] = value;
      var committed = persistUsageWholeState(candidate);
      if (!committed && typeof state !== 'undefined') {
        var prior = USAGE_WORKSPACE.state[field];
        state[field] = prior && typeof prior === 'object' ? JSON.parse(JSON.stringify(prior)) : prior;
      }
      return committed;
    }
    rawStoreSet(key, value);
    return true;
  };
'''


SET_LAYOUT_SOURCE = r'''  function setLayout(item, cols, rows, commandId, source) {
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


KEYBOARD_RESIZE_SOURCE = r'''      resize.addEventListener('keydown', function (event) {
        var before = layoutFor(item), cols = before.cols, rows = before.rows;
        if (event.key === 'ArrowLeft') cols -= event.shiftKey ? 2 : 1;
        else if (event.key === 'ArrowRight') cols += event.shiftKey ? 2 : 1;
        else if (event.key === 'ArrowUp') rows -= 1;
        else if (event.key === 'ArrowDown') rows += 1;
        else return;
        event.preventDefault();
        var applied = setLayout(item, cols, rows, 'cmd.widget.resize', 'keyboard');
        if (before.cols === applied.cols && before.rows === applied.rows) return;
        renderSettledBoard();
        var next = $('.pm7u-card[data-widget="' + item.id + '"] .pm7u-resize', board); if (next) next.focus();
      });
'''


RESET_ROOM_SOURCE = r'''    if (event.target.closest('[data-reset-room]')) {
      var resetCandidate = liveUsageStateSnapshot();
      resetCandidate.layout = {}; resetCandidate.hidden = {}; resetCandidate.order = {};
      if (!persistUsageWholeState(resetCandidate)) { closePops(); toast('Usage layout could not be reset'); return; }
      command('cmd.widget.reset_layout', { page: 'usage' }, { persisted: true });
      usageEvent('view.usage.layout_reset', { page: 'usage' });
      closePops(); render(); toast('Usage layout reset'); return;
    }
'''


USAGE_GRID_SOURCE = r'''  function currentOrder() {
    return $$('.pm7u-card', board).filter(function (element) { return !element.classList.contains('is-reorder-source'); }).map(function (element) { return element.getAttribute('data-widget'); });
  }
  function ordersEqual(left, right) { return left.length === right.length && left.every(function (id, index) { return id === right[index]; }); }
  function restoreOrder(order) {
    order.forEach(function (id) { var element = $('.pm7u-card[data-widget="' + id + '"]', board); if (element) board.appendChild(element); });
  }
  function fullRoomOrder(visibleOrder) {
    var allIds = roomWidgets(state.room).map(function (item) { return item.id; });
    var saved = (state.order[state.room] || []).filter(function (id, index, list) { return allIds.indexOf(id) >= 0 && list.indexOf(id) === index; });
    allIds.forEach(function (id) { if (saved.indexOf(id) < 0) saved.push(id); });
    var visible = {}, queue = visibleOrder.slice();
    visibleOrder.forEach(function (id) { visible[id] = true; });
    return saved.map(function (id) { return visible[id] ? queue.shift() : id; });
  }
  function usageGridMetrics() {
    var style = getComputedStyle(board), rect = board.getBoundingClientRect();
    var tracks = String(style.gridTemplateColumns || '').trim().split(/\s+/).filter(function (track) { return track && track !== 'none'; });
    var trackCount = tracks.length || 12;
    var columnGap = parseFloat(style.columnGap) || 10, rowGap = parseFloat(style.rowGap) || columnGap;
    var paddingLeft = parseFloat(style.paddingLeft) || 0, paddingRight = parseFloat(style.paddingRight) || 0, paddingTop = parseFloat(style.paddingTop) || 0;
    var innerWidth = board.clientWidth - paddingLeft - paddingRight;
    return {
      rect:rect, trackCount:trackCount, columnGap:columnGap, rowGap:rowGap,
      trackWidth:(innerWidth-columnGap*Math.max(0,trackCount-1))/trackCount,
      rowHeight:parseFloat(style.gridAutoRows) || 108,
      contentLeft:board.clientLeft+paddingLeft, contentTop:board.clientTop+paddingTop
    };
  }
  function usageGridRect(position, metrics) {
    var left = metrics.contentLeft + (position.col-1)*(metrics.trackWidth+metrics.columnGap);
    var top = metrics.contentTop + (position.row-1)*(metrics.rowHeight+metrics.rowGap);
    var width = position.col_span*metrics.trackWidth + Math.max(0,position.col_span-1)*metrics.columnGap;
    var height = position.row_span*metrics.rowHeight + Math.max(0,position.row_span-1)*metrics.rowGap;
    return { left:left,top:top,right:left+width,bottom:top+height,width:width,height:height };
  }
  function usagePlacementFromRect(element, metrics) {
    var rect = element.getBoundingClientRect();
    var left = rect.left-metrics.rect.left-metrics.contentLeft, top = rect.top-metrics.rect.top-metrics.contentTop;
    return {
      col:Math.max(1,Math.min(metrics.trackCount,Math.round(left/Math.max(1,metrics.trackWidth+metrics.columnGap))+1)),
      row:Math.max(1,Math.round(top/Math.max(1,metrics.rowHeight+metrics.rowGap))+1),
      col_span:Math.max(1,Math.min(metrics.trackCount,Math.round((rect.width+metrics.columnGap)/Math.max(1,metrics.trackWidth+metrics.columnGap)))),
      row_span:Math.max(1,Math.round((rect.height+metrics.rowGap)/Math.max(1,metrics.rowHeight+metrics.rowGap)))
    };
  }
  function usageSlotId(metrics, position) { return 'usage-grid-v1:b' + metrics.trackCount + ':r' + position.row + ':c' + position.col; }
  function usagePositionsOverlap(left, right) {
    return left.col < right.col+right.col_span && left.col+left.col_span > right.col && left.row < right.row+right.row_span && left.row+left.row_span > right.row;
  }
  function usagePositionFree(position, occupied) { return !occupied.some(function (other) { return usagePositionsOverlap(position, other); }); }
  function setUsageGridStyle(element, position, slotId) {
    if (!element || !position) return;
    var column = position.col + ' / span ' + position.col_span, row = position.row + ' / span ' + position.row_span;
    if (element.classList.contains('pm7u-reorder-placeholder')) {
      element.setAttribute('data-grid-slot','true');
      element.style.setProperty('--pm7u-target-column',column);
      element.style.setProperty('--pm7u-target-row',row);
    } else {
      element.style.setProperty('grid-column',column,'important');
      element.style.setProperty('grid-row',row,'important');
      element.style.setProperty('--pm7u-settled-column',column);
      element.style.setProperty('--pm7u-settled-row',row);
      if (slotId) element.setAttribute('data-pm7-slot-id',slotId); else element.removeAttribute('data-pm7-slot-id');
      element.setAttribute('data-pm7-slot-col',String(position.col));
      element.setAttribute('data-pm7-slot-row',String(position.row));
    }
  }
  function projectUsageSlot(saved, physical, metrics) {
    var sourceMax = Math.max(1,saved.basis_cols-saved.col_span+1), targetMax = Math.max(1,metrics.trackCount-physical.col_span+1);
    var ratio = sourceMax <= 1 ? 0 : (saved.col-1)/(sourceMax-1);
    return { col:Math.max(1,Math.min(targetMax,Math.round(ratio*Math.max(0,targetMax-1))+1)), row:saved.row, col_span:physical.col_span, row_span:physical.row_span };
  }
  function nearestFreeUsagePosition(preferred, occupied, metrics, rowLimit) {
    var best = null, bestScore = Infinity;
    for (var row=1; row<=rowLimit; row+=1) {
      for (var col=1; col<=metrics.trackCount-preferred.col_span+1; col+=1) {
        var candidate = { col:col,row:row,col_span:preferred.col_span,row_span:preferred.row_span };
        if (!usagePositionFree(candidate,occupied)) continue;
        var score = Math.abs(row-preferred.row)*metrics.trackCount*2 + Math.abs(col-preferred.col);
        if (score < bestScore) { bestScore=score; best=candidate; }
      }
    }
    return best;
  }
  function applySettledUsageSlots() {
    var cards = $$('.pm7u-card',board);
    if (!cards.length) return;
    var metrics = usageGridMetrics(), occupied=[];
    cards.forEach(function (card) {
      var key=state.room+':'+card.getAttribute('data-widget'), saved=state.layout[key];
      if (!saved || !saved.slot_id) return;
      var physical=usagePlacementFromRect(card,metrics);
      var projected=projectUsageSlot(saved,physical,metrics);
      if (!usagePositionFree(projected,occupied)) projected=nearestFreeUsagePosition(projected,occupied,metrics,Math.max(48,projected.row+physical.row_span+12));
      if (!projected) return;
      occupied.push(projected);
      setUsageGridStyle(card,projected,usageSlotId(metrics,projected));
    });
  }
  function captureUsageGridStyle(element) {
    return {
      column:element.style.getPropertyValue('grid-column'), columnPriority:element.style.getPropertyPriority('grid-column'),
      row:element.style.getPropertyValue('grid-row'), rowPriority:element.style.getPropertyPriority('grid-row'),
      settledColumn:element.style.getPropertyValue('--pm7u-settled-column'), settledRow:element.style.getPropertyValue('--pm7u-settled-row'),
      slotId:element.getAttribute('data-pm7-slot-id'), slotCol:element.getAttribute('data-pm7-slot-col'), slotRow:element.getAttribute('data-pm7-slot-row')
    };
  }
  function restoreUsageGridStyle(element, saved) {
    ['grid-column','grid-row','--pm7u-settled-column','--pm7u-settled-row'].forEach(function (name) { element.style.removeProperty(name); });
    if (saved.column) element.style.setProperty('grid-column',saved.column,saved.columnPriority);
    if (saved.row) element.style.setProperty('grid-row',saved.row,saved.rowPriority);
    if (saved.settledColumn) element.style.setProperty('--pm7u-settled-column',saved.settledColumn);
    if (saved.settledRow) element.style.setProperty('--pm7u-settled-row',saved.settledRow);
    [['data-pm7-slot-id',saved.slotId],['data-pm7-slot-col',saved.slotCol],['data-pm7-slot-row',saved.slotRow]].forEach(function (entry) { if (entry[1] == null) element.removeAttribute(entry[0]); else element.setAttribute(entry[0],entry[1]); });
  }
  function cancelUsagePeerAnimation(element) {
    if (element && element._pm7ReorderAnimation) { try { element._pm7ReorderAnimation.cancel(); } catch (error) {} element._pm7ReorderAnimation=null; }
    if (element) element.style.removeProperty('transform');
  }
  function createUsageGridSession(cardElement) {
    var metrics=usageGridMetrics(), cards=$$('.pm7u-card',board), movedId=cardElement.getAttribute('data-widget');
    if ([4,6,12].indexOf(metrics.trackCount)<0) return null;
    var cardsById={}, originalOrder=cards.map(function (card) { var id=card.getAttribute('data-widget'); cardsById[id]=card; return id; });
    var originalStyles={}, originalPlacements={}, maxBottom=1, totalRowSpans=0;
    cards.forEach(function (card) {
      var id=card.getAttribute('data-widget'), position=usagePlacementFromRect(card,metrics);
      originalStyles[id]=captureUsageGridStyle(card); originalPlacements[id]=position;
      maxBottom=Math.max(maxBottom,position.row+position.row_span-1);
      totalRowSpans+=position.row_span;
    });
    var moved=originalPlacements[movedId], maxTargetRow=maxBottom+moved.row_span+2, packingRowLimit=maxBottom+totalRowSpans+moved.row_span+4, originalIndex={};
    originalOrder.forEach(function (id,index) { originalIndex[id]=index; });
    function nearest(preferred,occupied) { return nearestFreeUsagePosition(preferred,occupied,metrics,packingRowLimit); }
    function simulate(target) {
      var placements={}, occupied=[];
      placements[movedId]=target; occupied.push(target);
      for (var orderIndex=0; orderIndex<originalOrder.length; orderIndex+=1) {
        var id=originalOrder[orderIndex];
        if (id===movedId) continue;
        var preferred=originalPlacements[id], position=usagePositionFree(preferred,occupied) ? Object.assign({},preferred) : nearest(preferred,occupied);
        if (!position) return null;
        placements[id]=position; occupied.push(position);
      }
      if (Object.keys(placements).length!==originalOrder.length) return null;
      var resultingOrder=originalOrder.slice().sort(function (left,right) {
        var a=placements[left], b=placements[right];
        return a.row-b.row || a.col-b.col || originalIndex[left]-originalIndex[right];
      });
      var movedIndex=resultingOrder.indexOf(movedId);
      return { placements:placements,resulting_order:resultingOrder,before_id:movedIndex+1<resultingOrder.length?resultingOrder[movedIndex+1]:null,after_id:movedIndex>0?resultingOrder[movedIndex-1]:null };
    }
    var candidates=[];
    for (var row=1; row<=maxTargetRow; row+=1) {
      for (var col=1; col<=metrics.trackCount-moved.col_span+1; col+=1) {
        var target={col:col,row:row,col_span:moved.col_span,row_span:moved.row_span}, simulated=simulate(target), rect=usageGridRect(target,metrics);
        if (!simulated) continue;
        candidates.push({ token:usageSlotId(metrics,target),slot_id:usageSlotId(metrics,target),col:col,row:row,index:simulated.resulting_order.indexOf(movedId),before_id:simulated.before_id,after_id:simulated.after_id,rect:rect,placements:simulated.placements,resulting_order:simulated.resulting_order });
      }
    }
    var originalMovedIndex=originalOrder.indexOf(movedId);
    var originalIntent={
      token:usageSlotId(metrics,moved),slot_id:usageSlotId(metrics,moved),col:moved.col,row:moved.row,index:originalMovedIndex,
      before_id:originalMovedIndex+1<originalOrder.length?originalOrder[originalMovedIndex+1]:null,
      after_id:originalMovedIndex>0?originalOrder[originalMovedIndex-1]:null,
      rect:usageGridRect(moved,metrics),placements:Object.assign({},originalPlacements),resulting_order:originalOrder.slice()
    };
    var originalBoardMinHeight=board.style.getPropertyValue('min-height'), originalBoardMinHeightPriority=board.style.getPropertyPriority('min-height');
    function snapshotRects() { var map={}; cards.forEach(function (card) { if (!card.classList.contains('is-reorder-source')) map[card.getAttribute('data-widget')]=card.getBoundingClientRect(); }); return map; }
    function animate(before) {
      var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
      cards.forEach(function (card) {
        var id=card.getAttribute('data-widget'), first=before[id]; cancelUsagePeerAnimation(card);
        if (!first || card.classList.contains('is-reorder-source')) return;
        var last=card.getBoundingClientRect(), x=first.left-last.left, y=first.top-last.top;
        if (Math.abs(x)<.5 && Math.abs(y)<.5 || reduce || typeof card.animate!=='function') return;
        var animation=card.animate([{transform:'translate3d('+x+'px,'+y+'px,0)'},{transform:'translate3d(0,0,0)'}],{duration:190,easing:'cubic-bezier(.2,.8,.2,1)'});
        card._pm7ReorderAnimation=animation;
        animation.onfinish=animation.oncancel=function(){if(card._pm7ReorderAnimation===animation)card._pm7ReorderAnimation=null;};
      });
    }
    function apply(intent,movingElement,animateChange) {
      var before=animateChange===false?null:snapshotRects(), maxPlacedBottom=1;
      Object.keys(intent.placements).forEach(function (id) {
        var element=id===movedId?movingElement:cardsById[id], position=intent.placements[id];
        setUsageGridStyle(element,position,usageSlotId(metrics,position));
        maxPlacedBottom=Math.max(maxPlacedBottom,position.row+position.row_span-1);
      });
      intent.resulting_order.forEach(function (id) { var element=id===movedId?movingElement:cardsById[id]; if(element)board.appendChild(element); });
      var reachableBottom=Math.max(maxPlacedBottom,maxTargetRow+moved.row_span-1);
      var minHeight=metrics.contentTop+reachableBottom*metrics.rowHeight+Math.max(0,reachableBottom-1)*metrics.rowGap+8;
      board.style.setProperty('min-height',Math.ceil(minHeight)+'px');
      if (before) animate(before);
    }
    function restore() {
      cards.forEach(cancelUsagePeerAnimation);
      originalOrder.forEach(function (id) { var card=cardsById[id]; if(card)board.appendChild(card); });
      originalOrder.forEach(function (id) { restoreUsageGridStyle(cardsById[id],originalStyles[id]); });
      if (originalBoardMinHeight) board.style.setProperty('min-height',originalBoardMinHeight,originalBoardMinHeightPriority); else board.style.removeProperty('min-height');
    }
    return { metrics:metrics,cards:cards,cardsById:cardsById,movedId:movedId,originalOrder:originalOrder,originalPlacements:originalPlacements,originalStyles:originalStyles,candidates:candidates,originalIntent:originalIntent,apply:apply,restore:restore };
  }
  function liveUsageStateSnapshot() {
    var candidate={};
    WORKSPACE_FIELDS.forEach(function (field) { candidate[field]=state[field] && typeof state[field]==='object' ? JSON.parse(JSON.stringify(state[field])) : state[field]; });
    return candidate;
  }
  function persistUsageWholeState(candidateState) {
    var clean=sanitizeUsageState(candidateState), nextEnvelope={
      schema_version:WORKSPACE_SCHEMA_VERSION,default_set_version:WORKSPACE_DEFAULT_SET_VERSION,prototype_only:true,
      committed_revision:USAGE_WORKSPACE.committed_revision+1,legacy_import:USAGE_WORKSPACE.legacy_import,
      prior_workspace_import:USAGE_WORKSPACE.prior_workspace_import,state:clean
    };
    if (!persistUsageWorkspaceEnvelope(nextEnvelope)) return false;
    USAGE_WORKSPACE.committed_revision=nextEnvelope.committed_revision;
    USAGE_WORKSPACE.state=clean;
    WORKSPACE_FIELDS.forEach(function (field) { state[field]=clean[field] && typeof clean[field]==='object' ? JSON.parse(JSON.stringify(clean[field])) : clean[field]; });
    return true;
  }
  function clearUsageRoomSlots(candidateState,room) {
    Object.keys(candidateState.layout||{}).forEach(function (key) {
      if (key.indexOf(room+':')!==0) return;
      var record=candidateState.layout[key];
      if (!record||typeof record!=='object') return;
      ['slot_id','basis_cols','col','row','col_span','row_span'].forEach(function (field) { delete record[field]; });
    });
    return candidateState;
  }
  function prepareUsageGridMove(session,intent,fullOrder) {
    var candidateState=liveUsageStateSnapshot(), room=state.room;
    candidateState.order[room]=fullOrder.slice();
    intent.resulting_order.forEach(function (id) {
      var card=session.cardsById[id], position=intent.placements[id], key=room+':'+id;
      if (!card || !position) return;
      var prior=candidateState.layout[key] || {};
      candidateState.layout[key]={
        cols:Number(card.getAttribute('data-cols')) || prior.cols,
        rows:Number(card.getAttribute('data-rows')) || prior.rows,
        slot_id:usageSlotId(session.metrics,position),basis_cols:session.metrics.trackCount,
        col:position.col,row:position.row,col_span:position.col_span,row_span:position.row_span
      };
    });
    var clean=sanitizeUsageState(candidateState), valid=intent.resulting_order.length===session.originalOrder.length;
    intent.resulting_order.forEach(function (id) {
      var expected=candidateState.layout[room+':'+id], observed=clean.layout[room+':'+id];
      if (!expected || !observed || ['cols','rows','slot_id','basis_cols','col','row','col_span','row_span'].some(function (field) { return expected[field]!==observed[field]; })) valid=false;
    });
    return valid?clean:null;
  }
  function commitUsageGridMove(session,intent,source) {
    var original=session.originalPlacements[session.movedId], target=intent.placements[session.movedId];
    var orderChanged=!ordersEqual(session.originalOrder,intent.resulting_order);
    var slotChanged=original.col!==target.col || original.row!==target.row;
    if (!orderChanged && !slotChanged) { session.restore(); return false; }
    var fullOrder=fullRoomOrder(intent.resulting_order);
    var candidateState=prepareUsageGridMove(session,intent,fullOrder);
    if (!candidateState) { session.restore(); return false; }
    var settledPosition={col:target.col-1,row:target.row-1};
    var receipt=command('cmd.widget.move',{page:'usage',instance_id:session.movedId,col:settledPosition.col,row:settledPosition.row},{persisted:false,room:state.room,visual_order:fullOrder,source:source,slot_id:intent.slot_id},{defer_receipt:true});
    if (receipt.dispatch_accepted===false) {
      session.restore(); completeCommandReceipt(receipt,{persisted:false,reason:'owner_rejected',rolled_back:true},'rejected'); return false;
    }
    if (!persistUsageWholeState(candidateState)) {
      session.restore(); completeCommandReceipt(receipt,{persisted:false,reason:'usage_workspace_write_failed',rolled_back:true},'failed'); return false;
    }
    completeCommandReceipt(receipt,{persisted:true,room:state.room,visual_order:fullOrder,source:source,slot_id:intent.slot_id},'accepted');
    usageEvent('view.usage.widget_moved',{widget_id:session.movedId,room:state.room,order:fullOrder,settled_position:settledPosition,source:source});
    return true;
  }
  function directionalUsageIntent(session,current,key) {
    var origin=current.rect, originX=origin.left+origin.width/2, originY=origin.top+origin.height/2, best=null, bestScore=Infinity;
    session.candidates.forEach(function (candidate) {
      var x=candidate.rect.left+candidate.rect.width/2, y=candidate.rect.top+candidate.rect.height/2;
      var primary=key==='ArrowLeft'?originX-x:key==='ArrowRight'?x-originX:key==='ArrowUp'?originY-y:y-originY;
      if (primary<=1) return;
      var cross=key==='ArrowLeft'||key==='ArrowRight'?Math.abs(y-originY):Math.abs(x-originX);
      var score=primary+cross*2;
      if(score<bestScore){bestScore=score;best=candidate;}
    });
    return best || current;
  }
  function finishKeyboardDrag(handle,cardElement,shouldCommit,restoreFocus) {
    var move=handle._pm7KeyboardMove;if(!move)return false;
    handle._pm7KeyboardMove=null;
    if(handle._pm7KeyboardBlur)handle.removeEventListener('blur',handle._pm7KeyboardBlur);
    if(handle._pm7KeyboardDocumentKeydown)document.removeEventListener('keydown',handle._pm7KeyboardDocumentKeydown,true);
    if(handle._pm7KeyboardBlurTimer)clearTimeout(handle._pm7KeyboardBlurTimer);
    handle._pm7KeyboardBlur=null;handle._pm7KeyboardDocumentKeydown=null;handle._pm7KeyboardBlurTimer=null;
    var changed=false;
    if(shouldCommit)changed=commitUsageGridMove(move.session,move.intent,'keyboard');else move.session.restore();
    board._pm7ActiveReorder=null;
    board._pm7LastReorder={widget_id:move.session.movedId,committed:changed,intent:{token:move.intent.token,slot_id:move.intent.slot_id,col:move.intent.col,row:move.intent.row,before_id:move.intent.before_id,after_id:move.intent.after_id},source:'keyboard'};
    handle.setAttribute('aria-grabbed','false');cardElement.classList.remove('is-keyboard-picked');opOff();schedulePhysicalContentTiers();
    if(restoreFocus)handle.focus({preventScroll:true});return changed;
  }
  function startKeyboardDrag(event,cardElement,handle) {
    var key=event.key;
    if(!handle._pm7KeyboardMove){
      if(key!=='Enter'&&key!==' ')return;
      event.preventDefault();
      var session=createUsageGridSession(cardElement);
      if(!session)return;
      handle._pm7KeyboardMove={session:session,intent:session.originalIntent};
      handle._pm7KeyboardDocumentKeydown=function(sessionEvent){if(!handle._pm7KeyboardMove)return;sessionEvent.stopImmediatePropagation();startKeyboardDrag(sessionEvent,cardElement,handle);};
      handle._pm7KeyboardBlur=function(){if(handle._pm7KeyboardBlurTimer)clearTimeout(handle._pm7KeyboardBlurTimer);handle._pm7KeyboardBlurTimer=setTimeout(function(){if(handle._pm7KeyboardMove&&document.activeElement!==handle)finishKeyboardDrag(handle,cardElement,false,false);},0);};
      handle.addEventListener('blur',handle._pm7KeyboardBlur);document.addEventListener('keydown',handle._pm7KeyboardDocumentKeydown,true);
      board._pm7ActiveReorder={widget_id:session.movedId,mode:'keyboard',candidates:session.candidates.map(function(candidate){return{token:candidate.token,slot_id:candidate.slot_id,col:candidate.col,row:candidate.row,before_id:candidate.before_id,after_id:candidate.after_id,rect:Object.assign({},candidate.rect)};}),intent:session.originalIntent.token};
      opOn();handle.setAttribute('aria-grabbed','true');cardElement.classList.add('is-keyboard-picked');return;
    }
    if(key==='Escape'){event.preventDefault();finishKeyboardDrag(handle,cardElement,false,true);return;}
    if(key==='Enter'||key===' '){event.preventDefault();finishKeyboardDrag(handle,cardElement,true,true);return;}
    if(['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'].indexOf(key)<0)return;
    event.preventDefault();var move=handle._pm7KeyboardMove,next=directionalUsageIntent(move.session,move.intent,key);
    if(next.token!==move.intent.token){move.session.apply(next,cardElement,true);move.intent=next;if(board._pm7ActiveReorder)board._pm7ActiveReorder.intent=next.token;}
    queueMicrotask(function(){if(handle._pm7KeyboardMove)handle.focus({preventScroll:true});});
  }
  function startDrag(event,cardElement) {
    if(event.button!==0)return;
    if(board._pm7ActiveReorder||document.body.classList.contains('pm7u-pointer-op'))return;
    event.preventDefault();event.stopPropagation();closePops();
    var handle=event.currentTarget||event.target,pointerId=event.pointerId,session=createUsageGridSession(cardElement);
    if(!session)return;
    var movedId=session.movedId;
    var rect=cardElement.getBoundingClientRect(),offsetX=event.clientX-rect.left,offsetY=event.clientY-rect.top;
    var ghost=cardElement.cloneNode(true);ghost.classList.add('pm7u-ghost');ghost.setAttribute('aria-hidden','true');ghost.inert=true;
    ghost.querySelectorAll('[id]').forEach(function(node){node.removeAttribute('id');});
    ghost.querySelectorAll('button,[href],input,select,textarea,[tabindex]').forEach(function(node){node.setAttribute('tabindex','-1');});
    ghost.style.width=rect.width+'px';ghost.style.height=rect.height+'px';ghost.style.left=rect.left+'px';ghost.style.top=rect.top+'px';
    var placeholder=document.createElement('div');placeholder.className='pm7u-reorder-placeholder';placeholder.setAttribute('aria-hidden','true');
    board.insertBefore(placeholder,cardElement);cardElement.classList.add('is-reorder-source');document.body.appendChild(ghost);opOn();handle.setAttribute('aria-grabbed','true');
    var finished=false,validDrop=true,scrollFrame=0,pointerFrame=0,previewConfirmFrame=0,lastPointerX=event.clientX,lastPointerY=event.clientY;
    var paintedIntent=session.originalIntent,requestedIntent=session.originalIntent,intentSerial=0;
    session.apply(paintedIntent,placeholder,false);
    placeholder.setAttribute('data-drop-intent',paintedIntent.token);placeholder.setAttribute('data-drop-serial','0');
    board._pm7ActiveReorder={widget_id:movedId,mode:'pointer',candidates:session.candidates.map(function(candidate){return{token:candidate.token,slot_id:candidate.slot_id,col:candidate.col,row:candidate.row,before_id:candidate.before_id,after_id:candidate.after_id,rect:Object.assign({},candidate.rect)};}),intent:paintedIntent.token,pending_intent:null};
    function ghostAnchorPoint(clientX,clientY){var boardRect=board.getBoundingClientRect();return{x:clientX-offsetX-boardRect.left,y:clientY-offsetY-boardRect.top};}
    function anchorDistanceTo(candidate,point){var dx=point.x-candidate.rect.left,dy=point.y-candidate.rect.top;return dx*dx+dy*dy;}
    function chooseIntent(clientX,clientY){var point=ghostAnchorPoint(clientX,clientY),best=null,bestScore=Infinity;session.candidates.forEach(function(candidate){var score=anchorDistanceTo(candidate,point);if(score<bestScore){bestScore=score;best=candidate;}});if(!best||best.token===requestedIntent.token)return best||requestedIntent;var currentScore=anchorDistanceTo(requestedIntent,point),hysteresis=10;return Math.sqrt(currentScore)-Math.sqrt(bestScore)>hysteresis?best:requestedIntent;}
    function previewMatches(intent){if(!intent||!placeholder.parentNode)return false;var actual=placeholder.getBoundingClientRect(),boardRect=board.getBoundingClientRect(),expected=intent.rect;return Math.abs(actual.left-(boardRect.left+expected.left))<=1&&Math.abs(actual.top-(boardRect.top+expected.top))<=1&&Math.abs(actual.width-expected.width)<=1&&Math.abs(actual.height-expected.height)<=1;}
    function promotePaintedIntent(intent){paintedIntent=intent;if(board._pm7ActiveReorder){board._pm7ActiveReorder.intent=intent.token;board._pm7ActiveReorder.pending_intent=null;}}
    function confirmPreview(serial,retries){
      previewConfirmFrame=0;if(finished||serial!==intentSerial||!placeholder.parentNode)return;
      if(previewMatches(requestedIntent)){promotePaintedIntent(requestedIntent);return;}
      if(retries>0){previewConfirmFrame=requestAnimationFrame(function(){confirmPreview(serial,retries-1);});return;}
      var locked=boardScroll.scrollTop;requestedIntent=paintedIntent;intentSerial+=1;session.apply(paintedIntent,placeholder,false);boardScroll.scrollTop=locked;
      placeholder.setAttribute('data-drop-intent',paintedIntent.token);placeholder.setAttribute('data-drop-serial',String(intentSerial));
      if(board._pm7ActiveReorder){board._pm7ActiveReorder.intent=paintedIntent.token;board._pm7ActiveReorder.pending_intent=null;}
    }
    function placeIntent(intent){
      if(!intent)return;
      if(intent.token===requestedIntent.token){if(intent.token!==paintedIntent.token&&!previewConfirmFrame)previewConfirmFrame=requestAnimationFrame(function(){confirmPreview(intentSerial,2);});return;}
      var locked=boardScroll.scrollTop;requestedIntent=intent;intentSerial+=1;var serial=intentSerial;
      session.apply(intent,placeholder,true);boardScroll.scrollTop=locked;
      placeholder.setAttribute('data-drop-intent',intent.token);placeholder.setAttribute('data-drop-serial',String(serial));
      if(board._pm7ActiveReorder)board._pm7ActiveReorder.pending_intent=intent.token;
      if(previewConfirmFrame)cancelAnimationFrame(previewConfirmFrame);
      previewConfirmFrame=requestAnimationFrame(function(){confirmPreview(serial,2);});
    }
    function visibleScrollRect(){var scrollRect=boardScroll.getBoundingClientRect(),footer=document.querySelector('.pm7-statusbar'),footerRect=footer?footer.getBoundingClientRect():null;return{left:scrollRect.left,right:scrollRect.right,top:scrollRect.top,bottom:footerRect&&footerRect.top>scrollRect.top?Math.min(scrollRect.bottom,footerRect.top):scrollRect.bottom};}
    function pointInside(clientX,clientY){var visible=visibleScrollRect(),boardRect=board.getBoundingClientRect();return clientX>=Math.max(visible.left,boardRect.left)&&clientX<=Math.min(visible.right,boardRect.right)&&clientY>=visible.top&&clientY<=visible.bottom;}
    function paintPointer(){pointerFrame=0;if(finished)return;ghost.style.left=(lastPointerX-offsetX)+'px';ghost.style.top=(lastPointerY-offsetY)+'px';validDrop=pointInside(lastPointerX,lastPointerY);if(validDrop)placeIntent(chooseIntent(lastPointerX,lastPointerY));}
    function schedulePointer(){if(!pointerFrame)pointerFrame=requestAnimationFrame(paintPointer);}
    function edgeScrollVelocity(){var visible=visibleScrollRect(),edge=Math.min(78,Math.max(54,(visible.bottom-visible.top)*.18));if(lastPointerX<visible.left||lastPointerX>visible.right)return 0;if(lastPointerY<visible.top+edge&&boardScroll.scrollTop>0)return-Math.ceil(3+Math.max(0,Math.min(1,(visible.top+edge-lastPointerY)/edge))*9);if(lastPointerY>visible.bottom-edge&&boardScroll.scrollTop<boardScroll.scrollHeight-boardScroll.clientHeight)return Math.ceil(3+Math.max(0,Math.min(1,(lastPointerY-(visible.bottom-edge))/edge))*9);return 0;}
    function autoScrollTick(){scrollFrame=0;if(finished)return;var velocity=edgeScrollVelocity();if(!velocity)return;var before=boardScroll.scrollTop;boardScroll.scrollTop+=velocity;if(boardScroll.scrollTop!==before){paintPointer();scrollFrame=requestAnimationFrame(autoScrollTick);}}
    function ensureAutoScroll(){if(!scrollFrame&&edgeScrollVelocity())scrollFrame=requestAnimationFrame(autoScrollTick);}
    function move(moveEvent){if(moveEvent.pointerId!==pointerId)return;moveEvent.preventDefault();lastPointerX=moveEvent.clientX;lastPointerY=moveEvent.clientY;schedulePointer();ensureAutoScroll();}
    function cleanup(){if(pointerFrame)cancelAnimationFrame(pointerFrame);if(scrollFrame)cancelAnimationFrame(scrollFrame);if(previewConfirmFrame)cancelAnimationFrame(previewConfirmFrame);document.removeEventListener('pointermove',move,true);document.removeEventListener('pointerup',commit,true);document.removeEventListener('pointercancel',cancel,true);document.removeEventListener('keydown',keydown,true);window.removeEventListener('blur',blur);handle.removeEventListener('lostpointercapture',lostCapture);try{if(handle.hasPointerCapture(pointerId))handle.releasePointerCapture(pointerId);}catch(error){}if(ghost.parentNode)ghost.remove();opOff();handle.setAttribute('aria-grabbed','false');}
    function finish(shouldCommit,restoreFocus){
      if(finished)return;finished=true;if(previewConfirmFrame)cancelAnimationFrame(previewConfirmFrame);previewConfirmFrame=0;
      if(shouldCommit&&requestedIntent.token!==paintedIntent.token){if(previewMatches(requestedIntent))promotePaintedIntent(requestedIntent);else shouldCommit=false;}
      var intent=paintedIntent;if(placeholder.parentNode)session.apply(intent,placeholder,false);var preview=placeholder.getBoundingClientRect(),changed=false,targetLanding;
      if(!shouldCommit){
        if(placeholder.parentNode)placeholder.remove();cardElement.classList.remove('is-reorder-source');session.restore();targetLanding=cardElement.getBoundingClientRect();
      }else{
        if(placeholder.parentNode)placeholder.parentNode.replaceChild(cardElement,placeholder);cardElement.classList.remove('is-reorder-source');
        intent.resulting_order.forEach(function(id){var element=session.cardsById[id];if(element)board.appendChild(element);});setUsageGridStyle(cardElement,intent.placements[movedId],intent.slot_id);
        session.cards.forEach(cancelUsagePeerAnimation);settleUsageCardAnimations();targetLanding=cardElement.getBoundingClientRect();changed=commitUsageGridMove(session,intent,'pointer');
      }
      board._pm7ActiveReorder=null;cleanup();settleUsageCardAnimations();var finalLanding=cardElement.getBoundingClientRect();
      board._pm7LastReorder={widget_id:movedId,committed:changed,intent:{token:intent.token,slot_id:intent.slot_id,col:intent.col,row:intent.row,before_id:intent.before_id,after_id:intent.after_id},preview_rect:{left:preview.left,top:preview.top,width:preview.width,height:preview.height},target_landing_rect:{left:targetLanding.left,top:targetLanding.top,width:targetLanding.width,height:targetLanding.height},landing_rect:{left:finalLanding.left,top:finalLanding.top,width:finalLanding.width,height:finalLanding.height},source:'pointer'};
      schedulePhysicalContentTiers();if(restoreFocus!==false)handle.focus({preventScroll:true});
    }
    function commit(upEvent){if(upEvent.pointerId!==pointerId)return;upEvent.preventDefault();finish(validDrop&&pointInside(upEvent.clientX,upEvent.clientY),true);}
    function cancel(cancelEvent){if(cancelEvent&&cancelEvent.pointerId!=null&&cancelEvent.pointerId!==pointerId)return;finish(false,true);}
    function keydown(keyEvent){if(keyEvent.key!=='Escape')return;keyEvent.preventDefault();finish(false,true);}
    function blur(){finish(false,false);}
    function lostCapture(captureEvent){if(!finished&&captureEvent.pointerId===pointerId)finish(false,true);}
    handle.addEventListener('lostpointercapture',lostCapture);try{handle.setPointerCapture(pointerId);}catch(error){}
    document.addEventListener('pointermove',move,{capture:true,passive:false});document.addEventListener('pointerup',commit,true);document.addEventListener('pointercancel',cancel,true);document.addEventListener('keydown',keydown,true);window.addEventListener('blur',blur);
  }

'''


def apply(doc, notes, need):
    """Apply T39 after T38 and emit exact source/effect receipts."""
    need(TRANSFORM_MARKER not in doc, "T39: transform already applied")
    need("PM7 T38: stable widget transactions and chart labels" in doc, "T39: T38 marker missing")
    protected_before = capture_protected_sources(doc, need, "T39 input")
    effects_before = capture_effect_surfaces(doc)

    usage_style_anchor = "\n</style>\n<script>\n(function () {\n  'use strict';\n\n  var app = document.getElementById('pm7UsageApp');"
    doc = _replace_once(doc, usage_style_anchor, "\n" + T39_CSS + usage_style_anchor, need, "final Usage CSS")

    doc = _sub_once(
        doc,
        r"  function sampledBarLabel\(index, count\) \{.*?\n  \}\n(?=  function seriesFromValue)",
        MINI_BARS_SOURCE,
        need,
        "all-bar renderer",
        re.S,
    )

    doc = _replace_once(
        doc,
        "  var WORKSPACE_KEY = 'pm7:usage:prototype:workspace:v11';\n  var WORKSPACE_SCHEMA_VERSION = 11;\n  var WORKSPACE_DEFAULT_SET_VERSION = 'pm7-usage-defaults-2026-08-27';",
        "  var PRIOR_WORKSPACE_KEY = 'pm7:usage:prototype:workspace:v11';\n  var WORKSPACE_KEY = 'pm7:usage:prototype:workspace:v12';\n  var WORKSPACE_SCHEMA_VERSION = 12;\n  var WORKSPACE_DEFAULT_SET_VERSION = 'pm7-usage-defaults-2026-08-29';",
        need,
        "demo workspace version",
    )
    doc = _sub_once(
        doc,
        r"    if \(candidate\.layout && typeof candidate\.layout === 'object' && !Array\.isArray\(candidate\.layout\)\) \{.*?\n    \}\n(?=    if \(candidate\.order)",
        SANITIZE_LAYOUT_SOURCE,
        need,
        "settled slot sanitizer",
        re.S,
    )
    doc = _sub_once(
        doc,
        r"  var workspaceKeyPresent = false;.*?\n  \};\n(?=  var USAGE_MIGRATION_RECEIPT)",
        WORKSPACE_BOOT_SOURCE,
        need,
        "v11 to v12 workspace boot",
        re.S,
    )
    doc = _replace_once(
        doc,
        "    default_set_version: WORKSPACE_DEFAULT_SET_VERSION,\n    legacy_keys_detected: legacyCandidate.present,",
        "    default_set_version: WORKSPACE_DEFAULT_SET_VERSION,\n    prior_workspace_key: PRIOR_WORKSPACE_KEY,\n    prior_workspace_detected: priorWorkspaceKeyPresent,\n    prior_workspace_imported: shouldImportPriorWorkspace,\n    prior_workspace_rejected: priorWorkspaceRejected,\n    prior_workspace_removed: false,\n    legacy_keys_detected: legacyCandidate.present,",
        need,
        "prior workspace receipt fields",
    )
    doc = _replace_once(
        doc,
        "  USAGE_MIGRATION_RECEIPT.envelope_persisted = persistUsageWorkspaceEnvelope(USAGE_WORKSPACE);\n  if (legacyCandidate.present && USAGE_MIGRATION_RECEIPT.envelope_persisted) WORKSPACE_FIELDS.forEach(function (field) { try { localStorage.removeItem(LEGACY_KEY + field); } catch (error) {} });",
        "  /* T39 defers the only boot write until runtime inventory validation. */\n  USAGE_MIGRATION_RECEIPT.envelope_persisted = false;",
        need,
        "single validated boot persistence",
    )
    doc = _sub_once(
        doc,
        r"  STORE\.set = function \(key, value\) \{.*?\n  \};\n(?=  var state =)",
        STORE_SET_SOURCE,
        need,
        "atomic workspace field persistence",
        re.S,
    )
    doc = _sub_once(
        doc,
        r"  function setLayout\(item, cols, rows, commandId, source\) \{.*?\n  \}\n(?=  function densityFor)",
        SET_LAYOUT_SOURCE,
        need,
        "atomic resize with room slot invalidation",
        re.S,
    )
    doc = _sub_once(
        doc,
        r"      resize\.addEventListener\('keydown', function \(event\) \{.*?\n      \}\);\n(?=      drag\.addEventListener\('pointerdown')",
        KEYBOARD_RESIZE_SOURCE,
        need,
        "changed-only keyboard resize settlement",
        re.S,
    )
    doc = _sub_once(
        doc,
        r"    if \(event\.target\.closest\('\[data-reset-room\]'\)\) \{.*?\n    \}\n(?=    var size =)",
        RESET_ROOM_SOURCE,
        need,
        "atomic user reset",
        re.S,
    )

    doc = _replace_once(
        doc,
        "    board.innerHTML = widgets.length ? widgets.map(function (item, i) { return cardHTML(item, i); }).join('') : '<div class=\"pm7u-empty\">No panels are enabled for this room.<br>Use the panel chooser to restore one.</div>';\n    $('#pm7uBoardMeta').innerHTML",
        "    board.innerHTML = widgets.length ? widgets.map(function (item, i) { return cardHTML(item, i); }).join('') : '<div class=\"pm7u-empty\">No panels are enabled for this room.<br>Use the panel chooser to restore one.</div>';\n    applySettledUsageSlots();\n    $('#pm7uBoardMeta').innerHTML",
        need,
        "settled slot restore",
    )
    doc = _sub_once(
        doc,
        r"  function currentOrder\(\) \{.*?\n  \}\n\n(?=  function inspectorEvent)",
        USAGE_GRID_SOURCE,
        need,
        "shared pointer keyboard grid-slot controller",
        re.S,
    )
    doc = _replace_once(
        doc,
        "    WORKSPACE_FIELDS.forEach(function (field) { state[field] = finalized[field]; });\n    USAGE_WORKSPACE.state = state;",
        "    WORKSPACE_FIELDS.forEach(function (field) { state[field] = finalized[field] && typeof finalized[field] === 'object' ? JSON.parse(JSON.stringify(finalized[field])) : finalized[field]; });\n    USAGE_WORKSPACE.state = JSON.parse(JSON.stringify(finalized));",
        need,
        "detached validated workspace state",
    )
    doc = _replace_once(
        doc,
        "    USAGE_MIGRATION_RECEIPT.envelope_persisted = persistUsageWorkspaceEnvelope(USAGE_WORKSPACE);\n  }\n  finalizeUsageWorkspace();",
        "    USAGE_MIGRATION_RECEIPT.envelope_persisted = persistUsageWorkspaceEnvelope(USAGE_WORKSPACE);\n    if (USAGE_MIGRATION_RECEIPT.envelope_persisted) {\n      if (priorWorkspaceKeyPresent) { try { localStorage.removeItem(PRIOR_WORKSPACE_KEY); USAGE_MIGRATION_RECEIPT.prior_workspace_removed = localStorage.getItem(PRIOR_WORKSPACE_KEY) == null; } catch (error) {} }\n      if (legacyCandidate.present) WORKSPACE_FIELDS.forEach(function (field) { try { localStorage.removeItem(LEGACY_KEY + field); } catch (error) {} });\n      var remaining = 0; WORKSPACE_FIELDS.forEach(function (field) { try { if (localStorage.getItem(LEGACY_KEY + field) != null) remaining += 1; } catch (error) {} });\n      USAGE_MIGRATION_RECEIPT.legacy_keys_remaining = remaining;\n      USAGE_MIGRATION_RECEIPT.legacy_keys_removed = legacyCandidate.present > 0 && remaining === 0;\n    }\n  }\n  finalizeUsageWorkspace();",
        need,
        "post-validation legacy eviction",
    )
    doc = _replace_once(
        doc,
        "    clearLayout:function () { state.layout={}; state.order={}; state.hidden={}; STORE.set(KEY+'layout',state.layout); STORE.set(KEY+'order',state.order); STORE.set(KEY+'hidden',state.hidden); render(); },",
        "    clearLayout:function () { var candidate=liveUsageStateSnapshot(); candidate.layout={}; candidate.order={}; candidate.hidden={}; if (persistUsageWholeState(candidate)) render(); },",
        need,
        "atomic clear layout",
    )

    protected_receipt = assert_protected_sources_equal(
        protected_before,
        capture_protected_sources(doc, need, "T39 output"),
        need,
        "T39",
    )
    effect_receipt = assert_effect_delta(
        effects_before,
        capture_effect_surfaces(doc),
        {"persistence_targets": {"added": ["localStorage.removeItem:PRIOR_WORKSPACE_KEY"], "removed": ["STORE.set:KEY+'layout'", "STORE.set:KEY+'order'"]}},
        need,
        "T39",
    )

    need(doc.count(TRANSFORM_MARKER) == 1, "T39: marker census mismatch")
    need("sampledBarLabel" not in doc and "classList.add('is-label-suppressed')" not in doc and "display: flex !important" in T39_CSS, "T39: active label sampling or suppression survived")
    need("toFixed(2)" in MINI_BARS_SOURCE and "data-display-value" in MINI_BARS_SOURCE, "T39: exact money-cents display missing")
    need("data-label-layout-valid" in MINI_BARS_SOURCE and "laneAttempt('ultra-lanes')" in MINI_BARS_SOURCE and "retries = 2" in MINI_BARS_SOURCE and "MIN_LABEL_CLEARANCE = 4" in MINI_BARS_SOURCE, "T39: measured all-label fallback, minimum readable clearance, bounded settling retry, or failure signal missing")
    need(MINI_BARS_SOURCE.count("var step = labelHeight + 1;") == 1 and MINI_BARS_SOURCE.count("var step = labelRect.height + 2;") == 1, "T39: deterministic narrow-lane spacing or direct-placement spacing moved")
    need("usage-grid-v1:b" in doc and "applySettledUsageSlots" in doc and "createUsageGridSession" in doc, "T39: stable grid-slot path incomplete")
    need("elementFromPoint" not in USAGE_GRID_SOURCE and "before_id" in USAGE_GRID_SOURCE and "after_id" in USAGE_GRID_SOURCE, "T39: release retarget or correlation loss")
    need("function ghostAnchorPoint(clientX,clientY)" in USAGE_GRID_SOURCE and "function chooseIntent(clientX,clientY){var point=ghostAnchorPoint(clientX,clientY)" in USAGE_GRID_SOURCE, "T39: anchored pointer target algorithm missing")
    need("chooseIntent(upEvent" not in USAGE_GRID_SOURCE and "move(upEvent)" not in USAGE_GRID_SOURCE, "T39: pointer-up retarget path survived")
    need("var intent=paintedIntent;if(placeholder.parentNode)session.apply(intent,placeholder,false)" in USAGE_GRID_SOURCE, "T39: commit is not bound to confirmed painted intent")
    need("persistUsageWorkspaceEnvelope(nextEnvelope)" in USAGE_GRID_SOURCE and USAGE_GRID_SOURCE.count("command('cmd.widget.move'") == 1, "T39: move is not one command plus one envelope write")
    need(doc.count("var PRIOR_WORKSPACE_KEY = 'pm7:usage:prototype:workspace:v11';") == 1 and doc.count("var WORKSPACE_KEY = 'pm7:usage:prototype:workspace:v12';") == 1 and doc.count("var WORKSPACE_SCHEMA_VERSION = 12;") == 1, "T39: v12 workspace literal census mismatch")
    need("var WORKSPACE_KEY = 'pm7:usage:prototype:workspace:v11';" not in doc and "state.layout = {}; state.hidden = {}; state.order = {};" not in doc, "T39: old workspace owner or non-atomic reset survived")
    need("clearUsageRoomSlots" in doc and "prior_workspace_rejected" in doc and "priorWorkspaceKeyPresent" in doc, "T39: resize slot invalidation or stale-v11 eviction incomplete")
    need("var applied = setLayout" in doc and "if (before.cols === applied.cols && before.rows === applied.rows) return;" in doc, "T39: clamped keyboard resize still settles the board")
    authored_t39 = "\n".join([T39_CSS, MINI_BARS_SOURCE, SANITIZE_LAYOUT_SOURCE, WORKSPACE_BOOT_SOURCE, STORE_SET_SOURCE, SET_LAYOUT_SOURCE, KEYBOARD_RESIZE_SOURCE, RESET_ROOM_SOURCE, USAGE_GRID_SOURCE])
    need(all(token not in authored_t39 for token in ["cmd.workspace_layout", "context.compaction", "workspace.layout_changed", "pm:workspace-layout-changed"]), "T39: unauthorized command/event surface")
    need(all(token not in authored_t39 for token in ["PM7_CONTEXT", "Tome Tabs", "Kimi", "PM_Chat_Assistant_5.6_Pro_Standalone"]), "T39: protected Chat or Settings source referenced")
    finalized_persist = doc.find("USAGE_MIGRATION_RECEIPT.envelope_persisted = persistUsageWorkspaceEnvelope(USAGE_WORKSPACE);")
    prior_evict = doc.find("localStorage.removeItem(PRIOR_WORKSPACE_KEY)", finalized_persist + 1)
    need(finalized_persist >= 0 and prior_evict > finalized_persist, "T39: prior v11 eviction is not ordered after successful v12 persistence")

    notes.update({
        "decision": "authorized T39 repair for every-bar labels and stable two-dimensional Usage slots",
        "chart_labels": "one exact displayed-unit label per visible bar; money-cents remain nonlossy, labels sharing a vertical band keep at least four CSS pixels of horizontal clearance, and measured placement cannot suppress a datum",
        "usage_reorder": "shared pointer/keyboard multi-span grid-slot candidates with before/after correlation only",
        "keyboard_resize_noop": "clamped no-change input preserves the live board and emits no settlement",
        "workspace_migration": "demo-only v11 envelope imports once into validated v12 settled-slot layout state",
        "protected_embedded_source_guard": protected_receipt,
        "effect_surface_set_diff": effect_receipt,
    })
    return doc
