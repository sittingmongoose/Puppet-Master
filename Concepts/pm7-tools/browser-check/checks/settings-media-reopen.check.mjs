// FO-212 (sol-recheck-fo182-186, 2026-11-15): Settings › Media abilities › Pictures. Choose a picture service and
// the GPT Image model, press "Use this service", then close and reopen Settings and open the picture editor again.
// The editor must show exactly what was chosen — the service and the model — and the stored route must be unchanged.
// picturePanel used to read the retired media.image.provider (PM51.value returns undefined for it), so a reopen fell
// back to "No service" with an empty model even though route.primary still held the choice. Both surfaces.

const SVC_KEY = 'OpenAI/Codex subscription';
const SVC_LABEL = 'ChatGPT / Codex plan';
const MODEL = 'GPT Image';

async function settings(t, surface) {
	await t.viewport(1920, 1080);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	return f;
}
async function goMedia(t, f) {
	await f.evaluate(() => PM51.go('ai', 'media'));
	await f.waitForSelector('[data-continuous-workspace-body="media"][data-workspace-mounted="true"]', { timeout: 15000 });
	await t.settle();
}
async function pickRoute(t, f) {
	for (let i = 0; i < 2; i++) {
		await f.evaluate(() => { const b = document.querySelector('[data-continuous-workspace-body="media"] .resource-row[data-id="image-generation"]'); b.scrollIntoView({ block: 'center' }); b.click(); });
		const ok = await f.waitForFunction(() => { const x = document.querySelector('[data-continuous-workspace-body="media"] .pm51-detail-title'); return !!x && x.textContent.trim().startsWith('Image Generation'); }, null, { timeout: 3000 }).then(() => true).catch(() => false);
		if (ok) break;
	}
	await t.page.waitForTimeout(400);
}
async function openPicturePanel(t, f) {
	await f.evaluate(() => { const b = [...document.querySelectorAll('[data-continuous-workspace-body="media"] .pm51-detail button')].find((x) => /^(Choose|Change)( service)?$/.test(x.textContent.trim())); b.scrollIntoView({ block: 'center' }); b.click(); });
	await f.waitForSelector('.drawer-wrap select.pm51-media-svc', { state: 'attached', timeout: 8000 });
	await t.settle();
	await t.page.waitForTimeout(300);
}
// an upgraded dropdown: its trigger, then the option by its words (real clicks)
async function pickOption(t, f, select, label) {
	const trigger = select.locator('..').locator('.pm51-dd-trigger').first();
	await trigger.scrollIntoViewIfNeeded();
	await trigger.click();
	await f.locator('.pm51-dd-list [role="option"]').filter({ hasText: label }).first().click({ timeout: 8000 });
	await f.locator('.pm51-dd-list').waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
	await t.settle();
	await t.page.waitForTimeout(400);
}
const SHOWN = () => {
	const svc = document.querySelector('.drawer-wrap select.pm51-media-svc');
	const model = document.querySelector('.drawer-wrap select.pm51-media-model');
	const lab = (s) => (s && s.selectedIndex >= 0 ? s.options[s.selectedIndex].textContent.trim() : null);
	return { svcValue: svc ? svc.value : null, svcLabel: lab(svc), modelValue: model ? model.value : null, modelLabel: lab(model) };
};
const STORED = () => {
	const st = window.PM12_KIMI && window.PM12_KIMI.getState ? window.PM12_KIMI.getState() : null;
	const r = st && (st.mediaRoutes || []).find((x) => x.id === 'image-generation');
	return r && r.primary ? { provider: r.primary.provider, picture: r.primary.picture, model: r.primary.model } : null;
};

export const tests = {};
for (const surface of ['normal', 'sandbox']) {
	const T = (name, fn) => { tests[`${name} (${surface})`] = async (t) => { if (!t.app.surfaces().includes(surface)) { await t.check(`${surface} surface not asked for`, true); return; } await fn(t); }; };

	T('FO-212 the picture editor reopens on the chosen service and model', async (t) => {
		const f = await settings(t, surface);
		await goMedia(t, f);
		await pickRoute(t, f);
		await openPicturePanel(t, f);
		// choose the service, then the GPT Image model, and save
		await pickOption(t, f, f.locator('.drawer-wrap select.pm51-media-svc'), SVC_LABEL);
		await f.waitForSelector('.drawer-wrap select.pm51-media-model', { state: 'attached', timeout: 8000 });
		await pickOption(t, f, f.locator('.drawer-wrap select.pm51-media-model'), MODEL);
		await f.locator('.drawer-wrap .pm51-panel-foot button.primary', { hasText: 'Use this service' }).first().click();
		await t.settle();
		await t.page.waitForTimeout(500);
		const saved = await f.evaluate(STORED);
		await t.check(`"Use this service" stores the choice (model "${saved && saved.model}")`, !!saved && saved.picture === SVC_KEY && saved.model === MODEL, JSON.stringify(saved));
		// close Settings (Home), reopen it, and open the picture editor again
		await f.locator('#tab-dashboard').click();
		await t.settle();
		await f.locator('#tab-settings').click();
		await t.settle();
		await goMedia(t, f);
		await pickRoute(t, f);
		await openPicturePanel(t, f);
		const shown = await f.evaluate(SHOWN);
		const after = await f.evaluate(STORED);
		await t.check(`the reopened editor shows the chosen service ("${shown.svcLabel}")`, shown.svcValue === SVC_KEY && shown.svcLabel === SVC_LABEL, JSON.stringify(shown));
		await t.check(`the reopened editor shows the chosen model ("${shown.modelLabel}")`, shown.modelValue === MODEL, JSON.stringify(shown));
		await t.check(`the stored route is unchanged by the reopen (model "${after && after.model}")`, !!after && after.picture === SVC_KEY && after.model === MODEL, JSON.stringify(after));
	});
}
