/* pm7-port/js/05-hover-copy.js: the chat's hover copy for PMConcept7's hover tag controller (CONTRACT "Hosted mode":
   the chat emits data-pm-hover-label / -detail). The chat writes one line per control (app.js hoverAttrs, the modules'
   data-hover-tip, or only the control's visible text); PMConcept7's tag is a bold label over a detail line, and the
   controller fills a missing detail with its generic "Choose this option." (and a missing label with "Use this
   control"). This file gives every chat control both lines from the chat's own words:
   - PM56_HOST.hoverCopy(key, text) -> [label, detail] for app.js hoverAttrs at render: a tip with a second part
     (a sentence, a dash, a colon, a "Name · value", a parenthesis) splits into label and detail, a long tip keeps a
     short name as the label and becomes the detail, and the rest takes its detail from the KEY and ACTION tables.
   - At census time (PM_HOVER_TAG_CONTROLLER.prepare, which every scan, live update, bind and audit reads through) a
     chat element without a detail gets one, a module's data-hover-tip is split the same way, and a field without a
     name gets one. It writes only data-pm-hover-* attributes, which app.js pmSyncAttrs keeps across re-renders in
     hosted mode, so a patch never strips them and nothing is rewritten per render; data-pm-hover-src remembers the
     tip a split came from, so a tip that changes is split again.
   Every chat host carries data-pmh-tag="literal" (00-host.js): the chat's copy is written for people, so file names
   and paths in it are shown as they are rather than swapped for the controller's generic words. */
