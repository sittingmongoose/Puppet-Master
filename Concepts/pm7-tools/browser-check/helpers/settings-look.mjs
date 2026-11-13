// A look for a Settings check, set the way a person sets it and checked as painted.
//
// t.app.look (the config helper) paints PM_THEME without saving it (persist:false). Settings writes its state on almost
// every action (saveState -> PM7_SETTINGS_TOME.save -> applyPaint, base/script/pm4-settings-js.js:2245), and applyPaint
// puts the saved look back, so a check that sets a look with t.app.look and then opens, navigates or changes anything in
// Settings measures the saved look (Basic Dark) while its cell names another (sol-recheck-b10, astra-review-l1s).
//
// setLookBySetting picks the family and the light-or-dark mode through Settings' own Theme and "Light or dark" rows, so
// the pair is saved and every later Settings render keeps it (moved here from settings-layout and settings-inspector-fit,
// where it was written twice; same steps).
// guardPaintedLook reads back what is painted right before a measurement: html[data-theme] (NieR: PM_NIER on and the
// mode's slug), and a pixel sample of the Settings page taken from a real screenshot. The sample's light-or-dark must be
// the look's mode, and for any look but Basic Dark it must differ from the Basic Dark sample this page painted when it
// opened (captureBaseline), so a page repainted back to Basic Dark fails even if an attribute were right.
// --set lookBite=1 paints Basic Dark back (persist:false, as the reset did) right before every guard, to show it fails.
import { decodePng } from './activity-cover-pixels.mjs';

const settled = () => !(window.PM_LOOK_COVERED && PM_LOOK_COVERED()) && !(window.PM_THEME_TRANSITION && PM_THEME_TRANSITION.busy && PM_THEME_TRANSITION.busy());
const baselines = new WeakMap();   // test (t) -> the Basic Dark sample of its first page (one colour at every size)

/* the patch sampled: the Settings document's lower right, a stretch of page background beside the rows (a median, so a
   stray glyph or edge in it does not decide). Window coordinates, the frame's own offset added in the sandbox. */
