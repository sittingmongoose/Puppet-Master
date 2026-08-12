/* PMXApprovals — Opus 5
 *
 * One compact-decision object for four things that the packet describes separately but which
 * share a single contract: "compact decision; expandable evidence"
 * (01_SELECTOR_ACCESS_BSD_AND_WARNINGS.md, "Compact approvals").
 *
 *   approval  a tool/command permission gate            (01_...:57-70)
 *   warning   the material route-consequence ladder     (01_...:113-145)
 *   grant     cross-project read/write authorization    (03_...:125-134)
 *   conflict  an operational collision raised by PMXOps (03_...:113-119)
 *
 * They are one kind union rather than four services because a concept must render them with ONE
 * surface per thread. Four record types would mean four renderers in each of the eight threads,
 * and the first divergence between them would be a lie about which decisions are still open.
 *
 * Two behaviours here are load-bearing and are asserted in Phase G.
 *
 * 1. FIRST VIEW SHOWS ONLY THE HIGHEST-SEVERITY CONSEQUENCE (01_...:143). A single route change
 *    routinely produces several consequence classes at once — crossing a provider boundary also
 *    replays the conversation, also drops the cache, also changes hosting. Showing four lines
 *    turns a decision into a wall the user scrolls past. So `raise` keeps EVERY class in
 *    `details.receipts` and derives `question`/`scopeLine` from the single highest-ranked class.
 *    The ranking is the exported array CLS_RANK, in the packet's own listing order, so the choice
 *    is auditable rather than buried in a comparator.
 *
 * 2. `Allow once` NEVER WRITES A PERSISTENT GRANT (03_...:134, "One-time access never becomes
 *    persistent"). Only `Allow for session` and `Allow for this Goal` write into
 *    `session.ops.grants`, with scope 'session' / 'goal'. The grant key is derived from the
 *    record's own identity, not from a counter: a counter would mint a second key for the same
 *    authorization on every re-raise, and a stale grant nobody can name is how a one-time
 *    permission quietly becomes forever.
 *
 * Records live in `view[tid].decisions` and every mutation announces with
 * `store.touchView('decisions')`. This module never touches the DOM.
 *
 * Contract: CONTRACT.md section 5 (store is the only source of truth for semantic state);
 * SERVICES.md "PMXApprovals".
 */
