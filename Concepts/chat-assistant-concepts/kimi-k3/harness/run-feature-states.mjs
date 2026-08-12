/* Feature-state sweep: every ?state= key × all 64 pairings. Asserts the
   driver applied (__k3.stateApplied) and the page stays error-free.
   Usage: node harness/run-feature-states.mjs [--driver=cdp] [--keys=a,b] */
import { startServer, launchDriver, openHost, writeResults, WINDOWS, THREADS } from './fixtures.mjs';
import { noConsoleErrors, noHorizontalOverflow } from './probes.mjs';

const LEGACY_KEYS = [
  'baseline', 'long-a-collapsed', 'long-a-expanded', 'long-u-collapsed', 'long-u-expanded',
  'live-activity', 'activity-collapsed', 'activity-expanded', 'questionnaire',
  'questionnaire-history', 'goal-only', 'todo-only', 'subagents-only', 'diff-only',
  'goal-todo', 'all-surfaces', 'search-current', 'search-all', 'lens-select',
  'lens-applied', 'thought-collapsed', 'thought-expanded', 'stop-visible',
  'send-visible', 'draft-restored', 'artifact-handoff', 'deep-jump', 'mount-restored'
];
const PACKET_KEYS = [
  'route-picker', 'route-submenu', 'route-warning', 'route-effective', 'provider-setup',
  'provider-update', 'access-limited', 'approval-card', 'bsd-auto-glow', 'bsd-manual-on',
  'bsd-advice', 'bsd-unavailable', 'lens-receipt', 'compact-now', 'prior-chat-search',
  'thread-request', 'thread-spawn', 'branch-menu', 'restore-point', 'rewind',
  'redirect-active', 'goal-replan', 'goal-complete', 'goal-blocked', 'capacity-forecast',
  'crew-board', 'ops-conflict-port', 'worktree-states', 'cross-project-grant',
  'artifact-left-code', 'artifact-left-diff', 'artifact-left-image', 'artifact-left-report',
  'artifact-loading', 'artifact-error-retry', 'artifact-plus-pinned', 'attachment-native',
  'attachment-transformed', 'attachment-alternate', 'attachment-unsupported',
  'offline-queue', 'offline-reconnect', 'notify-approval'
];
const ALL_KEYS = LEGACY_KEYS.concat(PACKET_KEYS);

const driverName = (process.argv.find((a) => a.startsWith('--driver=')) || '--driver=cdp').split('=')[1];
const keysArg = process.argv.find((a) => a.startsWith('--keys='));
const keys = keysArg ? keysArg.split('=')[1].split(',') : ALL_KEYS;
const pairs = WINDOWS.flatMap((w) => THREADS.map((t) => [w, t]));

const server = await startServer();
const driver = await launchDriver(driverName);
let total = 0, failed = 0;
const failures = [];
try {
  for (const key of keys) {
    for (let i = 0; i < pairs.length; i += 4) {
      const batch = pairs.slice(i, i + 4);
      await Promise.all(batch.map(async ([w, t]) => {
      total++;
      const ctx = { window: w, thread: t, state: key, server };
      let page = null;
      try {
        page = await openHost(driver, ctx);
        const applied = await page.evaluate((k) => window.__k3 && window.__k3.stateApplied === k, key);
        const errs = await noConsoleErrors(page);
        const ovl = await noHorizontalOverflow(page);
        if (!applied || !errs.pass || !ovl.pass) {
          failed++;
          failures.push({ key, pair: w + ':' + t, applied, err: errs.pass ? '' : errs.detail.slice(0, 100), ovl: ovl.pass ? '' : ovl.detail.slice(0, 100) });
        }
      } catch (e) {
        failed++;
        failures.push({ key, pair: w + ':' + t, boot: e.message.slice(0, 120) });
      }
        if (page) await page.close().catch(() => {});
      }));
    }
    console.log('key ' + key + ' done (' + total + ' runs, ' + failed + ' failures)');
  }
} finally {
  await driver.close();
  server.proc.kill();
}
const file = writeResults('feature-states', 'results', { total, failed, failures: failures.slice(0, 300) });
console.log('feature-states: ' + (total - failed) + '/' + total + ' pass — ' + file);
if (failures.length) console.log(JSON.stringify(failures.slice(0, 12), null, 1));
process.exit(failed ? 1 : 0);
