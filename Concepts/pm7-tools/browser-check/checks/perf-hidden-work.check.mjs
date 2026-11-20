// What cannot be seen does not keep the page awake: the terminal's timers and its parked Customize screen
// (2026-11-10 performance pass, lane A, ae047049eb; the terminal's own unit test is harness/checks/visibility.test.mjs).
//
// TIMERS. Every terminal ran its cursor blink (530 ms) and its header clock (1 s) whether or not it was shown: on
// Settings, with Home's terminal out of sight, about three timer callbacks a second, each one writing into a page nobody
// sees. View._timers now runs the blink only while the terminal is visible and the clock only while it is visible or a
// command runs. Here: on Home, with the docked terminal in view, the blink's timer still fires (so the terminal is
// there and its cursor blinks); on Settings, timer callbacks asked for from terminal/js/70-view.js: none.
//
// CUSTOMIZE. The terminal's Customize screen is kept ready between visits and redraws itself, unseen, after a look
// change, in an idle moment of 45 ms or more. While the page stays busy no such moment comes, and it used to ask for
// the next idle callback from inside each short one: about 110 callbacks a second for up to ten seconds. It now waits
// on a timer between tries (400 ms doubling to 2 s). Here: the look changes while a do-nothing animation-frame loop
// keeps the page busy; from 3.5 s to 9.5 s after the change (the screen's own 3 s settle is over, its 10 s backstop is
// not) the idle callbacks asked for from terminal/js/77-customize.js are at least 1 (it is still trying) and at most
// --set tries (default 20; before: several hundred).
//
// Callbacks are attributed by the asking stack's innermost page frame and the build's own file markers
// (helpers/built-source.mjs, helpers/callback-probe.mjs).
// --set looks=<from>,<to> for the Customize part (default basic-dark,glass-dark)   --set settle=<ms> (default 30000)
// Both surfaces. A terminal that never blinks on Home, or a Customize screen that never tries, fails as "could not judge".
import { muteSound, parkPointer } from '../helpers/quiet-page.mjs';
import { CALLBACK_PROBE } from '../helpers/callback-probe.mjs';
import { pageSource, fileRegion, linesOfSite } from '../helpers/built-source.mjs';

const VIEW = 'terminal/js/70-view.js', CUSTOMIZE = 'terminal/js/77-customize.js';

export default async function (t) {
	const [lookA, lookB] = String(t.args.looks || 'basic-dark,glass-dark').split(',');
	const tries = Number(t.args.tries || 20);
	const W = 1920, H = 1080;
	await t.viewport(W, H);
	await muteSound(t.page);
	await t.page.addInitScript(CALLBACK_PROBE);
	const src = await pageSource(t), rv = fileRegion(src, VIEW), rc = fileRegion(src, CUSTOMIZE);
	await t.check(`the built page marks ${VIEW} and ${CUSTOMIZE}`, !!rv && !!rc, rv && rc ? `lines ${rv.from}-${rv.to} and ${rc.from}-${rc.to}` : 'a marker is missing or not unique: their callbacks cannot be told apart');
	if (!rv || !rc) return;
	const from = (rows, r) => rows.filter(([, site]) => { const l = linesOfSite(site)[0]; return l >= r.from && l <= r.to; });
	const total = (rows) => rows.reduce((a, [n]) => a + n, 0);
	const show = (rows, secs) => rows.slice(0, 5).map(([n, s]) => `${(n / secs).toFixed(1)}/s ${s.slice(0, 90)}`).join(' | ') || 'none';

	const f = await t.app.open({ query: 'pm-warm=0' });
	await f.evaluate(() => document.fonts.ready.then(() => true));
	await t.app.look(lookA);
	await t.page.waitForTimeout(Number(t.args.settle ?? 30000));
	const count = async (ms) => { await f.evaluate(() => { window.__cbp.arm(); }); await t.page.waitForTimeout(ms); return f.evaluate(() => window.__cbp.read()); };

	// ---- timers ----
	await f.evaluate(() => PM_PAGES.go('dashboard'));
	await parkPointer(t.page, W, H);
	await t.page.waitForTimeout(4000);
	const home = await count(4000), homeView = from(home.timers, rv);
	t.log(`Home, terminal in view: timer callbacks from ${VIEW}: ${show(homeView, home.secs)}`);
	const blinks = total(homeView.filter(([, s]) => /setInterval 530ms/.test(s)));
	await t.check('Home: the docked terminal\'s cursor blinks (its 530 ms timer fires)', blinks >= 4, `${blinks} callbacks in ${home.secs.toFixed(1)} s${blinks ? '' : ': no terminal in view, could not judge'}`);
	await f.evaluate(() => PM_PAGES.go('settings'));
	await parkPointer(t.page, W, H);
	await t.page.waitForTimeout(4000);
	const set = await count(4000), setView = from(set.timers, rv);
	t.log(`Settings, no terminal in view: timer callbacks from ${VIEW}: ${show(setView, set.secs)}`);
	if (blinks >= 4) await t.check('Settings: no terminal timer fires while no terminal is shown', total(setView) === 0, `${total(setView)} callbacks in ${set.secs.toFixed(1)} s: ${show(setView, set.secs)}`);

	// ---- the parked Customize screen after a look change, the page kept busy ----
	await f.evaluate(() => { window.__busy = true; const loop = () => { if (window.__busy) requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
	await t.app.look(lookB);
	await t.page.waitForTimeout(3500);
	const cz = await count(6000), mine = from(cz.idle, rc), n = total(mine);
	await f.evaluate(() => { window.__busy = false; });
	t.log(`after ${lookA} -> ${lookB}, page kept busy, 3.5-9.5 s after the change: idle callbacks from ${CUSTOMIZE}: ${n} (${show(mine, cz.secs)}); all idle callbacks ${total(cz.idle)}`);
	await t.check('the parked Customize screen is still trying to draw after the look change', n >= 1, n ? `${n} idle callbacks` : `none from ${CUSTOMIZE} in ${cz.secs.toFixed(1)} s (of ${total(cz.idle)} in the page): could not judge`);
	if (n >= 1) await t.check(`and waits between tries (at most ${tries} idle callbacks in 6 s)`, n <= tries, `${n} idle callbacks = ${(n / cz.secs).toFixed(1)}/s`);
	await parkPointer(t.page, W, H);
}
