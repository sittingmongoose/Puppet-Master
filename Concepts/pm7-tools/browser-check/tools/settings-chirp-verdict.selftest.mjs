// PM7-B12-PIP-CHIRP-ALEXIS: B-12 "Play chirps as the team works (engine log)" failed 1 of 144 runs on Alexis with
// engine log [] on main's own page (d69850c150) and the pm7-perf pages alike (runs a5-sle-main-s0.txt,
// a4-sle-b3-s0.txt, TOOL-ISSUES 2026-11-15): a host sound matter, not a branch. The engine's own test hooks name the
// host cause: O55.sound.ctx.state (the product resumes it on every trusted press, 15-sound.js:1471, so a context
// still not running after the trusted Play press was refused by the host) and log entries dropped 'no-audio'
// (15-sound.js:1750/1496). The row must settle the log before reading and name that host cause as could-not-judge;
// a silent engine on a running context still fails.
// node tools/settings-chirp-verdict.selftest.mjs [settings-look-editors.check.mjs to test instead]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const { chirpVerdict } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/settings-look-editors.check.mjs');
assert.equal(typeof chirpVerdict, 'function', 'B-12 needs a host-aware chirp verdict; the base failed the page on an empty engine log');
// three played chirps on a running context: pass, as before
const ok = chirpVerdict({ got: ['pip:cheer', 'pip:alert', 'pip:happy'], want: 3, host: { ctx: 'running', muted: false, dropped: [], entries: 3 } });
assert.equal(ok.pass, true);
assert.equal(ok.couldNotJudge, false);
// the Alexis shape: empty log, context suspended after the trusted press: host cause, could-not-judge
const suspended = chirpVerdict({ got: [], want: 3, host: { ctx: 'suspended', muted: false, dropped: [], entries: 0 } });
assert.equal(suspended.pass, false);
assert.equal(suspended.couldNotJudge, true);
assert.match(suspended.note, /host audio/);
assert.match(suspended.note, /suspended/);
// no context at all after the trusted press: the host refused creation
assert.equal(chirpVerdict({ got: [], want: 3, host: { ctx: 'none', muted: false, dropped: [], entries: 0 } }).couldNotJudge, true);
// the engine dropped chirps 'no-audio': the device is unavailable, named
const dropped = chirpVerdict({ got: ['pip:cheer'], want: 3, host: { ctx: 'running', muted: false, dropped: ['pip:alert:no-audio', 'pip:happy:no-audio'], entries: 3 } });
assert.equal(dropped.couldNotJudge, true);
assert.match(dropped.note, /no-audio/);
// a silent engine on a running context with no drops is the product's failure, kept
const silent = chirpVerdict({ got: [], want: 3, host: { ctx: 'running', muted: false, dropped: [], entries: 0 } });
assert.equal(silent.pass, false);
assert.equal(silent.couldNotJudge, false);
// a short count on a running context still fails
const short = chirpVerdict({ got: ['pip:cheer', 'pip:alert'], want: 3, host: { ctx: 'running', muted: false, dropped: [], entries: 2 } });
assert.equal(short.pass, false);
assert.equal(short.couldNotJudge, false);
// the sample row's want of 1 judges the same way
assert.equal(chirpVerdict({ got: ['pip:wake'], want: 1, host: { ctx: 'running', muted: false, dropped: [], entries: 1 } }).pass, true);
assert.equal(chirpVerdict({ got: [], want: 1, host: { ctx: 'suspended', muted: false, dropped: [], entries: 0 } }).couldNotJudge, true);
console.log('PASS three played chirps pass, the Alexis empty-log shape (suspended/absent context or no-audio drops after the trusted press) is a named host-audio could-not-judge, and a silent or short engine on a running context still fails');
