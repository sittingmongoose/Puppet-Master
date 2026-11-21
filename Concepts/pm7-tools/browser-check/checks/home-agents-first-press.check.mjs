// FO-240. Record this check with --record <film> --no-pointer-marker, then run
// tools/home-agents-first-press-film-reader.mjs on the film and the run's native-press.json.
// The recorded check passes only when the reader clears both the step and the mid-travel hold rules.
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
	const agents = rail ? null : await f.evaluate(() => {
		const entry = window.PMW.instances['dashboard:agents'];
		if (!entry) return { mounted: false, prepared: false };
		const { host, visible } = entry;
		return { mounted: true, prepared: !visible && host.hidden && host.inert && host.hasAttribute('data-pmw-prepared') };
	});
	const fresh = rail || !agents.mounted || agents.prepared;
	if (!(await t.check(rail ? 'Fresh Files rail with Explorer selected' : 'Settled Home before its first Agents selection',
		!!homeBox && !!agentsBox && fresh && await isSelected(from) && !(await isSelected(to))))) return;

	await f.evaluate(({ item, tab, scope }) => {
		const read = window.__fo240Native = { clicks: [], pointer: [], animation: null };
		for (const type of ['pointerdown', 'pointerup']) document.addEventListener(type, (e) => {
			const button = e.target.closest(item);
			if (button?.closest(scope)) read.pointer.push({ type, id: button.getAttribute(tab), at: e.timeStamp, trusted: e.isTrusted });
		}, true);
		document.addEventListener('click', (e) => {
			const button = e.target.closest(item);
			if (button?.closest(scope)) read.clicks.push({ id: button.getAttribute(tab), at: e.timeStamp, trusted: e.isTrusted });
		}, true);
		const animate = Element.prototype.animate;
		Element.prototype.animate = function (frames, timing) {
			if (!read.animation && this.matches('.lg-carry') && this.closest(scope) && frames?.[0]?.transform) {
				read.animation = { frames, dur: timing.duration, width: parseFloat(this.style.width), height: parseFloat(this.style.height), at: performance.now(), prepared: !!this.__lgWasPrepared };
			}
			return animate.call(this, frames, timing);
		};
		const play = Animation.prototype.play;
		Animation.prototype.play = function () {
			const target = this.effect?.target;
			if (!read.animation && target?.__lgWasPrepared && target.matches('.lg-carry') && target.closest(scope)) {
				const kf = this.effect.getKeyframes().map(({ transform, computedOffset: o }) => {
					const m = new DOMMatrix(transform);
					return { o, dx: m.e, dy: m.f, r: Math.atan2(m.b, m.a) * 180 / Math.PI,
						kx: Math.hypot(m.a, m.b), ky: Math.hypot(m.c, m.d) };
				});
				read.animation = { kf, dur: this.effect.getTiming().duration, width: parseFloat(target.style.width),
					height: parseFloat(target.style.height), at: performance.now(), prepared: true };
			}
			return play.call(this);
		};
	}, { item, tab, scope: rail ? '#panel-files' : '.pmw-strip' });
	// Map trusted input timestamps to the host clock used by the recording's sync flash.
	let clock = null;
	for (let sample = 0; sample < 5; sample++) {
		const before = Date.now();
		const { timeOrigin, now } = await f.evaluate(() => ({ timeOrigin: performance.timeOrigin, now: performance.now() }));
		const after = Date.now(), rtt = after - before;
		if (!clock || rtt < clock.rtt) clock = { timeOrigin, offset: (before + after) / 2 - timeOrigin - now, rtt };
	}
	await t.page.mouse.move(agentsBox.x + agentsBox.width / 2, agentsBox.y + agentsBox.height / 2);
	await t.mark(rail ? 'First Explorer to Changed press' : 'First Home to Agents press');
	await t.page.mouse.down();
	await t.page.waitForTimeout(90);
	await t.page.mouse.up();
	await t.page.waitForTimeout(1400);
	await t.mark(rail ? 'Changed settled' : 'Agents settled');

	const { clicks, pointer, animation } = await f.evaluate(() => window.__fo240Native);
	const selected = await isSelected(to);
	const firstPress = clicks.length === 1 && clicks[0].trusted && clicks[0].id === targetId;
	await t.check(`One trusted press selected ${rail ? 'Changed' : 'Agents'} and had a carried chip`, firstPress && selected && !!animation);
	writeFileSync(t.run.dir + '/native-press.json', JSON.stringify({ homeBox, agentsBox, agents, clock, pointer, clicks, animation, firstPress, selected, ...(rail ? { route: 'rail' } : {}) }));
}
