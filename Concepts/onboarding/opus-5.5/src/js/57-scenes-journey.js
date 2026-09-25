/* Journey scenes for the Project, AI and Ready chapters. Same keyed props across beats so a choice glides instead of
   cutting; every family draws them in its own material. Portrait 480 x 600, key content inside x 60..420. */
(function () {
  'use strict';
  const O55 = window.O55, A = O55.art;
  const L = (key, fb) => { const v = O55.t('art.labels.' + key); return v === 'art.labels.' + key ? fb : v; };
  const R = (ctx) => ctx.family === 'retro';
  const sparks = (pts, delay) => pts.map(([x, y, tone], i) => ({ key: 'sp' + i, prop: 'spark', x, y, layer: 'front', anim: 'pop', delay: (delay || 700) + i * 110, amb: 'twinkle', ambd: 2200 + i * 450, opts: { tone } }));
  const helper = (ctx, key, x, y, variant, pose, delay, anchor) => { const m = A.metrics(ctx.family); return { key, prop: 'helper', x, y, s: m.helperScale * 0.8, layer: 'front', anim: 'drop', delay: delay || 300, amb: 'bob', ambd: 2600 + variant * 300, opts: { variant, pose, anchor, px: 5 } }; };
  const floorY = (ctx) => A.metrics(ctx.family).floor + (R(ctx) ? 38 : 28);

  /* How should your Project begin? beats: new | folder | online | device | restore */
  A.defineScene('begin', {
    label: 'art.where', band: [0, 150, 480, 330],
    compose(ctx) {
      const b = ctx.beat || 'new', s = R(ctx) ? 1 : 1.9;
      const icon = { new: 'seed', folder: 'folder', online: 'cloud', device: 'server', restore: 'rewind', existing: 'folder' }[b] || 'seed';
      const items = [{ key: 'stage', prop: 'stage', x: 240, y: floorY(ctx), layer: 'back', anim: 'rise', delay: 60 },
        { key: 'bar', prop: 'bar', x: 240, y: 128, layer: 'front', anim: 'drop' },
        /* the beginning hangs from the control bar on a real string */
        { key: 'hero', prop: 'node', x: 240, y: 318, s, layer: 'mid', anim: 'pop', delay: 160, opts: { icon, accent: true, tie: 'a1' } }];
      if (b === 'online') items.push({ key: 'cl', prop: 'cloud', x: 360, y: 214, s: 0.9, layer: 'back', anim: 'drop', delay: 320, amb: 'float' });
      if (b === 'device') items.push({ key: 'nas', prop: 'nas', x: 372, y: 450, s: R(ctx) ? 1 : 1.1, layer: 'mid', anim: 'rise', delay: 320, opts: { label: L('homeNas', 'home nas') } });
      if (b === 'restore') items.push({ key: 'rings', prop: 'rings', x: 240, y: 318, s: 1.6, layer: 'back', anim: 'fade', delay: 300, amb: 'pulse' });
      items.push(helper(ctx, 'h0', 110, floorY(ctx) - 20, 0, b === 'new' ? 'wave' : 'point', 380), helper(ctx, 'h2', 370, floorY(ctx) - 20, 2, 'carry', 460));
      items.push(...sparks([[84, 110, 0], [404, 96, 2], [412, 380, 1]], 900));
      return items;
    }
  });

  /* Name your Project: the name is lettered onto a sign hanging from the control bar as it is typed. */
  A.defineScene('name', {
    label: 'art.hero', band: [0, 140, 480, 300],
    compose(ctx) {
      const name = String((ctx.params || {}).name || '').slice(0, 22) || '…';
      /* the sign hangs from both ends of the control bar; its strings meet its corners whatever the name's length */
      const items = [{ key: 'bar', prop: 'bar', x: 240, y: 120, layer: 'front', anim: 'drop' },
        { key: 'sign', prop: 'badge', x: 240, y: 296, s: R(ctx) ? 2 : 2.1, layer: 'mid', anim: 'drop', delay: 180, opts: { label: name, accent: true, ties: [['a0', 'topLeft'], ['a2', 'topRight']] } },
        { key: 'stage', prop: 'stage', x: 240, y: floorY(ctx), layer: 'back', anim: 'rise', delay: 80 }];
      items.push(helper(ctx, 'h1', 240, floorY(ctx) - 16, 1, 'point', 320));
      items.push(...sparks([[90, 200, 0], [398, 180, 2]], 800));
      return items;
    }
  });

  /* Start like another Project: the settings bundle travels from the existing Project to the new one. */
  A.defineScene('like', {
    label: 'art.route', band: [0, 160, 480, 300],
    compose(ctx) {
      const copy = ctx.beat === 'copy', s = R(ctx) ? 1 : 1.5;
      const items = [{ key: 'new', prop: 'folder', x: copy ? 340 : 240, y: 420, s, layer: 'mid', anim: 'rise', delay: 100, opts: { label: L('new', 'new') } }];
      if (copy) {
        const old = { key: 'old', prop: 'folder', x: 140, y: 250, s, layer: 'mid', anim: 'rise', delay: 60, opts: {} }, nw = items[0], ln = A.link(ctx, old, nw);
        items.push(old, { key: 'path', prop: 'pathline', x: 0, y: 0, layer: 'back', anim: 'draw', delay: 220, opts: { pts: ln } });
        items.push({ key: 'bundle', prop: 'node', x: (ln[0][0] + ln[1][0]) / 2, y: (ln[0][1] + ln[1][1]) / 2, s: R(ctx) ? 1 : 1.2, layer: 'front', anim: 'pop', delay: 360, opts: { icon: 'stack', accent: true } });
      } else items.push({ key: 'seed', prop: 'node', x: 240, y: 250, s: R(ctx) ? 1 : 1.4, layer: 'front', anim: 'pop', delay: 200, opts: { icon: 'seed', accent: true } });
      items.push(...sparks([[80, 120, 1], [410, 150, 0], [412, 520, 2]], 700));
      return items;
    }
  });

  /* Keep your work safe: Safe History at the centre; an online copy and a backup join when chosen. */
  A.defineScene('safe', {
    label: 'art.route', band: [0, 150, 480, 320],
    compose(ctx) {
      const pr = ctx.params || {}, s = R(ctx) ? 1 : 1.35;
      const folder = { key: 'folder', prop: 'folder', x: 240, y: 448, s: R(ctx) ? 2 : 1.6, layer: 'mid', anim: 'rise', delay: 60 };
      const hist = { key: 'hist', prop: 'node', x: 240, y: 268, s, layer: 'mid', anim: 'pop', delay: 160, opts: { icon: 'history', accent: true, label: L('safeHistory', 'safe history') } };
      /* the line down to the folder starts below the node's label, not through it */
      const down = A.link(ctx, hist, folder); down[0] = [down[0][0], down[0][1] + 20];
      const items = [folder, hist, { key: 'p0', prop: 'pathline', x: 0, y: 0, layer: 'back', anim: 'draw', delay: 220, opts: { pts: down } }];
      if (pr.online) { const cl = { key: 'cl', prop: 'cloud', x: 108, y: 150, s: 1, layer: 'mid', anim: 'drop', delay: 120, amb: 'float' }; items.push(cl, { key: 'p1', prop: 'pathline', x: 0, y: 0, layer: 'back', anim: 'draw', delay: 200, opts: { pts: A.link(ctx, hist, cl) } }); }
      if (pr.backup) { const vault = { key: 'vault', prop: 'node', x: 378, y: 150, s: R(ctx) ? 1 : 1.1, layer: 'mid', anim: 'pop', delay: 140, opts: { icon: 'vault' } }; items.push(vault, { key: 'p2', prop: 'pathline', x: 0, y: 0, layer: 'back', anim: 'draw', delay: 220, opts: { pts: A.link(ctx, hist, vault) } }); }
      if (ctx.beat === 'protect') items.push({ key: 'lock', prop: 'lock', x: 378, y: 222, s: R(ctx) ? 1 : 1.1, layer: 'front', anim: 'pop', delay: 300, opts: { open: false } });
      items.push(...sparks([[80, 520, 2], [410, 500, 0]], 900));
      return items;
    }
  });

  /* Online copy: pick a service, sign in (a person and the cloud linked), signed in (the link lights). */
  A.defineScene('online', {
    label: 'art.route', band: [0, 150, 480, 320],
    compose(ctx) {
      const b = ctx.beat || 'service', signed = b === 'signed';
      const cl = { key: 'cl', prop: 'cloud', x: 300, y: 200, s: R(ctx) ? 2 : 1.9, layer: 'mid', anim: 'drop', delay: 60, ambd: 4200 };
      const me = { key: 'me', prop: 'node', x: 160, y: 420, s: R(ctx) ? 1 : 1.4, layer: 'mid', anim: 'pop', delay: 160, opts: { icon: 'person', accent: signed } };
      const items = [cl, me], ln = A.link(ctx, me, cl);
      if (b !== 'service') items.push({ key: 'p', prop: 'pathline', x: 0, y: 0, layer: 'back', anim: 'draw', delay: 240, opts: { pts: ln } }, { key: 'key', prop: 'key', x: (ln[0][0] + ln[1][0]) / 2, y: (ln[0][1] + ln[1][1]) / 2, r: R(ctx) ? 0 : -58, s: R(ctx) ? 1 : 1.1, layer: 'front', anim: 'pop', delay: 320, opts: { accent: signed } });
      if (signed) items.push({ key: 'ok', prop: 'badge', x: 300, y: A.attach(ctx, cl, 'bottom')[1] + 34, layer: 'front', anim: 'rise', delay: 200, opts: { label: L('signedIn', 'signed in'), glyph: 'check', accent: true } });
      items.push(...sparks([[90, 150, 0], [420, 380, 2], [96, 540, 1]], 700));
      return items;
    }
  });

  /* Use it away from home: home only (a quiet house of devices) or anywhere (a globe and a phone on the route). */
  A.defineScene('away', {
    label: 'art.where', band: [0, 150, 480, 320],
    compose(ctx) {
      const any = ctx.beat === 'anywhere';
      const nas = { key: 'nas', prop: 'nas', x: 170, y: 430, s: R(ctx) ? 2 : 1.6, layer: 'mid', anim: 'rise', delay: 60, opts: { label: L('homeNas', 'home nas') } };
      const items = [nas, { key: 'rings', prop: 'rings', x: 170, y: A.attach(ctx, nas, 'top')[1] - 26, s: 1.2, layer: 'back', anim: 'fade', delay: 200, amb: 'pulse' }];
      if (any) {
        /* the route runs outline to outline: home to the world, the world to the phone */
        const globe = { key: 'globe', prop: 'node', x: 336, y: 210, s: R(ctx) ? 1 : 1.6, layer: 'mid', anim: 'pop', delay: 160, opts: { icon: 'globe', accent: true } };
        const phone = { key: 'phone', prop: 'node', x: 372, y: 440, s: R(ctx) ? 1 : 1.1, layer: 'mid', anim: 'pop', delay: 260, opts: { icon: 'phone' } };
        items.push(globe, phone, { key: 'p', prop: 'pathline', x: 0, y: 0, layer: 'back', anim: 'draw', delay: 240, opts: { pts: A.link(ctx, nas, globe) } }, { key: 'p2', prop: 'pathline', x: 0, y: 0, layer: 'back', anim: 'draw', delay: 420, opts: { pts: A.link(ctx, globe, phone) } });
      } else { const pc = { key: 'pc', prop: 'computer', x: 340, y: 470, s: R(ctx) ? 1 : 1.1, layer: 'mid', anim: 'rise', delay: 180, opts: {} }; items.push(pc, { key: 'p', prop: 'pathline', x: 0, y: 0, layer: 'back', anim: 'draw', delay: 240, opts: { pts: A.link(ctx, nas, pc) } }); }
      items.push(...sparks([[90, 120, 1], [412, 110, 2]], 700));
      return items;
    }
  });

  /* Creating: the stage is built piece by piece as real phases finish; done: the helpers take a bow. */
  A.defineScene('creating', {
    label: 'art.hero', band: [0, 170, 480, 280],
    compose(ctx) {
      const pr = ctx.params || {}, step = pr.step || 0, total = Math.max(1, pr.total || 5), done = ctx.beat === 'done', m = A.metrics(ctx.family);
      const items = [];
      if (step >= 1 || done) items.push({ key: 'stage', prop: 'stage', x: 240, y: floorY(ctx), layer: 'back', anim: 'rise' });
      if (step >= 2 || done) items.push({ key: 'bar', prop: 'bar', x: 240, y: m.barY, layer: 'front', anim: 'drop', amb: 'sway', ambd: 5600 });
      const helpers = done ? 3 : Math.max(0, Math.min(3, step - 2 + (step >= total - 1 ? 1 : 0)));
      [-1, 0, 1].slice(0, helpers).forEach((side, i) => { const a = side < 0 ? m.anchors[0] : side > 0 ? m.anchors[2] : m.anchors[1]; items.push({ key: 'h' + i, prop: 'helper', x: 240 + side * 112, y: m.floor - (side === 0 ? 14 : 0), s: m.helperScale, layer: 'mid', anim: 'drop', amb: 'bob', ambd: 2400 + i * 380, opts: { variant: i, pose: done ? 'bow' : 'carry', anchor: step >= 2 || done ? [240 + a[0], m.barY + a[1]] : null, px: m.helperPx, tie: step >= 2 || done ? ['a0', 'a1', 'a2'][side + 1] : null, side } }); });
      if (!done) items.push({ key: 'rings', prop: 'rings', x: 240, y: 300, s: 1.4, layer: 'back', anim: 'fade', amb: 'pulse' });
      if (done) items.push({ key: 'ok', prop: 'badge', x: 240, y: 72, s: R(ctx) ? 1 : 1.4, layer: 'front', anim: 'drop', delay: 200, opts: { label: L('ready', 'ready'), glyph: 'check', accent: true } }, ...sparks([[80, 200, 0], [408, 170, 1], [100, 420, 2], [396, 400, 3]], 150));
      return items;
    }
  });

  /* What powers Puppet Master: the helpers wait on the stage; each connected account lights a spark on the bar;
     Free Models brings extra helpers onto the stage. */
  A.defineScene('power', {
    label: 'art.hero', band: [0, 170, 480, 280],
    compose(ctx) {
      const pr = ctx.params || {}, n = pr.n || 0, m = A.metrics(ctx.family);
      const items = [{ key: 'stage', prop: 'stage', x: 240, y: floorY(ctx), layer: 'back', anim: 'rise' }].concat(A.ensemble(ctx, { poses: n ? ['wave', 'carry', 'stand'] : ['stand', 'stand', 'stand'] }));
      for (let i = 0; i < Math.min(4, n); i++) items.push({ key: 'pw' + i, prop: 'node', x: 150 + i * 60, y: 60, s: R(ctx) ? 1 : 0.8, layer: 'front', anim: 'pop', delay: 120 + i * 90, opts: { icon: 'spark', accent: true } });
      if (ctx.beat === 'free') [[70, 380], [410, 380]].forEach(([x, y], i) => items.push({ key: 'fx' + i, prop: 'helper', x, y: m.floor - 6, s: m.helperScale * 0.7, layer: 'front', anim: 'drop', delay: 300 + i * 140, amb: 'bob', opts: { variant: (i + 1) % 3, pose: 'wave', px: m.helperPx } }));
      return items;
    }
  });

  /* Ready: the curtain lifts, the helpers bow, a sign reads ready. */
  A.defineScene('ready', {
    label: 'art.hero', band: [0, 170, 480, 280],
    compose(ctx) {
      const items = [{ key: 'stage', prop: 'stage', x: 240, y: floorY(ctx), layer: 'back', anim: 'rise' }].concat(A.ensemble(ctx, { poses: ['bow', 'wave', 'bow'] }));
      items.push({ key: 'sign', prop: 'badge', x: 240, y: 64, s: R(ctx) ? 1 : 1.5, layer: 'front', anim: 'drop', delay: 700, opts: { label: L('ready', 'ready'), glyph: 'check', accent: true } });
      items.push(...sparks([[80, 180, 0], [404, 160, 1], [96, 420, 2], [398, 410, 3], [240, 540, 0]], 900));
      items.push({ key: 'curtain', prop: 'curtain', x: 240, y: 300, layer: 'front' }); /* it opens on the troupe */
      return items;
    }
  });
})();
