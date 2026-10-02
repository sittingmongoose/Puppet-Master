/* Formatters, the value-state language and provider marks (owner: engine; ARCHITECTURE.md section 4.2, DESIGN-SPEC sections
   11 and 14, DESIGN-SPEC-ATLAS sections 5 and 6).
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
      var parts = a.toFixed(d).split('.');   /* thousands separators on the integer part only */
      var s = '$' + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (parts[1] ? '.' + parts[1] : '');
      return (usd < 0 ? '-' : '') + s + (opts && opts.est ? ' est.' : '');
    },
    tok: function (n) {
      if (missing(n)) return '-';
      if (n >= 1e9) return (n / 1e9).toFixed(n >= 1e10 ? 0 : 1).replace(/\.0$/, '') + 'B';
      if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 1 : 2).replace(/\.?0+$/, '') + 'M';
      /* three significant figures below 10k (3,980 reads 3.98k, never 4k) */
      if (n >= 1e5) return (n / 1e3).toFixed(0) + 'k';
      if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 1 : 2).replace(/\.?0+$/, '') + 'k';
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
    /* reset / reading truth words: pm_estimate reads "PM estimate" (R-PLAN-14: the Gemini API % is a PM estimate of
       invoiced spend over the Settings budget), the others their own words */
    truth: function (tr) { return { pm_estimate: 'PM estimate', provider_reported: 'provider reported', locally_inferred: 'locally inferred', pending_recheck: 'pending recheck' }[tr] || String(tr || 'unknown').replace(/_/g, ' '); },
    plural: function (n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); },
    /* [A1 6] the meter reset line in lower case with the B v2 truth rules: "resets in 1h 42m" (< 24 h), "resets Thu 03:06"
       (< 7 d), "resets Oct 1"; "≈" when locally inferred; "reset unknown"; "pending recheck" after a passed reset.
       soon = within the hour (rendered 12 / 560 ink-2). */
    resetLine: function (win) {
      if (!win || win.truth === 'unknown' || missing(win.resetAt)) return { text: 'reset unknown', truth: 'unknown', soon: false };
      if (win.truth === 'pending_recheck' || win.resetAt <= Date.now()) return { text: 'pending recheck', truth: 'pending_recheck', soon: false };
      var dt = win.resetAt - Date.now(), pre = win.truth === 'locally_inferred' ? '≈ ' : '';
      var when = dt < DAY ? 'in ' + fmt.span(dt) : dt < 7 * DAY ? fmt.day(win.resetAt) + ' ' + fmt.clock(win.resetAt) : fmt.date(win.resetAt);
      return { text: 'resets ' + pre + when, truth: win.truth, soon: dt < HOUR };
    },
    /* [A1 7.10] agenda day heads: {label: 'Today' | 'Tomorrow' | 'Sat, Oct 3', note: 'Thu, Oct 1' | 'in 1d 8h'} */
    dayHead: function (ms) {
      var d = new Date(ms), now = new Date(), start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      var dayIdx = Math.floor((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - start) / DAY + 0.5);
      var full = WEEKDAY[d.getDay()] + ', ' + MONTH[d.getMonth()] + ' ' + d.getDate();
      if (dayIdx === 0) return { label: 'Today', note: full, offset: 0 };
      if (dayIdx === 1) return { label: 'Tomorrow', note: full, offset: 1 };
      if (dayIdx === -1) return { label: 'Yesterday', note: full, offset: -1 };
      return { label: full, note: ms > Date.now() ? 'in ' + fmt.span(ms - Date.now()) : fmt.span(Date.now() - ms) + ' ago', offset: dayIdx };
    }
  };

  /* [A1 5] provider marks: monogram tiles in vendor hues, unique letters across the 22 Settings providers. A provider
     Settings adds later gets its first two letters (PM51.initials rule) and the community hue. */
  var MARKS = {
    'claude-code': ['Cl', 'anthropic'], 'openai-codex': ['Cx', 'openai'], antigravity: ['Ag', 'google'], grok: ['Gk', 'xai'],
    muse: ['Mu', 'meta'], 'github-copilot': ['Cp', 'github'], 'qwen-coding': ['Qw', 'alibaba'], 'zai-coding': ['Z', 'zai'],
    'kimi-coding': ['Ki', 'moonshot'], 'minimax-coding': ['Mx', 'minimax'], 'opencode-go': ['Go', 'opencode'],
    'anthropic-api': ['An', 'anthropic'], 'gemini-direct': ['Gm', 'google'], vertex: ['Vx', 'google'], 'xai-api': ['Xa', 'xai'],
    'meta-api': ['Me', 'meta'], 'cursor-cli': ['Cu', 'cursor'], 'qwen-token': ['Qt', 'alibaba'], 'opencode-zen': ['Zn', 'opencode'],
    'free-models': ['Fr', 'community'], opencode: ['Oc', 'opencode'], 'local-endpoint': ['Lo', 'network']
  };
  /* the six legacy DATA.providers ids map onto their Settings providers */
  var LEGACY_PROV = { claude: 'claude-code', codex: 'openai-codex', qwen: 'qwen-coding', gemini: 'gemini-direct', kimi: 'kimi-coding', copilot: 'github-copilot' };
  function markOf(providerId) {
    var id = LEGACY_PROV[providerId] || providerId;
    var m = MARKS[id];
    if (m) return { id: id, letters: m[0], vendor: m[1] };
    var name = String(providerId || '?').replace(/[^A-Za-z0-9 ]+/g, ' ').trim();
    var words = name.split(/\s+/).filter(Boolean);
    var letters = words.length > 1 ? (words[0][0] + words[1][0]) : name.slice(0, 2);
    letters = letters.charAt(0).toUpperCase() + letters.slice(1).toLowerCase();
    return { id: id, letters: letters || '?', vendor: 'community' };
  }
  /* PMU.mark(providerId, size, opts): the provider's OFFICIAL mark (Jared 2026-10-02 "yes use the real provider logos",
     DECISIONS.md) from the marks pack (06-marks.js window.PMU_MARKS: never recoloured, tinted or put on a plate; light /
     dark variant by theme, optical scale per mark), wrapped in .pmu-pmark so callers keep one hook (data-prov). Free
     Models and Local model server get the pack's neutral UI icons. A provider the pack does not know falls back to the
     monogram tile of DESIGN-SPEC-ATLAS 5 (letters in its vendor hue). opts.label adds a hover tag. */
  function mark(providerId, size, opts) {
    var m = markOf(providerId), s = size || 20, label = opts && opts.label ? ' data-pm-hover-label="' + esc(opts.label) + '"' : '';
    var P = window.PMU_MARKS, id = null;
    try { id = P && P.idFor ? (P.idFor(m.id) || P.idFor(providerId)) : null; } catch (error) { id = null; }
    if (id) {
      var inner = '';
      try { inner = P.html(id, s, 'auto'); } catch (error) { inner = ''; }
      if (inner) return '<span class="pmu-pmark is-logo" data-prov="' + esc(m.id) + '" data-vendor="' + m.vendor + '" data-size="' + s + '" style="--s:' + s + 'px"' +
        label + ' aria-hidden="true">' + inner + '</span>';
    }
    return '<span class="pmu-pmark" data-prov="' + esc(m.id) + '" data-vendor="' + m.vendor + '" data-size="' + s + '" style="--s:' + s + 'px"' +
      label + ' aria-hidden="true">' + esc(m.letters) + '</span>';
  }

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
  PMU.MARKS = MARKS;
  PMU.markOf = markOf;
  PMU.mark = mark;
})();
