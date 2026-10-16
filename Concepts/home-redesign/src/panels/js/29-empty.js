/* The empty panel (D6): a panel survives empty only when it is the last one or locked; it then shows the "+" menu's
   rows as a launcher: full-width list rows (no tiles, no pills), then Recent, then a dim hint. A row's inline choices
   (the Terminal row's installed shells, D39) sit under it as in the menu, and a group row (SSH hosts) opens its
   submenu from the row. Narrow panels show only the kind rows; very short ones a single line. The whole body is a drop
   target (the tab drag treats it as a merge). */

var EMPTY_LEVEL = { label: 'the empty panel' };
PMW.renderEmpty = function (panelEl, p) {
  var body = panelEl.querySelector('.pmw-body');
  var el = body.querySelector('.pmw-empty');
  if (p.tabs.length) { if (el) dropEmpty(el); return; }
  if (el && el._pmwFor === p.id && el._pmwKinds === Object.keys(KINDS).join(',')) return;
  if (el) dropEmpty(el);
  el = h('div', { class: 'pmw-empty', role: 'group', 'aria-label': 'Empty panel' });
  el._pmwFor = p.id;
  el._pmwKinds = Object.keys(KINDS).join(',');
  var col = h('div', { class: 'pmw-empty-col' });
  col.appendChild(h('p', { class: 'pmw-empty-title', text: 'Open something here' }));
  var list = h('div', { class: 'pmw-empty-list', role: 'list' });
  PMW.plusRows(p.id, {}).forEach(function (r) {
    var links = r.links && r.links.length ? r.links : null;
    var row = h('div', { class: 'pmw-empty-row', role: links ? null : 'listitem', 'data-pmh': 'row' });
    var trail = r.submenu ? h('span', { class: 'pmw-empty-chev', 'aria-hidden': 'true' }, [icon('chevronRight', { size: 14 })])
      : r.right ? h('span', { class: 'pmw-empty-key', text: PMW.keyLabel(r.right) }) : null;
    var b = h('button', { type: 'button', class: 'pmw-empty-btn pmw-cur' }, [kindIcon(r.kind || 'file'), h('b', { text: r.label }), trail]);
    if (r.submenu) b.setAttribute('aria-haspopup', 'menu');
    // the row button is the anchor of a picker the row opens (Plan or document..., Artifact...; the Output, Problems,
    // Ports, Debug Console row opens its own list there), never the centre; this list is that picker's level before, so
    // its Back control (and Escape, Backspace) closes it onto this row
    b.addEventListener('click', function (e) {
      PMW.menu.from(EMPTY_LEVEL, function () {
        if (r.submenu) { PMW.menu.open(b, typeof r.submenu === 'function' ? r.submenu() : r.submenu); return; }
        r.run({ alt: e.altKey, row: r, anchor: b });
      });
    });
    row.appendChild(b);
    if (r.alt) {
      var c = h('button', { type: 'button', class: 'pmw-empty-cell', 'aria-label': 'Open in new panel: ' + r.label, 'data-pm-hover-label': 'Open in new panel' }, [icon('newPanel', { size: 14 })]);
      c.addEventListener('click', function () { PMW.menu.from(EMPTY_LEVEL, function () { r.alt.run({ row: r, anchor: c }); }); });
      row.appendChild(c);
    }
    if (!links) { list.appendChild(row); return; }
    // the menu's own link row (30-menu.css), so the two read alike; Alt+click opens a new panel
    var lr = h('div', { class: 'pmw-mlinks pmw-empty-links' });
    links.forEach(function (lk, i) {
      var a = h('button', { type: 'button', class: 'pmw-mlink pmw-cur', text: lk.label, 'data-pm-hover-label': lk.title || lk.label,
        'data-pm-hover-detail': 'Opens here; Alt+click opens a new panel' });
      a.addEventListener('click', function (e) { lk.run({ alt: e.altKey }); });
      if (i) lr.appendChild(h('span', { class: 'pmw-mlinkpair' }, [h('span', { class: 'pmw-mlinksep', 'aria-hidden': 'true', text: '·' }), a]));
      else lr.appendChild(a);
    });
    list.appendChild(h('div', { class: 'pmw-empty-group', role: 'listitem' }, [row, lr]));
  });
  col.appendChild(list);
  var recent = PMW.recent.list().slice(0, 5);
  if (recent.length) {
    col.appendChild(h('p', { class: 'pmw-empty-sec', text: 'Recent' }));
    var rl = h('div', { class: 'pmw-empty-list pmw-empty-recent', role: 'list' });
    recent.forEach(function (path) {
      var b = h('button', { type: 'button', class: 'pmw-empty-btn pmw-cur', role: 'listitem', 'data-pmh': 'row' }, [kindIcon('file'), h('b', { text: path.split('/').pop() }), path.indexOf('/') >= 0 ? h('span', { class: 'pmw-empty-path', text: path.slice(0, path.lastIndexOf('/')) }) : null]);
      b.addEventListener('click', function (e) { PM_HOME.open({ kind: 'editor', path: path, mode: 'keep', where: e.altKey ? 'panel' : p.id }); });
      rl.appendChild(b);
    });
    col.appendChild(rl);
  }
  col.appendChild(h('p', { class: 'pmw-empty-hint', text: 'Drop a tab here, or press ' + PMW.keyLabel(KEYS.plusMenu) + ' for more.' }));
  el.appendChild(col);
  el.appendChild(h('p', { class: 'pmw-empty-short', text: 'Empty panel. ' + PMW.keyLabel(KEYS.plusMenu) + ' opens the menu.' }));
  body.appendChild(el);
  // a wrapped row of links starts its new line with a link (36-menu.js), measured again as the panel changes size
  tidyLinkRows(el);
  if (typeof ResizeObserver === 'function') { el._pmwRo = new ResizeObserver(function () { tidyLinkRows(el); }); el._pmwRo.observe(col); }
};
function dropEmpty(el) { if (el._pmwRo) el._pmwRo.disconnect(); el.remove(); }
