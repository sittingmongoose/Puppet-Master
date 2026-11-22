// Constructed schedules for the browser check's own probes. Run with node.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { PROBE, TIMER_PROBE, appearanceVerdict, restAttribution, restChurn, showTabs, showTabsLocked, showWatchSites } from '../checks/glass-show-watch.check.mjs';

const url = 'file:///glass-test.html';
const script = `<script id="lg-js">
  function awaitShow(delay) {
    if (!showT) showT = setTimeout(checkShown, delay);
  }
  function unrelated() { setTimeout(() => {}, 400); }
  let showT;
  function checkShown() { showT = 0; }
</script>`;

function fixture(range, src = script, frameMs = 16) {
	let now = 100, seq = 0;
	const timers = new Map();
	const shows = [];
	const strip = { style: { set display(value) {
		if (value !== '') return;
		shows.push(now);
		browser.setTimeout(() => { if (browser.__gsw.lens) browser.__gsw.lens.style.opacity = '1'; }, 30);
	} } };
	const browser = vm.createContext({
		document: { hidden: false, querySelector: () => strip },
		location: { href: url },
		performance: { now: () => now },
		getComputedStyle: (el) => el.style,
		requestAnimationFrame: (fn) => browser.setTimeout(fn, frameMs),
		setTimeout(fn, delay, ...args) {
			const id = ++seq;
			timers.set(id, { at: now + (Number(delay) || 0), fn, args });
			return id;
		},
		clearTimeout(id) { timers.delete(Number(id)); },
	});
	browser.window = browser;
	const run = (code, filename = 'driver') => vm.runInContext(code, browser, { filename });
	run(`(${TIMER_PROBE})(${JSON.stringify(range)})`);
	run(`(${PROBE})()`);
	run(src.replace(/<\/?script[^>]*>/g, ''), url);
	return {
		run,
		shows,
		frame: { evaluate(fn, arg) { return run(`(${fn})`)(arg); } },
		async advance(ms) {
			const end = now + ms;
			for (;;) {
				const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
				if (!next || next[1].at > end) break;
				const [id, timer] = next;
				timers.delete(id);
				now = timer.at;
				timer.fn(...timer.args);
				await new Promise(setImmediate);
			}
			now = end;
		},
	};
}

const range = { from: 1, to: 8 };
const sites = showWatchSites(script, range);
assert.deepEqual(sites.asks, { 3: 'awaitShow' });
const { run } = fixture({ ...range, ...sites });
run('__swt.arm(); awaitShow(399); unrelated();');
const read = run('__swt.read()');
assert.deepEqual(Array.from(read.sites), ['399ms@3'], 'the 399 ms show-watch request must be attributed; the unrelated 400 ms timer must be ignored');
assert.equal(read.asked, 1);
assert.deepEqual(Array.from(read.delays), [399]);
assert.equal(restAttribution(read), '');
run('__swt.arm(); unrelated();');
assert.match(restAttribution(run('__swt.read()')), /no matching/);
run('__swt.arm(); location.href += "?wrong-source"; showT = 0; awaitShow(2000);');
assert.match(restAttribution(run('__swt.read()')), /could not be attributed/);
console.log('PASS show-watch attribution includes changed delays and excludes unrelated timers');

const poll = `<script id="lg-js">
  let showT;
  function awaitShow() { showT = setTimeout(checkShown, 400); }
  function checkShown() { showT = 0; setTimeout(checkShownNow, 40); }
  function checkShownNow() { showT = setTimeout(checkShown, 400); }
</script>`;
const pollRange = { ...range, ...showWatchSites(poll, range) };
const phase = fixture(pollRange, poll);
phase.run('awaitShow(); __swt.note("hide");');
const showing = showTabsLocked(phase.frame, 'display');
await phase.advance(410);
assert.deepEqual(phase.shows, [], 'a poll fire with the check still queued must not open the phase');
await phase.advance(100);
assert.equal((await showing).ok, true);
assert.ok(phase.shows.length === 1 && phase.shows[0] >= 540 && phase.shows[0] < 560);

const lost = fixture(pollRange, poll.replace('setTimeout(checkShownNow, 40);', ''));
lost.run('awaitShow(); __swt.note("hide");');
await lost.advance(405); // The phase probe starts after fire, while no timer is pending.
const timedOut = showTabsLocked(lost.frame, 'display');
await lost.advance(800);
assert.equal((await timedOut).ok, false, 'a lost queued check must fail the phase');
assert.equal(lost.shows.length, 1, 'even a failed phase restores the strip');
console.log('PASS show waits for the queued poll re-arm and fails a lost re-arm');

const sampler = fixture({ ...range, ...sites });
sampler.run('__gsw.lens = { isConnected: true, style: { opacity: "0" } };');
await showTabs(sampler.frame, 'display', 2150);
await sampler.advance(170); // No controller read until after the 150 ms budget.
const sampled = sampler.run('__gsw.sample');
assert.equal((await sampled).ms, 32, 'an on-time first good frame must survive a late driver read');
assert.equal(appearanceVerdict(await sampled, 150), 'pass');

