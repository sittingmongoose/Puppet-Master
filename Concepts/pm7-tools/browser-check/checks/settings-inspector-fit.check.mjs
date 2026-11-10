// FO-122 / FO-125 (Jared's settings feedback #1 and #7, 2026-11-09): the Settings inspector's choice ticks sit
// centred in their mark, the panel header's icon tile draws its glyph centred at its designed size with no
// stretching or overflow, in every inspector the page opens, in all ten looks and both surfaces; and the AI &
// Providers account order controls use icons of their own (not the accordion's expand chevron) while keeping
// their accessible names and their order logic. Geometry only: every judgement here is a measured box
// (getBoundingClientRect plus the svg's own getBBox and stroke), never an eye.
//   browser-check run Concepts/pm7-tools/browser-check/checks/settings-inspector-fit.check.mjs --set page=<build>
// --set looks=a,b,c narrows the looks; --set widths=1280,740 narrows the width pass; --set move=0 skips FO-125.
import { LOOKS } from '../browser-check.config.mjs';

/* Everything the open inspector shows: every ticked choice's mark, the header icon tile. One tick's painted
   box in client px: the glyph's own bbox from the svg's getBBox (viewBox units, no stroke), padded by half the
   stroke width (round caps), then mapped through the svg's rect and viewBox. Self-contained: it is serialized
   into the page alone. */
const MEASURE = () => {
  const tick = (mark) => {
    const svg = mark.querySelector('svg');
    if (!svg) return { error: 'no svg in the mark' };
    const mr = mark.getBoundingClientRect(), sr = svg.getBoundingClientRect();
    const vb = (svg.getAttribute('viewBox') || '0 0 24 24').split(/[\s,]+/).map(Number);
    const vw = vb[2] || 24, vh = vb[3] || 24;
    const s = Math.min(sr.width / vw, sr.height / vh);
    const ox = sr.left + (sr.width - vw * s) / 2 - vb[0] * s;
    const oy = sr.top + (sr.height - vh * s) / 2 - vb[1] * s;
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity, n = 0;
    for (const el of svg.querySelectorAll('path,circle,rect,ellipse,line,polyline,polygon')) {
      const b = el.getBBox(); n++;
      x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + b.height);
    }
    if (!n) return { error: 'the tick svg draws nothing' };
    const p = (parseFloat(getComputedStyle(svg).strokeWidth) || 0) / 2;
    return {
      n, scale: s, stroke: p * 2,
      box: { left: ox + (x1 - p) * s, top: oy + (y1 - p) * s, right: ox + (x2 + p) * s, bottom: oy + (y2 + p) * s },
      mark: { left: mr.left, top: mr.top, right: mr.right, bottom: mr.bottom },
      svg: { left: sr.left, top: sr.top, right: sr.right, bottom: sr.bottom }
    };
  };
  const insp = document.querySelector('#panel-settings .detail-inspector');
  if (!insp || insp.getAttribute('aria-hidden') === 'true' || !insp.getClientRects().length) return { error: 'no inspector is open' };
  const ticks = [...insp.querySelectorAll('.o55-insp-choice.is-on .o55-insp-mark')].map(tick);
  const tileEl = insp.querySelector('.o55-insp-icon');
  let tile = null;
  if (tileEl) {
    const svg = tileEl.querySelector('svg');
    if (svg) {
      const tr = tileEl.getBoundingClientRect(), sr = svg.getBoundingClientRect();
      const g = tick({ getBoundingClientRect: () => sr, querySelector: () => svg, querySelectorAll: (sel) => svg.querySelectorAll(sel) });
      tile = {
        tile: { left: tr.left, top: tr.top, right: tr.right, bottom: tr.bottom },
        svg: { left: sr.left, top: sr.top, right: sr.right, bottom: sr.bottom },
        glyph: g && g.box ? g.box : null
      };
    } else tile = { error: 'the icon tile draws no svg' };
  }
  const roles = [...insp.querySelectorAll('.o55-insp-choice')].map((c) => c.getAttribute('role'));
  return { ticks, tile, roles: [...new Set(roles)] };
};
const centre = (b) => [(b.left + b.right) / 2, (b.top + b.bottom) / 2];

/* A path's drawn segments (M/m/L/l/H/h/V/v), so a shape family can be told apart by geometry: a chevron is two
   strokes meeting at an angle with no shaft; an arrow is a shaft (the longest stroke, axis-aligned) with a
   two-stroke head at its end. String equality is not enough: the old up/down chevrons' path text already
   differed from the expand chevron's while all three read as chevrons. */
