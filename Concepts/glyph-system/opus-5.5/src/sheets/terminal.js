/* sheets/terminal.js: the terminal family's contact sheet (tools/family_sheet.py terminal). OWNER: pm7-glyphs-designer2.
 * Mock surfaces at PMConcept7's real sizes (tab 14 px, gutter 12 px in a 20 px column, agent row 14 px, find 14 px).
 * The context CSS here is the rollout CSS the terminal and panels need, written once: the agent mark's loop, the gutter's
 * seat beside the state mark, a forced hover for the still picture (.sh-hov, the generic ignite's properties). */
(function () {
  'use strict';
  var CSS = [
    /* the agent-driving loop: a burst of typing every 2.8 s (the reviewing slot, below needs-you) */
    '.pmt-agent-live > svg.nx .nx-p { animation: var(--kl) 2800ms var(--nx-le) infinite; animation-delay: calc(var(--ad, 0) * 2.8ms - 2800ms); }',
    /* forced hover for a still picture: the generic ignite's custom properties (neon-icons.css section 8) */
    '.sh-hov > svg.nx-r-control, .sh-hov > svg.nx-r-concept { --nx-hiv: visible; --nx-hi-a: var(--nx-h-hover-i); --nx-ink: var(--text); }',
    '.sh-hov { color: var(--text-primary) !important; background: color-mix(in srgb, var(--text-primary) 8%, transparent) !important; }',
    /* tab strip */
    '.tm-strip { display: flex; gap: 2px; border-bottom: 1px solid var(--border); padding: 0 4px; overflow: hidden; }',
    '.tm-tab { all: unset; display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 10px; color: var(--text-secondary); font-size: 12px; border-radius: var(--border-radius, 4px) var(--border-radius, 4px) 0 0; cursor: pointer; white-space: nowrap; }',
    '.tm-tab[aria-selected="true"] { color: var(--text-primary); background: var(--surface-elevated); box-shadow: inset 0 -2px 0 var(--accent-primary, var(--accent-blue)); }',
    '.tm-tab .tm-exit { color: var(--danger); font-size: 11px; font-variant-numeric: tabular-nums; }',
    '.tm-tab > svg[data-nx="agent-driving"], .tm-tab > svg[data-nx="agent-cursor"] { margin-left: 2px; }',
    /* terminal screen with the command-mark gutter */
    '.tm-screen { background: var(--surface-alt, var(--background)); border: 1px solid var(--border); border-radius: var(--border-radius, 4px); padding: 4px 0; font: 12px/18px var(--mono-font, ui-monospace, Menlo, monospace); }',
    '.tm-line { display: flex; align-items: center; height: 18px; }',
    '.tm-gut { position: relative; flex: 0 0 20px; height: 18px; display: flex; align-items: center; justify-content: center; }',
    '.tm-gut > .tm-seat { position: absolute; left: 0; top: 5px; line-height: 0; color: var(--text-secondary); }',
    '.tm-txt { color: var(--text-primary); white-space: pre; } .tm-dim { color: var(--text-muted); }',
    '.tm-ph { width: 8px; height: 8px; border: 1px dashed var(--text-muted); border-radius: 50%; }',
    /* agent rows */
    '.tm-agent { display: flex; align-items: center; gap: 8px; height: 30px; padding: 0 10px; border-bottom: 1px solid var(--border); background: var(--surface-elevated); font-size: 12px; }',
    '.tm-agent b { font-weight: 600; } .tm-agent .tm-acts { margin-left: auto; display: flex; gap: 12px; color: var(--text-secondary); font-size: 11.5px; }',
    /* find bar and header row */
    '.tm-find { display: inline-flex; align-items: center; gap: 4px; padding: 3px 4px 3px 8px; background: var(--surface-elevated); border: 1px solid var(--border); border-radius: var(--border-radius, 4px); }',
    '.tm-find .tm-q { width: 120px; color: var(--text-primary); font: 12px var(--mono-font, monospace); } .tm-find .tm-n { color: var(--text-muted); font-size: 11px; margin-right: 4px; }',
    '.tm-ib { all: unset; width: 24px; height: 24px; display: inline-grid; place-items: center; color: var(--text-secondary); border-radius: var(--border-radius, 4px); cursor: pointer; }',
    '.tm-head { display: flex; align-items: center; gap: 14px; color: var(--text-secondary); font-size: 11.5px; }',
    '.tm-head span { display: inline-flex; align-items: center; gap: 5px; } .tm-head .tm-run { color: var(--text-primary); } .tm-head .tm-el { color: var(--text-muted); font-variant-numeric: tabular-nums; }',
    '.tm-head svg.nx { color: var(--text-secondary); }'
  ].join('\n');
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  window.PMG_SHEET.render(function (S) {
    var tone = function (t) { return 'nx-r-status nx-t-' + t; };
    var line = function (mark, txt, seat) {
      return '<div class="tm-line"><span class="tm-gut">' + (seat ? '<span class="tm-seat">' + S.icon('agent-seat', 8) + '</span>' : '') + mark + '</span><span class="tm-txt">' + txt + '</span></div>';
    };
    var tab = function (icon, label, extra, sel, hov) {
      return '<button class="tm-tab' + (hov ? ' sh-hov' : '') + '"' + (sel ? ' aria-selected="true"' : '') + '>' + icon + '<span>' + label + '</span>' + (extra || '') + '</button>';
    };
    var term = S.icon('terminal', 14, 'nx-r-concept');
    return '' +
      '<section class="sh-sec"><h3>New: the agent\'s cursor</h3><div class="sh-card">' +
        S.sizes('agent-driving', 'agent-driving', tone('working'), null, 'pmt-agent-live') +
        S.sizes('agent-cursor', 'agent-cursor', 'nx-t-paused') +
        S.sizes('agent-seat', 'agent-seat', '', [8, 10, 12]) +
      '</div></section>' +
      '<section class="sh-sec"><h3>Tab strip (14 px kind, 12 px agent mark)</h3><div class="tm-strip">' +
        tab(term, 'zsh · api', '', true) +
        tab(term, 'cargo test · core', S.icon('agent-driving', 12, tone('working')), false) +
        tab(term, 'zsh · web', S.icon('agent-cursor', 12, 'nx-t-paused'), false) +
        tab(term, 'npm test · web', '<span class="tm-exit">exit 1</span>', false) +
        tab(term, 'zsh · docs', '', false, true) +
      '</div></section>' +
      '<section class="sh-sec"><h3>Command marks (12 px in the 20 px gutter)</h3><div class="tm-screen">' +
        line(S.status('complete', 12, 'nx-still'), '<span class="tm-dim">$</span> cargo build --release') +
        line(S.status('complete', 12, 'nx-still'), '<span class="tm-dim">$</span> git push origin main   <span class="tm-dim">typed by Codex</span>', true) +
        line('<span class="tm-ph" title="failed: its shape is card GLY-1"></span>', '<span class="tm-dim">$</span> npm test   <span class="tm-dim">exit 1 (failed mark: card GLY-1)</span>') +
        line(S.status('skipped', 12), '<span class="tm-dim">$</span> sleep 600   <span class="tm-dim">interrupted</span>') +
        line(S.status('skipped', 12), '<span class="tm-dim">$</span> make watch   <span class="tm-dim">ended with the earlier session</span>') +
        line(S.status('working', 12), '<span class="tm-dim">$</span> cargo test --workspace   <span class="tm-dim">running</span>', true) +
        line(S.status('idle', 12), '<span class="tm-dim">$</span> <span class="tm-dim">▏</span>') +
      '</div></section>' +
      '<section class="sh-sec"><h3>Agent row (14 px)</h3><div class="sh-card" style="padding:0;overflow:hidden">' +
        '<div class="tm-agent"><span class="pmt-agent-live" style="line-height:0">' + S.icon('agent-driving', 14, tone('working')) + '</span><span><b>Codex</b> is driving this terminal · step 2 of 5</span><span class="tm-acts"><span>Take over</span><span>Interrupt</span><span>Stop</span></span></div>' +
        '<div class="tm-agent">' + S.icon('agent-cursor', 14, 'nx-t-paused') + '<span>You took over. <b>Codex</b> is paused and has been told.</span><span class="tm-acts"><span>Hand back</span></span></div>' +
        '<div class="tm-agent">' + S.status('waiting', 14) + '<span><b>Codex</b> wants to type in this terminal</span><span class="tm-acts"><span>Allow once</span><span>Deny</span></span></div>' +
        '<div class="tm-agent" style="border-bottom:0">' + S.icon('key', 14, 'nx-r-concept') + '<span>Password needed. Only you can answer this prompt.</span></div>' +
      '</div></section>' +
      '<section class="sh-sec"><h3>Find bar and header facts (14 px)</h3><div class="sh-row">' +
        '<span class="tm-find"><span class="tm-q">error</span><span class="tm-n">3 of 12</span>' +
          '<button class="tm-ib">' + S.icon('arrow-up', 14) + '</button><button class="tm-ib sh-hov">' + S.icon('arrow-down', 14) + '</button><button class="tm-ib">' + S.icon('close', 14) + '</button></span>' +
      '</div><div class="tm-head"><span>' + S.icon('folder', 14, 'nx-r-concept') + '~/src/api</span><span>' + S.icon('branch', 14, 'nx-r-concept') + 'main</span><span>' + S.icon('clock', 14, 'nx-r-concept') + '<span class="tm-run">cargo test --workspace</span><span class="tm-el">1:42</span></span></div>' +
      '</section>';
  });
})();
