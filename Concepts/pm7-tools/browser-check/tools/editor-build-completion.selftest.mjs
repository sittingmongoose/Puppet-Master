import assert from 'node:assert/strict';
import { instrument } from '../checks/editor-build-completion.check.mjs';

globalThis.window = { addEventListener() {} };
instrument();
window.PM_BUSY = {};
const queued = [];
window.PM_BUSY.idle = (callback) => queued.push(callback);

const sheet = { matches: (selector) => selector === '.pmed-cz.pmed-prepared' };
const phases = (function* () {
	yield;
	return { el: sheet };
})();
const next = phases.next;
function build() { phases.next(); }

window.PM_BUSY.idle(build);
queued.shift()();
assert.equal(window.__ownerIdle[0].complete, false, 'yielding a phase does not complete construction');
assert.equal(phases.next, next, 'the generator observer is removed after the phase');
window.PM_BUSY.idle(build);
queued.shift()();
assert.equal(window.__ownerIdle[1].complete, true, 'the returned prepared handle signals completion');
assert.equal(phases.next, next, 'the generator observer is removed after completion');
console.log('PASS editor completion is signaled by the returned prepared handle');
