/* PMXAssert — Opus 5 interaction test harness
 *
 * Dependency-free, in-page, no install. It runs inside the same document as the concepts, which is
 * the only way to assert computed geometry and cross-theme state without crossing a document
 * boundary — the whole reason contact.html renders eight themes as siblings.
 *
 * TEST_REPORT.md already documented this surface before it existed. Keeping the names identical is
 * deliberate: a future report has to be comparable with the prior one, and renaming `noOverlap` or
 * `results()` would silently break that comparison.
 *
 * WHY A CONSOLE SHIM
 * ------------------
 * "Zero console errors and zero console warnings" is a real acceptance criterion, and an unknown
 * icon name or an unbound service reports itself only through console.warn. The shim is installed
 * at load so counts cover the whole run including boot, and it forwards to the original so a human
 * watching devtools still sees everything.
 */
(function (global) {
  'use strict';

  var suites = [];         /* { name, fn } in registration order */
  var current = null;      /* the suite being run, for failure attribution */
  var records = [];        /* every assertion outcome */

  /* ---- console capture ---------------------------------------------------------------- */

  var counts = { errors: 0, warnings: 0 };
  var messages = { errors: [], warnings: [] };

  (function installShim() {
    if (!global.console) return;
    var realError = global.console.error;
    var realWarn = global.console.warn;
    global.console.error = function () {
      counts.errors++;
      if (messages.errors.length < 40) messages.errors.push(Array.prototype.join.call(arguments, ' '));
      if (realError) realError.apply(global.console, arguments);
    };
    global.console.warn = function () {
      counts.warnings++;
      if (messages.warnings.length < 40) messages.warnings.push(Array.prototype.join.call(arguments, ' '));
      if (realWarn) realWarn.apply(global.console, arguments);
    };
    /* An uncaught error is an error whether or not anything logged it. */
    global.addEventListener('error', function (e) {
      counts.errors++;
      if (messages.errors.length < 40) messages.errors.push('uncaught: ' + (e && e.message));
    });
    global.addEventListener('unhandledrejection', function (e) {
      counts.errors++;
      if (messages.errors.length < 40) messages.errors.push('unhandled rejection: ' + String(e && e.reason));
    });
  })();

  function consoleCounts() { return { errors: counts.errors, warnings: counts.warnings }; }
  function consoleMessages() { return { errors: messages.errors.slice(), warnings: messages.warnings.slice() }; }
  function resetConsoleCounts() { counts.errors = 0; counts.warnings = 0; messages.errors = []; messages.warnings = []; }

  /* ---- registration ------------------------------------------------------------------- */

  function suite(name, fn) {
    suites.push({ name: name, fn: fn });
    return api;
  }

  function list() {
    return suites.map(function (s) { return s.name; });
  }

  function record(ok, msg, actual, expected) {
    records.push({
      suite: current || 'unattributed',
      ok: !!ok,
      msg: String(msg || ''),
      actual: ok ? undefined : brief(actual),
      expected: ok ? undefined : brief(expected)
    });
    return !!ok;
  }

  /* Failure values are stringified defensively: an assertion that throws while REPORTING a failure
   * loses the failure, which is the worst possible outcome for a test harness. */
  function brief(v) {
    try {
      if (v === undefined) return 'undefined';
      if (v === null) return 'null';
      if (typeof v === 'string') return v.length > 200 ? v.slice(0, 200) + '…' : v;
      if (typeof v === 'number' || typeof v === 'boolean') return String(v);
      if (v && v.nodeType === 1) return '<' + v.tagName.toLowerCase() + (v.className ? ' class="' + v.className + '"' : '') + '>';
      var s = JSON.stringify(v);
      return s && s.length > 200 ? s.slice(0, 200) + '…' : String(s);
    } catch (e) { return '[unstringifiable]'; }
  }

  /* ---- assertions --------------------------------------------------------------------- */

  function eq(actual, expected, msg) {
    return record(actual === expected, msg, actual, expected);
  }

  function neq(actual, expected, msg) {
    return record(actual !== expected, msg, actual, 'not ' + brief(expected));
  }

  function ok(value, msg) {
    return record(!!value, msg, value, 'truthy');
  }

  function notOk(value, msg) {
    return record(!value, msg, value, 'falsy');
  }

  function deepEq(actual, expected, msg) {
    var a, b;
    try { a = JSON.stringify(actual); b = JSON.stringify(expected); } catch (e) { a = 'x'; b = 'y'; }
    return record(a === b, msg, actual, expected);
  }

  function near(a, b, tol, msg) {
    var d = Math.abs(Number(a) - Number(b));
    return record(d <= tol, msg, a + ' (delta ' + d.toFixed(2) + ')', b + ' ± ' + tol);
  }

  function throws(fn, msg) {
    var threw = false;
    try { fn(); } catch (e) { threw = true; }
    return record(threw, msg, threw ? 'threw' : 'did not throw', 'threw');
  }

  function rect(el) {
    if (!el || !el.getBoundingClientRect) return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
    var r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
  }

  /* Pairwise geometry. A half-pixel tolerance is deliberate: adjacent columns legitimately share an
   * edge, and subpixel layout would otherwise report a 0.0001px "overlap" on a correct layout. */
  function noOverlap(a, b, msg) {
    var eps = 0.5;
    var clear = a.right <= b.left + eps || b.right <= a.left + eps ||
                a.bottom <= b.top + eps || b.bottom <= a.top + eps;
    return record(clear, msg,
      'a[' + Math.round(a.left) + '..' + Math.round(a.right) + '] b[' + Math.round(b.left) + '..' + Math.round(b.right) + ']',
      'no overlap');
  }

  /* leftToRight(rects, msg) — the artifact / history / transcript ordering assertion. Written as one
   * call because asserting it as three separate comparisons produced three failures for one fault. */
  function leftToRight(list, msg) {
    var okAll = true;
    for (var i = 1; i < list.length; i++) if (!(list[i - 1].left <= list[i].left + 0.5)) okAll = false;
    return record(okAll, msg, list.map(function (r) { return Math.round(r.left); }).join(' < '), 'ascending left edges');
  }

  /* ---- running ------------------------------------------------------------------------ */

  function runOne(name, opts) {
    var found = null;
    for (var i = 0; i < suites.length; i++) if (suites[i].name === name) found = suites[i];
    if (!found) { record(false, 'unknown suite: ' + name); return Promise.resolve(); }
    current = name;
    var out;
    try { out = found.fn(api, opts || {}); } catch (e) {
      record(false, 'suite threw: ' + String(e && e.message));
      current = null;
      return Promise.resolve();
    }
    /* A suite may return a promise; a suite that does not is treated as synchronous rather than
     * being wrapped, so a synchronous run stays synchronous and its failures attribute correctly. */
    if (out && typeof out.then === 'function') {
      return out.catch(function (e) { record(false, 'suite rejected: ' + String(e && e.message)); })
        .then(function () { current = null; });
    }
    current = null;
    return Promise.resolve();
  }

  function results() {
    var failures = [];
    var passed = 0;
    for (var i = 0; i < records.length; i++) {
      if (records[i].ok) passed++;
      else failures.push({ suite: records[i].suite, msg: records[i].msg, actual: records[i].actual, expected: records[i].expected });
    }
    return { total: records.length, passed: passed, failed: failures.length, failures: failures };
  }

  function reset() { records = []; }

  var api = {
    suite: suite,
    list: list,
    runOne: runOne,
    results: results,
    reset: reset,
    eq: eq, neq: neq, ok: ok, notOk: notOk, deepEq: deepEq, near: near, throws: throws,
    rect: rect, noOverlap: noOverlap, leftToRight: leftToRight,
    consoleCounts: consoleCounts,
    consoleMessages: consoleMessages,
    resetConsoleCounts: resetConsoleCounts,
    record: record
  };

  global.PMXAssert = api;
})(window);
