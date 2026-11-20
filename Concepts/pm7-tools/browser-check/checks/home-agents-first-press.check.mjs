// FO-240. Record this check with --record <film> --no-pointer-marker, then run
// tools/home-agents-first-press-film-reader.mjs on the film and the run's native-press.json.
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

	const strip = f.locator('.pmw-strip:visible').filter({ has: f.locator('.pmw-tab[data-tab-id="dashboard:agents"]') }).first();
	const home = strip.locator('.pmw-tab[data-tab-id="dashboard:home"]');
	const agents = strip.locator('.pmw-tab[data-tab-id="dashboard:agents"]');
	const homeBox = await home.boundingBox(), agentsBox = await agents.boundingBox();
	const cold = await f.evaluate(() => !window.PMW.instances['dashboard:agents']);
	const startedOnHome = await home.getAttribute('aria-selected') === 'true';
	if (!(await t.check('Settled Home and an unmounted Agents panel', !!homeBox && !!agentsBox && cold && startedOnHome))) return;

	await f.evaluate(() => {
		const read = window.__fo240Native = { clicks: [], animation: null };
		document.addEventListener('click', (e) => {
			const tab = e.target.closest('.pmw-tab');
			if (tab) read.clicks.push({ id: tab.dataset.tabId, trusted: e.isTrusted });
		}, true);
		const animate = Element.prototype.animate;
		Element.prototype.animate = function (frames, timing) {
			if (!read.animation && this.matches('.lg-carry') && frames[0]?.transform) {
				read.animation = { frames, dur: timing.duration, width: parseFloat(this.style.width), height: parseFloat(this.style.height) };
			}
			return animate.call(this, frames, timing);
		};
	});
	await t.page.mouse.move(agentsBox.x + agentsBox.width / 2, agentsBox.y + agentsBox.height / 2);
	await t.mark('First Home to Agents press');
	await t.page.mouse.down();
	await t.page.waitForTimeout(90);
	await t.page.mouse.up();
	await t.page.waitForTimeout(1400);
	await t.mark('Agents settled');

	const { clicks, animation } = await f.evaluate(() => window.__fo240Native);
	const selected = await agents.getAttribute('aria-selected') === 'true';
	const firstPress = clicks.length === 1 && clicks[0].trusted && clicks[0].id === 'dashboard:agents';
	await t.check('One trusted press selected Agents and had a carried chip', firstPress && selected && !!animation);
	writeFileSync(t.run.dir + '/native-press.json', JSON.stringify({ homeBox, agentsBox, animation, firstPress, selected }));
}
