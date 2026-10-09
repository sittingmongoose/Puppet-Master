const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../module-shell.js', 'utf8');
global.window = {};
eval(src);
/* The app context module-shell.js reads lazily (IMPACT A2-09: pmxGlyph falls back to the app's icon()
   through PM56_EXT.ctx().icon / hasIcon): the real PATHS table read out of app.js, drawn the way
   app.js's icon() draws it, marked data-app-icon so a check can tell which table drew a glyph. */
const APP_PATHS = (() => {
  try {
    const a = fs.readFileSync(__dirname + '/../app.js', 'utf8'), i = a.indexOf('const PATHS = {');
    if (i < 0) return {};
    const j = a.indexOf('{', i);
    for (let p = j, d = 0; p < a.length; p++) { if (a[p] === '{') d++; else if (a[p] === '}' && !--d) return require('vm').runInNewContext('(' + a.slice(j, p + 1) + ')'); }
  } catch (e) { }
  return {};
})();
const appHas = n => Object.prototype.hasOwnProperty.call(APP_PATHS, n);
window.PM56_EXT = { ctx: () => ({
  icon: (n, size = 15, c = '') => '<svg class="' + c + '" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-app-icon="' + n + '">' + (APP_PATHS[n] || APP_PATHS.info || '') + '</svg>',
  hasIcon: appHas
}) };
const S = window.PM56_SHELL;
/* The legacy dialog-grammar builders were retired at F0 step 8 (IMPACT A1-51, closing 2026-09-28); the first
   IIFE keeps esc, pickerButton (still called by Collaboration, Scheduling, BSD, ELI5, New chat defaults, Review,
   BrainStorm and the run views) and CHEVRON. */
const d = S.pickerButton({ action: 'a', anchor: 'b', strong: 'V', small: 's', iconHtml: '<svg/>' });
const RETIRED = ['dialog', 'section', 'field', 'grid2', 'seg', 'tabs', 'disclosure', 'choice', 'chip', 'rows', 'note', 'stat', 'stats', 'foot', 'card', 'cardHead', 'copy', 'check'];
const checks = [
  ['picker', d.includes('shared-picker-button') && d.includes('data-menu-anchor="b"') && d.includes('<small>s</small>') && d.includes('data-action="a"')],
  ['picker default chevron', S.pickerButton({ action: 'a', anchor: 'b', strong: 'V' }).includes(S.CHEVRON)],
  ['esc', S.esc('<a b="c">') === '&lt;a b=&quot;c&quot;&gt;'],
  ['A1-51 the retired legacy builders stay retired', RETIRED.every(n => S[n] === undefined)],
];

/* ======================================================================
   pmx builders (DESIGN-SPEC section 4, F0 step 2). Exact-substring checks
   for every builder on PM56_SHELL with the pmx prefix: the markup shape the
   spec fixes, the test-hook passthrough (cls, attrs and the named *Cls
   slots), keys, state attributes, and the inert preview (A16, G-22).
   A failed check prints `FAIL pmx <name>` and fails the run. Section 4.0's
   blanket convention ("every builder takes cls and attrs") is reported as
   `GAP` lines; they fail the run only with PMX_SELFCHECK_STRICT=1, because
   the per-builder signatures in the spec tables are the contract modules
   code against today.
   ====================================================================== */
const pmxChecks = [];
const gaps = [];
const impact = [];
const pc = (name, ok, detail) => { pmxChecks.push(['pmx ' + name, !!ok, detail]); };
const has = (s, ...subs) => subs.every(x => String(s).includes(x));
const BAL_TAGS = 'section|div|span|button|label|article|details|summary|footer|header|p|small|strong|b|i|figure|figcaption|ul|ol|li|svg|g|h2|h3|h4|h5|blockquote|pre|code|table|thead|tbody|tr|th|td|aside|output|textarea|em|a|q|s|mark|text';
const balanced = (h) => {
  const o = (String(h).match(new RegExp('<(' + BAL_TAGS + ')\\b', 'g')) || []).length;
  const c = (String(h).match(new RegExp('</(' + BAL_TAGS + ')>', 'g')) || []).length;
  return o === c;
};
const rootTag = (h) => (String(h).match(/^<[^>]*>/) || [''])[0];
const rootAfterScrim = (h) => rootTag(String(h).replace(/^<div class="pmx-scrim"[^>]*><\/div>/, ''));
/* Every builder output checked below is also checked for tag balance. */
const built = [];
const B = (name, html) => { built.push([name, html]); return html; };

