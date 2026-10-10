/* Testing (lane F), and the run rows Testing and Agents share.

   A run row (.sh-run) reads like every other D row: [chevron][status glyph] name on line one, the status word and the
   facts under it, the details when it opens. The shell draws a coloured dot in front of the name AND a status chip
   after it; D shows one glyph per row instead, in the glyph column (.lf-lead): the chip's state when the row has one,
   else the dot's. The chip keeps its element and its word, moves to the head of the facts line ("Flaky 2/2 · passed on
   retry 2/2 · ..."), and loses its own glyph there. Every chip in the two panels (the head's and the one in the opened
   row's Status line) gets the same run state, so a row never says two different things.
   Text fits by layout: code words get break opportunities at their natural joints (after "::", "_" and "/", before a
   file extension), ids such as tr-2214 or art-diff-n21 never break at their hyphens (a word joiner), and the opened
   row stacks a long code value under its label at the full row width.
   Every change goes through remember() / addClass() / setAttr() / inject() / setOwnText(), or a text-node edit that
   remembers its original, so switching to "Current" leaves the panel byte-identical. Top-level names carry the LF_
   prefix: every D script shares one scope. */

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
  /* a text node's new value, remembered: undone only while the node still shows what D wrote (the shell may have
     rewritten it since, and then its own text stays) */
  function editText(n, v) {
    const orig = n.nodeValue;
    if (v === orig) return;
    n.nodeValue = v;
    remember(() => { if (n.nodeValue === v) n.nodeValue = orig; });
  }
  /* code words break at their joints, never inside a word: a zero-width break after "::", "_" and "/" in runs of 11+
     characters that look like code, and before a file extension in runs too long for a line (24+). Ids keep their
     hyphens: a word joiner after each one (tr-2214, art-tr-2199, art-diff-n21, lane-b), and after every hyphen inside a
     word of a command, a log line or a code-style run name. A shortened path keeps its ellipsis on the name it
     shortens ("\u2026QuantityStepper.svelte"), so a line never ends on a bare "\u2026" that reads as cut text. All of it is
     idempotent (the look-aheads skip a mark already there). */
  const TOKEN = /[^\s()'"`,;]{11,}/g;
  const CODE = /::|_|\/[A-Za-z]|[A-Za-z0-9]\.[A-Za-z]/;
  const ID = /\b(?:[a-z]+-)+[a-z]?\d+\b|\blane-[a-z]\b/g;
  function fitText(s) {
    s = s.replace(ID, id => id.replace(/-(?!\u2060)/g, '-\u2060')).replace(/\u2026(?=[A-Za-z0-9_./])/g, '\u2026\u2060');
    return s.replace(TOKEN, tok => (!CODE.test(tok) ? tok : tok
      .replace(/::(?=[^\s:\u200B])/g, '::\u200B')
      .replace(/_(?=[^\s_\u200B])/g, '_\u200B')
      .replace(/\/(?=[A-Za-z])/g, '/\u200B')
      .replace(/([A-Za-z0-9])\.(?=[A-Za-z])/g, (m, c) => (tok.replace(/[\u200B\u2060]/g, '').length >= 24 ? c + '\u200B.' : m))));
  }
  const TEXT_SEL = '.sh-nm-txt, .sh-runmeta, .sh-meta, .sh-v, .sh-log > div, .sh-lrsum';
  const SKIP_SEL = '.d-gl, .chip-abbr, svg, .sh-modelmark';
  function texts(panel) {
    const seen = new Set();
    panel.querySelectorAll(TEXT_SEL).forEach(el => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (seen.has(n)) continue;
        seen.add(n);
        const host = n.parentElement;
        if (!n.nodeValue.trim() || (host && host.closest(SKIP_SEL))) continue;
        let v = fitText(n.nodeValue);
        /* in code (a command, a log line, a code-style run name) a hyphenated word is one name (puppet-core, import-load,
           qty-stepper) and a flag keeps its dashes (--proptest, -p) */
        if (host && host.closest('.sh-v.sh-mono, .sh-log, .sh-name.sh-mono')) {
          v = v.replace(/([A-Za-z0-9])-(?=[A-Za-z0-9])/g, '$1-\u2060')
            .replace(/(^|[\s(])(--?)(?=[A-Za-z])/g, (m, a, d) => a + d.split('').join('\u2060') + '\u2060');
        }
        editText(n, v);
      }
    });
  }
  /* an opened row stacks a long code value (a command, a suite, a path) under its label at the full row width instead
     of squeezing it into the value column */
  function stacks(panel) {
    panel.querySelectorAll('.sh-run .sh-accb .sh-kv:not(.sh-kv-stack)').forEach(kv => {
      const v = kv.querySelector(':scope > .sh-v');
      if (!v) return;
      const s = v.textContent.replace(/[\u200B\u2060]/g, '').trim();
      const longest = s.split(/\s+/).reduce((m, w) => Math.max(m, w.length), 0);
      if ((v.classList.contains('sh-mono') && s.length > 26) || longest >= 18) addClass(kv, 'lf-stack');
    });
  }
  /* every status chip in the panel speaks the run vocabulary; a chip whose glyph shows draws the run shape */
  function chips(panel, animate) {
    panel.querySelectorAll('.pm-chip').forEach(chip => {
      if (!chip.hasAttribute('data-d-st')) return;
      const st = chipState(chip);
      if (chip.getAttribute('data-d-st') !== st) setAttr(chip, 'data-d-st', st);
      const gl = chip.querySelector(':scope > .d-gl'), shape = SHAPE[st] || st;
      if (!gl || gl.getAttribute('data-gl') === shape) return;
      gl.setAttribute('data-gl', shape);
      gl.innerHTML = svgFor(shape);
      if (st === 'run') gl.setAttribute('data-pulse', ''); else gl.removeAttribute('data-pulse');
      if (animate) popGlyph(gl);
    });
  }
  /* Agents: the facts line ends with the same "waiting 4m" the head's waiting / elapsed line already says */
  function dropTime(run, meta) {
    const time = run.querySelector('.sh-agtime');
    if (!time || !meta) return;
    const nodes = Array.from(meta.childNodes).filter(n => n.nodeType === 3 && n.nodeValue.trim());
    const last = nodes[nodes.length - 1];
    if (last) editText(last, last.nodeValue.replace(/\s*·\s*(waiting|elapsed)\s+\S+\s*$/i, ''));
  }

  function rows(panel, animate) {
    panel.querySelectorAll('.sh-run').forEach(run => {
      const head = run.querySelector(':scope > .sh-run-h');
      if (!head) return;
      addClass(head, 'pmr-cur');
      const main = head.querySelector(':scope > .sh-main');
      const name = main && main.querySelector(':scope > .sh-name');
      const meta = main && main.querySelector(':scope > .sh-runmeta, :scope > .sh-meta');
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
      dropTime(run, meta);
    });
  }

  /* shelf summaries in sentence case ("Redacted"); the shared pass already does the state words */
  function heads(panel) {
    panel.querySelectorAll('.sh-shelf > .sh-head > .sh-hcount').forEach(el => {
      const t = ownText(el);
      if (t && /^[a-z]/.test(t)) setOwnText(el, capFirst(t));
    });
    /* a meter named by a plain word ("context"); lane ids (lane-b · api) stay as they are */
    panel.querySelectorAll('.pm-occ > .nm').forEach(el => {
      const t = ownText(el);
      if (/^[a-z]+$/.test(t)) setOwnText(el, capFirst(t));
    });
  }

  /* abbreviations, ASCII arrows and spelling inside longer text, in these two panels only */
  const PH = [
    [/\b(\d+(?:\.\d+)?k) tok\b/g, '$1 tokens'], [/ -> /g, ' \u2192 '], [/\b(\d+) ops\b/g, '$1 operations'],
    [/\brepro (?=\S)/g, 'reproduction '], [/^(\s*)Re-run(\s*)$/g, '$1Rerun$2'], [/^(\s*)Open Chat(\s*)$/g, '$1Open chat$2'],
  ];
  function phrases(panel) {
    const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
    const hits = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (PH.some(([rx]) => { rx.lastIndex = 0; return rx.test(n.nodeValue); })) hits.push(n);
    }
    hits.forEach(n => {
      let v = n.nodeValue;
      PH.forEach(([rx, rep]) => { rx.lastIndex = 0; v = v.replace(rx, rep); });
      editText(n, v);
    });
  }


  /* the shell fits its chips and counts to their room (PMPillFit writes data-fit), and does so again while D is on,
     where a chip in the facts line has room. Leaving D puts back the fit Current measured before D, not one measured in
     D's layout or in the first frames after the switch, while Friendly's rows are still easing back to their own
     padding (a refit there left "flaky 2/2" whole where Current shows "flaky"). */
  const FIT_SEL = '.pm-chip[data-narrow-chip], .sh-bstatus[data-narrow], .sh-hcount, .pm-btnrow';
  function fits(panel) {
    panel.querySelectorAll(FIT_SEL).forEach(el => { if (!el.hasAttribute('data-d-a-data-fit')) setAttr(el, 'data-fit', el.getAttribute('data-fit')); });
  }

  return {
    apply(panel, animate) { fits(panel); rows(panel, animate); chips(panel, animate); texts(panel); stacks(panel); heads(panel); phrases(panel); },
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
});
