/* Testing (lane F), and the run rows Testing and Agents share.

   A run row (.sh-run) reads like every other D row: [chevron][status glyph] name on line one, the status word and the
   facts on line two, the details when it opens. The shell draws a coloured dot in front of the name AND a status chip
   after it; D shows one glyph per row instead, in the glyph column (.lf-lead): the chip's state when the row has one,
   else the dot's. The chip keeps its element and its word, moves to the head of the facts line ("Flaky 2/2 · passed on
   retry 2/2 · ..."), and loses its own glyph there. Names wrap at their natural breaks ("::" and "_" get a zero-width
   break opportunity) instead of being cut.
   Every change goes through remember() / addClass() / setAttr() / inject() / setOwnText(), so switching to "Current"
   leaves the panel byte-identical. Top-level names carry the LF_ prefix: every D script shares one scope. */

const LF_RUN = (() => {
  /* the run states this panel family adds to the glyph set: errored is a harness failure, not a failed assertion, so it
     keeps the failure shape in its own colour (the shell's distinct orange) */
  const SHAPE = { errored: 'fail' };

  /* a dot painted by the shell (class or inline colour) -> the state of its run */
  function dotState(dot) {
    if (!dot) return 'info';
    const c = dot.classList, s = dot.getAttribute('style') || '';
    if (c.contains('dot-run')) return 'run';
    if (c.contains('dot-err')) return 'fail';
    if (c.contains('dot-warn')) return 'warn';
    if (c.contains('dot-ok')) return 'ok';
    if (c.contains('dot-idle')) return 'idle';
    if (/--graph-running/.test(s)) return 'run';
    if (/--graph-failed|--accent-error/.test(s)) return 'fail';
    if (/--accent-orange/.test(s)) return 'errored';
    if (/--accent-warning/.test(s)) return 'warn';
    if (/--graph-pending/.test(s)) return 'pending';
    if (/--graph-passed|--accent-lime|--accent-green/.test(s)) return 'ok';
    if (/--text-muted|--text-secondary/.test(s)) return 'idle';
    return 'info';
  }
  /* a chip's word -> its state; the shared table (applyChips) already tagged it, these words read better as runs */
  function chipState(chip) {
    const w = (chip.textContent || '').trim().toLowerCase();
    if (/^running\b/.test(w)) return 'run';
    if (/^errored\b/.test(w)) return 'errored';
    if (/^(cancel|superseded)/.test(w)) return 'idle';
    if (/^(complete|completed|finished)\b/.test(w)) return 'ok';
    if (/^queued\b/.test(w)) return 'pending';
    return chip.getAttribute('data-d-st') || 'info';
  }

  function popGlyph(gl) {
    if (reduced()) return;
    const retro = fam() === 'retro';
    gl.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.3)', opacity: 1, offset: .55 }, { transform: 'none', opacity: 1 }],
      { duration: retro ? 240 : 420, easing: retro ? 'steps(4, end)' : 'cubic-bezier(.3, 1.4, .5, 1)' });
  }
  /* the row's one glyph, in front of the name; it is the skin's own node, so it goes with the skin */
  function lead(head, st, animate) {
    const shape = SHAPE[st] || st;
    let gl = head.querySelector(':scope > .lf-lead');
    if (!gl) {
      gl = glyph(shape, st === 'run');
      gl.classList.add('lf-lead');
      gl.setAttribute('data-d-st', st);
      inject(head, gl, head.querySelector(':scope > .sh-dot') || head.querySelector(':scope > .sh-main'));
      return;
    }
    if (gl.getAttribute('data-d-st') === st) return;
    gl.setAttribute('data-d-st', st);
    gl.setAttribute('data-gl', shape);
    gl.innerHTML = svgFor(shape);
    if (st === 'run') gl.setAttribute('data-pulse', ''); else gl.removeAttribute('data-pulse');
    if (animate) popGlyph(gl);
  }
  /* move a node to a new parent and remember where it lived */
  function moveTo(node, parent, before) {
    const home = node.parentNode, next = node.nextSibling;
    parent.insertBefore(node, before || null);
    remember(() => { if (home) home.insertBefore(node, next && next.parentNode === home ? next : null); });
  }
  /* code-like names break after "::" and "_" rather than inside a word */
  function breaks(el) {
    const t = ownText(el);
    if (!t || t.indexOf('\u200B') >= 0 || !/::|_/.test(t)) return;
    setOwnText(el, t.replace(/::(?=\S)/g, '::\u200B').replace(/_(?=\S)/g, '_\u200B'));
  }

  function rows(panel, animate) {
    panel.querySelectorAll('.sh-run').forEach(run => {
      const head = run.querySelector(':scope > .sh-run-h');
      if (!head) return;
      addClass(head, 'pmr-cur');
      const main = head.querySelector(':scope > .sh-main');
      const name = main && main.querySelector(':scope > .sh-name');
      const meta = main && main.querySelector(':scope > .sh-runmeta, :scope > .sh-meta');
      const txt = name && name.querySelector(':scope > .sh-nm-txt');
      if (txt && name.classList.contains('sh-mono')) breaks(txt);
      const chip = (meta && meta.querySelector(':scope > .lf-state')) || (name && name.querySelector(':scope > .pm-chip'));
      if (chip && meta && chip.parentNode !== meta) {
        addClass(chip, 'lf-state');
        moveTo(chip, meta, meta.firstChild);
      }
      const st = chip ? chipState(chip) : dotState(head.querySelector(':scope > .sh-dot'));
      if (chip && chip.getAttribute('data-d-st') !== st) setAttr(chip, 'data-d-st', st);
      lead(head, st, animate);
      /* Agents: the waiting / elapsed line belongs to the head, so it hovers and opens with the row */
      const time = run.querySelector(':scope > .sh-agtime');
      if (time && main) moveTo(time, main, null);
    });
  }

  /* shelf summaries in sentence case ("Redacted"); the shared pass already does the state words */
  function heads(panel) {
    panel.querySelectorAll('.sh-shelf > .sh-head > .sh-hcount').forEach(el => {
      const t = ownText(el);
      if (t && /^[a-z]/.test(t)) setOwnText(el, capFirst(t));
    });
  }

  /* abbreviations and ASCII arrows inside longer text, in these two panels only */
  const PH = [[/\b(\d+(?:\.\d+)?k) tok\b/g, '$1 tokens'], [/ -> /g, ' \u2192 ']];
  function phrases(panel) {
    const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
    const hits = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (PH.some(([rx]) => { rx.lastIndex = 0; return rx.test(n.nodeValue); })) hits.push(n);
    }
    hits.forEach(n => {
      const orig = n.nodeValue;
      let v = orig;
      PH.forEach(([rx, rep]) => { rx.lastIndex = 0; v = v.replace(rx, rep); });
      if (v === orig) return;
      n.nodeValue = v;
      remember(() => { n.nodeValue = orig; });
    });
  }

  /* the panel came in: its shelves and rows deal in behind the header (the shared entrance only knows tabbed panes) */
  function enter(panel, info) {
    if (!info || (info.reason !== 'switch' && info.reason !== 'concept')) return;
    const sc = panel.querySelector(':scope > .sh-scroll');
    if (!sc) return;
    deal(dealList(sc), { delay: Math.round(spec().step * 1.5) });
  }

  /* leaving D: once the undo has put every chip back beside its name, the shell measures its chips again (PMPillFit),
     so a chip that had room in D's facts line is abbreviated again where Current needs it */
  function refit(panel) {
    requestAnimationFrame(() => { if (panel.offsetWidth && typeof window.PMPillFit === 'function') window.PMPillFit(panel); });
  }

  return {
    apply(panel, animate) { rows(panel, animate); heads(panel); phrases(panel); },
    enter,
    refit,
  };
})();