(function pmxSection() {
  const X = S;
  const crypto = require('crypto');
  const path = require('path');

  /* 0. The first IIFE (the pre-pmx module-shell.js, HEAD 45cefbecd8) is no longer byte-identical: F0 step 8 (IMPACT
        A1-51) retired its unused legacy builders. What must hold is that it still defines only esc, pickerButton and
        CHEVRON, unchanged in shape (the checks above), and nothing else. */
  const end = src.indexOf('})();\n');
  const prefix = end >= 0 ? src.slice(0, end + 6) : '';
  const firstApi = (/window\.PM56_SHELL\s*=\s*\{([^}]*)\}/.exec(prefix) || ['', ''])[1].split(',').map(x => x.split(':')[0].trim()).filter(Boolean).sort();
  pc('first IIFE exports only esc, pickerButton and CHEVRON (legacy builders retired, A1-51)', firstApi.join(',') === 'CHEVRON,esc,pickerButton', firstApi);
  pc('no emoji code points in module-shell.js (DON\'T 3)', !/[\p{Extended_Pictographic}\u{FE0F}\u{20E3}\u{1F1E6}-\u{1F1FF}]/u.test(src));

  /* 1. The API: every builder the spec names exists. */
  const API = ['PMX_GLYPHS', 'pmxGlyph', 'pmxKindMark', 'pmxMark', 'pmxPlateParts', 'pmxPlate', 'pmxHash',
    'pmxSheet', 'pmxQuestion', 'pmxHero', 'pmxCtl', 'pmxRoster', 'pmxRosterRow', 'pmxRoute', 'pmxShelf', 'pmxStepper', 'pmxSwitch', 'pmxCheck', 'pmxWords',
    'pmxPromise', 'pmxPromises', 'pmxAdvancedEntry', 'pmxAdvancedPage', 'pmxSetting', 'pmxPreview', 'pmxReadback', 'pmxEstimate', 'pmxRefusal', 'pmxFoot', 'pmxConfirm', 'pmxTabs',
    'pmxRun', 'pmxRunHead', 'pmxSentence', 'pmxTrack', 'pmxLane', 'pmxLanes', 'pmxDecision', 'pmxResult', 'pmxOutput', 'pmxCredits', 'pmxMeta', 'pmxActions', 'pmxReceipt',
    'pmxDockLine', 'pmxDock', 'pmxFinding', 'pmxSeverity', 'pmxAgree', 'pmxVoteBoard', 'pmxQuote', 'pmxNote', 'pmxTick', 'pmxDivider', 'pmxFilesRow', 'pmxCodeRow', 'pmxMd', 'pmxGuide',
    'pmxView', 'pmxViewSection', 'pmxTimeline', 'pmxTeamRow', 'pmxParticipant'];
  const missingApi = API.filter(n => X[n] == null);
  pc('every section-4 builder is on PM56_SHELL', missingApi.length === 0, missingApi);
  if (missingApi.length) return;

  /* 2. Glyphs (4.0, G-11) and kind marks (B2). */
  const GLYPHS = ['lock', 'not', 'eye', 'eye-closed', 'eye-lid', 'swap', 'check', 'check-circle', 'warn', 'hand', 'pause', 'slash-circle', 'ring', 'ring-dashed', 'arc', 'quote', 'file', 'file-edit',
    'code', 'table', 'bookmark', 'notebook', 'pin-lock', 'rewind', 'clock', 'clock-bar', 'calendar', 'chevron-right', 'plus', 'minus', 'copy', 'trash', 'sealed', 'spark-off'];
  /* IMPACT A2-09: one glyph lookup, PMX_GLYPHS then the app's icon() table, then the G-11 square */
  const noGlyph = GLYPHS.filter(n => !X.PMX_GLYPHS[n] && !appHas(n));
  pc('every glyph 4.0 names resolves (PMX_GLYPHS, else the app icon() table; A2-09)', noGlyph.length === 0, noGlyph);
  const viaApp = GLYPHS.filter(n => !X.PMX_GLYPHS[n]);
  pc('A2-09 a glyph only the app has draws through the app icon() with the pmx-glyph class, never the dashed square', Object.keys(APP_PATHS).length > 20 && viaApp.every(n => { const h = X.pmxGlyph(n, 13); return h.includes('data-app-icon="' + n + '"') && /class="[^"]*\bpmx-glyph\b/.test(h) && h.includes('width="13"') && !h.includes('pmx-glyph-missing'); }), viaApp);
  pc('A2-09 a PMX_GLYPHS name draws from PMX_GLYPHS (the pmx drawing wins inside pmx surfaces)', !X.pmxGlyph('check', 14).includes('data-app-icon'));
  const norm = v => String(typeof v === 'string' ? v : JSON.stringify(v)).replace(/\s+/g, ' ').replace(/\s*\/>/g, '/>').trim();
  const dupSame = Object.keys(X.PMX_GLYPHS).filter(n => appHas(n) && norm(X.PMX_GLYPHS[n]) === norm(APP_PATHS[n]));
  if (dupSame.length) impact.push('A2-09 the same drawing is in PMX_GLYPHS and app.js PATHS (remove one side): ' + dupSame.join(', '));
  const g14 = X.pmxGlyph('check', 14);
  pc('pmxGlyph: 24 grid, 1.8 stroke, round caps, sized', has(g14, '<svg class="pmx-glyph"', 'width="14" height="14"', 'viewBox="0 0 24 24"', 'stroke-width="1.8"', 'stroke-linecap="round"', 'stroke-linejoin="round"', 'aria-hidden="true"'));
  const infoLog = [], errLog = [];
  const oInfo = console.info, oErr = console.error;
  console.info = (...a) => infoLog.push(a.join(' ')); console.error = (...a) => errLog.push(a.join(' '));
  let threw = false, miss1 = '', miss2 = '';
  try { miss1 = X.pmxGlyph('no-such-glyph-x', 20); miss2 = X.pmxGlyph('no-such-glyph-x', 20); } catch (e) { threw = true; }
  console.info = oInfo; console.error = oErr;
  pc('G-11 unknown glyph never throws', !threw);
  pc('G-11 unknown glyph -> visible dashed square, requested size, pmx-glyph-missing', has(miss1, 'pmx-glyph-missing', 'width="20" height="20"', 'stroke-dasharray'));
  pc('G-11 unknown glyph logs once with console.info, never console.error', infoLog.length === 1 && errLog.length === 0 && miss1 === miss2, { info: infoLog.length, error: errLog.length });
  const KINDS = ['crew', 'crew-auto', 'chat_room', 'brainstorm', 'review', 'bsd', 'bsd-off', 'bsd-auto', 'bsd-on', 'schedule', 'build-at', 'scheduled', 'memory', 'teach', 'revert', 'eli5', 'defaults'];
  const badKinds = KINDS.filter(k => { const h = X.pmxKindMark(k); return !has(h, 'pmx-kind', 'width="16"') || h.includes('pmx-glyph-missing'); });
  pc('pmxKindMark draws every B2 kind at 16 px by default', badKinds.length === 0, badKinds);
  pc('pmxKindMark(kind, 26) honours the size', has(X.pmxKindMark('crew', 26), 'width="26" height="26"'));

  /* 3. B1 marks. */
  const mk = B('pmxMark', X.pmxMark({ key: 'mk1', role: 'Coordinator', seat: 3, size: 28, state: 'working', cls: 'hook-mark' }));
  pc('B1 pmxMark shape + hooks', has(mk, '<span class="pmx-mark hook-mark" data-k="mk1"', 'data-state="working"', 'data-size="28"', 'style="--pmx-seat:var(--pmx-seat-lead);--pmx-seat-fill:var(--pmx-seat-fill-lead)"', '<svg viewBox="0 0 28 28"'));
  pc('B1 seat hue and precomputed fill by seat number (A1-15: --pmx-seat-fill-N, no runtime colour maths)', has(X.pmxMark({ role: 'builder', seat: 3 }), '--pmx-seat:var(--pmx-seat-3);--pmx-seat-fill:var(--pmx-seat-fill-3)'));
  pc('B1 unknown role -> rounded square, never initials', has(X.pmxMark({ role: 'Zebra', seat: 1 }), 'data-sil="square"') && !/>[A-Z]{1,2}</.test(X.pmxMark({ role: 'Zebra', seat: 1 })));
  const states = ['idle', 'queued', 'working', 'done', 'needs', 'failed', 'abstained', 'optional'];
  pc('B1 every state renders as data-state', states.every(st => has(X.pmxMark({ role: 'checker', seat: 2, state: st }), 'data-state="' + st + '"')));
  pc('B1 standin notch is independent of state', has(X.pmxMark({ role: 'builder', seat: 1, state: 'done', standin: true }), 'data-standin="1"', 'data-state="done"'));

  /* 4. B3 plate and B4 parts. */
  const PP = X.pmxPlateParts;
  pc('B4 pmxPlateParts has every atom', ['band', 'seat', 'line', 'slot', 'screen', 'paper', 'you', 'chapter', 'table', 'cue', 'label'].every(n => typeof PP[n] === 'function'));
  pc('B4 band draws nothing', PP.band({ y: 0, h: 40, name: 'stage' }) === '');
  const seat = B('seat', PP.seat({ key: 's1', x: 10, y: 20, role: 'builder', seat: 1, state: 'working', label: 'Data mapper', sub: 'Sonnet', part: 'team' }));
  pc('B4 seat: keyed group, --x/--y, state, part', has(seat, '<g class="pmx-p-seat" data-k="s1" style="--x:10px;--y:20px" data-state="working" data-pmx-part="team">', 'Data mapper', 'Sonnet'));
  const line = PP.line({ key: 'l1', from: { x: 0, y: 0 }, to: { x: 10, y: 10 }, style: 'hands', part: 'assign' });
  pc('B4 line: style + part', has(line, 'class="pmx-p-line"', 'data-k="l1"', 'data-style="hands"', 'data-pmx-part="assign"'));
  pc('B4 line styles hands|fixed|toyou|sees', ['hands', 'fixed', 'toyou', 'sees'].every(st => has(PP.line({ from: { x: 0, y: 0 }, to: { x: 1, y: 1 }, style: st }), 'data-style="' + st + '"')));
  pc('B4 slot says "waits its turn"', has(B('slot', PP.slot({ key: 'sl', x: 1, y: 2 })), 'pmx-p-slot', 'waits its turn'));
  pc('B4 screen carries a part (default blind)', has(B('screen', PP.screen({ key: 'sc', x: 1, y: 2 })), 'data-pmx-part="blind"'));
  pc('B4 paper: folded corner + labels + lock', has(B('paper', PP.paper({ key: 'pa', x: 1, y: 2, label: 'The job', sub: 'Add CSV', lock: true })), 'pmx-p-paper', 'pmx-p-fold', 'The job', 'Add CSV'));
  pc('B4 you: two label lines', has(B('you', PP.you({ x: 1, y: 2, label: 'You', sub: 'get one checked result' })), 'data-pmx-part="you"', '>You<', 'get one checked result'));
  pc('B4 chapter / table / cue / label', has(B('chapter', PP.chapter({ key: 'c1', x: 5, label: 'Ideas', state: 'now' })), 'data-state="now"', 'Ideas') &&
    has(PP.table({ cx: 5, cy: 6, r: 7 }), 'pmx-p-table') && has(B('cue', PP.cue({ key: 'q', x: 3, kind: 'speaks', label: 'speaks' })), 'data-kind="speaks"') &&
    has(PP.label({ x: 1, y: 2, text: 'Lbl', part: 'lead' }), 'data-pmx-part="lead"', '>Lbl<'));
  const plate = B('pmxPlate', X.pmxPlate({ key: 'pl', kind: 'crew', mode: 'compact', w: 560, h: 160, svg: seat, legend: [{ sample: 'hands', label: 'hands out', part: 'assign' }], caption: 'cap', cls: 'hook-plate' }));
  pc('B3 pmxPlate shape', has(plate, '<figure class="pmx-plate hook-plate" data-k="pl" data-mode="compact"', '--pmx-plate-h:160px', '<svg class="pmx-plate-svg" viewBox="0 0 560 160"', '<ul class="pmx-legend">', 'data-pmx-part="assign"', 'hands out', '<figcaption class="pmx-fine', 'cap</figcaption>'));
  pc('B3 plate modes full|compact|strip', ['full', 'compact', 'strip'].every(m => has(X.pmxPlate({ mode: m }), 'data-mode="' + m + '"')));
  /* J-2 plate yield: pmxPlate fitH / align / attrs and the pmxPlateFit slot */
  if (typeof X.pmxPlateFit === 'function') {
    const pf = B('pmxPlate fitH', X.pmxPlate({ key: 'pf1', mode: 'full', w: 560, h: 170, fitH: 170, align: 'xMidYMin', attrs: 'data-hook="pl"', svg: '<g></g>' }));
    pc('J-2 pmxPlate fitH, align and attrs', has(pf, 'data-fit-h="170"', 'preserveAspectRatio="xMidYMin meet"', ' data-hook="pl"', 'data-k="pf1"'));
    pc('J-2 pmxPlate align falls back to xMidYMid', has(X.pmxPlate({ align: 'bogus"><script>' }), 'preserveAspectRatio="xMidYMid meet"') && !X.pmxPlate({ align: 'bogus"><script>' }).includes('<script>'));
    pc('J-2 pmxPlate without fitH has no data-fit-h', !X.pmxPlate({ mode: 'full' }).includes('data-fit-h'));
    const slot = B('pmxPlateFit', X.pmxPlateFit({ key: 'fit', min: 96, fit: 'compact', affects: 'team', cls: 'hook-fit', plates: [X.pmxPlate({ mode: 'full', fitH: 170 }), X.pmxPlate({ mode: 'compact', fitH: 120 })] }));
    pc('J-2 pmxPlateFit slot shape', has(slot, '<div class="pmx-plate-fit hook-fit" data-k="fit" data-fit="compact" style="--pmx-fit-min:96px" data-pmx-affects="team">', 'data-mode="full"', 'data-mode="compact"') && slot.endsWith('</figure></div>'));
    pc('J-2 pmxPlateFit escapes fit and defaults min 72', has(X.pmxPlateFit({ fit: 'a"b', plates: '' }), 'data-fit="a&quot;b"', '--pmx-fit-min:72px'));
    pc('J-2 pmxPlateFit keeps the plates in the given order (richest first)', (() => { const h = X.pmxPlateFit({ fit: 'x', plates: ['<i id="a"></i>', '<i id="b"></i>'] }); return h.indexOf('id="a"') < h.indexOf('id="b"'); })());
  } else pc('J-2 pmxPlateFit exists', false);

  /* Small builders the first pass left unexercised: roster foot, findings wrapper, sealed notes, wash,
     the preview transform and the language names. */
  const addRow = B('pmxAddRow', X.pmxAddRow({ action: 'collab-modal-add-participant', attrs: 'data-hook="add"', cls: 'hook-add', disabled: true }));
  pc('pmxAddRow shape', has(addRow, '<button type="button" class="text-button pmx-addrow hook-add" data-action="collab-modal-add-participant" data-hook="add" disabled>', '<span>Add a helper</span></button>') && addRow.includes('<svg'));
  pc('pmxAddRow custom label, enabled', has(X.pmxAddRow({ action: 'a', label: 'Add a reviewer' }), '<span>Add a reviewer</span>') && !X.pmxAddRow({ action: 'a' }).includes(' disabled'));
  pc('pmxFindings wrapper', has(B('pmxFindings', X.pmxFindings('<article>F</article>', { key: 'fl', cls: 'hook-fl' })), '<div class="pmx-findings hook-fl" data-k="fl"><article>F</article></div>'));
  pc('pmxSealed n squares, clamped 0..6, decorative', (X.pmxSealed(3).match(/<i><\/i>/g) || []).length === 3 && (X.pmxSealed(9).match(/<i><\/i>/g) || []).length === 6 && !X.pmxSealed(-2).includes('<i>') && has(X.pmxSealed(1), '<span class="pmx-sealed" aria-hidden="true">'));
  pc('pmxWash shape', has(B('pmxWash', X.pmxWash({ key: 'w1', html: 'revised line' })), '<span class="pmx-wash" data-k="w1">revised line</span>'));
  const inertOut = X.pmxInert('<div class="pmx-run collab-card" data-k="c1" data-run-id="r1"><button type="button" class="primary-button pmx-act" data-action="go" data-run="r1" tabindex="0" disabled>Go</button><span data-menu-anchor="m" data-pm-keep="1" data-pmx-autofocus>x</span></div>');
  pc('pmxInert: buttons become spans, hooks and focus go, keys get pv:, only pmx/look classes stay', has(inertOut, 'data-k="pv:c1"', '<span class="primary-button pmx-act">Go</span>', 'class="pmx-run"') &&
    !/data-action|data-run|data-menu-anchor|data-pm-keep|data-pmx-autofocus|tabindex|disabled|type="button"|<button|collab-card/.test(inertOut), inertOut.slice(0, 200));
  pc('pmxLangName known, unknown and empty', X.pmxLangName('ts') === 'TypeScript' && X.pmxLangName('SH') === 'Shell' && X.pmxLangName('elixir') === 'Elixir' && X.pmxLangName('') === '');

  /* 5. A: sheet primitives. */
  const sheet = B('pmxSheet', X.pmxSheet({ type: 'collab-configure', kind: 'crew', size: 'wide', cls: 'collab-configure hook-sheet', attrs: 'data-hook="sheet"', title: 'Set up a Crew', lead: 'Lead text',
    closeAction: 'collab-modal-cancel', closeAttrs: 'data-thread="t1"', hero: '<i>HERO</i>', main: '<i>MAIN</i>', side: '<i>SIDE</i>', foot: '<footer>FOOT</footer>', ariaLabel: 'Set up a Crew' }));
  pc('A1 returns the scrim first', sheet.startsWith('<div class="pmx-scrim" data-k="pmx-scrim" data-action="pmx-scrim" data-close="collab-modal-cancel" aria-hidden="true"></div>'));
  const sroot = rootAfterScrim(sheet);
  pc('A1 sheet root: classes, key, kind, advanced, cls + attrs passthrough', has(sroot, 'class="dialog mdl pmx-sheet pmx-sheet--wide collab-configure hook-sheet"', 'data-k="dlg:collab-configure:crew"', 'data-pmx-kind="crew"', 'data-advanced="0"', 'data-hook="sheet"', 'role="dialog"', 'aria-modal="true"', 'aria-label="Set up a Crew"'));
  pc('A1 head keeps the harness hooks (.mdl-head, .mdl-title strong/span, .mdl-head button.icon-button)', has(sheet, '<header class="mdl-head pmx-head"><span class="mdl-icon pmx-head-mark">', '<div class="mdl-title pmx-title"><strong>Set up a Crew</strong><span>Lead text</span></div><span class="spacer"></span>', '<button type="button" class="icon-button pmx-close" data-action="collab-modal-cancel"'));
  pc('A1 G-08 closeAttrs on the close button', /<button type="button" class="icon-button pmx-close" data-action="collab-modal-cancel" data-thread="t1"[^>]*aria-label="Close">/.test(sheet));
  pc('A1 body: two columns, then hero before body, foot last', has(sheet, '<div class="mdl-body pmx-body" data-layout="two"><div class="pmx-col pmx-col--main"><i>MAIN</i></div><div class="pmx-col pmx-col--side"><i>SIDE</i></div></div><footer>FOOT</footer></section>') && sheet.indexOf('HERO') < sheet.indexOf('pmx-body'));
  const sheetAdv = X.pmxSheet({ type: 't', kind: 'crew', advancedOpen: true, advancedHtml: '<i>ADV</i>', main: '<i>MAIN</i>', side: '<i>SIDE</i>' });
  pc('A1 advancedOpen: data-advanced="1", the page replaces the columns', has(sheetAdv, 'data-advanced="1"', '<i>ADV</i>') && !sheetAdv.includes('MAIN'));
  pc('A1 body mode: one layout', has(X.pmxSheet({ type: 't', kind: 'crew', body: '<i>BODY</i>' }), 'data-layout="one"><i>BODY</i></div>'));
  pc('A1 sizes standard|compact', has(X.pmxSheet({ kind: 'crew', size: 'standard' }), 'pmx-sheet--standard') && has(X.pmxSheet({ kind: 'crew', size: 'compact' }), 'pmx-sheet--compact'));
  pc('A1 data-state (confirm|refused) from the template', has(rootAfterScrim(X.pmxSheet({ kind: 'crew', state: 'refused' })), 'data-state="refused"'));

  const q = B('pmxQuestion', X.pmxQuestion({ key: 'q2', n: 2, title: 'Who is in', meta: '3 helpers', helper: 'Help', body: '<i>B</i>', affects: 'team', cls: 'hook-q', state: 'error' }));
  pc('A2 pmxQuestion shape (keeps .mdl-section)', q === '<section class="mdl-section pmx-q hook-q" data-k="q2" data-pmx-affects="team" data-state="error"><header class="pmx-q-head"><span class="pmx-q-n">2</span><h3 class="pmx-q-title">Who is in</h3><span class="pmx-q-meta">3 helpers</span></header><p class="pmx-help">Help</p><div class="pmx-q-body"><i>B</i></div></section>', q);

  const hero = B('pmxHero', X.pmxHero({ key: 'h1', n: 1, title: 'What?', helper: 'Help', cls: 'hook-hero', headAside: '<i>ASIDE</i>', preview: '<i>PV</i>', aside: '<i>AS</i>',
    field: { tag: 'textarea', attrs: 'data-collab-input="task"', value: 'a <b> & "c"', placeholder: 'Describe "it"' } }));
  pc('A3 pmxHero shape, hooks, escaped value, autofocus, 3 rows', has(hero, 'class="mdl-section pmx-hero hook-hero" data-k="h1"', '<div class="pmx-hero-main"><header class="pmx-q-head"><span class="pmx-q-n">1</span><h3 class="pmx-q-title">What?</h3>',
    '<i>ASIDE</i>', '<textarea class="pmx-hero-field" rows="3" data-pmx-autofocus data-collab-input="task" placeholder="Describe &quot;it&quot;">a &lt;b&gt; &amp; &quot;c&quot;</textarea>', '<p class="pmx-help">Help</p>', '<div class="pmx-hero-side"><i>PV</i><i>AS</i></div>'));
  pc('A3 input field variant', has(X.pmxHero({ field: { tag: 'input', attrs: 'data-x="1"', value: 'v' } }), '<input type="text" class="pmx-hero-field', 'data-pmx-autofocus', 'data-x="1"', 'value="v"'));

  const ctl = B('pmxCtl', X.pmxCtl({ key: 'c1', label: 'Lbl', helper: 'Hlp', control: '<i>C</i>', affects: 'lead', reason: 'Why not', cls: 'hook-ctl' }));
  pc('A4 pmxCtl shape', ctl === '<div class="pmx-ctl hook-ctl" data-k="c1" data-layout="row" data-pmx-affects="lead"><div class="pmx-ctl-copy"><span class="pmx-ctl-label">Lbl</span><span class="pmx-help">Hlp</span></div><div class="pmx-ctl-control"><i>C</i></div><p class="pmx-reason">Why not</p></div>', ctl);
  pc('A4 layout stack', has(X.pmxCtl({ layout: 'stack' }), 'data-layout="stack"'));

  const roster = B('pmxRoster', X.pmxRoster({ key: 'ro', cols: [{ label: 'Job', helper: 'What it does' }, { label: 'AI model', helper: 'Which AI' }], rowsHtml: '<i>ROWS</i>', rowsCls: 'collab-draft-rows', rowsAttrs: 'data-hook="rows"', foot: '<i>FOOT</i>' }));
  pc('A5 pmxRoster: headers once, rowsCls/rowsAttrs passthrough, foot', has(roster, '<div class="pmx-roster" data-k="ro"', '<div class="pmx-roster-head"><span></span><span class="pmx-roster-col"><b>Job</b><small>What it does</small></span><span class="pmx-roster-col"><b>AI model</b><small>Which AI</small></span><span></span></div>',
    '<div class="pmx-roster-rows collab-draft-rows" data-hook="rows"><i>ROWS</i></div>', '<div class="pmx-roster-foot"><i>FOOT</i></div>'));

  const row = B('pmxRosterRow', X.pmxRosterRow({ key: 'collab-draftrow-r1', cls: 'collab-draft-row collab-participant-editor-row', attrs: 'data-row="r1"', mark: '<i>M</i>', state: 'error', failure: 'model_unavailable',
    job: { attrs: 'data-collab-input="role" data-row="r1"', value: 'Data "mapper"', placeholder: 'What it does' }, model: '<i>MODEL</i>', persona: '<i>PERSONA</i>',
    actions: [{ action: 'collab-remove-row', attrs: 'data-row="r1"', label: 'Remove helper', glyph: 'trash' }], route: '<p>ROUTE</p>', note: 'Note' }));
  pc('A6 pmxRosterRow root: cls + attrs + state + failure + flip', has(rootTag(row), 'class="pmx-row collab-draft-row collab-participant-editor-row"', 'data-k="collab-draftrow-r1"', 'data-pmx-flip', 'data-state="error"', 'data-failure="model_unavailable"', 'data-row="r1"'));
  pc('A6 pmxRosterRow parts', has(row, '<span class="pmx-row-mark"><i>M</i></span>', '<input type="text" class="pmx-row-job" data-collab-input="role" data-row="r1" value="Data &quot;mapper&quot;" placeholder="What it does">',
    '<span class="pmx-row-model"><i>MODEL</i></span><span class="pmx-row-persona"><i>PERSONA</i></span>', '<span class="pmx-row-acts"><button type="button" class="icon-button pmx-row-act" data-action="collab-remove-row" data-row="r1" aria-label="Remove helper">', '<p>ROUTE</p>', '<p class="pmx-row-note">Note</p>'));
  pc('A6 readonly job', has(X.pmxRosterRow({ job: { value: 'x', readonly: true } }), ' readonly>'));

  const route = B('pmxRoute', X.pmxRoute({ cls: 'collab-route-eff collab-route-eff-sub', attrs: 'data-row="r1"', strong: 'Qwen is offline,', text: 'so Qwen 3.8 stands in.', fine: 'requested A · effective B', tone: 'info' }));
  pc('A7 pmxRoute: hooks, tone, swap glyph, fine print', has(route, '<p class="pmx-route collab-route-eff collab-route-eff-sub" data-tone="info" data-row="r1"><svg class="pmx-glyph"', '<b>Qwen is offline,</b> so Qwen 3.8 stands in.', '<small class="pmx-fine">requested A · effective B</small>'));
  pc('A7 tone failed', has(X.pmxRoute({ tone: 'failed' }), 'data-tone="failed"'));

  const shelf = B('pmxShelf', X.pmxShelf({ key: 'sh', title: 'Add specialists', helper: 'Optional helpers', items: [
    { key: 'sp-w', mark: '<i>W</i>', name: 'Wonderer', helper: 'Ideas', state: 'off', input: { attrs: 'data-collab-input="wonderer"' } },
    { key: 'sp-g', mark: '<i>G</i>', name: 'Grill Me', helper: 'Asks', state: 'on', input: { attrs: 'data-collab-input="grillMe"' }, control: '<i>CTRL</i>' },
    { key: 'sp-x', mark: '<i>X</i>', name: 'Other', state: 'disabled', reason: 'Not available in this preview yet.' }] }));
  pc('A8 pmxShelf head (canon title, Optional)', has(shelf, '<div class="pmx-shelf" data-k="sh"', '<h3 class="pmx-q-title">Add specialists</h3><span class="pmx-q-meta">Optional</span></header><p class="pmx-help">Optional helpers</p>'));
  pc('A8 off item: real checkbox inside the Add label', has(shelf, '<div class="pmx-spec" data-k="sp-w" data-state="off"', '<div class="pmx-spec-copy"><b>Wonderer</b><span class="pmx-help">Ideas</span></div>', '<label class="pmx-add"', '<input type="checkbox" class="pmx-add-input" data-collab-input="wonderer" data-pmx-harness>', '<span>Add</span></label>'));
  pc('A8 on item: checked, Remove, control shown', has(shelf, 'data-k="sp-g" data-state="on"', '<input type="checkbox" class="pmx-add-input" data-collab-input="grillMe" checked data-pmx-harness>', '<span>Remove</span>', '<i>CTRL</i>'));
  pc('A8 Add / Remove glyphs resolve (plus, minus; A2-09), no dashed square', !shelf.includes('pmx-glyph-missing') && has(shelf, 'data-app-icon="plus"', 'data-app-icon="minus"'));
  pc('A8 disabled item: the reason replaces Add', has(shelf, 'data-k="sp-x" data-state="disabled"', '<p class="pmx-reason">Not available in this preview yet.</p>') && !/data-k="sp-x"[^]*?pmx-add-input[^]*?<\/div><\/div>$/.test(shelf));

  const step = B('pmxStepper', X.pmxStepper({ key: 'st', input: { key: 'cfg-parallelism', attrs: 'data-collab-input="cfg-parallelism"' }, value: 3, min: 1, max: 8, cap: 2, capText: 'Your plan runs 2 at once.', unit: 'at once', affects: 'parallel' }));
  pc('A9 pmxStepper buttons: pmx-step, data-for, delta, labels', has(step, '<div class="pmx-stepper" data-k="st" data-pmx-affects="parallel">', '<button type="button" class="pmx-step" data-action="pmx-step" data-for="cfg-parallelism" data-delta="-1" aria-label="Fewer"', 'data-delta="1" aria-label="More"'));
  pc('A9 cells: on up to cap, hatched above cap up to value', has(step, '<span class="pmx-cells"', '<i class="pmx-cell" data-on="1" data-hatch="0"></i><i class="pmx-cell" data-on="1" data-hatch="0"></i><i class="pmx-cell" data-on="0" data-hatch="1"></i><i class="pmx-cell" data-on="0" data-hatch="0"></i>'));
  pc('A9 value output + real input kept (min/max, tabindex -1)', has(step, '<output class="pmx-step-val"><b', '>3</b> <small>at once</small></output>', '<input type="number" class="pmx-step-input" data-collab-input="cfg-parallelism" value="3" min="1" max="8" tabindex="-1"', '<p class="pmx-step-cap">Your plan runs 2 at once.</p>'));
  pc('A9 Fewer disabled at min', /data-delta="-1" aria-label="Fewer" disabled>/.test(X.pmxStepper({ value: 1, min: 1, max: 4 })));

  const sw = B('pmxSwitch', X.pmxSwitch({ key: 'sw', current: 'auto', action: 'set-bsd-mode', affects: 'mode', options: [{ value: 'off', label: 'Off', helper: 'Never' }, { value: 'auto', label: 'Auto', helper: 'Risks', attrs: 'data-hook="auto"' }, { value: 'on', label: 'On' }] }));
  pc('A10 pmxSwitch: radiogroup, --i/--n, chosen word, rule', has(sw, 'class="pmx-switch" role="radiogroup"', 'data-k="sw"', 'data-pmx-affects="mode"', 'style="--i:1;--n:3"',
    '<button type="button" role="radio" aria-checked="true" class="pmx-switch-opt" data-action="set-bsd-mode" data-value="auto" data-hook="auto"><span class="pmx-switch-word">Auto</span><span class="pmx-switch-help">Risks</span></button>',
    'aria-checked="false" class="pmx-switch-opt" data-action="set-bsd-mode" data-value="off"', '<i class="pmx-switch-rule" aria-hidden="true"></i></div>'));

  const ck = B('pmxCheck', X.pmxCheck({ key: 'ck', cls: 'hook-check', attrs: 'data-bsd-field="cmd"', checked: true, label: 'Commands', helper: 'Incl. files' }));
  pc('A11 pmxCheck shape (attrs on the real input, marked data-pmx-harness: A2-19)', ck === '<label class="pmx-check hook-check" data-k="ck"><input type="checkbox" data-bsd-field="cmd" checked data-pmx-harness><span class="pmx-box" aria-hidden="true"></span><span class="pmx-check-copy"><b>Commands</b><small>Incl. files</small></span></label>', ck);
  pc('A11 disabled', has(X.pmxCheck({ disabled: true }), ' disabled data-pmx-harness>'));

  const words = B('pmxWords', X.pmxWords({ key: 'wd', action: 'sched-toggle-day', items: [{ value: 'mon', label: 'Mon', on: true, attrs: 'data-hook="mon"' }, { value: 'tue', label: 'Tue', on: false }] }));
  pc('A12 pmxWords: group, pressed words, check glyph only when on', has(words, 'class="pmx-words" role="group"', 'data-k="wd"', '<button type="button" class="pmx-word" data-action="sched-toggle-day" data-value="mon" aria-pressed="true" data-hook="mon"><svg', '>Mon</button>', '<button type="button" class="pmx-word" data-action="sched-toggle-day" data-value="tue" aria-pressed="false">Tue</button>'));

  const pr = B('pmxPromise', X.pmxPromise({ key: 'p1', glyph: 'lock', strong: 'Helpers can’t do more than this chat', text: '(Agent).', cls: 'hook-promise', extra: '<i>EXTRA</i>' }));
  pc('A13 pmxPromise shape + extra (hidden test nodes)', has(pr, '<p class="pmx-promise hook-promise" data-k="p1">', '<span><b>Helpers can’t do more than this chat</b> (Agent).</span><i>EXTRA</i></p>'));
  const prH = X.pmxPromise({ key: 'p2', glyph: 'lock', strong: 'Review never changes your files.', harness: '<label class="collab-checkbox-row"><input type="checkbox" disabled> Auto-repair: permanently off</label>' });
  pc('A2-19 A13 the Auto-repair test row rides in a visually clipped node marked data-pmx-harness', has(prH, '<span class="pmx-sr" data-pmx-harness><label class="collab-checkbox-row">'));
  pc('A13 pmxPromises wraps', X.pmxPromises('<p>x</p>') === '<div class="pmx-promises"><p>x</p></div>');

  const adv = B('pmxAdvancedEntry', X.pmxAdvancedEntry({ key: 'adv', summary: 'Stops after 45 min' }));
  pc('A14 Advanced entry', has(adv, '<button type="button" class="pmx-adv" data-k="adv" data-action="pmx-advanced" data-value="1" aria-expanded="false"', '<span class="pmx-adv-label">Advanced</span><span class="pmx-adv-sum">Stops after 45 min</span>'));
  const advp = B('pmxAdvancedPage', X.pmxAdvancedPage({ key: 'ap', title: 'Advanced', intro: 'Intro', rows: '<i>ROWS</i>' }));
  pc('A14 Advanced page: Back to setup, grid', has(advp, '<div class="pmx-advpage" data-k="ap"><header class="pmx-advpage-head"><h3 class="pmx-q-title">Advanced</h3><p class="pmx-help">Intro</p><button type="button" class="text-button" data-action="pmx-advanced" data-value="0">', 'Back to setup</button></header><div class="pmx-advgrid"><i>ROWS</i></div></div>'));

  const set = B('pmxSetting', X.pmxSetting({ key: 's1', label: 'Time limit', sentence: 'Stops after 45 minutes.', helper: 'Kept.', control: '<i>C</i>', affects: 'limit' }));
  pc('A15 pmxSetting shape', has(set, '<div class="pmx-set" data-k="s1"', '<div class="pmx-set-copy"><span class="pmx-ctl-label">Time limit</span><p class="pmx-set-say">Stops after 45 minutes.</p><span class="pmx-help">Kept.</span></div><div class="pmx-set-control"><i>C</i></div></div>'));

  const pv = B('pmxPreview', X.pmxPreview({ key: 'pv', cardHtml: '<i>CARD</i>', scale: 0.58, label: 'In your chat' }));
  pc('A16 pmxPreview: scale var, caption, tray, flight source', pv === '<figure class="pmx-preview" data-k="pv" style="--pmx-preview-scale:0.58"><figcaption class="pmx-fine">In your chat</figcaption><div class="pmx-preview-tray"><div class="pmx-preview-card" data-pmx-flight-source><i>CARD</i></div></div></figure>', pv);

  const rb = B('pmxReadback', X.pmxReadback({ key: 'rb', parts: [{ part: 'team', html: '<b>3 helpers</b> ' }, { part: 'lead', html: 'checks.', key: 'rb-l' }] }));
  pc('A17 pmxReadback parts carry data-pmx-part', has(rb, '<p class="pmx-readback" data-k="rb"><span class="pmx-rb" data-pmx-part="team"><b>3 helpers</b> </span><span class="pmx-rb" data-pmx-part="lead" data-k="rb-l">checks.</span></p>'));
  pc('A17 pmxEstimate text and recorded', X.pmxEstimate({ text: 'About 5 min' }) === '<p class="pmx-estimate">About 5 min</p>' && has(X.pmxEstimate({ recorded: true }), 'Recorded example · no AI cost'));

  const ref = B('pmxRefusal', X.pmxRefusal({ code: 'model_unavailable', strong: 'Can’t start yet.', text: 'Pick another model.', fix: { action: 'collab-fix', attrs: 'data-row="r1"', label: 'Fix' } }));
  pc('A18 pmxRefusal: alert, code kept in data-failure, fix button', has(ref, '<p class="pmx-refusal" role="alert" data-failure="model_unavailable">', '<b>Can’t start yet.</b> Pick another model.', '<button type="button" class="text-button" data-action="collab-fix" data-row="r1">Fix</button>'));

  const foot = B('pmxFoot', X.pmxFoot({ cls: 'collab-configure-foot', save: { action: 'collab-save-default', attrs: 'data-hook="save"' }, readback: '<p>RB</p>', estimate: '<p>EST</p>', extra: '<i>EXTRA</i>',
    cancel: { action: 'collab-modal-cancel', label: 'Cancel' }, primary: { action: 'collab-modal-commit', label: 'Start Crew', attrs: 'data-hook="go"', reason: 'Why not', reasonCls: 'collab-limit-warn' } }));
  pc('A19 pmxFoot root keeps .mdl-foot + cls passthrough (b10/b13 .collab-configure-foot)', rootTag(foot).startsWith('<footer class="mdl-foot pmx-foot collab-configure-foot"'));
  pc('A19 Save as my default (idle)', has(foot, '<button type="button" class="text-button pmx-save" data-action="collab-save-default" data-state="idle" data-hook="save">', '<span>Save as my default</span></button>'));
  pc('A19 Save saved state is in place', has(X.pmxFoot({ save: { action: 'a', state: 'saved' }, primary: { action: 'p' } }), 'data-state="saved"', 'Saved as your default'));
  /* closing (COLLAB FR 1): a primary's reason takes the estimate's line in the say column */
  pc('A19 read-back (the reason replaces the estimate), then extra, Cancel, primary with attrs', has(foot, '<div class="pmx-foot-say"><p>RB</p></div><i>EXTRA</i><button type="button" class="soft-button pmx-cancel" data-action="collab-modal-cancel">Cancel</button><button type="button" class="primary-button pmx-primary" data-action="collab-modal-commit" data-tone="accent" data-hook="go">'));
  pc('A19 without a reason the estimate follows the read-back', has(X.pmxFoot({ readback: '<p>RB</p>', estimate: '<p>EST</p>', primary: { action: 'p', label: 'Go' } }), '<div class="pmx-foot-say"><p>RB</p><p>EST</p></div>'));
  /* closing (lane FOUNDATION REQUESTS): cancel:false, primary:null, primary.key, one grid column per drawn part */
  const fNoCancel = X.pmxFoot({ cancel: false, extra: '<button class="x">A</button><button class="y">B</button>', primary: { action: 'close-dialog', label: 'Done', key: 'done' } });
  pc('closing pmxFoot cancel:false draws no Cancel; extra elements each get a column; primary.key', !fNoCancel.includes('pmx-cancel') && has(fNoCancel, 'data-cancel="0"', '--pmx-foot-cols:minmax(0,1fr) auto auto auto', 'data-k="done"'));
  const fNoPrimary = X.pmxFoot({ primary: null, readback: 'R', cancel: { action: 'x', label: 'Close' } });
  pc('closing pmxFoot primary:null draws no primary', !fNoPrimary.includes('pmx-primary') && has(fNoPrimary, 'data-primary="0"', '--pmx-foot-cols:minmax(0,1fr) auto"', '>Close</button>'));
  pc('closing pmxFoot keeps a primary for primary:{} (Revert strips it until it passes null)', X.pmxFoot({ primary: {} }).includes('pmx-primary'));
  pc('A19 primary label + reason with reasonCls', has(foot, 'Start Crew', '<p class="pmx-reason pmx-foot-reason collab-limit-warn">Why not</p>'));
  pc('A19 the primary is the last .primary-button in the footer', foot.lastIndexOf('primary-button') === foot.indexOf('primary-button pmx-primary'));
  pc('A19 refusal replaces the read-back', has(X.pmxFoot({ readback: '<p>RB</p>', refusal: '<p>REF</p>', primary: { action: 'p' } }), '<div class="pmx-foot-say"><p>REF</p></div>'));
  pc('J-2 refusal replaces the estimate line too', (() => { const h = X.pmxFoot({ readback: '<p>RB</p>', estimate: '<p>EST</p>', refusal: '<p>REF</p>', primary: { action: 'p' } }); return has(h, '<div class="pmx-foot-say"><p>REF</p></div>') && !h.includes('EST') && !h.includes('RB'); })());
  pc('J-2 without a refusal the foot says read-back then estimate', has(X.pmxFoot({ readback: '<p>RB</p>', estimate: '<p>EST</p>', primary: { action: 'p' } }), '<div class="pmx-foot-say"><p>RB</p><p>EST</p></div>'));
  pc('A19 disabled primary + warm tone', /class="primary-button pmx-primary" data-action="p" data-tone="warm" disabled>/.test(X.pmxFoot({ primary: { action: 'p', tone: 'warm', disabled: true } })));

  const cf = B('pmxConfirm', X.pmxConfirm({ key: 'cf', markHtml: '<i>M</i>', headline: 'Scheduled for 10 PM', text: 'You can change it.', actions: '<i>A</i>' }));
  pc('A20 pmxConfirm shape', cf === '<div class="pmx-confirm" data-k="cf"><i>M</i><p class="pmx-confirm-head">Scheduled for 10 PM</p><p class="pmx-help">You can change it.</p><div class="pmx-confirm-acts"><i>A</i></div></div>', cf);

  const tabs = B('pmxTabs', X.pmxTabs({ key: 'tb', cls: 'sched-tabs', action: 'sched-tab', attr: 'data-tab', current: 'up', items: [{ value: 'up', label: 'Coming up', count: 2 }, { value: 'held', label: 'Held' }] }));
  pc('A21 pmxTabs: cls passthrough, active + aria-selected, attr name, count', has(tabs, '<div class="pmx-tabs sched-tabs" role="tablist" data-k="tb">', '<button type="button" role="tab" aria-selected="true" class="pmx-tab active" data-action="sched-tab" data-tab="up">Coming up<small>2</small></button>', '<button type="button" role="tab" aria-selected="false" class="pmx-tab" data-action="sched-tab" data-tab="held">Held</button>'));

  /* 6. C: in-chat primitives. */
  const head = B('pmxRunHead', X.pmxRunHead({ kind: 'crew', kindWord: 'Crew', title: 'Add CSV export', badgeCls: 'collab-kind-badge', titleCls: 'collab-card-title',
    cluster: ['<i>1</i>', '<i>2</i>', '<i>3</i>', '<i>4</i>', '<i>5</i>', '<i>6</i>', '<i>7</i>'], clusterMax: 5, clock: '3:12', clockKey: 'clk:r1' }));
  pc('C2 pmxRunHead: kind badge hook + word, title hook', has(head, '<span class="pmx-run-kind collab-kind-badge"><svg', '<span class="pmx-run-kindword">Crew</span></span><h4 class="pmx-run-title collab-card-title">Add CSV export</h4>'));
  pc('C2 cluster: at most clusterMax marks, then +N', has(head, '<span class="pmx-cluster"', '<i>5</i><span class="pmx-cluster-more">+2</span></span>') && !head.includes('<i>6</i>'));
  pc('C2 clock keyed', has(head, '<span class="pmx-clock" data-k="clk:r1">3:12</span>'));

  const sen = B('pmxSentence', X.pmxSentence({ key: 'sn', status: 'running', word: 'Running', reason: 'Two are working.', cls: 'collab-status collab-status-working' }));
  pc('C3 pmxSentence: hooks, status, keyed glyph and text', has(sen, '<p class="pmx-sentence collab-status collab-status-working" data-k="sn" data-status="running"><span class="pmx-st-glyph" data-k="stg:running">', '<span class="pmx-st-text" data-k="st:', '"><b>Running</b> · Two are working.</span></p>'));
  const kOf = h => (h.match(/data-k="(st:[^"]*)"/) || [])[1];
  pc('C3 text key is a content hash (same text same key, new text new key)', kOf(sen) === kOf(X.pmxSentence({ status: 'running', word: 'Running', reason: 'Two are working.' })) && kOf(sen) !== kOf(X.pmxSentence({ status: 'running', word: 'Running', reason: 'One is working.' })));
  const stGlyphs = ['starting', 'waiting', 'running', 'needs', 'yourmove', 'paused', 'done', 'cancelled', 'failed', 'attention'];
  pc('C3 every status draws a glyph (none missing)', stGlyphs.every(st => { const h = X.pmxSentence({ status: st, word: 'W' }); return has(h, 'data-status="' + st + '"', '<svg') && !h.includes('pmx-glyph-missing'); }));
  /* neon step 3E: pmxStatus is the status primitive pmxSentence and the module tables use; evaluated here with no
     PM56_NEON, it falls back to the drawing each status had (STATUS_GLYPH, else the old module-table drawing) */
  pc('pmxStatus: without the neon family a run status draws its STATUS_GLYPH mark and a set name its old drawing', X.pmxStatus('done', 14) === X.pmxGlyph('check', 14) && X.pmxStatus('waiting', 15) === X.pmxGlyph('ring-dashed', 15) && X.pmxStatus('stale', 15) === X.pmxGlyph('slash-circle', 15) && !X.pmxStatus('no-such-status').includes('pmx-glyph-missing'));

  const tr = B('pmxTrack', X.pmxTrack({ key: 'tr', stops: [{ key: 's1', label: 'Split', state: 'done' }, { key: 's2', label: 'Do', state: 'now' }, { key: 's3', label: 'Combine', state: 'bogus' }], nowText: '<b>Do</b> · 1 of 3 checked' }));
  pc('C4 pmxTrack: named stops with state, nowText', has(tr, '<div class="pmx-track" data-k="tr" data-n="3"><ol class="pmx-track-line"><li class="pmx-stop" data-k="s1" data-state="done"><i class="pmx-stop-dot"></i><span class="pmx-stop-label">Split</span></li>', 'data-k="s2" data-state="now"', '<p class="pmx-track-now"><b>Do</b> · 1 of 3 checked</p></div>'));
  pc('C4 unknown stop state falls back to next', has(tr, 'data-k="s3" data-state="next"'));

  const ln = B('pmxLane', X.pmxLane({ key: 'pmx-lane:r1:p1', cls: 'collab-lane', attrs: 'data-run="r1" data-participant="p1"', action: 'collab-open-participant', mark: '<i>M</i>', name: 'Verify quoting', sub: 'Opus 5', verb: 'running tests', verbKey: 'vb:p1:4',
    time: '2:05', line2: '<q>Adding cases</q>', line2Kind: 'quote', keep: true, keepKey: 'l2:r1:p1:quote:m9', state: 'working' }));
  pc('C5 pmxLane root: button, cls/attrs, state, action', has(rootTag(ln), '<button type="button" class="pmx-lane collab-lane" data-k="pmx-lane:r1:p1"', 'data-state="working"', 'data-action="collab-open-participant"', 'data-run="r1" data-participant="p1"'));
  pc('C5 pmxLane parts: name, sub, keyed verb, time', has(ln, '<span class="pmx-lane-mark"><i>M</i></span><span class="pmx-lane-l1"><b class="pmx-lane-name">Verify quoting</b><span class="pmx-lane-sub">Opus 5</span><span class="pmx-lane-verb" data-k="vb:p1:4"', '>running tests</span></span><span class="pmx-lane-time">2:05</span>'));
  pc('C5 G-06 line 2: kind + kept island keyed by source', has(ln, '<span class="pmx-lane-l2" data-kind="quote" data-pm-keep data-k="l2:r1:p1:quote:m9"><q>Adding cases</q></span></button>'));
  pc('C5 line2Kind detail|sealed', has(X.pmxLane({ line2Kind: 'sealed' }), 'data-kind="sealed"') && has(X.pmxLane({}), 'data-kind="detail"'));

  const lns = B('pmxLanes', X.pmxLanes({ key: 'ls', lanesHtml: '<i>L</i>', more: { count: 5, text: '2 working, 3 waiting · Show all', action: 'collab-toggle-expand', attrs: 'data-run="r1"' } }));
  pc('C6 pmxLanes: +N more row with action and data-run', has(lns, '<div class="pmx-lanes" data-k="ls"><i>L</i><button type="button" class="pmx-lanes-more" data-action="collab-toggle-expand" data-run="r1">', '+5 more', '· 2 working, 3 waiting · Show all</button></div>'));

  const dec = B('pmxDecision', X.pmxDecision({ key: 'dc', tone: 'warm', sentence: '<b>CSV specialist needs your OK</b>.', actions: [{ action: 'collab-approve', attrs: 'data-run="r1"', label: 'Allow once', primary: true }, { action: 'collab-deny', attrs: 'data-run="r1"', label: 'Don’t allow' }] }));
  pc('C7 pmxDecision: tone, group, sentence, buttons carry attrs', has(dec, '<div class="pmx-decision" data-k="dc" data-tone="warm" role="group"><p class="pmx-decision-say">', '<span><b>CSV specialist needs your OK</b>.</span></p><div class="pmx-decision-acts">',
    '<button type="button" class="primary-button pmx-act" data-action="collab-approve" data-run="r1">Allow once</button>', '<button type="button" class="text-button pmx-act" data-action="collab-deny" data-run="r1">Don’t allow</button>'));
  pc('C7 tone accent (your move)', has(X.pmxDecision({ tone: 'accent' }), 'data-tone="accent"'));

  const res = B('pmxResult', X.pmxResult({ key: 'rs', headline: 'Export ready', sub: 'Worked 8m', outputHtml: '<i>O</i>', boardHtml: '<i>B</i>', creditsHtml: '<i>C</i>' }));
  pc('C8 pmxResult: answer first, then figures, output, board, credits', has(res, '<div class="pmx-result" data-k="rs"><p class="pmx-result-head">', '<span class="pmx-result-headline">Export ready</span></p><p class="pmx-result-sub">Worked 8m</p><i>O</i><i>B</i><i>C</i></div>'));

  const out = B('pmxOutput', X.pmxOutput({ name: 'collection.csv', meta: '214 rows', diff: { add: 121, del: 46, files: 4 }, lines: ['a', 'b', 'c', 'd'] }));
  pc('C9 pmxOutput: head, diff, at most 3 lines', has(out, '<div class="pmx-output"><p class="pmx-output-head">', '<b>collection.csv</b><span>214 rows</span><span class="pmx-diff"><i class="pmx-add">+121</i> <i class="pmx-del">−46</i> in 4 files</span></p>', '<pre class="pmx-output-pre">') && !out.includes('>d<'));

  const cr = B('pmxCredits', X.pmxCredits({ items: [1, 2, 3, 4, 5].map(i => ({ mark: '<i>m</i>', name: 'N' + i, did: 'did ' + i })) }));
  pc('C10 pmxCredits: title, items, +2 more at 5 helpers', has(cr, '<div class="pmx-credits"', '<p class="pmx-fine">Who did what</p><ul><li><i>m</i><b>N1</b>', 'did 1', '+2 more'));

  const meta = B('pmxMeta', X.pmxMeta({ cls: 'collab-card-meta', recorded: true, parts: ['<b>$0.18</b> so far', '2 at a time'] }));
  pc('C11 pmxMeta: hook, recorded first, parts joined', meta === '<p class="pmx-meta collab-card-meta"><span class="pmx-recorded">Recorded example · no AI cost</span> · <b>$0.18</b> so far · 2 at a time</p>', meta);

  const acts = B('pmxActions', X.pmxActions({ kind: 'crew', items: [{ action: 'collab-open-panel', attrs: 'data-run="r1"', label: 'Open Panel', primary: true }, { action: 'collab-message', attrs: 'data-run="r1"', label: 'Message' }], expand: { attrs: 'data-run="r1"' }, more: { attrs: 'data-run="r1"' } }));
  /* IMPACT A2-16: the Collab defaults (collab-toggle-expand / -more) only for a Collab kind or collabHooks: true */
  const actsPlain = X.pmxActions({ items: [{ action: 'af-memory-open', label: 'Open' }], expand: { attrs: 'data-run="m1"' }, more: { attrs: 'data-run="m1"' } });
  pc('A2-16 pmxActions without a Collab kind emits no collab-toggle-* default', !actsPlain.includes('collab-toggle') && actsPlain.includes('data-action="af-memory-open"'), actsPlain.slice(0, 200));
  pc('A2-16 pmxActions with collabHooks: true keeps the Collab defaults', has(X.pmxActions({ collabHooks: true, items: [], expand: { attrs: 'data-run="r9"' }, more: { attrs: 'data-run="r9"' } }), 'data-action="collab-toggle-expand" data-run="r9"', 'data-action="collab-toggle-more" data-run="r9"'));
  pc('C12 pmxActions: items with attrs, expand chevron, More', has(acts, '<div class="pmx-actions">', '<button type="button" class="primary-button pmx-act" data-action="collab-open-panel" data-run="r1">Open Panel</button>', '<button type="button" class="text-button pmx-act" data-action="collab-message" data-run="r1">Message</button>',
    'class="icon-button pmx-act" data-action="collab-toggle-expand" data-run="r1" aria-label="Expand"', 'class="icon-button pmx-act" data-action="collab-toggle-more" data-run="r1" aria-label="More"'));

  const cardFull = {
    key: 'collab-card-r1', runId: 'r1', kind: 'crew', density: 'live', cls: 'collab-card collab-kind-crew', attrs: 'data-hook="card"', headCls: 'collab-card-head', footCls: 'collab-card-foot', bodyCls: 'collab-card-body', bodyKey: 'collab-body-r1',
    headHtml: head, bodyHtml: sen + tr + ln + X.pmxMeta({ cls: 'collab-card-meta', parts: ['x'] }), footHtml: acts
  };
  const run = B('pmxRun', X.pmxRun(cardFull));
  pc('C1 pmxRun root: cls/attrs, key, density, kind, run id, flip', has(rootTag(run), '<article class="pmx-run collab-card collab-kind-crew" data-k="collab-card-r1" data-density="live" data-pmx-kind="crew" data-run-id="r1"', 'data-flip', 'data-hook="card"'));
  pc('C1 pmxRun head/body/foot hooks and body key', has(run, '<header class="pmx-run-head collab-card-head">', '<div class="pmx-run-body collab-card-body" data-k="collab-body-r1">', '<footer class="pmx-run-foot collab-card-foot">'));
  pc('C1 every density is accepted; unknown -> live', ['starting', 'waiting', 'live', 'collapsed', 'attention', 'result', 'failed', 'receipt'].every(d => has(X.pmxRun({ kind: 'crew', density: d }), 'data-density="' + d + '"')) && has(X.pmxRun({ kind: 'crew', density: 'bogus' }), 'data-density="live"'));
  pc('C1 arriving -> data-pmx-arrive="1"', has(X.pmxRun({ kind: 'crew', arriving: true }), 'data-pmx-arrive="1"'));

  /* The preview (A16, G-22): the same card, inert. */
  const prev = B('pmxRun preview', X.pmxRun(Object.assign({}, cardFull, { preview: true, density: 'waiting' })));
  const prevKeys = prev.match(/data-k="[^"]*"/g) || [];
  pc('A16/G-22 preview: data-pmx-preview="1", aria-hidden', has(rootTag(prev), 'data-pmx-preview="1"', 'aria-hidden="true"', 'data-density="waiting"'));
  pc('A16/G-22 preview: no data-action anywhere', !/\sdata-action[=\s>]/.test(prev));
  pc('A16/G-22 preview: no data-run-id, no data-run', !/\sdata-run-id[=\s>]/.test(prev) && !/\sdata-run[=\s>]/.test(prev));
  pc('A16/G-22 preview: every key is pv:-prefixed', prevKeys.length > 3 && prevKeys.every(k => k.startsWith('data-k="pv:')), prevKeys.filter(k => !k.startsWith('data-k="pv:')));
  pc('A16/G-22 preview: buttons become inert spans', !/<button\b/.test(prev));
  pc('A16/G-22 preview: no hook class survives (cls, headCls, badgeCls, titleCls, statusCls, metaCls, bodyCls)', !/class="[^"]*\b(collab-[\w-]+|hook-[\w-]+)/.test(prev), (prev.match(/class="[^"]*\b(collab-[\w-]+)/) || [])[1]);
  pc('A16/G-22 preview: no kept islands, no foot (top frame only)', !prev.includes('data-pm-keep') && !prev.includes('pmx-run-foot'));
  pc('A16/G-22 preview: the head and sentence render', has(prev, 'Add CSV export', 'pmx-sentence', 'pmx-track'));

  const rc = B('pmxReceipt', X.pmxReceipt({ key: 'collab-card-r2', runId: 'r2', cls: 'collab-card collab-kind-review', attrs: 'data-hook="rc"', kind: 'review', kindWord: 'Review', cluster: ['<i>a</i>', '<i>b</i>'], title: 'Review my changes', headline: '2 to fix', glyph: 'check',
    time: '10:30 PM', cost: '$0.41', open: { action: 'collab-open-panel' }, headCls: 'collab-card-head', footCls: 'collab-card-foot', badgeCls: 'collab-kind-badge', titleCls: 'collab-card-title', statusCls: 'collab-status', metaCls: 'collab-card-meta' }));
  pc('C13 pmxReceipt root: pmx-run pmx-receipt + cls/attrs, density receipt, run id', has(rootTag(rc), 'class="pmx-run pmx-receipt collab-card collab-kind-review"', 'data-density="receipt"', 'data-k="collab-card-r2"', 'data-run-id="r2"', 'data-hook="rc"'));
  pc('C13 receipt head hooks: badge, mini cluster, title, status, meta', has(rc, '<header class="pmx-run-head collab-card-head"><span class="pmx-run-kind collab-kind-badge">', '<span class="pmx-run-kindword">Review</span>', '<span class="pmx-cluster pmx-cluster--mini"',
    'class="pmx-receipt-title collab-card-title" data-pmx-harness>Review my changes</span>', 'class="pmx-receipt-say collab-status"', '<span class="pmx-receipt-headline">2 to fix</span>', 'class="pmx-receipt-meta collab-card-meta">', '10:30 PM', '$0.41'));
  pc('A2-19 the clipped receipt title is marked data-pmx-harness', /<span class="pmx-receipt-title[^"]*" data-pmx-harness>/.test(rc));
  pc('R-21 time and cost also ride in the headline hover card', has(rc, 'data-hover-key="rcpt:collab-card-r2"', 'data-hover-tip="10:30 PM · $0.41"'));
  const rcRec = X.pmxReceipt({ key: 'rr', runId: 'r5', kind: 'crew', kindWord: 'Crew', title: 'T', headline: 'H', recorded: true, time: '8m 40s', open: { action: 'collab-open-panel' } });
  const rcReal = X.pmxReceipt({ key: 'rr', runId: 'r5', kind: 'crew', kindWord: 'Crew', title: 'T', headline: 'H', time: '8m 40s', open: { action: 'collab-open-panel' } });
  pc('A1-24 recorded receipt: a 13 px play-ring before the headline at every tier, hover card first line "Recorded example · no AI cost"',
    /<span class="pmx-receipt-say"[^>]*data-hover-tip="Recorded example · no AI cost(\n|&#10;|&#x0?a;)?[^"]*"[^>]*><svg class="pmx-glyph pmx-receipt-rec" width="13" height="13"[^]*?<\/svg><span class="pmx-receipt-headline">H<\/span>/i.test(rcRec) && !rcRec.includes('pmx-glyph-missing'), rcRec.slice(0, 400));
  pc('A1-24 a real run shows neither the play-ring nor the recorded line', !rcReal.includes('pmx-receipt-rec') && !rcReal.includes('Recorded example'));
  const rcRevert = X.pmxReceipt({ key: 'rv', runId: 'r6', kind: 'revert', kindWord: 'Revert', title: 'T', headline: 'H', open: { action: 'revert-open' } });
  pc('A2-16 a non-Collab receipt carries no collab-toggle-* in its foot', !rcRevert.includes('collab-') && rcRevert.includes('data-action="revert-open"'), rcRevert.slice(-300));
  const rfoot = (rc.match(/<footer[^]*<\/footer>/) || [''])[0];
  pc('C13/G-19 receipt foot: Expand, Open Panel, More, each with data-run', rfoot.startsWith('<footer class="pmx-run-foot collab-card-foot">') &&
    /data-action="collab-toggle-expand" data-run="r2"[^>]*aria-label="Expand"/.test(rfoot) && /data-action="collab-open-panel" data-run="r2"[^>]*>(<span>)?Open(<span[^>]*>)? Panel/.test(rfoot) && rfoot.includes('><span>Open<span class="pmx-long"> Panel</span></span></button>') && /data-action="collab-toggle-more" data-run="r2"[^>]*aria-label="More"/.test(rfoot) &&
    rfoot.indexOf('collab-toggle-expand') < rfoot.indexOf('collab-open-panel') && rfoot.indexOf('collab-open-panel') < rfoot.indexOf('collab-toggle-more'));

  const dl = B('pmxDockLine', X.pmxDockLine({ key: 'dk1', tone: 'needs', runId: 'r1', markHtml: '<i>M</i>', kindWord: 'BrainStorm needs you', sentence: '· 6 questions', time: '4:02', action: { action: 'pmx-dock-show', attrs: 'data-run="r1"', label: 'Answer now' } }));
  pc('C14 pmxDockLine: tone, mark, sentence, clock, action', has(dl, '<div class="pmx-dock-line" data-k="dk1" data-tone="needs"', '<i>M</i><p class="pmx-dock-say"><b>BrainStorm needs you</b> · 6 questions</p><span class="pmx-clock">4:02</span><button type="button" class="text-button pmx-dock-act" data-action="pmx-dock-show" data-run="r1">Answer now</button></div>'));
  pc('C14 tones live|needs|yourmove|comingup', ['live', 'needs', 'yourmove', 'comingup'].every(t => has(X.pmxDockLine({ tone: t }), 'data-tone="' + t + '"')));
  pc('C15 pmxDock', X.pmxDock('<i>L</i>', 'and 2 more live runs · Activity') === '<div class="pmx-dock" data-k="pmx-dock"><i>L</i><p class="pmx-dock-more">and 2 more live runs · Activity</p></div>');

  const fd = B('pmxFinding', X.pmxFinding({ key: 'f1', cls: 'collab-finding', n: 1, sev: 'major', severity: X.pmxSeverity('major'), box: { attrs: 'data-action="collab-review-toggle-finding" data-finding="f1"', checked: true }, disposition: 'To fix', agree: '2 of 3 agree', claim: 'Drops rows with a comma.', why: 'Why', todo: 'To-Do created' }));
  pc('C16 pmxFinding: hook, tick label with the real checkbox, claim as plain text', has(fd, '<div class="pmx-finding collab-finding" data-k="f1"', '<label class="pmx-finding-tick"><input type="checkbox" data-action="collab-review-toggle-finding" data-finding="f1" checked><span class="pmx-box" aria-hidden="true"></span><span class="pmx-sr">Include finding 1</span></label>',
    '<div class="pmx-finding-copy"><p class="pmx-finding-claim">Drops rows with a comma.</p>', '<p class="pmx-finding-why">Why</p>', '<p class="pmx-finding-todo">To-Do created</p>'));
  /* The spec writes data-severity="{sev}" and prints {severity} in the meta line: sev is the level key, severity the printed pmxSeverity(). */
  pc('C16 pmxFinding: data-severity from sev', has(rootTag(fd), 'data-severity="major"'), rootTag(fd));
  pc('C16 meta line: severity (glyph + word) · disposition · agreement', /<p class="pmx-finding-meta"><span class="pmx-sev" data-sev="major">[^]*Major<\/span>[^]*To fix[^]*2 of 3 agree/.test(fd));
  if (!has(rootTag(X.pmxFinding({ severity: 'major' })), 'data-severity="major"')) gaps.push('pmxFinding({severity:"major"}) without sev emits no data-severity (the spec table names only severity; derive the key from a bare level word)');

  const sevs = ['critical', 'major', 'minor', 'suggestion', 'nit', 'concern'];
  pc('C17 pmxSeverity: glyph + the word, every level', sevs.every(l => { const h = X.pmxSeverity(l); return has(h, '<span class="pmx-sev" data-sev="' + l + '"><svg') && /[A-Za-z]+<\/span>$/.test(h) && !h.includes('pmx-glyph-missing'); }));
  const ag = B('pmxAgree', X.pmxAgree({ votes: [{ seat: 1, vote: 'agree' }, { seat: 2, vote: 'unsure' }, { seat: 3, vote: 'disagree' }], words: '1 of 3 agree · someone disagreed' }));
  pc('C18 pmxAgree: a dot per reviewer + words always present', has(ag, '<span class="pmx-agree">', '<span>1 of 3 agree · someone disagreed</span></span>') && (ag.match(/<svg class="pmx-ag"/g) || []).length === 3);

  const vb = B('pmxVoteBoard', X.pmxVoteBoard({ key: 'vb', deciding: '<i>D</i>', abstained: '<i>W</i>', ruledCls: 'collab-hardconflict', options: [
    { key: 'o1', title: 'By provider', count: '2 for', backers: [{ markHtml: '<i>b</i>', name: 'Architect', conf: 3 }] }, { key: 'o2', title: 'Retry forever', count: '0 for', ruledOut: true, rule: 'never block the user', backers: [] }] }));
  pc('C19 pmxVoteBoard: options, aisle, wing', has(vb, '<div class="pmx-votes" data-k="vb"', '<div class="pmx-vote-opt" data-k="o1"', '<p class="pmx-vote-title">By provider</p><p class="pmx-vote-count">2 for</p><div class="pmx-vote-floor">', '<div class="pmx-vote-aisle">', 'deciding', '<div class="pmx-vote-wing">', 'Abstained'));
  pc('C19 ruled-out line: ruledCls hook, struck title, the rule, canon sentence', has(vb, '<p class="pmx-ruled collab-hardconflict">', '<s>Retry forever</s> is ruled out: it breaks your rule “never block the user”. Votes can’t override a rule.'));

  const qt = B('pmxQuote', X.pmxQuote({ key: 'qt', cls: 'collab-dissent', text: 'The ordering is a choice.', who: 'Fresh eyes', note: 'disagreed' }));
  pc('C20 pmxQuote: hook, drawn glyph, blockquote, caption', has(qt, '<figure class="pmx-quote collab-dissent" data-k="qt"><svg', '<blockquote>The ordering is a choice.</blockquote><figcaption>Fresh eyes · disagreed</figcaption></figure>'));

  const nt = B('pmxNote', X.pmxNote({ key: 'nt', cls: 'bsd-card', severity: 'concern', title: 'Drops a column', body: 'Body', checked: 'Checked 3 files', actions: '<i>A</i>' }));
  pc('C21 pmxNote: hook, severity, emitted, eye, kicker, title, body, checked, actions', has(nt, '<aside class="pmx-note bsd-card" data-k="nt" data-severity="concern" data-state="emitted"', '<span class="pmx-note-eye"><svg', '<p class="pmx-note-kicker">Advisor note · concern</p><p class="pmx-note-title">Drops a column</p><p class="pmx-note-body">Body</p><p class="pmx-fine">Checked 3 files</p><div class="pmx-note-acts"><i>A</i></div></aside>'));
  pc('C21 stale and dismissed states', has(X.pmxNote({ stale: true }), 'data-state="stale"') && has(X.pmxNote({ dismissed: true, title: 'T' }), 'data-state="dismissed"', 'Dismissed · T'));

  /* closing (PREFS): the hover reaches the app hover card (data-hover-key / data-hover-tip) */
  pc('C22 pmxTick: key, hover card, glyph, text', has(B('pmxTick', X.pmxTick({ key: 'tk', glyph: 'notebook', text: 'Noted', hover: 'Saved to memory' })), '<span class="pmx-tick" data-k="tk" data-hover-key="tick:tk" data-hover-tip="Saved to memory"><svg', '<span>Noted</span></span>'));
  pc('closing E-36 B: the rule tick says "Followed"', X.PMX_COPY.ticks.rule === 'Followed 1 of your rules' && X.PMX_COPY.ticks.rules === 'Followed {n} of your rules' && !!X.PMX_COPY.ticks.missed);
  pc('closing pmxStepper step', has(X.pmxStepper({ min: 0, max: 60, value: 10, step: 5 }), 'data-delta="-5"', 'data-delta="5"'));
  pc('closing pmxSwitch unset: nothing checked', (() => { const h = X.pmxSwitch({ unset: true, options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] }); return h.includes('data-state="unset"') && !h.includes('aria-checked="true"'); })());
  pc('closing pmxNote line form + weight', has(X.pmxNote({ key: 'nl', line: '<span>L</span>', state: 'aside', weight: 'aside', glyph: 'eye' }), 'data-state="aside"', 'data-form="line"', 'data-weight="aside"', '<div class="pmx-note-line"><span>L</span></div>'));
  pc('closing pmxFilesRow sides, state and reason separator', (() => { const a = X.pmxFilesRow({ count: 1, add: 4, del: 0, sides: 'changed', reason: 'why' }), b = X.pmxFilesRow({ state: 'reverted', text: '<b>Reverted</b> · 3 files put back' });
    return a.includes('+4') && !a.includes('−0') && a.includes('<span class="pmx-sep"> · </span><span class="pmx-reason pmx-files-reason">why</span>') && b.includes('data-state="reverted"') && b.includes('Reverted') && !b.includes('Changed'); })());
  pc('closing pmxFinding num + wrap', (() => { const h = X.pmxFinding({ num: 2, claim: 'C', severity: 'S', disposition: 'D', wrap: true }); return h.includes('<span class="pmx-finding-n">2</span>C') && h.includes('data-wrap="1"') && !h.includes('pmx-sep') && (h.match(/pmx-fpart/g) || []).length === 2; })());
  pc('closing pmxDisclosure: unboxed summary + body', has(X.pmxDisclosure({ key: 'dc', summary: 'How', body: '<p>B</p>', open: true }), '<details class="pmx-disc" data-k="dc" open>', '<summary class="pmx-disc-sum"><span>How</span>', '<div class="pmx-disc-body"><p>B</p></div></details>'));
  pc('closing pmxTime.day and until minutes', X.pmxTime.day('2026-09-26T19:00:00Z', 'UTC') === 'Sat, Sep 26' && X.pmxTime.until(3.3e7, 0, { minutes: true }) === 'in 9 h 10 m');
  pc('closing pmxRefusalText short form', X.pmxRefusalText('no_eligible_mutating_turn', { variant: 'not-latest' }).short === 'Not the latest change');
  /* closing review (ENG 5): every code COLLAB's scheduledBad() returns has plain words, none of them the code's own */
  const SCHED_BAD = ['collaboration_message_conflict', 'collaboration_transaction_required', 'crew_admission_binding_changed', 'crew_admission_conflict', 'crew_already_active',
    'crew_assignment_changed', 'crew_assignment_invalid', 'crew_assignment_missing', 'crew_binding_missing', 'crew_configuration_required', 'crew_definition_changed', 'crew_definition_conflict',
    'crew_definition_not_committed', 'crew_more_required_slots_than_work', 'crew_plan_binding_changed', 'crew_route_unavailable', 'crew_transaction_required', 'destination_ended',
    'destination_generation_changed', 'destination_not_accepting', 'destination_not_found', 'destination_scope_mismatch', 'invalid_crew_concurrency', 'invalid_crew_configuration',
    'participant_not_found', 'plan_changed_during_crew_configuration', 'plan_not_ready_for_crew', 'scheduled_adaptive_adapter_unavailable', 'scheduled_coordinator_adapter_unavailable',
    'scheduled_specialist_adapter_unavailable', 'room_missing'];
  const refMiss = SCHED_BAD.filter(c => { const t = X.pmxRefusalText(c, { kind: 'Crew' }); const w = t ? (t.strong + ' ' + t.text) : ''; return !t || !t.text || /_/.test(w) || w.includes(c.replace(/_/g, ' ')) || /\{\w+\}/.test(w); });
  pc('closing review: pmxRefusalText words every scheduled-Crew code in plain language', refMiss.length === 0, refMiss);
  pc('closing review: plan_version_changed without a version never prints "version ."', !/version \./.test(X.pmxRefusalText('plan_version_changed', {}).text) && X.pmxRefusalText('plan_version_changed', { version: 4 }).text === 'Reopen it to use version 4.');
  pc('closing follow-up: one generic refusal fallback', X.PMX_COPY.refusal && X.PMX_COPY.refusal.fallback === 'Nothing was started. Your setup is unchanged.' && X.PMX_COPY.refusal.strong === 'Can’t start yet.');
  /* closing review (receipt at 591 px): a recorded run's "Recorded example · no AI cost" lives in the hover card, not on the line */
  const rcRecCost = X.pmxReceipt({ key: 'rc2', runId: 'r7', kind: 'crew', kindWord: 'Crew', title: 'T', headline: 'Export ready', recorded: true, time: '6s', cost: X.PMX_COPY.cost.recorded, open: { action: 'collab-open-panel' } });
  const rcMeta = (rcRecCost.match(/<span class="pmx-receipt-meta">([\s\S]*?)<\/span><\/header>/) || [])[1] || '';
  const rcTip = (rcRecCost.match(/data-hover-tip="([^"]*)"/) || [])[1] || '';
  pc('closing review: a recorded receipt keeps its cost words in the hover card only (once), the line shows the time', rcMeta.includes('6s') && !rcMeta.includes('Recorded') && rcTip.split('Recorded example').length === 2, { rcMeta, rcTip });
  /* closing review (dock lines): " · " after the kind word when the sentence starts its own clause, a space when it continues it */
  const dj = s => X.pmxDockLine({ key: 'dj', kindWord: 'Crew', sentence: s });
  pc('closing review: pmxDockLine separator', has(dj('Stream the export · editing'), '<b>Crew</b><span class="pmx-dock-sep"> · </span>Stream the export') &&
    has(X.pmxDockLine({ kindWord: '1 scheduled message', sentence: 'needs you' }), '<b>1 scheduled message</b> needs you') && has(dj('· Next: tonight'), '<b>Crew</b> · Next: tonight'));
  pc('C23 pmxDivider', X.pmxDivider({ key: 'dv', text: 'Simple explanations from here' }) === '<div class="pmx-divider" role="separator" data-k="dv"><span>Simple explanations from here</span></div>');
  const fr = B('pmxFilesRow', X.pmxFilesRow({ key: 'fr', count: 3, add: 5, del: 3, revert: { action: 'af-revert-preview', attrs: 'data-msg="m1"' } }));
  pc('C24 pmxFilesRow: Changed N files +a −d · Revert', has(fr, '<p class="pmx-files" data-k="fr"><svg', '<span>Changed 3 files</span> <i class="pmx-add">+5</i> <i class="pmx-del">−3</i>', '<button type="button" class="text-button" data-action="af-revert-preview" data-msg="m1">Revert</button>'));
  const crw = B('pmxCodeRow', X.pmxCodeRow({ kind: 'code', lang: 'TypeScript', size: '42 lines', open: { action: 'collab-open-panel', attrs: 'data-run="r1"' } }));
  pc('C25 pmxCodeRow: glyph + words, Open', has(crw, '<p class="pmx-coderow"><svg', '<span><b>code</b> · TypeScript · 42 lines</span><button type="button" class="text-button" data-action="collab-open-panel" data-run="r1">Open</button></p>'));
  pc('C25 table variant', has(X.pmxCodeRow({ kind: 'table', size: '5 rows' }), '<b>table</b> · 5 rows'));

  const gd = B('pmxGuide', X.pmxGuide({ key: 'crew-demo-guide', cls: 'crew-demo-guide', attrs: 'data-hook="guide"', placement: 'dock', step: 'Step 2 of 4', actions: [{ action: 'a1', label: 'Next' }, { action: 'a2', label: 'Back' }, { action: 'a3', label: 'Third' }], close: { action: 'crew-demo-close' } }));
  pc('C27/G-25 pmxGuide: hook class + key + placement + attrs', has(rootTag(gd), '<section class="pmx-guide crew-demo-guide" data-k="crew-demo-guide" data-placement="dock"', 'data-hook="guide"'));
  pc('C27/G-25 caption, step, at most 2 buttons, close', has(gd, '<p class="pmx-guide-cap"><svg', 'Recorded example · no AI cost</p><p class="pmx-guide-step">Step 2 of 4</p>', 'data-action="a1"', 'data-action="a2"', 'class="icon-button pmx-guide-close" data-action="crew-demo-close"') && !gd.includes('data-action="a3"'));

  /* 7. C26 markdown (D-7, G-35). */
  const md = '## Why it is slow\nThe page builds a **40 MB** string *before* the `download` starts. <script>alert(1)</script>\n\nSecond paragraph.\n\nThird paragraph.\n\n- one\n- two\n- three\n- four\n- five\n\n```ts\nconst a = 1;\nconst b = 2;\n```\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n> Keep the order.\n\n---\n\nSee [docs](https://example.com/x) and [bad](javascript:alert(1)).';
  const mc = B('pmxMd compact', X.pmxMd(md, { mode: 'compact', open: { action: 'collab-open-panel', attrs: 'data-run="r1"' } }));
  pc('C26 compact: heading becomes a bold lead-in; bold/italic/code inline', has(mc, '<div class="pmx-md" data-mode="compact">', '<b>Why it is slow</b>', '<strong>40', '<em>before</em>', '<code>download</code>'));
  pc('C26 compact: at most two paragraphs', (mc.match(/<p[ >]/g) || []).length <= 2 && !mc.includes('Third paragraph'));
  pc('C26 escapes raw HTML (no passthrough)', !mc.includes('<script') && mc.includes('&lt;script&gt;'));
  const mcList = X.pmxMd('- one\n- two\n- three\n- four\n- five', { mode: 'compact' });
  pc('C26 compact: lists show 3 items + "and N more"', (mcList.match(/<li>/g) || []).length === 3 && mcList.includes('and 2 more'));
  const mcCode = X.pmxMd('Intro.\n\n```ts\nconst a = 1;\nconst b = 2;\n```', { mode: 'compact', open: { action: 'o' } });
  pc('C26 compact: fenced code -> pmxCodeRow (language + line count)', has(mcCode, '<p class="pmx-coderow">', '<b>code</b> · TypeScript · 2 lines') && !mcCode.includes('<pre'));
  const mcTable = X.pmxMd('Intro.\n\n| a | b |\n|---|---|\n| 1 | 2 |\n| 3 | 4 |', { mode: 'compact' });
  pc('C26 compact: table -> pmxCodeRow (table, rows)', has(mcTable, '<b>table</b> · 2 rows') && !mcTable.includes('<table'));
  const mf = B('pmxMd full', X.pmxMd(md, { mode: 'full' }));
  pc('C26 full: headings, lists, code in pre.pmx-code, table in .pmx-table-wrap, blockquote, hr', has(mf, '<div class="pmx-md" data-mode="full">', '<h4>Why it is slow</h4>', '<ul><li>one</li>', '<li>five</li>', '<pre class="pmx-code" data-lang="ts"><code>const a = 1;\nconst b = 2;</code></pre>',
    '<div class="pmx-table-wrap"><table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table></div>', '<blockquote>Keep the order.</blockquote>', '<hr>'));
  pc('C26 full: http(s) links open safely; javascript: is never a link', has(mf, '<a href="https://example.com/x" target="_blank" rel="noopener noreferrer">docs</a>') && !/href="javascript:/i.test(mf));
  pc('C26 full: escapes raw HTML', !mf.includes('<script') && mf.includes('&lt;script&gt;'));
  /* G-35: pmxMd consumes PM56_RICH.tokenize when present, with the same output as its fallback. */
  const tsPath = path.join(__dirname, '..', 'turn-stream.js');
  if (fs.existsSync(tsPath)) {
    const noop = () => noop;
    const extStub = new Proxy(function () { }, { get: (t, k) => (k === 'slot' || k === 'action' || k === 'chainAction' || k === 'ctx') ? noop : noop });
    const saved = { EXT: window.PM56_EXT, DATA: window.PM56_DATA };
    window.PM56_EXT = extStub; window.PM56_DATA = {};
    try { eval(fs.readFileSync(tsPath, 'utf8')); } catch (e) { /* it reaches for the DOM after PM56_RICH is set */ }
    const R = window.PM56_RICH;
    if (R && typeof R.tokenize === 'function') {
      const withRich = [X.pmxMd(md, { mode: 'full' }), X.pmxMd(md, { mode: 'compact' })];
      const keep = window.PM56_RICH; delete window.PM56_RICH;
      const without = [X.pmxMd(md, { mode: 'full' }), X.pmxMd(md, { mode: 'compact' })];
      window.PM56_RICH = keep;
      pc('C26/G-35 pmxMd output is identical with PM56_RICH.tokenize and with its own fallback', withRich[0] === without[0] && withRich[1] === without[1]);
      delete window.PM56_RICH;
    } else console.log('SKIP pmx C26/G-35 PM56_RICH equivalence (turn-stream.js did not expose PM56_RICH outside a browser)');
    window.PM56_EXT = saved.EXT; window.PM56_DATA = saved.DATA;
  } else console.log('SKIP pmx C26/G-35 PM56_RICH equivalence (no turn-stream.js next to module-shell.js)');

  /* 8. D: run view. */
  const view = B('pmxView', X.pmxView({ key: 'collab-view-r1', cls: 'collab-panel', attrs: 'data-run="r1"', kind: 'crew', kindWord: 'Crew', title: 'Add CSV export', statusHtml: '<b>Finished</b>', actionsHtml: '<i>A</i>', plateHtml: '<i>P</i>', tabsHtml: '<i>T</i>', mainHtml: '<i>M</i>', asideHtml: '<i>S</i>' }));
  pc('D1 pmxView: hooks; the first .drawer-head strong is the title', has(view, '<article class="pmx-view collab-panel" data-k="collab-view-r1"', 'data-run="r1"', '<header class="pmx-view-head drawer-head"><strong class="pmx-view-title">Add CSV export</strong>') && view.indexOf('<strong') === view.indexOf('<strong class="pmx-view-title">'));
  pc('D1 kind, status, actions (collab-panel-foot, G-21), plate, tabs, grid', has(view, '<p class="pmx-view-kind"><svg', '<span>Crew</span></p>', '<p class="pmx-view-status"><b>Finished</b></p>', '<div class="pmx-view-acts collab-panel-foot"><i>A</i></div></header>', '<figure class="pmx-view-plate"><i>P</i></figure><i>T</i>', '<div class="pmx-view-grid"><div class="pmx-view-main"><i>M</i></div><aside class="pmx-view-aside"><i>S</i></aside></div></article>'));
  pc('D2 pmxViewSection', has(B('pmxViewSection', X.pmxViewSection({ key: 'vs', title: 'Conversation', meta: '14 messages', body: '<i>B</i>' })), '<section class="pmx-vsec" data-k="vs"><header><h2 class="pmx-vsec-title">Conversation</h2><span class="pmx-fine">14 messages</span></header><i>B</i></section>'));
  const tl = B('pmxTimeline', X.pmxTimeline({ key: 'tl', filterHtml: '<i>F</i>', entries: [
    { key: 'collab-msg-m1', mid: 'm1', kind: 'system', bodyHtml: 'Started with 3 helpers.' },
    { key: 'collab-msg-m2', mid: 'm2', markHtml: '<i>M</i>', who: 'Coordinator', when: '10:31 PM', bodyHtml: '<p>Done</p>' },
    { key: 'collab-msg-m3', mid: 'm3', markHtml: '<i>M</i>', who: 'Data mapper', streaming: true, bodyHtml: 'Normalizing' }] }));
  pc('D3 pmxTimeline: filter bar, system note, message entry', has(tl, '<div class="pmx-timeline" data-k="tl"><div class="pmx-timeline-bar"><i>F</i></div>', '<article class="pmx-entry" data-k="collab-msg-m1" data-kind="system">', '<article class="pmx-entry" data-k="collab-msg-m2" data-kind="message"><i>M</i><header><b>Coordinator</b><span class="pmx-fine">10:31 PM</span></header>'));
  pc('D3/G-06 streaming body is a kept island keyed stream:{mid}; final body keyed body:{mid}', has(tl, '<div class="pmx-entry-body" data-pm-keep data-k="stream:m3">Normalizing</div>', '<div class="pmx-entry-body" data-k="body:m2"><p>Done</p></div>'));
  const tm = B('pmxTeamRow', X.pmxTeamRow({ key: 'tr1', kind: 'crew', cls: 'collab-participant', attrs: 'data-participant="p1"', markHtml: '<i>M</i>', name: 'Data mapper', route: 'Sonnet 4.6', outcome: 'checked', cost: '$0.31' }));
  pc('A2-16 pmxTeamRow without a Collab kind has no collab-open-participant default', !X.pmxTeamRow({ key: 'tr2', name: 'Advisor' }).includes('collab-'));
  pc('D4 pmxTeamRow: collab-participant hook, open action, attrs', has(tm, '<button type="button" class="pmx-team-row collab-participant" data-k="tr1" data-action="collab-open-participant" data-participant="p1"><i>M</i>', '<b>Data mapper</b><small>Sonnet 4.6</small>', 'checked', '<span class="pmx-meta">$0.31</span></button>'));
  const pt = B('pmxParticipant', X.pmxParticipant({ kind: 'crew', role: 'Data mapper', emptyText: 'Nothing from Data mapper yet.' }));
  const ptPlain = X.pmxParticipant({ role: 'Advisor', emptyText: 'Nothing yet.', backAction: 'bsd-back' });
  pc('A2-16 pmxParticipant without a Collab kind: no collab-participant-view, collab-empty or collab-close-participant', !ptPlain.includes('collab-') && ptPlain.includes('data-action="bsd-back"'), ptPlain);
  pc('A2-16 pmxParticipant with collabHooks: true keeps the Collab hooks', has(X.pmxParticipant({ collabHooks: true, role: 'R' }), 'collab-participant-view', 'data-action="collab-close-participant"'));
  pc('A2-16 pmxView: collab-panel-foot on a Collab kind only', has(X.pmxView({ key: 'v1', kind: 'crew', kindWord: 'Crew', title: 'T', actionsHtml: '<b>a</b>' }), 'class="pmx-view-acts collab-panel-foot"') && !X.pmxView({ key: 'v2', kind: 'revert', kindWord: 'Revert', title: 'T', actionsHtml: '<b>a</b>' }).includes('collab-'));
  pc('D5 pmxParticipant: .collab-participant-view h3, .collab-empty, Back to everyone', has(pt, '<section class="pmx-participant collab-participant-view"', '<h3>Data mapper</h3>', '<p class="collab-empty">Nothing from Data mapper yet.</p>', '<button type="button" class="text-button" data-action="collab-close-participant">Back to everyone</button></section>'));
  pc('D5 messages replace the empty line', has(X.pmxParticipant({ kind: 'crew', role: 'R', messagesHtml: '<div class="collab-msg">m</div>' }), '<div class="collab-msg">m</div>') && !X.pmxParticipant({ kind: 'crew', role: 'R', messagesHtml: '<div class="collab-msg">m</div>' }).includes('collab-empty'));

  /* 8a. G-17 (D4 amendment) + F0 review cycle 2: the stand-in line is the builder's, never hand-rolled.
     pmxTeamRow({standIn}) / pmxParticipant({standIn}): the team sentence with the fine print "requested X ·
     effective Y" on its own line under it, <small class="collab-route-eff collab-route-eff-sub">; nothing when
     requested equals effective ("disclosure is not noise"); "requested X · no substitute" and
     collab-route-eff-failed when nothing may stand in; the Collab hooks only for a Collab kind (A2-16); the
     sub-classes are whole literals in the source (A7) so a grep finds them. */
  const g17 = (label, fn) => { try { const r = fn(); pc(label, r === true || (Array.isArray(r) && r[0]), Array.isArray(r) ? r[1] : undefined); } catch (e) { pc(label, false, 'threw: ' + e.message); } };
  const SI_IN = { requested: 'Qwen 3.8 Coder', effective: 'Qwen 3.8', reason: 'offline' };
  const SI_SENT = 'Qwen 3.8 · standing in for Qwen 3.8 Coder, which is offline';
  const SI_FINE = '<span class="pmx-fine">requested Qwen 3.8 Coder · effective Qwen 3.8</span>';
  const trSI = B('pmxTeamRow standIn', X.pmxTeamRow({ key: 'tr3', kind: 'crew', cls: 'collab-participant', markHtml: '<i>M</i>', name: 'Integrator', standIn: SI_IN, outcome: 'checked', cost: '$0.12' }));
  g17('G-17 pmxTeamRow({standIn}): the stand-in line under the name, sentence then its fine print, Collab hooks', () => [has(trSI,
    '<span class="pmx-team-who"><b>Integrator</b><small class="', 'collab-route-eff collab-route-eff-sub"', '>' + SI_SENT + SI_FINE + '</small></span><span class="pmx-team-out">checked</span>') &&
    /<small class="[^"]*\bcollab-route-eff\b[^"]*"[^>]*>[^<]+<span class="pmx-fine">/.test(trSI), trSI]);
  g17('G-17 pmxTeamRow standIn takes pmxStandIn\'s result as well as its input (same markup)', () => [X.pmxTeamRow({ key: 'tr3', kind: 'crew', cls: 'collab-participant', markHtml: '<i>M</i>', name: 'Integrator', standIn: X.pmxStandIn(SI_IN), outcome: 'checked', cost: '$0.12' }) === trSI]);
  g17('G-17 pmxTeamRow: requested equals effective -> no stand-in line at all, the plain route shows', () => { const h = X.pmxTeamRow({ kind: 'crew', name: 'N', route: 'Sonnet 4.6', standIn: { requested: 'Opus 5', effective: 'Opus 5' } }); return [!/route-eff/.test(h) && h.includes('<small>Sonnet 4.6</small>'), h]; });
  g17('G-17 pmxTeamRow: no substitute -> collab-route-eff-failed, fine print "requested X · no substitute"', () => { const h = X.pmxTeamRow({ kind: 'crew', name: 'N', standIn: { requested: 'Qwen 3.8 Coder', noSubstitute: true } }); return [has(h, 'collab-route-eff-failed', '<span class="pmx-fine">requested Qwen 3.8 Coder · no substitute</span></small>') && !h.includes('collab-route-eff-sub'), h]; });
  g17('A2-16 pmxTeamRow standIn without a Collab kind: the line and its fine print, no collab- hook', () => { const h = X.pmxTeamRow({ name: 'N', standIn: SI_IN }); return [!h.includes('collab-') && h.includes(SI_SENT + SI_FINE), h]; });
  g17('G-17 D5 pmxParticipant({standIn}): the same sentence and fine print in the participant head', () => { const h = X.pmxParticipant({ kind: 'crew', role: 'Integrator', standIn: SI_IN }); return [has(h, '<h3>Integrator</h3><small class="', 'collab-route-eff collab-route-eff-sub"', '>' + SI_SENT + SI_FINE + '</small>'), h]; });
  pc('G-17/A7 collab-route-eff-sub and collab-route-eff-failed are whole literals in module-shell.js', /['"]collab-route-eff-sub['"]/.test(src) && /['"]collab-route-eff-failed['"]/.test(src));

  /* 8a2. F0 review cycle 1 API (lead rulings): seat floor marks and label offsets, the paper's fitted words, the
     plate yield slot's caption mode, the hero's field box, a kind's extra actions */
  const PPc = X.pmxPlateParts;
  g17('cycle 1 seat({floor:"hatch"}): hatch under the mark, data-floor, name baseline +42, sub +18 below it', () => { const h = PPc.seat({ x: 0, y: 0, role: 'builder', seat: 1, state: 'queued', floor: 'hatch', label: 'L', sub: 'S' }); return [has(h, 'data-floor="hatch"', 'pmx-p-floorhatch', '<text class="pmx-p-lab" x="0" y="42"', '<text class="pmx-p-sub" x="0" y="60"') && h.indexOf('pmx-p-floorhatch') < h.indexOf('pmx-p-mark'), h]; });
  g17('cycle 1 seat({floor:"bar"}): a floor bar under an idle mark, name baseline +42', () => { const h = PPc.seat({ x: 0, y: 0, role: 'builder', seat: 1, state: 'idle', floor: 'bar', label: 'L' }); return [has(h, 'data-floor="bar"', '<rect class="pmx-p-floorbar"', '<text class="pmx-p-lab" x="0" y="42"') && h.indexOf('pmx-p-floorbar') < h.indexOf('pmx-p-mark'), h]; });
  g17('cycle 1 seat without a floor mark: name baseline +30, sub +48; a working seat (its own bar) +42', () => {
    const a = PPc.seat({ x: 0, y: 0, role: 'builder', seat: 1, state: 'idle', label: 'L', sub: 'S' }), b = PPc.seat({ x: 0, y: 0, role: 'builder', seat: 1, state: 'working', label: 'L' });
    return [has(a, '<text class="pmx-p-lab" x="0" y="30"', '<text class="pmx-p-sub" x="0" y="48"') && !a.includes('data-floor') && has(b, '<text class="pmx-p-lab" x="0" y="42"'), a + ' | ' + b]; });
  g17('cycle 1 paper words: HTML lines in a foreignObject 12 px in and 8 px down, at the inner width (w - 24; 16 less beside the lock)', () => {
    const h = PPc.paper({ x: 0, y: 0, w: 120, h: 50, label: 'The job', sub: 'Add CSV', lock: true });
    return [has(h, '<foreignObject class="pmx-p-paper-fo" x="12" y="8" width="96" height="34">', '<div xmlns="http://www.w3.org/1999/xhtml" class="pmx-p-paper-text"><span class="pmx-p-note">The job</span><span class="pmx-p-lab" style="max-width:80px">Add CSV</span></div></foreignObject>') && !/<text[^>]*>(The job|Add CSV)</.test(h), h]; });
  /* 2026-10-09 (DL-154, F3-601): the caption is still appended after the drawings, but the slot's floor is the leanest
     DRAWING, not the caption, so a plate keeps a drawing while a roster's rows scroll (the runtime then raises the floor
     to the leanest drawing that fits the slot's width) */
  g17('cycle 1 / F3-601 pmxPlateFit({caption}): a 40 px caption plate appended after the drawings, the slot floor is the leanest drawing', () => {
    const h = X.pmxPlateFit({ key: 'fx', fit: 'full', plates: [X.pmxPlate({ mode: 'full', fitH: 170 }), X.pmxPlate({ mode: 'strip', fitH: 72 })], caption: 'Two work at once.' });
    return [has(h, '--pmx-fit-min:72px', '<figure class="pmx-plate" data-k="fx:caption" data-mode="caption" data-fit-h="40"', '<figcaption class="pmx-fine pmx-plate-cap">Two work at once.</figcaption></figure></div>') && !h.includes('--pmx-fit-min:40px') && h.indexOf('data-mode="strip"') < h.indexOf('data-mode="caption"'), h]; });
  g17('F3-601 pmxPlateFit({caption, tail}): a tail drawing leaner than the caption (the Chat Room lean line) sets the floor and stands after the caption', () => {
    const h = X.pmxPlateFit({ key: 'ft', plates: [X.pmxPlate({ mode: 'strip', fitH: 48 })], caption: 'Words.', tail: [X.pmxPlate({ mode: 'lean', fitH: 32 })] });
    return [h.includes('--pmx-fit-min:32px') && h.indexOf('data-mode="caption"') < h.indexOf('data-mode="lean"'), h]; });
  g17('F3-601 pmxPlateFit with a caption and no drawing: the caption alone sets the 40 px floor', () => {
    const h = X.pmxPlateFit({ key: 'fc', plates: [], caption: 'Words.' });
    return [h.includes('--pmx-fit-min:40px') && h.includes('data-mode="caption"'), h]; });
  /* F3-601 the wrap: a team too wide for one strip row is drawn on 2 or 3 rows, so pmxCastFit always holds a drawing
     at the 8-helper limit with both specialists; a small team never gets one */
  const castSp = n => ({ key: 'cx', kind: 'crew', fitKey: 'cx-fit', hub: { key: 'cx-hub', role: 'coordinator', label: 'Coordinator' },
    seats: Array.from({ length: n }, (_, i) => ({ key: 'cx-s' + i, role: 'builder', seat: (i % 8) + 1, label: ['Builder', 'Checker', 'Tester', 'Docs writer', 'Integrator', 'Architect', 'Reviewer', 'Researcher'][i % 8] })),
    wing: [{ key: 'cx-w', role: 'wonderer', seat: 1, label: 'Wonderer' }, { key: 'cx-g', role: 'grill', seat: 2, label: 'Grill Me' }], you: { label: 'You' }, caption: 'Words.' });
  g17('F3-601 pmxCastPlate(spec, "wrap"): 8 helpers and both specialists on 2-3 rows, a fork from the hub and a join to You, at scale-1 widths', () => {
    const h = X.pmxCastPlate(castSp(8), 'wrap'), t = /data-cast="wrap" data-tiers="([23])"/.exec(h), w = /viewBox="0 0 (\d+) /.exec(h);
    return [!!t && !!w && +w[1] <= 576 && has(h, 'data-mode="wrap"', 'data-k="cx:wrap:fork"', 'data-k="cx:wrap:join"', 'data-k="cx:wrap:toyou"', 'data-k="cx-w"', 'data-k="cx-g"'), h.slice(0, 400)]; });
  g17('F3-601 pmxCastFit: 8 helpers and both specialists still hold a drawing before the caption (the wrap); 2 helpers get no wrap', () => {
    const big = X.pmxCastFit(castSp(8)), small = X.pmxCastFit(castSp(2));
    return [big.includes('data-cast="wrap"') && big.indexOf('data-cast="wrap"') < big.indexOf('data-mode="caption"') && !/--pmx-fit-min:40px/.test(big) && !small.includes('data-cast="wrap"'), big.slice(0, 300) + ' | ' + small.slice(0, 200)]; });
  g17('cycle 1 pmxPlateFit without a caption keeps its modes only (no caption plate)', () => { const h = X.pmxPlateFit({ key: 'fy', fit: 'full', plates: [X.pmxPlate({ mode: 'full', fitH: 170 })] }); return [!h.includes('data-mode="caption"'), h]; });
  g17('cycle 1 pmxHero: the field sits in its own box (.pmx-hero-box), the box only around the field', () => { const h = X.pmxHero({ key: 'hb', n: 1, title: 'T', field: { tag: 'textarea', value: 'v' } }); return [has(h, '<div class="pmx-hero-box"><textarea class="pmx-hero-field"', '>v</textarea></div>'), h]; });
  g17('cycle 1 pmxActions: a kind\'s extra actions carry pmx-act-extra, the core (Open Panel, Message) never', () => {
    const h = X.pmxActions({ kind: 'crew', items: [{ action: 'collab-open-panel', label: 'Open Panel' }, { action: 'collab-message', label: 'Message' }, { action: 'review-export-report', label: 'Download' }] });
    return [/<button type="button" class="[^"]*\bpmx-act-extra\b[^"]*" data-action="review-export-report"/.test(h) && !/pmx-act-extra[^"]*" data-action="collab-(open-panel|message)"/.test(h), h]; });
  g17('cycle 1 pmxActions: a row with no core action keeps every action (no pmx-act-extra)', () => { const h = X.pmxActions({ items: [{ action: 'a', label: 'A' }, { action: 'b', label: 'B' }] }); return [!h.includes('pmx-act-extra'), h]; });

  /* 8b. IMPACT A2-14: the phrase primitives every lane builds its sentences from (the 9.1 / 9.3 strings) */
  const TM = X.pmxTime || {};
  pc('A2-14 pmxTime.clock / worked: "3:12", "not started", "8m 40s"', typeof TM.clock === 'function' && TM.clock(192000) === '3:12' && TM.clock(null) === 'not started' && typeof TM.worked === 'function' && TM.worked(520000) === '8m 40s');
  pc('A2-14 pmxTime.at / range / ago exist', ['at', 'range', 'ago'].every(n => typeof TM[n] === 'function'));
  const cost = st => X.pmxCost ? X.pmxCost(st) : '';
  pc('A2-14 pmxCost: the five 9.1 strings exactly', cost({ state: 'recorded' }) === 'Recorded example · no AI cost' && cost({ state: 'before' }) === 'Nothing spent' &&
    cost({ state: 'running', spent: 0.18, limit: 6 }) === '$0.18 so far of your $6.00 limit' && cost({ state: 'done', spent: 0.92, limit: 6 }) === '$0.92 of your $6.00 limit' && cost({ state: 'unknown' }) === 'Cost not reported',
    ['recorded', 'before', 'running', 'done', 'unknown'].map(st => cost({ state: st, spent: st === 'running' ? 0.18 : 0.92, limit: 6 })));
  pc('A2-14 pmxCost never prints $0.00 (DON\u2019T 17)', ['running', 'done', undefined].every(st => !/\$0\.00/.test(cost({ state: st, spent: 0, limit: 6 }) + cost({ state: st, spent: 0.001 }))));
  pc('A2-14 pmxTokens: "71K tokens" with the three-quarters-of-a-word hover', /71K tokens/.test(X.pmxTokens ? X.pmxTokens(71000, { key: 'tk' }) : '') && /data-hover-tip="[^"]*\u00be of a word/.test(X.pmxTokens ? X.pmxTokens(71000, { key: 'tk' }) : ''));
  pc('A2-14 pmxEstimate {minutes, limitUsd}: "About 5\u201315 min \u00b7 stops at $6.00 \u00b7 an estimate, not a promise"', has(X.pmxEstimate({ minutes: [5, 15], limitUsd: 6 }), 'About 5\u201315 min \u00b7 stops at $6.00 \u00b7 an estimate, not a promise') && has(X.pmxEstimate({ recorded: true }), 'Recorded example \u00b7 no AI cost'));
  const si = X.pmxStandIn ? X.pmxStandIn({ requested: 'Qwen 3.8 Coder', effective: 'Sonnet 4.6', reason: 'offline' }) : null;
  pc('A2-14 pmxStandIn: null when requested = effective; {strong, text, fine, tone} otherwise; requested/effective only in the fine line (DON\u2019T 19)', X.pmxStandIn && X.pmxStandIn({ requested: 'A', effective: 'A' }) === null && si && ['strong', 'text', 'fine', 'tone'].every(k => typeof si[k] === 'string') && /requested/.test(si.fine) && !/requested|effective/.test(si.strong + ' ' + si.text), si);
  const cl = X.pmxClamp ? X.pmxClamp({ asked: 3, runs: 2, unit: 'at a time' }) : null;
  pc('A2-14 pmxClamp: "2 at a time (you asked for 3)" and a sheet sentence', !!cl && (cl.card || cl) === '2 at a time (you asked for 3)' && (!cl.sheet || /3/.test(cl.sheet)), cl);
  const ll = X.pmxLedgerLine ? X.pmxLedgerLine({ key: 'l1', kind: 'schedule', glyph: 'check', headline: 'Sent on schedule', time: '10:00 PM', recorded: true, actions: [{ action: 'a1', label: 'Open' }, { action: 'a2', label: 'Two' }, { action: 'a3', label: 'Three' }] }) : '';
  pc('A2-14 pmxLedgerLine: the one-line receipt (44 px row shape), at most two actions, recorded play-ring', has(ll, 'class="pmx-run pmx-receipt"', 'data-density="receipt"', 'Sent on schedule', 'pmx-receipt-rec', 'data-action="a1"', 'data-action="a2"') && !ll.includes('data-action="a3"'), ll.slice(0, 200));
  const ic = X.pmxInlineConfirm ? X.pmxInlineConfirm({ key: 'ic', sentence: 'Cancel this Crew? Everything so far is kept.', confirm: { action: 'collab-cancel', label: 'Cancel Crew' }, keep: { action: 'collab-keep' } }) : '';
  pc('A2-14 pmxInlineConfirm: in place, never a modal; the sentence, the confirm and "Keep going"', has(ic, 'Cancel this Crew? Everything so far is kept.', 'data-action="collab-cancel"', '>Cancel Crew<', 'data-action="collab-keep"', '>Keep going<') && !/class="[^"]*\b(dialog|mdl|pmx-sheet)\b/.test(ic), ic);
  const rt = X.pmxRefusalText ? X.pmxRefusalText('invalid_policy_roster', {}) : null;
  pc('A2-14 pmxRefusalText: the 9.3 sentence for a code, the code kept aside (never in the words)', !!rt && /Crew Auto teams/.test((rt.strong || '') + ' ' + (rt.text || '')) && rt.code === 'invalid_policy_roster' && !/invalid_policy_roster/.test((rt.strong || '') + (rt.text || '') + (rt.fix || '')), rt);
  pc('A2-14 pmxMoney: two decimals, never "$0.00" as a spend line (pmxCost guards it)', X.pmxMoney(0.18) === '$0.18' && X.pmxMoney(6) === '$6.00');
  pc('A2-14 pmxFill fills {name} slots from vars', X.pmxFill('a {x} b {y}', { x: 1, y: 'z' }) === 'a 1 b z');
  pc('A2-14 PMX_COPY holds the shared 9.1 strings', !!X.PMX_COPY && typeof X.PMX_COPY === 'object' && X.PMX_COPY.cost && X.PMX_COPY.cost.recorded === 'Recorded example · no AI cost');
  pc('A2-14 pmxReceipt is the Collab preset of pmxLedgerLine (same row shape)', rootTag(X.pmxReceipt({ key: 'q', kind: 'crew' })).startsWith('<article class="pmx-run pmx-receipt"') && rootTag(X.pmxLedgerLine({ key: 'q', kind: 'crew' })).startsWith('<article class="pmx-run pmx-receipt"'));

  /* 9. Keys and attributes are escaped. */
  pc('keys and attribute values are escaped', has(X.pmxQuestion({ key: 'a"b<c' }), 'data-k="a&quot;b&lt;c"') && has(X.pmxSwitch({ options: [{ value: 'x"y', label: 'L' }] }), 'data-value="x&quot;y"'));
  pc('pmxHash is stable and discriminating', X.pmxHash('abc') === X.pmxHash('abc') && X.pmxHash('abc') !== X.pmxHash('abd') && /^[0-9a-z]+$/.test(X.pmxHash('abc')));

  /* 10. Tag balance of every builder output above. */
  const unbalanced = built.filter(([, h]) => !balanced(h)).map(([n]) => n);
  pc('every builder output is tag-balanced', unbalanced.length === 0, unbalanced);

  /* 11. Section 4.0 convention: every builder takes cls and attrs. Probed on the
         builder's root element; reported as GAP (see the header). */
  const probe = { cls: 'zz-hook-cls', attrs: 'data-zz-hook="1"' };
  const ROOTED = {
    pmxQuestion: {}, pmxHero: {}, pmxCtl: {}, pmxRoster: {}, pmxShelf: {}, pmxStepper: {}, pmxSwitch: { options: [{ value: 'a', label: 'A' }] }, pmxWords: { items: [] },
    pmxPromise: {}, pmxAdvancedEntry: {}, pmxAdvancedPage: {}, pmxSetting: {}, pmxPreview: {}, pmxReadback: {}, pmxRefusal: {}, pmxFoot: { primary: { action: 'p' } }, pmxConfirm: {}, pmxTabs: { items: [] },
    pmxTrack: { stops: [] }, pmxLanes: {}, pmxDecision: {}, pmxResult: {}, pmxOutput: {}, pmxCredits: {}, pmxMeta: {}, pmxActions: {}, pmxDockLine: {}, pmxFinding: {}, pmxAgree: {}, pmxVoteBoard: { options: [] },
    pmxQuote: {}, pmxNote: {}, pmxTick: {}, pmxDivider: {}, pmxFilesRow: {}, pmxCodeRow: {}, pmxViewSection: {}, pmxTimeline: { entries: [] }, pmxParticipant: {}, pmxPlate: {}, pmxMark: {},
    pmxSheet: { kind: 'crew' }, pmxRosterRow: {}, pmxRoute: {}, pmxRun: { kind: 'crew' }, pmxReceipt: { kind: 'crew' }, pmxLane: {}, pmxGuide: {}, pmxView: { kind: 'crew' }, pmxTeamRow: {}, pmxCheck: {}
  };
  for (const [name, base] of Object.entries(ROOTED)) {
    let h = '';
    try { h = X[name](Object.assign({}, base, probe)); } catch (e) { gaps.push(name + ' threw ' + e.message); continue; }
    const r = name === 'pmxSheet' ? rootAfterScrim(h) : rootTag(h);
    const lack = [];
    if (!r.includes('zz-hook-cls')) lack.push('cls');
    /* pmxCheck puts attrs on its real input by design (A11) */
    if (name === 'pmxCheck' ? !h.includes('<input type="checkbox" data-zz-hook="1"') : !r.includes('data-zz-hook="1"')) lack.push('attrs');
    if (lack.length) gaps.push(name + ' root lacks ' + lack.join('+'));
  }
})();
/* Owner amendment J-1 (fonts), read from the foundation sources: no Newsreader anywhere, no
   @font-face family but Inter, Poppins and IBM Plex Mono, IBM Plex Mono embedded, --font-mono led
   by it ONLY inside a retro-scoped rule (correction 2026-09-27: basic, glass and friendly keep
   styles.css's system monospace stack for code), the voice never italic. Reported as `GAP J-1` lines (informational like the 4.0 GAPs,
   failures with PMX_SELFCHECK_STRICT=1); tests/pmx-verify.mjs theme-font proves it at runtime. */
