/* =====================================================================
   U11 — shared time & date contract (packet §14)
   ---------------------------------------------------------------------
   - Demo instants are canonical UTC timestamps (ISO 8601 / epoch ms).
   - The system IANA zone is resolved once at the UI boundary; if it
   - cannot be determined we fall back to America/New_York.
   - Display uses the correct event-date abbreviation (EST vs EDT) for
   - the instant being rendered — never hard-coded year-round.
   - 24-hour time everywhere; no AM/PM.
   - ONE shared formatter; widgets never re-implement date math.
   - Slint-portable: pure Intl/string logic, no browser-only APIs.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- zone resolution (once) ---------- */
  var FALLBACK_ZONE = 'America/New_York';
  var ZONE = (function () {
    try {
      var z = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (z && typeof z === 'string' && z.indexOf('/') !== -1) return z;
      return FALLBACK_ZONE;
    } catch (e) { return FALLBACK_ZONE; }
  })();
  var ZONE_IS_FALLBACK = false;
  try {
    var sysz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    ZONE_IS_FALLBACK = !(sysz && sysz.indexOf('/') !== -1);
  } catch (e) { ZONE_IS_FALLBACK = true; }

  function toMs(v) {
    if (v == null) return null;
    if (typeof v === 'number') return v;                 /* epoch ms */
    if (v instanceof Date) return v.getTime();
    var t = Date.parse(v);                                /* ISO 8601 */
    return isNaN(t) ? null : t;
  }

  /* ---------- zone-correct formatters ---------- */
  function fmt(opts) {
    var o = { timeZone: ZONE, hourCycle: 'h23' };
    for (var k in opts) if (Object.prototype.hasOwnProperty.call(opts, k)) o[k] = opts[k];
    try { return new Intl.DateTimeFormat('en-US', o); }
    catch (e) { return new Intl.DateTimeFormat('en-US', { hourCycle: 'h23' }); }
  }

  /* Short zone abbreviation for the instant (EST / EDT / …) */
  function zoneAbbr(ms) {
    try {
      var parts = fmt({ timeZoneName: 'short' }).formatToParts(new Date(ms));
      for (var i = 0; i < parts.length; i++) if (parts[i].type === 'timeZoneName') return parts[i].value;
    } catch (e) {}
    return '';
  }

  /* 24h clock: 16:56 */
  function clock(ms) {
    return fmt({ hour: '2-digit', minute: '2-digit' }).format(new Date(ms));
  }
  /* 24h clock with seconds: 00:00:00 */
  function clockSec(ms) {
    return fmt({ hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(ms));
  }
  /* Weekday short: Fri */
  function weekday(ms) {
    return fmt({ weekday: 'short' }).format(new Date(ms));
  }
  /* Month + day: Aug 16 */
  function monthDay(ms) {
    return fmt({ month: 'short', day: 'numeric' }).format(new Date(ms));
  }

  /* ---------- relative pieces ---------- */
  function spanParts(diffMs) {
    var m = Math.round(diffMs / 60000);
    var d = Math.floor(m / 1440); m -= d * 1440;
    var h = Math.floor(m / 60); m -= h * 60;
    return { d: d, h: h, m: m };
  }
  function spanText(diffMs) {
    var p = spanParts(diffMs);
    if (p.d > 0) return p.d + 'd ' + p.h + 'h';
    if (p.h > 0) return p.h + 'h ' + pad2(p.m) + 'm';
    return p.m + 'm';
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- the shared display formatter ----------
     Returns a human string for a future/past instant relative to `now`.
     kind: 'reset' | 'cooldown' | 'expiry' | 'available' | 'forecast'
     Thresholds (packet §14.2):
       <24h   -> "resets in 2h 14m · 16:56 EDT"
       1–6d   -> "resets in 2d 9h · Fri 00:00 EDT"
       7d+    -> "expires in 12d · Aug 16 00:00 EDT"
       past   -> "reset passed · verifying…"
       unknown-> "Reset time unavailable"
  */
  var VERB = {
    reset: 'resets', cooldown: 'backs up', expiry: 'expires',
    available: 'available', forecast: 'runs out', generic: 'lands'
  };

  function when(target, now, kind) {
    var t = toMs(target);
    var n = toMs(now);
    if (t == null) return unknownText(kind);
    if (n == null) n = Date.now();
    var diff = t - n;
    var verb = VERB[kind] || VERB.generic;
    var abbr = zoneAbbr(t);

    if (diff <= 0) {
      /* past but not refreshed */
      return (kind === 'reset' || kind === 'cooldown') ? 'reset passed · verifying…' : verb + ' passed · verifying…';
    }

    var DAY = 86400000;
    if (diff < DAY) {
      /* under 24 hours: relative h/m + local 24h time */
      return verb + ' in ' + spanText(diff) + ' · ' + clock(t) + (abbr ? ' ' + abbr : '');
    }
    if (diff < 7 * DAY) {
      /* 1–6 days: relative d/h + weekday + local time */
      return verb + ' in ' + spanText(diff) + ' · ' + weekday(t) + ' ' + clock(t) + (abbr ? ' ' + abbr : '');
    }
    /* 7+ days: relative days + local month/day + time */
    var days = Math.ceil(diff / DAY);
    return verb + ' in ' + days + 'd · ' + monthDay(t) + ' ' + clock(t) + (abbr ? ' ' + abbr : '');
  }

  function unknownText(kind) {
    if (kind === 'reset') return 'Reset time unavailable';
    if (kind === 'cooldown') return 'Cooldown time unavailable';
    if (kind === 'expiry') return 'Expiry unavailable';
    return 'Time unavailable';
  }

  /* ---------- detail tooltip / expanded row ----------
     "Fri Aug 7, 2026 00:00:00 EDT · America/New_York" */
  function full(target) {
    var t = toMs(target);
    if (t == null) return 'Time unavailable';
    var d = new Date(t);
    var wd = fmt({ weekday: 'short' }).format(d);
    var md = fmt({ month: 'short', day: 'numeric', year: 'numeric' }).format(d);
    return wd + ' ' + md + ' ' + clockSec(t) + ' ' + zoneAbbr(t) + ' · ' + ZONE;
  }

  /* ---------- plain local renderers (no relative) ---------- */
  function atClock(target) {           /* 16:56 EDT */
    var t = toMs(target); if (t == null) return '—';
    return clock(t) + ' ' + zoneAbbr(t);
  }
  function atDayClock(target) {         /* Fri 00:00 EDT */
    var t = toMs(target); if (t == null) return '—';
    return weekday(t) + ' ' + clock(t) + ' ' + zoneAbbr(t);
  }
  function atMonthDayClock(target) {    /* Aug 16 00:00 EDT */
    var t = toMs(target); if (t == null) return '—';
    return monthDay(t) + ' ' + clock(t) + ' ' + zoneAbbr(t);
  }
  function stamp(target) {              /* ledger / switch timestamps: Aug 4 · 14:07 EDT */
    var t = toMs(target); if (t == null) return '—';
    return monthDay(t) + ' · ' + clock(t) + ' ' + zoneAbbr(t);
  }

  /* ---------- duration-only (no instant) ---------- */
  function dur(ms) {
    if (ms == null) return '—';
    var p = spanParts(ms);
    if (p.d > 0) return p.d + 'd ' + p.h + 'h';
    if (p.h > 0) return p.h + 'h ' + pad2(p.m) + 'm';
    if (p.m > 0) return p.m + 'm';
    return Math.round(ms / 1000) + 's';
  }

  window.U11time = {
    zone: ZONE,
    zoneIsFallback: ZONE_IS_FALLBACK,
    when: when,
    full: full,
    clock: clock,
    clockSec: clockSec,
    zoneAbbr: zoneAbbr,
    atClock: atClock,
    atDayClock: atDayClock,
    atMonthDayClock: atMonthDayClock,
    stamp: stamp,
    dur: dur,
    spanText: spanText,
    _toMs: toMs
  };
})();
