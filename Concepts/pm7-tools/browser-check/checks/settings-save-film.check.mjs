// FO-130 film for 60 fps GPU review (record one size per run; a recording films one fixed 1920x1080 window, and
// t.viewport(w, h) inside it frames the page at that size — the page's size changes, the recorded window's does not):
//   browser-check run checks/settings-save-film.check.mjs --set page=<build> --set size=860x900 --record <out.mp4>
// Settings › AI & Providers › Services › Claude: "Use this service" off, then Turn on; then Web › "Search the web" off
// and on. Each press is marked; review the 600 ms after each mark frame by frame. The unchanged build fades the page
// from .55 and drops it 10 px about 460 ms after the press (sectionReveal); a fixed build changes only what the press
// changed. Asserts nothing about motion itself (settings-save-still is the gate); it only checks each press landed.
export default async function (t) {
	const [w, h] = String(t.args.size || '860x900').split('x').map(Number);
	await t.viewport(w, h);
	const f = await t.app.open();
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	await f.evaluate(() => PM51.go('ai', 'providers'));
	await f.waitForSelector('[data-continuous-workspace-body="providers"][data-workspace-mounted="true"]');
	await f.locator('#pm-settings-root .resource-row[data-provider="claude-code"]').first().click();
	await f.waitForSelector('#pm-settings-root .pm51-providers-order', { timeout: 8000 });
	await t.settle();
	const sw = f.locator('[data-continuous-workspace-body="providers"] .o55-scoped[data-setting-id="ai.models.provider-enabled"] .toggle[role="switch"]').first();
	await sw.evaluate((el) => el.scrollIntoView({ block: 'center' }));
	await t.page.waitForTimeout(1200);
	await t.mark('Use this service: off');
	await t.quickClick(sw, { hover: 300 });
	await t.page.waitForTimeout(1800);
	const on = f.locator('[data-continuous-workspace-body="providers"] [data-action="pm51-providers-turn-on"]').first();
	await t.check('off shows Turn on', (await on.count()) > 0);
	await on.evaluate((el) => el.scrollIntoView({ block: 'center' }));
	await t.page.waitForTimeout(800);
	await t.mark('Turn on');
	await t.quickClick(on, { hover: 300 });
	await t.page.waitForTimeout(1800);
	await f.evaluate(() => PM51.go('ai', 'web'));
	await f.waitForSelector('[data-continuous-workspace-body="web"][data-workspace-mounted="true"]');
	const web = f.locator('[data-continuous-workspace-body="web"] .toggle[role="switch"][data-setting="web.providers.web-search-enable"]').first();
	await web.evaluate((el) => el.scrollIntoView({ block: 'center' }));
	await t.page.waitForTimeout(1500);
	for (const step of ['off', 'on']) {
		await t.mark(`Search the web: ${step}`);
		await t.quickClick(f.locator('[data-continuous-workspace-body="web"] .toggle[role="switch"][data-setting="web.providers.web-search-enable"]').first(), { hover: 300 });
		await t.page.waitForTimeout(1800);
	}
	await t.check('films ran', true);
}
