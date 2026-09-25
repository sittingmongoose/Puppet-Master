/* Scene compositions — shared across the four families, laid out for the portrait art pane (480 x 600; keep key content
   inside x 60..420). Each returns placed props; beats move the same keyed props so a beat change glides (object
   continuity) instead of cutting. Family metrics keep strings attached to the right points in every world.
   `band` is the landscape crop used when the pane becomes a strip on narrow windows. */
(function () {
  'use strict';
  const O55 = window.O55, A = O55.art;
  const L = (key, fallback) => { const v = O55.t('art.labels.' + key); return v === 'art.labels.' + key ? fallback : v; };

  /* hook: where a string meets a helper's head (helper units, before its scale); barHooks: the bar's string points
     (a0 left end, a1 the upright's foot, a2 right end; w0 / w2 part-way out, for a raised hand's string) */
  const hooks = (a) => ({ a0: a[0], a1: a[1], a2: a[2], w0: [Math.round(a[0][0] * 0.56), a[0][1]], w2: [Math.round(a[2][0] * 0.56), a[2][1]] });
  const METRICS = {
    basic: { anchors: [[-100, 0], [0, 30], [100, 0]], floor: 470, helperScale: 1.75, barY: 136, hook: [0, -63] },
    friendly: { anchors: [[-100, 0], [0, 30], [100, 0]], floor: 472, helperScale: 1.6, barY: 140, hook: [0, -73.5] },
    glass: { anchors: [[-100, 0], [0, 30], [100, 0]], floor: 478, helperScale: 1.7, barY: 136, hook: [0, -68.5] },
    retro: { anchors: [[-96, -4], [0, 36], [96, -4]], floor: 458, helperScale: 1, barY: 132, helperPx: 7, hook: [0, -100] }
  };
  Object.values(METRICS).forEach((m) => { m.barHooks = hooks(m.anchors); });
  A.metrics = (family) => METRICS[family] || METRICS.basic;

  /* Marionette ensemble: bar + three helpers on strings (hero, look tiles, creating, ready). */
  A.ensemble = function ensemble(ctx, o) {
    o = o || {};
    const m = A.metrics(ctx.family), cx = o.cx || 240, barY = o.barY || m.barY, floor = o.floor || m.floor;
    const s = (o.scale || 1) * m.helperScale, spread = o.spread || 112, poses = o.poses || ['wave', 'carry', 'stand'];
    const items = [{ key: 'bar', prop: 'bar', x: cx, y: barY, layer: 'front', anim: 'drop', delay: o.delay || 0, amb: 'sway', ambd: 5600 }];
    [-1, 0, 1].forEach((side, i) => {
      const a = side < 0 ? m.anchors[0] : side > 0 ? m.anchors[2] : m.anchors[1];
      /* each helper hangs from its own point on the bar; a waving helper's hand hangs from a second point on its side */
      items.push({ key: 'h' + i, prop: 'helper', x: cx + side * spread, y: floor - (side === 0 ? 14 : 0), s, layer: 'mid', anim: 'drop',
        delay: (o.delay || 0) + 260 + i * 90, amb: 'bob', ambd: 2400 + i * 380,
        opts: { variant: (o.variants || [0, 1, 2])[i], pose: poses[i], anchor: [cx + a[0], barY + a[1]], px: m.helperPx,
          tie: ['a0', 'a1', 'a2'][side + 1], handTie: side > 0 ? 'w2' : 'w0', side } });
    });
    return items;
  };
  const sparks = (points, delay) => points.map(([x, y, tone], i) => ({ key: 'sp' + i, prop: 'spark', x, y, layer: 'front', anim: 'pop', delay: (delay || 900) + i * 110, amb: 'twinkle', ambd: 2200 + i * 500, opts: { tone } }));

  A.defineScene('hero', {
    label: 'art.hero',
    band: [0, 190, 480, 320],
    compose(ctx) {
      const m = A.metrics(ctx.family);
      const items = [{ key: 'stage', prop: 'stage', x: 240, y: m.floor + (ctx.family === 'retro' ? 38 : 28), layer: 'back', anim: 'rise', delay: 80 }];
      items.push(...A.ensemble(ctx, {}));
      items.push(...sparks([[74, 262, 0], [410, 230, 1], [398, 352, 2], [88, 380, 3]]));
      items.push({ key: 'dim', prop: 'dimv', x: 414, y: m.barY, layer: 'back', anim: 'fade', delay: 700, opts: { h: m.floor - m.barY, label: L('strings', 'strings') } });
      items.push({ key: 'n-plan', prop: 'note', x: 252, y: m.floor - 62, layer: 'front', anim: 'fade', delay: 1300, opts: { text: L('plan', 'the plan'), dx: 64, dy: 116 } });
      if (ctx.family === 'retro') items.push({ key: 'ready', prop: 'badge', x: 240, y: 574, layer: 'front', anim: 'type', delay: 1300, amb: 'blink', opts: { label: L('pressStart', 'press start'), accent: true } });
      return items;
    }
  });

  /* Review route map: the user's own choices, assembled as a zigzag route down the pane.
     params.nodes = [{icon,label,sub}], plus optional online / backup / inherit labels. */
  A.defineScene('route', {
    label: 'art.route',
    band: [0, 150, 480, 300],
    compose(ctx) {
      const pr = ctx.params || {};
      const nodes = pr.nodes || [{ icon: 'seed', label: L('start', 'Start'), sub: L('new', 'new') }, { icon: 'folder', label: L('files', 'Files'), sub: L('documents', 'documents') },
        { icon: 'computer', label: L('worksHere', 'Works here'), sub: L('thisComputer', 'this computer') }, { icon: 'person', label: L('you', 'You'), sub: L('thisDevice', 'this device') }];
      const n = nodes.length, top = 112, bottom = 476;
      const pts = nodes.map((_, i) => [i % 2 ? 336 : 144, top + ((bottom - top) * i) / Math.max(1, n - 1)]);
      const items = [{ key: 'path', prop: 'pathline', x: 0, y: 0, layer: 'back', anim: 'draw', delay: 200, opts: { pts } }];
      nodes.forEach((nd, i) => items.push({ key: 'n' + i + nd.icon, prop: 'node', x: pts[i][0], y: pts[i][1], s: 1.28, layer: 'mid', anim: 'pop', delay: 120 + i * 150, opts: Object.assign({ v: i }, nd) }));
      const side = (i) => (i % 2 ? 150 : 332);
      if (pr.inherit) items.push({ key: 'inherit', prop: 'badge', x: side(0), y: pts[0][1], layer: 'front', anim: 'rise', delay: 760, opts: { label: pr.inherit, glyph: 'stack' } });
      if (pr.online && n > 1) items.push({ key: 'online', prop: 'cloud', x: side(1), y: pts[1][1] - 26, s: 0.8, layer: 'mid', anim: 'drop', delay: 820, amb: 'float', ambd: 3600 },
        { key: 'online-l', prop: 'badge', x: side(1), y: pts[1][1] + 26, layer: 'front', anim: 'rise', delay: 900, opts: { label: pr.online, glyph: 'cloud' } });
      if (pr.backup && n > 2) items.push({ key: 'backup', prop: 'badge', x: side(2), y: pts[2][1], layer: 'front', anim: 'rise', delay: 960, opts: { label: pr.backup, glyph: 'vault' } });
      items.push(...sparks([[70, 560, 1], [420, 44, 2]], 1400));
      return items;
    }
  });

  /* NAS key exchange: find -> identity -> keys -> install -> verified -> folder. The chosen key keeps key `k0`, so it
     glides from the key ring along the path into the lock on the NAS door instead of cutting between pictures. */
  A.defineScene('nas', {
    label: 'art.nas',
    band: [0, 170, 480, 330],
    compose(ctx) {
      const beat = ctx.beat || 'find', pr = ctx.params || {}, retro = ctx.family === 'retro';
      const cx = 150, cy = 540, nx = 336, ny = 392, lockX = 264, lockY = 300;
      const done = beat === 'verified' || beat === 'folder';
      const items = [
        { key: 'pc', prop: 'computer', x: cx, y: cy, s: retro ? 1 : 1.45, layer: 'mid', anim: 'rise', delay: 60, opts: { label: pr.here || L('thisComputer', 'this computer'), screen: done ? 'check' : '' } },
        { key: 'nas', prop: 'nas', x: nx, y: ny, s: retro ? 1 : 1.5, layer: 'mid', anim: 'rise', delay: 160, opts: { label: pr.device || L('homeNas', 'home nas'), busy: beat === 'install' } },
        { key: 'path', prop: 'pathline', x: 0, y: 0, layer: 'back', anim: 'draw', delay: 320, opts: { pts: [[cx + 40, cy - 110], [lockX - 26, lockY + 14]] } },
        { key: 'lock', prop: 'lock', x: lockX, y: lockY, s: retro ? 1 : 1.25, layer: 'front', anim: 'pop', delay: 420, opts: { open: !done } }
      ];
      if (beat === 'find') items.push({ key: 'rings', prop: 'rings', x: nx, y: ny - 64, s: 1.3, layer: 'back', anim: 'fade', delay: 200, amb: 'pulse', ambd: 1800 },
        { key: 'n-find', prop: 'note', x: nx, y: ny - 142, layer: 'front', anim: 'fade', delay: 700, opts: { text: L('lookingNearby', 'looking nearby'), dx: -60, dy: -64 } });
      if (beat === 'identity' || beat === 'keys') items.push({ key: 'id', prop: 'identity', x: nx, y: 122, s: retro ? 1 : 1.2, layer: 'front', anim: 'pop', delay: 120, opts: { seed: pr.seed || 'home-nas', words: pr.words || '' } });
      if (beat === 'identity') items.push({ key: 'n-id', prop: 'note', x: nx - 46, y: 122, layer: 'front', anim: 'fade', delay: 600, opts: { text: L('itsId', 'its id'), dx: -44, dy: 58 } });
      if (beat === 'keys') {
        [[112, 304], [112, 352], [112, 400]].forEach(([x, y], i) => items.push({ key: 'k' + i, prop: 'key', x, y, r: retro ? 0 : (i - 1) * 8, s: retro ? 1 : 1.05, layer: 'front', anim: 'pop', delay: 80 + i * 110, opts: { accent: i === 0 } }));
        items.push({ key: 'n-keys', prop: 'note', x: 138, y: 280, layer: 'front', anim: 'fade', delay: 600, opts: { text: L('yourKeys', 'your keys'), dx: 34, dy: -44 } });
      } else if (beat === 'install') {
        items.push({ key: 'k0', prop: 'key', x: 214, y: 372, r: retro ? 0 : -62, s: retro ? 1 : 1.05, layer: 'front', anim: 'pop', opts: { accent: true } });
        items.push({ key: 'n-inst', prop: 'note', x: 206, y: 360, layer: 'front', anim: 'fade', delay: 400, opts: { text: L('addingKey', 'adding your key'), dx: -40, dy: -84 } });
      } else if (done) {
        items.push({ key: 'k0', prop: 'key', x: lockX - 40, y: lockY + 4, s: retro ? 1 : 1, layer: 'front', opts: { accent: true } });
        items.push(...sparks([[lockX + 44, lockY - 40, 2], [lockX - 62, lockY - 52, 0], [nx + 70, ny - 150, 1]], 180));
      }
      if (beat === 'folder') items.push({ key: 'fold', prop: 'folder', x: nx, y: 150, s: retro ? 1 : 1.2, layer: 'front', anim: 'drop', delay: 120, opts: { label: pr.folder || L('projectsFolder', 'projects') } });
      return items;
    }
  });
})();
