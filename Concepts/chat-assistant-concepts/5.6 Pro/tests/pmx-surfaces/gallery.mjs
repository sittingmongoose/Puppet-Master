/* pmx gallery surfaces: every pmx primitive rendered inside the real app from the
   PM56_SHELL builders (and the preserved PM56_PICKERS triggers), through throwaway
   slots gated on window.__PMXG. Used by tests/pmx-verify.mjs (these surfaces) and
   tests/pmx-gallery.mjs (the screenshots). Nothing here touches real threads other
   than the demo's 'plain' thread, whose messages it replaces on a private page.

   Surfaces: gallery:sheet-crew-{1,3,4,5,8}, gallery:sheet-crew-advanced,
   gallery:sheet-std, gallery:sheet-confirm, gallery:sheet-compact,
   gallery:sheet-specimens, gallery:chat (the long-chat stack with every density,
   the dock and the in-reply primitives), gallery:card-<density> (one card alone),
   gallery:view (the run view), gallery:view-participant. */

/* ------------------------------------------------------------------ in the page
   Serialized with Function#toString and injected once per page: no module scope. */
export function galleryInPage() {
  'use strict';
  if (window.__PMXG) return;
  var S = window.PM56_SHELL, P = window.PM56_PICKERS, E = window.PM56_EXT;
  var PP = S.pmxPlateParts;
  function G(n, size) { return S.pmxGlyph(n, size); }
  var X = window.__PMXG = { tick: 0, phase: 0, stream: null, dock: false, guide: false, sheet: null, items: 'stack', calls: {} };

  /* coverage: count every call of a pmx builder so pmx-gallery can prove it rendered all of them */
  Object.keys(S).forEach(function (n) {
    if (n.indexOf('pmx') !== 0 || typeof S[n] !== 'function' || n === 'pmxInert' || n === 'pmxLangName' || n === 'pmxHash') return;
    var f = S[n]; X.calls[n] = 0;
    S[n] = function () { X.calls[n]++; return f.apply(this, arguments); };
  });
  Object.keys(PP).forEach(function (n) {
    if (typeof PP[n] !== 'function' || n === 'hatch' || n === 'glyph') return;
    var f = PP[n], key = 'pmxPlateParts.' + n; X.calls[key] = 0;
    PP[n] = function () { X.calls[key]++; return f.apply(this, arguments); };
  });
  X.uncovered = function () { return Object.keys(X.calls).filter(function (n) { return !X.calls[n]; }); };

  function mark(role, seat, size, state, standin) { return S.pmxMark({ role: role, seat: seat, size: size, state: state, standin: standin }); }
  /* IMPACT A2-14: every sentence with a time, a cost, a stand-in, a clamp or a refusal comes from the phrase
     primitives, as the lanes must write it (no local formatter in the fixture either) */
  var T = S.pmxTime;
  var STAND_IN = { requested: 'Qwen 3.8 Coder', effective: 'Qwen 3.8', reason: 'offline' };
  var STAND = S.pmxStandIn(STAND_IN) || {};
  var CLAMP = S.pmxClamp({ asked: 3, runs: 2, unit: 'at a time' }) || {};
  function pick(list, i) { return list[((i % list.length) + list.length) % list.length]; }
  function clock(sec) { return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
  function esc(s) { return S.esc(String(s == null ? '' : s)); }

  /* ================================================================ sheets */
  var HELPERS = [
    { k: 'r1', role: 'builder', seat: 1, job: 'Data mapper', model: 'sonnet46', persona: 'Implementer', sub: 'Sonnet 4.6' },
    { k: 'r2', role: 'checker', seat: 2, job: 'CSV specialist', model: 'opus5', persona: 'Reviewer', sub: 'Opus 5' },
    { k: 'r3', role: 'builder', seat: 3, job: 'Integrator', model: 'qwen38-coder', persona: 'Implementer', sub: 'Qwen 3.8 · stands in', standin: true },
    { k: 'r4', role: 'architect', seat: 4, job: 'Schema check', model: 'opus5', persona: 'Architect', sub: 'Opus 5' },
    { k: 'r5', role: 'product', seat: 5, job: 'Docs note', model: 'sonnet46', persona: 'Product Manager', sub: 'Sonnet 4.6' },
    { k: 'r6', role: 'checker', seat: 6, job: 'Tester', model: 'sonnet46', persona: 'Reviewer', sub: 'Sonnet 4.6' },
    { k: 'r7', role: 'adversarial', seat: 7, job: 'Edge cases', model: 'opus5', persona: 'Adversarial Review', sub: 'Opus 5' },
    { k: 'r8', role: 'builder', seat: 8, job: 'Perf pass', model: 'sonnet46', persona: 'Implementer', sub: 'Sonnet 4.6' }
  ];
  var CAP = 2;
  /* 6.3 yield order (review cycle 1): the plate yields all the way to a 40 px caption before the roster's rows
     scroll, so every Crew plate slot carries the caption mode (pmxPlateFit({caption}) appends it) */
  function crewCaption(n) {
    var w = n - CAP;
    return n <= CAP ? (n === 1 ? 'The Coordinator and 1 helper. You get one checked result.' : 'All ' + n + ' work at once. You get one checked result.')
      : CAP + ' work at once; the other ' + w + (w === 1 ? ' waits its turn.' : ' wait their turn.') + ' You get one checked result.';
  }
  /* 2026-10-07 (Jared: the agent graphs were "messy, and a little hard to follow"): the gallery draws the product's
     cast plate (PM56_SHELL.pmxCastFit / pmxCastPlate, one grammar for every collaboration kind) instead of the old
     reference drawing: the job paper and the Coordinator on the bar with the accent edge to You at its end, the
     helpers hanging under it on orthogonal strings at one pitch on one baseline, always named, the ones past the cap
     on a slack string with "waits its turn" written once under them. The fit slot carries every mode that fits its
     width and the caption (6.3 yield order); `key` draws one mode alone under that key (the specimens sheet shows
     every mode, whichever one the sheet's fit slot picks at a given window size). */
  function crewCast(n, key) {
    return { key: key || 'g-plate', kind: 'crew', fitKey: 'g-plate-fit', affects: 'team', busPart: 'assign',
      input: { label: 'The job', sub: 'Add CSV export…', part: 'job' },
      hub: { key: 's-lead', role: 'lead', label: 'Coordinator', sub: 'This chat’s assistant', part: 'lead' },
      seats: HELPERS.slice(0, n).map(function (r, i) {
        var waits = i >= CAP;
        return { key: 's-' + r.k, role: r.role, seat: r.seat, state: waits ? 'queued' : 'working', standin: r.standin, label: r.job, sub: r.sub, part: waits ? 'team parallel' : 'team', waits: waits };
      }),
      you: { label: 'You', sub: 'one checked result', part: 'you' },
      waits: { label: 'waits its turn', many: 'wait their turn', part: 'parallel' },
      caption: crewCaption(n) };
  }
  function crewPlate(n, key) { return key ? S.pmxCastPlate(crewCast(n, key), 'full') : S.pmxCastFit(crewCast(n)); }
  function crewRowPlate(n, mode, key) { return S.pmxCastPlate(crewCast(n, key), mode); }
  /* R-02 / M3: the preview is the card's first frame, so it renders from the SAME data as the waiting card it
     lands on (review cycle 1: a shorter preview sentence made the clone's text jump from 2 lines to 3) */
  function waitingParts(o) {
    o = o || {};
    var head = S.pmxRunHead({ kind: 'crew', kindWord: 'Crew', title: o.mirror ? '<span data-pmx-mirror="g-title">Add CSV export</span>' : 'Add CSV export', badgeCls: 'collab-kind-badge', titleCls: 'collab-card-title',
      cluster: [mark('lead', 0, 18, 'queued'), mark('builder', 1, 18, 'queued'), mark('checker', 2, 18, 'queued'), mark('builder', 3, 18, 'queued', true)], clock: 'not started' });
    var body = S.pmxSentence({ status: 'waiting', word: 'Waiting to start', reason: 'Nothing runs by itself in this preview, so the Coordinator hasn’t split the job yet. Your setup is saved on this card.', cls: 'collab-status' }) +
      S.pmxTrack({ stops: [{ key: 'a', state: 'next', label: 'Split the job' }, { key: 'b', state: 'next', label: 'Do the parts' }, { key: 'c', state: 'next', label: 'Combine' }], nowText: '<b>Split the job</b> · not started' }) +
      S.pmxMeta({ parts: ['Nothing spent yet', 'your setup is saved on this card'] });
    return { head: head, body: body };
  }
  function previewCard() {
    var p = waitingParts({ mirror: true });
    return S.pmxRun({ key: 'collab-card-new', runId: 'new', kind: 'crew', density: 'waiting', preview: true, cls: 'collab-card collab-kind-crew', headHtml: p.head, bodyHtml: p.body, footHtml: '<b>never shown</b>' });
  }
  function roster(n) {
    var rows = HELPERS.slice(0, n).map(function (r) {
      return S.pmxRosterRow({ key: 'collab-draftrow-' + r.k, cls: 'collab-draft-row', attrs: 'data-row="' + r.k + '"', mark: mark(r.role, r.seat, 22, 'idle', r.standin),
        job: { attrs: 'data-collab-input="role" data-row="' + r.k + '"', value: r.job, placeholder: 'What this helper focuses on' },
        model: P.modelButton('collab-pick-model', 'g-model-' + r.k, r.model), persona: P.personaButton('collab-pick-persona', 'g-persona-' + r.k, r.persona),
        actions: [{ action: 'noop', label: 'Duplicate helper', glyph: 'copy' }, { action: 'noop', label: 'Remove helper', glyph: 'trash' }],
        route: r.standin ? S.pmxRoute({ strong: STAND.strong, text: STAND.text, fine: STAND.fine, cls: 'collab-route-eff collab-route-eff-sub' }) : '' });
    }).join('');
    var foot = S.pmxAddRow({ action: 'noop', disabled: n >= 8 }) + '<span class="pmx-fine">' + (n >= 8 ? 'A Crew holds up to 8 helpers.' : 'Suggested next: Tester') + '</span><span class="pmx-grow"></span>' +
      S.pickerButton({ action: 'noop', anchor: 'g-recipe', strong: 'Start from a team' });
    return S.pmxRoster({ key: 'g-roster', affects: 'team', scroll: n >= 7, cols: [{ label: 'Job', helper: 'What it focuses on' }, { label: 'AI model', helper: 'Which AI, which account pays' }, { label: 'Persona', helper: 'How it works (builds, checks…)' }], rowsHtml: rows, foot: foot });
  }
  function crewSheet(o) {
    o = o || {};
    var n = o.helpers || 3;
    var hero = S.pmxHero({ key: 'g-hero', n: 1, title: 'What should the Crew get done?',
      headAside: '<span>Card title</span><input type="text" value="Add CSV export" data-pmx-source="g-title" aria-label="Card title">',
      field: { tag: 'textarea', value: 'Add CSV export to the collection page, with tests and a short docs note. Keep quotes, commas and row order exactly as they appear on screen.', attrs: 'data-collab-input="task" data-pmx-source="g-job"', placeholder: 'Describe the result you want' },
      helper: 'Describe the finished result in your own words. The Coordinator turns it into parts, and everyone in the Crew reads it.',
      preview: S.pmxPreview({ key: 'g-preview', cardHtml: previewCard(), scale: 0.58 }) });
    var main = S.pmxQuestion({ key: 'g-q2', n: 2, title: 'Who\u2019s in the Crew', meta: n + (n === 1 ? ' helper' : ' helpers') + ' · up to 8', affects: 'team', body: crewPlate(n) + roster(n) });
    var how = S.pmxCtl({ key: 'g-c1', label: 'Coordinator', helper: 'Splits the job, hands out the parts, checks and combines the results.', affects: 'lead',
        control: S.pickerButton({ action: 'noop', anchor: 'g-coord', strong: 'This chat\u2019s assistant', small: 'No extra AI' }) }) +
      S.pmxCtl({ key: 'g-c2', label: 'Who decides who does what', helper: 'How parts are handed out.', affects: 'assign',
        control: S.pickerButton({ action: 'noop', anchor: 'g-assign', strong: 'The Coordinator decides', small: 'Each gets the part that fits it best' }) }) +
      S.pmxCtl({ key: 'g-c3', label: 'Working at the same time', helper: '<span class="pmx-step-capsay">You asked for 3; your plan runs <b>2 at once</b>. The third waits its turn.</span>', affects: 'parallel',
        control: S.pmxStepper({ key: 'g-step', input: { attrs: 'data-collab-input="cfg-parallelism"', key: 'cfg-parallelism' }, value: 3, min: 1, max: 8, cap: CAP, unit: 'at once', affects: 'parallel' }) });
    var side = S.pmxQuestion({ key: 'g-q3', n: 3, title: 'How should they work together?', body: how }) +
      S.pmxShelf({ key: 'g-shelf', n: 4, title: 'Add specialists', items: [
        { key: 'sp-w', mark: mark('wonderer', 5, 22), name: 'Wonderer', helper: 'Ideas from other fields, marked hypothesis. Doesn\u2019t vote.', state: 'off', input: { attrs: 'data-collab-input="wonderer"' }, affects: 'wonderer' },
        { key: 'sp-g', mark: mark('grill', 4, 22), name: 'Grill Me', helper: 'Asks you the key decisions first, with suggested answers.', state: 'off', input: { attrs: 'data-collab-input="grillMe"' }, affects: 'grill' }] }) +
      S.pmxPromises(S.pmxPromise({ key: 'pr1', glyph: 'lock', strong: 'Helpers can\u2019t do more than this chat', text: '(Agent, asks first).', part: 'permission' }) +
        S.pmxPromise({ key: 'pr2', glyph: 'not', strong: 'Crew Auto is off:', text: 'no Crew starts by itself. <button type="button" class="text-button" data-action="noop">Settings…</button>', part: 'auto' })) +
      S.pmxAdvancedEntry({ key: 'g-adv', summary: 'Stops after 45 min or $6.00 · same-provider stand-ins' });
    var readback = S.pmxReadback({ key: 'g-rb', parts: [
      { part: 'team', html: '<b>' + n + (n === 1 ? ' helper' : ' helpers') + '</b> work on it, ' },
      { part: 'parallel', html: '<b>' + (window.PM56_PMX ? PM56_PMX.ink('g-rb-par', '2 at a time') : '2 at a time') + '</b>, ' },
      { part: 'lead', html: 'and <b>this chat\u2019s assistant</b> checks every part before it counts.' }] });
    var foot = S.pmxFoot({ cls: 'collab-configure-foot', save: { action: 'noop', state: o.saved ? 'saved' : 'idle' }, readback: o.refusal ? '' : readback,
      refusal: o.refusal ? (function () { var rf = S.pmxRefusalText('model_unresolved', { helper: 'Integrator' }) || {}; return S.pmxRefusal({ code: 'model_unresolved', strong: rf.strong, text: rf.text, fix: { action: 'noop', label: rf.fix || 'Fix' } }); })() : '',
      estimate: S.pmxEstimate({ minutes: [5, 15], limitUsd: 6 }),
      cancel: { action: 'close-dialog', label: 'Cancel' }, primary: { action: 'noop', label: 'Start Crew · <span data-k="cnt:' + n + '">' + n + '</span> ' + (n === 1 ? 'helper' : 'helpers') } });
    var adv = S.pmxAdvancedPage({ key: 'g-advpage', title: 'Advanced', intro: 'Finished sentences you can change. Each says what it does now.', rows:
      S.pmxSetting({ key: 'set1', label: 'Time limit', sentence: 'Stops after <b>45 minutes</b> or <b>$6.00</b>, whichever comes first.', helper: 'Everything done so far is kept.', control: S.pickerButton({ action: 'noop', anchor: 'g-a1', strong: '45 minutes' }) }) +
      S.pmxSetting({ key: 'set2', label: 'Tokens', sentence: 'Each helper may read up to <b>200,000 tokens</b> (about 500 pages).', helper: 'A token is a piece of a word. More reads more of your code.', control: S.pickerButton({ action: 'noop', anchor: 'g-a2', strong: '200,000' }) }) +
      S.pmxSetting({ key: 'set3', label: 'Stand-ins', sentence: 'If a model is offline, <b>another model from the same provider</b> stands in.', helper: 'You always see who stood in for whom.', control: S.pickerButton({ action: 'noop', anchor: 'g-a3', strong: 'Same provider' }) }) +
      S.pmxSetting({ key: 'set4', label: 'Retries', sentence: 'A part that fails its check is tried <b>twice more</b>.', helper: 'Then the Crew asks you what to do.', control: S.pmxStepper({ key: 'g-step2', input: { attrs: 'data-x="retries"' }, value: 2, min: 0, max: 4, unit: 'more' }) }) +
      S.pmxSetting({ key: 'set5', label: 'Budget', sentence: 'Spends at most <b>$6.00</b> on this Crew.', helper: 'It stops and keeps the work when it reaches the limit.', control: S.pickerButton({ action: 'noop', anchor: 'g-a5', strong: '$6.00' }) }) +
      S.pmxSetting({ key: 'set6', label: 'Checks', sentence: 'Every part is <b>checked before it counts</b>.', helper: 'The Coordinator reads each result against the job.', control: S.pmxSwitch({ key: 'g-sw-chk', size: 'small', current: 'on', action: 'noop', options: [{ value: 'off', label: 'Off' }, { value: 'on', label: 'On' }] }) }) +
      S.pmxSetting({ key: 'set7', label: 'Files', sentence: 'Helpers may change <b>files in this project</b> only.', helper: 'Nothing outside the project folder is touched.', control: S.pickerButton({ action: 'noop', anchor: 'g-a7', strong: 'This project' }) }) +
      S.pmxSetting({ key: 'set8', label: 'Questions', sentence: 'Helpers may ask you <b>up to 3 questions</b> in a run.', helper: 'Questions wait in the dock until you answer.', control: S.pmxStepper({ key: 'g-step8', input: { attrs: 'data-x="questions"' }, value: 3, min: 0, max: 6, unit: 'questions', cells: false }) }) +
      S.pmxSetting({ key: 'set9', label: 'Notes', sentence: 'Each helper keeps <b>a short work log</b> you can read later.', helper: 'Logs stay in the run view.', control: S.pmxSwitch({ key: 'g-sw-log', size: 'small', current: 'on', action: 'noop', options: [{ value: 'off', label: 'Off' }, { value: 'on', label: 'On' }] }) }) +
      S.pmxSetting({ key: 'set10', label: 'Crew only', sentence: 'The Coordinator <b>splits the job into at most 5 parts</b>.', helper: 'More parts means more checking.', control: S.pickerButton({ action: 'noop', anchor: 'g-a10', strong: 'Up to 5 parts' }) }) });
    /* review cycle 2: the Advanced page keeps the hero (A1 / A14, reference S1e): the page opens under the 88 px
       hero box, so the Advanced grid is judged in the room it really has (it used to be dropped here, which hid a
       3-33 px scroll in the common case) */
    return S.pmxSheet({ type: 'collab-configure', kind: 'crew', size: 'wide', attrs: 'data-collab-kind="crew"', title: 'Set up a Crew',
      lead: 'A small team of AIs splits your job into parts. A Coordinator hands them out and only accepts a part once its result is checked.',
      closeAction: 'close-dialog', hero: hero, main: main, side: side, advancedOpen: !!o.advanced, advancedHtml: adv, foot: foot, ariaLabel: 'Set up a Crew' });
  }
  function stdSheet(o) {
    o = o || {};
    var tabs = S.pmxTabs({ key: 'g-tabs', items: [{ value: 'up', label: 'Coming up', count: 2 }, { value: 'held', label: 'Held', count: 1 }, { value: 'done', label: 'Sent' }], current: 'up', action: 'noop', cls: 'sched-tabs' });
    var left = S.pmxQuestion({ key: 'g-b1', n: 1, title: 'How watchful', helper: 'Back Seat Driver reads along and only speaks when something matters.', affects: 'mode',
        body: S.pmxSwitch({ key: 'g-sw', current: 'auto', action: 'noop', affects: 'mode', options: [{ value: 'off', label: 'Off', helper: 'Never speaks' }, { value: 'auto', label: 'Auto', helper: 'Speaks on real risks' }, { value: 'on', label: 'On', helper: 'Speaks on every step' }] }) }) +
      S.pmxQuestion({ key: 'g-b2', n: 2, title: 'Which days', helper: 'Nightly builds run on the days you tick.', affects: 'when',
        body: S.pmxWords({ key: 'g-words', action: 'noop', items: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(function (d, i) { return { value: d, label: d, on: i < 5 }; }) }) }) +
      S.pmxQuestion({ key: 'g-b3', n: 3, title: 'What it may look at', affects: 'watch', state: o.error ? 'error' : '', body:
        S.pmxCheck({ key: 'g-ck1', label: 'Commands the agent runs', helper: 'Including the files they change.', checked: true, attrs: 'data-bsd-field="cmd"' }) +
        S.pmxCheck({ key: 'g-ck2', label: 'Plans and To-Dos', helper: 'So it can notice a skipped step.', checked: false }) +
        S.pmxCheck({ key: 'g-ck3', label: 'Your private notes', helper: 'Not available in this preview yet.', disabled: true }) });
    var right = S.pmxQuestion({ key: 'g-b4', n: 4, title: 'Scheduled', body: tabs +
        S.pmxCtl({ key: 'g-bc1', label: 'Catch-up delay', helper: 'How long it waits after a burst of steps.', affects: 'catchup', control: S.pickerButton({ action: 'noop', anchor: 'g-cu', strong: '20 seconds', small: 'A short pause' }) }) +
        S.pmxCtl({ key: 'g-bc2', label: 'Quiet period', helper: 'Minutes between two notes.', affects: 'quiet', control: S.pmxStepper({ key: 'g-st3', input: { attrs: 'data-x="quiet"' }, value: 3, min: 1, max: 20, unit: 'min', cells: false }) }) +
        S.pmxCtl({ key: 'g-bc3', label: 'Reach', helper: 'Which chats it may read.', affects: 'reach', disabled: true, reason: 'Applies when Back Seat Driver is on.', control: S.pickerButton({ action: 'noop', anchor: 'g-reach', strong: 'This chat only' }) }) +
        S.pmxCtl({ key: 'g-bc4', label: 'When', helper: 'One time, or every night in a quiet slot.', layout: 'stack', control: S.pmxSwitch({ key: 'g-sw2', size: 'small', current: 'one', action: 'noop', options: [{ value: 'one', label: 'One time' }, { value: 'nightly', label: 'Nightly time slot' }] }) }) });
    var foot = S.pmxFoot({ readback: S.pmxReadback({ parts: [{ part: 'mode', html: 'Back Seat Driver speaks <b>only on real risks</b>, ' }, { part: 'quiet', html: 'at most every <b>3 minutes</b>.' }] }),
      estimate: S.pmxEstimate({ recorded: true }), cancel: { action: 'close-dialog', label: 'Cancel' },
      primary: o.confirm ? { action: 'noop', label: 'Done' } : { action: 'noop', label: 'Save', tone: o.warm ? 'warm' : 'accent', disabled: !!o.disabled, reason: o.disabled ? 'Pick at least one day.' : '' } });
    var body = o.confirm ? S.pmxConfirm({ key: 'g-conf', markHtml: S.pmxKindMark('schedule', 36), headline: 'Scheduled for 10:00 PM', text: 'It sends itself in 5 hours. You can change or cancel it until then.',
      actions: '<button type="button" class="soft-button" data-action="noop">Edit</button><button type="button" class="text-button" data-action="noop">Cancel it</button>' }) : null;
    return S.pmxSheet({ type: 'bsd', kind: o.confirm ? 'schedule' : 'bsd-auto', size: 'standard', title: o.confirm ? 'Schedule a message' : 'Set up Back Seat Driver',
      lead: o.confirm ? 'Your message is written now and sent at the time you pick.' : 'An advisor that reads along with the agent and speaks up only when it matters.', closeAction: 'close-dialog',
      guide: S.pmxGuide({ key: 'g-guide', placement: 'sheet', cls: 'bsd12-guide', step: 'Step 2 of 4 · Pick how watchful it is.', actions: [{ action: 'noop', label: 'Next' }] }),
      main: left, side: right, body: body, state: o.confirm ? 'confirm' : '', foot: foot });
  }
  function compactSheet() {
    var body = S.pmxQuestion({ key: 'g-r1', title: 'What goes back', helper: 'Only the agent\u2019s last edit is reverted. Your own edits stay.', body:
      S.pmxFilesRow({ key: 'g-fr', count: 3, add: 5, del: 3 }) + S.pmxPromises(S.pmxPromise({ glyph: 'lock', strong: 'Nothing else changes.', text: 'Files you edited since are left as they are.' })) }) +
      S.pmxQuestion({ key: 'g-r2', title: 'Explanation style', body: S.pmxCtl({ label: 'ELI5', helper: 'Simple explanations in this chat.', layout: 'stack', control: S.pmxSwitch({ current: 'on', size: 'small', action: 'noop', options: [{ value: 'off', label: 'Off' }, { value: 'on', label: 'On' }] }) }) });
    return S.pmxSheet({ type: 'revert', kind: 'revert', size: 'compact', height: 520, title: 'Revert Last Agent Edit', lead: 'Bring back the files as they were before the agent\u2019s last edit.', body: body,
      foot: S.pmxFoot({ cancel: { action: 'close-dialog' }, primary: { action: 'noop', label: 'Revert 3 files', tone: 'warm' } }) });
  }
  /* specimens: every glyph, kind mark, silhouette x seat, state and plate atom (test-only inline layout) */
  function specimenSheet() {
    /* test-only layout, itself inside the J-2 minimums so any crowding reported here is the primitives' */
    var cell = function (inner, label) { return '<span style="display:inline-flex;flex-direction:column;align-items:center;gap:8px;width:92px;margin:0 12px 16px 0;font-size:11px;line-height:16px;color:var(--muted);text-align:center;overflow-wrap:anywhere">' + inner + '<span>' + label + '</span></span>'; };
    /* glyph, kind and role captions are identifiers (kind-brainstorm, chat_room), not copy: set as code so the
       canon-names spelling check reads them as names of things, the way a lane would print a key */
    var id = function (n) { return '<code style="font:inherit">' + n + '</code>'; };
    var grid = function (html) { return '<div style="display:flex;flex-wrap:wrap;align-items:flex-start">' + html + '</div>'; };
    var glyphs = Object.keys(S.PMX_GLYPHS).map(function (n) { return cell(G(n, 20), id(n)); }).join('');
    var kinds = ['crew', 'crew-auto', 'chat_room', 'brainstorm', 'review', 'bsd', 'bsd-off', 'bsd-auto', 'bsd-on', 'schedule', 'build-at', 'scheduled', 'memory', 'teach', 'revert', 'eli5', 'defaults'].map(function (k) { return cell(S.pmxKindMark(k, 22), id(k)); }).join('');
    var roles = ['coordinator', 'builder', 'checker', 'architect', 'product', 'adversarial', 'wonderer', 'grill', 'you', 'mystery'];
    var sil = roles.map(function (r) { return cell(mark(r, 1, 28), id(r)); }).join('');
    var seats = [1, 2, 3, 4, 5, 6, 7, 8].map(function (s) { return cell(mark('builder', s, 28), 'seat ' + s); }).join('');
    var states = ['idle', 'queued', 'working', 'done', 'needs', 'failed', 'abstained', 'optional'].map(function (st) { return cell(mark('checker', 2, 28, st), st); }).join('') + cell(mark('builder', 3, 28, 'idle', true), 'stands in');
    var sizes = [18, 22, 28, 36].map(function (z) { return cell(mark('architect', 4, z), z + ' px'); }).join('');
    var sev = grid(['critical', 'major', 'minor', 'suggestion', 'nit', 'concern'].map(function (l) { return '<span style="margin:0 18px 12px 0">' + S.pmxSeverity(l) + '</span>'; }).join('') +
      '<span style="margin:0 18px 12px 0">' + S.pmxAgree({ votes: [{ seat: 1, vote: 'agree' }, { seat: 2, vote: 'unsure' }, { seat: 3, vote: 'disagree' }], words: '1 of 3 agree · someone disagreed' }) + '</span>' +
      '<span style="margin:0 18px 12px 0">' + S.pmxSealed(3) + '</span>');
    var atoms = PP.band({ y: 0, h: 120, name: 'stage' }) + PP.table({ cx: 70, cy: 60, r: 34, part: 'moderator' }) + PP.seat({ key: 'sp-t1', x: 70, y: 22, role: 'moderator', label: '', part: 'lead' }) +
      PP.screen({ key: 'sp-scr', x: 170, y: 60, h: 50 }) + PP.chapter({ key: 'sp-ch1', x: 230, y: 40, label: 'Ideas', state: 'done' }) + PP.chapter({ key: 'sp-ch2', x: 290, y: 40, label: 'Vote', state: 'now' }) +
      PP.cue({ key: 'sp-cq', x: 360, y: 40, kind: 'quiet', label: 'quiet' }) + PP.cue({ key: 'sp-cs', x: 420, y: 40, kind: 'speaks', label: 'speaks' }) + PP.cue({ key: 'sp-cw', x: 460, y: 40, kind: 'wait', w: 60, label: 'waits' }) + PP.slot({ key: 'sp-slot', x: 36, y: 134, label: 'waits its turn', part: 'parallel' }) +
      PP.line({ key: 'sp-l1', from: { x: 220, y: 96 }, to: { x: 300, y: 96 }, style: 'sees', part: 'blind' }) + PP.label({ x: 310, y: 100, text: 'sees the work', cls: 'sub' }) +
      PP.paper({ key: 'sp-pp', x: 420, y: 76, w: 100, h: 34, label: 'Snapshot', lock: true, part: 'target' });
    /* the ten-sample legend runs the plate's full width along its top, so the atoms start 28 px lower */
    var plate = S.pmxPlate({ key: 'sp-plate', kind: 'review', mode: 'compact', w: 560, h: 178, svg: '<g transform="translate(0 28)">' + atoms + '</g>',
      legend: ['hands', 'fixed', 'toyou', 'sees', 'hatch', 'hollow', 'filled', 'dot', 'bar', 'screen'].map(function (s2) { return { sample: s2, label: s2 }; }) });
    var sec = function (t, b) { return S.pmxQuestion({ key: 'spq-' + t, title: t, body: b }); };
    var body = sec('Glyphs', grid(glyphs)) + sec('Kind marks', grid(kinds)) + sec('Silhouettes', grid(sil)) + sec('Seats', grid(seats)) + sec('States', grid(states)) + sec('Sizes', grid(sizes)) +
      sec('Severity, agreement, sealed notes', sev) + sec('Plate atoms', plate) +
      /* every Crew plate mode on its own (review cycle 1: the 5-helper strip's You label ran over the sixth mark
         while the sheet showed another mode, so no check saw it) */
      sec('Crew plate modes', crewPlate(2, 'sp-crew-full2') + crewPlate(3, 'sp-crew-full3') + crewRowPlate(4, 'compact', 'sp-crew-compact4') + crewRowPlate(5, 'strip', 'sp-crew-strip5') + crewRowPlate(6, 'strip', 'sp-crew-strip6'));
    return S.pmxSheet({ type: 'pmx-specimens', kind: 'defaults', size: 'standard', title: 'Specimens', lead: 'Every glyph, mark and plate atom the pmx builders draw.', body: body,
      foot: S.pmxFoot({ cancel: { action: 'close-dialog', label: 'Close' }, primary: { action: 'close-dialog', label: 'Done' } }) });
  }
  X.sheet = function (d) {
    return d.which === 'std' ? stdSheet(d) : d.which === 'confirm' ? stdSheet({ confirm: true }) : d.which === 'compact' ? compactSheet() : d.which === 'specimens' ? specimenSheet() : crewSheet(d);
  };

  /* ================================================================ in chat
     Everything that can change on a tick is inside a fixed box (7.2); the tick
     index walks each box from short to very long text. */
  var VERBS = ['running tests', 'reading export.ts', 'Using tools · running search.test.ts', 'writing a long description of every change it makes to the export module'];
  var QUOTES = ['Adding cases', 'Adding cases for commas, quotes and line breaks inside a title', 'Adding cases for commas, quotes and line breaks inside a title, then a second pass over every header so the export keeps the visible column order exactly as people see it on screen'];
  var REASONS = ['Two helpers are working.', 'Data mapper and CSV specialist are working. Integrator starts after both parts are checked.',
    'Data mapper and CSV specialist are working on their parts, Integrator starts after both parts are checked, and the Coordinator reads every result against the job before it counts toward the finished export.'];
  var LONGS = ['Allow once?', '<b>CSV specialist needs your OK</b> to restore a snapshot. Only this helper waits; the others keep working.',
    '<b>CSV specialist needs your OK</b> to restore a 50,000-row snapshot of the collection table into a scratch database. Only this helper waits; the others keep working and nothing is written to your files.'];
  function lane(o) { return S.pmxLane(o); }
  /* the cards here are all collaboration kinds: their Expand / More defaults need collabHooks (IMPACT A2-16) */
  function acts(run, items, o) { o = o || {}; return S.pmxActions({ collabHooks: true, items: items.map(function (a) { a.attrs = (a.attrs ? a.attrs + ' ' : '') + 'data-run="' + run + '"'; return a; }), expand: o.noExpand ? null : { attrs: 'data-run="' + run + '"', open: !!o.open }, more: { attrs: 'data-run="' + run + '"' } }); }
  function liveCard(t, key, runId) {
    key = key || 'collab-card-g1'; runId = runId || 'g1';
    var q = X.stream ? esc(X.stream.slice(0, 320)) : pick(QUOTES, t);
    var head = S.pmxRunHead({ kind: 'crew', kindWord: 'Crew', title: 'Add CSV export', badgeCls: 'collab-kind-badge', titleCls: 'collab-card-title',
      cluster: [mark('lead', 0, 18, 'working'), mark('builder', 1, 18, 'working'), mark('checker', 2, 18, t % 2 ? 'needs' : 'working'), mark('builder', 3, 18, 'queued', true)], clock: clock(192 + t), clockKey: 'clk:' + runId });
    var lanes = lane({ key: 'pmx-lane:' + runId + ':p1', state: 'done', mark: mark('builder', 1, 22, 'done'), name: 'Normalize titles', sub: 'Sonnet 4.6', verb: 'checked', verbKey: 'vb:p1:2', time: clock(118), line2: 'Data mapper · 18 titles round-trip unchanged', line2Kind: 'detail', action: 'collab-open-participant', attrs: 'data-run="' + runId + '" data-participant="p1"' }) +
      lane({ key: 'pmx-lane:' + runId + ':p2', state: 'working', mark: mark('checker', 2, 22, 'working'), name: 'Verify CSV quoting', sub: 'Opus 5', verb: pick(VERBS, t), verbKey: 'vb:p2:' + t, fresh: true, time: clock(125 + t), line2: 'CSV specialist · <q>' + q + '</q>', line2Kind: 'quote', keep: true, keepKey: 'l2:' + runId + ':p2:quote:m9', action: 'collab-open-participant', attrs: 'data-run="' + runId + '" data-participant="p2"' }) +
      lane({ key: 'pmx-lane:' + runId + ':p3', state: 'queued', mark: mark('builder', 3, 22, 'queued', true), name: 'Assemble the export', sub: 'Qwen 3.8', verb: 'waiting its turn', verbKey: 'vb:p3:1', time: '', line2: 'Integrator · starts after Normalize titles and Verify CSV quoting', line2Kind: 'detail', action: 'collab-open-participant', attrs: 'data-run="' + runId + '" data-participant="p3"' });
    var body = S.pmxSentence({ status: 'running', word: 'Running', reason: pick(REASONS, t), cls: 'collab-status collab-status-working' }) +
      S.pmxTrack({ stops: [{ key: 'pmx-stop:' + runId + ':a', state: 'done', label: 'Split the job' }, { key: 'pmx-stop:' + runId + ':b', state: 'now', label: 'Do the parts' }, { key: 'pmx-stop:' + runId + ':c', state: 'next', label: 'Combine' }], nowText: '<b>Do the parts</b> · ' + (t % 3) + ' of 3 checked' }) +
      S.pmxLanes({ lanesHtml: lanes }) +
      S.pmxMeta({ cls: 'collab-card-meta', parts: [S.pmxCost({ state: 'running', spent: (18 + t) / 100, limit: 6 }), CLAMP.card, t % 2 ? STAND.card : 'Qwen 3.8 stands in'] });
    return S.pmxRun({ key: key, runId: runId, kind: 'crew', density: 'live', cls: 'collab-card collab-kind-crew', headCls: 'collab-card-head', footCls: 'collab-card-foot', bodyCls: 'collab-card-body', bodyKey: 'collab-body-' + runId, headHtml: head, bodyHtml: body,
      footHtml: acts(runId, [{ action: 'collab-open-panel', label: 'Open Panel' }, { action: 'collab-message', label: 'Message' }]) });
  }
  function startingCard(t) {
    var head = S.pmxRunHead({ kind: 'brainstorm', kindWord: 'BrainStorm', title: 'Quota failover', cluster: [mark('lead', 0, 18, 'queued'), mark('architect', 1, 18, 'queued'), mark('builder', 2, 18, 'queued'), mark('product', 3, 18, 'queued')], clock: '0:0' + (t % 10) });
    var body = S.pmxSentence({ status: 'starting', word: 'Starting', reason: pick(['The team is getting ready.', 'The team reads your question and your two must-haves before the first round of ideas.'], t) }) +
      S.pmxTrack({ stops: [{ key: 'a', state: 'next', label: 'Ideas' }, { key: 'b', state: 'next', label: 'Vote' }, { key: 'c', state: 'next', label: 'Plan' }], nowText: '<b>Ideas</b> · about to start' }) +
      S.pmxMeta({ recorded: true, parts: ['4 helpers'] });
    return S.pmxRun({ key: 'collab-card-g0', runId: 'g0', kind: 'brainstorm', density: 'starting', cls: 'collab-card collab-kind-brainstorm', headHtml: head, bodyHtml: body, bodyKey: 'collab-body-g0',
      footHtml: acts('g0', [{ action: 'noop', label: 'Watch a recorded example', glyph: 'play' }, { action: 'collab-open-panel', label: 'Open Panel' }]) });
  }
  function attentionCard(t) {
    var head = S.pmxRunHead({ kind: 'crew', kindWord: 'Crew', title: 'Stream the export', cluster: [mark('lead', 0, 18), mark('builder', 1, 18, 'working'), mark('checker', 2, 18, 'needs'), mark('builder', 3, 18, 'queued')], clock: clock(190 + t) });
    var body = S.pmxDecision({ tone: 'warm', sentence: pick(LONGS, t),
        actions: [{ action: 'noop', label: 'Allow once', primary: true, attrs: 'data-run="g2"' }, { action: 'noop', label: 'Don\u2019t allow', soft: true, attrs: 'data-run="g2"' }, { action: 'noop', label: 'Details', attrs: 'data-run="g2"' }] }) +
      S.pmxTrack({ stops: [{ key: 'a', state: 'done' }, { key: 'b', state: 'now' }, { key: 'c', state: 'next' }], nowText: '<b>Do the parts</b> · 0 of 3 checked' }) +
      S.pmxLanes({ lanesHtml: lane({ key: 'la1', state: 'needs', mark: mark('checker', 2, 22, 'needs'), name: 'Measure memory', verb: 'waiting for your OK', time: clock(156 + t), line2: 'CSV specialist · asked to restore a 50,000-row snapshot' }) +
        lane({ key: 'la2', state: 'working', mark: mark('builder', 1, 22, 'working'), name: 'Write the stream', verb: pick(VERBS, t + 1), time: clock(79 + t), line2: 'Data mapper · <q>' + pick(QUOTES, t + 1) + '</q>', line2Kind: 'quote' }),
        more: { count: 1, text: 'Integrator waits its turn · Show all', action: 'collab-toggle-expand', attrs: 'data-run="g2"' } }) +
      S.pmxMeta({ parts: [S.pmxCost({ state: 'running', spent: (24 + t) / 100, limit: 6 })] });
    return S.pmxRun({ key: 'collab-card-g2', runId: 'g2', kind: 'crew', density: 'attention', tone: 'warm', cls: 'collab-card collab-kind-crew', headHtml: head, bodyHtml: body, bodyKey: 'collab-body-g2',
      footHtml: acts('g2', [{ action: 'collab-open-panel', label: 'Open Panel' }, { action: 'collab-message', label: 'Message' }], { noExpand: true }) });
  }
  function resultCard(t, key, runId) {
    key = key || 'collab-card-g3'; runId = runId || 'g3';
    var head = S.pmxRunHead({ kind: 'crew', kindWord: 'Crew', title: 'Add CSV export', clock: '8m 40s' });
    var out = X.stream ? S.pmxMd(X.stream, { mode: 'compact', open: { action: 'collab-open-panel', attrs: 'data-run="' + runId + '"' } })
      : S.pmxOutput({ name: 'collection.csv', meta: '214 rows', diff: { add: 121, del: 46, files: 4 }, lines: ['title,author,year,tags', '"Dune","Herbert, Frank",1965,"sf;classic"', '"The ""Quoted"" Life","Ng, A.",2021,essay', 'never shown'] });
    var body = S.pmxResult({ headline: 'Export ready: all 3 parts checked', sub: S.pmxFill('Worked {t} with {n} helpers', { t: T.worked(520000), n: 3 }) + ' · ' + S.pmxCost({ state: 'done', spent: 0.92, limit: 6 }),
      outputHtml: out,
      creditsHtml: S.pmxCredits({ items: [{ mark: mark('lead', 0, 18, 'done'), name: 'Coordinator', did: 'checked each part' }, { mark: mark('builder', 1, 18, 'done'), name: 'Data mapper', did: 'cleaned up titles' },
        { mark: mark('checker', 2, 18, 'done'), name: 'CSV specialist', did: 'fixed quoting, 2nd try' }, { mark: mark('builder', 3, 18, 'done'), name: 'Integrator', did: 'built and tested it' },
        { mark: mark('product', 5, 18, 'done'), name: 'Docs note', did: 'wrote the docs note' }] }) });
    return S.pmxRun({ key: key, runId: runId, kind: 'crew', density: 'result', cls: 'collab-card collab-kind-crew', headHtml: head, bodyHtml: body, bodyKey: 'collab-body-' + runId,
      footHtml: acts(runId, [{ action: 'collab-open-panel', label: 'Open Panel', primary: true }, { action: 'noop', label: 'Download' }, { action: 'collab-message', label: 'Message' }]) });
  }
  function waitingCard(t) {
    var p = waitingParts();
    return S.pmxRun({ key: 'collab-card-g4', runId: 'g4', kind: 'crew', density: 'waiting', cls: 'collab-card collab-kind-crew', headHtml: p.head, bodyHtml: p.body, bodyKey: 'collab-body-g4',
      footHtml: acts('g4', [{ action: 'noop', label: 'Watch a recorded example', glyph: 'play' }, { action: 'collab-open-panel', label: 'Open Panel' }]) });
  }
  function failedCard(t) {
    var head = S.pmxRunHead({ kind: 'review', kindWord: 'Review', title: 'Review my latest changes', cluster: [mark('checker', 1, 18, 'done'), '|', mark('checker', 2, 18, 'failed'), '|', mark('adversarial', 3, 18, 'done')], clock: '4:02' });
    var body = S.pmxSentence({ status: 'failed', word: 'Only 2 of 3 reviewers finished', reason: '(Reviewer 3 ran out of time). This is a partial review, and the two finished reviews are kept.' }) +
      S.pmxTrack({ stops: [{ key: 'a', state: 'done' }, { key: 'b', state: 'failed' }, { key: 'c', state: 'next' }, { key: 'd', state: 'next' }], nowText: '<b>Reading on their own</b> · 2 of 3 finished' }) +
      S.pmxDecision({ tone: 'warm', glyph: 'warn', sentence: '<b>Reviewer 3 ran out of time.</b> Retry it, or continue with the two finished reviews.',
        actions: [{ action: 'noop', label: 'Retry', primary: true, attrs: 'data-run="g5"' }, { action: 'noop', label: 'Continue with 2', soft: true, attrs: 'data-run="g5"' }, { action: 'noop', label: 'Cancel', attrs: 'data-run="g5"' }] });
    return S.pmxRun({ key: 'collab-card-g5', runId: 'g5', kind: 'review', density: 'failed', cls: 'collab-card collab-kind-review', headHtml: head, bodyHtml: body, bodyKey: 'collab-body-g5', footHtml: '' });
  }
  function collapsedCard(t) {
    var head = S.pmxRunHead({ kind: 'chat_room', kindWord: 'Chat Room', title: 'Search shortcut', cluster: [mark('lead', 0, 18, 'working'), mark('product', 1, 18), mark('architect', 2, 18)], clock: clock(362 + t),
      extra: '<button type="button" class="icon-button" aria-label="Expand" data-action="collab-toggle-expand" data-run="g6">' + G('chevron-down', 15) + '</button>' });
    var body = S.pmxSentence({ status: 'yourmove', word: 'Round 1 done.', reason: pick(['Your move.', 'Your move: Next Round, Summarize Now, or send the room a message.'], t) }) +
      S.pmxTrack({ stops: [{ key: 'a', state: 'done' }, { key: 'b', state: 'now' }, { key: 'c', state: 'next' }], nowText: '<b>Round 1 of 3</b> · done' });
    return S.pmxRun({ key: 'collab-card-g6', runId: 'g6', kind: 'chat_room', density: 'collapsed', cls: 'collab-card collab-kind-chat_room', headHtml: head, bodyHtml: body, bodyKey: 'collab-body-g6', footHtml: '' });
  }
  function reviewLive(t) {
    var head = S.pmxRunHead({ kind: 'review', kindWord: 'Review', title: 'Review my latest changes', cluster: [mark('checker', 1, 18, 'working'), '|', mark('checker', 2, 18, 'done'), '|', mark('adversarial', 3, 18, 'working')], clock: clock(72 + t) });
    var body = S.pmxSentence({ status: 'running', word: 'Running', reason: '3 reviewers are reading on their own; they can\u2019t see each other\u2019s notes yet.' }) +
      S.pmxTrack({ stops: [{ key: 'a', state: 'done', label: 'Snapshot' }, { key: 'b', state: 'now', label: 'Reading on their own' }, { key: 'c', state: 'next', label: 'Comparing notes' }, { key: 'd', state: 'next', label: 'Writing the report' }], nowText: '<b>Reading on their own</b> · 1 of 3 done' }) +
      S.pmxLanes({ lanesHtml: lane({ key: 'r1', state: 'working', mark: mark('checker', 1, 22, 'working'), name: 'Security', sub: 'Sonnet 4.6', verb: pick(['reading filterEntries.js', 'reading rank.js and filterEntries.js side by side'], t), time: clock(72 + t), line2: S.pmxSealed(1 + t % 3) + (1 + t % 3) + (t % 3 ? ' notes' : ' note') + ' · sealed until everyone is done', line2Kind: 'sealed' }) +
        lane({ key: 'r2', state: 'done', mark: mark('checker', 2, 22, 'done'), name: 'Bugs', sub: 'Opus 5', verb: 'finished reading', time: '0:58', line2: S.pmxSealed(3) + '3 notes · sealed until everyone is done', line2Kind: 'sealed' }) +
        lane({ key: 'r3', state: 'working', mark: mark('adversarial', 3, 22, 'working'), name: 'Fresh eyes', sub: 'Opus 5 · own session', verb: 'reading rank.js', time: clock(72 + t), line2: S.pmxSealed(1) + '1 note · sealed until everyone is done', line2Kind: 'sealed' }) }) +
      S.pmxMeta({ recorded: true, parts: ['3 reviewers'] });
    return S.pmxRun({ key: 'collab-card-g7', runId: 'g7', kind: 'review', density: 'live', cls: 'collab-card collab-kind-review', headHtml: head, bodyHtml: body, bodyKey: 'collab-body-g7',
      footHtml: acts('g7', [{ action: 'collab-open-panel', label: 'Open Panel' }, { action: 'collab-message', label: 'Message' }]) });
  }
  function reviewResult(t) {
    var findings = S.pmxFindings(
      S.pmxFinding({ key: 'f1', n: 1, sev: 'major', box: { checked: true, attrs: 'data-action="collab-review-toggle-finding" data-finding="f1" data-run="g8"' }, severity: S.pmxSeverity('major'), disposition: 'To fix',
        agree: S.pmxAgree({ votes: [{ seat: 1, vote: 'agree' }, { seat: 2, vote: 'agree' }, { seat: 3, vote: 'unsure' }], words: '2 of 3 agree' }), claim: 'filterEntries drops rows whose title contains a comma.' }) +
      S.pmxFinding({ key: 'f2', n: 2, sev: 'minor', box: { checked: false, attrs: 'data-action="collab-review-toggle-finding" data-finding="f2" data-run="g8"' }, severity: S.pmxSeverity('minor'), disposition: 'Unsure',
        agree: S.pmxAgree({ votes: [{ seat: 1, vote: 'agree' }, { seat: 2, vote: 'disagree' }], words: 'someone disagreed' }), claim: 'Alphabetical ordering could be intentional.',
        todo: 'To-Do created · <button type="button" class="text-button" data-action="review-open-todos" data-run="g8">Open To-Dos</button>' }));
    var head = S.pmxRunHead({ kind: 'review', kindWord: 'Review', title: 'Review my latest changes', clock: '5m 10s' });
    var body = S.pmxResult({ glyph: 'check', headline: '1 thing to fix, 1 unsure', sub: 'Checked alone, then compared notes · ' + T.worked(320000) + ' · ' + S.pmxMoney(0.41), boardHtml: findings }) +
      S.pmxQuote({ key: 'g8-q', cls: 'collab-dissent', text: 'The ordering is a product choice; changing it would surprise people who rely on it.', who: 'Fresh eyes', note: 'disagreed' });
    return S.pmxRun({ key: 'collab-card-g8', runId: 'g8', kind: 'review', density: 'result', cls: 'collab-card collab-kind-review', headHtml: head, bodyHtml: body, bodyKey: 'collab-body-g8',
      footHtml: acts('g8', [{ action: 'collab-open-panel', label: 'Open Panel', primary: true }, { action: 'collab-review-create-todos', label: 'Create To-Dos' }]) });
  }
  function stormResult() {
    var board = S.pmxVoteBoard({ key: 'vb', deciding: mark('lead', 0, 18), abstained: mark('wonderer', 5, 18, 'abstained'), ruledCls: 'collab-hardconflict', options: [
      { key: 'o1', title: 'Fail over by provider', count: '2 for', backers: [{ markHtml: mark('architect', 1, 18), name: 'Architect', conf: 3 }, { markHtml: mark('builder', 2, 18), name: 'Builder', conf: 2 }] },
      { key: 'o2', title: 'Fail over by model', count: '1 for', backers: [{ markHtml: mark('product', 3, 18), name: 'Product', conf: 1 }] }] });
    var head = S.pmxRunHead({ kind: 'brainstorm', kindWord: 'BrainStorm', title: 'Quota failover', clock: '9m' });
    var body = S.pmxResult({ glyph: 'check', headline: 'Plan ready: fail over by provider', sub: '3 rounds · 4 helpers · $1.10', boardHtml: board });
    return S.pmxRun({ key: 'collab-card-g9', runId: 'g9', kind: 'brainstorm', density: 'result', cls: 'collab-card collab-kind-brainstorm', headHtml: head, bodyHtml: body, bodyKey: 'collab-body-g9',
      footHtml: acts('g9', [{ action: 'collab-open-panel', label: 'Open Panel', primary: true }]) });
  }
  function receipt(t, i, kind, title, headlines, runId) {
    return S.pmxReceipt({ key: 'collab-card-' + runId, runId: runId, kind: kind, kindWord: kind === 'review' ? 'Review' : 'Crew', cls: 'collab-card collab-kind-' + kind, glyph: 'check',
      headCls: 'collab-card-head', footCls: 'collab-card-foot', badgeCls: 'collab-kind-badge', titleCls: 'collab-card-title', statusCls: 'collab-status', metaCls: 'collab-card-meta',
      cluster: [mark('checker', 1, 12), mark('checker', 2, 12), mark('hexagon', 3, 12)], title: title, headline: headlines[i % 2], time: '10:30 PM', cost: S.pmxMoney(0.41), open: { action: 'collab-open-panel' } });
  }
  function notes(t) {
    var acts2 = '<button type="button" class="text-button" data-action="noop">Why?</button><button type="button" class="text-button" data-action="noop">Dismiss</button>';
    return S.pmxNote({ key: 'nt1', severity: 'concern', severityHtml: S.pmxSeverity('concern'), title: 'The migration drops a column that tests still read', body: 'Step 4 removes <code>users.legacy_id</code>, but <code>auth.test.ts</code> still selects it.', checked: 'Checked against 3 files · 2 min ago', actions: acts2 }) +
      S.pmxNote({ key: 'nt2', severity: 'nit', severityHtml: S.pmxSeverity('nit'), stale: true, title: 'A log line prints the whole row', body: 'This was about an older version of the file.', checked: 'Checked 12 min ago · the file changed since', actions: acts2 }) +
      S.pmxNote({ key: 'nt3', severity: 'nit', dismissed: true, title: 'Prefer const here', actions: '<button type="button" class="text-button" data-action="noop">Show again</button>' });
  }
  function chatEntry(gid, t) {
    switch (gid) {
      case 'rc1': return receipt(t, 1, 'review', 'Review my latest changes', ['2 to fix, 1 unsure', '2 things to fix and 1 finding the reviewers were unsure about, with a To-Do for each'], 'rr1');
      case 'rc2': return receipt(t, 2, 'crew', 'Add CSV export', ['Export ready: all 3 parts checked', 'Export ready: all 3 parts checked and the docs note is written'], 'rr2');
      case 'starting': return startingCard(t);
      case 'collapsed': return collapsedCard(t);
      case 'live': return liveCard(t);
      case 'attention': return X.phase ? resultCard(t, 'collab-card-g2', 'g2') : attentionCard(t);
      case 'result': return resultCard(t);
      case 'waiting': return waitingCard(t);
      case 'failed': return failedCard(t);
      case 'review-live': return reviewLive(t);
      case 'review-result': return reviewResult(t);
      case 'storm-result': return stormResult(t);
      case 'live-new': return liveCard(t, 'collab-card-g10', 'g10');
      case 'receipt': return receipt(t, 3, 'crew', 'Add CSV export', ['Export ready', 'Export ready: all 3 parts checked and the docs note is written'], 'rr3');
      case 'files': return '<div class="pmx-gallery-row" style="display:flex;flex-wrap:wrap;gap:12px 20px;align-items:center;padding:4px 0">' + S.pmxFilesRow({ key: 'fr', count: 4, add: 121, del: 46, revert: { action: 'noop' } }) +
        S.pmxTick({ key: 'tk1', glyph: 'notebook', text: 'Noted', hover: 'Saved to memory' }) + S.pmxTick({ key: 'tk2', glyph: 'pin-lock', text: 'Followed 1 of your rules' }) +
        S.pmxTick({ key: 'tk3', glyph: 'check-circle', text: 'Verified' }) + S.pmxWash({ key: 'wash:' + t, html: 'revised line' }) + '</div>';
      case 'notes': return notes(t);
      case 'divider': return S.pmxDivider({ key: 'dv', text: 'Simple explanations from here' });
      case 'ledger-line': return S.pmxLedgerLine({ key: 'g-ll', kind: 'schedule', kindWord: 'Scheduled', glyph: 'check', headline: '<b>Sent</b> · Run the export tests again', time: T.at('2026-09-26T22:00:00Z', 'UTC', { day: true }), actions: [{ action: 'noop', label: 'Open' }] });
      case 'confirm': return '<div class="pmx-gallery-row" style="padding:4px 0">' + S.pmxInlineConfirm({ key: 'g-ic', sentence: 'Cancel this Crew? Everything so far is kept.', confirm: { action: 'noop', label: 'Cancel Crew' }, keep: { action: 'noop' } }) + '</div>';
      case 'md': return '<div class="pmx-gallery-md" style="padding:6px 0">' + S.pmxMd('## Why\nThe page builds a **40 MB** string *before* the download starts.\n\n```ts\nexport function exportCollection(rows) {\n  return rows.map(toCsv).join("\\n");\n}\n```\n\n| a | b |\n|---|---|\n| 1 | 2 |', { mode: 'compact', max: 3, open: { action: 'noop' } }) +
        S.pmxCodeRow({ kind: 'table', size: '5 rows', open: { action: 'noop' } }) + '</div>';
    }
    return '';
  }
  var STACK = [['ledger', 'rc1'], ['user', 'Can it stream instead of building the whole file first?'], ['text', 'Yes. Above about 5,000 rows the page builds a 40 MB string before the download starts. Streaming writes rows as they are read.'],
    ['people', 'collapsed'], ['people', 'starting'], ['people', 'live'], ['people', 'attention'], ['people', 'result'], ['ledger', 'files'], ['people', 'waiting'], ['people', 'failed'],
    ['ledger', 'notes'], ['ledger', 'divider'], ['ledger', 'ledger-line'], ['people', 'confirm'], ['people', 'review-live'], ['people', 'review-result'], ['people', 'storm-result'], ['prose', 'md'], ['ledger', 'rc2']];
  var FAMILY = { starting: 'people', waiting: 'people', live: 'people', collapsed: 'people', attention: 'people', result: 'people', failed: 'people', receipt: 'ledger' };
  X.messages = function () {
    var list = X.items === 'stack' ? STACK.slice() : [['user', 'Add CSV export to the collection page, with tests and a short docs note.'], [FAMILY[X.items] || 'people', X.items]];
    if (X.phase && X.items === 'stack') list.push(['people', 'live-new']);
    return list.map(function (it, i) {
      if (it[0] === 'user' || it[0] === 'text') return { id: 'pmxg-' + i, type: 'text', role: it[0] === 'user' ? 'user' : 'assistant', body: it[1] };
      return { id: 'pmxg-' + it[1], type: 'pmx-gallery', role: 'assistant', gid: it[1], family: it[0] };
    });
  };
  X.dockLines = function () {
    return [
      { runId: 'g2', tone: 'needs', html: S.pmxDockLine({ key: 'd1', tone: 'needs', runId: 'g2', markHtml: S.pmxKindMark('brainstorm', 16), kindWord: 'BrainStorm needs you', sentence: '· the team has 6 questions', action: { action: 'noop', label: 'Answer now' } }) },
      { runId: 'g1', tone: 'live', html: S.pmxDockLine({ key: 'd2', tone: 'live', runId: 'g1', markHtml: S.pmxKindMark('crew', 16), kindWord: 'Crew', sentence: '· Stream the export · Data mapper is editing export.ts', time: clock(242 + X.tick), action: { action: 'pmx-dock-show', attrs: 'data-run="g1"', label: 'Show' } }) },
      { tone: 'comingup', html: S.pmxDockLine({ key: 'd3', tone: 'comingup', markHtml: S.pmxKindMark('schedule', 16), kindWord: 'Coming up', sentence: '· Nightly build at 2:00 AM', time: 'in 3 h', action: { action: 'noop', label: 'Show' } }) },
      { tone: 'live', html: S.pmxDockLine({ key: 'd4', tone: 'yourmove', markHtml: S.pmxKindMark('chat_room', 16), kindWord: 'Chat Room', sentence: '· Round 1 done, your move', action: { action: 'noop', label: 'Review' } }) }
    ];
  };
  X.dockOverflow = function () { return S.pmxDock(X.dockLines().slice(0, 3).map(function (l) { return l.html; }).join(''), 'and 1 more live run · Activity'); };

  /* ================================================================ run view */
  function runView() {
    /* the hands lines leave the Coordinator BELOW its label (review cycle 1: they ran 2.9 px from "Coordinator"):
       the label's baseline is the seat's y + 35 and "Coordinator" has no descenders, so its box ends by y + 38;
       the lines start 9 px under that (plus the 1.5 px half stroke) and stop 4 px above the helpers' marks */
    var LY = 26, HY = 112, L0 = LY + 38 + 9;
    var plate = S.pmxPlate({ key: 'vp', kind: 'crew', mode: 'compact', w: 700, h: 160, svg: PP.seat({ key: 'v-lead', x: 350, y: LY, role: 'lead', label: 'Coordinator' }) +
      PP.line({ key: 'v-l1', from: { x: 350, y: L0 }, to: { x: 180, y: HY - 18 }, style: 'hands' }) + PP.line({ key: 'v-l2', from: { x: 350, y: L0 }, to: { x: 520, y: HY - 18 }, style: 'hands' }) +
      PP.seat({ key: 'v-s1', x: 180, y: HY, role: 'builder', seat: 1, state: 'done', label: 'Data mapper' }) + PP.seat({ key: 'v-s2', x: 520, y: HY, role: 'checker', seat: 2, state: 'done', label: 'CSV specialist' }),
      legend: [{ sample: 'hands', label: 'hands out' }] });
    var tabs = S.pmxTabs({ key: 'v-tabs', items: [{ value: 's', label: 'Summary' }, { value: 'c', label: 'Conversation', count: 14 }, { value: 't', label: 'Team', count: 3 }, { value: 'k', label: 'Cost' }], current: 'c', action: 'noop', attr: 'data-tab' });
    var long = X.stream || 'Here is the plan for **streaming** the export.\n\n### Steps\n1. Read rows in pages of 500\n2. Write each page to the stream\n3. Close the stream\n\n```ts\nfor await (const page of pages(query, 500)) {\n  for (const row of page) stream.write(toCsv(row) + "\\n"); // a very long comment that must scroll inside its own box and never widen the view\n}\n```\n\n| Rows | Before | After |\n|---|---|---|\n| 5,000 | 40 MB | 1.2 MB |\n| 50,000 | 400 MB | 1.2 MB |\n\n> Keep the order exactly as on screen.\n\nSee [the docs](https://example.com/docs).';
    var main = S.pmxViewSection({ key: 'vs1', title: 'Conversation', meta: 'everyone · 14 messages', body: S.pmxTimeline({ key: 'tl', filterHtml: S.pickerButton({ action: 'noop', anchor: 'g-filter', strong: 'Showing everyone' }), entries: [
      { key: 'collab-msg-m1', mid: 'm1', kind: 'system', bodyHtml: 'Started with 3 helpers.' },
      { key: 'collab-msg-m2', mid: 'm2', markHtml: mark('lead', 0, 22), who: 'Coordinator', when: '10:31 PM', bodyHtml: S.pmxMd(long, { mode: 'full' }) },
      { key: 'collab-msg-m3', mid: 'm3', markHtml: mark('builder', 1, 22), who: 'Data mapper', when: '10:33 PM', streaming: true, bodyHtml: 'Normalizing titles now' },
      { key: 'collab-msg-m4', mid: 'm4', kind: 'tool', markHtml: mark('checker', 2, 22), who: 'CSV specialist', when: '10:34 PM', bodyHtml: 'Ran <code>csv.test.ts</code> · 12 of 12 pass' }] }) }) +
      S.pmxViewSection({ key: 'vs2', title: 'Team', meta: 'Core team', body: S.pmxTeamRow({ key: 'tr1', kind: 'crew', cls: 'collab-participant', attrs: 'data-participant="p1"', markHtml: mark('builder', 1, 22, 'done'), name: 'Data mapper', route: 'Sonnet 4.6 · Work', outcome: 'checked', cost: '$0.31' }) +
        /* review cycle 2: the stand-in row comes from the builder (G-17 / D4: pmxTeamRow({standIn}) emits
           <small class="collab-route-eff ...">{sentence}<span class="pmx-fine">requested X · effective Y</span></small>),
           never hand-rolled here. standIn carries both pmxStandIn's input and its result (the builder takes either);
           a builder without the hook emits no .collab-route-eff / .pmx-route-eff and route-stack fails (the surface
           declares this row) */
        S.pmxTeamRow({ key: 'tr2', kind: 'crew', cls: 'collab-participant', attrs: 'data-participant="p3"', markHtml: mark('builder', 3, 22, 'done', true), name: 'Integrator',
          standIn: Object.assign({}, STAND_IN, STAND), outcome: 'checked', cost: S.pmxMoney(0.12) }) });
    var aside = S.pmxViewSection({ key: 'vs3', title: 'Figures', body: '<p class="pmx-fine">Worked ' + T.worked(520000) + '</p><p class="pmx-fine">' + S.pmxCost({ state: 'done', spent: 0.92, limit: 6 }) + '</p><p class="pmx-fine">' + S.pmxTokens(71000, { key: 'g-tokens' }) + '</p>' }) +
      S.pmxGuide({ key: 'g-doc-guide', placement: 'doc', cls: 'crew-demo-guide', step: 'This is the full record. Every message is here.', actions: [{ action: 'noop', label: 'Next' }] });
    return S.pmxView({ key: 'collab-view-g3', kind: 'crew', kindWord: 'Crew', title: 'Add CSV export', statusHtml: '<b>Finished</b> · all 3 parts checked',
      actionsHtml: '<button type="button" class="text-button" data-action="collab-message" data-run="g3v">Message</button><button type="button" class="text-button" data-action="noop">Run again with changes…</button>', plateHtml: plate, tabsHtml: tabs, mainHtml: main, asideHtml: aside });
  }
  function participantView() {
    return S.pmxView({ key: 'collab-view-g3p', kind: 'crew', kindWord: 'Crew', title: 'Add CSV export', statusHtml: '<b>Finished</b>', actionsHtml: '',
      /* G-17: the participant head shows the same stand-in sentence, from the builder (review cycle 2) */
      mainHtml: S.pmxParticipant({ kind: 'crew', role: 'Integrator', standIn: Object.assign({}, STAND_IN, STAND), emptyText: 'Nothing from Integrator yet.' }) +
        S.pmxParticipant({ role: 'Data mapper', messagesHtml: '<div class="collab-msg">' + S.pmxMd('Normalized **18** titles. Every one round-trips unchanged.', { mode: 'full' }) + '</div>' }) });
  }

  /* ================================================================ slots (all gated on the gallery flags) */
  E.slot('dialog', function (c) { var d = c.dialog || c.state.dialog; if (!d || d.type !== 'pmx-gallery') return ''; return X.sheet(d); });
  E.slot('transcriptMessage', function (c) { return c.m && c.m.type === 'pmx-gallery' ? chatEntry(c.m.gid, X.tick) : ''; });
  E.slot('transcriptFamily', function (c) { return c.m && c.m.type === 'pmx-gallery' ? (c.m.family || 'ledger') : ''; });
  E.slot('editorTabLabel', function (c) { return c.editorId === 'pmx-gallery-view' ? 'Crew · Add CSV export' : c.editorId === 'pmx-gallery-participant' ? 'Crew · Integrator' : ''; });
  E.slot('editorDocument', function (c) { return c.editorId === 'pmx-gallery-view' ? runView() : c.editorId === 'pmx-gallery-participant' ? participantView() : ''; });
  E.slot('composerBelow', function () { return X.guide ? S.pmxGuide({ key: 'pmx-gallery-guide', placement: 'dock', cls: 'crew-demo-guide', step: 'Step 3 of 6 · The Crew splits the job into three parts.', actions: [{ action: 'noop', label: 'Next' }, { action: 'noop', label: 'Back' }], close: { action: 'noop', label: 'Close the example' } }) : ''; });
  if (window.PM56_PMX && PM56_PMX.dock) PM56_PMX.dock.provide(function () { return X.dock ? X.dockLines() : []; });
}

/* ------------------------------------------------------------------ node side */
export async function installGallery(h) {
  const has = await h.ev(() => !!window.__PMXG);
  if (!has) await h.addScript('(' + galleryInPage.toString() + ')();');
}
export async function openSheet(h, d) {
  await installGallery(h);
  await h.ev(d => { const c = window.PM56_EXT.ctx(); c.state.menu = null; c.state.dialog = Object.assign({ type: 'pmx-gallery' }, d); c.renderOverlays(); }, d);
  await h.settle();
}
export async function openChat(h, o = {}) {
  await installGallery(h);
  await h.ev(o => {
    const c = window.PM56_EXT.ctx(); c.state.dialog = null; c.state.menu = null; c.renderOverlays();
    /* a run view left open by an earlier step would take the chat's room */
    for (const id of ['pmx-gallery-view', 'pmx-gallery-participant']) { try { c.closeEditor(id); } catch (e) { } }
    const X = window.__PMXG;
    X.items = o.items || 'stack'; X.tick = o.tick || 0; X.phase = o.phase || 0; X.stream = o.stream || null; X.dock = !!o.dock; X.guide = !!o.guide;
    const t = c.state.threads.find(x => x.id === 'plain');
    t.messages = X.messages();
    if (c.state.selectedThread !== 'plain') c.switchThread('plain');
    c.renderApp();
    const tr = document.querySelector('.transcript'); if (tr) { tr.style.scrollBehavior = 'auto'; tr.scrollTop = 0; }
  }, o);
  await h.settle();
}
export async function setGallery(h, patch) {
  await h.ev(p => { const X = window.__PMXG; Object.assign(X, p); const c = window.PM56_EXT.ctx(); const t = c.state.threads.find(x => x.id === 'plain'); t.messages = X.messages(); c.renderApp(); }, patch);
}
export async function openView(h, id = 'pmx-gallery-view') {
  await installGallery(h);
  await h.ev(id => { const c = window.PM56_EXT.ctx(); c.state.dialog = null; c.renderOverlays(); c.state.activity.open = false; c.openEditor(id); }, id);
  await h.settle();
}
export const DENSITIES = ['starting', 'waiting', 'live', 'collapsed', 'attention', 'result', 'failed', 'receipt'];
/* canon-names (IMPACT A2-27a): the principle-10 names each gallery surface shows. A card shows its kind word;
   the card actions that the fixture renders as text (Open Panel, Message) are declared where they appear.
   7.2: at the S tier (< 360 px) the kind word is hidden (the mark stays) and actions shorten to "Open", so both are
   required only on cards at least 360 wide (receipts: C13 "at the S tier the kind word drops first"). */
const S360 = n => ({ name: n, minCard: 360 });
/* Below 260 px (the S tier's narrowest band) Message moves into the card's More menu (E-05, provisional (a):
   actions may sit behind Expand/More on narrow cards), so it is required only on cards at least 260 px wide. */
const CARD_CANON = { starting: [S360('BrainStorm'), S360('Open Panel')], waiting: [S360('Crew'), S360('Open Panel')], live: [S360('Crew'), S360('Open Panel'), { name: 'Message', minCard: 260 }],
  collapsed: [S360('Chat Room')], attention: [S360('Crew'), S360('Open Panel'), { name: 'Message', minCard: 260 }], result: [S360('Crew'), S360('Open Panel'), { name: 'Message', minCard: 260 }], failed: [S360('Review')], receipt: [S360('Crew')] };
export const SHEETS = [
  { id: 'sheet-crew-1', which: 'crew', helpers: 1, common: true, canon: ['Crew', 'Wonderer', 'Grill Me'], title: 'Crew sheet, 1 helper (plate grows, G-37)' },
  { id: 'sheet-crew-3', which: 'crew', helpers: 3, common: true, canon: ['Crew', 'Wonderer', 'Grill Me'], title: 'Crew sheet, 3 helpers (full plate)' },
  { id: 'sheet-crew-4', which: 'crew', helpers: 4, common: true, rosterScrollAfterYield: ['1280x800'], canon: ['Crew', 'Wonderer', 'Grill Me'], title: 'Crew sheet, 4 helpers (compact plate)' },
  { id: 'sheet-crew-5', which: 'crew', helpers: 5, common: true, rosterScrollAfterYield: ['1280x800'], canon: ['Crew', 'Wonderer', 'Grill Me'], title: 'Crew sheet, 5 helpers (strip plate)' },
  { id: 'sheet-crew-8', which: 'crew', helpers: 8, common: false, rosterMayScroll: true, canon: ['Crew', 'Wonderer', 'Grill Me'], title: 'Crew sheet, 8 helpers (wrapped plate on two rows, roster scrolls)' },
  { id: 'sheet-crew-advanced', which: 'crew', helpers: 3, advanced: true, refusal: true, saved: true, common: true, canon: ['Crew'], title: 'Crew sheet: Advanced page, refusal, saved default' },
  { id: 'sheet-std', which: 'std', common: true, canon: ['Back Seat Driver'], title: 'Standard sheet: switch, words, checks, tabs, stepper, disabled reason, sheet guide' },
  { id: 'sheet-confirm', which: 'confirm', common: true, title: 'Standard sheet in its confirmation state (A20)' },
  { id: 'sheet-compact', which: 'compact', common: true, canon: ['Revert Last Agent Edit', 'ELI5'], title: 'Compact sheet (Revert-like)' },
  { id: 'sheet-specimens', which: 'specimens', common: false, title: 'Specimens: every glyph, kind mark, silhouette, seat, state, plate atom' }
];

export default function gallerySurfaces() {
  const sheets = SHEETS.map(sd => ({
    id: 'gallery:' + sd.id, title: sd.title, kind: 'sheet', tags: ['gallery', 'sheet'], common: sd.common, rosterMayScroll: !!sd.rosterMayScroll, rosterScrollAfterYield: sd.rosterScrollAfterYield || [], canon: sd.canon || [],
    /* route-stack: a Crew roster with the Integrator (helper 3) discloses its stand-in on the roster page */
    routes: sd.which === 'crew' && !sd.advanced && (sd.helpers || 3) >= 3 ? [{ within: '.pmx-roster', min: 1, what: 'the Integrator roster row (Qwen 3.8 stands in)' }] : null,
    setup: installGallery,
    open: h => openSheet(h, sd),
    after: h => h.closeAll()
  }));
  const chatTick = async (h, i) => setGallery(h, { tick: i + 1 });
  const stack = {
    id: 'gallery:chat', title: 'Long-chat stack: every density, receipts, notes, ticks, divider, files row, markdown, dock, guide', kind: 'chat', tags: ['gallery', 'chat'],
    canon: ['Crew', 'Review', 'BrainStorm', 'Chat Room', 'Open Panel', 'Message'].map(S360),
    setup: installGallery,
    open: h => openChat(h, { items: 'stack', dock: true, guide: true }),
    tick: chatTick,
    change: async h => setGallery(h, { phase: 1 }),
    stream: async (h, md) => { await setGallery(h, { stream: md }); return { openView: () => openView(h) }; }
  };
  const cards = DENSITIES.map(d => ({
    id: 'gallery:card-' + d, title: 'One ' + d + ' card alone', kind: 'chat', tags: ['gallery', 'card'], canon: CARD_CANON[d] || [],
    setup: installGallery,
    open: h => openChat(h, { items: d }),
    tick: chatTick,
    change: async h => setGallery(h, { items: d === 'attention' ? 'result' : 'attention' })
  }));
  const views = [
    { id: 'gallery:view', title: 'Run view: plate, tabs, timeline (full markdown, streaming entry), team rows, doc guide', kind: 'view', tags: ['gallery', 'view'], setup: installGallery, open: h => openView(h, 'pmx-gallery-view'),
      routes: [{ within: '.pmx-team-row', min: 1, what: 'the Integrator team row, pmxTeamRow({standIn}) (G-17 / D4)' }],
      stream: async (h, md) => { await h.ev(md => { window.__PMXG.stream = md; window.PM56_EXT.ctx().renderApp(); }, md); return { openView: () => openView(h, 'pmx-gallery-view') }; } },
    { id: 'gallery:view-participant', title: 'Run view: participant (D5) with a stand-in route', kind: 'view', tags: ['gallery', 'view'], setup: installGallery, open: h => openView(h, 'pmx-gallery-participant'),
      routes: [{ within: '.pmx-participant', min: 1, what: 'the Integrator participant head (G-17: the same sentence)' }] }
  ];
  return [...sheets, stack, ...cards, ...views];
}
