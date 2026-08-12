/* Capture shots: state-gallery frames across themes × widths for the visual
   audit. Screenshots go to OS temp (never the repo — validate.py bans them).
   Usage: node harness/capture-shots.mjs [--driver=cdp] [--keys=a,b] */
import { startServer, launchDriver, openHost, resultsDir, THEMES, WIDTHS } from './fixtures.mjs';
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const driverName = (process.argv.find((a) => a.startsWith('--driver=')) || '--driver=cdp').split('=')[1];
const keysArg = process.argv.find((a) => a.startsWith('--keys='));
const KEYS = keysArg ? keysArg.split('=')[1].split(',') : [
  'baseline', 'questionnaire', 'all-surfaces',
  'route-picker', 'bsd-auto-glow', 'bsd-manual-on', 'approval-card',
  'artifact-left-code', 'artifact-left-diff', 'artifact-loading', 'artifact-error-retry',
  'artifact-plus-pinned', 'offline-queue', 'goal-complete', 'crew-board'
];
const PAIRINGS = [['w1', 't1'], ['w4', 't3'], ['w6', 't5'], ['w7', 't2']];

const server = await startServer();
const driver = await launchDriver(driverName);
const dir = resultsDir('shots');
const manifest = [];
let n = 0;
try {
  for (const [w, t] of PAIRINGS) {
    for (const theme of THEMES) {
      for (const width of WIDTHS) {
        for (const key of KEYS) {
          // capture the full grid only for the first pairing; others sample
          if (PAIRINGS.indexOf(PAIRINGS.find((p) => p[0] === w && p[1] === t)) > 0 &&
              (theme !== 'friendly-dark' && theme !== 'glass-light')) continue;
          if (PAIRINGS.indexOf(PAIRINGS.find((p) => p[0] === w && p[1] === t)) > 0 &&
              (width !== 520 && width !== 1200)) continue;
          let page = null;
          try {
            page = await openHost(driver, { window: w, thread: t, theme, width, state: key, server });
            await new Promise((r) => setTimeout(r, 350));
            const shot = await page.screenshot();
            const dest = join(dir, w + '-' + t + '-' + theme + '-' + width + '-' + key + '.png');
            writeFileSync(dest, readFileSync(shot));
            manifest.push({ pair: w + ':' + t, theme, width, key, file: dest, errors: page.errors.length });
            n++;
          } catch (e) {
            manifest.push({ pair: w + ':' + t, theme, width, key, error: e.message.slice(0, 120) });
          }
          if (page) await page.close().catch(() => {});
        }
      }
    }
    console.log(w + ':' + t + ' captured — ' + n + ' frames so far');
  }
} finally {
  await driver.close();
  server.proc.kill();
}
writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log('shots: ' + n + ' frames -> ' + dir);