const j1 = [];
(function j1Sources() {
  const path = require('path');
  const dir = path.join(__dirname, '..');
  const files = ['module-shell.js', 'module-shell.css', 'pmx-system.js', 'pmx-system.css'].filter(f => fs.existsSync(path.join(dir, f)));
  const txt = {}; for (const f of files) txt[f] = fs.readFileSync(path.join(dir, f), 'utf8');
  for (const f of files) { const n = (txt[f].match(/newsreader/ig) || []).length; if (n) j1.push(f + ' mentions Newsreader ' + n + 'x'); }
  const fams = new Set();
  for (const f of files) for (const m of txt[f].matchAll(/@font-face\s*\{[^}]*?font-family\s*:\s*(['"]?)([^;'"}]+)\1/ig)) fams.add(m[2].trim());
  const bad = [...fams].filter(x => !/^(inter|poppins|ibm plex mono)$/i.test(x));
  if (bad.length) j1.push('@font-face families other than Inter, Poppins, IBM Plex Mono: ' + bad.join(', '));
  const css = files.filter(f => f.endsWith('.css')).map(f => txt[f]).join('\n');
  if (![...fams].some(x => /^ibm plex mono$/i.test(x))) j1.push('no @font-face for IBM Plex Mono in the foundation sheets (retro has no embedded face)');
  /* each --font-mono declaration with the selector of the rule that holds it (comments stripped) */
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const decls = [];
  for (const m of bare.matchAll(/--font-mono\s*:\s*([^;}]+)/g)) {
    const open = bare.lastIndexOf('{', m.index), prev = Math.max(bare.lastIndexOf('}', open), bare.lastIndexOf('{', open - 1));
    decls.push({ sel: bare.slice(prev + 1, open).trim().replace(/\s+/g, ' '), val: m[1].trim() });
  }
  const plex = decls.filter(d => /IBM Plex Mono/i.test(d.val));
  if (!plex.some(d => /retro/.test(d.sel) && /^['"]?IBM Plex Mono/i.test(d.val))) j1.push('no retro-scoped --font-mono leading with IBM Plex Mono (retro --font-ui resolves to it)');
  for (const d of plex) if (!/retro/.test(d.sel)) j1.push('--font-mono set to IBM Plex Mono outside the retro themes (selector: ' + d.sel.slice(0, 60) + '); Plex is retro-only');
  const ital = [...css.matchAll(/--pmx-voice-italic\s*:\s*([^;}]+)/g)].map(m => m[1].trim()).filter(v => v !== 'normal');
  if (ital.length) j1.push('--pmx-voice-italic is not normal: ' + [...new Set(ital)].join(', '));
})();
/* Closing review (turn-verify blocker, 2026-09-28): a :has() in a NON-rightmost compound whose rightmost compound
   carries no class, id, tag or attribute (`A:has(> X) > :not(X)`, `A:has(...) > *`) makes Chromium's shared :has
   descendant invalidation set whole-subtree: every :has anchor (body, the transcript, each message) then restyles its
   whole subtree on every DOM insertion under it, which doubled the style work of a streaming reply and let
   turn-stream's clip spring run away under load. A rightmost compound with an attribute and no class, id or tag
   (`A:has(X) > [data-action="y"]`) is the same fault in a narrower form: the shared set gains the attribute, and every
   anchor restyles every element carrying it (every button with a data-action) on each insertion; measured
   2026-09-28 (second rerun): about 7k extra element restyles in the 8 s fold/stream window. Every *.css of the
   concept is scanned (comments stripped). Since the lane fix landed in the worktree (20:24Z, lane patch v2) this is a
   hard check: a hit fails the selfcheck and prints a `has-scope` line naming file and selector. The fix is always to
   give the rightmost compound a class the targets carry (`> .a:not(X), > .b:not(X)` for `> :not(X)`, `> .pmx-act[...]`;
   one selector per class, not `> :is(.a, .b)`: see the universal-bucket check below). */
const hasScope = [];
(function hasScopeSources() {
  const path = require('path');
  const dir = path.join(__dirname, '..');
  const topSplit = (s, sep) => { const out = []; let d = 0, cur = '', q = null; for (const c of s) { if (q) { cur += c; if (c === q) q = null; continue; } if (c === '"' || c === "'") { q = c; cur += c; continue; } if (c === '(' || c === '[') d++; else if (c === ')' || c === ']') d--; if (d === 0 && sep.test(c)) { out.push(cur); cur = ''; continue; } cur += c; } out.push(cur); return out; };
  const compounds = sel => topSplit(sel.trim().replace(/\s*([>+~])\s*/g, ' '), /\s/).filter(Boolean);
  const stripNot = c => { let out = '', d = 0; for (let i = 0; i < c.length; i++) { if (d === 0 && c.startsWith(':not(', i)) { let j = i + 5, dd = 1; while (j < c.length && dd) { if (c[j] === '(') dd++; else if (c[j] === ')') dd--; j++; } i = j - 1; continue; } out += c[i]; } return out; };
  const bare = c => stripNot(c).replace(/::?[a-z-]+(\([^)]*\))?/g, m => /^:(is|where)\(/.test(m) ? m : '');
  const hasFeature = c => { const x = bare(c); return /[.#\[]/.test(x) || /^[a-zA-Z]/.test(x); };
  const attrOnly = c => { const x = bare(c); return /\[/.test(x) && !/[.#]/.test(x) && !/^[a-zA-Z]/.test(x); };
  for (const f of fs.readdirSync(dir).filter(n => /\.css$/.test(n)).sort()) {
    const css = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    /* every prelude before a "{" that is a selector (not an at-rule, not a declaration block) */
    const re = /([^{};]+)\{/g; let m;
    while ((m = re.exec(css))) {
      const pre = m[1].trim(); if (!pre || pre[0] === '@' || !pre.includes(':has(')) continue;
      for (const cx of topSplit(pre, /,/)) {
        const cs = compounds(cx); if (cs.length < 2) continue;
        const right = cs[cs.length - 1];
        if (/:has\(/.test(cs.slice(0, -1).join(' ')) && (!hasFeature(right) || attrOnly(right))) hasScope.push(f + ': ' + (hasFeature(right) ? '[attribute only] ' : '') + cx.trim().replace(/\s+/g, ' ').slice(0, 160));
      }
    }
  }
})();
for (const h of hasScope) console.log('has-scope: ' + h);
pc('closing review: no :has() rule widens the shared :has invalidation set (whole subtree or a bare attribute)', hasScope.length === 0, hasScope);
/* Closing perf pass (turn-verify --cpu-throttle 4, 2026-09-29): Chromium files a rule under the class, id, attribute
   or tag of its RIGHTMOST compound and tries it only on elements that carry one; a rightmost compound led by
   `:is(...)` / `:where(...)` with no class, id, tag or attribute of its own lands in the universal bucket and is tried
   on EVERY element in EVERY style recalc (the fold's renders force 5-10 recalcs each, turn-stage restyles the whole
   document every frame). When no ancestor compound carries a class or id either (`:is(.a, .b)`, `body[data-theme]
   :is(.a, .b)`, `:is(.x, .y) :is(code, pre)`), the ancestor bloom filter cannot reject it first. 210 universal-bucket
   selectors in the built page against main's 40 made our full-document recalc about 20 % dearer than main's and cost
   the throttled fold its 300 ms hold. Write one selector per argument instead (`X .a, X .b`; `X code, X pre`) and keep
   the :is() specificity, which is that of its largest argument (repeat an arm's own class, `.x.x`, or qualify it with
   the tag its producer emits). Hard check over our module sheets (Chat WOW's sheets are theirs): no rightmost
   :is()/:where() list without a feature of its own and without an ancestor class or id, except where Chromium buckets
   it anyway (:focus, :focus-visible). */
const uniBucket = [];
(function universalBucketSources() {
  const path = require('path');
  const dir = path.join(__dirname, '..');
  const THEIRS = /^(styles|motion|turn-stage|turn-stream|chat-sound|orbit|questions|variants-[abc]|transcripts|composer)\.css$/;
  const topSplit = (s, sep) => { const out = []; let d = 0, cur = '', q = null; for (const c of s) { if (q) { cur += c; if (c === q) q = null; continue; } if (c === '"' || c === "'") { q = c; cur += c; continue; } if (c === '(' || c === '[') d++; else if (c === ')' || c === ']') d--; if (d === 0 && sep.test(c)) { out.push(cur); cur = ''; continue; } cur += c; } out.push(cur); return out; };
  const compounds = sel => topSplit(sel.trim().replace(/\s*([>+~])\s*/g, ' '), /\s/).filter(Boolean);
  const depth0 = c => { let d = 0, out = ''; for (const ch of c) { if (ch === '(') { d++; continue; } if (ch === ')') { d--; continue; } if (d === 0) out += ch; } return out; };
  for (const f of fs.readdirSync(dir).filter(n => /\.css$/.test(n) && !THEIRS.test(n)).sort()) {
    const css = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const re = /([^{};]+)\{/g; let m;
    while ((m = re.exec(css))) {
      const pre = m[1].trim(); if (!pre || pre[0] === '@' || !/:(is|where)\(/.test(pre)) continue;
      for (const cx of topSplit(pre, /,/)) {
        const cs = compounds(cx); if (!cs.length) continue;
        const right = cs[cs.length - 1], own = depth0(right).replace(/::?[a-z-]+/g, '');
        if (!/^:(is|where)\(/.test(right) || /[.#\[]/.test(own) || /^[a-zA-Z]/.test(own) || /:focus/.test(right)) continue;
        /* an ancestor class or id outside a :is() list lets the bloom filter reject it first */
        if (/[.#][\w-]/.test(cs.slice(0, -1).map(depth0).join(' '))) continue;
        uniBucket.push(f + ': ' + cx.trim().replace(/\s+/g, ' ').slice(0, 160));
      }
    }
  }
})();
for (const u of uniBucket) console.log('universal-bucket: ' + u);
pc('closing perf pass: no rule of ours is tried on every element with no ancestor to reject it first (a rightmost :is() list, no class, id or tag)', uniBucket.length === 0, uniBucket);
/* IMPACT amendments (2026-09-27), read from the foundation sources (comments and embedded font data
   stripped): no color-mix() (A1-15), no backdrop-filter (A1-02), no element filter (A1-04), no
   stroke-dashoffset or pathLength (A1-05), PARTS defined, exported and holding the 6.6 vocabulary,
   SURFACES exported and app.js's FOLLOW_HOSTS built from it (A2-18). Reported as `GAP IMPACT` lines
   (informational like the 4.0 GAPs, failures with PMX_SELFCHECK_STRICT=1); tests/pmx-verify.mjs proves
   each at runtime (forbidden-props, parts, surfaces-list). */
(function impactSources() {
  const path = require('path');
  const dir = path.join(__dirname, '..');
  const FOUND = ['module-shell.css', 'pmx-system.css', 'module-shell.js', 'pmx-system.js'];
  const raw = {}; for (const f of FOUND) if (fs.existsSync(path.join(dir, f))) raw[f] = fs.readFileSync(path.join(dir, f), 'utf8');
  const code = f => (raw[f] || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/url\(data:[^)]*\)/g, 'url()');
  for (const f of Object.keys(raw)) {
    const c = code(f);
    const mix = (c.match(/color-mix\(/g) || []).length;
    if (mix) impact.push('A1-15 ' + f + ' has ' + mix + ' color-mix() (write the precomputed literals of 3.3 instead)');
    const bf = c.match(/(?:-webkit-)?backdrop-filter\s*:\s*['"]?(?!none\b)[^;}'"]+/g) || [];
    if (bf.length) impact.push('A1-02 ' + f + ' declares backdrop-filter ' + bf.length + 'x (first: ' + bf[0].replace(/\s+/g, ' ').slice(0, 44) + ')');
    const fl = c.match(/(?:^|[^-\w.])filter\s*:\s*['"]?(?!none\b)[^;}'",]+/g) || [];
    if (fl.length) impact.push('A1-04 ' + f + ' sets filter ' + fl.length + 'x (first: ' + fl[0].replace(/\s+/g, ' ').trim().slice(0, 44) + ')');
    const sd = (c.match(/stroke-dashoffset|strokeDashoffset/g) || []).length;
    if (sd) impact.push('A1-05 ' + f + ' uses stroke-dashoffset ' + sd + 'x (draw-ons are clip reveals, R-23)');
    const pl = (c.match(/pathLength/g) || []).length;
    if (pl) impact.push('A1-05 ' + f + ' uses pathLength ' + pl + 'x');
  }
  const js = code('pmx-system.js');
  const SPEC_PARTS = 'job team lead assign parallel specialists wonderer grill permission auto target focus count blind rounds research questions policy moderator mode watch catchup quiet stages when route missed reach voice inherit who wind days you meter notes rules'.split(' ');
  const pm = /\bPARTS\s*=\s*(?:Object\.freeze\(\s*)?\[([^\]]*)\]/.exec(js);
  if (!pm) impact.push('6.6 pmx-system.js defines no PARTS array (PM56_PMX.PARTS: the one part vocabulary)');
  else {
    const parts = [...pm[1].matchAll(/['"]([^'"]+)['"]/g)].map(m => m[1]);
    const lacks = SPEC_PARTS.filter(p => !parts.includes(p));
    if (lacks.length) impact.push('6.6 PARTS lacks ' + lacks.join(', '));
    if (!/[{,\s]PARTS\s*:/.test(js)) impact.push('6.6 PARTS is defined but not exported on PM56_PMX');
    /* the builders' own default parts (affects || 'job', part || 'you', literal data-pmx-* values) are in PARTS */
    const ms = code('module-shell.js');
    const defaults = new Set([...ms.matchAll(/\b(?:affects|part)\s*\|\|\s*['"]([a-z:*-]+)['"]/g)].map(m => m[1]));
    for (const m of ms.matchAll(/data-pmx-(?:affects|part)="([a-z: -]+)"/g)) for (const t of m[1].split(/\s+/).filter(Boolean)) defaults.add(t);
    const outside = [...defaults].filter(t => !parts.includes(t) && !(t.includes(':') && parts.includes(t.split(':')[0] + ':*')));
    if (outside.length) impact.push('6.6 builder default parts outside PARTS: ' + outside.join(', '));
  }
  if (!/[{,\s]SURFACES\s*:/.test(js)) impact.push('A2-18 PM56_PMX.SURFACES is not exported');
  const appPath = path.join(dir, 'app.js');
  if (fs.existsSync(appPath)) {
    /* the follow-host list (FOLLOW_HOSTS, or the followHosts() that replaced it) reads PM56_PMX.SURFACES */
    const app = fs.readFileSync(appPath, 'utf8'), i = app.search(/function followHosts|FOLLOW_HOSTS\s*=/);
    const near = i >= 0 ? app.slice(i, i + 1500) : '';
    if (!/PM56_PMX[\s\S]{0,120}SURFACES/.test(near)) impact.push('A2-18 app.js builds its follow hosts without PM56_PMX.SURFACES (F0b)');
  }
})();
/* Coverage: every pmx builder on PM56_SHELL is called by this file (a builder added later without a
   check is reported as a GAP line; strict mode fails it). */
const unexercised = (() => {
  const own = fs.readFileSync(__filename, 'utf8');
  const called = new Set([...own.matchAll(/\bX\.(pmx\w+)\(/g)].map(m => m[1]));
  return Object.keys(S).filter(n => /^pmx/.test(n) && typeof S[n] === 'function' && !called.has(n));
})();
for (const n of unexercised) gaps.push(n + ' is on PM56_SHELL but no check in this file calls it');
for (const [n, ok, detail] of pmxChecks) checks.push([n + (ok || detail === undefined ? '' : '  ' + JSON.stringify(detail).slice(0, 300)), ok]);
for (const iline of impact) console.log('GAP IMPACT: ' + iline);
if (process.env.PMX_SELFCHECK_STRICT) for (const iline of impact) checks.push(['GAP IMPACT ' + iline, false]);
for (const jline of j1) console.log('GAP J-1 fonts: ' + jline);
if (process.env.PMX_SELFCHECK_STRICT) for (const jline of j1) checks.push(['GAP J-1 ' + jline, false]);
for (const gline of gaps) console.log('GAP 4.0 convention: ' + gline);
if (gaps.length) console.log('GAP total ' + gaps.length + (process.env.PMX_SELFCHECK_STRICT ? ' (strict: counted as failures)' : ' (informational; PMX_SELFCHECK_STRICT=1 makes them fail)'));
if (process.env.PMX_SELFCHECK_STRICT) for (const gline of gaps) checks.push(['GAP ' + gline, false]);
console.log('pmx checks: ' + pmxChecks.length + ' run, ' + pmxChecks.filter(c => !c[1]).length + ' failed');
let bad = 0;
for (const [n, ok] of checks) if (!ok) { bad++; console.log('FAIL', n); }
// balanced-tag sanity on the composite
const open = (d.match(/<(section|div|span|button|label|article|details|summary|footer|p|small|strong)\b/g) || []).length;
const close = (d.match(/<\/(section|div|span|button|label|article|details|summary|footer|p|small|strong)>/g) || []).length;
if (open !== close) { bad++; console.log('FAIL tag balance', open, close); }
console.log(bad ? 'SHELL SELFCHECK FAIL (' + bad + ')' : 'SHELL SELFCHECK OK');
process.exit(bad ? 1 : 0);
