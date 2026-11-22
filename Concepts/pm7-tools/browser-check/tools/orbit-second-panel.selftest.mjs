// PM7-ORBIT-SECOND-PANEL-PRESS-QUALIFICATION: the second-panel case folded an unreachable press target into its pin
// judgment and timed the 700 ms mark window from BEFORE the wheel was delivered. Real record:
// /mnt/Cursor/PuppetMaster-Evidence/tests/astra-max-15/opaque-orbit-event-comparison.json (SHA-256
// f2f70bc2466499d8cb6c0cfeefead3417c9f538056cc5664c5302d3bbded3e36; astra-max-15 2026-11-22 06:34 UTC): the opaque frozen-head Mac wide run read pressTarget
// {x:12, y:0, ok:false}, scroll {top:14, ms:764}, pin null and FAILED the pin row although no press was ever sent;
// focused stock trials with a real press read delivered-wheel-to-scroll 117.0 ms (batch 15) and 118.7 ms (batch 14),
// both unpinned, and both no-press controls pinned. An unreachable target gets its own setup result; the clock runs
// from the delivered wheel.
// node tools/orbit-second-panel.selftest.mjs [orbit-panel-hold.check.mjs to test instead]
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const { secondPanelSetup, secondPanelPinOk } = await import(process.argv[2] ? pathToFileURL(resolve(process.argv[2])).href : '../checks/orbit-panel-hold.check.mjs');
assert.equal(typeof secondPanelSetup, 'function', 'the unreachable press target needs its own setup result; the base folded it into the pin row');
assert.equal(typeof secondPanelPinOk, 'function', 'the pin judgment needs the delivered-wheel clock');
// the archived wide run: pressTarget unreachable, 764 ms measured from before delivery, no press sent
const wide = { press: true, b: { x: 12, y: 0, ok: false }, wheelAt: null };
const wideR = { before: { top: 0, pin: null, over: 127 }, scroll: { top: 14, ms: 764 }, pin: null, connected: true, uid: 'orbitA:2' };
assert.equal(secondPanelSetup(wide).ok, false, 'the unreachable press target is a setup result');
assert.match(secondPanelSetup(wide).why, /unreachable/);
// the base pin predicate on the same record failed as a product verdict: (!press || b.ok) was false
assert.equal((!wide.press || wide.b?.ok) && wideR.connected && wideR.scroll?.ms < 700, false);
// the focused head trial: a real press, delivered-wheel-to-scroll 117.0 ms, unpinned
const head = { press: true, b: { x: 1612, y: 703.125, ok: true }, wheelAt: 1000 };
const headR = { before: { top: 0, pin: null, over: 127 }, scroll: { top: 14, ms: 117 }, pin: null, connected: true, uid: 'orbitA:2' };
assert.equal(secondPanelSetup(head).ok, true);
assert.equal(secondPanelPinOk({ press: true, r: headR }), true);
// the no-press control pins at 118.7 ms from the delivered wheel
const ctrlR = { before: { top: 0, pin: null, over: 127 }, scroll: { top: 14, ms: 119 }, pin: 'node:orbitA:2', connected: true, uid: 'orbitA:2' };
assert.equal(secondPanelSetup({ press: false, b: null, wheelAt: 1000 }).ok, true);
assert.equal(secondPanelPinOk({ press: false, r: ctrlR }), true);
// a delivered press whose panel still pins is a product failure, kept
assert.equal(secondPanelPinOk({ press: true, r: { ...headR, pin: 'node:orbitA:2' } }), false);
// a control whose scroll lands past 700 ms from the DELIVERED wheel does not pin: the judgment still fails
assert.equal(secondPanelPinOk({ press: false, r: { ...ctrlR, scroll: { top: 14, ms: 764 }, pin: null } }), false);
// no trusted wheel delivered: setup, not a pin verdict
assert.equal(secondPanelSetup({ press: false, b: null, wheelAt: null }).ok, false);
assert.match(secondPanelSetup({ press: false, b: null, wheelAt: null }).why, /wheel/);
console.log('PASS the archived unreachable press (x12 y0, 764 ms from before delivery) is its own setup result, the focused 117.0/118.7 ms delivered-wheel trials judge (press unpinned, control pinned), a delivered press that still pins and a late control scroll still fail, and an undelivered wheel is setup');
