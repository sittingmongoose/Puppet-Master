#!/usr/bin/env node
/* Real-time GPU films. Fixed recorder viewport; only documented user waits are answered.
 * node tests/wonderer-grill-film.mjs --page pm7 --file /tmp/PMConcept7.html --out /tmp/chat-films
 * --flow crew|room|brainstorm|all --look basic-dark (any chat-target LOOKS value)
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { chromium } from 'playwright';
import { chatTarget, LOOKS } from './chat-target.mjs';
import { launchGpuBrowser, ownGpuSession } from './gpu-browser.mjs';

const argv = process.argv.slice(2), opt = (key, fallback) => { const i = argv.indexOf(key); return i < 0 ? fallback : argv[i + 1]; };
const target = chatTarget(argv), out = path.resolve(opt('--out', '/tmp/c56port-tests/films'));
const look = opt('--look', 'basic-dark'), flowArg = opt('--flow', 'all');
const flows = flowArg === 'all' ? ['crew', 'room', 'brainstorm'] : [flowArg];
if (!LOOKS.includes(look) || flows.some(f => !['crew', 'room', 'brainstorm'].includes(f))) throw new Error('Unknown --look or --flow');
mkdirSync(out, { recursive: true });
const pageSha256 = createHash('sha256').update(readFileSync(target.file)).digest('hex'), results = [];

for (const flow of flows) {
  const movie = path.join(out, `${target.kind}-${flow}-${look}.mp4`), errors = [], moves = [];
  const row = { page: target.kind, flow, look, file: target.file, pageSha256, movie, errors, moves, pass: false };
  let browser, stop;
  try {
    const session = JSON.parse(execFileSync('agent-browser', ['start', '--record', movie, '--url', 'about:blank'], { encoding: 'utf8', timeout: 60000 }));
    stop = ownGpuSession(session.id); row.sessionId = session.id;
    console.log(`FILM ${flow}: GPU session ${session.id} CDP ${session.cdp_endpoint}`);
    browser = await launchGpuBrowser(chromium, ['--cdp', session.cdp_endpoint]);
    const page = browser.contexts()[0].pages().find(p => !session.recorder_url || !p.url().startsWith(session.recorder_url));
    page.on('pageerror', e => errors.push(e.message));
    await target.load(page); await target.theme(page, look);
    if (target.kind === 'pm7') await page.evaluate(() => PMW.chatCol.setWidth(760));
    await page.waitForTimeout(1200);
    const beforeIds = await page.evaluate(() => PM56_COLLAB.runs().map(r => r.id));
    const tile = await target.demoTrigger(page, 'wg-demo-start', flow);
    await tile.click(); await page.waitForTimeout(1400);
    await page.locator('#pmOverlayRoot [data-action="collab-modal-commit"]').filter({ visible: true }).last().click();
    const runId = await page.evaluate(({ flow, beforeIds }) => {
      const kind = flow === 'room' ? 'chat_room' : flow;
      return PM56_COLLAB.runs().find(r => r.kind === kind && !beforeIds.includes(r.id))?.id;
    }, { flow, beforeIds });
    if (!runId) throw new Error('The Studio tile did not create a new run for this film');
    row.runId = runId;
    row.viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, columnWidth: document.querySelector('#pmw-chat56')?.getBoundingClientRect().width }));
    const start = Date.now();
    const click = async selector => {
      const el = page.locator(selector).filter({ visible: true }).first();
      if (!await el.count() || !await el.isEnabled()) return false;
      try {
        await el.scrollIntoViewIfNeeded({ timeout: 1800 }); await page.waitForTimeout(900);
        if (!await el.isVisible() || !await el.isEnabled()) return false;
        await el.click({ timeout: 1800 });
      } catch (e) { if (/Timeout|detached|not attached/.test(e.message)) return false; throw e; }
      moves.push({ selector, elapsedMs: Date.now() - start }); return true;
    };
    const showCard = async () => {
      const card = page.locator(`#pmRoot .transcript [data-run-id="${runId}"]`).first();
      if (await card.count()) await card.scrollIntoViewIfNeeded({ timeout: 1800 });
    };
    while (Date.now() - start < 240000) {
      const state = await page.evaluate(({ flow, runId }) => {
        const r = PM56_COLLAB.run(runId);
        return r ? { id: r.id, status: r.status, phase: r.brainstorm?.phase, synthesis: !!r.brainstorm?.synthesis,
          decision: !!r.brainstorm?.decision, summary: !!r.chatRoom?.summary, wait: r.chatRoom && PM56_ROOM.waitsFor(r) } : null;
      }, { flow, runId });
      if (state) row.final = state;
      if (state && (state.status === 'completed' || flow === 'room' && state.summary || flow === 'brainstorm' && state.synthesis)) { row.pass = true; break; }
      if (await click('.wg-agreed[data-state="open"] [data-action="wg-confirm"]')) { await page.waitForTimeout(1200); await showCard(); continue; }
      if (await click('.qs-grill [data-action="qs-accept-round"]')) { await page.waitForTimeout(1200); continue; }
      if (state && flow === 'room' && state.wait === 'last') await click(`.transcript [data-run-id="${runId}"] [data-action="collab-room-summarize"]`);
      if (state && flow === 'brainstorm' && state.phase === 'synthesis' && state.decision) await click(`.transcript [data-run-id="${runId}"] [data-action="collab-brainstorm-synthesize"]`);
      await page.waitForTimeout(500);
    }
    if (!row.pass) throw new Error(`Film did not reach its result within 240s: ${JSON.stringify(row.final)}`);
    if (flow !== 'brainstorm') {
      await showCard(); await page.waitForTimeout(1400);
      const opened = await click(`#pmRoot .transcript [data-run="${runId}"][data-action="crew-open-work"]`) ||
        await click(`#pmRoot .transcript [data-run="${runId}"][data-action="collab-open-panel"]`);
      if (!opened) throw new Error('The completed run has no painted Open Panel action for the final result');
      row.resultPanel = await page.evaluate(() => window.PM_HOME?.active() || { editor: PM56_EXT.ctx().state.activeEditor });
    }
    await page.waitForTimeout(6000);
    await page.screenshot({ path: movie.replace(/\.mp4$/, '-result.png') });
    row.pass = !errors.length;
  } catch (e) { row.error = e.stack; row.pass = false; console.error(e); }
  finally { try { if (browser) await browser.close(); } finally { stop?.(); } }
  results.push(row); writeFileSync(path.join(out, 'films.json'), JSON.stringify(results, null, 2));
  console.log(`${flow}: ${row.pass ? 'PASS' : 'FAIL'} ${movie}`);
}
process.exitCode = results.every(r => r.pass) ? 0 : 1;
