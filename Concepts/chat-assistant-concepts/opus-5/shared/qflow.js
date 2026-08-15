/* PMX question flow - Opus 5
 *
 * THE ACTION LAYER FOR QUESTIONNAIRES. RENDERS NOTHING. OWNS NO DOM.
 *
 * `shared/reveal.js` used to own the question *choreography* for all eight thread concepts, which is
 * why every concept's questionnaire looked and moved identically. That was deleted: each concept now
 * composes primitives in its own order, and the eight question systems are genuinely different forms.
 *
 * This file is the opposite kind of sharing, and the distinction is the whole point:
 *
 *   reveal.afterRender()  decided WHAT THE QUESTION LOOKED LIKE  -> deleted, correctly
 *   qflow.act()           decides WHAT A VERB MEANS              -> shared, correctly
 *
 * A question form is a design decision that must differ per concept. "What does Skip do to the store,
 * and where does a refusal belong" is not: it is one behaviour with one right answer, and eight copies
 * of it is eight chances to get it subtly wrong. Building t3 first proved that concretely - three of
 * the four defects found there were in this plumbing, not in the spine form:
 *
 *   1. the skip map is keyed by a NUL-delimited composite, so a hand-rolled key never matched;
 *   2. only Cancel ever released `surfacesYielded`, so a SUBMITTED flow left the work surfaces
 *      yielded for the rest of the session and the cluster never came back;
 *   3. `submit()` refuses with the offending question's own reason, and a renderer that shows that
 *      reason where the button was - rather than at the field that caused it - is the toast behaviour
 *      the packet forbids, wearing different clothes.
 *
 * So: verbs live here, forms live in the concepts. Every function returns plain data. Nothing in this
 * file touches an element, a class, or a style.
 *
 * Contract: CONTRACT.md section 4 (services are reached through ctx.services) and section 5 (the store
 * is the only source of truth).
 */
