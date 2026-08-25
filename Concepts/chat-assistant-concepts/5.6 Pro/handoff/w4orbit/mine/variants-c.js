/* Working-animation takes — group c. Registered into window.PM56_WORKING.
   Each take is (ctx) => htmlString. See makeWorkCtx() in app.js for ctx.

   Takes 16..23. One faithful reading of the reference recording and seven
   variations on the same idea: a quiet stage under the shared phase chrome
   (app.js renderPhaseChrome) that shows what the agent is actually doing
   at a readable pace. The chrome owns the icon trail, the bold verb and
   grey count, the concrete rows, the compact "N steps" receipt and the
   click-to-reopen discs; these bodies are the stage picture beneath it.

     16 Loom          the video-faithful stage: verb, streamed detail, bar
     17 Pulse Grid    14 step tiles; the current one carries a radar sweep
     18 Ledger        phase verbs left, rolling counters right, sliding bar
     19 Constellation one star per step, connectors inked as work proceeds
     20 Metronome     a pendulum keeps time; phase ticks mark the arc
     21 Filmstrip     14 frames; the active frame develops into focus
     22 Sonar         ring pulses + rotating sweep; blips per done phase
     23 Circuit       8 pads on a trace; the live segment carries dashes

   Patch discipline (renderApp reconciles with pmPatch, it does not
   replace innerHTML):
     - a CSS entrance fires only when a node is genuinely NEW,
     - data-k is the identity that decides "new",
     - anything that must survive the 2000ms tick carries a constant key,
     - anything that must replay on a step change carries the step id.
   ===================================================================== */