/* "Passed / Failed / Skip  214 / 0 / 3" reads as one fact in words: "Results  214 passed · 0 failed · 3 skipped" */
function lfResults(panel) {
  panel.querySelectorAll('.sh-kv > .sh-k').forEach(k => {
    if (ownText(k) !== 'Passed / Failed / Skip') return;
    const v = k.parentNode.querySelector(':scope > .sh-v'), m = v && /^(\d+) \/ (\d+) \/ (\d+)$/.exec(ownText(v));
    if (!m) return;
    setOwnText(k, 'Results');
    setOwnText(v, m[1] + ' passed · ' + m[2] + ' failed · ' + m[3] + ' skipped');
  });
}

/* the header's status line: "Live · 214 passing", glyph + words, never only the light */
function lfTestingBanner(panel) {
  const st = panel.querySelector(':scope > .sh-banner > .sh-bstatus');
  if (!st) return;
  const word = st.querySelector(':scope > .sh-btext');
  if (word) {
    addClass(word, 'd-show');
    const t = ownText(word);
    if (t && /^[a-z]/.test(t)) setOwnText(word, capFirst(t));
  }
  const extra = st.querySelector(':scope > .sh-bextra');
  if (extra) {
    addClass(extra, 'lf-show');
    const t = ownText(extra);
    if (/ pass$/.test(t)) setOwnText(extra, t.replace(/ pass$/, ' passing'));
  }
}

panelHook('panel-testing', {
  apply(panel, animate) {
    LF_RUN.apply(panel, animate);
    lfTestingBanner(panel);
    lfResults(panel);
  },
  show(panel, info) { LF_RUN.enter(panel, info); },
  unmount(panel) { LF_RUN.refit(panel); },
});
