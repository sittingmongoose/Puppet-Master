// perf-chat-run's visit look (PM7PERF-CHATRUN-NIER-AFTER-VISIT), on the probe's painted states: no browser.
// node tools/chat-look-visit.selftest.mjs
import assert from 'node:assert/strict';
import { lookRoute } from '../browser-check.config.mjs';
import { visitRanInLook } from '../checks/perf-chat-run.check.mjs';

const misses = [];
function check(name, fn) { try { fn(); } catch (e) { misses.push(name + ': ' + e.message); } }

check('loose preview', () => {
	const loose = lookRoute('nier-dark', { loose: true, on: false });
	assert.equal(loose.save, true, 'a lingering onboarding preview is ended by a Settings write');
	assert.match(String(loose.note), /loose/);
});
check('ordinary look', () => assert.equal(lookRoute('basic-dark', null).save, false, 'an ordinary look stays a persist:false paint'));
check('asked save', () => assert.equal(lookRoute('nier-dark', null, { save: true }).save, true, 'the visit can ask to re-apply through Settings'));
// lane Q's probe: after the visit, look() asks for nier-dark and the page is still basic-dark with NieR off
check('probe nier-dark', () => assert.equal(visitRanInLook('nier-dark', { theme: 'basic-dark', nier: false }), false, 'NieR off in Basic Dark is not the look under test'));
check('nier-dark held', () => assert.equal(visitRanInLook('nier-dark', { theme: 'basic-dark', nier: true }), true));
check('basic-light held', () => assert.equal(visitRanInLook('basic-light', { theme: 'basic-light', nier: false }), true, 'the run\'s own look, when that is the look under test'));
check('run look', () => assert.equal(visitRanInLook('glass-light', { theme: 'basic-light', nier: false }), false, 'a visit in the run\'s own look is not the look under test (the check logs it as a note)'));
check('no sample', () => assert.equal(visitRanInLook('nier-dark', null), false, 'no painted sample is not a pass'));
if (misses.length) { console.error(misses.join('\n')); process.exit(1); }
console.log('PASS a loose preview is a Settings write, and the visit\'s painted look has to be the look under test');
