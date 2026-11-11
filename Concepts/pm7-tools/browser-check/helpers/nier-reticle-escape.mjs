// FO-96: NieR uses the page-wide reticle, not .d-abring. Read its actual paint outside the scroller.
import { decodePng } from './activity-cover-pixels.mjs';

const wait = f => f.waitForTimeout(650); // includes the existing 160 ms scroll hold and 210 ms arrival
async function tabFiles(t, f) {
  await f.evaluate(() => {
    let b = document.getElementById('fo96-nier-s');
    if (!b) { b = document.createElement('button'); b.id = 'fo96-nier-s';
      Object.assign(b.style, { position: 'fixed', left: '0', top: '0', width: '1px', height: '1px', opacity: '0' });
      const bar = document.getElementById('activityBar'); bar.before(b); }
    b.focus({ preventScroll: true });
  });
  for (let n = 0; n < 20; n++) {
    await t.page.keyboard.press('Tab');
    if (await f.evaluate(() => document.activeElement?.matches('#activityBar [data-ab-id="files"]:focus-visible'))) return true;
  }
  return false;
}
const geometry = f => f.evaluate(() => {
  const bar = document.getElementById('activityBar'), r = bar.getBoundingClientRect();
  const tile = document.querySelector('#activityBar [data-ab-id="files"]'), b = tile.getBoundingClientRect();
  return { box: { left: r.left + bar.clientLeft, top: r.top + bar.clientTop,
    right: r.left + bar.clientLeft + bar.clientWidth, bottom: r.top + bar.clientTop + bar.clientHeight },
    tile: { left: b.left, top: b.top, right: b.right, bottom: b.bottom, height: b.height },
    scroll: bar.scrollTop, max: bar.scrollHeight - bar.clientHeight, names: !bar.classList.contains('collapsed'),
    focused: tile === document.activeElement && tile.matches(':focus-visible'),
    reticle: !!document.querySelector('#o55np-reticle[data-on]') };
});
function changed(im, ref, box, area, outside) {
  let n = 0;
  for (let y = Math.max(0, Math.floor(area.top)); y < Math.min(im.height, Math.ceil(area.bottom)); y++)
    for (let x = Math.max(0, Math.floor(area.left)); x < Math.min(im.width, Math.ceil(area.right)); x++) {
      const out = x < box.left || x >= box.right || y < box.top || y >= box.bottom;
      if (out !== outside) continue;
      const i = (y * im.width + x) * 4;
      if (Math.max(...[0, 1, 2].map(k => Math.abs(im.data[i + k] - ref.data[i + k]))) > 40) n++;
    }
  return n;
}

