// PM7-B12-PIP-CHIRP-ALEXIS + R135-F4: B-12 "Play chirps as the team works (engine log)" failed 1 of 144 runs on
// Alexis with engine log [] on main's own page (d69850c150) and the pm7-perf pages alike. The host cause must be
// one that actually stops speak() logging: 15-sound.js:2529-2539 logs played:true even on a SUSPENDED context
// (ensureContext returns it and resume() is async), so only a context that could not be created or was closed
// ('none'/'closed') or 'no-audio' drops (voice(), 15-sound.js:1750) name the host. Every other drop reason (rate,
// merged, rest, gesture, ...) is ordinary engine traffic; a silent or short pip log with them still FAILS the page.
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
// R135-F4 RED: a suspended context still logs played:true, so an empty pip log on it is the product's failure
const suspended = chirpVerdict({ got: [], want: 3, host: { ctx: 'suspended', muted: false, dropped: [], entries: 0 } });
assert.equal(suspended.pass, false);
assert.equal(suspended.couldNotJudge, false, 'suspended does not block speak(); the base hid this page failure as host audio');
// no context at all after the trusted press: the host refused creation
assert.equal(chirpVerdict({ got: [], want: 3, host: { ctx: 'none', muted: false, dropped: [], entries: 0 } }).couldNotJudge, true);
// a context the host closed: speak() returns false without logging
assert.equal(chirpVerdict({ got: [], want: 3, host: { ctx: 'closed', muted: false, dropped: [], entries: 0 } }).couldNotJudge, true);
// the engine dropped chirps 'no-audio': the device is unavailable, named
const dropped = chirpVerdict({ got: ['pip:cheer'], want: 3, host: { ctx: 'running', muted: false, dropped: ['pip:alert:no-audio', 'pip:happy:no-audio'], entries: 3 } });
assert.equal(dropped.couldNotJudge, true);
assert.match(dropped.note, /no-audio/);
// R135-F4 RED: rate/merged drops are unrelated UI traffic, not a host block; the broken chirp count must FAIL
const otherDrops = chirpVerdict({ got: [], want: 3, host: { ctx: 'running', muted: false, dropped: ['ui:click:rate', 'quest:merged'], entries: 2 } });
assert.equal(otherDrops.pass, false);
assert.equal(otherDrops.couldNotJudge, false, 'the base counted every drop reason as host audio');
// a no-audio drop alongside other reasons still names the host cause
const mixed = chirpVerdict({ got: ['pip:cheer'], want: 3, host: { ctx: 'running', muted: false, dropped: ['ui:click:rate', 'pip:alert:no-audio'], entries: 3 } });
assert.equal(mixed.couldNotJudge, true);
assert.match(mixed.note, /no-audio/);
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
assert.equal(chirpVerdict({ got: [], want: 1, host: { ctx: 'suspended', muted: false, dropped: [], entries: 0 } }).couldNotJudge, false);
assert.equal(chirpVerdict({ got: [], want: 1, host: { ctx: 'none', muted: false, dropped: [], entries: 0 } }).couldNotJudge, true);
console.log('PASS three played chirps pass; only a none/closed context or no-audio drops name the host as could-not-judge; a suspended context, rate/merged drops, or a silent/short engine on a running context fail the page');
