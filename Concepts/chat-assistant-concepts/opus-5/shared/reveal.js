/* PMX reveal — Opus 5
 *
 * PRIMITIVES ONLY. This file used to own the entire question choreography for all eight thread
 * concepts through `question(spec)` and `afterRender(host, svc, tid, from)`: one function decided
 * the entrance, the advance and the collapse, and every concept called it. That made the eight
 * concepts identical in the one place the packet most insists they differ
 * (07_DEMO_FIXTURES_MOTION_AND_TEST_GATE.md:93 makes a shared question solution a hard failure), and
 * it is why both functions are DELETED rather than deprecated.
 *
 * What remains is a primitive set with no opinion about order:
 *
 *   measure(el)                  -> height, for a FLIP that has already mutated the DOM
 *   springHeight(el, from, done)  the FLIP itself
 *   stagger / clearStagger        the cascade delay ladder
 *   oneShot(el, cls, ms)          restartable one-shot class
 *   ripple(el, ev)                pointer-origin ripple
 *   reject(el) / celebrate(el) / changed(el)   three named beats
 *   capsule(text, ctx)            the "work is happening" stand-in, still shared because it is a
 *                                 material, not a choreography
 *   keyFor(svc, tid)              question identity, so a concept can tell "different question"
 *                                 from "same question, one more keystroke"
 *
 * WHY keyFor STAYS SHARED
 * ----------------------
 * `shared/questionnaire.js` emits no events, so a concept learns about changes by re-rendering, and
 * a freeform textarea re-renders on every keystroke (typing writes a draft, the draft notifies).
 * Every concept therefore needs the same question: did the IDENTITY of the visible question change?
 * That is a pure computation over the record, identical everywhere, and duplicating it eight times
 * would be a real clone. What each concept now owns is what it DOES with the answer.
 *
 * Everything here returns to the correct final state synchronously under reduced motion, per the
 * two-part contract in motion.css and motion.js.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  function M() { return global.PMXMotion; }

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

  /* Measure before the caller empties the host, so an advance has something to spring FROM.
   * Returns a number or undefined. */
  function measure(el) {
    if (!el) return undefined;
    var r = el.getBoundingClientRect();
    return r.height || undefined;
  }

  /* FLIP height spring. Measure, lock, mutate already happened (the caller
   * rebuilt the DOM), so this takes the previous height explicitly and springs
   * from it to the natural height. */
  function springHeight(el, fromHeight, onDone) {
    if (!el) { if (onDone) onDone(); return; }
    if (reduced(el)) { el.style.height = ''; el.style.overflow = ''; if (onDone) onDone(); return; }

    var to = el.getBoundingClientRect().height;
    if (typeof fromHeight !== 'number' || Math.abs(to - fromHeight) < 0.5) { if (onDone) onDone(); return; }

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

  /* The capsule that stands in for the card while work is notionally happening. Still shared
   * because it is a MATERIAL — a small surface with a label and a spinner — and not a
   * choreography. Where it appears, how it grows and what it becomes are the concept's business. */
  function capsule(text, ctx) {
    var cap = U().el('div', { class: 'pmx-reveal-capsule' });
    var spin = U().el('span', { class: 'pmx-reveal-spinner pmx-spin' });
    if (ctx && ctx.services && ctx.services.icons) {
      spin.appendChild(ctx.services.icons.get('ring', 14));
    }
    cap.appendChild(U().el('span', { class: 'pmx-reveal-capsule-text', text: text }));
    cap.appendChild(spin);
    return cap;
  }

  /* Identity of the question currently on screen. It changes when the user moves to a different
   * question and does NOT change when they type into the current one. */
  function keyFor(svc, tid) {
    if (!svc || !svc.questionnaire || !svc.questionnaire.activeFor) return '';
    var q = svc.questionnaire.activeFor(tid);
    if (!q) return '';
    var idx = svc.questionnaire.currentIndex
      ? svc.questionnaire.currentIndex(q.id)
      : (q.currentQuestionIndex || 0);
    var question = (q.questions || [])[idx];
    /* The record's phase is part of the identity: preparing and active are the same question but
     * different surfaces, and a concept that morphs between them has to see the change. */
    var phase = q.status || 'active';
    return question ? (q.id + '/' + question.id + '/' + phase) : (q.id + '//' + phase);
  }

  /* A ripple originating at the pointer. hoverglow.js already writes
   * --pmx-mx/--pmx-my on hovered rows, but a click carries its own coordinates,
   * so use those when present and fall back to the element centre. */
  function ripple(el, ev) {
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
  }

  global.PMXReveal = {
    /* geometry */
    measure: measure,
    springHeight: springHeight,
    /* cascade */
    stagger: stagger,
    clearStagger: clearStagger,
    /* one-shot beats */
    oneShot: oneShot,
    celebrate: function (el) { oneShot(el, 'pmx-celebrate', 700); },
    changed: function (el) { oneShot(el, 'pmx-changed', 1000); },
    reject: function (el) { oneShot(el, 'pmx-shake', 400); },
    ripple: ripple,
    /* materials and identity */
    capsule: capsule,
    keyFor: keyFor,
    reduced: reduced
  };
})(window);
