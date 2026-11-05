// SW-46: port of neon-verify check 18 for PM7, normal and T3 sandbox surfaces.
// The window sizes, thread/scroll matrix and overlap predicates follow the original verifier.
const SIZES = [[1440, 900], [1512, 982], [1920, 1100]];

export default async function (t) {
  const only = t.args.only ? String(t.args.only).split(',') : null;
  const sizes = t.args.width ? SIZES.filter(([w]) => w === Number(t.args.width)) : SIZES;
  if (!sizes.length) throw Error('Unknown Pod window width');
  if (only || t.args.width) t.log('Partial diagnostic selection; not the full matrix');
  const bad = []; let views = 0, threads = 0;
  for (const [w, h] of sizes) {
    await t.viewport(w, h);
    const f = await t.app.open();
    await t.app.look('nier-dark');
    const viewport = await f.evaluate(() => ({ width: innerWidth, height: innerHeight }));
    await t.check(`${w}x${h} viewport`, viewport.width === w && viewport.height === h, JSON.stringify(viewport), { hard: true });
    await f.evaluate(() => { PMW.chatCol.setKeepOpen(true); PMW.chatCol.show(); PMW.chatCol.setWidth(560); });
    await f.waitForFunction(() => {
      const e=document.querySelector('#chatPanel'), r=e?.getBoundingClientRect();
      const key=r && [r.x,r.y,r.width,r.height].join(',');
      const prior=window.__podChatGeometry;
      const ready=PMW.chatCol.widthPx()===560 && !document.body.hasAttribute('data-ph-closing');
      window.__podChatGeometry={key,count:ready && prior?.key===key ? prior.count+1 : 0};
      return ready && r?.width>0 && window.__podChatGeometry.count>=4;
    }, null, {polling:'raf',timeout:10000});
    const toggle = f.locator('.chat-header [data-action="toggle-history"]').first();
    if (await f.evaluate(() => PM56_DEMO.getState().historyMode === 'closed')) await toggle.click();
    const pin = f.locator('.history-flyout [data-action="ph-toggle-pin"]').first();
    if (await f.evaluate(() => document.body.getAttribute('data-ph-drawer') !== 'pinned')) {
      await pin.waitFor({ state: 'visible', timeout: 10000 }); await pin.click();
    }
    await f.waitForFunction(() => document.body.getAttribute('data-ph-drawer') === 'pinned' && !!document.querySelector('.history-flyout'), null, { timeout: 10000 });
    const drawer = f.locator('.history-flyout');
    // Pinning animates both the drawer and hosted chat. Read the drag baseline only
    // after finite animations end and consecutive layout samples agree.
    await f.waitForFunction(() => {
      const e = document.querySelector('.history-flyout');
      if (!e || document.body.getAttribute('data-ph-drawer') !== 'pinned') return false;
      const busy = document.getAnimations().some(a => a.playState === 'running' &&
        a.effect?.getComputedTiming().iterations !== Infinity &&
        (e.contains(a.effect?.target) || a.effect?.target?.contains?.(e)));
      const r = e.getBoundingClientRect(), key = [r.x,r.y,r.width,r.height].join(',');
      const prior = window.__podGeometry;
      window.__podGeometry = {key, count: !busy && prior?.key === key ? prior.count + 1 : 0};
      return !busy && window.__podGeometry.count >= 4;
    }, null, {polling:'raf',timeout:10000});
    const width = await drawer.evaluate(e => e.getBoundingClientRect().width);
    if (Math.abs(width - 320) > 1) {
      const box = await f.locator('.history-flyout [data-ph-resize]').boundingBox();
      if (!box) throw Error('History resize handle is not visible');
      const x = box.x + box.width / 2, y = box.y + Math.min(60, box.height / 2);
      await t.page.mouse.move(x, y); await t.page.mouse.down();
      try { await t.page.mouse.move(x + 320 - width, y, { steps: 12 }); } finally { await t.page.mouse.up(); }
    }
    await f.waitForFunction(() => {
      const e = document.querySelector('.history-flyout');
      return document.body.getAttribute('data-ph-drawer') === 'pinned' && e &&
        Math.abs(e.getBoundingClientRect().width - 320) <= 1 && !e.classList.contains('is-history-narrow');
    }, null, {timeout:6000});
    const actual = await drawer.evaluate(e => e.getBoundingClientRect().width);
    await t.check(`${w} History width is 320px`, Math.abs(actual - 320) <= 1, String(actual), { hard: true });
    if (t.args.setupOnly) continue; // Repeat driver only; never used for full clearance certification.
    await f.evaluate(() => PM56_DEMO.setVariant(1, 5));
    const collapsed = f.locator('.history-flyout .history-section[data-collapsed="true"] .section-head');
    for (let n = 0; n < 10 && await collapsed.count(); n++) await collapsed.first().click();
    await t.check(`${w} History sections opened`, await collapsed.count() === 0, '', { hard: true });
    const allIds = await f.evaluate(() => [...document.querySelectorAll('.thread-row')].map(r => r.dataset.id));
    const ids = only ? allIds.filter(id => only.includes(id)) : allIds;
    if (only && ids.length !== only.length) throw Error('Requested thread not in History: ' + only.filter(id => !ids.includes(id)).join(', '));
    await t.check(`${w} has threads to inspect`, ids.length > 0, String(ids.length), { hard: true });
    threads += ids.length;
    for (const id of ids) {
      // The row itself carries data-id.
      const item = f.locator(`.thread-row[data-id=${JSON.stringify(id)}]`).first();
      await item.scrollIntoViewIfNeeded(); await item.click();
      await t.page.mouse.move(5, h - 5);
      for (const pos of ['top', 'bottom']) {
        const point = await f.evaluate(() => {
          const tr = document.querySelector('.transcript'); if (!tr) return null;
          const r = tr.getBoundingClientRect();
          for (const x of [r.right - 24, r.left + r.width / 2, r.left + 24]) for (const y of [r.top + r.height / 2, r.top + 24, r.bottom - 24]) {
            const e = document.elementFromPoint(x, y);
            if (!e || !(e === tr || tr.contains(e))) continue;
            let nested = false;
            for (let a = e; a && a !== tr; a = a.parentElement) if (/(auto|scroll)/.test(getComputedStyle(a).overflowY) && a.scrollHeight > a.clientHeight + 1) { nested = true; break; }
            if (!nested) return { x, y };
          }
          return null;
        });
        if (!point) throw Error('No uncovered transcript point for ' + id);
        await t.page.mouse.move(point.x, point.y);
        await t.page.mouse.wheel(0, pos === 'top' ? -100000 : 100000);
        await f.waitForTimeout(1300);
        for (let k = 0; pos === 'bottom' && k < 3; k++) {
          if (await f.evaluate(() => { const e = document.querySelector('.transcript'); return e.scrollTop + e.clientHeight >= e.scrollHeight - 2; })) break;
          await t.page.mouse.wheel(0, 100000); await f.waitForTimeout(1000);
        }
        await t.page.mouse.move(5, h - 5);
        const r = await f.evaluate(pos => {
          const pod = document.getElementById('o55np-pod');
          if (!pod || getComputedStyle(pod).display === 'none') return { nopod: true };
          const P = pod.getBoundingClientRect();
          const hit = e => { const q = e.getBoundingClientRect(); if (q.width < 1 || q.height < 1) return 0; const ix = Math.max(0, Math.min(P.right, q.right) - Math.max(P.left, q.left)), iy = Math.max(0, Math.min(P.bottom, q.bottom) - Math.max(P.top, q.top)); return ix * iy > .5 ? Math.round(ix) + 'x' + Math.round(iy) : 0; };
          const out = [];
          for (const e of document.querySelectorAll('.jump-bottom, .activity-item, .send-queue-row button, .decision-host button, .chat-stage > .composer')) { const k = hit(e); if (k) out.push(String(e.className).slice(0, 30) + ' ' + k); }
          const tr = document.querySelector('.transcript').getBoundingClientRect(), under = [];
          for (const e of document.querySelectorAll('.transcript button, .transcript a[href], .transcript summary')) {
            const q = e.getBoundingClientRect(); if (q.bottom < tr.top || q.top > tr.bottom) continue;
            const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
            const ix = Math.min(P.right, q.right) - Math.max(P.left, q.left), iy = Math.min(P.bottom, q.bottom) - Math.max(P.top, q.top);
            if (ix >= 4 && iy >= 4) under.push((e.textContent || e.className).trim().slice(0, 24));
          }
          const shy = pod.hasAttribute('data-shy'), op = +getComputedStyle(pod).opacity;
          if (pos === 'bottom') out.push(...under);
          else if (under.length && !(shy && op <= .2)) out.push('not faded over ' + under.join(', '));
          if (!under.length && pos === 'bottom' && shy) out.push('faded with no control under it');
          const bar = document.querySelector('#pmRoot .chat-float .activity-bar, #pmRoot .chat-float .pm56-activity-bar');
          if (bar && bar.scrollWidth - bar.clientWidth > 1) out.push('bar overflows');
          const t = document.querySelector('.transcript');
          return { out, atEnd: t.scrollTop + t.clientHeight >= t.scrollHeight - 2, atTop: t.scrollTop <= 2 };
        }, pos);
        views++;
        if (r.nopod || r.out?.length || (pos === 'bottom' ? !r.atEnd : !r.atTop)) bad.push(`${w} ${id} ${pos}: ${JSON.stringify(r)}`);
      }
    }
    t.log(`${w}x${h}: inspected ${ids.length} threads at top and bottom`);
  }
  if (t.args.setupOnly) return;
  await t.check('Pod clears controls in every size, thread and scroll position', views === threads * 2 && views > 0 && !bad.length, `${views} views; ${bad.slice(0, 12).join('; ')}`);
}
