/* PMX More Info — Opus 5
 *
 * More Info adds EXACT TIME information to the runtime information already shown compactly.
 * The compact hover row shows duration; exact clock timestamps belong here.
 *
 * Fields (rendered only when present):
 *   Message timestamp, Execution start, First visible response,
 *   Completion / stop / failure / cancellation time when terminal,
 *   Worked for, Total elapsed (only when it DIFFERS from Worked for),
 *   Mode, Provider, Model, Effort, Persona, Tokens, Context use,
 *   Estimated cost or plan usage, Turn or run identity.
 *
 * Timestamps are stored UTC and rendered in the viewer's locale.
 * "Worked for" measures active execution and excludes explicit pause time and time blocked
 * waiting on a user questionnaire. "Total elapsed" may include that waiting time.
 */
(function (global) {
  'use strict';

  function U() { return global.PMXUtil; }
  function fmt() { return global.PMXData.fmt; }

  function row(label, value) {
    if (value == null || value === '') return null;
    return U().el('div', { class: 'pmx-info-row' }, [
      U().el('span', { class: 'pmx-info-label', text: label }),
      U().el('span', { class: 'pmx-info-value', text: String(value) })
    ]);
  }

  function num(n) {
    if (n == null) return null;
    try { return Number(n).toLocaleString(); } catch (e) { return String(n); }
  }

  function build(msg, ctx) {
    var f = fmt();
    var rt = msg.runtime || {};
    var host = U().el('div', { class: 'pmx-info' });

    var rows = [];

    /* --- Timing. This is the reason More Info exists. --- */
    rows.push(row('Message timestamp', msg.sentAt ? f.dateTime(msg.sentAt) : null));
    rows.push(row('Execution start', rt.startedAt ? f.dateTime(rt.startedAt) : null));
    rows.push(row('First visible response', rt.firstVisibleAt ? f.dateTime(rt.firstVisibleAt) : null));

    /* Terminal time carries its own label so a stopped turn does not read as "completed". */
    if (rt.terminalAt) {
      var terminalLabel = 'Completed';
      if (rt.terminalReason === 'stopped') terminalLabel = 'Stopped';
      else if (rt.terminalReason === 'failed') terminalLabel = 'Failed';
      else if (rt.terminalReason === 'cancelled') terminalLabel = 'Cancelled';
      rows.push(row(terminalLabel, f.dateTime(rt.terminalAt)));
    }

    if (rt.workedSeconds != null) rows.push(row('Worked for', f.duration(rt.workedSeconds)));

    /* Total elapsed appears ONLY when it differs from Worked for — otherwise it is noise.
     * In the supplied dataset these are identical on every message; the extension data
     * supplies diverging pairs so this row is actually exercisable. */
    if (rt.totalElapsedSeconds != null &&
        rt.workedSeconds != null &&
        rt.totalElapsedSeconds !== rt.workedSeconds) {
      rows.push(row('Total elapsed', f.duration(rt.totalElapsedSeconds)));
    }

    /* --- Turn configuration. --- */
    rows.push(row('Mode', rt.mode));
    rows.push(row('Provider', rt.provider));
    rows.push(row('Model', rt.model));
    rows.push(row('Effort', rt.effort));
    rows.push(row('Persona', rt.persona));

    /* --- Consumption. --- */
    rows.push(row('Tokens', num(rt.tokenCount)));
    if (rt.contextUsed != null && rt.contextLimit != null) {
      rows.push(row('Context use', num(rt.contextUsed) + ' of ' + num(rt.contextLimit)));
    }
    if (rt.estimatedCost != null) {
      rows.push(row('Estimated cost', f.cost(rt.estimatedCost)));
    }

    /* --- Identity, when it is genuinely useful. --- */
    rows.push(row('Turn', rt.turnId || msg.id));
    if (rt.runId) rows.push(row('Run', rt.runId));

    for (var i = 0; i < rows.length; i++) {
      if (rows[i]) host.appendChild(rows[i]);
    }

    /* A user message's provider/model/duration describe the turn it launched, not the person.
     * Say so, rather than letting the reader assume the metadata is about their own typing. */
    if (msg.role === 'user' && rt.describesTurn === 'launched') {
      host.appendChild(U().el('p', {
        class: 'pmx-info-note',
        text: 'Provider, model, and duration describe the turn this message launched.'
      }));
    }

    return host;
  }

  /* Opens through the shared popup family so it obeys single-overlay, corner-origin,
   * viewport-aware placement, and the reduced-motion end state like every other overlay. */
  function open(anchorEl, msg, ctx) {
    return ctx.services.popup.open({
      anchorEl: anchorEl,
      kind: 'panel',
      width: 260,
      build: function (hostEl) {
        hostEl.appendChild(U().el('div', { class: 'pmx-info-title', text: 'Message details' }));
        hostEl.appendChild(build(msg, ctx));
      }
    });
  }

  global.PMXMoreInfo = { open: open, build: build };
})(window);
