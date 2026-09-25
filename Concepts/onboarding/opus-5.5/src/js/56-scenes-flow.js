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
        /* the computer hangs from the control bar on a real string (the rig keeps it on) */
        items.push({ key: 'bar', prop: 'bar', x: 240, y: 140, layer: 'front', anim: 'drop' });
        const pc = { key: 'pc', prop: 'computer', x: 240, y: 450, s: retro ? 2 : 1.7, layer: 'mid', anim: 'rise', delay: 120, opts: { label: L('thisComputer', 'this computer'), tie: 'a1' } };
        items.push(pc);
        /* the helpers stand beside the laptop, not on its corners */
        const bl = A.attach(ctx, pc, 'bottomLeft'), br = A.attach(ctx, pc, 'bottomRight');
        items.push({ key: 'h0', prop: 'helper', x: Math.min(150, Math.max(96, bl[0] - 30)), y: bl[1] + 34, s: m.helperScale * 0.8, layer: 'front', anim: 'drop', delay: 360, amb: 'bob', opts: { variant: 0, pose: 'wave', px: 5 } });
        items.push({ key: 'h2', prop: 'helper', x: Math.max(330, Math.min(384, br[0] + 30)), y: br[1] + 34, s: m.helperScale * 0.8, layer: 'front', anim: 'drop', delay: 440, amb: 'bob', ambd: 2800, opts: { variant: 2, pose: 'point', px: 5 } });
      } else if (b === 'connect') {
        const pc = { key: 'pc', prop: 'computer', x: 140, y: 500, s: 1.5, layer: 'mid', anim: 'rise', opts: { label: L('thisDevice', 'this device') } };
        const nas = { key: 'nas', prop: 'nas', x: 336, y: 330, s: 1.5, layer: 'mid', anim: 'rise', delay: 100, opts: { label: L('yourPm', 'your puppet master') } };
        items.push(pc, nas, { key: 'str', prop: 'pathline', x: 0, y: 0, layer: 'back', anim: 'draw', delay: 240, opts: { pts: A.link(ctx, pc, nas) } });
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
