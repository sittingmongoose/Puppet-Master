/* The empty panel (D6): a panel survives empty only when it is the last one or locked; it then shows the "+" menu's
   rows as a launcher: full-width list rows (no tiles, no pills), then Recent, then a dim hint. Narrow panels show only
   the kind rows; very short ones a single line. The whole body is a drop target (the tab drag treats it as a merge). */

PMW.renderEmpty = function (panelEl, p) {
  var body = panelEl.querySelector('.pmw-body');
  var el = body.querySelector('.pmw-empty');
  if (p.tabs.length) { if (el) el.remove(); return; }
  if (el && el._pmwFor === p.id && el._pmwKinds === Object.keys(KINDS).join(',')) return;
  if (el) el.remove();
  el = h('div', { class: 'pmw-empty', role: 'group', 'aria-label': 'Empty panel' });
  el._pmwFor = p.id;
  el._pmwKinds = Object.keys(KINDS).join(',');
  var col = h('div', { class: 'pmw-empty-col' });
  col.appendChild(h('p', { class: 'pmw-empty-title', text: 'Open something here' }));
  var list = h('div', { class: 'pmw-empty-list', role: 'list' });
  PMW.plusRows(p.id, {}).forEach(function (r) {
    if (r.submenu) return;
    var row = h('div', { class: 'pmw-empty-row', role: 'listitem', 'data-pmh': 'row' });
    var b = h('button', { type: 'button', class: 'pmw-empty-btn pmw-cur' }, [kindIcon(r.kind || 'file'), h('b', { text: r.label }), r.right ? h('span', { class: 'pmw-empty-key', text: PMW.keyLabel(r.right) }) : null]);
    // the row button is the anchor of a picker the row opens (Plan or document..., Artifact...), never the centre
    b.addEventListener('click', function (e) { r.run({ alt: e.altKey, row: r, anchor: b }); });
    row.appendChild(b);
    if (r.alt) {
      var c = h('button', { type: 'button', class: 'pmw-empty-cell', 'aria-label': 'Open in new panel: ' + r.label, 'data-pm-hover-label': 'Open in new panel' }, [icon('newPanel', { size: 14 })]);
      c.addEventListener('click', function () { r.alt.run({ row: r, anchor: c }); });
      row.appendChild(c);
    }
    list.appendChild(row);
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
};
