import assert from 'node:assert/strict';
import { createContext, runInContext } from 'node:vm';
import { RECORDER, waitForResume } from '../checks/idle-in-drag.check.mjs';

// Install the real page recorder and run the admission stack with controlled idle delivery.
let now = 0;
const deliveries = [];
const window = {
	document: { body: null },
	performance: { now: () => now },
	requestIdleCallback: (callback) => deliveries.push(callback),
};
window.window = window;
const page = createContext(window);
runInContext(`(${RECORDER})({ owners: [], admission: [1, 1], editor: [2, 2] });`, page);
runInContext([
	'function ask(fn) { requestIdleCallback(() => fn()); }',
	'function admit() { PM_BUSY.idle(() => {}); }',
	'PM_BUSY = {}; PM_BUSY.idle = ask;',
	'admit(); PM_BUSY.idle(() => {});',
].join('\n'), page);

const recorder = window.__pmIdleRec;
const queued = structuredClone(recorder.pending());
assert.equal(queued.length, 2, 'both requests are pending at the press');
recorder.release();

const waits = [];
const t = { log() {}, page: { async waitForTimeout(ms) { waits.push(ms); now += ms; } } };
const frame = {
	async waitForFunction(predicate, args, { timeout }) {
		waits.push(timeout);
		assert.deepEqual(args.jobs, [{ id: queued[0].id, token: queued[0].token }]);
		const check = runInContext(`(${predicate})`, page);
		assert.equal(check(args), false, 'the editor callback is still queued at the short wait');
		now += 500;
		deliveries.shift()();
		assert.equal(check(args), true, 'the same native job and owner callback arrive after 6.5 s');
	},
};
await waitForResume(t, frame, { queued, closed: now }, 'fixture');
assert.deepEqual(
	{ editorBuild: queued[0].editorBuild, waits },
	{ editorBuild: true, waits: [6000, 54000] },
	'the queued editor build gets the extended resume wait',
);
assert.equal(queued[1].editorBuild, false, 'ordinary idle jobs keep their normal classification');
console.log('PASS a queued editor build can resume after the standard 6 s wait');