(() => {
  'use strict';
  const W = window.PM56_WORKING;
  const M = window.PM56_MOTION;
  const esc = M.esc;

  /* The phase list, shared by takes that draw one glyph per phase. Derived
     from the same phaseGroups map the shared chrome uses, so the stage and
     the chrome always agree on what a phase is. */
  function phasesOf(D) {
    const phases = [];
    for (const s of D.workSteps) {
      const p = D.phaseGroups[s.kind] || s.kind;
      const g = phases[phases.length - 1];
      if (g && g.phase === p) g.steps.push(s); else phases.push({ phase: p, first: s, steps: [s] });
    }
    return phases;
  }
  const activePhase = (phases, step) => phases.findIndex(g => g.steps.some(s => s.id === step.id));

  /* =====================================================================
     16 — LOOM (the video-faithful stage)
     ---------------------------------------------------------------------
     The reference shows almost nothing beneath the phase chrome except the
     work itself: the current verb, the live detail streaming in word by
     word, and a hairline progress bar in the step's hue. Fidelity here is
     restraint — the chrome above carries the trail, the rows and the
     compaction exactly as measured from the recording.
     ===================================================================== */
  W[16] = (ctx) => {
    const { step, pct, running } = ctx;
    return `<div class="loom-stage" data-k="loom">
      <div class="loom-verb ${running ? 'pm-shimmer' : 'pm-shimmer pm-settled'}" data-k="loom16v:${step.id}">${esc(step.verb)}</div>
      <div class="loom-detail pm-stream" data-k="l16:${step.id}">${M.words(step.detail)}</div>
      <div class="loom-bar" data-k="p16"><i style="width:${pct}%"></i></div>
    </div>`;
  };

  /* =====================================================================
     17 — PULSE GRID
     ---------------------------------------------------------------------
     The whole run as a wall of tiles: one per step, done tiles lit in the
     current phase hue, the live tile carrying a slow radar sweep. The map
     of where the work is, readable at a glance.
     ===================================================================== */
  W[17] = (ctx) => {
    const { steps, step, index, icon } = ctx;
    const tiles = steps.map((s, i) => {
      const st = i < index ? 'done' : i === index ? 'current' : 'next';
      return `<span class="c17-tile ${st}" data-k="g17:${s.id}" title="${esc(s.label)} · ${esc(s.verb)}">${st === 'next' ? '' : icon(s.icon, 12)}</span>`;
    }).join('');
    return `<div class="c17-grid" data-k="c17" aria-label="Step grid: ${index + 1} of ${steps.length} active">${tiles}</div>`;
  };

  /* =====================================================================
     18 — LEDGER
     ---------------------------------------------------------------------
     A bookkeeper's sheet: every phase gets a row, and the right column
     rolls its completed-step count as the work proceeds. A 2px bar in the
     phase hue slides between rows to mark where the agent is now.
     ===================================================================== */
  W[18] = (ctx) => {
    const { D, steps, step, index } = ctx;
    const phases = phasesOf(D);
    const active = activePhase(phases, step);
    const rows = phases.map((g, i) => {
      const meta = D.phaseMeta[g.first.kind] || {};
      const done = g.steps.filter(s => steps.indexOf(s) <= index).length;
      const st = i < active ? 'done' : i === active ? 'current' : 'next';
      return `<div class="c18-row ${st}" data-k="c18r:${g.phase}"><span class="c18-name">${esc(meta.verb || g.phase)}</span><span class="c18-val">${M.roll(done)}<u>/ ${g.steps.length}</u></span></div>`;
    }).join('');
    return `<div class="c18-sheet" data-k="c18">${rows}<i class="c18-bar" data-k="c18bar" style="top:${active * 22 + 27}px"></i></div>`;
  };

  /* =====================================================================
     19 — CONSTELLATION
     ---------------------------------------------------------------------
     One fixed star per step in a fixed sky; as work proceeds the stars
     light in the phase hue and the connector between them inks itself in.
     The run as a picture you can see the shape of.
     ===================================================================== */
  const STARS = [[14, 70], [36, 38], [58, 60], [80, 26], [102, 48], [124, 18], [146, 42], [168, 64], [190, 32], [212, 52], [234, 24], [256, 46], [278, 62], [302, 36]];
  W[19] = (ctx) => {
    const { steps, step, index } = ctx;
    const segs = [];
    for (let i = 1; i <= index && i < steps.length; i++) {
      const [x1, y1] = STARS[i - 1], [x2, y2] = STARS[i];
      segs.push(`<line class="c19-seg" data-k="c19s:${steps[i].id}" pathLength="1" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
    }
    const stars = STARS.map(([x, y], i) => {
      const st = i < index ? 'done' : i === index ? 'current' : 'next';
      return `<circle class="c19-star ${st}" data-k="c19n:${steps[i].id}" cx="${x}" cy="${y}" r="${i === index ? 4 : 3}"/>`;
    }).join('');
    const [cx, cy] = STARS[index];
    return `<div class="c19-sky" data-k="c19" aria-label="Constellation: ${index + 1} of ${steps.length} stars lit">
      <svg viewBox="0 0 316 88" width="100%" height="88" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        ${segs.join('')}${stars}<circle class="c19-halo" data-k="c19h:${step.id}" cx="${cx}" cy="${cy}" r="4"/>
      </svg>
    </div>`;
  };

  /* =====================================================================
     20 — METRONOME
     ---------------------------------------------------------------------
     Work as tempo: a pendulum keeps time in the phase hue while a row of
     eight phase ticks records the passage — tinted when done, glowing when
     live. The step counter rolls beneath.
     ===================================================================== */
  W[20] = (ctx) => {
    const { D, step, index } = ctx;
    const phases = phasesOf(D);
    const active = activePhase(phases, step);
    const ticks = phases.map((g, i) => {
      const st = i < active ? 'done' : i === active ? 'current' : 'next';
      return `<i class="c20-tick ${st}" data-k="c20t:${g.phase}" title="${esc((D.phaseMeta[g.first.kind] || {}).verb || g.phase)}"></i>`;
    }).join('');
    return `<div class="c20-body" data-k="c20">
      <div class="c20-dial" data-k="c20d"><i class="c20-arm" data-k="c20a"></i><i class="c20-pivot"></i></div>
      <div class="c20-ticks" data-k="c20ticks">${ticks}</div>
      <div class="c20-count" data-k="c20c">step ${M.roll(index + 1)} <u>/ ${D.workSteps.length}</u></div>
    </div>`;
  };

  /* =====================================================================
     21 — FILMSTRIP
     ---------------------------------------------------------------------
     The run as a strip of film: fourteen frames with sprocket holes, the
     reel sliding so the live frame sits center, where it "develops" from a
     blur into focus. Past frames keep their image, future frames are dark.
     ===================================================================== */
  W[21] = (ctx) => {
    const { steps, step, index, icon } = ctx;
    const frames = steps.map((s, i) => {
      const st = i < index ? 'done' : i === index ? 'current' : 'next';
      return `<span class="c21-frame ${st}" data-k="f21:${s.id}" title="${esc(s.label)} · ${esc(s.verb)}">${st === 'next' ? '' : icon(s.icon, 13)}<u>${i + 1}</u></span>`;
    }).join('');
    return `<div class="c21-strip" data-k="c21" aria-label="Filmstrip: frame ${index + 1} of ${steps.length} developing">
      <div class="c21-reel" data-k="c21reel" style="transform:translateX(-${index * 58 + 29}px)">${frames}</div>
    </div>`;
  };

  /* =====================================================================
     22 — SONAR
     ---------------------------------------------------------------------
     The agent pinging its environment: ring pulses, a rotating sweep, one
     blip per completed phase at a fixed bearing. Beside the scope, the
     actual command for the current step in mono — the readout.
     ===================================================================== */
  W[22] = (ctx) => {
    const { D, step, commandForStep } = ctx;
    const phases = phasesOf(D);
    const active = activePhase(phases, step);
    const blips = phases.map((g, i) => {
      const st = i < active ? 'done' : i === active ? 'current' : '';
      if (!st) return '';
      const a = (i / phases.length) * 2 * Math.PI - Math.PI / 2;
      const r = 20 + (i % 3) * 8;
      const x = 50 + Math.cos(a) * r, y = 50 + Math.sin(a) * r;
      return `<i class="c22-blip ${st}" data-k="c22b:${g.phase}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%" title="${esc((D.phaseMeta[g.first.kind] || {}).past || g.phase)}"></i>`;
    }).join('');
    return `<div class="c22-body" data-k="c22">
      <div class="c22-scope" data-k="c22s" aria-label="Sonar: ${active} of ${phases.length} phases swept">
        <i class="c22-ring c22-r1" data-k="c22r1"></i><i class="c22-ring c22-r2" data-k="c22r2"></i>
        <i class="c22-sweep" data-k="c22sw"></i>${blips}<i class="c22-core"></i>
      </div>
      <div class="c22-readout" data-k="c22ro">
        <span class="c22-cmd pm-materialize" data-k="s22:${step.id}">${esc(commandForStep(step))}</span>
      </div>
    </div>`;
  };

  /* =====================================================================
     23 — CIRCUIT
     ---------------------------------------------------------------------
     The run as current on a board: eight pads on a trace, one per phase.
     Done segments stay lit, the segment being energized carries moving
     dashes, and the live pad breathes. The counter rolls beneath.
     ===================================================================== */
  W[23] = (ctx) => {
    const { D, step, index } = ctx;
    const phases = phasesOf(D);
    const active = activePhase(phases, step);
    const n = phases.length;
    const xs = phases.map((g, i) => 14 + i * (292 / (n - 1)));
    const doneLines = [];
    for (let i = 1; i <= active && i < n; i++) {
      doneLines.push(`<line class="c23-done" data-k="c23d:${phases[i].phase}" x1="${xs[i - 1]}" y1="26" x2="${xs[i]}" y2="26"/>`);
    }
    const live = active > 0 ? `<line class="c23-live" data-k="c23l:${phases[active].phase}" x1="${xs[active - 1]}" y1="26" x2="${xs[active]}" y2="26"/>` : '';
    const pads = phases.map((g, i) => {
      const st = i < active ? 'done' : i === active ? 'current' : 'next';
      return `<circle class="c23-pad ${st}" data-k="c23p:${g.phase}" cx="${xs[i].toFixed(1)}" cy="26" r="${i === active ? 5 : 3.5}"><title>${esc((D.phaseMeta[g.first.kind] || {}).verb || g.phase)}</title></circle>`;
    }).join('');
    return `<div class="c23-body" data-k="c23" aria-label="Circuit: pad ${active + 1} of ${n} energized">
      <svg viewBox="0 0 320 52" width="100%" height="52" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <line class="c23-base" x1="14" y1="26" x2="306" y2="26"/>
        ${doneLines.join('')}${live}${pads}
      </svg>
      <div class="c23-count" data-k="c23c">${M.roll(index + 1)} steps energized</div>
    </div>`;
  };
})();