(function (global) {
  'use strict';

  /* read(svc, threadId) -> the complete renderable state of the current flow.
   *
   * ONE read per render pass. A concept must not call questionnaire.activeFor and then separately ask
   * for the index, the end state and the skip flags: that is four reads that can disagree with each
   * other if anything mutates between them. */
  function read(svc, threadId) {
    var Q = svc && svc.questionnaire;
    if (!Q) return null;

    var record = Q.activeFor(threadId);
    if (!record) {
      /* No live flow. The receipt of the last resolved one is still renderable, and every concept
       * needs it: a resolved questionnaire must leave a durable mark in the transcript. */
      return { record: null, receipt: lastReceipt(svc, threadId) };
    }

    var questions = record.questions || [];
    var idx = Q.currentIndex(record.id);

    return {
      record: record,
      id: record.id,
      status: record.status || 'active',
      questions: questions,
      index: idx,
      total: questions.length,
      atEnd: Q.atEnd(record.id),
      /* The question to render. At the terminal index this is still the last question, so a concept
       * that keeps the card up while offering Submit shows the right card. */
      question: questions[idx] || null,
      /* Progress counts VISITED questions, not answered ones: the label reads "2 of 3" while you are
       * standing on the second, which is what a reader expects it to mean. */
      position: Math.min(idx + 1, questions.length),
      answeredCount: countAnswered(questions),
      skippedCount: countSkipped(Q, record.id, questions),
      isSkipped: function (question) { return !!Q.isSkipped(record.id, (question && question.id) || question); },
      /* The write-in row is part of the renderable state, not a separate lookup: a concept that had to
       * ask the questionnaire service directly would be a second reader of the flow, which is the
       * exact thing read() exists to prevent. Null when the question declares no write-in. */
      writeIn: function (question) {
        var q2 = question || questions[idx];
        if (!q2 || !q2.writeIn) return null;
        return {
          label: q2.writeInLabel || 'Something else',
          value: Q.writeInFor ? Q.writeInFor(record.id, q2.id) : null
        };
      },
      receipt: null
    };
  }

  function isAnswered(question) {
    if (!question) return false;
    if (question.kind === 'freeform') return !!(question.draft && String(question.draft).trim());
    return !!(question.selected && question.selected.length);
  }

  function countAnswered(questions) {
    var n = 0;
    for (var i = 0; i < questions.length; i++) if (isAnswered(questions[i])) n++;
    return n;
  }

  function countSkipped(Q, qid, questions) {
    var n = 0;
    for (var i = 0; i < questions.length; i++) if (Q.isSkipped(qid, questions[i].id)) n++;
    return n;
  }

  function lastReceipt(svc, threadId) {
    var Q = svc && svc.questionnaire;
    var history = Q && Q.historyFor ? Q.historyFor(threadId) : null;
    if (!history || !history.length) return null;
    var last = history[history.length - 1];
    if (!last || !last.receipt) return null;

    var answers = last.receipt.answers || {};
    var answered = 0;
    for (var k in answers) if (Object.prototype.hasOwnProperty.call(answers, k)) answered++;

    return {
      record: last,
      status: last.receipt.status,
      cancelled: last.receipt.status === 'cancelled',
      answered: answered,
      skipped: (last.receipt.skipped || []).length,
      answers: answers,
      questions: last.questions || [],
      at: last.receipt.at
    };
  }

  /* act(svc, threadId, verb, arg) -> { ok, reason, offenderIndex, resolved, cancelled }
   *
   * Every verb the packet requires, with the refusal contract the concepts render:
   *
   *   ok:false + reason        -> show `reason` VERBATIM at the field for `offenderIndex`
   *   ok:true  + resolved      -> the flow is over; render the receipt
   *
   * `reason` is never rewritten here. The words come from the service so eight concepts cannot drift
   * into eight phrasings of one refusal.
   */
  function act(svc, threadId, verb, arg) {
    var Q = svc && svc.questionnaire;
    if (!Q) return { ok: false, reason: null };

    var record = Q.activeFor(threadId);
    if (!record) return { ok: false, reason: null };

    var qid = record.id;
    var questions = record.questions || [];
    var idx = Q.currentIndex(qid);
    var current = questions[idx] || null;

    switch (verb) {
      case 'answer':
        if (!current) return { ok: false, reason: null };
        Q.answer(qid, current.id, arg);
        return { ok: true };

      case 'answerAt':
        /* arg: { index, value }. Concepts that render every question at once (a monospace field form,
         * a prose list) answer a question that is not the current one. */
        if (!arg || typeof arg.index !== 'number') return { ok: false, reason: null };
        var at = questions[arg.index];
        if (!at) return { ok: false, reason: null };
        Q.answer(qid, at.id, arg.value);
        return { ok: true };

      case 'skip':
        if (!current) return { ok: false, reason: null };
        return { ok: Q.skip(qid, current.id) !== false };

      case 'unskip':
        /* arg is a question INDEX: unskipping is reached from a question other than the current one,
         * so it cannot use `current`. Landing on the unskipped question is part of the verb - an
         * unskip that leaves you standing somewhere else has not given the question back. */
        if (typeof arg !== 'number') return { ok: false, reason: null };
        var target = questions[arg];
        if (!target) return { ok: false, reason: null };
        Q.unskip(qid, target.id);
        Q.goTo(qid, arg);
        return { ok: true };

      case 'goto':
        if (typeof arg !== 'number') return { ok: false, reason: null };
        Q.goTo(qid, arg);
        return { ok: true };

      case 'prev':
        Q.prev(qid);
        return { ok: true };

      case 'next':
        var adv = Q.next(qid);
        /* next() VALIDATES before advancing and hands back the refusal rather than throwing, so the
         * complaint belongs at the question you are standing on. */
        if (adv && adv.ok === false) return { ok: false, reason: adv.reason, offenderIndex: idx };
        return { ok: true };

      case 'submit':
        var res = Q.submit(qid);
        if (!res.ok) {
          /* The refusal names the offending question. Route the caller to it so the reason renders at
           * that field instead of under a Submit button three questions away. */
          var offender = (res.missingRequired || [])[0];
          var oid = offender && (offender.id || offender);
          var found = -1;
          for (var i = 0; i < questions.length; i++) if (questions[i].id === oid) { found = i; break; }
          if (found >= 0) Q.goTo(qid, found);
          return { ok: false, reason: res.reason, offenderIndex: found >= 0 ? found : idx };
        }
        /* Two-step by design: submit() parks the record in `submitting` for SUBMIT_MS so a concept
         * can compress its card, and finishSubmit() settles it.
         *
         * Settling in the same call is what made that beat unobservable: `submitting` existed in the
         * state machine and never reached a screen, so the symmetry
         * 04_questionnaire_morph_prepare_submit.mov is built on — a pill grows into the card, the
         * card shrinks back into the same pill, the pill dissolves — had no middle.
         *
         * The synchronous settle stays the DEFAULT, because every caller in this workspace treats
         * `resolved` as its cue to condense the flow into its receipt, and making them all wait on a
         * timer would be a behaviour change dressed as a fix. `arg.beat` opts into the observable
         * middle: the record rests in `submitting` and a timer owned HERE settles it, because the
         * settle must also release the work surfaces and nothing else knows they were claimed. */
        if (!arg || !arg.beat) {
          Q.finishSubmit(qid);
          release(svc, threadId);
          return { ok: true, resolved: true };
        }
        (function (qidAtSubmit, tidAtSubmit) {
          global.setTimeout(function () {
            /* Re-check before settling: the flow may have been cancelled, reset by the Director, or
             * replaced while the beat was playing, and finishing a record that is no longer the live
             * one would resolve somebody else's questionnaire. */
            var live = Q.activeFor(tidAtSubmit);
            if (!live || live.id !== qidAtSubmit || live.status !== 'submitting') {
              release(svc, tidAtSubmit);
              return;
            }
            Q.finishSubmit(qidAtSubmit);
            release(svc, tidAtSubmit);
          }, Q.SUBMIT_MS || 700);
        })(qid, threadId);
        return { ok: true, submitting: true };

      case 'cancel':
        Q.cancel(qid);
        release(svc, threadId);
        return { ok: true, resolved: true, cancelled: true };
    }

    return { ok: false, reason: null };
  }

  /* release(svc, threadId) - hand the work surfaces back.
   *
   * A pending question yields them; a resolved one must give them back. Before this existed only the
   * Cancel path released the yield, so a SUBMITTED flow left `surfacesYielded` true and every reader of
   * surfaces.activeFor - the thread's own work cluster, and any window chrome that asks - saw an empty
   * thread for the rest of the session. */
  function release(svc, threadId) {
    if (svc.surfaces && svc.surfaces.yieldForQuestion) svc.surfaces.yieldForQuestion(threadId, false);
  }

  /* claim(svc, threadId) - take the work surfaces for a pending question. */
  function claim(svc, threadId) {
    if (svc.surfaces && svc.surfaces.yieldForQuestion) svc.surfaces.yieldForQuestion(threadId, true);
  }

  /* pending(svc, threadId) -> boolean.
   *
   * The AUTHORITATIVE answer to "must the work surfaces stand aside", and the reason it exists:
   * `surfacesYielded` is written by the question renderer, but every concept's update() renders its
   * work surfaces FIRST. Reading the flag there paints the whole cluster for one frame before the
   * question displaces it, and any group the user had open appears to close itself. */
  function pending(svc, threadId) {
    var Q = svc && svc.questionnaire;
    return !!(Q && Q.activeFor(threadId));
  }

  global.PMXQFlow = {
    read: read,
    act: act,
    pending: pending,
    claim: claim,
    release: release,
    isAnswered: isAnswered
  };
})(window);
