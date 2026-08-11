/* PMX reveal — Opus 5
 *
 * Choreography for surfaces that TAKE THE FLOOR: the questionnaire above all,
 * plus todo completion and goal state changes.
 *
 * WHY THIS IS IDENTITY-KEYED, WHICH IS THE WHOLE DESIGN
 * ----------------------------------------------------
 * shared/questionnaire.js emits no events. Concepts learn about changes only by
 * re-rendering, and _renderQuestionBody() empties its host and rebuilds the card
 * from scratch on EVERY answer, skip, next and prev — including on every
 * keystroke in a freeform textarea, because typing writes a draft through the
 * store and the store notifies.
 *
 * So "animate when the element is appended" is wrong: it would replay the whole
 * entrance on every character typed. Instead the caller passes a key identifying
 * WHICH QUESTION is on screen (record id + question id). The choreography is
 * chosen by comparing that key to the one held on the host:
 *
 *   same key                 -> silent rebuild, no motion   (the keystroke case)
 *   no previous key, has key -> entrance                    (capsule then card)
 *   different key            -> advance                     (height spring + cascade)
 *   had key, now none        -> collapse                    (card back to capsule)
 *
 * Everything here returns to the correct final state synchronously under reduced
 * motion, per the two-part contract in motion.css and motion.js.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  function M() { return global.PMXMotion; }

  var KEY_ATTR = 'data-pmx-reveal-key';
  var CAPSULE_MS = 460;

  function reduced(el) {
    return !!(M() && M().reduced ? M().reduced(el) : false);
  }

  /* Stagger indices for the cascade. The container carries .pmx-cascade and each
   * child gets --pmx-i; motion.css turns that into a capped delay ladder. */
  function stagger(container, items) {
    if (!container) return;
    container.classList.add('pmx-cascade');
    for (var i = 0; i < items.length; i++) {
      items[i].style.setProperty('--pmx-i', String(i));
    }
  }

  function clearStagger(container, items) {
    if (!container) return;
    container.classList.remove('pmx-cascade');
    for (var i = 0; i < items.length; i++) items[i].style.removeProperty('--pmx-i');
  }

  /* One-shot class: remove, force reflow, add, clean up on a timer. The reflow is
   * required — re-adding a class in the same frame it was removed does not
   * restart the animation. */
  function oneShot(el, cls, ms) {
    if (!el || reduced(el)) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    global.setTimeout(function () { el.classList.remove(cls); }, ms);
  }

  /* FLIP height spring. Measure, lock, mutate already happened (the caller
   * rebuilt the DOM), so this takes the previous height explicitly and springs
   * from it to the natural height. */
  function springHeight(el, fromHeight, onDone) {
    if (!el) { if (onDone) onDone(); return; }
    if (reduced(el)) { el.style.height = ''; el.style.overflow = ''; if (onDone) onDone(); return; }

    var to = el.getBoundingClientRect().height;
    if (Math.abs(to - fromHeight) < 0.5) { if (onDone) onDone(); return; }

    el.style.overflow = 'hidden';
    el.style.height = fromHeight + 'px';
    void el.offsetHeight;
    el.classList.add('pmx-reveal-springing');
    el.style.height = to + 'px';

    M().afterTransition(el, 'height', function () {
      el.style.height = '';
      el.style.overflow = '';
      el.classList.remove('pmx-reveal-springing');
      if (onDone) onDone();
    }, 700);
  }

  /* The capsule that stands in for the card while work is notionally happening.
   * Built here rather than by each concept so all eight read identically. */
  function buildCapsule(text, ctx) {
    var cap = U().el('div', { class: 'pmx-reveal-capsule' });
    var spin = U().el('span', { class: 'pmx-reveal-spinner pmx-spin' });
    if (ctx && ctx.services && ctx.services.icons) {
      spin.appendChild(ctx.services.icons.get('ring', 14));
    }
    cap.appendChild(U().el('span', { class: 'pmx-reveal-capsule-text', text: text }));
    cap.appendChild(spin);
    return cap;
  }

  var PMXReveal = {

    /* Called by a thread concept immediately AFTER it has rebuilt the question
     * body. Must be called outside the _inRenderQuestion guard.
     *
     * spec: { host, key, card, options[], title, ctx }
     *   host    - the container the concept renders into
     *   key     - recordId + '/' + questionId, or null when no question is active
     *   card    - the question card element (may be null when key is null)
     *   options - option row elements to cascade (may be empty)
     */
    question: function (spec) {
      if (!spec || !spec.host) return;
      var host = spec.host;
      var prev = host.getAttribute(KEY_ATTR) || '';
      var key = spec.key || '';
      var card = spec.card || null;
      var options = spec.options || [];

      /* Nothing about WHICH question changed. This is the keystroke path and it
       * must stay completely silent, or typing would replay the entrance. */
      if (prev === key) return;

      host.setAttribute(KEY_ATTR, key);

      if (reduced(host)) return;              /* correct final state already rendered */

      /* Card went away entirely. */
      if (prev && !key) {
        this.collapse(host, spec.ctx);
        return;
      }

      if (!card) return;

      if (!prev && key) {
        /* ENTRANCE. Anticipation first — the card gathers itself before it
         * expands, which is what stops the growth reading as a jump cut. */
        card.classList.add('pmx-reveal-enter');
        oneShot(card, 'pmx-anticipate', 260);
        stagger(spec.optionsHost || card, options);
        global.setTimeout(function () {
          card.classList.remove('pmx-reveal-enter');
          clearStagger(spec.optionsHost || card, options);
        }, 900);
        return;
      }

      /* ADVANCE between questions: the box springs to the new height while the
       * new rows cascade in behind it. Overlapping action — the container and
       * its contents deliberately do not finish together. */
      var from = spec._fromHeight;
      stagger(spec.optionsHost || card, options);
      if (typeof from === 'number') springHeight(card, from, null);
      global.setTimeout(function () {
        clearStagger(spec.optionsHost || card, options);
      }, 900);
    },

    /* Measure before the caller empties the host, so the advance has something to
     * spring FROM. Returns a number or undefined. */
    measure: function (el) {
      if (!el) return undefined;
      var r = el.getBoundingClientRect();
      return r.height || undefined;
    },

    /* Identity of the question currently on screen. Everything hinges on this:
     * it changes when the user moves to a different question and does NOT change
     * when they type into the current one. */
    keyFor: function (svc, tid) {
      if (!svc || !svc.questionnaire || !svc.questionnaire.activeFor) return '';
      var q = svc.questionnaire.activeFor(tid);
      if (!q) return '';
      var idx = svc.questionnaire.currentIndex
        ? svc.questionnaire.currentIndex(q.id)
        : (q.currentQuestionIndex || 0);
      var question = (q.questions || [])[idx];
      return question ? (q.id + '/' + question.id) : '';
    },

    /* The single call a thread concept makes after rebuilding its question body.
     * Deriving the card and option rows from the DOM keeps this concept-agnostic:
     * every concept names its classes differently, but option rows are uniformly
     * buttons carrying aria-pressed, which is a contract worth relying on. */
    afterRender: function (host, svc, tid, fromHeight) {
      if (!host) return;
      var card = host.firstElementChild;
      var options = card ? card.querySelectorAll('button[aria-pressed]') : [];
      options = Array.prototype.slice.call(options);
      var optionsHost = options.length ? options[0].parentNode : null;

      this.question({
        host: host,
        key: this.keyFor(svc, tid),
        card: card,
        options: options,
        optionsHost: optionsHost,
        ctx: { services: svc },
        _fromHeight: fromHeight
      });
    },

    /* Card -> capsule, used on submit. The capsule is transient; the concept's
     * next render replaces whatever is here. */
    collapse: function (host, ctx) {
      if (!host || reduced(host)) return;
      var cap = buildCapsule('Submitting answers', ctx);
      cap.classList.add('pmx-reveal-capsule-in');
      host.appendChild(cap);
      global.setTimeout(function () {
        if (cap.parentNode) cap.parentNode.removeChild(cap);
      }, CAPSULE_MS + 260);
    },

    /* A ripple originating at the pointer. hoverglow.js already writes
     * --pmx-mx/--pmx-my on hovered rows, but a click carries its own coordinates,
     * so use those when present and fall back to the element centre. */
    ripple: function (el, ev) {
      if (!el || reduced(el)) return;
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;

      var x = (ev && typeof ev.clientX === 'number') ? ev.clientX - r.left : r.width / 2;
      var y = (ev && typeof ev.clientY === 'number') ? ev.clientY - r.top : r.height / 2;

      /* Radius must reach the furthest corner or the ripple visibly stops short. */
      var far = Math.max(
        Math.hypot(x, y), Math.hypot(r.width - x, y),
        Math.hypot(x, r.height - y), Math.hypot(r.width - x, r.height - y)
      );

      var dot = U().el('span', { class: 'pmx-ripple' });
      dot.style.left = (x - far) + 'px';
      dot.style.top = (y - far) + 'px';
      dot.style.width = dot.style.height = (far * 2) + 'px';

      var cs = global.getComputedStyle(el);
      if (cs.position === 'static') el.style.position = 'relative';
      el.appendChild(dot);
      global.setTimeout(function () {
        if (dot.parentNode) dot.parentNode.removeChild(dot);
      }, 620);
    },

    /* The confirmation beat. One shot, never chained. */
    celebrate: function (el) { oneShot(el, 'pmx-celebrate', 700); },

    /* Marks the row that just changed — the "that took effect" signal. */
    changed: function (el) { oneShot(el, 'pmx-changed', 1000); },

    /* Rejected input, e.g. submitting with a required question unanswered. */
    reject: function (el) { oneShot(el, 'pmx-shake', 400); }
  };

  global.PMXReveal = PMXReveal;
})(window);
