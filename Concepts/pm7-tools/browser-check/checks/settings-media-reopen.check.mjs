// FO-212 (sol-recheck-fo182-186, 2026-11-15): Settings › Media abilities › Pictures. Choose a picture service and
// the GPT Image model, press "Use this service", then close and reopen Settings and open the picture editor again.
// The editor must show exactly what was chosen — the service and the model — and the stored route must be unchanged.
// picturePanel used to read the retired media.image.provider (PM51.value returns undefined for it), so a reopen fell
// back to "No service" with an empty model even though route.primary still held the choice. Both surfaces.
// FO-217 (sol-recheck-fo212-213 M1): after "Use this service" the Pictures row's Uses names the chosen service and
// model, never "Nothing yet" / "Choose a service to begin." — the summary readers take the route too. Both surfaces.
// FO-218 (sol-recheck-fo212-213 M2): on the normal surface a page reload keeps the chosen service and model, and the
// stored route is unchanged. The sandbox's opaque origin has no storage; that case says so instead of asserting
// persistence there.
// Navigation is by visible real clicks (FO212-REOPEN-NAV-EVAL): the Settings tab, the AI & Providers chapter, the
// Media & Output page-index entry, the Image Generation row and the Choose/Change service button — no PM51.go and
// no in-page element.click(). The dropdown choices and "Use this service" are real clicks as before.

const SVC_KEY = 'OpenAI/Codex subscription';
const SVC_LABEL = 'ChatGPT / Codex plan';
const MODEL = 'GPT Image';
const MEDIA_MOUNTED = '[data-continuous-workspace-body="media"][data-workspace-mounted="true"]';

async function settings(t, surface) {
	await t.viewport(1920, 1080);
	const f = await t.app.open({ sandbox: surface === 'sandbox' });
	await t.app.resetLayout();
	await f.locator('#tab-settings').click();
	await t.settle();
	return f;
}
async function goMedia(t, f) {
	// a reload can restore the AI chapter with Media & Output already mounted; only click when it is not
	if (!(await f.locator(MEDIA_MOUNTED).count())) {
		await f.locator('#panel-settings .domain-link[data-domain="ai"]').click();
		await f.locator('#panel-settings .page-index-title[data-workspace="media"]').click();
	}
	await f.waitForSelector(MEDIA_MOUNTED, { timeout: 15000 });
	await t.settle();
}
async function pickRoute(t, f) {
	const row = f.locator('[data-continuous-workspace-body="media"] .resource-row[data-id="image-generation"]');
	for (let i = 0; i < 2; i++) {
		await row.scrollIntoViewIfNeeded();
		await row.click();
		const ok = await f.waitForFunction(() => { const x = document.querySelector('[data-continuous-workspace-body="media"] .pm51-detail-title'); return !!x && x.textContent.trim().startsWith('Image Generation'); }, null, { timeout: 3000 }).then(() => true).catch(() => false);
		if (ok) break;
	}
	await t.page.waitForTimeout(400);
}
async function openPicturePanel(t, f) {
	const btn = f.locator('[data-continuous-workspace-body="media"] .pm51-detail-actions button').filter({ hasText: /(Choose|Change) service/ }).first();
	await btn.scrollIntoViewIfNeeded();
	await btn.click();
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
async function chooseAndSave(t, f) {
	await pickOption(t, f, f.locator('.drawer-wrap select.pm51-media-svc'), SVC_LABEL);
	await f.waitForSelector('.drawer-wrap select.pm51-media-model', { state: 'attached', timeout: 8000 });
	await pickOption(t, f, f.locator('.drawer-wrap select.pm51-media-model'), MODEL);
	await f.locator('.drawer-wrap .pm51-panel-foot button.primary', { hasText: 'Use this service' }).first().click();
	await t.settle();
	await t.page.waitForTimeout(500);
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
const USES = () => {
	const d = document.querySelector('[data-continuous-workspace-body="media"] .pm51-detail');
	const r = d && [...d.querySelectorAll('.setting-row')].find((x) => (x.querySelector('.setting-label') || {}).textContent?.trim() === 'Uses');
	return r ? { value: (r.querySelector('.pm51-row-value') || {}).textContent?.trim() || '', help: (r.querySelector('.setting-description') || {}).textContent?.trim() || '' } : null;
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
		await chooseAndSave(t, f);
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

	T('FO-217 the Pictures row Uses the saved service and model', async (t) => {
		const f = await settings(t, surface);
		await goMedia(t, f);
		await pickRoute(t, f);
		await openPicturePanel(t, f);
		await chooseAndSave(t, f);
		const saved = await f.evaluate(STORED);
		await t.check(`"Use this service" stores the choice (model "${saved && saved.model}")`, !!saved && saved.picture === SVC_KEY && saved.model === MODEL, JSON.stringify(saved));
		// the summary refreshes from the route; wait for the row to name the choice
		const want = `${SVC_LABEL} · ${MODEL}`;
		await f.waitForFunction((w) => {
			const d = document.querySelector('[data-continuous-workspace-body="media"] .pm51-detail');
			const r = d && [...d.querySelectorAll('.setting-row')].find((x) => (x.querySelector('.setting-label') || {}).textContent?.trim() === 'Uses');
			return !!r && (r.querySelector('.pm51-row-value') || {}).textContent?.trim() === w;
		}, want, { timeout: 8000 }).catch(() => {});
		const uses = await f.evaluate(USES);
		await t.check(`Uses names the chosen service and model ("${uses && uses.value}")`, !!uses && uses.value === want, JSON.stringify(uses));
		await t.check('Uses never reads "Nothing yet" with "Choose a service to begin."', !!uses && uses.value !== 'Nothing yet' && uses.help !== 'Choose a service to begin.', JSON.stringify(uses));
	});

	T('FO-218 a page reload keeps the picture route', async (t) => {
		if (surface === 'sandbox') {
			await t.check('reload persistence is asserted on the normal surface only: the sandbox\'s opaque origin has no storage', true);
			return;
		}
		const f = await settings(t, surface);
		await goMedia(t, f);
		await pickRoute(t, f);
		await openPicturePanel(t, f);
		await chooseAndSave(t, f);
		const before = await f.evaluate(STORED);
		await t.check(`"Use this service" stores the choice (model "${before && before.model}")`, !!before && before.picture === SVC_KEY && before.model === MODEL, JSON.stringify(before));
		// reload the document, then reach the picture editor again by the same visible clicks
		await f.goto(f.url());
		await f.waitForFunction(() => document.documentElement.getAttribute('data-pmr-ready') === '1' && !!window.PM_THEME, null, { timeout: 60000 });
		await t.settle();
		await f.locator('#tab-settings').click();
		await t.settle();
		await goMedia(t, f);
		await pickRoute(t, f);
		await openPicturePanel(t, f);
		const shown = await f.evaluate(SHOWN);
		const after = await f.evaluate(STORED);
		await t.check(`after reload the editor shows the chosen service ("${shown.svcLabel}")`, shown.svcValue === SVC_KEY && shown.svcLabel === SVC_LABEL, JSON.stringify(shown));
		await t.check(`after reload the editor shows the chosen model ("${shown.modelLabel}")`, shown.modelValue === MODEL, JSON.stringify(shown));
		await t.check(`the stored route is unchanged by the reload (model "${after && after.model}")`, !!after && after.picture === SVC_KEY && after.model === MODEL, JSON.stringify(after));
	});
}
