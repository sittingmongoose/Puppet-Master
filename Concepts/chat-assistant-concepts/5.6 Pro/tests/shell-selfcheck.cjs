const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../module-shell.js', 'utf8');
global.window = {};
eval(src);
const S = window.PM56_SHELL;
const body =
  S.section({ label: 'Sec', iconHtml: '<svg/>', meta: 'm', body:
    S.grid2(
      S.field('Model', S.pickerButton({ action: 'a', anchor: 'b', strong: 'V', small: 's', iconHtml: '<svg/>' })) +
      S.field('X', '<input type="text">')
    ) }) +
  S.seg([['off', 'Off'], ['on', 'On']], 'on', 'act') +
  S.tabs([['a', 'A'], ['b', 'B']], 'a', { action: 'tab', attr: 'data-tab' }) +
  S.choice({ value: null, label: 'Use default', detail: 'd', active: true, action: 'c' }) +
  S.chip('warning', 'W') +
  S.rows([['k', 'v']]) +
  S.note('n', 'danger') +
  S.disclosure('dk', 'sum', 'body', true, 'legacy-cls') +
  S.stats([['L', '1']]) +
  S.card({ attrs: ' data-k="ck"', head: S.cardHead({ iconHtml: '<svg/>', copy: S.copy('strong', 'span'), extra: '<i/>' }), body: '<p></p>', actions: '<button></button>' }) +
  S.check('lbl', true, ' data-x="1"');
const d = S.dialog({ iconHtml: '<svg/>', title: 'T', sub: 'S', pill: 'P', width: 600, cls: 'legacy-dialog', body, foot: S.foot('left', 'right'), closeAction: 'x-close' });
const checks = [
  ['dialog class', d.startsWith('<section class="dialog mdl legacy-dialog"')],
  ['width style', d.includes('width:min(600px,calc(100vw - 20px))')],
  ['aria-label', d.includes('aria-label="T"')],
  ['pill', d.includes('meta-pill')],
  ['close action', d.includes('data-action="x-close"')],
  ['foot', d.includes('mdl-foot') && d.includes('left<span class="spacer"></span>right')],
  ['section', d.includes('mdl-section-label">Sec') && d.includes('mdl-section-meta">m')],
  ['seg active', d.includes('data-value="on" aria-pressed="true"') && d.includes('class="">') === false ? true : d.includes('data-action="act" data-value="off" aria-pressed="false"')],
  ['tabs data-tab', d.includes('data-tab="a"') && d.includes('role="tablist"')],
  ['choice null', d.includes('data-value="null"') && d.includes('role="radio" aria-checked="true"')],
  ['disclosure open', d.includes('data-k="dk" open') && d.includes('class="mdl-disclosure legacy-cls"')],
  ['rows', d.includes('<div><span>k</span><strong>v</strong></div>')],
  ['note danger', d.includes('class="mdl-note danger"')],
  ['disclosure open', d.includes('data-k="dk" open')],
  ['stats', d.includes('mdl-stats') && d.includes('<strong>1</strong><span>L</span>')],
  ['card', d.includes('<article class="mdl-card" data-k="ck">') && d.includes('mdl-card-actions')],
  ['dialog cls', d.includes('class="dialog mdl legacy-dialog"')],
  ['picker', d.includes('shared-picker-button') && d.includes('data-menu-anchor="b"') && d.includes('<small>s</small>')],
  ['esc', S.esc('<a b="c">') === '&lt;a b=&quot;c&quot;&gt;'],
];
let bad = 0;
for (const [n, ok] of checks) if (!ok) { bad++; console.log('FAIL', n); }
// balanced-tag sanity on the composite
const open = (d.match(/<(section|div|span|button|label|article|details|summary|footer|p|small|strong)\b/g) || []).length;
const close = (d.match(/<\/(section|div|span|button|label|article|details|summary|footer|p|small|strong)>/g) || []).length;
if (open !== close) { bad++; console.log('FAIL tag balance', open, close); }
console.log(bad ? 'SHELL SELFCHECK FAIL (' + bad + ')' : 'SHELL SELFCHECK OK');
process.exit(bad ? 1 : 0);
