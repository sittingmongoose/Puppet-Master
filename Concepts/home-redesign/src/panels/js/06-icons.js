/* Icons: one stroke set at 16 px (drawn at 14 px in a 16 px slot), currentColor, no fills except dots. Kinds and
   controls name them (PM_HOME.icons). Retro draws a one-cell glyph instead of the drawing (RETRO_GLYPH), NieR keeps the
   drawing but thins it (CSS). No emoji anywhere (D22). */

var ICON_PATHS = {
  terminal: 'M3 4.5l3.5 3.5L3 11.5M8.5 12H13',
  browser: 'M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zM2 8h12M8 2c1.9 1.7 2.8 3.8 2.8 6S9.9 12.3 8 14M8 2C6.1 3.7 5.2 5.8 5.2 8S6.1 12.3 8 14',
  file: 'M4 2h5.5L12.5 5v9H4zM9.5 2v3h3',
  code: 'M5.5 4.5 2.5 8l3 3.5M10.5 4.5l3 3.5-3 3.5',
  dashboard: 'M2.5 2.5h4.5v4.5H2.5zM9 2.5h4.5v4.5H9zM2.5 9h4.5v4.5H2.5zM9 9h4.5v4.5H9z',
  plan: 'M3 3.5h10M3 6.5h10M3 9.5h7M3 12.5h5',
  document: 'M4 2h8v12H4zM6 5h4M6 7.5h4M6 10h2.5',
  artifact: 'M2.5 3h11v10h-11zM4.5 10.5l2.2-3 2 2 2.6-4',
  run: 'M5.5 6.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4zM10.8 6.2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4zM2.5 12.8c0-1.9 1.4-3.3 3-3.3s3 1.4 3 3.3M7.8 12.8c0-1.9 1.4-3.3 3-3.3s3 1.4 3 3.3',
  transcript: 'M2.5 3h11v7.5H7l-3 2.5v-2.5H2.5z',
  context: 'M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM8 5.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z',
  record: 'M3.5 2h9v12l-2-1.2-2.5 1.2-2.5-1.2-2 1.2zM6 5.5h4M6 8h4',
  output: 'M2.5 3h11v10h-11zM2.5 6h11M5 8.5h4M5 10.5h6',
  problems: 'M8 2.2 14 13H2zM8 6.5v3M8 11.2v.1',
  ports: 'M6 2v3M10 2v3M4.5 5h7v2.5a3.5 3.5 0 0 1-7 0zM8 11v3',
  debug: 'M5.5 5.5h5v4.8a2.5 2.5 0 0 1-5 0zM6.5 5.5V4a1.5 1.5 0 0 1 3 0v1.5M3 7h2.5M10.5 7H13M3 10.5h2.5M10.5 10.5H13M3.5 13.5l2-1.5M12.5 13.5l-2-1.5',
  console: 'M2.5 3h11v10h-11zM5 6.5l2 1.5-2 1.5M8.5 10h2.5',
  splitRight: 'M2.5 3h11v10h-11zM8 3v10',
  splitDown: 'M2.5 3h11v10h-11zM2.5 8h11',
  maximize: 'M3 6V3h3M13 6V3h-3M3 10v3h3M13 10v3h-3',
  restore: 'M6 3v3H3M10 3v3h3M6 13v-3H3M10 13v-3h3',
  more: 'M8 3.4v.1M8 8v.1M8 12.6v.1',
  moreH: 'M3.4 8h.1M8 8h.1M12.6 8h.1',
  close: 'M4.5 4.5l7 7M11.5 4.5l-7 7',
  plus: 'M8 3v10M3 8h10',
  search: 'M7 2.8a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4zM10.2 10.2 13.5 13.5',
  pin: 'M6 2.5h4M6.7 2.5v4L4.5 9h7L9.3 6.5v-4M8 9v4.5',
  lock: 'M4 7.5h8v6H4zM5.8 7.5V5.5a2.2 2.2 0 0 1 4.4 0v2',
  chevronRight: 'M6 3.5 10.5 8 6 12.5',
  chevronDown: 'M3.5 6 8 10.5 12.5 6',
  chevronLeft: 'M10 3.5 5.5 8l4.5 4.5',
  grip: 'M2.5 8.5 8.5 2.5M5.5 8.5l3-3',
  reopen: 'M3.5 6.5h6.5a3 3 0 0 1 0 6H6M5.5 4.2 3.2 6.5l2.3 2.3',
  panel: 'M2.5 3h11v10h-11zM2.5 6h11',
  newPanel: 'M2.5 3h11v10h-11zM8 3v10M10.8 6.2v3.6M9 8h3.6',
  layout: 'M2.5 3h11v10h-11zM8 3v5M2.5 8h11',
  chat: 'M2.5 3.5h11v7H8l-3 2.5v-2.5H2.5z',
  history: 'M3 8a5 5 0 1 0 1.5-3.6M3 2.8v2.6h2.6M8 5.2V8l2 1.3',
  popOut: 'M9 2.5h4.5V7M13.5 2.5 8 8M11.5 9.5v4H2.5v-9h4',
  agent: 'M3.5 3.5h9v9h-9zM6 8h4',
  git: 'M5 3v10M5 6.5a2 2 0 1 0 0-.01M11 5.5a1.6 1.6 0 1 0 0-.01M11 7.1c0 3-6 1.5-6 4.4',
  folder: 'M2.5 4h4l1.4 1.5h5.6v7h-11z',
  clock: 'M8 2.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM8 5v3l2 1.4',
  check: 'M3.5 8.5l3 3 6-7',
  cross: 'M4.5 4.5l7 7M11.5 4.5l-7 7',
  replace: 'M3 5h7.5M8.5 3l2 2-2 2M13 11H5.5M7.5 9l-2 2 2 2',
  arrowUp: 'M8 13V3M4 7l4-4 4 4',
  arrowDown: 'M8 3v10M4 9l4 4 4-4',
  regex: 'M10.5 2.5v5M8.3 3.8l4.4 2.4M8.3 6.2l4.4-2.4M4 12a1 1 0 1 0 0-.01',
  caseSense: 'M2.5 12 5 4.5 7.5 12M3.4 9.5h3.2M10.5 8.7a1.9 1.9 0 1 1 0 3.3M12.4 7.5V12',
  wholeWord: 'M2.5 12.5h11M4 4.5 5.2 10 6.5 6.5 7.8 10 9 4.5M10.5 4.5v6',
  reload: 'M13 8a5 5 0 1 1-1.5-3.6M13 2.8v2.6h-2.6',
  back: 'M13 8H3.5M7 4.5 3.5 8 7 11.5',
  forward: 'M3 8h9.5M9 4.5l3.5 3.5L9 11.5',
  camera: 'M2.5 5h2.5l1-1.5h4l1 1.5h2.5v7.5h-11zM8 6.8a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4z',
  region: 'M2.5 5V2.5H5M11 2.5h2.5V5M13.5 11v2.5H11M5 13.5H2.5V11',
  pointer: 'M4 2.5l7.5 5.5-3.2.6L10 12.5l-1.6.8-1.7-3.9L4 11.6z',
  devtools: 'M2.5 3h11v10h-11zM5 7l1.8 1.5L5 10M8.5 10h2.5',
  link: 'M6.8 9.2 9.2 6.8M7.5 4.8l1-1a2.5 2.5 0 0 1 3.6 3.6l-1 1M8.5 11.2l-1 1a2.5 2.5 0 0 1-3.6-3.6l1-1',
  keep: 'M4 2.5h8v11L8 10.8 4 13.5z',
  diff: 'M4.5 2.5v6M1.8 5.5h5.4M9 11.5h5.2M11.5 2.5v4',
  play: 'M5 3.5v9l7-4.5z',
  pause: 'M5.5 3.5v9M10.5 3.5v9',
  stop: 'M4 4h8v8H4z',
  message: 'M2.5 3.5h11v7H8l-3 2.5v-2.5H2.5zM5 6.5h6',
  widget: 'M2.5 2.5h11v11h-11zM2.5 6.5h11M6.5 6.5v7',
  eye: 'M1.8 8S4 3.8 8 3.8 14.2 8 14.2 8 12 12.2 8 12.2 1.8 8 1.8 8zM8 6.3a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4z',
  rename: 'M3 12.5h2l7-7-2-2-7 7zM9 4.5l2 2',
  target: 'M8 2.5v2M8 11.5v2M2.5 8h2M11.5 8h2M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z'
};
var DOT_ICONS = { more: 1, moreH: 1 };
var RETRO_GLYPH = {
  terminal: '>_', browser: '@', file: '#', code: '#', dashboard: '::', plan: '=', document: '¶', artifact: '%',
  run: '&', transcript: '"', context: 'o', record: '$', output: '|', problems: '!', ports: ':', debug: '*', console: '>'
};

