// FO-240. Record this check with --record <film> --no-pointer-marker, then run
// tools/home-agents-first-press-film-reader.mjs on the film and the run's native-press.json.
// Round 6b (2026-11-21): the pointer rests on the tab for --set hover=<ms> (default 400) before the press is marked, so
// the first change on the tab after the mark is the press's own (the film reader's onset rule), and the page reports
// the carry's clock on every frame until it lands: the carried chip must run on the animation timeline itself (playing,
// its current time the timeline's time less its start time) from its first frame, never paused and stepped by script
// (batch 14's round 5 advanced a paused carry from frame callbacks, so a long frame on the main thread stopped it).
import { writeFileSync } from 'node:fs';
import { setLookBySetting } from '../helpers/settings-look.mjs';

export default async function (t) {
	await t.viewport(1920, 1080);
	await t.emulate({ reducedMotion: 'no-preference' });
	const f = await t.app.open();
	await f.locator('#tab-settings').click();
	await t.settle();
	await setLookBySetting(t, f, 'friendly-dark');
	await f.locator('.title-bar nav.page-tabs .page-tab').first().click();
	await t.page.waitForTimeout(1700);

	const rail = t.args.route === 'rail';
	const strip = rail ? f.locator('#panel-files > .pm-segtab:visible')
		: f.locator('.pmw-strip:visible').filter({ has: f.locator('.pmw-tab[data-tab-id="dashboard:agents"]') }).first();
	const item = rail ? '.pm-segtab-item' : '.pmw-tab';
	const tab = rail ? 'data-tab' : 'data-tab-id';
	const from = strip.locator(`${item}[${tab}="${rail ? 'explorer' : 'dashboard:home'}"]`);
	const targetId = rail ? 'changed' : 'dashboard:agents';
	const to = strip.locator(`${item}[${tab}="${targetId}"]`);
	const homeBox = await from.boundingBox(), agentsBox = await to.boundingBox();
	const isSelected = async (locator) => rail ? locator.evaluate((e) => e.classList.contains('active'))
		: await locator.getAttribute('aria-selected') === 'true';
	const cold = rail || await f.evaluate(() => !window.PMW.instances['dashboard:agents']);
	if (!(await t.check(rail ? 'Fresh Files rail with Explorer selected' : 'Settled Home and an unmounted Agents panel',
		!!homeBox && !!agentsBox && cold && await isSelected(from) && !(await isSelected(to))))) return;

	await f.evaluate(({ item, tab, scope }) => {
		const read = window.__fo240Native = { clicks: [], animation: null };
		document.addEventListener('click', (e) => {
			const button = e.target.closest(item);
			if (button?.closest(scope)) read.clicks.push({ id: button.getAttribute(tab), trusted: e.isTrusted });
		}, true);
		const animate = Element.prototype.animate;
		Element.prototype.animate = function (frames, timing) {
			const a = animate.call(this, frames, timing);
			if (!read.animation && this.matches('.lg-carry') && this.closest(scope) && frames?.[0]?.transform) {
				read.animation = { frames, dur: timing.duration, width: parseFloat(this.style.width), height: parseFloat(this.style.height) };
				read.carry = a; read.clock = [];
				const tick = () => {
					const tl = document.timeline.currentTime, st = a.startTime, ct = a.currentTime;
					read.clock.push({ tl, st, ct, state: a.playState });
					if (a.playState !== 'finished' && a.playState !== 'idle' && read.clock.length < 400) requestAnimationFrame(tick);
				};
				requestAnimationFrame(tick);
			}
			return a;
		};
	}, { item, tab, scope: rail ? '#panel-files' : '.pmw-strip' });
	await t.page.mouse.move(agentsBox.x + agentsBox.width / 2, agentsBox.y + agentsBox.height / 2);
	await t.page.waitForTimeout(Number(t.args.hover ?? 400));
	await t.mark(rail ? 'First Explorer to Changed press' : 'First Home to Agents press');
	await t.page.mouse.down();
	await t.page.waitForTimeout(90);
	await t.page.mouse.up();
	await t.page.waitForTimeout(1400);
	await t.mark(rail ? 'Changed settled' : 'Agents settled');

	const { clicks, animation, clock } = await f.evaluate(() => { const r = window.__fo240Native; return { clicks: r.clicks, animation: r.animation, clock: r.clock || [] }; });
	const selected = await isSelected(to);
	const firstPress = clicks.length === 1 && clicks[0].trusted && clicks[0].id === targetId;
	await t.check(`One trusted press selected ${rail ? 'Changed' : 'Agents'} and had a carried chip`, firstPress && selected && !!animation);
	// the carry's clock: once it has a start time, every frame until it ends shows it playing on the timeline
	const started = clock.filter((c) => c.st != null);
	const off = started.filter((c) => c.state === 'paused' || (c.state === 'running' && Math.abs(c.ct - (c.tl - c.st)) > 1));
	const paused = clock.filter((c) => c.state === 'paused');
	await t.check('The carried chip runs on the animation timeline from its first frame to its landing (never paused, never stepped by script)',
		!!animation && started.length >= 3 && !off.length && !paused.length,
		`${clock.length} frames read, ${started.length} with a start time, ${paused.length} paused, ${off.length} off the timeline` +
		(off.length ? ` (first: ${JSON.stringify(off[0])})` : paused.length ? ` (first: ${JSON.stringify(paused[0])})` : ''));
	writeFileSync(t.run.dir + '/native-press.json', JSON.stringify({ homeBox, agentsBox, animation, firstPress, selected, ...(rail ? { route: 'rail' } : {}) }));
}
