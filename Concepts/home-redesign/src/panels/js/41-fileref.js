/* D7 file references (CONTRACT section 6, rule 3): one helper for every kind that shows a file a person can click, so
   a path in a plan, a document, a record, a transcript or a browser's component source opens exactly as the file tree
   does. A single click opens the panel's preview tab after a short wait, so a double click can still win: a link inside
   a document opens its preview in the same panel, which would hide the link before the second click landed. A double
   click keeps the tab, Alt opens a new panel, Ctrl or Cmd opens in the background, Enter opens a kept tab.

     PMW.fileRef({ path, line, col, label, view }, o) -> <button class="pmw-fileref">
       o: { api (the tab's api: its panel is the source), source (a panel id), inline (24 px instead of 32 px),
            short (the file name, not the whole path), icon (false: no file mark), cls }
       view: the editor's view for the open ('diff'), carried in its state; the D7 preview and keep rules still hold
     PM_HOME.fileExists(path) -> true when the project's file index (the editor's PMW.fileIndex) lists the path */

var FILEREF_DBL_MS = 240;

function fileRefSpec(ref, mode, mods, o) {
  var spec = { kind: 'editor', path: ref.path, mode: mode };
  if (ref.line != null) spec.line = ref.line;
  if (ref.col != null) spec.col = ref.col;
  if (ref.view) spec.view = ref.view;
  if (mods.altKey) spec.where = 'panel';
  if (mods.ctrlKey || mods.metaKey) spec.background = true;
  if (o.source) spec.source = o.source;
  return spec;
}

PMW.fileRef = function (ref, o) {
  ref = ref || {};
  o = o || {};
  var path = String(ref.path || '').trim();
  var line = ref.line != null && ref.line !== '' && isFinite(+ref.line) && +ref.line > 0 ? Math.floor(+ref.line) : null;
  var col = line != null && ref.col != null && ref.col !== '' && isFinite(+ref.col) && +ref.col > 0 ? Math.floor(+ref.col) : null;
  var at = line != null ? ':' + line + (col != null ? ':' + col : '') : '';
  var name = path.split('/').pop() || path;
  var label = ref.label != null && ref.label !== '' ? String(ref.label) : o.label != null && o.label !== '' ? String(o.label) : (o.short ? name : path) + at;
  var target = { path: path, line: line, col: col, view: ref.view || null };

  var b = h('button', { type: 'button', class: 'pmw-fileref' + (o.inline ? ' is-inline' : '') + (o.cls ? ' ' + o.cls : ''),
    'data-pmh': 'icon', 'data-pm-hover-label': path + at, 'data-pm-hover-detail': 'Double-click to keep it open' });
  if (o.icon !== false && !o.noIcon) b.appendChild(icon('file', { size: 13 }));
  b.appendChild(h('span', { class: 'pmw-fileref-t', text: label }));
  if (!path) b.setAttribute('aria-disabled', 'true');

  var timer = 0;
  function open(mode, mods) {
    clearTimeout(timer);
    timer = 0;
    if (!path) return null;
    var spec = fileRefSpec(target, mode, mods || {}, o);
    var api = o.api;
    return api && typeof api.open === 'function' ? api.open(spec) : PM_HOME.open(spec);
  }
  b.addEventListener('mousedown', function (e) { if (e.detail > 1) e.preventDefault(); });   // no word selected by a double click
  b.addEventListener('click', function (e) {
    if (e.detail > 1) return;                                       // the second click of a double click: dblclick decides
    var mods = { altKey: e.altKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey };
    if (e.detail === 0) { open('preview', mods); return; }          // Space or a script: no second click is coming
    clearTimeout(timer);
    timer = setTimeout(function () { open('preview', mods); }, FILEREF_DBL_MS);
  });
  b.addEventListener('dblclick', function (e) { open('keep', e); });
  b.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.isComposing || e.shiftKey) return;
    e.preventDefault();
    e.stopPropagation();
    if (!e.repeat) open('keep', e);
  });
  b.fileRef = target;
  return b;
};

PM_HOME.fileExists = function (path) {
  if (typeof PMW.fileIndex !== 'function' || path == null) return false;
  var p = String(path).trim().replace(/^\.\//, '');
  if (!p) return false;
  try {
    var all = PMW.fileIndex('', 100000);
    return Array.isArray(all) && all.indexOf(p) >= 0;
  } catch (_) { return false; }
};

/* the file reference's look (stop-gap until 45-frames.css carries it; see addStopGapCss in 28-hrow.js): a file mark and
   the path in the code face, underlined, 32 px tall in a document row and 24 px inline; never a capsule (Friendly's
   page rule gives every button its 14 px radius, restated here at that weight), square in Retro and NieR's square part */
addStopGapCss('pmw-stopgap-fileref', [
  '.pmw-fileref { display: inline-flex; align-items: center; gap: 6px; height: 32px; max-width: 100%; min-width: 0; padding: 0 6px; margin: 0; border: 0; border-radius: 6px;',
  '  background: transparent; color: var(--pmw-text-2); font: inherit; font-family: var(--pm-font-code); font-size: 12px; line-height: 1; cursor: pointer; vertical-align: middle; }',
  '.pmw-fileref.is-inline { height: 24px; padding: 0 4px; border-radius: 4px; font-size: 11.5px; }',
  '.pmw-fileref-t { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-decoration: underline; text-decoration-color: var(--pmw-line-2); text-underline-offset: 3px; }',
  '.pmw-fileref .pmw-ico { flex: none; width: 13px; height: 13px; color: var(--pmw-text-3); }',
  '.pmw-fileref:hover { color: var(--pmw-text); background: var(--pmw-hover); }',
  '.pmw-fileref:hover .pmw-fileref-t { text-decoration-color: currentColor; }',
  '.pmw-fileref:focus-visible { outline: 2px solid var(--pmw-focus); outline-offset: -2px; }',
  '.pmw-fileref[aria-disabled="true"] { opacity: .5; cursor: default; }',
  ':where(html[data-theme^="friendly"]:not([data-o55-nier="on"][data-o55-nier-parts~="square"])) button.pmw-fileref { border-radius: 6px; }',
  ':where(html[data-theme^="friendly"]:not([data-o55-nier="on"][data-o55-nier-parts~="square"])) button.pmw-fileref.is-inline { border-radius: 4px; }',
  'html[data-theme^="retro"]:not([data-o55-nier="on"]) .pmw-fileref, html[data-o55-nier="on"][data-o55-nier-parts~="square"] .pmw-fileref { border-radius: 0; }',
  'html[data-theme^="retro"]:not([data-o55-nier="on"]) .pmw-fileref:hover { background: var(--accent-lime); color: var(--surface); }',
  'html[data-theme^="retro"]:not([data-o55-nier="on"]) .pmw-fileref:hover :is(.pmw-fileref-t, .pmw-ico) { color: var(--surface); text-decoration: none; }'
].join('\n'));
