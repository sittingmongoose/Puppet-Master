/* transcript.js — feature module.  OWNER: Wave 3 — Transcript + Lens agent (item 8)
 *
 * ITEM 8 — per-message time and model, hover gating, and the overflow row.
 *
 * What was wrong
 * --------------
 * Every one of the 374 messages in data.js carries a real ISO `sentAt`, and all
 * 190 assistant turns carry a full `runtime` block (provider, account, model,
 * modelId, mode, persona, effort, fast, startedAt/completedAt, durationMs,
 * workedSeconds, totalElapsedSeconds, queuedMs, tokens{}, context{}, cost{},
 * terminal).  Nothing on the transcript surface read any of it:
 *   - `msgClock()` invented a clock walking three minutes per message from
 *     11:42, which two of the sixteen takes then printed as their tick label;
 *   - `renderMessageDetails()` printed sixteen constants read off the CURRENT
 *     composer route, so a Qwen turn claimed the Anthropic route;
 *   - nothing at all showed provider, model or duration on the turn itself.
 *
 * Division of labour after the 2026-08-25 orchestrator patches
 * ------------------------------------------------------------
 *   - `msgClock()` now reads `m.sentAt` (orchestrator, app.js). Takes 11 and 14
 *     therefore print the real clock.
 *   - `renderMessageDetails()` now reads `m.runtime` (orchestrator, app.js).
 *     THIS MODULE DELIBERATELY DOES NOT RENDER A DETAILS PANEL. Two panels
 *     reading the same record would be two places to disagree, which is the
 *     defect class we just removed.
 *   - The Edit button is gated on `m.eligibleForEdit` (orchestrator, app.js),
 *     so it is absent -- not disabled -- on every user turn but the newest.
 *   - This module owns the always-visible META ROW, the hover gate, and the
 *     overflow affordance.
 *
 * The meta row reads exactly the same `m.runtime` fields the details panel
 * reads, through the same `D.labels` display map, so the two cannot diverge:
 * chip <-> panel agreement is asserted in `transcript-verify.mjs`.
 *
 * Honesty rules (FIXTURE_SCHEMA §3, and u11's charting rule):
 *   - a genuinely unknown value renders as "not reported", never 0;
 *   - `mode` and `effort` are closed enums (`ask|agent|debug|plan|deep_plan`,
 *     `low|medium|high|max|automatic`); raw enum values never reach the screen,
 *     so everything goes through `D.labels`;
 *   - a turn with no `runtime` says so rather than being backfilled from the
 *     current composer route and passed off as a record.
 *
 * Every node emitted here carries a stable `data-k`: it lives inside the
 * transcript, which survives the 2s work tick, so an unkeyed node would be
 * remounted and replay its entrance animation twice a second.
 */
