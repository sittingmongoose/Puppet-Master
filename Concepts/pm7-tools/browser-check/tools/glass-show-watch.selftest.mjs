// Constructed schedules for the browser check's own probes. Run with node.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { PROBE, TIMER_PROBE, restAttribution, showTabsLocked, showWatchSites } from '../checks/glass-show-watch.check.mjs';

const url = 'file:///glass-test.html';
const script = `<script id="lg-js">
  function awaitShow(delay) {
    if (!showT) showT = setTimeout(checkShown, delay);
  }
  function unrelated() { setTimeout(() => {}, 400); }
  let showT;
  function checkShown() { showT = 0; }
</script>`;

function fixture(range, src = script) {
	let now = 100, seq = 0;
	const timers = new Map();
	const shows = [];
	const strip = { style: { set display(value) { if (value === '') shows.push(now); } } };
	const browser = vm.createContext({
		document: { hidden: false, querySelector: () => strip },
		location: { href: url },
		performance: { now: () => now },
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
		frame: { evaluate(fn, arg) { return run(`(${fn})(${JSON.stringify(arg)})`); } },
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
assert.deepEqual(sites, { 3: 'awaitShow' });
const { run } = fixture({ ...range, sites });
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
const pollRange = { from: 1, to: 6, sites: showWatchSites(poll, { from: 1, to: 6 }) };
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