const gap = fixture({ ...range, ...sites }, script, 170);
gap.run('__gsw.lens = { isConnected: true, style: { opacity: "0" } };');
await showTabs(gap.frame, 'display', 2150);
await gap.advance(170);
const gapped = await gap.run('__gsw.sample');
assert.equal(gapped.maxGapMs, 170);
assert.equal(appearanceVerdict(gapped, 150), 'sampling gap');
assert.equal(appearanceVerdict({ ok: true, ms: 180, lastMissMs: 160 }, 150), 'late');
console.log('PASS first good frame survives driver delay; a frame gap is distinguished from witnessed lateness');

const chain = `<script id="lg-js">
  let showT;
  function awaitShow(first) { showT = setTimeout(checkShown, first); }
  function checkShown() { checkShownNow(); }
  function checkShownNow() { showT = setTimeout(checkShown, 2000); }
</script>`;
const chainSites = showWatchSites(chain, range);
const windowed = fixture({ ...range, ...chainSites }, chain);
windowed.run('awaitShow(1); __swt.arm();');
await windowed.advance(12002); // Simulate a late driver read of a regular two-second chain.
const counts = windowed.run('__swt.read()');
assert.equal(counts.complete, true);
assert.equal(counts.fired, 5, 'a late read must exclude the sixth and seventh fires beyond the 10 s window');
assert.equal(counts.asked, 5, 'the in-window re-arm counts even when its fire is outside the window');
const boundary = fixture({ ...range, ...chainSites }, chain);
boundary.run('awaitShow(10000); __swt.arm();');
await boundary.advance(10000);
assert.equal(boundary.run('__swt.read().fired'), 0, 'a fire at the exclusive deadline does not belong to the window');
console.log('PASS late reads and exact deadline events preserve the fixed 10 s window');

const churnSource = chain.replace(
	'function checkShownNow() { showT = setTimeout(checkShown, 2000); }',
	`function checkShownNow() {
    showT = setTimeout(checkShown, 2000);
    clearTimeout(showT);
    showT = setTimeout(checkShown, 2000);
  }`,
);
const churnRange = { from: 1, to: 15 };
const churn = fixture({ ...churnRange, ...showWatchSites(churnSource, churnRange) }, churnSource);
churn.run('__swt.arm(); checkShownNow();');
await churn.advance(10000);
const churning = churn.run('__swt.read()');
assert.equal(churning.asked, 10);
assert.equal(churning.fired, 4);
assert.equal(churning.cleared, 5);
assert.match(restChurn(churning), /unexpected cancellation sites checkShownNow@/, 'the redundant request/clear chain must fail row 13');

const legitimateSource = chain.replace('</script>', `  function queueShown() {
    clearTimeout(showT);
    checkShownNow();
  }
</script>`);
const legitimate = fixture({ ...churnRange, ...showWatchSites(legitimateSource, churnRange) }, legitimateSource);
legitimate.run('awaitShow(2000); __swt.arm(); setTimeout(queueShown, 10);');
await legitimate.advance(12002);
const normal = legitimate.run('__swt.read()');
assert.equal(normal.pendingAtStart, 1);
assert.equal(normal.pending, 1);
assert.equal(normal.cleared, 1);
assert.equal(restChurn(normal), '', 'a genuine queued check can replace even a timer armed before the window');

// R132-FOLLOWUPS 4 (SHOWWATCH-REQUEST-CHURN): the same redundant clear/rearm chain at the APPROVED queueShown
// site balances (1 + 9 - 5 = 4 + 1), keeps one pending and stays under the caps, so the base accepted it. Five
// unnecessary allowed-site clear/rearms for four fires is churn: at most one rearm per completed interval.
const approvedChurn = fixture({ ...churnRange, ...showWatchSites(legitimateSource, churnRange) }, legitimateSource);
approvedChurn.run('awaitShow(2000); __swt.arm(); setTimeout(queueShown, 100); setTimeout(queueShown, 300); setTimeout(queueShown, 500); setTimeout(queueShown, 700); setTimeout(queueShown, 900);');
await approvedChurn.advance(10000);
const ac = approvedChurn.run('__swt.read()');
assert.equal(ac.asked, 9);
assert.equal(ac.cleared, 5);
assert.equal(ac.fired, 4);
assert.equal(ac.pendingAtStart, 1);
assert.equal(ac.pending, 1);
assert.equal(ac.peakPending, 1);
assert.deepEqual(Array.from(ac.badAsks), []);
assert.deepEqual(Array.from(ac.badClears), []);
assert.equal(ac.rearms, 5, 'each approved clear followed by a re-arm is one rearm cycle');
assert.match(restChurn(ac), /redundant clear\/rearm/, 'balanced churn at approved sites must fail row 13');
// the legitimate single queued-check clear keeps its pass (one rearm, five fires)
assert.equal(normal.rearms, 1);
assert.equal(restChurn(normal), '', 'a genuine queued check can replace even a timer armed before the window');

const overlap = fixture({ ...range, ...chainSites }, chain);
overlap.run('__swt.arm(); awaitShow(2000); checkShownNow();');
assert.match(restChurn(overlap.run('__swt.read()')), /2 timers were pending at once/);
console.log('PASS row 13 rejects redundant cancellation and overlapping timers while accepting a queued-check clear');
