// FO-130 film for 60 fps GPU review (record one size per run; a recording refuses viewport changes):
//   browser-check run checks/settings-save-film.check.mjs --set page=<build> --set size=860x900 [--set look=retro-light] --record <out.mp4>
// Settings › AI & Providers › Services › Claude: "Use this service" off, then Turn on; then Web › "Search the web" off
// and on. Each press is marked; review the 600 ms after each mark frame by frame. The unchanged build fades the page
// from .55 and drops it 10 px about 460 ms after the press (sectionReveal); a fixed build changes only what the press
// changed. Asserts nothing about motion itself (settings-save-still is the gate); it checks each press landed, and that
// the look it names is the one painted right before every press (helpers/settings-look.mjs: the look is picked through
// Settings' Theme and Light-or-dark rows, so Settings keeps it; astra-review-l1s found a temporary look reset to Basic
// Dark by Settings' own saves). --set look= one look (default basic-dark); --set looks=all (or a list) runs the
// functional pass in each, one page each, clearing the saved look after; --set lookBite=1 paints Basic Dark back right before
// each guard (it must fail); --set motion=reduce (the system's Reduced Motion) or app (the app's Reduce animations).
import { LOOKS } from '../browser-check.config.mjs';
import { setLookBySetting, guardPaintedLook, setMotionMedia, setMotionApp } from '../helpers/settings-look.mjs';

export default async function (t) {
	const [w, h] = String(t.args.size || '860x900').split('x').map(Number);
	const looks = t.args.looks ? (String(t.args.looks) === 'all' ? LOOKS : String(t.args.looks).split(',')) : [String(t.args.look || 'basic-dark')];
	const motion = String(t.args.motion || 'no-preference');   // no-preference | reduce (the system's) | app (Reduce animations)
	await setMotionMedia(t, motion);
	await t.viewport(w, h);
	for (const look of looks) {
		const f = await t.app.open();
		await f.locator('#tab-settings').click();
		await t.settle();
		await setLookBySetting(t, f, look);
		await setMotionApp(t, f, motion);
		await f.evaluate(() => PM51.go('ai', 'providers'));
		await f.waitForSelector('[data-continuous-workspace-body="providers"][data-workspace-mounted="true"]');
		await f.locator('#pm-settings-root .resource-row[data-provider="claude-code"]').first().click();
		await f.waitForSelector('#pm-settings-root .pm51-providers-order', { timeout: 8000 });
		await t.settle();
		const sw = f.locator('[data-continuous-workspace-body="providers"] .o55-scoped[data-setting-id="ai.models.provider-enabled"] .toggle[role="switch"]').first();
		await sw.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
		await t.page.waitForTimeout(1200);
		await guardPaintedLook(t, f, look, `${look}: before Use this service`);
		await t.mark(`${look} Use this service: off`);
		await t.quickClick(sw, { hover: 300 });
		await t.page.waitForTimeout(1800);
		const on = f.locator('[data-continuous-workspace-body="providers"] [data-action="pm51-providers-turn-on"]').first();
		await t.check(`${look}: off shows Turn on`, (await on.count()) > 0);
		await on.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
		await t.page.waitForTimeout(800);
		await guardPaintedLook(t, f, look, `${look}: before Turn on`);
		await t.mark(`${look} Turn on`);
		await t.quickClick(on, { hover: 300 });
		await t.page.waitForTimeout(1800);
		await t.check(`${look}: Turn on brings the switch back, on`, await sw.evaluate((el) => el.isConnected && el.getAttribute('aria-checked') === 'true').catch(() => false) || await f.locator('[data-continuous-workspace-body="providers"] .o55-scoped[data-setting-id="ai.models.provider-enabled"] .toggle[role="switch"][aria-checked="true"]').count() > 0);
		await f.evaluate(() => PM51.go('ai', 'web'));
		await f.waitForSelector('[data-continuous-workspace-body="web"][data-workspace-mounted="true"]');
		const web = f.locator('[data-continuous-workspace-body="web"] .toggle[role="switch"][data-setting="web.providers.web-search-enable"]').first();
		await web.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
		await t.page.waitForTimeout(1500);
		for (const step of ['off', 'on']) {
			await guardPaintedLook(t, f, look, `${look}: before Search the web ${step}`);
			const was = await web.getAttribute('aria-checked');
			await t.mark(`${look} Search the web: ${step}`);
			await t.quickClick(web, { hover: 300 });
			await t.page.waitForTimeout(1800);
			await t.check(`${look}: Search the web ${step} landed`, (await web.getAttribute('aria-checked')) !== was);
		}
		await t.app.resetLayout();   // the picked look is saved: the next fresh page (and the next check) starts in Basic Dark
	}
}
