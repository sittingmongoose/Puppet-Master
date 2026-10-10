/* sheets/panels.js: the panels family's contact sheet (tools/family_sheet.py panels). OWNER: pm7-glyphs-designer2.
 * Mock surfaces at the universal panels' real sizes: tab kind 14 px with a 12 px mark, toolbars 14-16 px in 24 px
 * buttons, the editor gutter 12 px. Context CSS that the rollout needs is written here once: the agent mark's loop and
 * a pressed toggle's lit state (.pn-on: tube in the text ink, halo at the concept band). .sh-hov forces a hover for the
 * still picture. */
(function () {
  'use strict';
  var CSS = [
    '.pmt-agent-live > svg.nx .nx-p { animation: var(--kl) 2800ms var(--nx-le) infinite; animation-delay: calc(var(--ad, 0) * 2.8ms - 2800ms); }',
    '.sh-hov > svg.nx-r-control, .sh-hov > svg.nx-r-concept { --nx-hiv: visible; --nx-hi-a: var(--nx-h-hover-i); --nx-ink: var(--text); }',
    '.sh-hov { color: var(--text-primary) !important; background: color-mix(in srgb, var(--text-primary) 8%, transparent) !important; }',
    /* a pressed toggle holds the lit state (rollout: [aria-pressed=true] on the find toggles and wrap) */
    '.pn-on { color: var(--text-primary) !important; background: color-mix(in srgb, var(--accent-primary, var(--accent-blue)) 16%, transparent) !important; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent-primary, var(--accent-blue)) 55%, transparent); }',
    '.pn-on > svg.nx-r-control { --nx-hiv: visible; --nx-hi-a: var(--nx-h-concept-i); --nx-ink: var(--text); }',
    /* tab strip */
    '.pn-strip { display: flex; gap: 2px; border-bottom: 1px solid var(--border); padding: 0 4px; overflow: hidden; }',
    '.pn-tab { all: unset; display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 6px 0 10px; color: var(--text-secondary); font-size: 12px; border-radius: var(--border-radius, 4px) var(--border-radius, 4px) 0 0; cursor: pointer; white-space: nowrap; }',
    '.pn-tab[aria-selected="true"] { color: var(--text-primary); background: var(--surface-elevated); box-shadow: inset 0 -2px 0 var(--accent-primary, var(--accent-blue)); }',
    '.pn-tab > svg.nx { color: var(--pmg-ink-concept, var(--text-secondary)); }',
    '.pn-tab .pn-mk, .pn-tab .pn-cl { display: inline-grid; place-items: center; width: 16px; height: 16px; line-height: 0; }',
    '.pn-tab .pn-cl { color: var(--text-muted); } .pn-tab i { font-style: italic; }',
    /* toolbars */
    '.pn-bar { display: inline-flex; align-items: center; gap: 2px; padding: 3px; background: var(--surface-elevated); border: 1px solid var(--border); border-radius: var(--border-radius, 4px); }',
    '.pn-ib { all: unset; width: 24px; height: 24px; display: inline-grid; place-items: center; color: var(--text-secondary); border-radius: var(--border-radius, 4px); cursor: pointer; }',
    '.pn-sep { width: 1px; height: 16px; background: var(--border); margin: 0 4px; }',
    '.pn-q { width: 110px; color: var(--text-primary); font: 12px var(--mono-font, monospace); padding-left: 6px; } .pn-n { color: var(--text-muted); font-size: 11px; margin-right: 4px; }',
    '.pn-url { flex: 1; min-width: 120px; color: var(--text-muted); font-size: 11.5px; padding: 0 8px; }',
    /* editor gutter */
    '.pn-ed { background: var(--surface-alt, var(--background)); border: 1px solid var(--border); border-radius: var(--border-radius, 4px); padding: 4px 0; font: 12px/18px var(--mono-font, ui-monospace, Menlo, monospace); }',
    '.pn-line { display: flex; align-items: center; height: 18px; } .pn-gut { flex: 0 0 20px; display: flex; justify-content: center; line-height: 0; }',
    '.pn-no { flex: 0 0 22px; color: var(--text-muted); text-align: right; padding-right: 8px; } .pn-code { color: var(--text-primary); white-space: pre; } .pn-dim { color: var(--text-muted); }',
    '.pn-cur { background: color-mix(in srgb, var(--warning, #c90) 14%, transparent); }',
    /* list rows (Source Control, Docker, Actions) */
    '.pn-rows { display: grid; } .pn-r { display: flex; align-items: center; gap: 8px; height: 26px; padding: 0 8px; font-size: 12px; color: var(--text-primary); }',
    '.pn-r > svg.nx { color: var(--pmg-ink-concept, var(--text-secondary)); } .pn-r .pn-meta { margin-left: auto; color: var(--text-muted); font-size: 11px; display: inline-flex; gap: 2px; }',
    '.pn-head { display: flex; align-items: center; gap: 2px; height: 28px; padding: 0 4px 0 10px; font-size: 10.5px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--text-secondary); border-bottom: 1px solid var(--border); }',
    '.pn-head > span:first-child { margin-right: auto; }',
    /* motion row: every new glyph at 20 px in a real button, for the film (hover plays the act once) */
    '.pn-mo { display: flex; flex-wrap: wrap; gap: 4px; } .pn-mo .pn-ib { width: 34px; height: 34px; }'
  ].join('\n');
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  window.PMG_SHEET.render(function (S) {
    var tone = function (t) { return 'nx-r-status nx-t-' + t; };
    var ib = function (n, z, extra, title) { return '<button class="pn-ib' + (extra ? ' ' + extra : '') + '" title="' + (title || n) + '"' + (/pn-on/.test(extra || '') ? ' aria-pressed="true"' : '') + '>' + S.icon(n, z || 14) + '</button>'; };
    var kind = function (n) { return S.icon(n, 14, 'nx-r-concept'); };
    var tab = function (k, label, mark, close, sel, hov) {
      return '<button class="pn-tab' + (hov ? ' sh-hov' : '') + '"' + (sel ? ' aria-selected="true"' : '') + '>' + kind(k) + '<span>' + label + '</span>' +
        (mark ? '<span class="pn-mk">' + mark + '</span>' : '') + '<span class="pn-cl">' + (close || S.icon('close', 12)) + '</span></button>';
    };
    var line = function (bp, no, code, cur) { return '<div class="pn-line' + (cur ? ' pn-cur' : '') + '"><span class="pn-gut">' + (bp || '') + '</span><span class="pn-no">' + no + '</span><span class="pn-code">' + code + '</span></div>'; };
    var row = function (n, label, meta, cls) { return '<div class="pn-r">' + S.icon(n, 14, cls || 'nx-r-concept') + '<span>' + label + '</span>' + (meta ? '<span class="pn-meta">' + meta + '</span>' : '') + '</div>'; };
    return '' +
      '<section class="sh-sec"><h3>Tab strip: kind 14 px, one 12 px mark, dirty in the close slot</h3><div class="pn-strip">' +
        tab('code', 'main.rs', '', S.icon('change-modified', 12, 'nx-r-status nx-still'), true) +
        tab('terminal', 'cargo test', '<span class="pmt-agent-live" style="line-height:0">' + S.icon('agent-driving', 12, tone('working')) + '</span>') +
        tab('terminal', 'zsh', S.status('waiting', 12)) +
        tab('globe', 'localhost:5173', S.status('working', 12)) +
      '</div><div class="pn-strip">' +
        tab('output', 'Output', S.icon('st-info', 12, tone('idle'))) +
        tab('warning', 'Problems', S.status('failed', 12)) +
        tab('page', '<i>README.md</i>', '') +
        tab('widget', 'Usage board', '', '', false, true) +
      '</div></section>' +

      '<section class="sh-sec"><h3>Debugging: gutter 12 px, toolbar 16 px</h3><div class="sh-row">' +
        '<span class="pn-bar">' + ib('step', 16, '', 'continue') + ib('step-over', 16) + ib('step-into', 16, 'sh-hov') + ib('step-out', 16) + '<span class="pn-sep"></span>' + ib('stop', 16) + '</span>' +
      '</div><div class="pn-ed">' +
        line(S.icon('bp-line', 12, tone('blocked')), 41, 'let cfg = load(&path)?;') +
        line(S.icon('bp-cond', 12, tone('blocked')), 42, 'for job in cfg.jobs {  <span class="pn-dim">job.id == 7</span>', true) +
        line(S.icon('bp-log', 12, tone('blocked')), 43, '    run(job).await?;  <span class="pn-dim">log: "ran {job.id}"</span>') +
        line(S.icon('bp-line', 12, tone('paused')), 44, '}  <span class="pn-dim">disabled</span>') +
        line(S.icon('bp-line', 12, tone('idle')), 45, 'Ok(())  <span class="pn-dim">unverified</span>') +
      '</div><div class="sh-card">' +
        S.sizes('bp-line', 'bp-line', tone('blocked')) + S.sizes('bp-cond', 'bp-cond', tone('blocked')) + S.sizes('bp-log', 'bp-log', tone('blocked')) +
        S.sizes('step-over', 'step-over') + S.sizes('step-into', 'step-into') + S.sizes('step-out', 'step-out') +
      '</div></section>' +

      '<section class="sh-sec"><h3>Find bar and editor toggles (14 px; match case pressed)</h3><div class="sh-row">' +
        '<span class="pn-bar"><span class="pn-q">jobId</span><span class="pn-n">2 of 9</span>' + ib('match-case', 14, 'pn-on') + ib('match-word', 14) + ib('use-regex', 14, 'sh-hov') + '<span class="pn-sep"></span>' + ib('arrow-up') + ib('arrow-down') + ib('close') + '</span>' +
        '<span class="pn-bar">' + ib('wrap', 14, 'pn-on') + '</span>' +
      '</div><div class="sh-card">' +
        S.sizes('match-case', 'match-case') + S.sizes('match-word', 'match-word') + S.sizes('use-regex', 'use-regex') + S.sizes('wrap', 'wrap') +
      '</div></section>' +

      '<section class="sh-sec"><h3>Browser toolbar: picking on the page (14 px)</h3><div class="sh-row">' +
        '<span class="pn-bar" style="flex:1">' + ib('reply', 14, '', 'back') + ib('arrow-right', 14, '', 'forward') + ib('refresh') + '<span class="pn-url">localhost:5173/settings</span>' + ib('pointer', 14, 'sh-hov') + ib('select-area') + ib('camera') + '</span>' +
      '</div><div class="sh-card">' +
        S.sizes('pointer', 'pointer') + S.sizes('select-area', 'select-area') +
        '<div class="sh-row sh-note">beside the chat\'s expand, which select-area must never read as: ' + S.icon('expand', 14) + ' expand ' + S.icon('select-area', 14) + ' select-area ' + S.icon('open', 14) + ' open ' + S.icon('pointer', 14) + ' pointer</div>' +
      '</div></section>' +

      '<section class="sh-sec"><h3>Panels and layout</h3><div class="sh-row">' +
        '<span class="pn-bar">' + ib('split-right') + ib('split-down', 14, 'sh-hov') + ib('layout') + ib('workgroup-new') + '<span class="pn-sep"></span>' + ib('more') + ib('close') + '</span>' +
      '</div><div class="sh-card">' +
        S.sizes('panel', 'panel', 'nx-r-concept') + S.sizes('layout', 'layout') + S.sizes('split-right', 'split-right') + S.sizes('split-down', 'split-down') +
        S.sizes('widget', 'widget', 'nx-r-concept') + S.sizes('workgroup-new', 'workgroup-new') +
      '</div></section>' +

      '<section class="sh-sec"><h3>Explorer, Source Control, Docker, Actions (14 px rows)</h3><div class="sh-card" style="padding:0;overflow:hidden">' +
        '<div class="pn-head"><span>Explorer</span>' + ib('file-plus') + ib('folder-plus', 14, 'sh-hov') + ib('refresh') + '</div>' +
        '<div class="pn-head"><span>Source control</span>' + ib('diff') + ib('stash') + ib('merge') + '</div>' +
        '<div class="pn-rows">' +
          row('pull-request', '#482 Retro phosphor on PMH targets', 'open') +
          row('output', 'Output · cargo', '312 lines') +
          row('container', 'api-server', 'running') +
          row('compose', 'stack: api, db, cache', '3 services') +
          row('pipeline', 'CI · build and test', ib('step', 14, '', 'run')) +
        '</div></div><div class="sh-card">' +
        S.sizes('file-plus', 'file-plus') + S.sizes('folder-plus', 'folder-plus') + S.sizes('diff', 'diff') + S.sizes('merge', 'merge') +
        S.sizes('pull-request', 'pull-request', 'nx-r-concept') + S.sizes('stash', 'stash') + S.sizes('output', 'output', 'nx-r-concept') +
        S.sizes('container', 'container', 'nx-r-concept') + S.sizes('compose', 'compose', 'nx-r-concept') + S.sizes('pipeline', 'pipeline', 'nx-r-concept') +
      '</div></section>' +

      '<section class="sh-sec"><h3>Motion: every new glyph at 20 px in a button (hover plays its act once)</h3><div class="pn-mo">' +
        ["bp-line", "bp-cond", "bp-log", "step-over", "step-into", "step-out", "diff", "merge", "pull-request", "stash", "panel", "layout", "split-right", "split-down", "widget", "workgroup-new", "pointer", "select-area", "wrap", "match-case", "match-word", "use-regex", "file-plus", "folder-plus", "output", "container", "compose", "pipeline"].map(function (n) { return ib(n, 20); }).join('') +
      '</div></section>';
  });
})();
