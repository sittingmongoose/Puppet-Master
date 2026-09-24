/* Flow scenes: look tiles, where-the-work-happens, connect/server, project beginnings, name, start-like, keep-safe,
   creating, AI power, Free Models and Ready. Same keyed props across beats so choices glide instead of cutting. */
(function () {
  'use strict';
  const O55 = window.O55, A = O55.art;
  const L = (key, fb) => { const v = O55.t('art.labels.' + key); return v === 'art.labels.' + key ? fb : v; };
  const sparks = (pts, delay) => pts.map(([x, y, tone], i) => ({ key: 'sp' + i, prop: 'spark', x, y, layer: 'front', anim: 'pop', delay: (delay || 700) + i * 110, amb: 'twinkle', ambd: 2200 + i * 450, opts: { tone } }));
  const R = (ctx) => ctx.family === 'retro';

  /* Look tiles: the marionette ensemble, framed as a landscape band. */
  A.defineScene('tile', {
    label: 'art.hero', band: [0, 92, 480, 408],
    compose(ctx) {
      const m = A.metrics(ctx.family);
      return [{ key: 'stage', prop: 'stage', x: 240, y: m.floor + (R(ctx) ? 38 : 28) - 40, layer: 'back', anim: 'rise', delay: 40 }]
        .concat(A.ensemble(ctx, { floor: m.floor - 40, barY: m.barY + 20 }));
    }
  });

  /* Where should Puppet Master do the work? beats: this | connect | server */
  A.defineScene('where', {
    label: 'art.where', band: [0, 150, 480, 330],
    compose(ctx) {
      const b = ctx.beat || 'this', retro = R(ctx), m = A.metrics(ctx.family);
      const items = [];
      if (b === 'this') {
        items.push({ key: 'bar', prop: 'bar', x: 240, y: 140, layer: 'front', anim: 'drop', amb: 'sway', ambd: 5600 });
        items.push({ key: 'pc', prop: 'computer', x: 240, y: 460, s: retro ? 1 : 2.1, layer: 'mid', anim: 'rise', delay: 120, opts: { label: L('thisComputer', 'this computer') } });
        items.push({ key: 'str', prop: 'pathline', x: 0, y: 0, layer: 'back', anim: 'draw', delay: 260, opts: { pts: [[240, 176], [240, 318]] } });
        items.push({ key: 'h0', prop: 'helper', x: 108, y: 520, s: m.helperScale * 0.8, layer: 'front', anim: 'drop', delay: 360, amb: 'bob', opts: { variant: 0, pose: 'wave', px: 5 } });
        items.push({ key: 'h2', prop: 'helper', x: 372, y: 520, s: m.helperScale * 0.8, layer: 'front', anim: 'drop', delay: 440, amb: 'bob', ambd: 2800, opts: { variant: 2, pose: 'point', px: 5 } });
      } else if (b === 'connect') {
        items.push({ key: 'pc', prop: 'computer', x: 140, y: 500, s: retro ? 1 : 1.5, layer: 'mid', anim: 'rise', opts: { label: L('thisDevice', 'this device') } });
        items.push({ key: 'nas', prop: 'nas', x: 336, y: 330, s: retro ? 1 : 1.5, layer: 'mid', anim: 'rise', delay: 100, opts: { label: L('yourPm', 'your puppet master') } });
        items.push({ key: 'str', prop: 'pathline', x: 0, y: 0, layer: 'back', anim: 'draw', delay: 240, opts: { pts: [[190, 400], [290, 250]] } });
        items.push({ key: 'rings', prop: 'rings', x: 336, y: 270, s: 1.2, layer: 'back', anim: 'fade', delay: 300, amb: 'pulse' });
      } else {
        items.push({ key: 'nas', prop: 'nas', x: 240, y: 420, s: retro ? 1 : 2, layer: 'mid', anim: 'rise', opts: { label: L('alwaysOn', 'always on') } });
        items.push({ key: 'rings', prop: 'rings', x: 240, y: 330, s: 1.6, layer: 'back', anim: 'fade', delay: 200, amb: 'pulse' });
        items.push({ key: 'pc', prop: 'computer', x: 110, y: 540, s: retro ? 1 : 1, layer: 'front', anim: 'rise', delay: 180, opts: {} });
        items.push({ key: 'cloud', prop: 'cloud', x: 360, y: 150, s: 0.9, layer: 'back', anim: 'drop', delay: 260, amb: 'float' });
      }
      items.push(...sparks([[80, 90, 0], [410, 110, 2], [420, 520, 1]], 800));
      return items;
    }
  });
})();
