/* Formatters and the value-state language (owner: engine; ARCHITECTURE.md section 4.2, DESIGN-SPEC sections 11 and 14).
   Every number on the page goes through PMU.fmt; every missing or qualified value through PMU.vs. Missing is never 0. */
(function () {
  var MIN = 60000, HOUR = 3600000, DAY = 86400000;
  var WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var missing = function (v) { return v === null || v === undefined || (typeof v === 'number' && !isFinite(v)); };

  var fmt = {
    /* microdollar rule (R-COST-01): 6 decimals below $0.01, 4 below $1, otherwise 2 */
    money: function (usd, opts) {
      if (missing(usd)) return '-';
      var a = Math.abs(usd), d = a === 0 ? 2 : a < 0.01 ? 6 : a < 1 ? 4 : 2;
      var s = '$' + a.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return (usd < 0 ? '-' : '') + s + (opts && opts.est ? ' est.' : '');
    },
    tok: function (n) {
      if (missing(n)) return '-';
      if (n >= 1e9) return (n / 1e9).toFixed(n >= 1e10 ? 0 : 1).replace(/\.0$/, '') + 'B';
      if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 1 : 2).replace(/\.?0+$/, '') + 'M';
      if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'k';
      return String(Math.round(n));
    },
    num: function (n) { return missing(n) ? '-' : Number(n).toLocaleString('en-US'); },
    pct: function (v, digits) { return missing(v) ? '-' : (digits ? Number(v).toFixed(digits) : String(Math.round(v))) + '%'; },
    used: function (v) { return missing(v) ? '-' : fmt.pct(v) + ' used'; },
    left: function (v) { return missing(v) ? '-' : fmt.pct(Math.max(0, 100 - v)) + ' left'; },
    clock: function (ms) { var d = new Date(ms); return pad(d.getHours()) + ':' + pad(d.getMinutes()); },
    day: function (ms) { return WEEKDAY[new Date(ms).getDay()]; },
    date: function (ms) { var d = new Date(ms); return MONTH[d.getMonth()] + ' ' + d.getDate(); },
    span: function (ms) {
      ms = Math.max(0, ms);
      var d = Math.floor(ms / DAY), h = Math.floor((ms % DAY) / HOUR), m = Math.floor((ms % HOUR) / MIN);
      return d ? d + 'd ' + h + 'h' : h ? h + 'h ' + m + 'm' : m + 'm';
    },
    /* relative under 24 h, weekday under 7 d, date beyond */
    until: function (ms) {
      var dt = ms - Date.now();
      if (dt < DAY) return 'in ' + fmt.span(dt);
      if (dt < 7 * DAY) return fmt.day(ms) + ' ' + fmt.clock(ms);
      return fmt.date(ms);
    },
    /* reset copy with reset truth (R-PLAN-07): win = WindowView */
    reset: function (win) {
      if (!win || win.truth === 'unknown' || missing(win.resetAt)) return { text: 'Reset unknown', short: 'unknown', truth: 'unknown' };
      if (win.truth === 'pending_recheck' || win.resetAt <= Date.now()) return { text: 'Pending recheck', short: 'recheck', truth: 'pending_recheck' };
      var inferred = win.truth === 'locally_inferred', pre = inferred ? '≈ ' : '';
      var dt = win.resetAt - Date.now();
      var abs = dt < DAY ? fmt.clock(win.resetAt) : dt < 7 * DAY ? fmt.day(win.resetAt) + ' ' + fmt.clock(win.resetAt) : fmt.date(win.resetAt);
      var text = pre + 'Resets ' + abs + (dt < 7 * DAY ? ' · ' + (dt < DAY ? 'in ' : '') + fmt.span(dt) : '');
      return { text: text, short: pre + (dt < DAY ? fmt.span(dt) : abs), truth: win.truth };
    },
    age: function (s) {
      if (missing(s)) return '-';
      if (s < 60) return Math.round(s) + 's ago';
      if (s < 3600) return Math.round(s / 60) + 'm ago';
      if (s < 86400) return Math.round(s / 3600) + 'h ago';
      return Math.round(s / 86400) + 'd ago';
    },
    delta: function (v, opts) {
      if (missing(v) || v === 0) return { text: '0%', dir: 'flat', tone: 'neutral' };
      var up = v > 0, good = (opts && opts.goodWhen) || 'up';
      return { text: (up ? '+' : '') + Number(v).toFixed(1).replace(/\.0$/, '') + '%', dir: up ? 'up' : 'down',
        tone: (up && good === 'up') || (!up && good === 'down') ? 'ok' : 'warn' };
    },
    plural: function (n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }
  };

  var STATES = {
    zero: { glyph: null, word: '0', tone: 'neutral' },
    unknown: { glyph: 'dashedCircle', word: 'Usage unknown', tone: 'neutral' },
    not_exposed: { glyph: 'slashCircle', word: 'Quota not exposed', tone: 'neutral' },
    disabled: { glyph: 'minusCircle', word: 'Disabled', tone: 'neutral' },
    stale: { glyph: 'clockCircle', word: 'cached', tone: 'warn' },
    estimated: { glyph: null, word: 'est.', tone: 'neutral' },
    inferred: { glyph: null, word: 'locally inferred', tone: 'neutral' },
    hidden_subscription: { glyph: 'lock', word: 'Covered by subscription', tone: 'neutral' },
    hidden_byok: { glyph: 'lock', word: 'Hidden · BYOK', tone: 'neutral' },
    streaming_partial: { glyph: 'halfCircle', word: 'Streaming partial', tone: 'neutral' },
    pending: { glyph: 'clockCircle', word: 'Pending receipt', tone: 'warn' },
    adjusted: { glyph: 'pencil', word: 'Adjusted', tone: 'neutral' },
    failed: { glyph: 'xCircle', word: 'Failed', tone: 'error' },
    settled: { glyph: 'check', word: 'Settled', tone: 'neutral' },
    pending_recheck: { glyph: 'refresh', word: 'Pending recheck', tone: 'neutral' }
  };
  var vs = {
    STATES: STATES,
    html: function (state, word) {
      var s = STATES[state] || STATES.unknown;
      return '<span class="pmu-vs" data-vs="' + state + '" data-tone="' + s.tone + '">' + (s.glyph ? PMU.icon(s.glyph, 'pmu-vs-glyph') : '') +
        '<span>' + esc(word || s.word) + '</span></span>';
    }
  };

  PMU.fmt = fmt;
  PMU.vs = vs;
})();