async function patchRect(t, f) {
	const r = await f.evaluate(() => {
		const sc = document.querySelector('#settings-document') || document.querySelector('#panel-settings');
		if (!sc) return null;
		const b = sc.getBoundingClientRect();
		return { x: Math.round(b.right - 76), y: Math.round(b.bottom - 52), width: 48, height: 32 };
	});
	if (!r) return null;
	let ox = 0, oy = 0;
	if (f !== t.page.mainFrame()) {
		const el = await f.frameElement().catch(() => null);
		const fb = el && (await el.boundingBox());
		if (fb) { ox = fb.x; oy = fb.y; }
	}
	return { x: r.x + ox, y: r.y + oy, width: r.width, height: r.height };
}
async function sample(t, f) {
	const clip = await patchRect(t, f);
	if (!clip) return null;
	const png = decodePng(await t.page.screenshot({ clip }));
	const px = [];
	for (let i = 0; i < png.width * png.height; i++) px.push([png.data[i * 4], png.data[i * 4 + 1], png.data[i * 4 + 2]]);
	const med = (k) => px.map((p) => p[k]).sort((x, y) => x - y)[Math.floor(px.length / 2)];
	const c = [med(0), med(1), med(2)];
	return { rgb: c, lum: (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255 };
}
const painted = (f) => f.evaluate(() => {
	const theme = document.documentElement.getAttribute('data-theme') || '';
	return { theme, nier: !!(window.PM_NIER && PM_NIER.on()) || theme.startsWith('nier') || document.documentElement.getAttribute('data-o55-nier') === 'on' };
});
export function lookHeld(look, got) {
	const [family, mode] = String(look || '').split('-');
	return family === 'nier' ? !!(got.nier && String(got.theme).endsWith('-' + mode)) : !got.nier && got.theme === look;
}

/* the page's own Basic Dark sample, taken once while Basic Dark is what is painted (a fresh page in this kit) */
export async function captureBaseline(t, f) {
	if (baselines.has(t)) return baselines.get(t);
	await f.waitForFunction(settled, null, { timeout: 15000 }).catch(() => {});
	const got = await painted(f);
	if (!lookHeld('basic-dark', got)) return null;
	const s = await sample(t, f);
	if (s) baselines.set(t, s);
	return s;
}

/* toGeneral: open General first (the Theme rows live there); a caller already on General passes false */
export async function setLookBySetting(t, f, look, { toGeneral = true } = {}) {
	await captureBaseline(t, f);
	const [family, mode] = look.split('-');
	if (toGeneral) {
		const general = f.locator('#pm-settings-root [data-action="navigate-domain"][data-domain="general"]').first();
		if (await general.count()) { await general.click(); await f.waitForTimeout(700); }
	}
	for (const [setting, value] of [
		['general.visual.theme', family === 'nier' ? 'NieR' : family[0].toUpperCase() + family.slice(1)],
		['general.visual.theme-mode', mode === 'light' ? 'Light' : 'Dark'],
	]) {
		const trigger = f.locator(`select[data-setting="${setting}"]`).locator('..').locator('.pm51-dd-trigger');
		const labels = await f.locator(`select[data-setting="${setting}"] option`).allTextContents();
		const name = labels.includes(value) ? value : `${value} ${mode === 'light' ? 'Light' : 'Dark'}`;
		await trigger.first().scrollIntoViewIfNeeded();
		await trigger.first().click();
		await f.getByRole('option', { name, exact: true }).click({ timeout: 8000 });
		await f.locator('.pm51-dd-list').waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
		/* a family pick can start a look transition (NieR's wipe): it holds every press until it lifts */
		await f.waitForFunction(settled, null, { timeout: 15000 }).catch(() => {});
		await t.page.waitForTimeout(400);
	}
	await f.waitForFunction(([fam, m]) => {
		const theme = document.documentElement.getAttribute('data-theme') || '';
		const nier = !!(window.PM_NIER && PM_NIER.on()) || theme.startsWith('nier');
		return fam === 'nier' ? nier && theme.endsWith('-' + m) : !nier && theme === fam + '-' + m;
	}, [family, mode], { timeout: 20000 }).catch(() => { /* the guard fails the cell with what is painted */ });
	await f.waitForFunction(settled, null, { timeout: 20000 }).catch(() => {});
	await t.page.waitForTimeout(500);
}

/* right before a measurement: is the look the cell names what is painted? */
export async function guardPaintedLook(t, f, look, where) {
	if (t.args.lookBite) {   // the bite: the page painted back to Basic Dark at the moment of measuring, as the reset did
		await f.evaluate(async () => { if (window.PM_NIER && PM_NIER.on()) await PM_NIER.set(false, { persist: false }); PM_THEME.setFamily('basic', { persist: false }); PM_THEME.setMode('dark', { persist: false }); });
		await f.waitForFunction(settled, null, { timeout: 20000 }).catch(() => {});
		await t.page.waitForTimeout(600);
	}
	const got = await painted(f);
	const attr = lookHeld(look, got);
	const s = await sample(t, f).catch(() => null);
	const base = baselines.get(t);
	const mode = look.split('-')[1];
	const modeOk = !!s && (mode === 'light' ? s.lum > 0.5 : s.lum < 0.5);
	const dist = s && base ? Math.max(...s.rgb.map((v, i) => Math.abs(v - base.rgb[i]))) : null;
	const notBasic = look === 'basic-dark' ? true : dist !== null && dist > 3;   // Friendly Dark samples 6 levels from Basic Dark
	const ok = attr && modeOk && notBasic;
	await t.check(`${where}: measured under ${look} (painted ${got.theme}${got.nier ? ', NieR on' : ''}; sample rgb(${s ? s.rgb.join(',') : '?'}), ${s ? (s.lum > 0.5 ? 'light' : 'dark') : '?'}${look === 'basic-dark' ? '' : `, ${dist === null ? 'no Basic Dark sample' : dist + ' from Basic Dark'}`})`, ok,
		!attr ? 'the page shows another look than the cell names' : !modeOk ? 'the painted page is not the look\'s light or dark' : 'the painted page is still Basic Dark');
	return ok;
}

/* motion for a Settings check: 'no-preference', 'reduce' (the browser's Reduced Motion media query) or 'app' (the app's
   own Reduce animations setting, general.visual.reduce-animations, which sets html[data-motion="reduced"]; set through
   the settings host as the Settings row does, after the page is open). Call setMotionMedia before t.app.open and
   setMotionApp after it. */
export async function setMotionMedia(t, motion) { await t.emulate({ reducedMotion: motion === 'reduce' ? 'reduce' : 'no-preference' }); }
export async function setMotionApp(t, f, motion) {
	if (motion !== 'app') return true;
	await f.evaluate(() => window.PM12_KIMI.setSettingFromHost('general.visual.reduce-animations', true, true, true));
	const ok = await f.waitForFunction(() => document.documentElement.getAttribute('data-motion') === 'reduced', null, { timeout: 8000 }).then(() => true).catch(() => false);
	return t.check('the app\'s own Reduce animations is on (html[data-motion="reduced"])', ok);
}