(function () {
  'use strict';

  var EXT = window.PM56_EXT;
  if (!EXT || !EXT.slot) return;

  var D = window.PM56_DATA || {};
  var NOT_REPORTED = 'not reported';

  /* ---------------------------------------------------------------- labels */
  function labelFor(group, value, fallback) {
    if (value == null || value === '') return fallback || NOT_REPORTED;
    var table = (D.labels && D.labels[group]) || null;
    if (table && Object.prototype.hasOwnProperty.call(table, value)) return table[value];
    /* Unknown key: humanise rather than printing the raw enum. `deep_plan`
       must never reach the screen as `deep_plan`. */
    return String(value).replace(/_/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); });
  }

  /* ------------------------------------------------------------ formatting */
  /* Timestamps are stored UTC and rendered in the VIEWER's locale, per item 8.
     `[]` as the locale argument means "whatever this browser is set to", which
     is also what the orchestrator's msgClock() and renderMessageDetails() use,
     so all three agree by construction. */
  function clockOf(iso) {
    var d = iso ? new Date(iso) : null;
    if (!d || isNaN(d.getTime())) return null;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  function fullStamp(iso) {
    var d = iso ? new Date(iso) : null;
    if (!d || isNaN(d.getTime())) return NOT_REPORTED;
    return d.toLocaleString() + ' local · ' + iso;
  }
  function secondsLabel(s) {
    if (s == null || isNaN(s)) return null;
    s = Math.round(s);
    if (s < 60) return s + 's';
    return Math.floor(s / 60) + 'm ' + String(s % 60).padStart(2, '0') + 's';
  }
  function msLabel(ms) {
    if (ms == null || isNaN(ms)) return NOT_REPORTED;
    return ms < 1000 ? ms + ' ms' : (ms / 1000).toFixed(1) + 's';
  }

  /* ------------------------------------------------------------------ live */
  /* "Working for" vs "Worked for". A RECORDED turn is live only when its own
     record says so -- no completedAt. The first version of this also treated
     "the work animation is running and this is the newest text turn" as live,
     which printed "Working for 25s" on a turn whose runtime said
     terminal:'complete' with a completedAt three hours ago: the demo's work
     animation is global, the turn is not. Reading the turn's own record is the
     whole point of item 8, so the heuristic is gone. */
  function isLiveTurn(ctx, m) {
    var rt = m.runtime;
    return !!rt && !rt.completedAt;
  }

  /* A turn with no runtime record AT ALL that is the newest text turn while the
     work animation is running genuinely is in flight -- the record has not been
     written yet. It gets the live treatment but no duration, because inventing
     one is what this module exists to stop. */
  function isUnrecordedLive(ctx, m) {
    if (m.runtime || m.role !== 'assistant') return false;
    var work = ctx.state && ctx.state.work;
    if (!work || !work.running) return false;
    var t = ctx.activeThread && ctx.activeThread();
    if (!t || !t.messages) return false;
    for (var i = t.messages.length - 1; i >= 0; i--) {
      if (t.messages[i].type === 'text') return t.messages[i].id === m.id;
    }
    return false;
  }

  /* --------------------------------------------------------- the meta row */
  function chip(esc, cls, text, title, attrs) {
    return '<span class="meta-chip ' + cls + '"' +
      (title ? ' title="' + esc(title) + '"' : '') +
      (attrs || '') + '>' + esc(text) + '</span>';
  }

  function renderMetaRow(ctx, m) {
    var esc = ctx.esc, icon = ctx.icon;
    var rt = m.runtime || null;
    var out = [];

    /* --- time: the fixture's sentAt, not a synthesised walk --------------- */
    var iso = m.sentAt || m.time || null;
    var clock = clockOf(iso);
    out.push('<span class="meta-chip meta-time" title="' +
      esc(clock ? 'Sent ' + fullStamp(iso) : 'This message carries no timestamp') + '">' +
      icon('history', 10) + '<b>' + esc(clock || NOT_REPORTED) + '</b></span>');

    if (rt) {
      /* --- provider -------------------------------------------------------- */
      out.push(chip(esc, 'meta-provider', rt.provider || NOT_REPORTED,
        'Provider' + (rt.account ? ' · ' + rt.account : ''),
        ' data-provider="' + esc(rt.provider || '') + '"'));

      /* --- model.  data-model is also the hook the Demo Data harness reads. - */
      out.push('<span class="meta-chip meta-model" data-model="' + esc(rt.modelId || rt.model || '') + '"' +
        ' title="' + esc('Model ' + (rt.model || NOT_REPORTED) +
          ' · ' + labelFor('mode', rt.mode, 'mode ' + NOT_REPORTED) + ' mode' +
          ' · ' + labelFor('effort', rt.effort, 'effort ' + NOT_REPORTED) + ' effort' +
          (rt.persona ? ' · ' + rt.persona : '') +
          (rt.fast ? ' · fast route' : '')) + '">' +
        (rt.fast ? icon('lightning', 10, 'meta-fast') : '') +
        '<b>' + esc(rt.model || NOT_REPORTED) + '</b></span>');

      /* --- working for / worked for ---------------------------------------- */
      var live = isLiveTurn(ctx, m);
      var worked = secondsLabel(rt.workedSeconds != null ? rt.workedSeconds
        : (rt.durationMs != null ? rt.durationMs / 1000 : null));
      var total = secondsLabel(rt.totalElapsedSeconds);
      out.push('<span class="meta-chip meta-worked' + (live ? ' is-live' : '') + '" title="' +
        esc((live ? 'Still working. ' : '') +
          'Worked for ' + (worked || NOT_REPORTED) +
          (total ? ' · total elapsed ' + total : '') +
          (rt.queuedMs != null ? ' · queued ' + msLabel(rt.queuedMs) : '') +
          ' · ' + labelFor('terminal', rt.terminal)) + '">' +
        (live ? '<i class="meta-live-dot"></i>' : '') +
        esc((live ? 'Working for ' : 'Worked for ') + (worked || NOT_REPORTED)) + '</span>');
    } else if (m.role === 'user') {
      out.push(chip(esc, 'meta-quiet', 'You',
        'A user turn carries no runtime record, so no provider, model or timing is claimed for it.'));
    } else {
      /* An assistant turn with no runtime record. Do NOT backfill it from the
         current composer route and present that as a record -- that is the
         exact fake this wave removed from the details panel. Say so instead. */
      if (isUnrecordedLive(ctx, m)) {
        out.push('<span class="meta-chip meta-worked is-live" data-k="mm-live" title="' +
          esc('This turn is still running. No runtime record has been written yet, so no duration is claimed.') +
          '"><i class="meta-live-dot"></i>' + esc('Working now') + '</span>');
      } else {
        out.push(chip(esc, 'meta-quiet', 'Runtime ' + NOT_REPORTED,
          'This turn has no recorded runtime block, so no provider, model or timing is claimed for it.'));
      }
    }

    return '<div class="message-meta" data-k="pm-msg-meta" role="group" aria-label="Turn metadata">' +
      out.join('') + '</div>';
  }

  /* ------------------------------------------------------- overflow row */
  /* The `messageOverflow` slot is an APPEND slot inside `.message-actions`, so
     anything a module registers there lands inline in the action row. Item 13's
     per-message operations need a menu, and menus in this concept are named
     branches of renderMenu() with no extension point -- so this module owns a
     small registry instead, and renders the collected items as an inline
     disclosure below the action row.
     Inline rather than a popover on purpose: `.transcript` is `overflow:auto`,
     so an absolutely-positioned panel on the last message of a thread would be
     clipped by the scroll container. A flex row-break has no such failure mode
     and behaves identically in all sixteen takes.
        window.PM56_MSG_OVERFLOW.register(function (ctx, m) {
          return [{ id:'rewind', label:'Rewind to here', detail:'…',
                    icon:'history', action:'rewind-to-message', value:m.id,
                    danger:false, disabled:false, reason:'' }];
        });
     `disabled:true` + `reason` is the sanctioned honest-gap pattern: a row that
     states why it cannot act, never a toast that lies about having acted. */
  var overflowProviders = [];
  var openOverflowFor = null;

  var REGISTRY = {
    version: 1,
    register: function (fn) { if (typeof fn === 'function') overflowProviders.push(fn); return this; },
    count: function () { return overflowProviders.length; },
    itemsFor: function (ctx, m) {
      var items = [];
      for (var i = 0; i < overflowProviders.length; i++) {
        try {
          var got = overflowProviders[i](ctx, m);
          if (Array.isArray(got)) items = items.concat(got.filter(Boolean));
        } catch (err) {
          console.error('PM56_MSG_OVERFLOW provider threw', err);
        }
      }
      return items;
    },
    isOpen: function (id) { return openOverflowFor === id; },
    close: function () { openOverflowFor = null; }
  };
  window.PM56_MSG_OVERFLOW = REGISTRY;

  function renderOverflow(ctx, m) {
    var esc = ctx.esc, icon = ctx.icon;
    var items = REGISTRY.itemsFor(ctx, m);
    /* Works when empty by being absent when empty: a More button that opens an
       empty panel teaches the reviewer the surface is a mock. */
    if (!items.length) return '';
    var open = openOverflowFor === m.id;
    var btn = '<button class="text-button pm-msg-more" data-k="pm-msg-more"' +
      ' data-action="message-overflow" data-id="' + esc(m.id) + '"' +
      ' aria-expanded="' + (open ? 'true' : 'false') + '"' +
      ' title="' + esc(items.length + ' more operation' + (items.length === 1 ? '' : 's') + ' for this message') + '">' +
      icon('more', 11) + '<span>More</span></button>';
    if (!open) return btn;

    var rows = items.map(function (it) {
      var dis = !!it.disabled;
      return '<button class="pm-overflow-item' + (it.danger ? ' is-danger' : '') + (dis ? ' is-disabled' : '') + '"' +
        ' data-k="pm-of:' + esc(it.id) + '"' +
        (dis ? ' disabled aria-disabled="true"' : ' data-action="' + esc(it.action || '') + '"' +
          ' data-id="' + esc(m.id) + '"' +
          (it.value != null ? ' data-value="' + esc(it.value) + '"' : '')) +
        ' title="' + esc(dis ? (it.reason || 'Not available for this message') : (it.detail || it.label)) + '">' +
        '<span class="pm-overflow-icon">' + icon(it.icon || 'more', 12) + '</span>' +
        '<span class="pm-overflow-copy"><strong>' + esc(it.label) + '</strong>' +
        '<span>' + esc(dis ? (it.reason || 'Not available for this message') : (it.detail || '')) + '</span></span></button>';
    }).join('');

    return btn + '<div class="pm-msg-overflow" data-k="pm-msg-overflow" role="group"' +
      ' aria-label="More operations for this message">' + rows + '</div>';
  }

  /* -------------------------------------------------------------- wiring */
  EXT.slot('messageMeta', function (ctx) {
    return ctx.message ? renderMetaRow(ctx, ctx.message) : '';
  });

  EXT.slot('messageOverflow', function (ctx) {
    return ctx.message ? renderOverflow(ctx, ctx.message) : '';
  });

  EXT.action('message-overflow', function (ctx, btn) {
    var id = btn.dataset.id;
    openOverflowFor = (openOverflowFor === id) ? null : id;
    ctx.renderApp();
    return true;
  });

  /* Exposed so the verification harness can assert against the same source of
     truth the renderer uses instead of re-deriving it. */
  window.PM56_TRANSCRIPT = {
    version: 1,
    clockOf: clockOf,
    labelFor: labelFor,
    metaFor: function (m) {
      var rt = m && m.runtime;
      return {
        time: clockOf(m && (m.sentAt || m.time)),
        provider: rt ? rt.provider : null,
        model: rt ? rt.model : null,
        worked: rt ? secondsLabel(rt.workedSeconds) : null,
        mode: rt ? labelFor('mode', rt.mode) : null,
        effort: rt ? labelFor('effort', rt.effort) : null
      };
    }
  };
})();