(function () {
  'use strict';
  var H = window.PM56_HOST;
  if (!H) return;

  function clean(v) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim(); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function stop(s) { s = clean(s); return s && !/[.!?…:]$/.test(s) ? s + '.' : s; }

  /* key prefix -> detail, or [label, detail] where '$' is the chat's own text (a long tip becomes the detail) */
  var KEY = [
    ['open-history', 'Shows the other chats in this project.'],
    ['header-threads', 'Shows the other chats in this project.'],
    ['new-thread', 'Opens an empty chat; this one stays in History.'],
    ['thread-search', 'Finds words in this chat or across every chat.'],
    ['context-ring', 'How much of the model’s context window this chat fills. Click for the details.'],
    ['pm56-column', 'Keep History open, pop the chat out of its column, or dock it back.'],
    ['lensbtn', 'Choose which messages count toward this chat’s context.'],
    ['worktree', 'The branch and worktree this chat works in. Click to switch.'],
    ['sel-persona', 'Who the agent acts as in this chat. Click to change.'],
    ['sel-model', 'The model that answers in this chat. Click to change.'],
    ['sel-mode', 'How the agent works in this chat. Click to change.'],
    ['sel-permissions', 'What the agent may do without asking you first. Click to change.'],
    ['wand', 'Turn Crew, Goal Mode and the chat’s other capabilities on or off.'],
    ['attach', 'Adds files or images to your next message.'],
    ['jump-bottom', 'Jumps to the newest message.'],
    ['msg-copy-', ['Copy message', '$']],
    ['msg-details-', ['Message details', '$']],
    ['msg-edit-', ['Edit message', '$']],
    ['msg-more-', ['More actions', '$']],
    ['cap-', 'On for this chat. Change it from Capabilities and Goal Mode.'],
    ['att-act-att-open-', 'Opens it in a panel beside the chat.'],
    ['att-act-att-download-', 'Saves the exact version that was attached.'],
    ['att-act-att-details-', 'Shows where it came from, its size and its version.'],
    ['att-act-att-copy-ref-', 'Copies a reference you can paste into a message.'],
    ['q-text-', 'Waiting to send after the current run.'],
    ['thread-st-', 'Opens this chat.'],
    ['thread-more-', 'Rename, pin, fork or archive this chat.'],
    ['hist-search', 'Type to filter the chats by title or message text.'],
    ['rcpt:', 'A receipt the chat keeps of what happened.'],
    ['wd-step-', 'Concept lab only: moves the demo run on by one subject.'],
    ['wd-done-', 'Concept lab only: finishes the demo run now.'],
    ['wd-reset-', 'Concept lab only: puts the demo run back to its start.'],
    ['wd-', 'Concept lab only: a control for this demo run.']
  ];
  /* hover key families that are not prefixes (mm-<message>-time ...) */
  var KEY_RE = [
    [/^mm-.+-time$/, 'When this message was sent.'],
    [/^mm-.+-provider$/, 'The provider account that answered.'],
    [/^mm-.+-model$/, 'The model and mode that wrote this reply.'],
    [/^mm-.+-worked$/, 'How long the agent worked on this reply.']
  ];
  /* exact tip -> detail, for keys that change their words with the state */
  var TEXT = {
    'Send message': 'Sends what you typed to the agent.',
    'Stop the current run': 'The agent stops working on this request.',
    'Copied': 'The message text is on the clipboard.'
  };
  /* data-action -> detail, for controls whose name is their visible text */
  var ACTION = {
    'att-open': 'Opens it in a panel beside the chat.',
    'att-download': 'Saves the exact version that was attached.',
    'att-details': 'Shows where it came from, its size and its version.',
    'att-copy-ref': 'Copies a reference you can paste into a message.',
    'pd-info': 'Shows this plan’s summary and status.',
    'pd-build': 'Starts building from this plan.',
    'pd-revise': 'Asks the agent to change this plan.',
    'pd-open-version': 'Opens this version of the plan in a panel.',
    'sched-open-plan-record': 'Opens the record this schedule belongs to.',
    'sched-card-edit': 'Change when or how this scheduled message is sent.',
    'sched-card-cancel': 'Cancels this scheduled message; nothing is sent.',
    'sched-card-details': 'Shows or hides this schedule’s details.',
    'sched-open-sent': 'Scrolls to the message that was sent.',
    'open-work-record': 'Opens the full record of this work in a panel.',
    'open-artifact': 'Opens the artifact in a panel beside the chat.',
    'open-activity': 'Opens this activity in the Activity panel.',
    'select-thread': 'Opens this chat.',
    'new-thread': 'Opens an empty chat; this one stays in History.',
    'copy-message': 'Copies the message text to the clipboard, unchanged.',
    'message-overflow': 'More things you can do with this message.',
    'scroll-to-bottom': 'Jumps to the newest message.',
    'toggle-history': 'Shows the other chats in this project.',
    'thread-menu': 'Rename, pin, fork or archive this chat.',
    'pd-view': 'Shows the plan in this format.',
    'sched-dock-show': 'Shows the messages scheduled in this chat.',
    'activity-scope': 'Switches between this activity and every activity domain.',
    'goal-pause': 'Pauses the goal; its progress is kept.',
    'goal-cancel': 'Ends the goal; work already done stays.',
    'model-provider': 'Lists the models under this heading.',
    'step-working': 'Concept lab only: moves the demo run on by one subject.',
    'complete-working': 'Concept lab only: finishes the demo run now.',
    'reset-working': 'Concept lab only: puts the demo run back to its start.'
  };
  /* last resort: the verb of the chat's action name (data-action) */
  var VERB = [
    [/(^|-)(open|view)(-|$)/, 'Opens it.'], [/(^|-)show(-|$)/, 'Shows it.'], [/(^|-)copy(-|$)/, 'Copies it to the clipboard.'],
    [/(^|-)(close|dismiss|hide)(-|$)/, 'Closes it.'], [/(^|-)(remove|delete|clear)(-|$)/, 'Removes it.'],
    [/(^|-)(add|new|create)(-|$)/, 'Adds one.'], [/(^|-)(select|set|pick|choose|use)(-|$)/, 'Uses this choice.'],
    [/(^|-)toggle(-|$)/, 'Turns it on or off.'], [/(^|-)(pin|unpin)(-|$)/, 'Pins or unpins it.'], [/(^|-)edit(-|$)/, 'Changes it.'],
    [/(^|-)(cancel|abort)(-|$)/, 'Cancels it.'], [/(^|-)(retry|rerun|redo)(-|$)/, 'Runs it again.'], [/(^|-)stop(-|$)/, 'Stops it.'],
    [/(^|-)(send|submit)(-|$)/, 'Sends it.'], [/(^|-)(expand|collapse|fold|unfold)(-|$)/, 'Opens or folds it.'],
    [/(^|-)(jump|go|scroll)(-|$)/, 'Moves there.'], [/(^|-)(start|run|launch|resume)(-|$)/, 'Starts it.'], [/(^|-)pause(-|$)/, 'Pauses it.'],
    [/(^|-)(approve|accept|allow|confirm)(-|$)/, 'Accepts it.'], [/(^|-)(reject|deny|decline)(-|$)/, 'Declines it.'],
    [/(^|-)(download|save|export)(-|$)/, 'Saves it.'], [/(^|-)(restore|revert|undo)(-|$)/, 'Puts it back.']
  ];

  function keyCopy(key, text) {
    if (!key) return '';
    for (var i = 0; i < KEY.length; i++) if (key.indexOf(KEY[i][0]) === 0) return KEY[i][1];
    for (var j = 0; j < KEY_RE.length; j++) if (KEY_RE[j][0].test(key)) return KEY_RE[j][1];
    return '';
  }
  /* split(text) -> [label, detail]; detail '' when the tip has a single part */
  function split(text) {
    var t = clean(text), m;
    if (!t) return ['', ''];
    if ((m = /^(.{2,90}?[^\s.])\.\s+(\S.*)$/.exec(t)) && !/\b(e\.g|i\.e|vs|etc)$/i.test(m[1])) return [m[1], stop(m[2])];
    if ((m = /^(.{2,90}?)\s+[—–]\s+(\S.*)$/.exec(t))) return [m[1], stop(cap(m[2]))];
    if ((m = /^([^:·(]{2,48}):\s+(\S.*)$/.exec(t))) return [m[1], stop(cap(m[2]))];
    if ((m = /^(.{1,60}?)\s+·\s+(\S.*)$/.exec(t))) return [m[1], stop(m[2])];
    if ((m = /^(.{2,90}?)\s+\(([^()]{2,90})\)$/.exec(t))) return [m[1], stop(cap(m[2]))];
    return [t, ''];
  }
  /* hoverCopy(key, text, action) -> [label, detail]: a table sentence keeps the chat's whole line as the label (a
     "Model · Claude Sonnet 4.6" tip names the control and its value); without one the line splits */
  function hoverCopy(key, text, action) {
    var t = clean(text), k = keyCopy(clean(key), t);
    if (TEXT[t]) return [t, TEXT[t]];
    if (Array.isArray(k)) return [k[0], k[1] === '$' ? stop(t) : k[1]];
    if (k) return [t, k];
    var p = split(t);
    if (p[1]) return p;
    return [t, (action && ACTION[action]) || ''];
  }
  H.hoverCopy = hoverCopy;

  /* ---- census time: complete the chat's elements before the controller reads them ---- */
  function setAttr(el, n, v) { if (v) { if (el.getAttribute(n) !== v) el.setAttribute(n, v); } else if (el.hasAttribute(n)) el.removeAttribute(n); }
  function attr(el, n) { return clean(el.getAttribute(n)); }
  function actionDetail(el, label) {
    var a = attr(el, 'data-action'), key = attr(el, 'data-hover-key'), k = keyCopy(key, label);
    if (Array.isArray(k)) k = k[1] === '$' ? '' : k[1];
    var d = TEXT[label] || k || ACTION[a] || '';
    if (!d && a) for (var i = 0; i < VERB.length; i++) if (VERB[i][0].test(a)) { d = VERB[i][1]; break; }
    return d;
  }
  var MENU_ROW = '.menu-item,.att-source-row,[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]';
  function complete(el) {
    if (!el || el.nodeType !== 1 || el.hasAttribute('data-pm-hover-exempt')) return;
    var tip = attr(el, 'data-hover-tip');
    /* a menu row shows its name and its line of help: PMConcept7's documented 'menu' exemption, as its own menus */
    if (!tip && !el.hasAttribute('data-pm-hover-label') && el.matches(MENU_ROW)) { el.setAttribute('data-pm-hover-exempt', 'menu'); return; }
    if (tip) {
      if (attr(el, 'data-pm-hover-src') === tip) return;
      var c = hoverCopy(attr(el, 'data-hover-key'), tip, attr(el, 'data-action'));
      setAttr(el, 'data-pm-hover-label', c[0]);
      setAttr(el, 'data-pm-hover-detail', c[1] || actionDetail(el, c[0]));
      setAttr(el, 'data-pm-hover-src', tip);
      return;
    }
    if (!el.hasAttribute('data-pm-hover-label') && /^(TEXTAREA|INPUT)$/.test(el.tagName) && !attr(el, 'aria-label')) {
      var ph = attr(el, 'placeholder');
      if (el.getAttribute('data-input') === 'composer') { setAttr(el, 'data-pm-hover-label', 'Message'); if (!el.hasAttribute('data-pm-hover-detail')) setAttr(el, 'data-pm-hover-detail', stop(ph || 'Write to the agent') + ' Ctrl+Enter or Cmd+Enter sends it.'); return; }
      if (ph) setAttr(el, 'data-pm-hover-label', ph);
    }
    if (!el.hasAttribute('data-pm-hover-detail')) {
      var d = actionDetail(el, attr(el, 'data-pm-hover-label') || attr(el, 'aria-label'));
      if (!d && /^(CODE|KBD|SAMP)$/.test(el.tagName)) d = 'Shown exactly as the system writes it.';
      if (!d && el.tagName === 'SUMMARY') d = 'Opens a short list of actions.';
      if (!d && !el.hasAttribute('data-pm-hover-label')) {
        var v = split(el.textContent);
        if (v[1]) { setAttr(el, 'data-pm-hover-label', v[0]); d = v[1]; }
      }
      if (d) el.setAttribute('data-pm-hover-detail', d);
    }
  }
  function install() {
    var C = window.PM_HOVER_TAG_CONTROLLER;
    if (!C || typeof C.prepare !== 'function') return false;
    if (C.__pm56HoverCopy) return true;
    var prepare = C.prepare;
    C.prepare = function (el) {
      if (el && el.nodeType === 1 && el.closest && el.closest('.pm56-host')) { try { complete(el); } catch (_) {} }
      return prepare.apply(this, arguments);
    };
    C.__pm56HoverCopy = true;
    return true;
  }
  if (!install()) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
    window.addEventListener('load', install, { once: true });
  }
})();
