/* Fallback registrations: at boot, any kind no file registered gets a plain body, so a layout that names it still
   renders (and the "+" menu keeps its full order). The real kinds (the other files here, and src/terminal for the
   terminal) register first and win. Order and labels of the "+" rows are CONTRACT section 7's. */

var h = function (tag, attrs, kids) {
  var el = document.createElement(tag);
  for (var k in (attrs || {})) { if (attrs[k] != null) { if (k === 'text') el.textContent = attrs[k]; else if (k === 'class') el.className = attrs[k]; else el.setAttribute(k, attrs[k]); } }
  (kids || []).forEach(function (c) { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
  return el;
};
var FALLBACK = {
  editor: { label: 'File...', group: 'Files', icon: 'file', prefixes: ['file:', 'buffer:'], min: { w: 280, h: 120 }, plus: { order: 30, shortcut: 'Ctrl+P', label: 'File...' } },
  terminal: { label: 'Terminal', group: 'Terminals', icon: 'terminal', prefixes: ['terminal:'], min: { w: 320, h: 120 }, dedicated: true, plus: { order: 10, shortcut: 'Ctrl+Shift+`' } },
  browser: { label: 'Browser', group: 'Browsers', icon: 'browser', prefixes: ['browser:', 'link:'], min: { w: 360, h: 120 }, dedicated: true, plus: { order: 20, shortcut: 'Ctrl+Shift+B' } },
  dashboard: { label: 'Dashboard', group: 'Dashboards', icon: 'dashboard', prefixes: ['dashboard:'], min: { w: 320, h: 120 }, dedicated: true, plus: { order: 40 } },
  plan: { label: 'Plan', group: 'Plans and documents', icon: 'plan', prefixes: ['plan:', 'plan-query', 'deep-discovery:'], plus: { order: 50, label: 'Plan or document...' } },
  document: { label: 'Document', group: 'Plans and documents', icon: 'document', prefixes: ['teach:', 'memory:', 'revert:', 'debug:', 'lens-source:', 'lens-effective:', 'wonderer:', 'wonder-source:', 'doc:'] },
  artifact: { label: 'Artifact', group: 'Artifacts', icon: 'artifact', prefixes: ['artifact:'], plus: { order: 60, label: 'Artifact...' } },
  run: { label: 'Run', group: 'Runs', icon: 'run', prefixes: ['collab-run:', 'crew-work:', 'review:', 'room:', 'brainstorm:', 'review-evidence:', 'brainstorm-evidence:'], min: { w: 360, h: 120 } },
  transcript: { label: 'Agent transcript', group: 'Agents', icon: 'transcript', prefixes: ['thread-'] },
  context: { label: 'Context detail', group: 'Agents', icon: 'context', prefixes: ['context:'] },
  record: { label: 'Record', group: 'Records', icon: 'record', prefixes: ['search:', 'mcp:', 'app:', 'work-record:'] },
  output: { label: 'Output', group: 'Tools', icon: 'output', prefixes: ['output:'], plus: { order: 70, group: 'tools' } },
  problems: { label: 'Problems', group: 'Tools', icon: 'problems', prefixes: [], plus: { order: 71, group: 'tools' } },
  ports: { label: 'Ports', group: 'Tools', icon: 'ports', prefixes: [], plus: { order: 72, group: 'tools' } },
  'debug-console': { label: 'Debug Console', group: 'Tools', icon: 'console', prefixes: ['debug-console:'], plus: { order: 73, group: 'tools' } }
};
PMW.FALLBACK_KINDS = FALLBACK;
/* one tab per terminal session: an open naming a session reveals its tab; without one a new session id is minted */
var termSeq = 0;
FALLBACK.terminal.idFor = function (spec) {
  if (spec && spec.session != null && spec.session !== '') return 'terminal:' + spec.session;
  termSeq += 1;
  return 'terminal:s' + Date.now().toString(36) + termSeq;
};

PMW.bus.on('boot:kinds', function () {
  var have = PM_HOME.kinds();
  Object.keys(FALLBACK).forEach(function (id) {
    if (have.indexOf(id) >= 0) return;
    var f = FALLBACK[id];
    var def = Object.assign({}, f, {
      fallback: true,
      mount: function (host, st, api) {
        var title = (st && (st.path || st.title || st.url || st.plan || st.board)) || f.label;
        host.appendChild(h('div', { class: 'pmw-fallback' }, [
          h('p', { class: 'pmw-fallback-k', text: f.label }),
          h('p', { class: 'pmw-fallback-t', text: String(title) })
        ]));
        return {};
      }
    });
    if (f.plus) def.plus = Object.assign({ spec: function (sub) { return { kind: id }; } }, f.plus);
    PM_HOME.registerKind(id, def);
  });
});