function icon(name, opts) {
  opts = opts || {};
  var d = ICON_PATHS[name];
  var size = opts.size || 14;
  var cls = 'pmw-ico' + (opts.cls ? ' ' + opts.cls : '');
  if (!d) {
    if (typeof name === 'string' && name.indexOf('<svg') === 0) {
      var wrap = h('span', { class: cls, 'aria-hidden': 'true', html: name });
      return wrap;
    }
    d = ICON_PATHS.file;
  }
  var ns = 'http://www.w3.org/2000/svg';
  var svg = doc.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('class', cls);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  var path = doc.createElementNS(ns, 'path');
  path.setAttribute('d', d);
  if (DOT_ICONS[name]) path.setAttribute('stroke-width', '2.2');
  svg.appendChild(path);
  if (opts.glyph !== false && RETRO_GLYPH[name]) svg.setAttribute('data-glyph', RETRO_GLYPH[name]);
  return svg;
}
/* An icon in a 16 px slot that also carries the Retro one-cell glyph (CSS shows one or the other). */
function kindIcon(name) {
  var slot = h('span', { class: 'pmw-kico', 'aria-hidden': 'true' });
  slot.appendChild(icon(name));
  if (RETRO_GLYPH[name]) slot.appendChild(h('span', { class: 'pmw-kglyph', text: RETRO_GLYPH[name] }));
  return slot;
}
PMW.icon = icon;
PMW.kindIcon = kindIcon;
PM_HOME.icons = Object.keys(ICON_PATHS);
PM_HOME.icon = function (name, opts) { return icon(name, opts); };
