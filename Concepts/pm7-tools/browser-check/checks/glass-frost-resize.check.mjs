// FO-38 (stream F, 2026-11-04): after the window is resized, Glass's frosted backdrop (the scrim over the app and the core of
// every glass sheet, the onboarding window's included) never points at a frost that has not loaded. Chromium paints a
// background image that has not loaded as no image, so a frost written as soon as it was baked left the app beneath sharp
// through the veil and the window for 17 frames on Nas1 (BD6 glass-dark-stage-860, frames 8695-8711), between the old frost
// stretched to the new size and the new one.
// Glass Light and Dark, the onboarding window on Name, the app beneath drawn (no solid backdrop, as on a computer that
// composites it), the window 860x768, then 1920x900, 1390x900, 860x768, 740x768, 1280x500, then 1920x900, 1390x900 and
// 860x768 again:
//  - every frost the page writes (--lg-frost-heavy and --lg-frost-light) is already loaded when it is written: a fresh
//    image of it is complete at once, from the memory cache (written straight after its bake, it never was);
//  - every size gets its own frost, a size the page has had before as well (back at one, every rim was in the ring cache,
//    no bake ran and the last frost made, another size's, stayed on stretched until something baked again: FO-38 too);
//    this also keeps the check above from passing on no writes;
//  - once it has, the scrim beside the window reads as frost, not as the app: its painted pixels are smooth (mean step
//    between neighbours under 4 levels; the sharp app reads 9-11).
// Both surfaces (a normal page and T3's sandbox) unless --set sandbox picks one. Headless: it resizes the window.
//   browser-check run Concepts/pm7-tools/browser-check/checks/glass-frost-resize.check.mjs --set page=<build>

const SIZES = [[1920, 900], [1390, 900], [860, 768], [740, 768], [1280, 500], [1920, 900], [1390, 900], [860, 768]];
const on = (mode, fn) => (t) => (t.app.surfaces().includes(mode) ? fn(t, mode) : t.check(`not run: --set sandbox picks the other surface than ${mode}`, true));

// mean absolute step between neighbouring pixels (luma), over a decoded PNG
function roughness(img) {
	const { width: w, height: h, data: d } = img, L = (i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
	let s = 0, n = 0;
	for (let y = 0; y < h - 1; y += 1) for (let x = 0; x < w - 1; x += 1) { const i = (y * w + x) * 4; s += Math.abs(L(i) - L(i + 4)) + Math.abs(L(i) - L(i + w * 4)); n += 2; }
	return n ? s / n : 0;
}

async function frost(t, mode) {
	for (const scheme of ['dark', 'light']) {
		await t.viewport(860, 768);
		const f = await t.app.open({ onboarding: true, query: 'o55=screen=name', sandbox: mode === 'sandbox' });
		await f.waitForFunction(() => !!window.O55 && !!document.querySelector('#pm-o55-onboarding .o55-win'), null, { timeout: 60000 });
		await f.evaluate((m) => window.O55.ui.applyLook('glass', m), scheme);
		// the app beneath is drawn, as on a computer that composites it (the solid backdrop would hide what this is about)
		await f.evaluate(() => window.O55.solid.set(false));
		const frostOn = () => { const st = document.getElementById('lg-frost'), r = st && st.sheet && st.sheet.cssRules[0]; return !!(r && r.style.getPropertyValue('--lg-frost-heavy')); };
		await t.until(`glass-${scheme} ${mode}: Glass has its first frost`, frostOn, null, { timeout: 30000, hard: true });
		// every frost write, and whether its image had loaded at that moment
		await f.evaluate(() => {
			window.__fo38 = [];
			const set = CSSStyleDeclaration.prototype.setProperty;
			CSSStyleDeclaration.prototype.setProperty = function (name, value, pri) {
				if (/^--lg-frost-(heavy|light)$/.test(name)) {
					const u = (String(value).match(/url\("?(.*?)"?\)/) || [])[1];
					let loaded = null;
					if (u) { const im = new Image(); im.src = u; loaded = im.complete && im.naturalWidth > 0; }
					window.__fo38.push({ name, vw: innerWidth, vh: innerHeight, loaded });
				}
				return set.call(this, name, value, pri);
			};
		});
		await f.waitForTimeout(1500);
		for (const [w, h] of SIZES) {
			const tag = `glass-${scheme} ${mode} ${w}x${h}`;
			const mark = await f.evaluate(() => window.__fo38.length);
			await t.viewport(w, h);
			await t.until(`${tag}: a frost for this size`, ([n, W, H]) => window.__fo38.slice(n).some((x) => x.vw === W && x.vh === H && x.name === '--lg-frost-heavy'), [mark, w, h], { timeout: 15000 });
			const writes = await f.evaluate((n) => window.__fo38.slice(n), mark);
			const early = writes.filter((x) => x.loaded !== true);
			await t.check(`${tag}: every frost was loaded when it was written`, writes.length > 0 && early.length === 0, `${writes.length} writes, ${early.length} before their image loaded: ${early.map((x) => `${x.name} at ${x.vw}x${x.vh}`).join(', ')}`);
			await f.waitForTimeout(400);
			// the scrim beside the window, where the window leaves room
			const box = await f.evaluate(() => { const r = document.querySelector('#pm-o55-onboarding .o55-win').getBoundingClientRect(); return { left: r.left, top: r.top, bottom: r.bottom }; });
			if (box.left >= 40) {
				const off = mode === 'sandbox' ? await t.page.evaluate(() => { const r = document.querySelector('iframe').getBoundingClientRect(); return { x: r.left, y: r.top }; }) : { x: 0, y: 0 };
				const img = await t.pixels({ x: off.x + 6, y: off.y + Math.max(40, box.top), width: Math.floor(box.left) - 14, height: Math.max(40, Math.floor(box.bottom - Math.max(40, box.top)) - 40) });
				const rough = roughness(img);
				await t.check(`${tag}: the scrim beside the window reads as frost (mean step ${rough.toFixed(2)} < 4)`, rough < 4, `mean step ${rough.toFixed(2)} levels`);
			}
		}
		await f.evaluate(() => { delete window.__fo38; });
	}
}

export const tests = {
	'frost after a resize, normal page': on('normal', frost),
	'frost after a resize, sandbox': on('sandbox', frost)
};