const SEGMENTS = (d) => {
  const segs = [];
  let x = 0, y = 0, cmd = null;
  const re = /([MmLlHhVv])|(-?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?)/gi;
  const args = [];
  let m;
  while ((m = re.exec(String(d || '')))) {
    if (m[1]) { cmd = m[1]; args.length = 0; continue; }
    args.push(parseFloat(m[0]));
    const c = (cmd || 'L').toLowerCase();
    const n = c === 'm' || c === 'l' ? 2 : 1;
    if (args.length < n) continue;
    const nums = args.splice(0, n);
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    if (C === 'M') { x = rel ? x + nums[0] : nums[0]; y = rel ? y + nums[1] : nums[1]; cmd = rel ? 'l' : 'L'; }
    else if (C === 'L') { const nx = rel ? x + nums[0] : nums[0], ny = rel ? y + nums[1] : nums[1]; segs.push([x, y, nx, ny]); x = nx; y = ny; }
    else if (C === 'H') { const nx = rel ? x + nums[0] : nums[0]; segs.push([x, y, nx, y]); x = nx; }
    else if (C === 'V') { const ny = rel ? y + nums[0] : nums[0]; segs.push([x, y, x, ny]); y = ny; }
  }
  return segs.filter((s) => Math.hypot(s[2] - s[0], s[3] - s[1]) > 0.01);
};
const SHAPE = (d) => {
  const segs = SEGMENTS(d);
  const len = (s) => Math.hypot(s[2] - s[0], s[3] - s[1]);
  const longest = segs.reduce((a, b) => (len(b) > len(a) ? b : a), [0, 0, 0, 0]);
  const vertical = Math.abs(longest[2] - longest[0]) < 0.01 && Math.abs(longest[3] - longest[1]) > 1;
  const horizontal = Math.abs(longest[3] - longest[1]) < 0.01 && Math.abs(longest[2] - longest[0]) > 1;
  return { n: segs.length, chevron: segs.length === 2, arrow: segs.length >= 3 && (vertical || horizontal), vertical, horizontal, shaft: len(longest) };
};

/* One open inspector, judged: every ticked choice's tick within 0.5 px of its mark's centre, the tile's svg
   square, inside the tile, centred within 0.5 px, and its glyph centred in the tile within 0.5 px. */
async function measurePanel(t, f, label, saw) {
  const m = await f.evaluate(MEASURE);
  if (m.error) { await t.check(`${label}: the inspector is open`, false, m.error); return; }
  if (saw) { saw.panels++; for (const r of m.roles || []) { if (r === 'checkbox') saw.checkbox++; else saw.radio++; } }
  await t.check(`${label}: the panel shows choices`, (m.roles || []).length > 0, JSON.stringify(m.roles));
  const bad = [], miss = [];
  for (const tick of m.ticks) {
    if (saw) saw.ticks++;
    if (tick.error) { miss.push(tick.error); continue; }
    const [dx, dy] = [centre(tick.box)[0] - centre(tick.mark)[0], centre(tick.box)[1] - centre(tick.mark)[1]];
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) bad.push(`tick off ${dx.toFixed(2)},${dy.toFixed(2)} px (mark ${Math.round(tick.mark.right - tick.mark.left)}px, svg ${Math.round(tick.svg.right - tick.svg.left)}px, stroke ${tick.stroke})`);
  }
  await t.check(`${label}: every ticked choice's tick is centred within 0.5 px (${m.ticks.length} ticks)`, bad.length === 0 && miss.length === 0, (bad.concat(miss)).slice(0, 3).join(' | '));
  if (m.tile && !m.tile.error) {
    const T = m.tile.tile, S = m.tile.svg;
    const w = S.right - S.left, h = S.bottom - S.top, tw = T.right - T.left, th = T.bottom - T.top;
    await t.check(`${label}: the header icon's svg is square and unstretched`, Math.abs(w - h) <= 0.5, `${w.toFixed(1)}x${h.toFixed(1)}`);
    await t.check(`${label}: the header icon's svg sits inside the tile`, S.left >= T.left - 0.5 && S.right <= T.right + 0.5 && S.top >= T.top - 0.5 && S.bottom <= T.bottom + 0.5, `svg ${(S.right - S.left).toFixed(1)}x${(S.bottom - S.top).toFixed(1)} in a ${(tw).toFixed(0)}x${(th).toFixed(0)} tile`);
    const [sx, sy] = [centre(S)[0] - centre(T)[0], centre(S)[1] - centre(T)[1]];
    await t.check(`${label}: the header icon's svg is centred in the tile within 0.5 px`, Math.abs(sx) <= 0.5 && Math.abs(sy) <= 0.5, `off ${sx.toFixed(2)},${sy.toFixed(2)} px (svg ${Math.round(w)}px in a ${Math.round(tw)}px tile)`);
    if (m.tile.glyph) {
      const [gx, gy] = [centre(m.tile.glyph)[0] - centre(T)[0], centre(m.tile.glyph)[1] - centre(T)[1]];
      await t.check(`${label}: the header icon's glyph is centred in the tile within 0.5 px`, Math.abs(gx) <= 0.5 && Math.abs(gy) <= 0.5, `off ${gx.toFixed(2)},${gy.toFixed(2)} px`);
    }
  } else await t.check(`${label}: the header icon tile measures`, !m.tile || !m.tile.error, m.tile && m.tile.error);
}