export async function nierReticleEscape(t) {
  await t.viewport(1280, 500);
  const f = await t.app.open();
  await f.evaluate(() => { try { PMW.chatCol.show(); } catch {} });
  const off = await f.evaluate(() => ({ x: 0, y: 0 }));
  // Locator boxes include the app frame's offset on recordings and on the opaque surface.
  const fe = f === t.page.mainFrame() ? null : await f.frameElement();
  if (fe) Object.assign(off, await fe.boundingBox());
  const looks = t.args.nierLooks ? String(t.args.nierLooks).split(',') : ['nier-light', 'nier-dark'];
  await f.evaluate(() => { const s = document.createElement('style'); s.id = 'fo96-nier-quiet';
    s.textContent = '#pm-hover-tag-root, #o55np-cursor { visibility:hidden !important }'; document.head.append(s); });
  const cdp = await t.page.context().newCDPSession(t.page);
  let frames = null;
  cdp.on('Page.screencastFrame', e => { cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {});
    if (frames) frames.push({ wall: e.metadata.timestamp * 1000, data: e.data }); });
  try {
    for (const look of looks) {
      await t.app.look(look);
      await f.waitForFunction(() => !window.PM_THEME_TRANSITION?.busy?.() && !window.PM_LOOK_COVERED?.());
      await wait(f);
      if (await f.evaluate(() => document.getElementById('activityBar').classList.contains('collapsed')))
        await f.locator('#activityBarToggle').click();
      await wait(f);
      for (let rep = 1; rep <= Number(t.args.nierReps || 3); rep++) {
        await f.evaluate(() => { document.getElementById('activityBar').scrollTop = 0; });
        const reached = await tabFiles(t, f); await wait(f);
        let g = await geometry(f);
        await t.check(`${look} ${rep}: real Tab reaches Files with names shown in a scrolling bar`, reached && g.focused && g.names && g.max > 0, JSON.stringify(g), { hard: true });
        const box = Object.fromEntries(Object.entries(g.box).map(([k, v]) => [k, v + (/left|right/.test(k) ? off.x : off.y)]));
        const area = { left: box.left - 24, right: box.right + 24, top: box.top - 36, bottom: box.top + g.tile.height + 36 };
        await f.locator('#o55np-reticle').evaluate(e => { e.style.visibility = 'hidden'; });
        const ref = decodePng(await t.page.screenshot());
        await f.locator('#o55np-reticle').evaluate(e => { e.style.visibility = ''; });
        await wait(f);
        await t.mark(`${look} ${rep} wheel start`);
        frames = [];
        await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
        for (let n = 0; n < 40 && !frames.length; n++) await f.waitForTimeout(25);
        await t.unmarked(async () => {
          const b = await f.locator('#activityBar').boundingBox();
          await t.page.mouse.move(b.x + b.width / 2, b.y + b.height * .6);
          await t.page.mouse.wheel(0, Math.round(g.tile.top - g.box.top + g.tile.height / 3));
          await wait(f);
          await t.page.mouse.move(1240, 480);
        });
        await cdp.send('Page.stopScreencast');
        const got = frames; frames = null;
        g = await geometry(f);
        await t.mark(`${look} ${rep} cut settled`);
        const cut = g.box.top - g.tile.top;
        await t.check(`${look} ${rep}: wheel leaves key-focused Files cut by about a third`, g.focused && cut > 2 && cut < g.tile.height - 2, JSON.stringify(g), { hard: true });
        const bad = got.map((fr, n) => ({ frame: n, ms: Math.round(fr.wall - got[0].wall), pixels: changed(decodePng(Buffer.from(fr.data, 'base64')), ref, box, area, true) })).filter(q => q.pixels > 3);
        await t.check(`${look} ${rep}: no reticle pixels outside the bar's client box in any compositor frame of the wheel and return`, got.length >= 2 && !bad.length, JSON.stringify({ frames: got.length, bad: bad.slice(0, 12) }));
        // Paired captures isolate the reticle, including its right corners beyond the client edge. Keep the focus still.
        const on = decodePng(await t.page.screenshot());
        await f.locator('#o55np-reticle').evaluate(e => { e.style.visibility = 'hidden'; });
        const bare = decodePng(await t.page.screenshot());
        await f.locator('#o55np-reticle').evaluate(e => { e.style.visibility = ''; });
        const outside = changed(on, bare, box, area, true), inside = changed(on, bare, box, area, false);
        t.log(`${look} ${rep}: ${JSON.stringify({ cut, frames: got.length, bad, outside, inside, box, tile: g.tile })}`);
        await t.check(`${look} ${rep}: returned reticle paints inside the cut tile and zero pixels outside the bar`, g.reticle && inside >= 8 && outside <= 3, JSON.stringify({ inside, outside, cut }));
        await t.crop(`${look}-${rep}-cut`, { x: Math.max(0, area.left), y: Math.max(0, area.top), width: area.right - Math.max(0, area.left), height: area.bottom - Math.max(0, area.top) }, 'NieR reticle clipped at the Activity bar client edges; native pixels', { scroll: false });
        await t.mark(`${look} ${rep} route end`);
      }
    }
  } finally {
    if (frames) await cdp.send('Page.stopScreencast').catch(() => {});
    await cdp.detach();
    await f.evaluate(() => { document.getElementById('fo96-nier-quiet')?.remove(); document.getElementById('fo96-nier-s')?.remove(); });
  }
}
