/* Working-animation takes — group b. Registered into window.PM56_WORKING.
   Each take is (ctx) => htmlString. See makeWorkCtx() in app.js for ctx.

   Group b is the abstract / spatial end of the range:
     12  Signal Meter   — concentric arc gauges + a live scope trace. No prose.
     13  Blueprint      — the run draws itself as an inked schematic.
     14  Timeline Scrub — the whole run on a time axis, scrubbable.
     15  Terminal Cast  — asciinema-style typing transcript.

   Motion contract (see the note above pmPatch in app.js): renderApp()
   reconciles rather than replaces, so a keyframe entrance fires exactly
   when a node is genuinely new. Every take below keys its nodes by the
   thing they represent, so entrances play once and CSS transitions --
   which need a surviving node -- carry the per-tick state changes.
   Timings come from motion.css, which derived them from the reference
   recording frame by frame. Nothing here invents a duration.            */
(() => {
  'use strict';
  const W = window.PM56_WORKING;
  const M = window.PM56_MOTION;

  /* ==================================================================
     Shared, deterministic run fixtures for group b.
     DUR sums to 134s, which is exactly the elapsed time completeWorking()
     settles on, so the timeline axis and the shared receipt agree.
     ================================================================== */
  const DUR = [4, 8, 11, 8, 6, 9, 12, 15, 17, 7, 10, 12, 9, 6];
  const CUM = DUR.reduce((a, d) => (a.push(a[a.length - 1] + d), a), [0]);
  const RUN_T = CUM[CUM.length - 1];                    // 134

  /* Four-character channel codes. Take 12 and 13 read as instruments, so
     they never spell a word out -- they use the register code instead. */
  const CODE = {
    prepare: 'PREP', thought: 'COGN', files: 'READ', 'web-search': 'SRCH',
    'web-fetch': 'FTCH', browser: 'BRWS', bash: 'EXEC', agents: 'FORK',
    edit: 'WRIT', app: 'CTRL', test: 'PROB', validate: 'VRFY',
    artifact: 'RNDR', complete: 'DONE'
  };
  const codeFor = (s) => CODE[s && s.kind] || 'OPER';
  const clockAt = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;

  /* ==================================================================
     12 — SIGNAL METER
     ------------------------------------------------------------------
     An instrument cluster. Three concentric gauges (phase / flow /
     confidence) fill by transitioning stroke-dashoffset on a path whose
     pathLength is normalised to 100, so the value IS the offset. A scope
     trace scrolls continuously underneath; its amplitude follows the
     throughput signal via a transitioned scaleY on the trace wrapper.
     There is no step list and no sentence anywhere in this take.
     ================================================================== */

  /* Throughput, confidence and the p95 the fixtures quote (482ms baseline
     at the bench step, 71ms once validation lands). Cumulative tool count
     ends at 14, which is the number the shared receipt reports. */
  const FLOW = [10, 26, 48, 62, 55, 70, 88, 73, 94, 64, 82, 76, 58, 30];
  const CONF = [6, 16, 25, 33, 41, 50, 57, 63, 71, 78, 85, 92, 97, 100];
  const P95 = [482, 482, 482, 482, 482, 482, 482, 482, 318, 262, 205, 71, 71, 71];
  const OPS = [0, 1, 3, 4, 6, 7, 9, 11, 12, 13, 14, 14, 14, 14];

  /* A 280-degree gauge arc, opening at the bottom. */
  function arcPath(cx, cy, r, a0, sweep) {
    const rad = (d) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad(a0)), y1 = cy + r * Math.sin(rad(a0));
    const x2 = cx + r * Math.cos(rad(a0 + sweep)), y2 = cy + r * Math.sin(rad(a0 + sweep));
    return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }
  const ARC = [50, 39.5, 29].map((r) => arcPath(59, 59, r, 130, 280));

  /* Two identical tiles of a band-limited trace. Every component period
     divides the 240-unit tile, so translating by exactly one tile is
     seamless and the scroll never shows a seam. */
  const WAVE = (() => {
    const comps = [[240, 7.4, 0.4], [120, 4.6, 1.9], [80, 3.1, 3.4], [48, 2.0, 0.7], [30, 1.2, 2.6]];
    let d = '';
    for (let x = 0; x <= 480; x += 2) {
      let y = 22;
      for (const c of comps) y += c[1] * Math.sin((2 * Math.PI * x) / c[0] + c[2]);
      d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(2);
    }
    return d;
  })();

  W[12] = (ctx) => {
    const { esc, D, index, step, running, completed, elapsed, formatElapsed, steps, icon } = ctx;
    const last = steps.length - 1;
    const phase = Math.round((index / last) * 100);
    const flow = completed ? 0 : FLOW[index];
    const conf = CONF[index];
    const code = codeFor(step);
    const amp = (0.16 + (flow / 100) * 0.84).toFixed(3);
    const chan = `${String(index + 1).padStart(2, '0')}/${last + 1}`;
    const stateCode = completed ? 'HOLD' : running ? 'LIVE' : 'PAUS';

    const gauge = (i, cls, v) =>
      `<path class="pm12-trk ${cls}" d="${ARC[i]}" pathLength="100"/>` +
      `<path class="pm12-val ${cls}" data-k="arc:${cls}" d="${ARC[i]}" pathLength="100" style="stroke-dashoffset:${100 - v}"/>`;

    const meter = (k, cls, label, value, unit) =>
      `<div class="pm12-m" data-k="m:${k}"><label><i class="${cls}"></i>${esc(label)}</label>` +
      `<b>${M.roll(value)}<u>${esc(unit)}</u></b></div>`;

    /* Child agents arrive as extra channels on the same instrument rather
       than as a card of prose underneath it -- see ownsAgents below. */
    const subs = step.kind === 'agents' ? D.subagents.slice(0, 2) : [];
    const subRows = subs.length ? `<div class="pm12-subs" data-k="subs">${subs.map((a, i) => {
      const st = a.status === 'blocked' ? 'BLK' : a.status === 'working' ? 'RUN' : 'OK';
      return `<button class="pm12-sub ${esc(a.status)}" data-k="sub:${esc(a.id)}" data-action="open-agent" data-id="${esc(a.id)}" title="${esc(a.name)} · ${esc(a.current)}">
        <span class="pm12-sub-ch">SUB ${String(index + 1).padStart(2, '0')}.${i + 1}</span>
        <span class="pm12-sub-bar"><i style="width:${Number(a.progress) || 0}%"></i></span>
        <span class="pm12-sub-v">${M.roll(Number(a.progress) || 0)}<u>%</u></span>
        <span class="pm12-sub-st ${esc(a.status)}">${st}</span>
      </button>`;
    }).join('')}</div>` : '';

    return `<div class="pm12" data-k="pm12" role="img" aria-label="Signal meter: channel ${esc(chan)}, ${esc(code)}, phase ${phase} percent, throughput ${flow} percent, confidence ${conf} percent">
<div class="pm12-cluster">
  <div class="pm12-gauge" data-k="gauge">
    <svg viewBox="0 0 118 118" width="118" height="118" aria-hidden="true">
      ${gauge(0, 'a', phase)}${gauge(1, 'b', flow)}${gauge(2, 'c', conf)}
    </svg>
    <div class="pm12-core"><b>${M.roll(phase)}<u>%</u></b><span>PHASE</span></div>
  </div>
  <div class="pm12-right">
    <div class="pm12-chan">
      <span class="pm12-ch">CH ${esc(chan)}</span>
      <strong class="${running ? 'pm-shimmer' : 'pm-shimmer pm-settled'}" data-k="code:${esc(code)}">${esc(code)}</strong>
      <span class="pm12-sp"></span>
      <span class="pm12-st ${stateCode.toLowerCase()}">${esc(stateCode)}</span>
      <span class="pm12-clock">${esc(formatElapsed(elapsed))}</span>
    </div>
    <div class="pm12-scope" data-k="scope">
      <svg class="pm12-grid" viewBox="0 0 240 44" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 11H240M0 22H240M0 33H240"/>
      </svg>
      <div class="pm12-amp" style="--amp:${amp}">
        <svg class="pm12-trace" viewBox="0 0 240 44" preserveAspectRatio="none" aria-hidden="true">
          <g class="pm12-scroll ${running ? '' : 'held'}" data-k="scroll"><path d="${WAVE}" vector-effect="non-scaling-stroke"/></g>
        </svg>
      </div>
      <i class="pm12-head"></i>
    </div>
    <div class="pm12-meters">
      ${meter('flow', 'b', 'FLOW', flow, '%')}
      ${meter('conf', 'c', 'CONF', conf, '%')}
      ${meter('p95', 'd', 'P95', P95[index], 'ms')}
      ${meter('ops', 'e', 'OPS', OPS[index], '')}
    </div>
  </div>
</div>
<div class="pm12-reg" data-k="reg">${steps.map((s, i) =>
      `<i data-k="tk:${esc(s.id)}" class="${i < index ? 'done' : i === index ? 'now' : ''}"></i>`).join('')}</div>
${subRows}
${completed ? ctx.workReceipt() : ''}</div>`;
  };
  /* The instrument reports its own child channels, so the shared inline
     agent list must not also be appended underneath it. */
  W[12].ownsAgents = true;

  /* ==================================================================
     13 — BLUEPRINT
     ------------------------------------------------------------------
     The run inks itself onto a drafting grid. Future steps sit on the
     sheet as dashed ghosts, so you can read where the work is going;
     as each step lands the ghost is replaced by an inked node and the
     trace that reaches it strokes itself on (stroke-dashoffset, with
     pathLength normalised to 1 so one keyframe fits every edge length).
     A pen head runs ahead of the wet ink, and a drafting crosshair
     glides from station to station instead of cutting.

     Staging. The handoff is a drafting gesture, so it plays as a
     sequence rather than a swap -- each beat waits for the one before
     it to arrive:
        0-300ms  the trace strokes on, heavy and step-coloured, with the
                 pen head at its tip; the crosshair glides to the new
                 station (360ms on the measured pop easing); the station
                 the run just left demotes to grey over 260ms
       300-470   the node inks -- the disc pops only once the pen arrives
       340-470   the callout caption slides in behind it
       430-540   the station code fades up beneath the node
     The edge one step ahead marches while it waits, so the sheet says
     where the pen is going before it gets there.
     ================================================================== */

  const LANE = { up: 44, mid: 90, dn: 136 };
  const PLAN = ['mid', 'mid', 'up', 'dn', 'dn', 'up', 'up', 'dn', 'mid', 'up', 'dn', 'dn', 'up', 'mid'];
  const NX = PLAN.map((_, i) => Math.round(24 + i * 38.3));

  /* Orthogonal trace routing with rounded corners, the way a board is
     drawn. Same-lane hops are a straight run. */
  function edgePath(i) {
    const x1 = NX[i], x2 = NX[i + 1], y1 = LANE[PLAN[i]], y2 = LANE[PLAN[i + 1]];
    const sx = x1 + 11, ex = x2 - 11;
    if (y1 === y2) return `M${sx} ${y1}H${ex}`;
    const mx = Math.round((x1 + x2) / 2), r = 7, dir = y2 > y1 ? 1 : -1;
    return `M${sx} ${y1}H${mx - r}Q${mx} ${y1} ${mx} ${y1 + dir * r}V${y2 - dir * r}Q${mx} ${y2} ${mx + r} ${y2}H${ex}`;
  }
  const EDGE = PLAN.slice(0, -1).map((_, i) => edgePath(i));

  W[13] = (ctx) => {
    const { esc, index, step, running, completed, steps, icon } = ctx;
    const inked = [], ghosts = [], traces = [], ghostTraces = [];

    for (let i = 0; i < steps.length; i++) {
      const s = steps[i], x = NX[i], y = LANE[PLAN[i]];
      if (i < steps.length - 1) {
        /* An edge is tinted by the step it lands on, so the ink that
           arrives at a node is that node's colour while it is wet. */
        const kind = esc(steps[i + 1].kind);
        if (i < index) {
          traces.push(`<path class="pm13-edge" data-k="e:${esc(s.id)}" data-step-kind="${kind}" d="${EDGE[i]}" pathLength="1"/>`);
        } else {
          /* The next edge to be drawn marches: anticipation, one step
             ahead of the pen, and only ever one. */
          ghostTraces.push(`<path class="pm13-gedge${i === index ? ' soon' : ''}" data-k="ge:${esc(s.id)}" data-step-kind="${kind}" d="${EDGE[i]}"/>`);
        }
      }
      if (i <= index) {
        const cls = i === index ? (completed ? 'done end' : 'now') : 'done';
        inked.push(
          `<g class="pm13-node ${cls}" data-k="n:${esc(s.id)}" transform="translate(${x} ${y})" data-step-kind="${esc(s.kind)}">
             <g class="pm13-pop"><circle class="pm13-disc" r="11"/><g class="pm13-gl" transform="translate(-5.5 -5.5)">${icon(s.icon, 11)}</g></g>
             <text class="pm13-lb" y="${PLAN[i] === 'dn' ? 25 : 25}">${esc(CODE[s.kind] || 'OPER')}</text>
           </g>`);
      } else {
        ghosts.push(`<circle class="pm13-ghost${i === index + 1 ? ' soon' : ''}" data-k="g:${esc(s.id)}" data-step-kind="${esc(s.kind)}" cx="${x}" cy="${y}" r="5"/>`);
      }
    }

    const cx = NX[index], cy = LANE[PLAN[index]];
    /* Current flowing along the live trace, once the pen has left it. */
    const chase = running && index > 0
      ? `<path class="pm13-chase" data-k="chase" data-step-kind="${esc(step.kind)}" d="${EDGE[index - 1]}" pathLength="1"/>` : '';
    /* The pen: a bright head with a short trail, keyed to the step it is
       drawing so it is a genuinely new node exactly once per landing and
       its one pass plays then. It runs the same path as the ink on the
       same 300ms, so the head sits on the wet tip the whole way. */
    const pen = index > 0
      ? `<g class="pm13-pen" data-k="pen:${esc(step.id)}" data-step-kind="${esc(step.kind)}">
           <path class="pm13-pen-t" d="${EDGE[index - 1]}" pathLength="1"/>
           <path class="pm13-pen-h" d="${EDGE[index - 1]}" pathLength="1"/>
         </g>` : '';

    return `<div class="pm13" data-k="pm13">
<div class="pm13-tb">
  <span class="k">SCHEMATIC</span><span class="v">RUN-0043 · QUERY PATH</span>
  <span class="sp"></span>
  <span class="k">NODE</span><span class="v">${M.roll(String(index + 1).padStart(2, '0'))}/${steps.length}</span>
  <span class="k">REV</span><span class="v" data-k="rev:${completed ? 'f' : 'd'}">${completed ? 'FINAL' : 'DRAFT'}</span>
</div>
<div class="pm13-sheet" data-k="sheet">
  <svg viewBox="0 0 546 176" width="100%" preserveAspectRatio="xMidYMid meet" aria-label="Schematic of the run so far, ${index + 1} of ${steps.length} nodes inked">
    <defs><pattern id="pm13grid" width="13" height="13" patternUnits="userSpaceOnUse">
      <path d="M13 0H0V13" fill="none" stroke="currentColor" stroke-width=".5" opacity=".16"/>
    </pattern></defs>
    <rect class="pm13-paper" width="546" height="176" fill="url(#pm13grid)"/>
    <g class="pm13-ghosts">${ghostTraces.join('')}${ghosts.join('')}</g>
    <g class="pm13-cur" data-k="cur" data-step-kind="${esc(step.kind)}" style="transform:translate(${cx}px,${cy}px)">
      <line class="pm13-rule" x1="-546" y1="0" x2="546" y2="0"/>
      <line class="pm13-rule" x1="0" y1="-176" x2="0" y2="176"/>
      <circle class="pm13-cur1" r="17"/><circle class="pm13-cur2" r="17"/>
    </g>
    <g class="pm13-ink">${traces.join('')}${pen}${chase}${inked.join('')}</g>
  </svg>
</div>
<div class="pm13-cap" data-k="cap" data-step-kind="${esc(step.kind)}">
  <span class="pm13-cap-k" data-k="capk:${esc(step.id)}">${esc(CODE[step.kind] || 'OPER')}</span>
  <span class="pm13-cap-v" data-k="capv:${esc(step.id)}"><strong class="${running ? 'pm-shimmer' : 'pm-shimmer pm-settled'}">${esc(step.verb)}</strong></span>
</div>
${completed ? ctx.workReceipt() : ''}</div>`;
  };

  /* ==================================================================
     14 — TIMELINE SCRUB
     ------------------------------------------------------------------
     The whole run laid out on one time axis, each step a segment sized
     by its duration and tinted by its kind, so the finished strip is a
     colour record of the run. The playhead transitions its left offset
     on every tick. Scrubbing is real: hovering a segment swaps the
     detail card underneath it (pure CSS :has, so it survives the patch),
     and clicking one jumps the run to that moment via the shared
     inspect-work-step action.

     Staging. A scrub is a move along an axis, so the handoff is played
     as travel rather than as a swap:
        0-520ms  the playhead glides to its new offset while the segment
                 it just cleared fills to 100% under a seal that wipes
                 left to right -- the ink is laid down, not switched
       40-195    the detail rows cascade in on the measured 45ms beat
      150-520    the sentence resolves a word at a time behind them
      340-540    the evidence run arrives last
     The deck is still a single-slot swap, so only one card is ever
     painted: the cascade happens inside the card that is arriving,
     never across two.
     ================================================================== */

  W[14] = (ctx) => {
    const { esc, index, step, running, completed, steps, icon, formatElapsed } = ctx;
    const headT = completed ? RUN_T : CUM[index] + DUR[index] * 0.62;
    const headP = Math.max(0.4, Math.min(99.6, (headT / RUN_T) * 100));

    const segs = steps.map((s, i) => {
      const state = i < index ? 'done' : i === index ? 'now' : 'next';
      const fill = i < index || completed ? 100 : i === index ? 62 : 0;
      const wide = DUR[i] >= 9;
      /* The segment the playhead has just cleared. Keyed, and present for
         exactly one step, so its seal is a genuinely new node and wipes
         once -- the hatched live fill resolving into laid ink. */
      const just = i === index - 1 || (completed && i === index);
      return `<button class="pm14-seg ${state}${just ? ' just' : ''}" data-k="seg:${esc(s.id)}" data-step-kind="${esc(s.kind)}"
        style="flex:${DUR[i]} 0 0%" data-action="inspect-work-step" data-value="${i}"
        title="${esc(s.label)} · ${DUR[i]}s · click to scrub here">
        <i class="pm14-fill" style="width:${fill}%"></i>
        ${just ? `<i class="pm14-seal" data-k="seal:${esc(s.id)}"></i>` : ''}
        <span class="pm14-glyph">${icon(s.icon, wide ? 11 : 9)}</span>
      </button>`;
    }).join('');

    const cards = steps.map((s, i) => {
      const live = i === index;
      /* The cascade is carried by a class the render adds and removes, not
         by node identity: all fourteen cards live in the deck permanently,
         so only a class change can replay an entrance. pmSyncAttrs writes
         the class, which is what makes the animation newly applied. */
      const row = live ? ' pm-materialize' : '';
      return `<div class="pm14-card ${live ? 'live' : ''}" data-k="card:${esc(s.id)}" data-step-kind="${esc(s.kind)}">
        <div class="pm14-card-top${row}" style="--pm-stagger:0">
          <span class="pm14-badge">${icon(s.icon, 10)}${esc(s.label)}</span>
          <strong class="${live && running ? 'pm-shimmer' : ''}">${esc(s.verb)}</strong>
        </div>
        <div class="pm14-meta${row}" style="--pm-stagger:1">
          <span class="pm14-span">t+${clockAt(CUM[i])} → t+${clockAt(CUM[i + 1])}</span>
          <span class="pm14-dur">${DUR[i]}.0s</span>
          <span class="pm14-sp"></span>
        </div>
        <p class="${live ? 'pm-stream' : ''}">${live ? M.words(s.detail) : esc(s.detail)}</p>
        <div class="pm14-ev">${s.evidence.slice(0, 3).map((e, k) =>
          `<span class="${row}" style="--pm-stagger:${k}">${esc(e)}</span>`).join('')}</div>
      </div>`;
    }).join('');

    const ticks = [0, 30, 60, 90, 120].map((t) =>
      `<i style="left:${((t / RUN_T) * 100).toFixed(2)}%"><u>${clockAt(t)}</u></i>`).join('');

    return `<div class="pm14" data-k="pm14">
<div class="pm14-head-row">
  <span class="pm14-k">TIMELINE</span><span class="pm14-v">RUN-0043</span>
  <span class="pm14-sp"></span>
  <span class="pm14-now">t+${M.roll(clockAt(Math.round(headT)))}</span>
  <span class="pm14-tot">/ ${esc(formatElapsed(RUN_T))}</span>
</div>
<div class="pm14-ruler" data-k="ruler">${ticks}</div>
<div class="pm14-track" data-k="track">${segs}<i class="pm14-playhead" data-k="playhead" style="left:${headP.toFixed(2)}%"></i></div>
<div class="pm14-cards" data-k="cards">${cards}</div>
<div class="pm14-hint">Hover a segment to inspect it · click to scrub the run there</div>
${completed ? ctx.workReceipt() : ''}</div>`;
  };

  /* ==================================================================
     15 — TERMINAL CAST
     ------------------------------------------------------------------
     asciinema. Each step echoes its command, which types itself with a
     steps() width animation and a block caret, then the output lines
     resolve one cascade beat apart and the exit status settles in after
     them. The transcript is a bottom-anchored flex column clipped at the
     top, which is exactly how a terminal scrolls.
     ================================================================== */

  const TYPE_MS = 17;                          // per character
  const HOST = 'pm@puppet-master';
  /* A two-line prompt, so the command always starts at column zero and
     the type-on can never reflow onto a second line halfway through. */
  const PS1 = `<div class="pm15-ps"><span class="pm15-ps1">${HOST}</span><span class="pm15-ps2">~/analytics</span><span class="pm15-git">feature/query-index</span></div>`;

  W[15] = (ctx) => {
    const { esc, D, index, step, running, completed, steps, commandForStep, formatElapsed } = ctx;

    /* The spawn step prints its children as job lines, which is what a
       cast would actually show -- see ownsAgents below. Each child takes
       two short lines rather than one long one, so no line can wrap at
       the narrow card width; the tail budget below counts lines, and a
       wrap it did not predict would push the transcript out of the box. */
    const pad = (v, n) => { v = String(v); return v.length >= n ? v : v + ' '.repeat(n - v.length); };
    const outLinesFor = (s) => s.kind !== 'agents' ? s.evidence
      : D.subagents.slice(0, 2).reduce((acc, a, i) => acc.concat([
        `[${i + 1}] ${pad(a.id, 15)}${pad(a.status, 9)}${String(a.progress).padStart(3)}%`,
        `    ${a.current}`
      ]), []);

    /* A terminal shows its tail. Bottom-anchoring an overflowing flex
       column would let the oldest lines spill UP out of the window and
       land on the card header, so instead: measure how many whole blocks
       fit in the window and render only those. LH / BLK_PAD / WIN mirror
       the CSS, and every line above is short enough not to wrap, so the
       arithmetic is exact at both the 367px and 570px card widths. */
    const LH = 15, BLK_PAD = 7, WIN = 300 - 16;   /* == CSS max-height - padding */
    const blockPx = (s) => (3 + outLinesFor(s).length) * LH + BLK_PAD;
    const tailPx = completed ? 4 * LH + BLK_PAD : (running ? 0 : 2 * LH + BLK_PAD);
    let budget = WIN - tailPx, first = index;
    for (let i = index; i >= 0; i--) {
      const h = blockPx(steps[i]);
      if (i !== index && h > budget) break;
      budget -= h; first = i;
    }

    const blocks = [];
    for (let i = first; i <= index; i++) {
      const s = steps[i];
      const cmd = commandForStep(s);
      const live = i === index && !completed;
      const n = Math.max(1, cmd.length);
      const d0 = `${n * TYPE_MS}ms`;
      const out = outLinesFor(s).map((e, j) =>
        `<div class="pm15-out ${live ? 'in' : ''}" data-k="o:${esc(s.id)}:${j}" style="--d0:${d0};--i:${j}">` +
        `<span class="pm15-pfx">·</span>${esc(e)}</div>`).join('');
      blocks.push(
        `<div class="pm15-blk ${live ? 'live' : 'done'}" data-k="b:${esc(s.id)}">
          ${PS1}
          <div class="pm15-cmd"><span class="pm15-dollar">$</span>` +
        (live
          ? `<span class="pm15-type" data-k="ty:${esc(s.id)}" style="--n:${n}">${esc(cmd)}</span><i class="pm15-caret" data-k="caret"></i>`
          : `<span class="pm15-txt">${esc(cmd)}</span>`) +
        `</div>${out}
          <div class="pm15-exit ${live ? 'in' : ''}" data-k="x:${esc(s.id)}" style="--d0:${d0};--i:${outLinesFor(s).length}">
            <span class="pm15-ok">exit 0</span><span class="pm15-el">${DUR[i]}.0s</span>
            <span class="pm15-sp"></span><span class="pm15-at">t+${clockAt(CUM[i])}</span>
          </div>
        </div>`);
    }

    if (completed) {
      blocks.push(
        `<div class="pm15-blk tail" data-k="b:receipt">
          ${PS1}
          <div class="pm15-cmd"><span class="pm15-dollar">$</span><span class="pm15-txt">pm receipt --run 0043</span></div>
          <div class="pm15-out" data-k="o:receipt:0"><span class="pm15-pfx">·</span>worked ${esc(formatElapsed(RUN_T))} · 14 tools · 3 files · 2 agents · 42 tests · 2 artifacts</div>
          <div class="pm15-exit" data-k="x:receipt"><span class="pm15-ok">exit 0</span><span class="pm15-el">0.1s</span><span class="pm15-sp"></span><span class="pm15-at">t+${clockAt(RUN_T)}</span></div>
        </div>`);
    } else if (!running) {
      blocks.push(`<div class="pm15-blk tail" data-k="b:idle">${PS1}<div class="pm15-cmd"><span class="pm15-dollar">$</span><i class="pm15-caret idle" data-k="caret-idle"></i></div></div>`);
    }

    return `<div class="pm15" data-k="pm15">
<div class="pm15-bar">
  <span class="pm15-title">cast · ${esc(HOST)}</span>
  <span class="pm15-sp"></span>
  <span>${esc(formatElapsed(ctx.elapsed))}</span>
  <span class="pm15-div">|</span>
  <span>96x24</span>
  <span class="pm15-div">|</span>
  <span class="pm15-rec ${running ? 'on' : ''}">${running ? 'REC' : completed ? 'END' : 'IDLE'}</span>
</div>
<div class="pm15-scroll ${first > 0 ? 'scrolled' : ''}" data-k="cast">${blocks.join('')}</div>
</div>`;
  };

  /* The cast prints its own job table on the spawn step, so the shared
     inline agent card must not also be appended under the terminal.
     Takes 13 and 14 both carry prose already and use the shared list. */
  W[15].ownsAgents = true;

  void M;
})();
