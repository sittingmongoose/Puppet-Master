/* Concept-specific question stages — shared controller, eight finished compositions. */
(function () {
  'use strict';

  var RENDERER_IDS = {
    t1: 'q-folio-leaf-morph',
    t2: 'q-beat-attached',
    t3: 'q-shelf-stack',
    t4: 'q-yield-sheet',
    t5: 'q-condenser-stage',
    t6: 'q-margin-sidecar',
    t7: 'q-focus-stepper',
    t8: 'q-paired-breath'
  };

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function resolveConceptId(hint) {
    var h = String(hint || '').trim();
    if (RENDERER_IDS[h]) return h;
    if (typeof document !== 'undefined') {
      var fromDom = document.documentElement.getAttribute('data-concept-thread') || '';
      if (RENDERER_IDS[fromDom]) return fromDom;
      try {
        var qt = new URLSearchParams(window.location.search).get('t');
        if (RENDERER_IDS[qt]) return qt;
      } catch (_) {}
    }
    return h || 't1';
  }

  function icon(name) {
    return typeof window.PMIcon === 'function' ? window.PMIcon(name, 'pm-btn-icon') : '';
  }

  function optionBody(current) {
    if (!current) return '';
    if (current.kind === 'freeform') {
      return (
        '<textarea class="pm-q-input" data-q-freeform rows="3" spellcheck="true" placeholder="Your answer">' +
        escapeHtml(current.draft || '') +
        '</textarea>'
      );
    }
    var options = Array.isArray(current.options) ? current.options : [];
    var multi = String(current.kind || '').indexOf('multi') >= 0;
    var role = multi ? 'checkbox' : 'radio';
    var checkSvg = multi
      ? '<svg class="pm-q-mark-svg" viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path class="pm-q-mark-check" d="M4.2 8.2l2.4 2.4 5-5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg class="pm-q-mark-svg" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-width="1.5"/><circle class="pm-q-mark-dot" cx="8" cy="8" r="3.1" fill="currentColor"/></svg>';
    return (
      '<div class="pm-q-options pm-stagger" role="group">' +
      options
        .map(function (opt, oi) {
          var val = typeof opt === 'string' ? opt : opt.value || opt.label;
          var selected = Array.isArray(current.selected)
            ? current.selected.indexOf(val) >= 0
            : false;
          return (
            '<button type="button" class="pm-q-option' +
            (selected ? ' is-selected' : '') +
            '" role="' +
            role +
            '" aria-checked="' +
            (selected ? 'true' : 'false') +
            '" data-q-option data-q-value="' +
            escapeHtml(val) +
            '" style="--stagger-i:' +
            oi +
            '">' +
            '<span class="pm-q-ripple" aria-hidden="true"></span>' +
            '<span class="pm-q-mark" aria-hidden="true">' +
            checkSvg +
            '</span>' +
            '<span class="pm-q-option-label">' +
            escapeHtml(val) +
            '</span>' +
            '</button>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  function actionsHtml() {
    return (
      '<div class="pm-q-card-actions">' +
      '<button type="button" class="pm-btn pm-q-primary" data-q-action="submit">' +
      icon('check') +
      '<span>Submit</span></button>' +
      '<button type="button" class="pm-btn pm-btn-ghost pm-q-skip" data-q-action="skip">' +
      icon('skip') +
      '<span>Skip</span></button>' +
      '<button type="button" class="pm-btn pm-btn-ghost pm-q-cancel" data-q-action="cancel" aria-label="Cancel questionnaire" title="Cancel">' +
      icon('x') +
      '<span class="pm-q-cancel-label">Cancel</span></button>' +
      '</div>'
    );
  }

  function filmstrip(questions, idx) {
    return (
      '<nav class="pm-q-focus-strip" aria-label="Question steps">' +
      (questions || [])
        .map(function (qq, i) {
          var label = String(qq.prompt || 'Q' + (i + 1)).slice(0, 28);
          return (
            '<span class="pm-q-focus-step' +
            (i === idx ? ' is-current' : i < idx ? ' is-done' : '') +
            '" title="' +
            escapeHtml(qq.prompt || '') +
            '">' +
            (i + 1) +
            ' · ' +
            escapeHtml(label) +
            (String(qq.prompt || '').length > 28 ? '…' : '') +
            '</span>'
          );
        })
        .join('') +
      '</nav>'
    );
  }

  function meter(idx, total) {
    var bits = '';
    for (var i = 0; i < total; i++) {
      bits +=
        '<i class="' +
        (i < idx ? 'is-done' : i === idx ? 'is-current' : '') +
        '" style="--mi:' +
        i +
        '"></i>';
    }
    return '<div class="pm-q-condenser-meter" aria-hidden="true">' + bits + '</div>';
  }

  /** Per-paradigm prepare copy — distinct from open-state kickers. */
  function prepareLabel(cid) {
    switch (cid) {
      case 't1':
        return 'Preparing folio leaf…';
      case 't2':
        return 'Attaching question to beat…';
      case 't3':
        return 'Sliding shelf card in…';
      case 't4':
        return 'Yielding composer for questions…';
      case 't5':
        return 'Condensing question stage…';
      case 't6':
        return 'Marking margin callout…';
      case 't7':
        return 'Focusing question turn…';
      case 't8':
        return 'Inhale · preparing paired prompt…';
      default:
        return 'Preparing questions…';
    }
  }

  /**
   * Shared stage shell. Prepare vs open choreography (Video 04):
   * - prepare: is-pill + is-preparing + data-q-phase=prepare (pill visible, open chrome latent)
   * - open: is-expanded + data-q-phase=open (pill hidden, head/carousel/actions live)
   * - submit: is-pill + is-submitting (compress toward pill)
   * armQuestionnaireMorph drives prepare→expand; settle drives submit→compress.
   * phase='preparing' from harness/store is visualized here (not open chrome).
   */
  function coreStage(q, cid, headHtml, extraClass) {
    var idx = q.currentQuestionIndex | 0;
    var questions = q.questions || [];
    var total = questions.length;
    var current = questions[idx] || questions[0];
    if (!current) return '';
    var id = RENDERER_IDS[cid] || 'q-shared-fallback';
    var phase = q.phase === 'preparing' ? 'prepare' : q.phase === 'submitting' ? 'submit' : 'open';
    var phaseClass =
      phase === 'prepare'
        ? 'is-pill is-preparing pm-q-phase-prepare'
        : phase === 'submit'
          ? 'is-pill is-submitting pm-q-phase-submit'
          : 'is-expanded pm-q-phase-open';
    var prepareActive = phase !== 'open';
    return (
      '<section class="pm-q-stage ' +
      phaseClass +
      ' pm-q-card pm-q-paradigm-' +
      escapeHtml(cid) +
      (extraClass ? ' ' + extraClass : '') +
      '" data-questionnaire-id="' +
      escapeHtml(q.id) +
      '" data-question-id="' +
      escapeHtml(current.id) +
      '" data-q-index="' +
      idx +
      '" data-q-renderer="' +
      escapeHtml(id) +
      '" data-q-concept="' +
      escapeHtml(cid) +
      '" data-q-phase="' +
      escapeHtml(phase) +
      '" data-q-prepare="' +
      (prepareActive ? '1' : '0') +
      '" data-q-morph-path="prepare→expand→submit→compress">' +
      '<div class="pm-q-pill" data-q-pill data-q-prepare-chrome aria-hidden="' +
      (prepareActive ? 'false' : 'true') +
      '">' +
      '<span class="pm-q-pill-label" data-q-pill-label>' +
      escapeHtml(prepareLabel(cid)) +
      '</span>' +
      '<span class="pm-q-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
      '</div>' +
      '<div class="pm-q-open-chrome" data-q-open-chrome aria-hidden="' +
      (prepareActive ? 'true' : 'false') +
      '">' +
      headHtml +
      '<div class="pm-q-carousel">' +
      '<div class="pm-q-carousel-pane" data-q-pane>' +
      '<div class="pm-q-card-prompt">' +
      escapeHtml(current.prompt || '') +
      '</div>' +
      optionBody(current) +
      '</div></div>' +
      actionsHtml() +
      '</div>' +
      '</section>'
    );
  }

  function renderStage(conceptHint, q) {
    if (!q) return '';
    var cid = resolveConceptId(conceptHint);
    var idx = q.currentQuestionIndex | 0;
    var questions = q.questions || [];
    var total = Math.max(1, questions.length);
    var progress = idx + 1 + ' of ' + total;

    if (cid === 't1') {
      return (
        '<div class="pm-q-struct pm-q-struct-folio" data-q-struct="folio">' +
        '<div class="pm-q-folio-spine" aria-hidden="true"></div>' +
        coreStage(
          q,
          cid,
          '<div class="pm-q-card-head">' +
            '<span class="pm-q-card-kicker">Folio leaf</span>' +
            '<span class="pm-q-card-progress">' +
            progress +
            '</span></div>',
          'pm-q-folio-leaf'
        ) +
        '</div>'
      );
    }
    if (cid === 't2') {
      return (
        '<div class="pm-q-struct pm-q-struct-beat" data-q-struct="beat">' +
        '<aside class="pm-q-beat-rail" aria-hidden="true"><span class="pm-q-beat-dot" data-q-beat-dot></span></aside>' +
        '<div class="pm-q-beat-body">' +
        coreStage(
          q,
          cid,
          '<div class="pm-q-card-head">' +
            '<span class="pm-q-card-kicker">Beat ' +
            (idx + 1) +
            '</span>' +
            '<span class="pm-q-card-progress">' +
            progress +
            '</span></div>',
          'pm-q-beat-card'
        ) +
        '</div></div>'
      );
    }
    if (cid === 't3') {
      return (
        '<div class="pm-q-struct pm-q-struct-shelf" data-q-struct="shelf">' +
        '<div class="pm-q-shelf-edge" aria-hidden="true"></div>' +
        coreStage(
          q,
          cid,
          '<div class="pm-q-card-head">' +
            '<span class="pm-q-card-kicker">Shelf card</span>' +
            '<span class="pm-q-card-progress">' +
            progress +
            '</span></div>',
          'pm-q-shelf-card'
        ) +
        '</div>'
      );
    }
    if (cid === 't4') {
      return (
        '<div class="pm-q-struct pm-q-struct-yield" data-q-struct="yield">' +
        '<header class="pm-q-yield-banner">' +
        '<span>Yield · answer to continue</span>' +
        '<span class="pm-q-card-progress">' +
        progress +
        '</span></header>' +
        coreStage(q, cid, '', 'pm-q-yield-card') +
        '</div>'
      );
    }
    if (cid === 't5') {
      return (
        '<div class="pm-q-struct pm-q-struct-condenser" data-q-struct="condenser">' +
        meter(idx, total) +
        coreStage(
          q,
          cid,
          '<div class="pm-q-card-head">' +
            '<span class="pm-q-card-kicker">Condenser stage</span>' +
            '<span class="pm-q-card-progress">' +
            progress +
            '</span></div>',
          'pm-q-condenser-card'
        ) +
        '</div>'
      );
    }
    if (cid === 't6') {
      return (
        '<div class="pm-q-struct pm-q-struct-margin" data-q-struct="margin">' +
        '<aside class="pm-q-margin-glyph" aria-hidden="true" data-q-margin-mark>' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 5h12v14H4z"/><path d="M8 9h8M8 13h6"/></svg>' +
        '</aside>' +
        '<div class="pm-q-margin-col">' +
        coreStage(
          q,
          cid,
          '<div class="pm-q-card-head">' +
            '<span class="pm-q-card-kicker">Margin callout</span>' +
            '<span class="pm-q-card-progress">' +
            progress +
            '</span></div>',
          'pm-q-margin-card'
        ) +
        '</div></div>'
      );
    }
    if (cid === 't7') {
      return (
        '<div class="pm-q-struct pm-q-struct-focus" data-q-struct="focus">' +
        filmstrip(questions, idx) +
        coreStage(
          q,
          cid,
          '<div class="pm-q-card-head">' +
            '<span class="pm-q-card-kicker">Focus turn</span>' +
            '<span class="pm-q-card-progress">' +
            progress +
            '</span></div>',
          'pm-q-focus-card'
        ) +
        '</div>'
      );
    }
    /* t8 breath */
    return (
      '<div class="pm-q-struct pm-q-struct-breath" data-q-struct="breath">' +
      '<div class="pm-q-breath-inhale">' +
      coreStage(
        q,
        't8',
        '<div class="pm-q-card-head">' +
          '<span class="pm-q-card-kicker">Inhale</span>' +
          '<span class="pm-q-card-progress">' +
          progress +
          '</span></div>',
        'pm-q-breath-card'
      ) +
      '</div>' +
      '<div class="pm-q-breath-exhale" data-q-exhale aria-hidden="true">' +
      '<span class="pm-q-breath-hint">Exhale · composer draft stays intact until Cancel or Submit</span>' +
      '</div></div>'
    );
  }

  function renderForThread(threadOrConceptId, q, baseRenderFn) {
    var cid = resolveConceptId(threadOrConceptId);
    if (q) return renderStage(cid, q);
    return typeof baseRenderFn === 'function' ? baseRenderFn(q) : '';
  }

  window.PMChatQRenderers = {
    ids: RENDERER_IDS,
    resolveConceptId: resolveConceptId,
    renderStage: renderStage,
    renderForThread: renderForThread,
    rendererId: function (tid) {
      return RENDERER_IDS[resolveConceptId(tid)] || 'q-shared-fallback';
    }
  };
})();
