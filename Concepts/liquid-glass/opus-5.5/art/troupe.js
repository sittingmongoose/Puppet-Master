/* The troupe, redrawn (pm7-liquid-glass, Opus 5.5, 2026-10-12): the onboarding art's marionettes as one rigged
 * skeleton with four materials. Jared, 2026-10-11: "I also would like to redesign how the images/animations look on
 * the onboarding left side graphics. I think you can do a better design. On top of that, their limbs are currently not
 * really connected well to the bodies."
 *
 * Why the limbs now stay on:
 *  - every limb is a chain that shares its joints: shoulder to elbow to wrist, hip to knee to ankle. The segments are
 *    drawn between the very same points the joints are drawn at, every frame, so nothing can come apart;
 *  - a real marionette rig: each puppet hangs from three strings (head and both hands) on the puppeteer's cross. The
 *    cross tilts and bobs; the hands follow their strings with a spring; elbows and knees are solved by two-bone
 *    inverse kinematics, bending outward like a wooden puppet's; the feet stay planted on the stage.
 *
 * One skeleton, four materials (NieR keeps its own units):
 *   glass    crystal segments with an inner light, specular edges and light-filament strings
 *   friendly a Mii-like paper puppet: round head, rosy cheeks, soft pastel limbs with a white sticker edge, the dot field
 *   basic    a blueprint: outlined segments, joint circles with centre marks, live joint angles on dimension leaders
 *   retro    a pixel sprite on a 4 px grid, drawn on a stepped 10 fps clock in phosphor colours
 *
 * API: Troupe.mount(svgEl, { family, mode, scene, reduced }) -> controller { set(opts), destroy() }.
 * Canvas 480 x 600 (the onboarding art pane). Vector shapes and transforms only: portable to Slint paths.
 */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const W = 480, H = 600;
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const f1 = (v) => (Math.round(v * 10) / 10).toString();

  /* ---- the skeleton --------------------------------------------------------------------------------------------- */
  const BONE = { upper: 18, fore: 16, thigh: 20, shin: 19, neck: 7, spine: 30, hipW: 7.5, shoulderW: 14, headR: 16 };
  /* two-bone IK: from root A toward target T with segment lengths l1, l2; bend +1/-1 picks the side the joint bows to.
     Returns the joint and the reachable end (the target, pulled in if out of reach). */
  function ik(ax, ay, tx, ty, l1, l2, bend) {
    let dx = tx - ax, dy = ty - ay, d = Math.hypot(dx, dy) || 0.0001;
    const dmax = l1 + l2 - 0.01, dmin = Math.abs(l1 - l2) + 0.01;
    if (d > dmax) { tx = ax + dx / d * dmax; ty = ay + dy / d * dmax; dx = tx - ax; dy = ty - ay; d = dmax; }
    if (d < dmin) { tx = ax + dx / d * dmin; ty = ay + dy / d * dmin; dx = tx - ax; dy = ty - ay; d = dmin; }
    const a = Math.atan2(dy, dx), c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), A = Math.acos(c), g = a + bend * A;
    return { jx: ax + Math.cos(g) * l1, jy: ay + Math.sin(g) * l1, ex: tx, ey: ty };
  }
  const angleAt = (ax, ay, jx, jy, ex, ey) => { const v1x = ax - jx, v1y = ay - jy, v2x = ex - jx, v2y = ey - jy; return Math.round(Math.acos(clamp((v1x * v2x + v1y * v2y) / (Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y) || 1), -1, 1)) * 180 / Math.PI); };

  /* ---- poses: where each hand wants to be, relative to its shoulder, and how the body carries itself ---------------- */
  const POSES = {
    stand: { l: [-6, 30], r: [6, 30], lean: 0 },
    wave: { l: [-6, 30], r: [10, -30], lean: -2, wave: 1 },
    point: { l: [-5, 30], r: [32, -2], lean: 3 },
    carry: { l: [6, 22], r: [-6, 22], lean: 0, carry: 1 },
    cheer: { l: [-14, -30], r: [14, -30], lean: 0, hop: 1 },
    think: { l: [-6, 30], r: [-8, -8], lean: -3 },
  };

  /* ---- materials ---------------------------------------------------------------------------------------------------
     Each material gets the group it draws into and returns update(pts, t) that redraws the puppet from the solved
     points. pts: head, neck, chest, pelvis, shoulders, elbows, hands, hips, knees, feet, tint index. */
  const TINTS = {
    glass: ['#A9C8FF', '#F6A8D9', '#8FE8D2', '#FFD08A'],
    friendly: ['#7CC7F2', '#F79FC4', '#7FD8B6', '#FFC86B'],
    basic: ['#6FB2FF', '#6FB2FF', '#6FB2FF', '#6FB2FF'],
    retro: ['#7CFF9A', '#FFB86B', '#7CFFEA', '#FF7AC8'],
  };
  function defs(svg, family, mode) {
    const d = mk('defs', {}, svg);
    if (family === 'glass') {
      const g = mk('linearGradient', { id: 'tg-glass', x1: '0', y1: '0', x2: '1', y2: '1' }, d);
      mk('stop', { offset: '0', 'stop-color': '#FFFFFF', 'stop-opacity': mode === 'dark' ? '.42' : '.85' }, g);
      mk('stop', { offset: '.5', 'stop-color': '#FFFFFF', 'stop-opacity': mode === 'dark' ? '.10' : '.35' }, g);
      mk('stop', { offset: '1', 'stop-color': '#FFFFFF', 'stop-opacity': mode === 'dark' ? '.22' : '.55' }, g);
      const core = mk('radialGradient', { id: 'tg-core' }, d);
      mk('stop', { offset: '0', 'stop-color': '#FFFFFF', 'stop-opacity': '.95' }, core); mk('stop', { offset: '.4', 'stop-color': '#FFFFFF', 'stop-opacity': '.35' }, core); mk('stop', { offset: '1', 'stop-color': '#FFFFFF', 'stop-opacity': '0' }, core);
    }
    if (family === 'friendly') {
      const p = mk('pattern', { id: 'tg-dots', width: '9', height: '9', patternUnits: 'userSpaceOnUse' }, d);
      mk('circle', { cx: '4.5', cy: '4.5', r: '1.15', fill: '#FFFFFF', 'fill-opacity': '.55' }, p);
      const ground = mk('pattern', { id: 'tg-ground', width: '18', height: '18', patternUnits: 'userSpaceOnUse' }, d);
      mk('circle', { cx: '9', cy: '9', r: '1.4', fill: mode === 'dark' ? 'rgba(200,190,225,.16)' : 'rgba(122,109,140,.22)' }, ground);
    }
    return d;
  }

  function glassMaterial(g, tint, mode) {
    const edge = mode === 'dark' ? 'rgba(255,255,255,.62)' : 'rgba(40,60,110,.38)';
    const glowCol = tint;
    const shade = mk('ellipse', { rx: '20', ry: '4.5', fill: mode === 'dark' ? 'rgba(0,0,0,.45)' : 'rgba(30,45,90,.16)' }, g);
    const aura = mk('circle', { r: '36', fill: glowCol, opacity: mode === 'dark' ? '.16' : '.12' }, g);
    const limb = (w) => { const grp = mk('g', {}, g); const a = mk('path', { fill: 'none', stroke: edge, 'stroke-width': w + 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, grp); const b = mk('path', { fill: 'none', stroke: 'url(#tg-glass)', 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, grp); const c = mk('path', { fill: 'none', stroke: glowCol, 'stroke-width': w * 0.32, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: '.75' }, grp); return (d) => { a.setAttribute('d', d); b.setAttribute('d', d); c.setAttribute('d', d); }; };
    const legs = [limb(6.5), limb(6.5)], arms = [limb(6), limb(6)];
    const pelvis = mk('rect', { width: '22', height: '11', rx: '5.5', fill: 'url(#tg-glass)', stroke: edge, 'stroke-width': '1.2' }, g);
    const torso = mk('path', { fill: 'url(#tg-glass)', stroke: edge, 'stroke-width': '1.3' }, g);
    const core = mk('circle', { r: '9', fill: 'url(#tg-core)' }, g);
    const coreDot = mk('circle', { r: '3', fill: '#FFFFFF' }, g);
    const torsoHi = mk('path', { fill: 'none', stroke: 'rgba(255,255,255,.85)', 'stroke-width': '1.4', 'stroke-linecap': 'round' }, g);
    const neck = mk('path', { fill: 'none', stroke: edge, 'stroke-width': '6', 'stroke-linecap': 'round' }, g);
    const head = mk('circle', { r: BONE.headR, fill: 'url(#tg-glass)', stroke: edge, 'stroke-width': '1.3' }, g);
    const headHi = mk('path', { fill: 'none', stroke: 'rgba(255,255,255,.9)', 'stroke-width': '1.6', 'stroke-linecap': 'round' }, g);
    const eyes = [mk('ellipse', { rx: '2', ry: '2.6', fill: mode === 'dark' ? '#FFFFFF' : '#1B2340' }, g), mk('ellipse', { rx: '2', ry: '2.6', fill: mode === 'dark' ? '#FFFFFF' : '#1B2340' }, g)];
    const joints = []; for (let i = 0; i < 8; i++) joints.push(mk('circle', { r: '3.3', fill: '#FFFFFF', stroke: glowCol, 'stroke-width': '1.4' }, g));
    const hands = [mk('circle', { r: '4.6', fill: 'url(#tg-glass)', stroke: edge, 'stroke-width': '1.2' }, g), mk('circle', { r: '4.6', fill: 'url(#tg-glass)', stroke: edge, 'stroke-width': '1.2' }, g)];
    const feet = [mk('ellipse', { rx: '7', ry: '3.4', fill: 'url(#tg-glass)', stroke: edge, 'stroke-width': '1.2' }, g), mk('ellipse', { rx: '7', ry: '3.4', fill: 'url(#tg-glass)', stroke: edge, 'stroke-width': '1.2' }, g)];
    return (P, t) => {
      shade.setAttribute('cx', f1(P.base[0])); shade.setAttribute('cy', f1(P.base[1] + 2));
      aura.setAttribute('cx', f1(P.chest[0])); aura.setAttribute('cy', f1(P.chest[1] + 6)); aura.setAttribute('opacity', (mode === 'dark' ? 0.14 : 0.1) + 0.05 * Math.sin(t / 900 + P.seed));
      for (let s = 0; s < 2; s++) {
        legs[s](`M${f1(P.hips[s][0])} ${f1(P.hips[s][1])} L${f1(P.knees[s][0])} ${f1(P.knees[s][1])} L${f1(P.feet[s][0])} ${f1(P.feet[s][1])}`);
        arms[s](`M${f1(P.shoulders[s][0])} ${f1(P.shoulders[s][1])} L${f1(P.elbows[s][0])} ${f1(P.elbows[s][1])} L${f1(P.hands[s][0])} ${f1(P.hands[s][1])}`);
        hands[s].setAttribute('cx', f1(P.hands[s][0])); hands[s].setAttribute('cy', f1(P.hands[s][1]));
        feet[s].setAttribute('cx', f1(P.feet[s][0] + (s ? 2 : -2))); feet[s].setAttribute('cy', f1(P.feet[s][1] + 1));
      }
      pelvis.setAttribute('x', f1(P.pelvis[0] - 11)); pelvis.setAttribute('y', f1(P.pelvis[1] - 5.5));
      torso.setAttribute('d', torsoPath(P)); torsoHi.setAttribute('d', `M${f1(P.shoulders[0][0] + 4)} ${f1(P.shoulders[0][1] + 3)} Q${f1(P.chest[0] - 2)} ${f1(P.chest[1] - 6)} ${f1(P.chest[0] + 5)} ${f1(P.chest[1] - 6)}`);
      core.setAttribute('cx', f1(P.chest[0])); core.setAttribute('cy', f1(P.chest[1] + 9)); coreDot.setAttribute('cx', f1(P.chest[0])); coreDot.setAttribute('cy', f1(P.chest[1] + 9));
      coreDot.setAttribute('opacity', 0.75 + 0.25 * Math.sin(t / 520 + P.seed));
      neck.setAttribute('d', `M${f1(P.neck[0])} ${f1(P.neck[1])} L${f1(P.chest[0])} ${f1(P.chest[1] - 12)}`);
      head.setAttribute('cx', f1(P.head[0])); head.setAttribute('cy', f1(P.head[1]));
      headHi.setAttribute('d', `M${f1(P.head[0] - 10)} ${f1(P.head[1] - 5)} A11 11 0 0 1 ${f1(P.head[0] - 1)} ${f1(P.head[1] - 12)}`);
      eyes.forEach((e, i) => { e.setAttribute('cx', f1(P.head[0] + (i ? 5.5 : -5.5) + P.look * 2)); e.setAttribute('cy', f1(P.head[1] + 1)); e.setAttribute('ry', P.blink ? '0.5' : '2.6'); });
      const J = [P.shoulders[0], P.shoulders[1], P.elbows[0], P.elbows[1], P.hips[0], P.hips[1], P.knees[0], P.knees[1]];
      joints.forEach((j, i) => { j.setAttribute('cx', f1(J[i][0])); j.setAttribute('cy', f1(J[i][1])); });
    };
  }
  function torsoPath(P) {
    /* a rounded bean between the shoulders and the pelvis, following the spine's lean */
    const [l, r] = P.shoulders, pl = [P.pelvis[0] - 10, P.pelvis[1] - 3], pr = [P.pelvis[0] + 10, P.pelvis[1] - 3];
    return `M${f1(l[0])} ${f1(l[1] - 2)} Q${f1(P.chest[0])} ${f1(P.chest[1] - 15)} ${f1(r[0])} ${f1(r[1] - 2)} Q${f1(r[0] + 5)} ${f1((r[1] + pr[1]) / 2)} ${f1(pr[0])} ${f1(pr[1])} Q${f1(P.pelvis[0])} ${f1(P.pelvis[1] + 4)} ${f1(pl[0])} ${f1(pl[1])} Q${f1(l[0] - 5)} ${f1((l[1] + pl[1]) / 2)} ${f1(l[0])} ${f1(l[1] - 2)} Z`;
  }

  function friendlyMaterial(g, tint, mode) {
    const ink = mode === 'dark' ? '#2A2433' : '#4A4550', sticker = mode === 'dark' ? '#F4EEF8' : '#FFFFFF';
    const shade = mk('ellipse', { rx: '22', ry: '5', fill: mode === 'dark' ? 'rgba(0,0,0,.4)' : 'rgba(122,109,140,.22)' }, g);
    const limb = (w, col) => { const grp = mk('g', {}, g); const a = mk('path', { fill: 'none', stroke: sticker, 'stroke-width': w + 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, grp); const b = mk('path', { fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, grp); return (d) => { a.setAttribute('d', d); b.setAttribute('d', d); }; };
    const legs = [limb(8, ink), limb(8, ink)], arms = [limb(7.5, tint), limb(7.5, tint)];
    const torso = mk('path', { fill: tint, stroke: sticker, 'stroke-width': '3.5', 'stroke-linejoin': 'round' }, g);
    const dots = mk('path', { fill: 'url(#tg-dots)' }, g);
    const neck = mk('path', { fill: 'none', stroke: '#FFE2C8', 'stroke-width': '7', 'stroke-linecap': 'round' }, g);
    const head = mk('circle', { r: BONE.headR + 2, fill: '#FFE6CF', stroke: sticker, 'stroke-width': '3.5' }, g);
    const hair = mk('path', { fill: ink }, g);
    const eyes = [mk('ellipse', { rx: '2.1', ry: '3', fill: ink }, g), mk('ellipse', { rx: '2.1', ry: '3', fill: ink }, g)];
    const cheeks = [mk('ellipse', { rx: '3.6', ry: '2.2', fill: '#FF9FB8', opacity: '.7' }, g), mk('ellipse', { rx: '3.6', ry: '2.2', fill: '#FF9FB8', opacity: '.7' }, g)];
    const smile = mk('path', { fill: 'none', stroke: ink, 'stroke-width': '1.8', 'stroke-linecap': 'round' }, g);
    const hands = [mk('circle', { r: '5.2', fill: '#FFE6CF', stroke: sticker, 'stroke-width': '2.5' }, g), mk('circle', { r: '5.2', fill: '#FFE6CF', stroke: sticker, 'stroke-width': '2.5' }, g)];
    const feet = [mk('ellipse', { rx: '8', ry: '4.2', fill: ink, stroke: sticker, 'stroke-width': '2.5' }, g), mk('ellipse', { rx: '8', ry: '4.2', fill: ink, stroke: sticker, 'stroke-width': '2.5' }, g)];
    return (P, t) => {
      shade.setAttribute('cx', f1(P.base[0])); shade.setAttribute('cy', f1(P.base[1] + 3));
      for (let s = 0; s < 2; s++) {
        legs[s](`M${f1(P.hips[s][0])} ${f1(P.hips[s][1])} Q${f1(P.knees[s][0])} ${f1(P.knees[s][1])} ${f1(P.feet[s][0])} ${f1(P.feet[s][1])}`);
        arms[s](`M${f1(P.shoulders[s][0])} ${f1(P.shoulders[s][1])} Q${f1(P.elbows[s][0])} ${f1(P.elbows[s][1])} ${f1(P.hands[s][0])} ${f1(P.hands[s][1])}`);
        hands[s].setAttribute('cx', f1(P.hands[s][0])); hands[s].setAttribute('cy', f1(P.hands[s][1]));
        feet[s].setAttribute('cx', f1(P.feet[s][0] + (s ? 2.5 : -2.5))); feet[s].setAttribute('cy', f1(P.feet[s][1] + 1.5));
      }
      const tp = torsoPath(P); torso.setAttribute('d', tp); dots.setAttribute('d', tp);
      neck.setAttribute('d', `M${f1(P.neck[0])} ${f1(P.neck[1])} L${f1(P.chest[0])} ${f1(P.chest[1] - 12)}`);
      const hx = P.head[0], hy = P.head[1];
      head.setAttribute('cx', f1(hx)); head.setAttribute('cy', f1(hy));
      hair.setAttribute('d', `M${f1(hx - 17)} ${f1(hy - 2)} Q${f1(hx - 16)} ${f1(hy - 21)} ${f1(hx)} ${f1(hy - 19)} Q${f1(hx + 16)} ${f1(hy - 21)} ${f1(hx + 17)} ${f1(hy - 2)} Q${f1(hx + 9)} ${f1(hy - 11)} ${f1(hx - 2)} ${f1(hy - 10)} Q${f1(hx - 11)} ${f1(hy - 10)} ${f1(hx - 17)} ${f1(hy - 2)} Z`);
      eyes.forEach((e, i) => { e.setAttribute('cx', f1(hx + (i ? 6 : -6) + P.look * 2)); e.setAttribute('cy', f1(hy + 1)); e.setAttribute('ry', P.blink ? '0.6' : '3'); });
      cheeks.forEach((c, i) => { c.setAttribute('cx', f1(hx + (i ? 10 : -10))); c.setAttribute('cy', f1(hy + 6.5)); });
      const sm = P.happy ? 4.5 : 2.5;
      smile.setAttribute('d', `M${f1(hx - 4)} ${f1(hy + 7)} Q${f1(hx)} ${f1(hy + 7 + sm)} ${f1(hx + 4)} ${f1(hy + 7)}`);
    };
  }

  function basicMaterial(g, tint, mode, opts) {
    const line = mode === 'dark' ? '#8EC2FF' : '#1F5FB8', faint = mode === 'dark' ? 'rgba(142,194,255,.35)' : 'rgba(31,95,184,.35)', paper = mode === 'dark' ? '#0B1830' : '#F4F8FF';
    const strokeW = 1.5;
    const seg = () => mk('path', { fill: paper, stroke: line, 'stroke-width': strokeW, 'stroke-linejoin': 'round' }, g);
    const capsule = (a, b, w) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2;
      return `M${f1(a[0] + nx)} ${f1(a[1] + ny)} L${f1(b[0] + nx)} ${f1(b[1] + ny)} A${w / 2} ${w / 2} 0 0 1 ${f1(b[0] - nx)} ${f1(b[1] - ny)} L${f1(a[0] - nx)} ${f1(a[1] - ny)} A${w / 2} ${w / 2} 0 0 1 ${f1(a[0] + nx)} ${f1(a[1] + ny)} Z`; };
    const shade = mk('line', { stroke: faint, 'stroke-width': '1', 'stroke-dasharray': '3 3' }, g);
    const parts = { thigh: [seg(), seg()], shin: [seg(), seg()], upper: [seg(), seg()], fore: [seg(), seg()] };
    const pelvis = mk('rect', { width: '22', height: '11', rx: '3', fill: paper, stroke: line, 'stroke-width': strokeW }, g);
    const torso = mk('path', { fill: paper, stroke: line, 'stroke-width': strokeW }, g);
    const centre = mk('path', { fill: 'none', stroke: faint, 'stroke-width': '1', 'stroke-dasharray': '4 2 1 2' }, g);
    const head = mk('circle', { r: BONE.headR, fill: paper, stroke: line, 'stroke-width': strokeW }, g);
    const cross = mk('path', { fill: 'none', stroke: faint, 'stroke-width': '1' }, g);
    const eyes = [mk('circle', { r: '1.8', fill: line }, g), mk('circle', { r: '1.8', fill: line }, g)];
    const joints = []; for (let i = 0; i < 8; i++) { const c = mk('circle', { r: '3.6', fill: paper, stroke: line, 'stroke-width': '1.2' }, g); const d = mk('circle', { r: '0.9', fill: line }, g); joints.push([c, d]); }
    const hands = [mk('circle', { r: '4.4', fill: paper, stroke: line, 'stroke-width': strokeW }, g), mk('circle', { r: '4.4', fill: paper, stroke: line, 'stroke-width': strokeW }, g)];
    const feet = [mk('rect', { width: '13', height: '5', rx: '2', fill: paper, stroke: line, 'stroke-width': strokeW }, g), mk('rect', { width: '13', height: '5', rx: '2', fill: paper, stroke: line, 'stroke-width': strokeW }, g)];
    /* the live measurement: the elbow angle of the busiest arm, on a dimension leader */
    const lead = mk('path', { fill: 'none', stroke: faint, 'stroke-width': '1' }, g);
    const label = mk('text', { 'font-family': 'IBM Plex Mono, ui-monospace, monospace', 'font-size': '8.5', fill: line, 'letter-spacing': '.6' }, g);
    return (P) => {
      shade.setAttribute('x1', f1(P.base[0] - 24)); shade.setAttribute('x2', f1(P.base[0] + 24)); shade.setAttribute('y1', f1(P.base[1] + 3)); shade.setAttribute('y2', f1(P.base[1] + 3));
      for (let s = 0; s < 2; s++) {
        parts.thigh[s].setAttribute('d', capsule(P.hips[s], P.knees[s], 7)); parts.shin[s].setAttribute('d', capsule(P.knees[s], P.feet[s], 6.5));
        parts.upper[s].setAttribute('d', capsule(P.shoulders[s], P.elbows[s], 6.5)); parts.fore[s].setAttribute('d', capsule(P.elbows[s], P.hands[s], 6));
        hands[s].setAttribute('cx', f1(P.hands[s][0])); hands[s].setAttribute('cy', f1(P.hands[s][1]));
        feet[s].setAttribute('x', f1(P.feet[s][0] - 6.5 + (s ? 2 : -2))); feet[s].setAttribute('y', f1(P.feet[s][1] - 1.5));
      }
      pelvis.setAttribute('x', f1(P.pelvis[0] - 11)); pelvis.setAttribute('y', f1(P.pelvis[1] - 5.5));
      torso.setAttribute('d', torsoPath(P));
      centre.setAttribute('d', `M${f1(P.pelvis[0])} ${f1(P.pelvis[1] + 6)} L${f1(P.chest[0])} ${f1(P.chest[1] - 14)} L${f1(P.head[0])} ${f1(P.head[1] - BONE.headR - 6)}`);
      head.setAttribute('cx', f1(P.head[0])); head.setAttribute('cy', f1(P.head[1]));
      cross.setAttribute('d', `M${f1(P.head[0] - 5)} ${f1(P.head[1] + 9)} L${f1(P.head[0] + 5)} ${f1(P.head[1] + 9)}`);
      eyes.forEach((e, i) => { e.setAttribute('cx', f1(P.head[0] + (i ? 5.5 : -5.5) + P.look * 2)); e.setAttribute('cy', f1(P.head[1] + 1)); });
      const J = [P.shoulders[0], P.shoulders[1], P.elbows[0], P.elbows[1], P.hips[0], P.hips[1], P.knees[0], P.knees[1]];
      joints.forEach((j, i) => { j[0].setAttribute('cx', f1(J[i][0])); j[0].setAttribute('cy', f1(J[i][1])); j[1].setAttribute('cx', f1(J[i][0])); j[1].setAttribute('cy', f1(J[i][1])); });
      const s = P.busy, e = P.elbows[s], ang = angleAt(P.shoulders[s][0], P.shoulders[s][1], e[0], e[1], P.hands[s][0], P.hands[s][1]);
      /* the leader goes to the puppet's outer side, away from its neighbours */
      const out = P.outward || (s ? 1 : -1), lx = e[0] + out * 22, ly = e[1] - 30;
      lead.setAttribute('d', `M${f1(e[0])} ${f1(e[1])} L${f1(lx)} ${f1(ly)} L${f1(lx + out * 30)} ${f1(ly)}`);
      label.setAttribute('text-anchor', out > 0 ? 'start' : 'end'); label.setAttribute('x', f1(lx + out * 2)); label.setAttribute('y', f1(ly - 3)); label.textContent = (s ? 'R' : 'L') + ' ELBOW ' + ang + '°';
      const show = opts.labels && P.labelled; label.setAttribute('opacity', show ? '1' : '0'); lead.setAttribute('opacity', show ? '1' : '0');
    };
  }

  function retroMaterial(g, tint, mode) {
    /* a pixel sprite: every part is rasterised onto a 4 px grid each step (10 fps), so it moves like a sprite */
    const PX = 4, ink = tint, dim = mode === 'dark' ? '#0E2A14' : '#C9D8C0', face = mode === 'dark' ? '#08130A' : '#F4F1E6';
    const layer = mk('g', { 'shape-rendering': 'crispEdges' }, g);
    let pool = [], used = 0;
    const px = (x, y, c) => { let r = pool[used]; if (!r) { r = mk('rect', { width: PX, height: PX }, layer); pool.push(r); } r.setAttribute('x', Math.round(x / PX) * PX); r.setAttribute('y', Math.round(y / PX) * PX); r.setAttribute('fill', c); r.removeAttribute('display'); used++; };
    const lineP = (a, b, w, c) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (PX * 0.8)); for (let i = 0; i <= n; i++) { const x = lerp(a[0], b[0], i / n), y = lerp(a[1], b[1], i / n); for (let k = 0; k < w; k++) px(x + (k - (w - 1) / 2) * PX * 0.9, y, c); } };
    const disc = (cx, cy, r, c) => { for (let y = -r; y <= r; y += PX) for (let x = -r; x <= r; x += PX) if (x * x + y * y <= r * r) px(cx + x, cy + y, c); };
    return (P) => {
      used = 0;
      for (let x = -20; x <= 20; x += PX) px(P.base[0] + x, P.base[1] + 4, dim);
      for (let s = 0; s < 2; s++) { lineP(P.hips[s], P.knees[s], 2, ink); lineP(P.knees[s], P.feet[s], 2, ink); px(P.feet[s][0] + (s ? 4 : -4), P.feet[s][1], ink); px(P.feet[s][0] + (s ? 8 : -8), P.feet[s][1], ink); }
      for (let y = P.chest[1] - 12; y <= P.pelvis[1]; y += PX) { const half = y < P.chest[1] + 4 ? 12 : 9; for (let x = -half; x <= half; x += PX) px(P.chest[0] + (y - P.chest[1]) * 0.05 + x, y, ink); }
      px(P.chest[0], P.chest[1] + 4, face); px(P.chest[0] - 4, P.chest[1] + 4, face);
      for (let s = 0; s < 2; s++) { lineP(P.shoulders[s], P.elbows[s], 2, ink); lineP(P.elbows[s], P.hands[s], 2, ink); disc(P.hands[s][0], P.hands[s][1], 4, ink); }
      disc(P.head[0], P.head[1], 15, ink); disc(P.head[0], P.head[1] + 1, 10, face);
      px(P.head[0] - 5 + P.look * 4, P.head[1], P.blink ? face : ink); px(P.head[0] + 5 + P.look * 4, P.head[1], P.blink ? face : ink);
      for (let i = used; i < pool.length; i++) pool[i].setAttribute('display', 'none');
    };
  }

  /* ---- scenes -------------------------------------------------------------------------------------------------------
     Three puppets on a stage under one cross. Each puppet: x on stage, pose, tint. */
  const SCENES = {
    welcome: { title: 'Welcome', puppets: [{ x: -118, pose: 'wave' }, { x: 0, pose: 'carry' }, { x: 118, pose: 'stand' }], card: 'the plan' },
    ready: { title: 'Ready', puppets: [{ x: -118, pose: 'cheer' }, { x: 0, pose: 'cheer' }, { x: 118, pose: 'cheer' }], confetti: true },
    computer: { title: 'Computer', puppets: [{ x: -132, pose: 'point' }, { x: 132, pose: 'think' }], screen: true },
  };

  function mount(svg, opts) {
    opts = Object.assign({ family: 'glass', mode: 'dark', scene: 'welcome', reduced: false, labels: true }, opts || {});
    let raf = 0, alive = true, last = 0, lastStep = 0;
    const build = () => {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('data-family', opts.family); svg.setAttribute('data-mode', opts.mode);
      defs(svg, opts.family, opts.mode);
      const fam = opts.family, mode = opts.mode, sc = SCENES[opts.scene] || SCENES.welcome;
      const world = mk('g', {}, svg);
      drawBackdrop(world, fam, mode);
      const stageY = 486, cx = W / 2;
      drawStage(world, fam, mode, cx, stageY);
      const stringsG = mk('g', {}, world), barG = mk('g', {}, world), troupeG = mk('g', {}, world), propsG = mk('g', {}, world);
      const SC = { glass: 1.55, friendly: 1.5, basic: 1.5, retro: 1.45 }[fam];
      const strCol = fam === 'glass' ? null : fam === 'friendly' ? (mode === 'dark' ? 'rgba(244,238,248,.55)' : 'rgba(74,69,80,.45)') : fam === 'basic' ? (mode === 'dark' ? 'rgba(142,194,255,.6)' : 'rgba(31,95,184,.55)') : null;
      const bar = drawBar(barG, fam, mode);
      const puppets = sc.puppets.map((pp, i) => {
        const tint = TINTS[fam][(i + (sc.puppets.length === 2 ? 1 : 0)) % 4];
        const g = mk('g', { transform: `translate(${cx + pp.x} ${stageY}) scale(${SC}) translate(${-(cx + pp.x)} ${-stageY})` }, troupeG);
        const draw = fam === 'glass' ? glassMaterial(g, tint, mode) : fam === 'friendly' ? friendlyMaterial(g, tint, mode) : fam === 'basic' ? basicMaterial(g, tint, mode, opts) : retroMaterial(g, tint, mode);
        const strings = [0, 1, 2].map(() => fam === 'glass' ? glassString(stringsG, tint, mode) : fam === 'retro' ? retroString(stringsG, TINTS.retro[i % 4], mode) : plainString(stringsG, strCol));
        return { pp, tint, draw, strings, state: { hand: [[0, 0], [0, 0]], vel: [[0, 0], [0, 0]], init: false }, seed: i * 1.7, x: cx + pp.x, i, sc: SC };
      });
      const prop = sc.card ? drawCard(propsG, fam, mode, sc.card) : null;
      const confetti = sc.confetti ? drawConfetti(world, fam, mode) : null;
      const screen = sc.screen ? drawScreen(propsG, fam, mode, cx, stageY) : null;
      return { bar, puppets, prop, confetti, stageY, cx, sc, fam, mode, screen };
    };
    let S = build();

    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const retro = S.fam === 'retro';
      if (retro) { if (now - lastStep < 100) return; lastStep = now; }
      const t = opts.reduced ? 0 : now, dt = Math.min(0.05, (now - (last || now)) / 1000) || 0.016; last = now;
      /* the cross: a slow tilt and bob (the puppeteer's hand), quicker and bouncier for Friendly, slower for Glass */
      const feel = { glass: [2.2, 7600, 3], friendly: [3.4, 3800, 2.6], basic: [1.6, 6400, 1.6], retro: [2.4, 4200, 4] }[S.fam];
      const tilt = Math.sin(t / feel[1] * Math.PI * 2) * feel[0], bob = Math.sin(t / (feel[1] * 0.5) * Math.PI * 2) * feel[2];
      const barX = S.cx, barY = 150 + bob;
      S.bar.place(barX, barY, tilt);
      const rad = tilt * Math.PI / 180;
      const barPt = (dx, dy) => [barX + dx * Math.cos(rad) - dy * Math.sin(rad), barY + dx * Math.sin(rad) + dy * Math.cos(rad)];
      const hopAll = S.sc.confetti ? Math.max(0, Math.sin(t / 380 * Math.PI)) : 0;
      S.puppets.forEach((p, idx) => {
        const pose = POSES[p.pp.pose] || POSES.stand, n = S.puppets.length;
        const hop = pose.hop ? Math.pow(Math.max(0, Math.sin((t / 420 + idx * 0.33) * Math.PI)), 1.6) * 14 : 0;
        const breathe = Math.sin(t / 1300 + p.seed) * 1.3;
        const baseX = p.x, baseY = S.stageY;
        /* the cross carries the whole puppet a little (head string) */
        const sway = tilt * 0.9 * ((p.x - S.cx) / 120 || 0.3);
        const pelvis = [baseX + sway * 0.4 + pose.lean * 0.6, baseY - 40 - hop + breathe * 0.3];
        const leanRad = (pose.lean + sway * 0.6) * Math.PI / 180;
        const chest = [pelvis[0] + Math.sin(leanRad) * BONE.spine, pelvis[1] - Math.cos(leanRad) * BONE.spine + breathe * 0.4];
        const neck = [chest[0] + Math.sin(leanRad) * 12, chest[1] - 12 - BONE.neck * 0.4];
        const head = [neck[0] + Math.sin(leanRad) * 4 + Math.sin(t / 1700 + p.seed) * 1.2, neck[1] - BONE.headR + 2];
        const shoulders = [[chest[0] - BONE.shoulderW * Math.cos(leanRad), chest[1] - 5 - BONE.shoulderW * Math.sin(leanRad)], [chest[0] + BONE.shoulderW * Math.cos(leanRad), chest[1] - 5 + BONE.shoulderW * Math.sin(leanRad)]];
        const hips = [[pelvis[0] - BONE.hipW, pelvis[1] + 2], [pelvis[0] + BONE.hipW, pelvis[1] + 2]];
        const feet = [[baseX - 9, baseY - hop * 0.15], [baseX + 9, baseY - hop * 0.15]];
        if (hop > 0.5) { feet[0][1] = baseY - hop * 0.9; feet[1][1] = baseY - hop * 0.9; }
        /* hands: the pose's place, carried by the cross, plus a wave; they follow on a spring */
        const want = [0, 1].map((s) => {
          const o = s ? pose.r : pose.l; let x = shoulders[s][0] + o[0], y = shoulders[s][1] + o[1];
          x += tilt * 0.6; y += bob * 0.5;
          if (pose.wave && s === 1) { x += Math.sin(t / 210) * 7; y += Math.cos(t / 210) * 2; }
          if (pose.hop) y -= hop * 0.5;
          return [x, y];
        });
        const st = p.state;
        for (let s = 0; s < 2; s++) {
          if (!st.init) { st.hand[s] = want[s].slice(); }
          const k = S.fam === 'friendly' ? 160 : S.fam === 'glass' ? 70 : 110, c = S.fam === 'friendly' ? 9 : 12;
          for (let ax = 0; ax < 2; ax++) { const a = k * (want[s][ax] - st.hand[s][ax]) - c * st.vel[s][ax]; st.vel[s][ax] += a * dt; st.hand[s][ax] += st.vel[s][ax] * dt; }
          if (opts.reduced) { st.hand[s] = want[s].slice(); }
        }
        st.init = true;
        const arms = [0, 1].map((s) => ik(shoulders[s][0], shoulders[s][1], st.hand[s][0], st.hand[s][1], BONE.upper, BONE.fore, s ? -1 : 1));
        const legs = [0, 1].map((s) => ik(hips[s][0], hips[s][1], feet[s][0], feet[s][1], BONE.thigh, BONE.shin, s ? 1 : -1));
        const P = {
          head, neck, chest, pelvis, shoulders, hips,
          elbows: arms.map((a) => [a.jx, a.jy]), hands: arms.map((a) => [a.ex, a.ey]),
          knees: legs.map((l) => [l.jx, l.jy]), feet: legs.map((l) => [l.ex, l.ey]),
          base: [baseX, baseY], seed: p.seed, look: Math.sin(t / 2300 + p.seed) * 0.6,
          blink: !opts.reduced && ((t / 1000 + p.seed * 1.3) % 4.2) < 0.12, happy: !!pose.hop || !!pose.wave, busy: pose.wave || pose.point ? 1 : 0, labelled: !!(pose.wave || pose.point), outward: p.x < S.cx - 1 ? -1 : p.x > S.cx + 1 ? 1 : 0,
        };
        p.draw(P, t);
        /* the three strings: head to the cross's middle row, hands to its ends */
        const span = n === 3 ? 118 : 132, rel = (p.x - S.cx) / span;
        const ptsTop = [barPt(rel * 96, -2), barPt(rel * 96 - 26, 10), barPt(rel * 96 + 26, 10)];
        const wp = (pt) => [baseX + (pt[0] - baseX) * p.sc, baseY + (pt[1] - baseY) * p.sc];
        p.world = { hands: P.hands.map(wp), head: wp(head) };
        const ptsBot = [wp([head[0], head[1] - BONE.headR - 2]), p.world.hands[0], p.world.hands[1]];
        p.strings.forEach((s, i) => s(ptsTop[i], ptsBot[i], t));
      });
      if (S.prop) S.prop(S.puppets[1] ? S.puppets[1] : S.puppets[0], t);
      if (S.confetti) S.confetti(t);
      if (S.screen) S.screen(t);
    }
    raf = requestAnimationFrame(frame);
    return {
      set(o) { Object.assign(opts, o); S = build(); last = 0; },
      destroy() { alive = false; cancelAnimationFrame(raf); },
      opts,
    };
  }

  /* ---- the world: backdrop, stage, cross, strings, props --------------------------------------------------------- */
  function drawBackdrop(g, fam, mode) {
    if (fam === 'glass') {
      mk('rect', { width: W, height: H, fill: mode === 'dark' ? '#060814' : '#EEF2F8' }, g);
      [['#3A6BFF', 110, 150, 210, .32], ['#B05CFF', 380, 120, 180, .26], ['#19C9B8', 250, 520, 240, .22], ['#FF5FA2', 60, 470, 140, .18]].forEach(([c, x, y, r, o]) => {
        const id = 'bk' + c.slice(1); const rg = mk('radialGradient', { id }, g.ownerSVGElement.querySelector('defs')); mk('stop', { offset: '0', 'stop-color': c, 'stop-opacity': mode === 'dark' ? o : o * 0.8 }, rg); mk('stop', { offset: '1', 'stop-color': c, 'stop-opacity': '0' }, rg);
        mk('circle', { cx: x, cy: y, r, fill: `url(#${id})` }, g);
      });
      /* a spotlight cone from the cross to the stage */
      const sp = mk('linearGradient', { id: 'spot', x1: '0', y1: '0', x2: '0', y2: '1' }, g.ownerSVGElement.querySelector('defs')); mk('stop', { offset: '0', 'stop-color': '#FFFFFF', 'stop-opacity': mode === 'dark' ? '.10' : '.5' }, sp); mk('stop', { offset: '1', 'stop-color': '#FFFFFF', 'stop-opacity': '0' }, sp);
      mk('path', { d: `M${W / 2 - 40} 130 L${W / 2 + 40} 130 L${W / 2 + 190} 500 L${W / 2 - 190} 500 Z`, fill: 'url(#spot)' }, g);
    } else if (fam === 'friendly') {
      mk('rect', { width: W, height: H, fill: mode === 'dark' ? '#221E28' : '#FBF7F3' }, g);
      mk('rect', { width: W, height: H, fill: 'url(#tg-ground)' }, g);
      [['#5FD0B0', 90, 120, 160], ['#B39DDB', 400, 160, 150], ['#FF9E80', 380, 520, 170], ['#5AB9E0', 70, 520, 140]].forEach(([c, x, y, r]) => mk('circle', { cx: x, cy: y, r, fill: c, opacity: mode === 'dark' ? '.10' : '.16' }, g));
      /* soft floating rounded shapes, the 3DS/Wii menu bubbles */
      [[60, 240, 26], [420, 300, 18], [400, 80, 12], [120, 380, 10]].forEach(([x, y, r], i) => mk('circle', { cx: x, cy: y, r, fill: 'none', stroke: mode === 'dark' ? 'rgba(244,238,248,.18)' : 'rgba(122,109,140,.22)', 'stroke-width': '2', class: 'tr-float', style: `--d:${i}` }, g));
    } else if (fam === 'basic') {
      mk('rect', { width: W, height: H, fill: mode === 'dark' ? '#0B1830' : '#F4F8FF' }, g);
      const grid = mode === 'dark' ? 'rgba(142,194,255,.10)' : 'rgba(31,95,184,.10)', grid2 = mode === 'dark' ? 'rgba(142,194,255,.18)' : 'rgba(31,95,184,.18)';
      for (let x = 0; x <= W; x += 20) mk('line', { x1: x, y1: 0, x2: x, y2: H, stroke: x % 100 ? grid : grid2, 'stroke-width': '1' }, g);
      for (let y = 0; y <= H; y += 20) mk('line', { x1: 0, y1: y, x2: W, y2: y, stroke: y % 100 ? grid : grid2, 'stroke-width': '1' }, g);
      const lab = mode === 'dark' ? '#8EC2FF' : '#1F5FB8';
      const tb = mk('g', {}, g); mk('rect', { x: W - 150, y: H - 52, width: 130, height: 34, fill: 'none', stroke: lab, 'stroke-width': '1' }, tb);
      mk('text', { x: W - 142, y: H - 38, 'font-family': 'IBM Plex Mono, monospace', 'font-size': '8', fill: lab, 'letter-spacing': '.8' }, tb).textContent = 'PUPPET MASTER · TROUPE';
      mk('text', { x: W - 142, y: H - 25, 'font-family': 'IBM Plex Mono, monospace', 'font-size': '8', fill: lab, 'letter-spacing': '.8', opacity: '.7' }, tb).textContent = 'RIG 2-BONE IK · SHEET 1:1';
    } else {
      mk('rect', { width: W, height: H, fill: mode === 'dark' ? '#050A06' : '#EDE9DA' }, g);
      for (let y = 0; y < H; y += 4) mk('rect', { x: 0, y, width: W, height: 1, fill: mode === 'dark' ? 'rgba(124,255,154,.035)' : 'rgba(40,60,30,.05)' }, g);
    }
  }
  function drawStage(g, fam, mode, cx, y) {
    if (fam === 'glass') {
      const ring = mode === 'dark' ? 'rgba(160,210,255,.5)' : 'rgba(40,70,140,.35)';
      mk('ellipse', { cx, cy: y + 4, rx: 205, ry: 30, fill: mode === 'dark' ? 'rgba(120,170,255,.08)' : 'rgba(255,255,255,.55)', stroke: ring, 'stroke-width': '1.2' }, g);
      mk('ellipse', { cx, cy: y + 4, rx: 150, ry: 20, fill: 'none', stroke: ring, 'stroke-width': '.8', opacity: '.6' }, g);
      mk('ellipse', { cx, cy: y + 4, rx: 90, ry: 11, fill: 'none', stroke: ring, 'stroke-width': '.8', opacity: '.4' }, g);
    } else if (fam === 'friendly') {
      mk('rect', { x: cx - 205, y: y - 6, width: 410, height: 40, rx: 20, fill: mode === 'dark' ? '#3A3344' : '#FFFFFF', stroke: mode === 'dark' ? 'rgba(244,238,248,.25)' : 'rgba(122,109,140,.2)', 'stroke-width': '2' }, g);
      mk('rect', { x: cx - 205, y: y - 6, width: 410, height: 40, rx: 20, fill: 'url(#tg-ground)' }, g);
    } else if (fam === 'basic') {
      const lab = mode === 'dark' ? '#8EC2FF' : '#1F5FB8';
      mk('path', { d: `M${cx - 200} ${y + 34} L${cx - 150} ${y} L${cx + 150} ${y} L${cx + 200} ${y + 34} Z`, fill: 'none', stroke: lab, 'stroke-width': '1.4' }, g);
      mk('text', { x: cx - 16, y: y + 50, 'font-family': 'IBM Plex Mono, monospace', 'font-size': '8', fill: lab, 'letter-spacing': '1.2' }, g).textContent = 'STAGE';
    } else {
      const c = mode === 'dark' ? '#7CFF9A' : '#3B5B2A';
      for (let x = cx - 200; x <= cx + 200; x += 4) { mk('rect', { x, y: y + 6, width: 4, height: 4, fill: c, opacity: '.8', 'shape-rendering': 'crispEdges' }, g); if ((x / 4) % 3 === 0) mk('rect', { x, y: y + 14, width: 4, height: 4, fill: c, opacity: '.35', 'shape-rendering': 'crispEdges' }, g); }
    }
  }
  function drawBar(g, fam, mode) {
    const col = fam === 'glass' ? (mode === 'dark' ? 'rgba(255,255,255,.75)' : 'rgba(40,60,110,.55)') : fam === 'friendly' ? (mode === 'dark' ? '#F4EEF8' : '#8D7AAE') : fam === 'basic' ? (mode === 'dark' ? '#8EC2FF' : '#1F5FB8') : (mode === 'dark' ? '#7CFF9A' : '#3B5B2A');
    const grp = mk('g', {}, g);
    if (fam === 'glass') {
      mk('rect', { x: -130, y: -6, width: 260, height: 12, rx: 6, fill: 'url(#tg-glass)', stroke: col, 'stroke-width': '1.3' }, grp);
      mk('rect', { x: -6, y: -34, width: 12, height: 62, rx: 6, fill: 'url(#tg-glass)', stroke: col, 'stroke-width': '1.3' }, grp);
      mk('rect', { x: -40, y: 4, width: 80, height: 10, rx: 5, fill: 'url(#tg-glass)', stroke: col, 'stroke-width': '1.1' }, grp);
      mk('circle', { cx: 0, cy: -40, r: 6, fill: 'none', stroke: col, 'stroke-width': '1.6' }, grp);
      mk('circle', { cx: 0, cy: 0, r: 4, fill: '#FFFFFF' }, grp);
    } else if (fam === 'friendly') {
      mk('rect', { x: -132, y: -8, width: 264, height: 16, rx: 8, fill: mode === 'dark' ? '#4A4058' : '#FFFFFF', stroke: col, 'stroke-width': '3' }, grp);
      mk('rect', { x: -8, y: -36, width: 16, height: 66, rx: 8, fill: mode === 'dark' ? '#4A4058' : '#FFFFFF', stroke: col, 'stroke-width': '3' }, grp);
      mk('rect', { x: -132, y: -8, width: 264, height: 16, rx: 8, fill: 'url(#tg-dots)', opacity: '.8' }, grp);
      mk('circle', { cx: 0, cy: -44, r: 7, fill: '#FFC86B', stroke: col, 'stroke-width': '3' }, grp);
    } else if (fam === 'basic') {
      mk('rect', { x: -130, y: -5, width: 260, height: 10, rx: 2, fill: 'none', stroke: col, 'stroke-width': '1.4' }, grp);
      mk('rect', { x: -5, y: -34, width: 10, height: 62, rx: 2, fill: 'none', stroke: col, 'stroke-width': '1.4' }, grp);
      mk('circle', { cx: 0, cy: -40, r: 5, fill: 'none', stroke: col, 'stroke-width': '1.4' }, grp);
      mk('text', { x: -24, y: -50, 'font-family': 'IBM Plex Mono, monospace', 'font-size': '8', fill: col, 'letter-spacing': '1.2' }, grp).textContent = 'CONTROL';
    } else {
      for (let x = -128; x <= 128; x += 4) { mk('rect', { x, y: -4, width: 4, height: 4, fill: col, 'shape-rendering': 'crispEdges' }, grp); mk('rect', { x, y: 0, width: 4, height: 4, fill: col, opacity: '.6', 'shape-rendering': 'crispEdges' }, grp); }
      for (let y = -32; y <= 24; y += 4) mk('rect', { x: -2, y, width: 4, height: 4, fill: col, 'shape-rendering': 'crispEdges' }, grp);
    }
    return { place(x, y, deg) { grp.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(deg)})`); } };
  }
  function glassString(g, tint, mode) {
    const a = mk('path', { fill: 'none', stroke: tint, 'stroke-width': '4', opacity: mode === 'dark' ? '.16' : '.2', 'stroke-linecap': 'round' }, g);
    const b = mk('path', { fill: 'none', stroke: mode === 'dark' ? 'rgba(255,255,255,.75)' : 'rgba(40,60,110,.5)', 'stroke-width': '.9', 'stroke-linecap': 'round' }, g);
    const spark = mk('circle', { r: '1.8', fill: '#FFFFFF' }, g);
    return (p, q, t) => { const d = `M${f1(p[0])} ${f1(p[1])} L${f1(q[0])} ${f1(q[1])}`; a.setAttribute('d', d); b.setAttribute('d', d); const k = ((t / 1800) + p[0] / 300) % 1; spark.setAttribute('cx', f1(lerp(p[0], q[0], k))); spark.setAttribute('cy', f1(lerp(p[1], q[1], k))); spark.setAttribute('opacity', Math.sin(k * Math.PI).toFixed(2)); };
  }
  function plainString(g, col) { const l = mk('path', { fill: 'none', stroke: col, 'stroke-width': '1.1', 'stroke-linecap': 'round' }, g); return (p, q) => l.setAttribute('d', `M${f1(p[0])} ${f1(p[1])} L${f1(q[0])} ${f1(q[1])}`); }
  function retroString(g, col, mode) {
    const layer = mk('g', { 'shape-rendering': 'crispEdges' }, g); const pool = [];
    return (p, q) => { const n = Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 8); for (let i = 0; i <= n; i++) { let r = pool[i]; if (!r) { r = mk('rect', { width: 2, height: 4, fill: col, opacity: mode === 'dark' ? '.55' : '.7' }, layer); pool.push(r); } r.setAttribute('x', Math.round(lerp(p[0], q[0], i / n) / 2) * 2); r.setAttribute('y', Math.round(lerp(p[1], q[1], i / n) / 4) * 4); r.removeAttribute('display'); } for (let i = n + 1; i < pool.length; i++) pool[i].setAttribute('display', 'none'); };
  }
  function drawCard(g, fam, mode, text) {
    /* the plan: a card the middle puppet holds in front of itself, its title inside */
    const grp = mk('g', {}, g), ink = fam === 'glass' ? (mode === 'dark' ? '#E6ECFF' : '#22305A') : fam === 'friendly' ? '#4A4550' : fam === 'basic' ? (mode === 'dark' ? '#8EC2FF' : '#1F5FB8') : (mode === 'dark' ? '#FFD36B' : '#7A5A10');
    const font = fam === 'retro' || fam === 'basic' ? 'IBM Plex Mono, ui-monospace, monospace' : 'Inter, system-ui, sans-serif';
    if (fam === 'glass') { mk('rect', { x: -36, y: -24, width: 72, height: 48, rx: 9, fill: mode === 'dark' ? 'rgba(14,20,40,.82)' : 'rgba(255,255,255,.9)' }, grp); mk('rect', { x: -36, y: -24, width: 72, height: 48, rx: 9, fill: 'url(#tg-glass)', stroke: mode === 'dark' ? 'rgba(255,255,255,.85)' : 'rgba(40,60,110,.5)', 'stroke-width': '1.3' }, grp); mk('path', { d: 'M-30 -18 L22 -18', stroke: 'rgba(255,255,255,.9)', 'stroke-width': '1.4', 'stroke-linecap': 'round' }, grp); }
    else if (fam === 'friendly') { mk('rect', { x: -36, y: -24, width: 72, height: 48, rx: 12, fill: '#FFFFFF', stroke: mode === 'dark' ? '#F4EEF8' : '#8D7AAE', 'stroke-width': '3.5' }, grp); mk('circle', { cx: -22, cy: -11, r: 5, fill: '#FFC86B' }, grp); }
    else if (fam === 'basic') { mk('rect', { x: -36, y: -24, width: 72, height: 48, rx: 2, fill: mode === 'dark' ? '#0B1830' : '#F4F8FF', stroke: ink, 'stroke-width': '1.5' }, grp); mk('path', { d: 'M-36 -12 L36 -12', stroke: ink, 'stroke-width': '1', opacity: '.6' }, grp); }
    else { for (let y = -24; y <= 20; y += 4) for (let x = -36; x <= 32; x += 4) if (y === -24 || y === 20 || x === -36 || x === 32) mk('rect', { x, y, width: 4, height: 4, fill: ink, 'shape-rendering': 'crispEdges' }, grp); }
    const title = mk('text', { x: fam === 'friendly' ? 6 : 0, y: fam === 'basic' ? -15 : -6, 'text-anchor': 'middle', 'font-family': font, 'font-size': fam === 'basic' || fam === 'retro' ? '8.5' : '10', 'font-weight': '650', fill: ink, 'letter-spacing': fam === 'basic' || fam === 'retro' ? '1' : '.2' }, grp);
    title.textContent = fam === 'basic' || fam === 'retro' ? text.toUpperCase() : text;
    for (let i = 0; i < 2; i++) mk('rect', { x: -24, y: 4 + i * 8, width: i ? 30 : 48, height: fam === 'retro' ? 4 : 3, rx: fam === 'retro' || fam === 'basic' ? 0 : 1.5, fill: fam === 'friendly' ? ['#B39DDB', '#7FD8B6'][i] : ink, opacity: fam === 'friendly' ? '1' : '.55' }, grp);
    return (p, t) => { const h = p.world ? p.world.hands : p.state.hand, x = (h[0][0] + h[1][0]) / 2, y = (h[0][1] + h[1][1]) / 2 - 6; grp.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(Math.sin(t / 1400) * 2.5)})`); };
  }
  function drawConfetti(g, fam, mode) {
    const cols = TINTS[fam], bits = [];
    for (let i = 0; i < 26; i++) { const r = fam === 'retro' ? mk('rect', { width: 4, height: 4, fill: cols[i % 4], 'shape-rendering': 'crispEdges' }, g) : fam === 'friendly' ? mk('circle', { r: 3.5, fill: cols[i % 4] }, g) : mk('rect', { width: 5, height: 9, rx: fam === 'glass' ? 2 : 0, fill: fam === 'basic' ? 'none' : cols[i % 4], stroke: fam === 'basic' ? cols[0] : 'none', opacity: fam === 'glass' ? '.85' : '1' }, g); bits.push({ r, x: 24 + (i * 173) % 432, s: 0.6 + (i * 13 % 10) / 10, ph: i * 0.37 }); }
    return (t) => bits.forEach((b) => { const y = ((t / 1000 * 60 * b.s + b.ph * 300) % 640) - 30, x = b.x + Math.sin(t / 700 + b.ph) * 14; b.r.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(t / 6 * b.s + b.ph * 50)})`); });
  }
  function drawScreen(g, fam, mode, cx, y) {
    const grp = mk('g', { transform: `translate(${cx} ${y - 60})` }, g);
    const edge = fam === 'glass' ? (mode === 'dark' ? 'rgba(255,255,255,.7)' : 'rgba(40,60,110,.45)') : fam === 'friendly' ? (mode === 'dark' ? '#F4EEF8' : '#8D7AAE') : fam === 'basic' ? (mode === 'dark' ? '#8EC2FF' : '#1F5FB8') : (mode === 'dark' ? '#7CFF9A' : '#3B5B2A');
    const fill = fam === 'glass' ? 'url(#tg-glass)' : fam === 'friendly' ? (mode === 'dark' ? '#3A3344' : '#FFFFFF') : fam === 'basic' ? 'none' : 'none';
    mk('rect', { x: -70, y: -60, width: 140, height: 92, rx: fam === 'retro' ? 0 : 10, fill, stroke: edge, 'stroke-width': fam === 'friendly' ? '3' : '1.4' }, grp);
    mk('path', { d: 'M-86 44 L86 44 L74 32 L-74 32 Z', fill, stroke: edge, 'stroke-width': fam === 'friendly' ? '3' : '1.3' }, grp);
    const lines = []; for (let i = 0; i < 4; i++) lines.push(mk('rect', { x: -50, y: -42 + i * 15, width: 20, height: 4, rx: fam === 'retro' ? 0 : 2, fill: TINTS[fam][i % 4], opacity: '.85' }, grp));
    return (t) => lines.forEach((l, i) => l.setAttribute('width', f1(20 + 70 * (0.5 + 0.5 * Math.sin(t / 900 + i * 1.1)))));
  }

  window.Troupe = { mount, SCENES, POSES, ik };
})();