(function (global) {
  'use strict';

  /* The closed consequence ladder, in the packet's listing order (01_...:113-123). The order IS
   * the rank: the earlier a class appears, the more important its consequence, so index 0 wins
   * the single line the first view is allowed to show. Kept as a real exported array so a test
   * can assert the ranking instead of inferring it from behaviour. */
  var CLS_RANK = [
    'provider_boundary',
    'conversation_replay',
    'cache_loss',
    'smaller_context',
    'attachment_incompatibility',
    'tool_mcp_change',
    'price_allowance_change',
    'privacy_hosting_change',
    'paid_continuation'
  ];

  var KINDS = ['approval', 'warning', 'grant', 'conflict'];
  var SEVERITIES = ['material', 'informational'];

  /* Per-class copy. `question` asks for the decision, `scopeLine` states the one consequence.
   * provider_boundary is verbatim from 01_...:128-129 — the `{subject}` slot exists so the caller
   * can name the real target while the default renders the packet's exact example,
   * `Switch to Claude API?`. The remaining eight are prose the packet leaves to the product; each
   * states a consequence the user can act on, never an internal enum. */
  var CONSEQUENCE = {
    provider_boundary: {
      question: 'Switch to {subject}?',
      subject: 'Claude API',
      scopeLine: 'This will resend the conversation through a different provider and restart the prompt cache.'
    },
    conversation_replay: {
      question: 'Resend this conversation?',
      scopeLine: 'The whole conversation is replayed through the new route before the next turn runs.'
    },
    cache_loss: {
      question: 'Restart the prompt cache?',
      scopeLine: 'The warm prompt cache is discarded, so the next turn is slower and costs more.'
    },
    smaller_context: {
      question: 'Continue in a smaller context?',
      scopeLine: 'The new route holds less context, so older turns are summarized to fit.'
    },
    attachment_incompatibility: {
      question: 'Continue without one attachment?',
      scopeLine: 'The new route cannot read an attachment this thread already relies on.'
    },
    tool_mcp_change: {
      question: 'Change the available tools?',
      scopeLine: 'The new route exposes a different tool and MCP set.'
    },
    price_allowance_change: {
      question: 'Continue at a different price?',
      scopeLine: 'Work on the new route bills to a different allowance.'
    },
    privacy_hosting_change: {
      question: 'Send this to a different host?',
      scopeLine: 'Privacy, hosting and terms differ on the new route.'
    },
    paid_continuation: {
      question: 'Continue as paid work?',
      scopeLine: 'The included allowance is spent, so continuing bills to the account.'
    }
  };

  /* Action ids are stable slugs; labels are the packet's verbatim strings. `decide` accepts
   * either, because a renderer built from the label list must not have to know the slug — but the
   * slug is what lands in `decidedAction`, so a copy change can never invalidate stored history.
   *
   * Exposed as BUILDERS, not as shared constants: an action array handed to a record is mutable,
   * and a renderer that appended to a shared constant would silently rewrite the action set of
   * every other decision in the workspace. Each call returns a fresh array of fresh objects. */
  function action(id, label, primary) {
    var a = { id: id, label: label };
    if (primary) a.primary = true;
    return a;
  }

  var ACTIONS = {
    /* 01_...:61-64 */
    approval: function () {
      return [
        action('deny', 'Deny'),
        action('allow_once', 'Allow once', true),
        action('allow_session', 'Allow for session'),
        action('details', 'Details')
      ];
    },
    /* 01_...:131 */
    routeWarning: function () {
      return [
        action('cancel', 'Cancel'),
        action('branch', 'Branch'),
        action('switch', 'Switch', true),
        action('details', 'Details')
      ];
    },
    /* 03_...:131 */
    grant: function () {
      return [
        action('cancel', 'Cancel'),
        action('allow_once', 'Allow once', true),
        action('allow_goal', 'Allow for this Goal'),
        action('open_settings', 'Open Settings')
      ];
    },
    /* 05_...:31-34, raised by PMXAttach for an unsupported attachment */
    attachment: function () {
      return [
        action('cancel', 'Cancel'),
        action('extract_in_pm', 'Extract in PM', true),
        action('use_gemini_3_ultra', 'Use Gemini 3 Ultra')
      ];
    }
  };

  /* Actions that reveal or navigate rather than settle. Pressing `Details` must not consume the
   * decision — a user who opens the evidence and then closes it still owes an answer. Returning
   * ok:true with applied:false says exactly that, where marking the record decided would drop a
   * pending approval on the floor. */
  var NON_DECIDING = { details: true, open_settings: true };

  /* Which settling actions write a persistent grant, and at what scope. `allow_once` is
   * deliberately absent; its absence from this table is the whole of behaviour 2. */
  var GRANT_SCOPE = { allow_session: 'session', allow_goal: 'goal' };

  var store = null;

  function bind(s) {
    store = s || null;
    return api;
  }

  function now() { return new Date().toISOString(); }

  function slug(text) {
    var s = String(text === undefined || text === null ? '' : text).toLowerCase();
    s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (s.length > 48) s = s.slice(0, 48).replace(/-+$/, '');
    return s || 'decision';
  }

  function indexOf(list, value) {
    for (var i = 0; i < list.length; i++) if (list[i] === value) return i;
    return -1;
  }

  /* The live decisions array for a thread, or null when unbound. Returning the live array rather
   * than a copy is intentional: the store owns the state, and a renderer that mutated a copy
   * would see its change vanish on the next read. */
  function listOf(threadId) {
    if (!store || typeof store.view !== 'function') return null;
    var v = store.view(threadId);
    if (!v) return null;
    if (!v.decisions) v.decisions = [];
    return v.decisions;
  }

  function announce() {
    if (store && typeof store.touchView === 'function') store.touchView('decisions');
  }

  function emptyDetails() {
    /* Nothing to show is an empty collection, never the string 'None' or 'n/a'. A placeholder
     * reads as evidence that was checked and found empty; an empty array reads as absent, which
     * is the truth. The two prose fields are strings because they are sentences when present. */
    return {
      commands: [],
      files: [],
      servers: [],
      domains: [],
      persistence: '',
      saferAlternative: '',
      receipts: []
    };
  }

  function arrayOf(value) {
    if (value === undefined || value === null) return [];
    if (Object.prototype.toString.call(value) === '[object Array]') return value.slice();
    return [value];
  }

  function normalizeDetails(spec) {
    var d = emptyDetails();
    var src = spec || {};
    d.commands = arrayOf(src.commands);
    d.files = arrayOf(src.files);
    d.servers = arrayOf(src.servers);
    d.domains = arrayOf(src.domains);
    d.receipts = arrayOf(src.receipts);
    d.persistence = src.persistence ? String(src.persistence) : '';
    d.saferAlternative = src.saferAlternative ? String(src.saferAlternative) : '';
    return d;
  }

  /* In-place repair for a record already living in the store. Distinct from normalizeDetails on
   * purpose: a stored details object is a live reference a renderer may already hold, so healing
   * it must fill the gaps rather than swap the object out underneath that renderer. */
  function ensureDetails(rec) {
    if (!rec.details || typeof rec.details !== 'object') { rec.details = emptyDetails(); return; }
    var d = rec.details;
    var lists = ['commands', 'files', 'servers', 'domains', 'receipts'];
    for (var i = 0; i < lists.length; i++) {
      if (Object.prototype.toString.call(d[lists[i]]) !== '[object Array]') d[lists[i]] = arrayOf(d[lists[i]]);
    }
    if (typeof d.persistence !== 'string') d.persistence = d.persistence ? String(d.persistence) : '';
    if (typeof d.saferAlternative !== 'string') d.saferAlternative = d.saferAlternative ? String(d.saferAlternative) : '';
  }

  /* Highest-ranked class of a set, by CLS_RANK order. Returns null for an empty set. */
  function topClass(classes) {
    var best = null, bestRank = -1;
    for (var i = 0; i < classes.length; i++) {
      var r = indexOf(CLS_RANK, classes[i]);
      if (r < 0) continue;
      if (bestRank < 0 || r < bestRank) { bestRank = r; best = classes[i]; }
    }
    return best;
  }

  function consequenceLine(cls) {
    var c = CONSEQUENCE[cls];
    if (!c) return '';
    return c.scopeLine;
  }

  function consequenceQuestion(cls, subject) {
    var c = CONSEQUENCE[cls];
    if (!c) return '';
    var subj = subject || c.subject || '';
    return c.question.replace('{subject}', subj);
  }

  /* Record ids are content-derived and only de-duplicated against the thread's own list. A global
   * counter would make the same decision carry a different id in every run, which defeats both
   * the stable grant key and any fixture that wants to name a decision it authored. */
  function mintId(list, kind, question) {
    var base = kind + '-' + slug(question);
    var candidate = base, n = 1;
    while (findAt(list, candidate) >= 0) { n++; candidate = base + '-' + n; }
    return candidate;
  }

  function findAt(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i] && list[i].id === id) return i;
    return -1;
  }

  /* Repairs a record authored by the fixture (store._seedView copies thread.decisions and
   * thread.conflicts in verbatim) so every consumer sees the full shape. Idempotent, fills only
   * what is missing, and never overwrites authored copy — a fixture is allowed to state a
   * decision, and this must not rewrite what it stated. */
  function heal(rec) {
    if (!rec) return rec;
    if (indexOf(KINDS, rec.kind) < 0) rec.kind = 'approval';
    if (indexOf(SEVERITIES, rec.severity) < 0) rec.severity = 'material';
    if (rec.cls !== null && indexOf(CLS_RANK, rec.cls) < 0) rec.cls = null;
    if (typeof rec.question !== 'string') rec.question = '';
    if (typeof rec.scopeLine !== 'string') rec.scopeLine = '';
    if (Object.prototype.toString.call(rec.actions) !== '[object Array]') rec.actions = [];
    rec.details = normalizeDetails(rec.details);
    if (rec.status !== 'decided') rec.status = 'pending';
    if (rec.decidedAction === undefined) rec.decidedAction = null;
    if (rec.owner === undefined) rec.owner = null;
    if (rec.conflictKind === undefined) rec.conflictKind = null;
    if (!rec.id) rec.id = rec.kind + '-' + slug(rec.question);
    return rec;
  }

  /* pending(threadId) -> record[]
   *
   * Open decisions only, in raise order. A decided record stays in the list so the transcript can
   * keep showing what was chosen; it is simply no longer pending. */
  function pending(threadId) {
    var list = listOf(threadId);
    if (!list) return [];
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var rec = heal(list[i]);
      if (rec && rec.status !== 'decided') out.push(rec);
    }
    return out;
  }

  /* raise(threadId, spec) -> record id | null
   *
   * spec: { kind, severity, cls (string or array), subject, question, scopeLine, actions,
   *         details, owner, conflictKind }
   *
   * An unknown `cls` is a REFUSED raise, not a silent pass: a consequence class that nothing in
   * this module can rank or describe would render as a blank warning line, and a blank warning is
   * worse than no warning. Returns null so the caller can report the refusal.
   */
  function raise(threadId, spec) {
    var list = listOf(threadId);
    if (!list) return null;
    var sp = spec || {};

    var kind = sp.kind || 'approval';
    if (indexOf(KINDS, kind) < 0) return null;

    /* Every class the caller declared, in declaration order, with duplicates dropped. All of them
     * survive into details.receipts; only the top-ranked one reaches the first view. */
    var declared = arrayOf(sp.cls);
    var classes = [];
    for (var i = 0; i < declared.length; i++) {
      var c = declared[i];
      if (c === null || c === undefined || c === '') continue;
      if (indexOf(CLS_RANK, c) < 0) return null;      /* refused, not coerced */
      if (indexOf(classes, c) < 0) classes.push(c);
    }

    /* A plain approval carries no consequence class at all — cls is null, not 'none'. */
    var cls = classes.length ? topClass(classes) : null;

    var severity = indexOf(SEVERITIES, sp.severity) >= 0
      ? sp.severity
      : (kind === 'warning' && !cls ? 'informational' : 'material');

    var question = sp.question
      ? String(sp.question)
      : (cls ? consequenceQuestion(cls, sp.subject) : defaultQuestion(kind));
    var scopeLine = sp.scopeLine !== undefined && sp.scopeLine !== null
      ? String(sp.scopeLine)
      : (cls ? consequenceLine(cls, sp.subject) : defaultScopeLine(kind));

    var actions = Object.prototype.toString.call(sp.actions) === '[object Array]'
      ? sp.actions.slice()
      : defaultActions(kind);

    var details = normalizeDetails(sp.details);

    /* Behaviour 1: every declared class is preserved as a consequence receipt, ranked, so
     * `Details` can show the full ladder the first view compressed to one line. */
    for (var j = 0; j < classes.length; j++) {
      details.receipts.push({
        kind: 'consequence',
        cls: classes[j],
        rank: indexOf(CLS_RANK, classes[j]),
        shownFirst: classes[j] === cls,
        text: consequenceLine(classes[j], sp.subject)
      });
    }

    var rec = {
      id: sp.id && findAt(list, sp.id) < 0 ? String(sp.id) : mintId(list, kind, question),
      kind: kind,
      severity: severity,
      cls: cls,
      question: question,
      scopeLine: scopeLine,
      actions: actions,
      details: details,
      status: 'pending',
      decidedAction: null,
      /* Conflict-only carriers. PMXOps projects its conflict list out of these records, and its
       * owner line and Details pane need the owning thread and worktree — there is nowhere in
       * `details` for a party, only for evidence. Null on every other kind. */
      owner: sp.owner || null,
      conflictKind: sp.conflictKind || null
    };

    list.push(rec);
    announce();
    return rec.id;
  }

  function defaultQuestion(kind) {
    /* 01_...:61 for the approval, 03_...:129 for the grant. Both verbatim. */
    if (kind === 'approval') return 'Run 2 commands?';
    if (kind === 'grant') return 'This task will read Project A and modify Project B.';
    return '';
  }

  function defaultScopeLine(kind) {
    /* 01_...:62, verbatim including the middle dot separator. */
    if (kind === 'approval') return 'Workspace only · Needed to run the test suite';
    return '';
  }

  function defaultActions(kind) {
    if (kind === 'approval') return ACTIONS.approval();
    if (kind === 'warning') return ACTIONS.routeWarning();
    if (kind === 'grant') return ACTIONS.grant();
    /* A conflict's action set is owned by whoever raised it — PMXOps names `Use 3001` for a port
     * collision and `Wait for writer` for a worktree lease. Inventing a generic set here would
     * offer the user a resolution this module cannot perform. */
    return [];
  }

  /* Matches by action id first, then by exact verbatim label. A renderer built straight from the
   * packet's label list can call decide('Allow once') and get the same result as decide
   * ('allow_once'); `decidedAction` always stores the id, so later copy edits cannot orphan a
   * decision already made. */
  function actionOf(rec, actionId) {
    if (!rec || !actionId) return null;
    var want = String(actionId);
    var i;
    for (i = 0; i < rec.actions.length; i++) {
      if (rec.actions[i] && rec.actions[i].id === want) return rec.actions[i];
    }
    for (i = 0; i < rec.actions.length; i++) {
      if (rec.actions[i] && rec.actions[i].label === want) return rec.actions[i];
    }
    return null;
  }

  /* Grant key scheme: '<scope>:<threadId>:<cls or kind>:<question slug>'.
   *
   * Derived wholly from the record so the same authorization, raised again in the same thread,
   * lands on the same key and refreshes it instead of accumulating a second one. A counter-based
   * key would leave the grant store growing with duplicates that no UI can reconcile and no user
   * can revoke by name. */
  function grantKey(threadId, rec, scope) {
    return scope + ':' + (threadId || '') + ':' + (rec.cls || rec.kind) + ':' + slug(rec.question);
  }

  function writeGrant(threadId, rec, scope, act) {
    if (!store || typeof store.get !== 'function' || typeof store.set !== 'function') return null;
    var ops = store.get('session.ops') || {};
    var grants = ops.grants || {};
    var key = grantKey(threadId, rec, scope);
    grants[key] = {
      scope: scope,
      threadId: threadId || null,
      decisionId: rec.id,
      kind: rec.kind,
      cls: rec.cls,
      question: rec.question,
      actionId: act.id,
      at: now()
    };
    store.set('session.ops.grants', grants);
    return key;
  }

  /* decide(threadId, id, actionId) -> { ok, applied, reason }
   *
   * `ok` says the action was legitimate; `applied` says the record was settled by it. They differ
   * for `Details` and `Open Settings`, which are legitimate and settle nothing. `reason` is null
   * on success and a human-readable sentence on refusal — never an enum, per CONTRACT section 8.3.
   */
  function decide(threadId, id, actionId) {
    var list = listOf(threadId);
    if (!list) return { ok: false, applied: false, reason: 'No thread is bound.' };
    var at = findAt(list, id);
    if (at < 0) return { ok: false, applied: false, reason: 'That decision is no longer open.' };
    var rec = heal(list[at]);

    var act = actionOf(rec, actionId);
    if (!act) return { ok: false, applied: false, reason: 'That action is not offered on this decision.' };

    if (NON_DECIDING[act.id]) {
      /* Legitimate, and the record stays pending on purpose. */
      return { ok: true, applied: false, reason: null };
    }

    if (rec.status === 'decided') {
      return { ok: false, applied: false, reason: 'This decision was already made.' };
    }

    var scope = GRANT_SCOPE[act.id] || null;
    var key = scope ? writeGrant(threadId, rec, scope, act) : null;

    rec.status = 'decided';
    rec.decidedAction = act.id;
    /* The chosen action is itself a receipt. Keeping it inside the record means the decision and
     * its evidence stay one object, so a transcript can still show what was granted and at what
     * scope long after the card has collapsed. */
    rec.details.receipts.push({
      kind: 'decision',
      at: now(),
      actionId: act.id,
      label: act.label,
      grantScope: scope,
      grantKey: key,
      text: act.label
    });

    announce();
    return { ok: true, applied: true, reason: null };
  }

  /* detailsOf(threadId, id) -> details | null
   *
   * The expandable half of "compact decision; expandable evidence". Returns the live evidence
   * object; absent evidence is an empty array, so a renderer decides what to omit rather than
   * printing a placeholder that implies something was found. */
  function detailsOf(threadId, id) {
    var list = listOf(threadId);
    if (!list) return null;
    var at = findAt(list, id);
    if (at < 0) return null;
    return heal(list[at]).details;
  }

  /* clear(threadId) -> boolean. Drops every record, decided or not. Used by the demo director's
   * reset, which must restore one known state; it is not an ordinary product action, because
   * discarding an undecided approval silently is exactly the drop this module prevents. */
  function clear(threadId) {
    var list = listOf(threadId);
    if (!list) return false;
    if (!list.length) return false;
    list.length = 0;
    announce();
    return true;
  }

  var api = {
    bind: bind,
    CLS_RANK: CLS_RANK,
    KINDS: KINDS,
    ACTIONS: ACTIONS,
    pending: pending,
    raise: raise,
    decide: decide,
    detailsOf: detailsOf,
    clear: clear
  };

  global.PMXApprovals = api;
})(window);
