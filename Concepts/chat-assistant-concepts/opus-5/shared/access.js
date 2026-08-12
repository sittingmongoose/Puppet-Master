/* PMXAccess — Opus 5
 *
 * The access profile is the authority ceiling for consequential effects. The conversation
 * mode (Ask / Agent / Plan / Deep Plan / Review / Debug) is a SEPARATE axis
 * (01_SELECTOR_ACCESS_BSD_AND_WARNINGS.md:44). This module owns the one place where the two
 * axes meet: a mode may narrow the selected profile downward, never widen it, and the
 * narrowing must be stated in one line of visible prose rather than silently applied.
 *
 * Two decisions worth recording:
 *
 * 1. `effective()` reports the REQUESTED profile's label alongside the EFFECTIVE profile id.
 *    That asymmetry is deliberate: the packet's line reads `Full Access · Limited by Review
 *    mode`, so the user still sees what they asked for plus the truthful reason it is capped.
 *    Rendering the capped label instead would hide the fact that a selection was overridden.
 *
 * 2. `toolsFor()` exists so Plan and Review can never be drawn as blind modes
 *    (06_COMPOSER_SPELLCHECK_AND_THREAD_LOCAL_STATE.md:77). Their read, research, browser,
 *    diagnostic and sandboxed-test availability is real; only consequential effects are
 *    capped. No mode returns an empty list, because an empty list would read as "this mode
 *    can do nothing", which is false for every mode PM ships.
 *
 * Profile state is thread-local. It is read and written exclusively through
 * store.runtime / store.setRuntime, which fall back to session.defaults, so a thread that
 * never overrode the profile inherits the default instead of carrying a stale copy.
 */
(function (global) {
  'use strict';

  var store = null;

  /* Verbatim from 01_SELECTOR_ACCESS_BSD_AND_WARNINGS.md:32-37. The visible string is
   * `Full Access`; the informal name for this profile never appears in product surfaces or
   * impact records (06_...:73). */
  var PROFILES = [
    { id: 'ask', label: 'Ask for approval' },
    { id: 'auto_edits', label: 'Auto accept edits' },
    { id: 'auto', label: 'Auto' },
    { id: 'full', label: 'Full Access' }
  ];

  /* Authority order, weakest first. Narrowing is a min() over this order, which is why the
   * ceiling table below can only ever move a selection down the list. */
  var ORDER = ['ask', 'auto_edits', 'auto', 'full'];

  /* Mode ceilings. Plan, Deep Plan and Review are review-shaped: they may read, research and
   * test freely but must not land consequential effects unattended, so they stop at
   * `auto_edits`. Ask is approval-per-action by definition and therefore pins to `ask`.
   * Agent and Debug are absent from this table on purpose — a mode with no entry does not
   * narrow, and adding a `null` row would invite a future editor to treat it as a cap. */
  var CEILING = {
    'Plan': 'auto_edits',
    'Deep Plan': 'auto_edits',
    'Review': 'auto_edits',
    'Ask': 'ask'
  };

  /* The Plan/Review availability list, enumerated from the packet sentence at 01_...:48
   * ("safe read, repository search, web search/fetch, browser inspection, screenshots, logs,
   * diagnostics, static analysis, and approved sandboxed tests"). Kept as one array so the
   * three read-shaped modes cannot drift apart. */
  var READ_TOOLS = [
    'Read files',
    'Repository search',
    'Web search',
    'Web fetch',
    'Browser inspection',
    'Screenshots',
    'Logs',
    'Diagnostics',
    'Static analysis',
    'Sandboxed tests'
  ];

  /* Consequential families, only reachable from the two modes that do not narrow. PM-native
   * browser vocabulary is mandatory in visible strings, so this list says `Browser Program`
   * rather than naming any external driver. */
  var EFFECT_TOOLS = ['File edits', 'Command execution', 'Version control', 'Package operations', 'Browser Program'];

  var INSPECT_TOOLS = ['Debug sessions', 'Process inspection', 'Device sessions'];

  /* Ask is a conversation mode: every consequential step is a separate approval, and the
   * browser/capture/test families belong to modes that carry a plan. It keeps the read and
   * research core so the mode is never presented as toolless. */
  var ASK_TOOLS = ['Read files', 'Repository search', 'Web search', 'Web fetch', 'Logs', 'Diagnostics'];

  var TOOLS_BY_MODE = {
    'Ask': ASK_TOOLS,
    'Plan': READ_TOOLS,
    /* Deep Plan is Plan with more exploration depth, not more authority. It shares Plan's
     * ceiling, so it shares Plan's availability; the packet grants it nothing further and
     * inventing an extra family here would be a fiction the product cannot honour. */
    'Deep Plan': READ_TOOLS,
    'Review': READ_TOOLS,
    'Agent': READ_TOOLS.concat(EFFECT_TOOLS, INSPECT_TOOLS),
    'Debug': READ_TOOLS.concat(EFFECT_TOOLS, INSPECT_TOOLS)
  };

  function bind(s) {
    store = s || null;
    return api;
  }

  function profileById(id) {
    for (var i = 0; i < PROFILES.length; i++) {
      if (PROFILES[i].id === id) return PROFILES[i];
    }
    return null;
  }

  function rank(id) {
    var i = ORDER.indexOf(id);
    return i < 0 ? ORDER.indexOf('ask') : i;
  }

  /* Unbound service answers with the weakest profile rather than throwing, so a partially
   * booted page renders a truthful "Ask for approval" instead of blank chrome. */
  function get(threadId) {
    if (!store) return 'ask';
    var id = store.runtime(threadId, 'access');
    return profileById(id) ? id : 'ask';
  }

  function set(threadId, id) {
    if (!store || !profileById(id)) return false;
    store.setRuntime(threadId, 'access', id);
    return true;
  }

  function modeOf(threadId) {
    if (!store) return null;
    var m = store.runtime(threadId, 'mode');
    return m ? String(m) : null;
  }

  function effective(threadId) {
    var requestedId = get(threadId);
    var requested = profileById(requestedId) || PROFILES[0];
    var mode = modeOf(threadId);
    var cap = mode ? CEILING[mode] : null;
    var narrowed = !!cap && rank(cap) < rank(requestedId);
    /* The line carries the REQUESTED label in both branches. Unnarrowed it is the label
     * alone; narrowed it names the mode that imposed the cap, so the override is never
     * silent (01_SELECTOR_ACCESS_BSD_AND_WARNINGS.md:52). */
    return {
      profile: narrowed ? cap : requestedId,
      label: requested.label,
      narrowedBy: narrowed ? mode : null,
      line: narrowed ? requested.label + ' · Limited by ' + mode + ' mode' : requested.label
    };
  }

  /* Fresh array per call: the disclosure popup in Phase C lists these rows and a shared
   * reference would let one renderer's sort or splice corrupt every other mode's list. */
  function toolsFor(mode) {
    var list = TOOLS_BY_MODE[mode];
    /* An unrecognised mode falls back to the read-only core rather than to nothing: a
     * missing table row is a wiring bug, and claiming zero tools would be a worse lie than
     * claiming the safe floor. */
    return (list || ASK_TOOLS).slice();
  }

  var api = {
    PROFILES: PROFILES,
    bind: bind,
    get: get,
    set: set,
    effective: effective,
    toolsFor: toolsFor
  };

  global.PMXAccess = api;
})(window);