async function openInspector(t, f, setting) {
  const btn = f.locator(`#pm-settings-root .o55-about[data-setting="${setting}"]`).first();
  if (!(await btn.count())) { await t.check(`${setting}: the row's About button exists`, false, 'the placement must show this row'); return false; }
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await f.waitForSelector('#panel-settings .detail-inspector .o55-insp-choice', { timeout: 8000 });
  await t.settle();
  return true;
}
export const tests = {
  /* FO-122: every tick centred within 0.5 px of its mark's centre, the tile's svg at its designed size, square,
     wholly inside the tile, and its glyph centred in the tile, across the ten looks and a width pass. Three
     panels cover the three tick shapes: a select (radio), a toggle (radio, On/Off) and a multiselect (checkbox). */
  'FO-122 inspector ticks and header icon': async (t) => {
    const looks = t.args.looks ? String(t.args.looks).split(',') : LOOKS;
    const widths = t.args.widths ? String(t.args.widths).split(',').map(Number) : [860, 1024, 1280, 1390, 740];
    const saw = { panels: 0, ticks: 0, radio: 0, checkbox: 0 };
    const f = await t.app.open();
    await t.viewport(1920, 1080);
    await f.locator('#tab-settings').click();
    await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first().click();
    await t.settle();

    for (const look of looks) {
      const okLook = await t.app.look(t, look);
      if (!okLook) continue;
      for (const setting of ['general.visual.theme', 'general.interaction.question-cards', 'general.interaction.spellcheck-languages']) {
        if (!(await openInspector(t, f, setting))) continue;
        await measurePanel(t, f, `${look} · ${setting}`, saw);
        await f.locator('#panel-settings .detail-inspector [data-action="close-details"]').click().catch(() => {});
        await t.page.waitForTimeout(350);
      }
    }
    await t.check(`FO-122: both choice roles were measured (radio ${saw.radio}, checkbox ${saw.checkbox}, ${saw.panels} panels, ${saw.ticks} ticks)`, saw.radio > 0 && saw.checkbox > 0, 'the multiselect row must still open its inspector');

    /* the width pass: the boxes are px-fixed, but the panel's own width and the row it opens from are not */
    await t.app.look(t, looks[0]);
    await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first().click();
    await t.settle();
    for (const w of widths) {
      await t.viewport(w, w === 740 ? 900 : 1080);
      if (!(await openInspector(t, f, 'general.visual.theme'))) continue;
      await measurePanel(t, f, `width ${w} · general.visual.theme`, null);
      await f.locator('#panel-settings .detail-inspector [data-action="close-details"]').click().catch(() => {});
      await t.page.waitForTimeout(350);
    }
  },

  /* FO-125: the account order controls' icons differ from the accordion's expand chevron (by svg path), keep
     their accessible names, and a real Move-down click still reorders the accounts. While on the service page,
     one scoped account row's inspector is measured too, so a PANEL_ICONS glyph (the AI tile) is covered. */
  'FO-125 account order icons': async (t) => {
    const f = await t.app.open();
    await t.viewport(1920, 1080);
    await f.locator('#tab-settings').click();
    await f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="ai"]').first().click();
    await t.settle();
    // AI & Providers › Services: the roster lists each service; open the one whose fixture has several accounts
    const row = f.locator('#pm-settings-root .resource-row[data-provider="claude-code"]');
    await t.check('the Claude service row is listed', (await row.count()) > 0, 'the providers roster must list claude-code');
    if (!(await row.count())) return;
    await row.first().click();
    await f.waitForSelector('#pm-settings-root .pm51-providers-order', { timeout: 8000 });
    await t.settle();

    if (!t.args.move || String(t.args.move) !== '0') {
      const read = () => f.evaluate(() => {
        const path = (b) => { const p = b && b.querySelector('svg path'); return p ? p.getAttribute('d') : ''; };
        const order = [...document.querySelectorAll('#panel-settings .pm51-acc-item')].map((it) => ({
          id: it.dataset.accId || it.dataset.account || (it.querySelector('.pm51-acc-title') || {}).textContent || '',
          badge: (it.querySelector('.pm51-order') || {}).textContent || ''
        }));
        const moves = [...document.querySelectorAll('#panel-settings .pm51-providers-order .pm51-icon-btn[data-action="pm51-providers-account-move"]')].map((b) => ({
          dir: b.dataset.dir, label: b.getAttribute('aria-label'), disabled: b.getAttribute('aria-disabled') === 'true', d: path(b)
        }));
        const toggles = [...document.querySelectorAll('#panel-settings .pm51-acc-toggle svg path')].map((p) => p.getAttribute('d'));
        return { order, moves, chevrons: [...new Set(toggles)] };
      });
      const before = await read();
      await t.check('two or more accounts are listed', before.order.length >= 2, JSON.stringify(before.order.map((o) => o.title)));

      const up = before.moves.find((m) => m.dir === '-1'), down = before.moves.find((m) => m.dir === '1');
      await t.check('both move controls exist', !!up && !!down, JSON.stringify(before.moves.map((m) => m.dir)));
      await t.check('the move controls keep their accessible names', (!!up && up.label === 'Move up') && (!!down && down.label === 'Move down'), `${up && up.label} / ${down && down.label}`);
      /* the accordion's own glyph is a chevron (two strokes, no shaft); the move controls must be arrows of
         their own (a shaft with a two-stroke head), not chevrons by another path string */
      const chevShapes = before.chevrons.map(SHAPE);
      await t.check('the accordion glyph is the chevron this compares against', chevShapes.length > 0 && chevShapes.every((s) => s.chevron), before.chevrons.join(' | '));
      for (const [name, mv, vertical] of [['Move up', up, true], ['Move down', down, true]]) {
        const s = mv ? SHAPE(mv.d) : null;
        await t.check(`${name}'s icon is an arrow, not a chevron`, !!s && s.arrow, !!s ? `${s.n} strokes, shaft ${s.shaft.toFixed(1)} (a chevron is 2 strokes with no shaft): ${mv.d}` : 'missing');
        await t.check(`${name}'s arrow points the way it moves`, !!s && s.arrow && s.vertical === vertical, !!s ? `${mv.d}` : 'missing');
        await t.check(`${name}'s icon differs from the expand chevron's`, !!mv && before.chevrons.every((c) => c !== mv.d), !!mv ? `${mv.d} vs ${before.chevrons.join(' | ')}` : 'missing');
      }
      await t.check('Move up and Move down use different icons', !!up && !!down && up.d !== down.d, `${up && up.d} vs ${down && down.d}`);
      await t.check("the first account's Move up explains why it is held", !!up && up.disabled, "the first account's Move up is aria-disabled with its reason");

      /* the order logic: a real Move-down click on the first account swaps it with the second, badges follow */
      const first = f.locator('#panel-settings .pm51-providers-order .pm51-icon-btn[data-action="pm51-providers-account-move"][data-dir="1"]').first();
      await first.scrollIntoViewIfNeeded();
      await first.click();
      await t.settle();
      const after = await read();
      const swapped = before.order.length >= 2 && after.order.length === before.order.length &&
        after.order[0].id === before.order[1].id && after.order[1].id === before.order[0].id &&
        after.order.slice(2).every((o, i) => o.id === before.order[i + 2].id) &&
        after.order.every((o, i) => o.badge === String(i + 1));
      await t.check('a real Move-down click reorders the accounts', swapped, `before ${JSON.stringify(before.order.map((o) => o.badge + o.id))} after ${JSON.stringify(after.order.map((o) => o.badge + o.id))}`);
    }

    /* a scoped account row's inspector on this page: the AI tile glyph, and its ticks, measured like the rest.
       The rows live inside each account's accordion, so the first account opens first. */
    const accToggle = f.locator('#panel-settings .pm51-acc-item .pm51-acc-toggle').first();
    if (await accToggle.count() && (await accToggle.getAttribute('aria-expanded')) !== 'true') { await accToggle.scrollIntoViewIfNeeded(); await accToggle.click(); await t.settle(); }
    if (await openInspector(t, f, 'ai.accounts.account-roles')) {
      await measurePanel(t, f, 'providers · ai.accounts.account-roles', null);
      await f.locator('#panel-settings .detail-inspector [data-action="close-details"]').click().catch(() => {});
    }
  }
};
