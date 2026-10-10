/* Agents (lane F). The subagent rows are run rows (LF_RUN in 55-testing.js): one glyph, the status word leading the
   facts line, the waiting / elapsed line inside the row head. The two summaries (lane capacity, queued work) become
   sections of their shelf under a hairline; a summary count the shell paints as a warning gets the warning glyph, so
   the state is a shape and a word, not only a colour. The "3 more" line and the capacity head take the NieR cursor. */

function lfAgentSummaries(panel) {
  panel.querySelectorAll('.pm-sumcard').forEach(card => {
    const h = card.querySelector(':scope > .pm-sumcard-h');
    if (!h) return;
    if (h.hasAttribute('data-collapse')) addClass(h, 'pmr-cur');
    const c = h.querySelector(':scope > .c');
    if (c && /--accent-warning/.test(c.getAttribute('style') || '') && !c.querySelector(':scope > .d-gl')) {
      setAttr(c, 'data-d-st', 'warn');
      inject(c, glyph('warn'), c.firstChild);
    }
  });
  panel.querySelectorAll('.sh-body > .sh-row.flat[data-demo-action]').forEach(r => addClass(r, 'pmr-cur'));
}

panelHook('panel-agents', {
  apply(panel, animate) {
    LF_RUN.apply(panel, animate);
    lfAgentSummaries(panel);
  },
});
