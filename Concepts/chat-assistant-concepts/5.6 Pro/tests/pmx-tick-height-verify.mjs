#!/usr/bin/env node
/* Focused tick-height regressions. Uses the same GPU launch shim as pmx-verify in the QA scratch harness. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { inPageCards, tickHeight } from './pmx-verify.mjs';

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const h = { ev: (fn, arg) => page.evaluate(fn, arg), wait: ms => page.waitForTimeout(ms), tickOnce: async () => {} };
  const reset = () => page.setContent('<div class="pmx-run" data-k="probe" data-density="live" style="height:100px"><div class="pmx-run-body"><div class="pmx-lane"></div></div></div>');
  let count = 0;
  const probe = async (name, fn) => { await reset(); await fn(); console.log('PASS ' + name); count++; };
  await probe('clock-only ticks and infinite cosmetic motion stay measurable', async () => {
    await h.ev(() => document.querySelector('.pmx-run').animate([{ opacity: 1 }, { opacity: 0.9 }], { duration: 30, iterations: Infinity }));
    assert.equal((await tickHeight({ tickWait: 10 }, h)).pass, true);
  });
  await probe('a structural boundary waits through its paused first frame and height FLIP', async () => {
    const r = await tickHeight({ tickWait: 10, tick: async (h, i) => {
      if (i) return;
      await h.ev(() => {
        const c = document.querySelector('.pmx-run'); c.querySelector('.pmx-run-body').appendChild(document.createElement('div')).className = 'pmx-lane';
        c.style.height = '120px';
        const a = c.animate([{ height: '100px' }, { height: '120px' }], { duration: 120 });
        a.pause(); requestAnimationFrame(() => requestAnimationFrame(() => a.play()));
      });
    } }, h);
    assert.equal(r.pass, true); assert.equal(r.detail.stateBoundaries, 1);
  });
  await probe('Review comparing to writing is a state boundary even with the same outer child counts', async () => {
    await h.ev(() => { document.querySelector('.pmx-run-body').innerHTML = '<div class="pmx-track"><i class="pmx-stop" data-state="now"></i><i class="pmx-stop" data-state="next"></i></div>'; });
    const r = await tickHeight({ tickWait: 10, tick: async (h, i) => {
      if (i) return;
      await h.ev(() => {
        const c = document.querySelector('.pmx-run'), stops = c.querySelectorAll('.pmx-stop');
        stops[0].dataset.state = 'done'; stops[1].dataset.state = 'now'; c.style.height = '120px';
      });
    } }, h);
    assert.equal(r.pass, true); assert.equal(r.detail.stateBoundaries, 1);
  });
  for (const animated of [false, true]) await probe('a real one-pixel change with the same structure fails' + (animated ? ' after animation' : ''), async () => {
    const r = await tickHeight({ tickWait: 10, tick: async (h, i) => {
      if (i) return;
      await h.ev(animated => {
        const c = document.querySelector('.pmx-run'); c.style.height = '101px';
        if (animated) c.animate([{ height: '100px' }, { height: '101px' }], { duration: 120 });
      }, animated);
    } }, h);
    assert.equal(r.pass, false); assert.deepEqual(r.detail[0].heights, [100, 101]);
  });
  await probe('a nested layout transition is settled before measuring its parent', async () => {
    await h.ev(() => {
      const c = document.querySelector('.pmx-run'), b = c.firstElementChild;
      c.style.height = 'auto'; b.style.height = '120px';
      b.animate([{ height: '100px' }, { height: '120px' }], { duration: 120 });
    });
    assert.equal((await h.ev(inPageCards, {}))[0].h, 120);
  });
  await probe('a permanently paused layout effect times out instead of being skipped', async () => {
    await h.ev(() => document.querySelector('.pmx-run').animate([{ height: '100px' }, { height: '120px' }], { duration: 120 }).pause());
    await assert.rejects(h.ev(inPageCards, { timeout: 100 }), /layout did not settle: probe/);
  });
  console.log('pmx tick-height regressions: ' + count + ' passed');
  await page.close();
} finally { await browser.close(); }
